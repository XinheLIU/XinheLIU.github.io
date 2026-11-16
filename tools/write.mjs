import fs from 'node:fs'
import path from 'node:path'
import { spawnSync, spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import readline from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import {
  assertId, atomicWrite, bodyImageTargets, dateString, fileHash,
  loadSourceRegistry, localeValue, normalizeRoute, readYaml, renderMarkdown,
  resolveInside, resolveSourceRoot, slugify, splitFrontmatter, today, writeYaml,
} from './lib/content-system.mjs'
import { COMMANDS, REPOSITORIES, serviceCommand } from './lib/repositories.mjs'
import { checkoutProblem, runServices } from './lib/dev-runner.mjs'
import { discoverDrafts } from './lib/drafts.mjs'
import { adopt, formatDrafts } from './drafts-adopt.mjs'
import { inspectRepo, planRelease, printState } from './release.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const POSTS = path.join(ROOT, 'collections', 'posts.yml')
const JOURNAL = path.join(ROOT, '.generated', 'promotions')
const LOCALES = ['en', 'zh-CN']

function parseArgs(args) {
  const flags = {}
  const positional = []
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]
    if (!arg.startsWith('--')) { positional.push(arg); continue }
    const [name, inline] = arg.slice(2).split('=', 2)
    if (['dry-run', 'yes', 'local-sources', 'book', 'all', 'open', 'no-open', 'no-check', 'allow-dirty', 'json', 'remove-source'].includes(name)) flags[name] = inline ?? true
    else flags[name] = inline ?? args[++index]
  }
  return { flags, positional }
}

async function prompt(question, fallback) {
  if (!stdin.isTTY) throw new Error(`Missing ${question}; pass it as a flag in non-interactive mode.`)
  const input = readline.createInterface({ input: stdin, output: stdout })
  try {
    const answer = (await input.question(`${question}${fallback ? ` [${fallback}]` : ''}: `)).trim()
    return answer || fallback
  } finally { input.close() }
}

async function value(flags, name, question, fallback) {
  return flags[name] || await prompt(question, fallback)
}

function repository(name) {
  if (name === 'site-source') return { id: name, root: ROOT, locales: LOCALES, public_url: 'https://xinheliu.github.io' }
  const source = loadSourceRegistry(ROOT).find((entry) => entry.id === name || path.basename(entry.local_path) === name)
  if (!source) throw new Error(`Unknown repository "${name}".`)
  return { ...source, root: resolveSourceRoot(ROOT, source, true) }
}

function run(command, args, cwd, env = {}) {
  const result = spawnSync(command, args, { cwd, env: { ...process.env, ...env }, stdio: 'inherit' })
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed (${result.status}).`)
}

function capture(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' })
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')}: ${result.stderr.trim()}`)
  return result.stdout.trim()
}

function ensureSources(record, id, locales) {
  for (const locale of locales) {
    const file = resolveInside(record.root, record.paths[locale])
    if (fs.existsSync(file)) throw new Error(`Target already exists: ${file}`)
  }
  const manifest = readYaml(record.manifest, { id: record.manifestId, items: [] })
  if (manifest.items?.some((item) => item.id === id)) throw new Error(`Manifest already has ${id}: ${record.manifest}`)
  return manifest
}

function assertUniqueId(id) {
  for (const repo of [repository('site-source'), ...loadSourceRegistry(ROOT).map((entry) => repository(entry.id))]) {
    for (const name of ['posts.yml', 'book.yml', 'series.yml']) {
      const manifest = readYaml(path.join(repo.root, 'collections', name), { items: [] })
      if (manifest.items?.some((item) => item.id === id)) {
        throw new Error(`Content id ${id} already appears in ${repo.id}/${name}.`)
      }
    }
  }
}

