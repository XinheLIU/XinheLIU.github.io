#!/usr/bin/env node
// Personal-site content aggregator: reads pinned book sources (submodules) and
// projects selected series content into .generated/series/ as disposable Hexo
// posts. Canonical Markdown is never edited.
//
// Usage: node scripts/aggregate-series.mjs
// Inputs : sources/<repo>/collections/series.yml (plus declared source files)
// Outputs: .generated/series/<series-id>/<item-id>.en.md | .zh-CN.md
//          .generated/series/images.json  (asset copies for the Hexo generator)
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const jsYaml = require('js-yaml')

const ROOT = process.cwd()
const SOURCES = path.join(ROOT, 'sources')
const OUT = path.join(ROOT, '.generated', 'series')
const SERIES_SLUG = 'agentic-engineering' // matches the series id of the pilot manifest

function readFrontmatter(text) {
  const m = text.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/)
  if (!m) return { data: {}, body: text }
  try {
    return { data: jsYaml.load(m[1]) || {}, body: text.slice(m[0].length) }
  } catch {
    return { data: {}, body: text }
  }
}

function firstExcerpt(body) {
  const lines = body.split(/\r?\n/)
  const parts = []
  let inQuote = false
  let quoteSeen = false
  const skippable = (t) => !t || t.startsWith('#') || /^Last updated:?\s*/i.test(t) || /^---/.test(t)
  for (const line of lines) {
    const isQuote = /^>\s?/.test(line)
    const trimmed = line.trim()
    if (isQuote) {
      parts.push(line.replace(/^>\s?/, ''))
      inQuote = true
      quoteSeen = true
      continue
    }
    if (inQuote) {
      if (skippable(trimmed)) continue // blank or metadata between quote and paragraph
      parts.push('')
      parts.push(trimmed)
      break
    }
    if (!quoteSeen) {
      if (skippable(trimmed)) continue
      parts.push(trimmed)
      break
    }
    break
  }
  return parts.join('\n').trim()
}

function summarize(text, max = 300) {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > max ? flat.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : flat
}

function rewriteBody(body, { images, imageBase, links, locale }) {
  let out = body
  // Image refs: relative paths beside the chapter file -> site asset paths.
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (full, alt, target) => {
    const t = target.trim()
    if (/^(https?:|data:|\/)/.test(t)) return full // remote or site-absolute: untouched
    const name = path.posix.basename(t.split('#')[0])
    images.push(name)
    return `![${alt}](${imageBase}${name})`
  })
  // content: links -> local site pages (locale-aware).
  out = out.replace(/\]\(\s*content:([a-z0-9-]+(?:-[a-z0-9]+)*)(?:\s+"[^"]*")?\s*\)/g, (full, id) => {
    const entry = links[id]
    const target = entry ? entry[locale] : null
    if (!target) return full // unresolved targets are reported by the content audit
    return `](${target})`
  })
  return out
}

function readBookUrl(item, locale) {
  if (item.book_url && typeof item.book_url === 'object') return item.book_url[locale] || item.book_url.en || null
  return typeof item.book_url === 'string' ? item.book_url : null
}

