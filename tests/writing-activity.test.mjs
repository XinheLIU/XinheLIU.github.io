import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import vm from 'node:vm'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import history from '../tools/lib/writing-history.cjs'
import activity from '../themes/xinhe-site/source/js/writing-activity.js'

const now = new Date('2026-10-03T00:00:00+08:00')
const record = (overrides = {}) => ({ id: 'site-source:old-post', title: 'An old essay', locale: 'en',
  url: '/old-essay/', created_at: '2023-05-12', updated_at: '', ...overrides })

test('backfilled creation dates are independent of migration, publication, and file modification dates', () => {
  assert.deepEqual(history.writingDates({ created: '2023-05-12', date: '2026-10-03', published_at: '2026-10-03', mtime: '2026-10-03' }),
    { created_at: '2023-05-12', updated_at: '' })
  assert.deepEqual(history.writingDates({ date: '2023-05-12 23:55:00', updated: '2024-01-10' }),
    { created_at: '2023-05-12', updated_at: '2024-01-10' })
  assert.deepEqual(history.writingDates({ created: '2023-05-12', updated: '2023-05-12' }),
    { created_at: '2023-05-12', updated_at: '2023-05-12' })
  assert.throws(() => history.writingDates({ created: '2023-02-30' }), /Invalid writing date/)
  assert.throws(() => history.writingDates({ created: '2024-01-10', updated: '2023-05-12' }), /precedes creation/)
})

test('translations and multiple publication surfaces count once per logical writing event', () => {
  const records = [record({ created_at: '2026-07-27', updated_at: '2026-08-24' }),
    record({ created_at: '2026-07-27', updated_at: '2026-08-24', locale: 'zh-CN', title: '旧文', url: '/old-essay-zh/' }),
    record({ created_at: '2026-07-27', updated_at: '2026-08-24', url: '/book/chapter/' })]
  const events = history.writingEvents(records, 'zh-CN')
  assert.equal(events.length, 2)
  assert.deepEqual(events.map(event => event.kind), ['updated', 'created'])
  assert.ok(events.every(event => event.title === '旧文'))
  assert.equal(history.writingEvents([record({ updated_at: '2023-05-12' })], 'en').length, 1)
})

test('full history survives while the homepage renders only its six-month window', () => {
  const snapshot = { events: history.writingEvents([record(), record({ id: 'book:agents', created_at: '2026-07-27', updated_at: '2026-08-24', title: 'How Agents Work' })], 'en') }
  assert.equal(snapshot.events.length, 3)
  const current = activity.render(snapshot, false, now)
  assert.ok(current.includes('2 writing days · 1 piece created · 1 update'))
  assert.ok(!current.includes('An old essay'))
  assert.ok(!current.includes('commits'))
  const historical = activity.render(snapshot, false, new Date('2023-10-03T00:00:00+08:00'))
  assert.ok(historical.includes('An old essay'))
  assert.ok(historical.includes('data-date="2023-05-12" data-count="1"'))
  assert.equal(snapshot.events.length, 3)
})

test('calendar includes today, month-end and Shanghai date boundaries; titles are escaped', () => {
  const snapshot = { events: history.writingEvents([record({ created_at: '2026-10-03', title: '<script>test</script>' })], 'en') }
  const html = activity.render(snapshot, false, now)
  const dates = [...html.matchAll(/data-date="([^"]+)"/g)].map(match => match[1])
  assert.equal(dates[0], '2026-04-03')
  assert.equal(dates.at(-1), '2026-10-03')
  assert.equal(dates.length, 184)
  assert.ok(html.includes('&lt;script&gt;test&lt;/script&gt;'))
  assert.deepEqual(activity.windowDates(new Date('2024-08-31T00:00:00Z')), { start: '2024-02-29', end: '2024-08-31' })
  assert.deepEqual(activity.windowDates(new Date('2026-10-02T16:00:00Z')), { start: '2026-04-03', end: '2026-10-03' })
})

