#!/usr/bin/env node
// Builds disposable Hexo projections and a normalized public catalog.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  absoluteUrl,
  bodyImageTargets,
  dateString,
  firstExcerpt,
  firstHeading,
  loadSourceRegistry,
  localeValue,
  normalizeRoute,
  normalizeLocale,
  readYaml,
  renderMarkdown,
  replaceContentLinks,
  resolveInside,
  resolveSourceRoot,
  splitFrontmatter,
} from './lib/content-system.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, '.generated', 'series')
const CATALOG_FILE = path.join(ROOT, '.generated', 'catalog.json')
const SITE_URL = 'https://xinheliu.github.io'
const LOCAL_SOURCES = process.argv.includes('--local-sources') || process.env.WRITING_LOCAL_SOURCES === '1'
const LOCALES = ['en', 'zh-CN']

function humanize(value) {
  return String(value).split('-').map((part) => part ? part[0].toUpperCase() + part.slice(1) : part).join(' ')
}

function seriesRoute(manifest, item, locale) {
  const fallback = locale === 'zh-CN' ? `/${manifest.id}/${item.id}/` : `/en/${manifest.id}/${item.id}/`
  return normalizeRoute(localeValue(item.site_route, locale) || fallback)
}

function seriesMetadata(manifest) {
  return {
    id: manifest.id,
    index: manifest.index !== false,
    title_en: manifest.title_en || humanize(manifest.id),
    title_zh: manifest.title_zh || manifest.title_en || humanize(manifest.id),
    subtitle_en: manifest.subtitle_en || '',
    subtitle_zh: manifest.subtitle_zh || manifest.subtitle_en || '',
  }
}

function publicStatus(data) {
  return !data.status || data.status === 'published'
}

function collectInputs() {
  const sitePosts = readYaml(path.join(ROOT, 'collections', 'posts.yml'), { id: 'site-posts', items: [] })
  const repositories = [{
    owner: 'site-source', name: 'Personal site', root: ROOT,
    publicUrl: SITE_URL, contentType: 'article',
    book: sitePosts, series: { ...sitePosts, index: false }, siteOwned: true,
  }]
  for (const source of loadSourceRegistry(ROOT)) {
    const sourceRoot = resolveSourceRoot(ROOT, source, LOCAL_SOURCES)
    if (!sourceRoot || !fs.existsSync(sourceRoot)) {
      console.warn(`aggregate-content: ${LOCAL_SOURCES ? 'local' : 'pinned'} source missing for ${source.id}: ${sourceRoot}`)
      continue
    }
    repositories.push({
      owner: source.id, name: source.name || source.id, root: sourceRoot,
      publicUrl: source.public_url, contentType: source.content_type || 'note',
      book: readYaml(path.join(sourceRoot, 'collections', 'book.yml'), { id: source.id, items: [] }),
      series: readYaml(path.join(sourceRoot, 'collections', 'series.yml'), null),
      siteOwned: false,
    })
  }
  return repositories
}

function addCatalog(catalog, seen, record) {
  const key = `${record.id}\u0000${record.locale}`
  const previous = seen.get(key)
  if (previous && previous.owner !== record.owner) {
    // A site-first article may still exist in site-source while its prepared
    // destination copy is being reviewed. The stable site route identifies
    // that intentional hand-off; unrelated duplicate IDs remain errors.
    if (!previous.site_url || !record.site_url || previous.site_url !== record.site_url) {
      throw new Error(`Duplicate canonical owner for ${record.id} (${record.locale}): ${previous.owner} and ${record.owner}`)
    }
    previous.source_url = previous.source_url || record.source_url
    return
  }
  if (previous) return
  seen.set(key, record)
  catalog.push(record)
}

