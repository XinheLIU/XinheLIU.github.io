import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

test('new article dry-run reports changes without writing', () => {
  const id = 'writing-cli-dry-run-fixture'
  const target = path.join(root, 'content', 'posts', id)
  fs.rmSync(target, { recursive: true, force: true })
  const result = spawnSync('./write', [
    'new', '--repo', 'site-source', '--title', 'Writing CLI Dry Run Fixture',
    '--id', id, '--locales', 'en,zh-CN', '--status', 'published', '--dry-run', '--yes',
  ], { cwd: root, encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /Update .*collections\/posts\.yml/)
  assert.equal(fs.existsSync(target), false)
})

test('unknown promotion cannot mutate a destination', () => {
  const result = spawnSync('./write', [
    'promote', 'prepare', 'missing-writing-cli-fixture',
    '--to', 'machine-learning', '--section', '11-deep-learning', '--dry-run',
  ], { cwd: root, encoding: 'utf8' })
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /before promotion/)
})

test('dev --all --dry-run prints the table and spawns nothing', () => {
  const result = spawnSync('./write', ['dev', '--all', '--dry-run'], { cwd: root, encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /REPOSITORY\s+PORT\s+STATUS\s+URL/)
  assert.match(result.stdout, /http:\/\/localhost:4000\//)
  assert.match(result.stdout, /Coding-with-Agents\s+5173/)
})

test('drafts --json emits a JSON array', () => {
  const result = spawnSync('./write', ['drafts', '--json'], { cwd: root, encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  assert.ok(Array.isArray(JSON.parse(result.stdout)))
})

test('drafts adopt --dry-run creates nothing', () => {
  const source = 'draft/write-cli-adopt-fixture.md'
  const file = path.join(root, source)
  const target = path.join(root, 'content', 'posts', 'write-cli-adopt-fixture')
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, '# Write CLI Adopt Fixture\n\nBody text.\n')
  try {
    const result = spawnSync('./write', ['drafts', 'adopt', source, '--dry-run'], { cwd: root, encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /content\/posts\/write-cli-adopt-fixture\/en\.md/)
    assert.equal(fs.existsSync(target), false)
  } finally {
    fs.rmSync(file, { force: true })
  }
})

test('ship site-source --dry-run prints the deploy plan and executes nothing', () => {
  const result = spawnSync('./write', ['ship', 'site-source', '--dry-run', '--no-check'], { cwd: root, encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /npm run deploy/)
  assert.match(result.stdout, /site pin: unchanged/)
})

test('ship refuses a repository with no release path', () => {
  const result = spawnSync('./write', ['ship', 'Agent-Building-Handbook', '--dry-run', '--no-check'], { cwd: root, encoding: 'utf8' })
  assert.notEqual(result.status, 0)
  // A clean checkout has no sibling repository at all; locally it exists without git.
  assert.match(result.stderr, /no git repository|checkout is missing/)
})
