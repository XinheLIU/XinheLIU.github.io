import assert from 'node:assert/strict'
import path from 'node:path'
import test from 'node:test'
import {
  REPOSITORIES, allRepositoryNames, isAggregated, serviceCommand, urlFor,
} from '../tools/lib/repositories.mjs'

test('every repository has a unique in-range port', () => {
  const ports = Object.values(REPOSITORIES).map((config) => config.port)
  assert.equal(new Set(ports).size, ports.length)
  for (const port of ports) assert.ok(port >= 1024 && port <= 65535, `port ${port}`)
})

test('service command passes an explicit port', () => {
  const service = serviceCommand('Coding-with-Agents')
  assert.deepEqual(service.args, ['run', 'serve', '--', '--port', '5173'])
  assert.equal(service.url, 'http://localhost:5173/Coding-with-Agents/')
})

test('base-prefixed URLs are produced for each book', () => {
  assert.equal(urlFor('site-source'), 'http://localhost:4000/')
  assert.equal(urlFor('MachineLearning'), 'http://localhost:5175/MachineLearning/')
})

test('the Agent Building Handbook is local-only and not aggregated', () => {
  assert.equal(allRepositoryNames().includes('Agent-Building-Handbook'), true)
  assert.equal(isAggregated({ local_only: true }), false)
  assert.equal(isAggregated({}), true)
})

test('registry exposes Agent-Building-Handbook as local_only', async () => {
  const { loadSourceRegistry } = await import('../tools/lib/content-system.mjs')
  const abh = loadSourceRegistry(path.resolve(import.meta.dirname, '..')).find((entry) => entry.id === 'agent-building-handbook')
  assert.ok(abh)
  assert.equal(abh.local_only, true)
  assert.equal(isAggregated(abh), false)
})