function projectBody(body, sourceFile, imageBase, imageCopies, links, locale, repositoryRoot) {
  let content = replaceContentLinks(body, links, locale)
  for (const target of bodyImageTargets(content)) {
    const sourceAsset = path.resolve(path.dirname(sourceFile), target.split(/[?#]/)[0])
    if ((sourceAsset !== repositoryRoot && !sourceAsset.startsWith(`${repositoryRoot}${path.sep}`)) || !fs.existsSync(sourceAsset)) {
      throw new Error(`Missing or invalid image near ${sourceFile}: ${target}`)
    }
    const name = path.basename(sourceAsset)
    content = content.split(target).join(`${imageBase}${name}`)
    imageCopies.push({ from: sourceAsset, to: `${imageBase.slice(1)}${name}` })
  }
  return content
}

function main() {
  const repositories = collectInputs()
  const projections = []
  const routeOwners = new Map()
  const links = {}
  const meta = {}

  for (const repository of repositories) {
    const manifest = repository.series
    if (!manifest || !Array.isArray(manifest.items)) continue
    meta[manifest.id] = seriesMetadata(manifest)
    for (const item of manifest.items) {
      for (const [sourceLocale, relative] of Object.entries(item.source || {})) {
        const locale = normalizeLocale(sourceLocale)
        if (!LOCALES.includes(locale)) continue
        const route = seriesRoute(manifest, item, locale)
        const owner = routeOwners.get(route)
        if (owner) throw new Error(`Duplicate site route ${route}: ${owner} and ${repository.owner}/${item.id}:${locale}`)
        routeOwners.set(route, `${repository.owner}/${item.id}:${locale}`)
        links[item.id] = links[item.id] || {}
        links[item.id][locale] = route
        projections.push({ repository, manifest, item: { ...item, source: { ...item.source, [locale]: relative } }, locale, route })
      }
    }
  }

  fs.rmSync(OUT, { recursive: true, force: true })
  fs.mkdirSync(OUT, { recursive: true })
  const imageCopies = []
  const catalog = []
  const seen = new Map()

  for (const { repository, manifest, item, locale, route } of projections) {
    const sourceFile = resolveInside(repository.root, item.source[locale])
    if (!fs.existsSync(sourceFile)) throw new Error(`Missing source ${repository.owner}/${item.source[locale]}`)
    const { data, body } = splitFrontmatter(fs.readFileSync(sourceFile, 'utf8'))
    if (!publicStatus(data)) continue
    const title = data.title || firstHeading(body, humanize(item.id))
    const summary = localeValue(item.summary, locale) || data[`summary_${locale === 'zh-CN' ? 'zh' : 'en'}`] || firstExcerpt(body)
    const mode = item.mode || 'full'
    const bookUrl = localeValue(item.book_url, locale)
    if (mode !== 'full' && !bookUrl) throw new Error(`${manifest.id}/${item.id} needs book_url for ${mode} mode`)
    const publishedAt = dateString(item.published_at, dateString(data.created))
    const imageBase = `/images/${manifest.id}/${item.id}/`
    const rewrittenBody = projectBody(body, sourceFile, imageBase, imageCopies, links, locale, repository.root)
    let content = rewrittenBody
    if (mode === 'link') {
      content = locale === 'zh-CN'
        ? `> ${summary}\n\n[在原站阅读全文 →](${bookUrl})`
        : `> ${summary}\n\n[Read the full article at its source →](${bookUrl})`
    } else if (mode === 'excerpt') {
      const label = locale === 'zh-CN' ? '在原站继续阅读 →' : 'Continue reading at the source →'
      content = `${firstExcerpt(rewrittenBody)}\n\n> [${label}](${bookUrl})`
    }
    const categories = localeValue(item.category ?? manifest.category, locale)
    const canonicalChoice = item.canonical || (repository.siteOwned ? 'site' : 'book')
    const projected = {
      layout: 'post', title, date: `${publishedAt} 12:00:00`, permalink: route,
      categories: Array.isArray(categories) ? categories : [categories || manifest.id],
      tags: Array.isArray(data.tags) ? data.tags : [],
      site_locale: locale,
      lang_switch: links[item.id][locale === 'en' ? 'zh-CN' : 'en'] || '',
      summary_en: locale === 'en' ? summary : (data.summary_en || ''),
      summary_zh: locale === 'zh-CN' ? summary : (data.summary_zh || ''),
      topic_cluster: item.topic_cluster || manifest.topic_cluster || manifest.id,
      confidentiality_safe: true, series_id: manifest.id, content_id: item.id,
      series_mode: mode, book_url: bookUrl || '',
      canonical_url: canonicalChoice === 'site' ? absoluteUrl(SITE_URL, route) : (bookUrl || ''),
      owner: repository.owner,
    }
    const directory = path.join(OUT, manifest.id, item.id)
    fs.mkdirSync(directory, { recursive: true })
    fs.writeFileSync(path.join(directory, `${locale}.md`), renderMarkdown(projected, content))

    addCatalog(catalog, seen, {
      id: item.id, locale, title, summary,
      owner: repository.owner, owner_name: repository.name,
      content_type: repository.contentType, tags: projected.tags,
      topic_cluster: projected.topic_cluster, published_at: publishedAt,
      site_url: route, source_url: bookUrl || route, featured: item.featured === true,
    })
  }

  for (const repository of repositories) {
    const manifest = repository.book
    if (!manifest || !Array.isArray(manifest.items)) continue
    for (const item of manifest.items) {
      for (const [sourceLocale, relative] of Object.entries(item.source || {})) {
        const locale = normalizeLocale(sourceLocale)
        if (!LOCALES.includes(locale)) continue
        const sourceFile = resolveInside(repository.root, relative)
        const route = normalizeRoute(localeValue(item.route, locale))
        const sourceUrl = absoluteUrl(repository.publicUrl, route)
        if (!fs.existsSync(sourceFile)) {
          console.warn(`aggregate-content: metadata-only catalog entry; source missing ${repository.owner}/${relative}`)
          addCatalog(catalog, seen, {
          id: item.id, locale, title: humanize(item.id), summary: '',
            owner: repository.owner, owner_name: repository.name,
            content_type: repository.contentType, tags: [],
            topic_cluster: item.topic_cluster || item.part || manifest.id,
            published_at: dateString(item.published_at, ''),
            site_url: links[item.id]?.[locale] || null, source_url: sourceUrl,
            featured: item.featured === true,
          })
          continue
        }
        const { data, body } = splitFrontmatter(fs.readFileSync(sourceFile, 'utf8'))
        if (!publicStatus(data)) continue
        const existing = seen.get(`${item.id}\u0000${locale}`)
        if (existing?.owner === repository.owner) continue
        addCatalog(catalog, seen, {
          id: item.id, locale,
          title: data.title || firstHeading(body, humanize(item.id)),
          summary: localeValue(item.summary, locale) || firstExcerpt(body),
          owner: repository.owner, owner_name: repository.name,
          content_type: repository.contentType,
          tags: Array.isArray(data.tags) ? data.tags : [],
          topic_cluster: item.topic_cluster || item.part || manifest.id,
          published_at: dateString(item.published_at, dateString(data.created, '')),
          site_url: links[item.id]?.[locale] || null, source_url: sourceUrl,
          featured: item.featured === true,
        })
      }
    }
  }

  catalog.sort((a, b) => String(b.published_at).localeCompare(String(a.published_at)) || a.id.localeCompare(b.id))
  fs.writeFileSync(path.join(OUT, 'images.json'), `${JSON.stringify({ copies: imageCopies }, null, 2)}\n`)
  fs.writeFileSync(path.join(OUT, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`)
  fs.writeFileSync(CATALOG_FILE, `${JSON.stringify(catalog, null, 2)}\n`)
  console.log(`aggregate-content: ${projections.length} projection(s), ${catalog.length} catalog record(s), ${imageCopies.length} asset copy/copies`)
}

main()
