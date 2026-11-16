// One table for every previewable repository: dev/check scripts, fixed dev
// ports, mount points and release behaviour. `write dev --all` and
// `write check --all` iterate this table; the legacy `COMMANDS` shape is
// derived from it so existing call sites keep working unchanged.
import path from 'node:path'
import { loadSourceRegistry, resolveSourceRoot } from './content-system.mjs'

export const REPOSITORIES = {
  'site-source': {
    kind: 'site', framework: 'hexo', dev: 'server', check: 'build',
    port: 4000, base: '/', branch: 'source', release: 'deploy', localOnly: false,
  },
  'Coding-with-Agents': {
    kind: 'book', framework: 'vitepress', dev: 'serve', check: 'build',
    port: 5173, base: '/Coding-with-Agents/', branch: 'main', release: 'push', localOnly: false,
  },
  ComputerScience: {
    kind: 'book', framework: 'vitepress', dev: 'docs:dev', check: 'docs:build',
    port: 5174, base: '/ComputerScience/', branch: 'main', release: 'push', localOnly: false,
  },
  MachineLearning: {
    kind: 'book', framework: 'vitepress', dev: 'serve', check: 'build',
    port: 5175, base: '/MachineLearning/', branch: 'master', release: 'push', localOnly: false,
  },
  'Coding-Interview-Questions': {
    kind: 'book', framework: 'vitepress', dev: 'docs:dev', check: 'docs:build',
    port: 5176, base: '/Coding-Interview-Questions/', branch: 'master', release: 'push', localOnly: false,
  },
  'Agent-Building-Handbook': {
    kind: 'book', framework: 'vitepress', dev: 'dev', check: 'build',
    port: 5177, base: '/Agent-Building-Handbook/', branch: 'main', release: null, localOnly: true,
  },
}

// Back-compat: write.mjs historically consumed `{ dev, check }` per repo.
export const COMMANDS = Object.fromEntries(
  Object.entries(REPOSITORIES).map(([name, config]) => [name, { dev: config.dev, check: config.check }]),
)

export function isAggregated(source) {
  return source.local_only !== true
}

export function matchRepository(root, name) {
  if (name === 'site-source') return { id: 'site-source', root, locales: ['en', 'zh-CN'], public_url: 'https://xinheliu.github.io' }
  const source = loadSourceRegistry(root).find((entry) => entry.id === name || path.basename(entry.local_path) === name)
  if (!source) throw new Error(`Unknown repository "${name}".`)
  return { ...source, root: resolveSourceRoot(root, source, true) }
}

export function urlFor(name, port = REPOSITORIES[name]?.port) {
  return `http://localhost:${port}${REPOSITORIES[name]?.base ?? '/'}`
}

export function serviceCommand(name, port = REPOSITORIES[name]?.port) {
  const config = REPOSITORIES[name]
  if (!config) throw new Error(`No command adapter for ${name}.`)
  const args = ['run', config.dev, '--', '--port', String(port)]
  return { command: 'npm', args, url: urlFor(name, port) }
}

export function allRepositoryNames() {
  return Object.keys(REPOSITORIES)
}
