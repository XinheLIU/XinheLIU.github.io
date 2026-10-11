import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import test from 'node:test'

const require = createRequire(import.meta.url)
const script = fs.readFileSync(new URL('../themes/xinhe-site/scripts/post-image-links.js', import.meta.url), 'utf8')

function renderPostImages(data, root = '/') {
  let filter
  const base = path.resolve('/tmp/post-image-links')
  const hexo = {
    base_dir: base,
    source_dir: path.join(base, 'source'),
    config: { root },
    model: () => ({ findById: id => id === 'source/_posts/example/zh-CN/cover.png'
      ? { path: '/writing/example-zh/cover.png' } : null }),
    extend: { filter: { register: (event, callback) => { filter = callback } } },
  }
  vm.runInNewContext(script, { require, hexo })
  filter(data)
  return data.content
}

test('source-relative Markdown images use the native post asset route', () => {
  assert.equal(renderPostImages({ source: '_posts/example/zh-CN.md',
    content: '<p><img src="./zh-CN/cover.png" alt="Cover"></p>' }),
  '<p><img src="/writing/example-zh/cover.png" alt="Cover"></p>')
  assert.equal(renderPostImages({ source: '_posts/example/zh-CN.md',
    content: "<img src='./zh-CN/cover.png'>" }, '/blog/'),
  "<img src='/blog/writing/example-zh/cover.png'>")
})

test('remote, absolute, missing, and non-post images keep their original URLs', () => {
  const content = '<img src="https://example.com/a.png"><img src="/images/a.png"><img src="missing.png">'
  assert.equal(renderPostImages({ source: '_posts/example/zh-CN.md', content }), content)
  const pageImage = '<img src="./zh-CN/cover.png">'
  assert.equal(renderPostImages({ source: 'about/index.md', content: pageImage }), pageImage)
})
