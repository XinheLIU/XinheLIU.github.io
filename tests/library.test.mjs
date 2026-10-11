import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import test from 'node:test'

const require = createRequire(import.meta.url)
const ejs = require('ejs')
const theme = new URL('../themes/xinhe-site/', import.meta.url)

function libraryWorks(locale) {
  const helpers = {}
  const posts = [
    { title: 'First image', path: 'first/', site_locale: 'en', content: '<img src="/first/diagram.png"><img src="/second.png">' },
    { title: '中文', path: 'first-zh/', site_locale: 'zh-CN', content: '<img src="/first-zh/diagram.png">' },
    { title: 'Remote', path: 'remote/', site_locale: 'en', content: '<img src="https://example.com/figure.png">' },
    { title: 'No image', path: 'empty/', site_locale: 'en', content: '<p>Text only</p>' },
    { title: 'Manual', path: 'manual/', site_locale: 'en', content: '<img src="/manual/diagram.png">' },
    { title: 'Override', path: 'override/', site_locale: 'en', featured_asset: '/chosen.png', content: '<img src="/other.png">' },
  ]
  const works = [{ key: 'manual', type: 'article', url_en: '/manual/', title_en: 'Manual' }]
  const catalog = [{ id: 'projected', locale: 'en', content_type: 'article', title: 'Projected', site_url: '/projected/' }]
  const hexo = {
    base_dir: '/fixture',
    locals: { get: name => name === 'data' ? { works } : { toArray: () => posts } },
    extend: { helper: { register: (name, helper) => { helpers[name] = helper } } },
  }
  for (const name of ['post-preview.js', 'work-manifest.js']) {
    vm.runInNewContext(fs.readFileSync(new URL(`scripts/${name}`, theme), 'utf8'), {
      hexo,
      require: name => name === 'fs' ? {
        existsSync: () => true, readFileSync: () => JSON.stringify(catalog),
      } : require(name),
    })
  }
  helpers.series_entries = () => [{ path: 'projected/index.html', content: '<img src="/images/projected/figure.png">' }]
  return helpers.getAllWorks(locale)
}

test('library selects article images for native, manual, and projected entries', () => {
  const works = libraryWorks('en')
  const preview = url => works.find(work => work.url === url)?.featured_asset
  assert.equal(preview('/first/'), '/first/diagram.png')
  assert.equal(preview('/remote/'), 'https://example.com/figure.png')
  assert.equal(preview('/manual/'), '/manual/diagram.png')
  assert.equal(preview('/projected/'), '/images/projected/figure.png')
  assert.equal(preview('/override/'), '/chosen.png')
  assert.ok(!preview('/empty/'))
  assert.equal(works.filter(work => work.url === '/manual/').length, 1)
  assert.equal(libraryWorks('zh-CN')[0].featured_asset, '/first-zh/diagram.png')
})

test('library renders external icons and link attributes as markup while escaping titles', () => {
  const html = ejs.render(fs.readFileSync(new URL('layout/library.ejs', theme), 'utf8'), {
    page: { site_locale: 'zh-CN' },
    getAllWorks: () => [{ title: '<script>example</script>', summary: 'Book', type: 'book', url: '/book/', external: true }],
    url_for: url => url,
  })
  assert.match(html, /<svg width="16"/)
  assert.doesNotMatch(html, /&lt;svg/)
  assert.match(html, /target="_blank" rel="noopener"/)
  assert.match(html, /&lt;script&gt;example&lt;\/script&gt;/)
})