function contentLocation(repo, section, id, locales) {
  const paths = {}
  if (repo.id === 'site-source') {
    for (const locale of locales) paths[locale] = `content/posts/${id}/${locale}.md`
    return { paths, manifest: POSTS, manifestId: 'site-posts', navigation: 'Site projection from posts.yml' }
  }
  if (!section || section.includes('..') || path.isAbsolute(section)) throw new Error('Choose a repository section with --section.')
  const patterns = {
    'coding-with-agents': (locale) => `book/${locale === 'zh-CN' ? 'zh-cn' : 'en'}/${section}/${id}.md`,
    'agent-building-handbook': (locale) => `book/${locale === 'zh-CN' ? 'zh-cn' : 'en'}/${section}/${id}.md`,
    'computer-science': (locale) => `${locale === 'zh-CN' ? 'zh' : 'en'}/book/${section}/${id}.md`,
    'machine-learning': () => `book/src/${section}/${id}.md`,
    'coding-interview-questions': () => `book/${id}.md`,
  }
  const pattern = patterns[repo.id]
  if (!pattern) throw new Error(`No content adapter for ${repo.id}.`)
  for (const locale of locales) paths[locale] = pattern(locale)
  return { paths, manifest: path.join(repo.root, 'collections', 'book.yml'), manifestId: repo.id, navigation: 'Review native navigation before book publication' }
}

function bookRoute(repoId, sourcePath) {
  if (repoId === 'coding-with-agents') return `/${sourcePath.replace(/^book\//, '').replace(/\.md$/, '.html')}`
  if (repoId === 'agent-building-handbook') return `/${sourcePath.replace(/^book\//, '').replace(/\.md$/, '.html')}`
  if (repoId === 'computer-science') return `/ComputerScience/${sourcePath.replace(/\.md$/, '.html')}`
  if (repoId === 'machine-learning') return `/MachineLearning/${sourcePath.replace(/^book\/src\//, '').replace(/\.md$/, '.html')}`
  if (repoId === 'coding-interview-questions') return `/Coding-Interview-Questions/${sourcePath.replace(/\.md$/, '')}`
  throw new Error(`No route adapter for ${repoId}.`)
}

async function create(flags) {
  const name = await value(flags, 'repo', 'Repository (site-source or book repository)', 'site-source')
  const repo = repository(name)
  const title = await value(flags, 'title', 'Article title')
  const id = await value(flags, 'id', 'Stable id', flags.slug || slugify(title))
  assertId(id)
  const locales = (await value(flags, 'locales', 'Locales (en, zh-CN, or en,zh-CN)', repo.locales[0])).split(',').map((item) => item.trim())
  if (!locales.length || locales.some((locale) => !repo.locales.includes(locale))) throw new Error(`Unsupported locales for ${repo.id}: ${locales}`)
  const section = repo.id === 'site-source' || repo.id === 'coding-interview-questions' ? '' : await value(flags, 'section', 'Book section (repository-relative)')
  const record = { root: repo.root, ...contentLocation(repo, section, id, locales) }
  assertUniqueId(id)
  const manifest = ensureSources(record, id, locales)
  const date = today()
  const status = flags.status || 'draft'
  if (!['draft', 'published'].includes(status)) throw new Error('Status must be draft or published.')
  const route = {}
  if (repo.id === 'site-source') {
    for (const locale of locales) route[locale] = normalizeRoute(locale === 'zh-CN' ? `/writing/${id}-zh/` : `/writing/${id}/`)
  } else {
    for (const locale of locales) route[locale] = normalizeRoute(bookRoute(repo.id, record.paths[locale]))
  }
  const changes = locales.map((locale) => {
    const data = { id, locale, title: flags[`title-${locale}`] || title, status, created: date, updated: date, tags: [] }
    return { file: resolveInside(repo.root, record.paths[locale]), content: renderMarkdown(data, `# ${data.title}\n\n`) }
  })
  if (status === 'published') {
    const item = { id, source: record.paths, published_at: date, route }
    if (repo.id === 'site-source') {
      item.site_route = route
      item.category = flags.category || 'Writing'
      item.mode = 'full'
      item.canonical = 'site'
    } else {
      item.part = section || 'concepts'
      item.order = flags.order || ((manifest.items?.length || 0) + 1)
      item.layout = 'chapter'
    }
    manifest.items.push(item)
  }
  console.log(`Create ${id} in ${repo.id}:\n${changes.map((change) => `  ${change.file}`).join('\n')}`)
  if (status === 'published') console.log(`Update ${record.manifest}`)
  if (flags['dry-run']) return
  if (!flags.yes && (await prompt('Apply? (yes/no)', 'no')) !== 'yes') return
  for (const change of changes) atomicWrite(change.file, change.content)
  if (status === 'published') writeYaml(record.manifest, manifest)
  console.log(`Created ${id}. ${record.navigation}.`)
}

