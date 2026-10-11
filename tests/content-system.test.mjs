import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import {
  absoluteUrl, atomicWrite, dateString, localeValue, normalizeRoute, renderMarkdown,
  resolveInside, slugify, splitFrontmatter,
} from '../tools/lib/content-system.mjs'

test('portable frontmatter round-trips', () => {
  const source = renderMarkdown({
    id: 'context-engineering', locale: 'en', title: 'Context Engineering',
    status: 'draft', created: '2026-09-21', updated: '2026-09-21', tags: [],
  }, '# Context Engineering\n')
  const parsed = splitFrontmatter(source)
  assert.equal(parsed.data.id, 'context-engineering')
  assert.match(parsed.body, /^# Context Engineering/m)
})

test('slug, route, locale, and date normalization are deterministic', () => {
  assert.equal(slugify('A Better Writing Flow!'), 'a-better-writing-flow')
  assert.equal(normalizeRoute('writing/example'), '/writing/example/')
  assert.equal(normalizeRoute('/book/chapter.html'), '/book/chapter.html')
  assert.equal(localeValue({ en: '/en/', 'zh-CN': '/zh/' }, 'zh-CN'), '/zh/')
  assert.equal(dateString(new Date('2026-09-21T12:00:00Z')), '2026-09-21')
  assert.equal(absoluteUrl('https://example.com/Book', '/Book/chapter/'), 'https://example.com/Book/chapter/')
  assert.equal(absoluteUrl('https://example.com/Book', '/en/chapter/'), 'https://example.com/Book/en/chapter/')
})

test('resolved paths cannot escape their repository', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'writing-system-'))
  assert.equal(resolveInside(root, 'content/article.md'), path.join(root, 'content/article.md'))
  assert.throws(() => resolveInside(root, '../outside.md'), /escapes repository/)
})

test('atomic writes replace a complete file', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'writing-system-'))
  const file = path.join(root, 'nested', 'article.md')
  atomicWrite(file, 'first')
  atomicWrite(file, 'second')
  assert.equal(fs.readFileSync(file, 'utf8'), 'second')
})
