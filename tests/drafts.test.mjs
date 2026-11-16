import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import {
  adoptionPlan, adoptionTarget, classifyDraft, detectLocale, manifestIds, planAssets, wordCount,
} from '../tools/lib/drafts.mjs'

function fixture(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'write-drafts-'))
  for (const [relative, content] of Object.entries(files)) {
    const file = path.join(root, relative)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, content)
  }
  return root
}

test('drafts are classified as loose, status-draft or published', () => {
  const manifest = new Set(['already-published'])
  assert.equal(classifyDraft({ data: {}, manifest }), 'loose')
  assert.equal(classifyDraft({ data: { status: 'draft' }, manifest }), 'status-draft')
  assert.equal(classifyDraft({ data: { id: 'already-published' }, manifest }), 'published')
})

test('locale detection prefers frontmatter and falls back to CJK ratio', () => {
  assert.equal(detectLocale('plain english text', { locale: 'zh-CN' }), 'zh-CN')
  assert.equal(detectLocale('# 这是一篇中文文章，内容很长。'), 'zh-CN')
  assert.equal(detectLocale('# A short English article'), 'en')
})

test('word count sums CJK characters and latin words', () => {
  assert.equal(wordCount('中文 两个 words'), 4 + 1)
})

test('adoption plan derives frontmatter from the heading', () => {
  const root = fixture({ 'draft/my-note.md': '# A Good Title\n\nSome text.\n' })
  const plan = adoptionPlan({ repo: 'site-source', root, file: 'draft/my-note.md', date: '2026-11-16' })
  assert.equal(plan.id, 'a-good-title')
  assert.equal(plan.title, 'A Good Title')
  assert.equal(plan.frontmatter.status, 'draft')
  assert.equal(plan.frontmatter.updated, '2026-11-16')
  assert.deepEqual(plan.blockers, [])
})

test('adoption plan rewrites relative images and lists assets', () => {
  const root = fixture({
    'draft/note.md': '# T\n\n![a](pic.png)\n',
    'draft/pic.png': 'png',
  })
  const plan = adoptionPlan({ repo: 'site-source', root, file: 'draft/note.md' })
  const assets = planAssets(plan.body, plan.absolute)
  assert.match(assets.body, /!\[a\]\(\.\/assets\/pic\.png\)/)
  assert.equal(assets.assets.length, 1)
  assert.deepEqual(assets.blockers, [])
})

test('adoption blocks on missing images and empty bodies', () => {
  const root = fixture({ 'draft/empty.md': '---\nid: empty\n---\n\n   \n', 'draft/pic.md': '# T\n\n![a](gone.png)\n' })
  assert.match(adoptionPlan({ repo: 'site-source', root, file: 'draft/empty.md' }).blockers.join(' '), /empty/)
  const plan = adoptionPlan({ repo: 'site-source', root, file: 'draft/pic.md' })
  assert.match(planAssets(plan.body, plan.absolute).blockers.join(' '), /missing image/)
})

test('adoption refuses directories', () => {
  const root = fixture({ 'draft/folder/index.md': '# T\n\nbody\n' })
  assert.throws(() => adoptionPlan({ repo: 'site-source', root, file: 'draft/folder' }), /directory/)
})

test('book targets require a section and map each locale', () => {
  assert.throws(() => adoptionTarget({ repo: 'machine-learning', id: 'x', locale: 'en' }), /--section/)
  assert.equal(adoptionTarget({ repo: 'machine-learning', id: 'x', locale: 'en', section: '01-intro' }), 'book/src/01-intro/x.md')
  assert.equal(
    adoptionTarget({ repo: 'coding-with-agents', id: 'x', locale: 'zh-CN', section: '02-anatomy' }),
    'book/zh-cn/02-anatomy/x.md',
  )
})

test('manifest ids are read from all three manifests', () => {
  const root = fixture({
    'collections/book.yml': 'id: book\nitems:\n  - id: one\n',
    'collections/series.yml': 'id: series\nitems:\n  - id: two\n',
  })
  const ids = manifestIds(root)
  assert.ok(ids.has('one') && ids.has('two'))
})