function findSitePost(id) {
  assertId(id)
  const manifest = readYaml(POSTS, { id: 'site-posts', items: [] })
  const item = manifest.items.find((entry) => entry.id === id)
  return { manifest, item }
}

function publish(id, flags) {
  assertId(id)
  const directory = resolveInside(ROOT, `content/posts/${id}`)
  if (!fs.existsSync(directory)) throw new Error(`No draft directory content/posts/${id}/; create it with ./write new --repo site-source.`)
  const sources = {}
  for (const locale of LOCALES) {
    const file = path.join(directory, `${locale}.md`)
    if (!fs.existsSync(file)) continue
    const { data, body } = splitFrontmatter(fs.readFileSync(file, 'utf8'))
    if (data.id !== id || data.locale !== locale || !data.title) throw new Error(`Invalid frontmatter in ${file}.`)
    for (const image of bodyImageTargets(body)) {
      if (!fs.existsSync(resolveInside(path.dirname(file), image))) throw new Error(`Missing image in ${file}: ${image}`)
    }
    sources[locale] = `content/posts/${id}/${locale}.md`
  }
  if (!Object.keys(sources).length) throw new Error(`content/posts/${id}/ exists but has no locale file (expected ${LOCALES.map((locale) => `${locale}.md`).join(' or ')}).`)
  const { manifest, item } = findSitePost(id)
  if (item) throw new Error(`${id} is already published in posts.yml.`)
  const siteRoute = {}
  for (const locale of Object.keys(sources)) siteRoute[locale] = locale === 'zh-CN' ? `/writing/${id}-zh/` : `/writing/${id}/`
  const next = {
    id, source: sources, published_at: flags.date || today(), site_route: siteRoute,
    mode: 'full', canonical: 'site', category: flags.category || 'Writing',
  }
  console.log(`Publish ${id}: ${JSON.stringify(siteRoute)}`)
  if (flags['dry-run']) return
  for (const [locale, relative] of Object.entries(sources)) {
    const file = resolveInside(ROOT, relative)
    const { data, body } = splitFrontmatter(fs.readFileSync(file, 'utf8'))
    atomicWrite(file, renderMarkdown({ ...data, status: 'published', updated: today() }, body))
  }
  manifest.items.push(next)
  writeYaml(POSTS, manifest)
}

function journalFile(id) { return path.join(JOURNAL, `${id}.json`) }