function main() {
  if (!fs.existsSync(SOURCES)) {
    console.log('aggregate-series: no sources/ directory; nothing to aggregate.')
    return
  }
  const repos = fs.readdirSync(SOURCES).sort()
  const series = [] // { repo, manifest, items }
  for (const repo of repos) {
    const manifestPath = path.join(SOURCES, repo, 'collections', 'series.yml')
    if (!fs.existsSync(manifestPath)) continue
    const manifest = jsYaml.load(fs.readFileSync(manifestPath, 'utf8'))
    if (manifest && manifest.id === SERIES_SLUG && Array.isArray(manifest.items)) {
      series.push({ repo, manifest })
    }
  }
  if (series.length === 0) {
    console.log('aggregate-series: no matching series manifests; nothing to aggregate.')
    fs.rmSync(OUT, { recursive: true, force: true })
    return
  }

  const ids = []
  const links = {} // id -> { en, zh } local site URLs
  for (const { manifest } of series) {
    for (const item of manifest.items) {
      ids.push(item.id)
      links[item.id] = {
        en: `/en/${SERIES_SLUG}/${item.id}/`,
        'zh-CN': `/${SERIES_SLUG}/${item.id}/`,
      }
    }
  }

  fs.rmSync(OUT, { recursive: true, force: true })
  const imageCopies = [] // { from, to }

  for (const { repo, manifest } of series) {
    for (const item of manifest.items) {
      for (const locale of ['en', 'zh-CN']) {
        const rel = item.source?.[locale]
        if (!rel) continue
        const srcFile = path.join(SOURCES, repo, rel)
        if (!fs.existsSync(srcFile)) {
          console.error(`aggregate-series: missing source ${repo}/${rel} (skipped)`)
          continue
        }
        const { data, body } = readFrontmatter(fs.readFileSync(srcFile, 'utf8'))
        const isZh = locale === 'zh-CN'
        const excerpt = firstExcerpt(body)
        const summary = summarize(excerpt)
        const images = []
        const mode = item.mode ?? 'excerpt'
        const bookUrl = readBookUrl(item, locale)
        const pubDate = item.published_at instanceof Date
          ? item.published_at.toISOString().slice(0, 10)
          : String(item.published_at || '2026-08-24')

        let content = ''
        if (mode === 'link') {
          content = isZh
            ? `> ${summary}\n\n[在书中阅读全文 →](${bookUrl})`
            : `> ${summary}\n\n[Read the full chapter in the book →](${bookUrl})`
        } else if (mode === 'full') {
          content = rewriteBody(body, { images, imageBase: `/images/${SERIES_SLUG}/${item.id}/`, links, locale })
        } else {
          // excerpt: lead-in plus link to the book
          const lead = rewriteBody(excerpt, { images, imageBase: `/images/${SERIES_SLUG}/${item.id}/`, links, locale })
          const more = isZh
            ? `\n\n> 本文是书籍《Coding with Agents》章节的节选。[在书中继续阅读全文 →](${bookUrl})`
            : `\n\n> This is an excerpt from the book *Coding with Agents*. [Continue reading the full chapter in the book →](${bookUrl})`
          content = lead + more
        }

        const projected = {
          layout: 'post',
          title: data.title || item.id,
          date: `${pubDate} 12:00:00`,
          permalink: isZh ? `/${SERIES_SLUG}/${item.id}/` : `/en/${SERIES_SLUG}/${item.id}/`,
          categories: [isZh ? '智能体工程' : 'Agentic Engineering'],
          tags: Array.isArray(data.tags) ? data.tags : [],
          site_locale: locale,
          lang_switch: isZh ? `/en/${SERIES_SLUG}/${item.id}/` : `/${SERIES_SLUG}/${item.id}/`,
          summary_en: data.title ? summary : '',
          summary_zh: data.title ? summary : '',
          topic_cluster: SERIES_SLUG,
          confidentiality_safe: true,
          series_id: manifest.id,
          content_id: item.id,
          series_mode: mode,
          book_url: bookUrl || '',
          canonical_url: mode === 'full' && bookUrl ? bookUrl : '',
        }

        const dir = path.join(OUT, manifest.id, item.id)
        fs.mkdirSync(dir, { recursive: true })
        const projectedPath = path.join(dir, `${locale}.md`)
        const yaml = jsYaml.dump(projected, { lineWidth: 120 })
        fs.writeFileSync(projectedPath, `---\n${yaml}---\n\n${content}\n`)

        for (const name of images) {
          const from = path.join(path.dirname(srcFile), '..', 'assets', name)
          const altFrom = path.join(path.dirname(srcFile), 'assets', name)
          const resolved = fs.existsSync(from) ? from : altFrom
          if (fs.existsSync(resolved)) {
            imageCopies.push({ from: resolved, to: `images/${SERIES_SLUG}/${item.id}/${name}` })
          } else {
            console.error(`aggregate-series: image not found near ${repo}/${rel}: ${name}`)
          }
        }
      }
    }
  }

  fs.writeFileSync(path.join(OUT, 'images.json'), JSON.stringify({ series: SERIES_SLUG, copies: imageCopies }, null, 2))
  console.log(`aggregate-series: projected ${ids.length} item(s) into .generated/series/ (${imageCopies.length} image copy/copies)`)
}

main()
