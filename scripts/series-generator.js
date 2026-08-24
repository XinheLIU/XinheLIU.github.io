'use strict'
// Personal-site series generator (Hexo).
// Reads the disposable projection written by tools/aggregate-series.mjs and
// registers post pages, series index pages, tag/category pages, and asset
// copies. Canonical book Markdown is never touched: the projection lives in
// .generated/ (gitignored).
//
// A `series_entries()` helper exposes the flattened entry list so the archive,
// tag, and category templates can show book-owned entries beside site-owned
// posts (one archive).
const fs = require('fs')
const path = require('path')
const jsYaml = require('js-yaml')

const SERIES_SLUG = 'agentic-engineering'
const GEN = path.join(hexo.base_dir, '.generated', 'series')

const INDEX_META = {
  en: {
    title: 'Agentic Engineering',
    subtitle: 'A series on working effectively with coding agents, drawn from the book Coding with Agents.',
    eyebrow: 'Series',
    lang_switch: `/${SERIES_SLUG}/`,
    readLabel: 'Read on the site',
    bookLabel: 'Read in the book',
  },
  'zh-CN': {
    title: '智能体工程',
    subtitle: '与编程智能体高效协作的系列文章，选自《Coding with Agents》一书。',
    eyebrow: '系列',
    lang_switch: `/en/${SERIES_SLUG}/`,
    readLabel: '在站内阅读',
    bookLabel: '在书中阅读',
  },
}

let SERIES_ENTRIES = []

hexo.extend.helper.register('series_entries', function () {
  return SERIES_ENTRIES
})

hexo.extend.generator.register('series', async function () {
  const routes = []
  SERIES_ENTRIES = []
  if (!fs.existsSync(GEN)) return routes

  // 1. Asset copies declared by the aggregator.
  const imagesJson = path.join(GEN, 'images.json')
  if (fs.existsSync(imagesJson)) {
    const { copies } = JSON.parse(fs.readFileSync(imagesJson, 'utf8'))
    for (const c of copies) {
      routes.push({ path: c.to, data: () => fs.createReadStream(c.from) })
    }
  }

  // 2. Projected post pages.
  const itemIndex = {} // seriesId -> { itemId: { en: {...}, 'zh-CN': {...} } }
  const tagLocales = new Map() // tag -> Set(locale)
  const catLocales = new Map()
  const seriesDirs = fs.readdirSync(GEN).filter((d) => {
    const p = path.join(GEN, d)
    return fs.statSync(p).isDirectory()
  })
  for (const seriesId of seriesDirs) {
    const itemDirs = fs.readdirSync(path.join(GEN, seriesId)).filter((d) => {
      const p = path.join(GEN, seriesId, d)
      return fs.statSync(p).isDirectory()
    })
    for (const itemId of itemDirs) {
      const dir = path.join(GEN, seriesId, itemId)
      for (const file of fs.readdirSync(dir).sort()) {
        if (!/\.md$/.test(file)) continue
        const filePath = path.join(dir, file)
        const raw = fs.readFileSync(filePath, 'utf8')
        const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
        if (!m) continue
        const data = jsYaml.load(m[1])
        const tagsRaw = Array.isArray(data.tags) ? data.tags.slice() : []
        const catsRaw = Array.isArray(data.categories) ? data.categories.slice() : []
        const post = await hexo.post.render(filePath, data)
        post.layout = 'post'
        post.path = String(data.permalink || '').replace(/^\//, '') + 'index.html'
        post.canonical_url = data.canonical_url || ''
        post.tags = (data.tags || []).map((t) => ({ name: t, path: `tags/${t}/` }))
        post.categories = (data.categories || []).map((c) => ({ name: c, path: `categories/${c}/` }))
        routes.push({ path: post.path, layout: 'post', data: post })

        const locale = file === 'zh-CN.md' ? 'zh-CN' : 'en'
        itemIndex[seriesId] = itemIndex[seriesId] || {}
        itemIndex[seriesId][itemId] = itemIndex[seriesId][itemId] || {}
        itemIndex[seriesId][itemId][locale] = {
          id: itemId,
          title: data.title,
          summary: locale === 'zh-CN' ? data.summary_zh : data.summary_en,
          mode: data.series_mode,
          url: String(data.permalink || '').replace(/^\//, ''),
          book_url: data.book_url || '',
        }
        SERIES_ENTRIES.push({
          id: itemId,
          series: seriesId,
          title: data.title,
          date: post.date,
          path: post.path,
          permalink: data.permalink,
          tags: tagsRaw,
          categories: catsRaw,
          summary: locale === 'zh-CN' ? data.summary_zh : data.summary_en,
          site_locale: locale,
          mode: data.series_mode,
          book_url: data.book_url || '',
          topic_cluster: SERIES_SLUG,
        })
        for (const tag of SERIES_ENTRIES[SERIES_ENTRIES.length - 1].tags) {
          if (!tagLocales.has(tag)) tagLocales.set(tag, new Set())
          tagLocales.get(tag).add(locale)
        }
        for (const cat of SERIES_ENTRIES[SERIES_ENTRIES.length - 1].categories) {
          if (!catLocales.has(cat)) catLocales.set(cat, new Set())
          catLocales.get(cat).add(locale)
        }
      }
    }
  }
  SERIES_ENTRIES.sort((a, b) => String(a.id).localeCompare(String(b.id)) || String(a.site_locale).localeCompare(String(b.site_locale)))

  // 3. Series index pages (one per locale).
  for (const seriesId of Object.keys(itemIndex).sort()) {
    for (const locale of ['en', 'zh-CN']) {
      const meta = INDEX_META[locale]
      const items = []
      for (const itemId of Object.keys(itemIndex[seriesId]).sort()) {
        const entry = itemIndex[seriesId][itemId][locale] || itemIndex[seriesId][itemId].en
        if (entry) items.push(entry)
      }
      const data = {
        title: meta.title,
        subtitle: meta.subtitle,
        eyebrow: meta.eyebrow,
        site_locale: locale,
        lang_switch: meta.lang_switch,
        read_label: meta.readLabel,
        book_label: meta.bookLabel,
        layout: 'series',
        items,
      }
      const pathPrefix = locale === 'zh-CN' ? `/${SERIES_SLUG}/` : `/en/${SERIES_SLUG}/`
      routes.push({ path: pathPrefix.replace(/^\//, '') + 'index.html', layout: 'series', data })
    }
  }

  // 4. Series entries join EXISTING tag/category pages via case-insensitive
  //    name matching in the templates (no new pages, no path collisions).

  return routes
})