function promotionRecord(id) {
  const file = journalFile(id)
  if (!fs.existsSync(file)) throw new Error(`No pending promotion for ${id}.`)
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function destinationPaths(repo, id, locales, section) {
  return contentLocation(repo, section, id, locales).paths
}

function prepare(id, flags) {
  const { item } = findSitePost(id)
  if (!item) throw new Error(`Publish ${id} on the site before promotion.`)
  if (fs.existsSync(journalFile(id))) throw new Error(`Promotion already prepared for ${id}.`)
  const repo = repository(flags.to)
  if (repo.id === 'site-source') throw new Error('Destination must be a book or notes repository.')
  const siteStatus = capture('git', ['status', '--porcelain', '--', `content/posts/${id}`], ROOT)
  if (siteStatus) throw new Error(`Commit the site article before promotion:\n${siteStatus}`)
  const locales = Object.keys(item.source)
  if (locales.some((locale) => !repo.locales.includes(locale))) throw new Error(`${repo.id} does not support all source locales.`)
  const section = flags.section || (repo.id === 'coding-interview-questions' ? '' : null)
  if (section === null) throw new Error('Choose the destination section with --section.')
  const paths = destinationPaths(repo, id, locales, section)
  const sourceFiles = Object.values(item.source).map((relative) => resolveInside(ROOT, relative))
  const sourceDirectory = path.dirname(sourceFiles[0])
  const assetsDirectory = path.join(sourceDirectory, 'assets')
  const assets = fs.existsSync(assetsDirectory) ? fs.readdirSync(assetsDirectory).filter((name) => fs.statSync(path.join(assetsDirectory, name)).isFile()) : []
  const entries = []
  for (const locale of locales) {
    const source = resolveInside(ROOT, item.source[locale])
    const destination = resolveInside(repo.root, paths[locale])
    if (fs.existsSync(destination)) throw new Error(`Destination exists: ${destination}`)
    const { data, body } = splitFrontmatter(fs.readFileSync(source, 'utf8'))
    if (data.id !== id || data.locale !== locale) throw new Error(`Invalid source identity: ${source}`)
    entries.push({ source, destination, content: renderMarkdown({
      ...data, provenance: { repository: 'XinheLIU/XinheLIU.github.io', path: item.source[locale],
        commit: capture('git', ['rev-parse', 'HEAD'], ROOT), migrated_at: today() },
    }, body) })
  }
  const seriesFile = path.join(repo.root, 'collections', 'series.yml')
  const manifest = readYaml(seriesFile, { id: `${repo.id}-writing`, items: [] })
  if (manifest.items.some((entry) => entry.id === id)) throw new Error(`${id} already exists in destination series.yml.`)
  const bookFile = path.join(repo.root, 'collections', 'book.yml')
  const book = readYaml(bookFile, { id: repo.id, items: [] })
  if (flags.book && book.items.some((entry) => entry.id === id)) throw new Error(`${id} already exists in destination book.yml.`)
  const seriesEntry = {
    id, source: paths, published_at: dateString(item.published_at), mode: 'full',
    site_route: item.site_route, canonical: 'site',
  }
  manifest.items.push(seriesEntry)
  if (flags.book) book.items.push({ id, source: paths, part: section || 'concepts',
    order: flags.order || book.items.length + 1,
    route: Object.fromEntries(locales.map((locale) => [locale, bookRoute(repo.id, paths[locale])])), layout: 'chapter' })
  const created = []
  console.log(`Prepare promotion ${id} → ${repo.id}: ${entries.map((entry) => entry.destination).join(', ')}`)
  if (flags['dry-run']) return
  try {
    for (const entry of entries) { atomicWrite(entry.destination, entry.content); created.push(entry.destination) }
    for (const entry of entries) {
      const targetDirectory = path.join(path.dirname(entry.destination), 'assets')
      for (const asset of assets) {
        const target = path.join(targetDirectory, asset)
        if (fs.existsSync(target)) throw new Error(`Destination asset exists: ${target}`)
        fs.mkdirSync(targetDirectory, { recursive: true })
        fs.copyFileSync(path.join(assetsDirectory, asset), target)
        created.push(target)
      }
    }
    writeYaml(seriesFile, manifest)
    if (flags.book) writeYaml(bookFile, book)
    fs.mkdirSync(JOURNAL, { recursive: true })
    atomicWrite(journalFile(id), `${JSON.stringify({ id, destination: repo.id, paths, sources: item.source,
      created: created.map((file) => ({ file, hash: fileHash(file) })),
      seriesFile, bookFile: flags.book ? bookFile : null,
      route: item.site_route }, null, 2)}\n`)
  } catch (error) {
    for (const file of created) fs.rmSync(file, { force: true })
    throw error
  }
  console.log('Prepared. Commit the destination, then explicitly update the site submodule pin before finalize.')
}

function finalize(id, flags) {
  const journal = promotionRecord(id)
  const repo = repository(journal.destination)
  const pinnedRoot = resolveSourceRoot(ROOT, repo, false)
  const pinnedManifest = readYaml(path.join(pinnedRoot, 'collections', 'series.yml'), { items: [] })
  const pinnedItem = pinnedManifest.items.find((item) => item.id === id)
  if (!pinnedItem || pinnedItem.mode !== 'full' || pinnedItem.canonical !== 'site') throw new Error('Pinned destination does not contain the full site-canonical series entry.')
  const { manifest, item } = findSitePost(id)
  if (!item) throw new Error(`Site source for ${id} is missing.`)
  for (const [locale, relative] of Object.entries(journal.sources)) {
    const pinnedFile = resolveInside(pinnedRoot, pinnedItem.source?.[locale] || '')
    if (!fs.existsSync(pinnedFile)) throw new Error(`Pinned destination is missing ${locale}.`)
    const { data, body } = splitFrontmatter(fs.readFileSync(pinnedFile, 'utf8'))
    if (data.id !== id || data.locale !== locale) throw new Error(`Pinned destination identity mismatch for ${locale}.`)
    if (normalizeRoute(localeValue(pinnedItem.site_route, locale)) !== normalizeRoute(localeValue(item.site_route, locale))) throw new Error(`Site URL changed for ${locale}.`)
    const siteBody = splitFrontmatter(fs.readFileSync(resolveInside(ROOT, relative), 'utf8')).body
    if (body !== siteBody) throw new Error(`Pinned destination content differs from the site source for ${locale}.`)
    for (const target of bodyImageTargets(body)) {
      const sourceAsset = resolveInside(path.dirname(pinnedFile), target)
      if (!fs.existsSync(sourceAsset)) throw new Error(`Pinned destination is missing asset ${target}.`)
    }
  }
  console.log(`Finalize ${id}: pinned ${repo.id} owns source; original routes remain ${JSON.stringify(item.site_route)}`)
  if (flags['dry-run']) return
  const directory = resolveInside(ROOT, `content/posts/${id}`)
  const backup = path.join(JOURNAL, `${id}-site-backup`)
  if (fs.existsSync(backup)) throw new Error(`Backup already exists: ${backup}`)
  fs.renameSync(directory, backup)
  try {
    manifest.items = manifest.items.filter((entry) => entry.id !== id)
    writeYaml(POSTS, manifest)
    run('npm', ['run', 'build'], ROOT)
  } catch (error) {
    fs.renameSync(backup, directory)
    manifest.items.push(item)
    writeYaml(POSTS, manifest)
    throw error
  }
  fs.rmSync(backup, { recursive: true })
  fs.rmSync(journalFile(id))
  console.log('Finalized and verified. The destination is now the only editable owner.')
}

function abort(id, flags) {
  const journal = promotionRecord(id)
  for (const entry of journal.created) {
    if (!fs.existsSync(entry.file) || fileHash(entry.file) !== entry.hash) throw new Error(`Cannot abort: prepared file changed: ${entry.file}`)
  }
  const manifest = readYaml(journal.seriesFile)
  if (!manifest.items.some((item) => item.id === id)) throw new Error('Destination manifest changed; abort manually.')
  console.log(`Abort prepared promotion ${id}: remove ${journal.created.length} unchanged files and its manifest entry.`)
  if (flags['dry-run']) return
  manifest.items = manifest.items.filter((item) => item.id !== id)
  writeYaml(journal.seriesFile, manifest)
  if (journal.bookFile) {
    const book = readYaml(journal.bookFile)
    book.items = book.items.filter((item) => item.id !== id)
    writeYaml(journal.bookFile, book)
  }
  for (const entry of journal.created) fs.rmSync(entry.file)
  fs.rmSync(journalFile(id))
}

function isGitRepository(root) {
  if (!fs.existsSync(path.join(root, '.git'))) {
    // A worktree or submodule may use a `.git` file, so probe git itself.
    if (!fs.existsSync(root)) return false
  }
  try {
    capture('git', ['rev-parse', '--is-inside-work-tree'], root)
    return true
  } catch {
    return false
  }
}

function doctor() {
  console.log(`Node ${process.version}; site: ${ROOT}`)
  for (const [name, commands] of Object.entries(COMMANDS)) {
    const repo = repository(name)
    const config = REPOSITORIES[name]
    const pkg = path.join(repo.root, 'package.json')
    const installed = fs.existsSync(path.join(repo.root, 'node_modules'))
    const pinned = name === 'site-source' || config.localOnly ? 'local-only' : (fs.existsSync(resolveSourceRoot(ROOT, repo, false)) ? 'ready' : 'missing')
    const dirty = isGitRepository(repo.root)
      ? `${capture('git', ['status', '--porcelain'], repo.root).split('\n').filter(Boolean).length} worktree change(s)`
      : 'no git repository'
    console.log(`${name}: ${fs.existsSync(pkg) ? 'package ready' : 'package missing'}, dependencies ${installed ? 'ready' : 'missing'}, pinned ${pinned}, ${dirty}, dev=${commands.dev}, port=${config.port}`)
  }
}

function help() {
  console.log(`Usage:
Author
  write new [--repo ID --title TITLE --id ID --locales en,zh-CN --section PATH --status draft|published --yes]
  write drafts [--repo ID --json]
  write drafts adopt PATH [--repo ID --locale en|zh-CN --id ID --title TITLE --section PATH] [--remove-source] [--dry-run --yes]
  write publish ID [--date YYYY-MM-DD --category NAME --dry-run]
  write promote prepare ID --to REPOSITORY --section PATH [--book --dry-run]
  write promote finalize ID [--dry-run]
  write promote status ID
  write promote abort ID [--dry-run]
Preview
  write dev REPOSITORY [--local-sources]
  write dev --all [--only a,b] [--local-sources] [--no-open] [--dry-run]
Verify
  write check [REPOSITORY] [--all]
  write doctor
Ship
  write ship REPOSITORY [--yes] [--dry-run] [--no-check] [--allow-dirty]

publish <id> makes a site draft public; ship <repo> pushes a repository or deploys the site.`)
}

async function devAll(flags) {
  const only = flags.only ? String(flags.only).split(',').map((item) => item.trim()).filter(Boolean) : null
  const names = only ?? Object.keys(REPOSITORIES)
  for (const name of names) if (!REPOSITORIES[name]) throw new Error(`Unknown repository "${name}".`)
  if (!flags['dry-run'] && names.includes('site-source')) {
    run('node', ['tools/aggregate-series.mjs', ...(flags['local-sources'] ? ['--local-sources'] : [])], ROOT)
  }
  const services = names.map((name) => {
    const repo = repository(name)
    const { command, args, url } = serviceCommand(name, REPOSITORIES[name].port)
    return {
      name, port: REPOSITORIES[name].port, url, command, args, cwd: repo.root,
      env: flags['local-sources'] ? { WRITING_LOCAL_SOURCES: '1' } : {},
      skipped: checkoutProblem(repo.root),
    }
  })
  return runServices(services, { dryRun: Boolean(flags['dry-run']), open: Boolean(flags.open) && !flags['no-open'] })
}

function draftsCommand(flags) {
  const only = flags.repo ? [repository(flags.repo).id] : null
  const registry = [{ id: 'site-source', local_path: '.', path: '.' }, ...loadSourceRegistry(ROOT)]
  const drafts = discoverDrafts({ root: ROOT, registry, only })
  if (flags.json) return console.log(JSON.stringify(drafts, null, 2))
  console.log(formatDrafts(drafts))
}

async function draftsAdopt(file, flags) {
  if (!file) throw new Error('Name the draft file to adopt, e.g. write drafts adopt draft/note.md.')
  const name = flags.repo || (file.startsWith('draft/') ? 'site-source' : null)
  if (!name) throw new Error('Pass --repo for drafts outside a known repository draft folder.')
  const repo = repository(name)
  adopt({ repo: repo.id, repoRoot: repo.root, file, flags })
}

async function shipCommand(name, flags) {
  if (!name) throw new Error('Name the repository to ship, e.g. write ship Coding-with-Agents.')
  const repo = repository(name)
  const state = inspectRepo(repo.root)
  printState(repo.id, state)
  const plan = planRelease(repo.id, REPOSITORIES[repo.id], state)
  if (plan.blockers.length) throw new Error(plan.blockers.join('; '))
  if (!flags['no-check']) run('npm', ['run', REPOSITORIES[repo.id].check], repo.root)
  console.log('\nNext step:')
  for (const step of plan.steps) console.log(`  ${step.label}: ${step.command} ${step.args.join(' ')}`)
  console.log('\nsite pin: unchanged (advance pins only with node tools/update-source.mjs and explicit review)')
  if (flags['dry-run'] || !flags.yes) {
    if (!flags['dry-run']) console.log('\nNot executed. Re-run with --yes to ship.')
    return
  }
  for (const step of plan.steps) run(step.command, step.args, repo.root)
  console.log(`\nShipped ${repo.id}.`)
}

export async function main(args) {
  const { flags, positional } = parseArgs(args)
  const [command, first, second] = positional
  if (!command || command === 'help') return help()
  if (command === 'new') return create(flags)
  if (command === 'drafts') {
    if (first === 'adopt') return draftsAdopt(second, flags)
    return draftsCommand(flags)
  }
  if (command === 'publish') return publish(first, flags)
  if (command === 'promote') {
    if (first === 'prepare') return prepare(second, flags)
    if (first === 'finalize') return finalize(second, flags)
    if (first === 'abort') return abort(second, flags)
    if (first === 'status') return console.log(JSON.stringify(promotionRecord(second), null, 2))
  }
  if (command === 'doctor') return doctor()
  if (command === 'ship') return shipCommand(first, flags)
  if (command === 'dev' && (flags.all || first === 'all')) return devAll(flags)
  if (command === 'dev' || command === 'check') {
    const name = first || 'site-source'
    if (command === 'check' && flags.all) {
      for (const repositoryName of Object.keys(COMMANDS)) {
        if (REPOSITORIES[repositoryName].localOnly) continue
        const checked = repository(repositoryName)
        run('npm', ['run', COMMANDS[repositoryName].check], checked.root)
      }
      run('node', ['tools/audit-content.mjs', '--check-baseline', 'docs/architecture/audit-report.json'], ROOT)
      return
    }
    const repo = repository(name)
    const scripts = COMMANDS[path.basename(repo.root)]
    if (!scripts) throw new Error(`No command adapter for ${name}.`)
    if (command === 'check') {
      run('npm', ['run', scripts.check], repo.root)
      if (name === 'site-source') run('node', ['tools/audit-content.mjs', '--repos', '.', '--check-baseline', 'docs/architecture/audit-report.json'], ROOT)
      return
    }
    if (name === 'site-source') run('node', ['tools/aggregate-series.mjs', ...(flags['local-sources'] ? ['--local-sources'] : [])], ROOT)
    const child = spawn('npm', ['run', scripts.dev], { cwd: repo.root, stdio: 'inherit', env: { ...process.env, ...(flags['local-sources'] ? { WRITING_LOCAL_SOURCES: '1' } : {}) } })
    child.on('exit', (code) => { process.exitCode = code || 0 })
    return
  }
  throw new Error(`Unknown command: ${args.join(' ')}`)
}