test('Hexo integration ignores auto-filled updated and includes dated book catalog entries', () => {
  const script = new URL('../themes/xinhe-site/scripts/writing-activity.js', import.meta.url)
  const require = createRequire(script)
  const helpers = new Map()
  const hexo = { base_dir: '/fixture', extend: { helper: { register: (name, helper) => helpers.set(name, helper) } },
    locals: { get: () => [{ title: 'Migrated', path: 'migrated/', source: '_posts/migrated/en.md', updated: new Date(),
      raw: '---\ntitle: Migrated\ndate: 2023-05-12\nsite_locale: en\n---\nBody' },
      { title: 'Draft', source: '_posts/draft/en.md', path: 'draft/', raw: '---\nstatus: draft\ndate: 2026-10-03\n---\nBody' }] } }
  vm.runInNewContext(fs.readFileSync(script, 'utf8'), { hexo, require: name => name === 'fs' ? {
    existsSync: () => true, readFileSync: () => JSON.stringify([{ id: 'agents', owner: 'coding-with-agents', locale: 'en', title: 'Agents',
      site_url: '/agents/', published_at: '2026-10-03', created_at: '2026-07-27', updated_at: '2026-08-24' }]),
  } : require(name) })
  const snapshot = helpers.get('writing_activity_snapshot')('en')
  assert.equal(snapshot.events.length, 3)
  assert.ok(snapshot.events.some(event => event.date === '2023-05-12'))
  assert.ok(!snapshot.events.some(event => event.date === '2026-10-03'))
  assert.ok(!snapshot.events.some(event => event.title === 'Draft'))
})

test('history navigation reaches imported dates and returns to the current six months', () => {
  const snapshot = { events: history.writingEvents([record()], 'en') }
  const button = () => ({ disabled: false, addEventListener(name, handler) { this.click = handler } })
  const previous = button(), next = button(), latest = button()
  const panel = { innerHTML: '', getAttribute: () => 'en' }
  const elements = { '[data-writing-activity]': panel, '[data-writing-previous]': previous, '[data-writing-next]': next, '[data-writing-latest]': latest }
  const document = { querySelector: selector => elements[selector], getElementById: () => ({ textContent: JSON.stringify(snapshot) }) }
  activity.mount(document, now)
  assert.equal(next.disabled, true)
  for (let i = 0; i < 10 && !previous.disabled; i++) previous.click()
  assert.ok(panel.innerHTML.includes('An old essay'))
  assert.equal(previous.disabled, true)
  next.click()
  assert.ok(!panel.innerHTML.includes('An old essay'))
  latest.click()
  assert.ok(panel.innerHTML.includes('2026-04-03 → 2026-10-03'))
  assert.equal(latest.disabled, true)
})


test('clean release reads pinned book and series manifests without a generated catalog', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'writing-manifests-'))
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }))
  const book = path.join(directory, 'sources', 'Coding-with-Agents')
  fs.mkdirSync(path.join(book, 'collections'), { recursive: true })
  fs.writeFileSync(path.join(book, 'chapter.md'), '---\nid: agents\ntitle: How Agents Work\nstatus: published\ncreated: 2023-05-12\nupdated: 2024-01-10\n---\nBody')
  fs.writeFileSync(path.join(book, 'collections', 'book.yml'), 'id: coding-with-agents\nitems:\n  - id: agents\n    source: {en: chapter.md}\n    route: /en/chapter.html\n')
  fs.writeFileSync(path.join(book, 'collections', 'series.yml'), 'id: agentic-engineering\nitems:\n  - id: agents\n    source: {en: chapter.md}\n    published_at: 2026-10-03\n')
  const script = new URL('../themes/xinhe-site/scripts/writing-activity.js', import.meta.url)
  const require = createRequire(script)
  const helpers = new Map()
  const hexo = { base_dir: directory, config: { url: 'https://xinheliu.github.io' },
    extend: { helper: { register: (name, helper) => helpers.set(name, helper) } }, locals: { get: () => [] } }
  vm.runInNewContext(fs.readFileSync(script, 'utf8'), { hexo, require })
  const snapshot = helpers.get('writing_activity_snapshot')('en')
  assert.equal(snapshot.events.length, 2)
  assert.equal(snapshot.events[1].date, '2023-05-12')
  assert.equal(snapshot.events[0].url, '/en/agentic-engineering/agents/')
  fs.unlinkSync(path.join(book, 'collections', 'series.yml'))
  const bookOnly = helpers.get('writing_activity_snapshot')('en')
  assert.equal(bookOnly.events[0].url, 'https://xinheliu.github.io/Coding-with-Agents/en/chapter.html')
})
