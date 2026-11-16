// Draft discovery across every repository, plus pure adoption planning.
// Read-only: nothing here writes, moves or deletes files.
import fs from 'node:fs'
import path from 'node:path'
import {
  ID_RE, firstHeading, readYaml, resolveInside, resolveSourceRoot, slugify, splitFrontmatter, today,
} from './content-system.mjs'

// Keyed by registry id and by checkout directory name, because the registry
// uses kebab-case ids while callers may pass either.
export const LOOSE_DRAFT_DIRS = {
  'site-source': ['draft'],
  'machine-learning': ['draft', 'raw'],
  MachineLearning: ['draft', 'raw'],
  'agent-building-handbook': ['draft'],
  'Agent-Building-Handbook': ['draft'],
}

const SKIP_DIRS = new Set(['node_modules', '.git', '.vitepress', 'dist', 'public', '.deploy_git', '.generated', 'sources'])
const IMAGE_RE = /(!\[[^\]]*\]\(\s*<?)([^)>\s]+)(>?(?:\s+"[^"]*")?\s*\))/g

function walk(root, relative, files = []) {
  const absolute = path.join(root, relative)
  if (!fs.existsSync(absolute)) return files
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const next = path.join(relative, entry.name)
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      walk(root, next, files)
    } else if (entry.name.endsWith('.md')) {
      files.push(next)
    }
  }
  return files
}

export function detectLocale(body, frontmatter = {}) {
  if (frontmatter.locale === 'zh-CN' || frontmatter.locale === 'zh') return 'zh-CN'
  if (frontmatter.locale === 'en') return 'en'
  const sample = body.slice(0, 2000)
  const cjk = (sample.match(/[一-鿿]/g) || []).length
  return cjk > sample.length * 0.02 ? 'zh-CN' : 'en'
}

export function wordCount(body) {
  const cjk = (body.match(/[一-鿿]/g) || []).length
  const latin = body.replace(/[一-鿿]/g, ' ').split(/\s+/).filter(Boolean).length
  return cjk + latin
}

export function manifestIds(repoRoot) {
  const ids = new Set()
  for (const name of ['book.yml', 'series.yml', 'posts.yml']) {
    const manifest = readYaml(path.join(repoRoot, 'collections', name), { items: [] })
    for (const item of manifest.items ?? []) if (item?.id) ids.add(item.id)
  }
  return ids
}

export function classifyDraft({ data, manifest }) {
  if (data.status === 'draft') return 'status-draft'
  if (data.id && manifest.has(data.id)) return 'published'
  return 'loose'
}

export function discoverRepoDrafts({ repo, root }) {
  const dirs = LOOSE_DRAFT_DIRS[repo]
  if (!dirs) return []
  const manifest = manifestIds(root)
  const drafts = []
  for (const dir of dirs) {
    for (const relative of walk(root, dir)) {
      const text = fs.readFileSync(path.join(root, relative), 'utf8')
      const { data, body } = splitFrontmatter(text)
      const reason = classifyDraft({ data, manifest })
      if (reason === 'published') continue
      drafts.push({
        repo, path: relative,
        id: data.id ?? slugify(path.basename(relative, '.md')),
        title: data.title ?? firstHeading(body, path.basename(relative, '.md')),
        locale: detectLocale(body, data), reason,
        updated: String(data.updated ?? data.last_updated ?? data.date ?? '').slice(0, 10),
        words: wordCount(body), empty: body.trim().length === 0,
        needsFrontmatter: !data.id || !data.locale || !data.title || !data.created,
      })
    }
  }
  return drafts
}

export function discoverDrafts({ root, registry, only }) {
  const drafts = []
  for (const source of registry) {
    const repoRoot = resolveSourceRoot(root, source, true) ?? resolveSourceRoot(root, source, false)
    if (!repoRoot || !fs.existsSync(repoRoot)) continue
    if (only && !only.includes(source.id)) continue
    drafts.push(...discoverRepoDrafts({ repo: source.id, root: repoRoot }))
  }
  return drafts.sort((a, b) => `${a.repo}\u0000${a.reason}\u0000${a.title}`.localeCompare(`${b.repo}\u0000${b.reason}\u0000${b.title}`))
}

// Mirrors contentLocation() in write.mjs but as a pure string builder.
export function adoptionTarget({ repo, id, locale, section }) {
  if (repo === 'site-source') return `content/posts/${id}/${locale}.md`
  if (!section) throw new Error('Choose a destination section with --section.')
  if (section.includes('..') || path.isAbsolute(section)) throw new Error('Section must be repository-relative.')
  if (repo === 'coding-with-agents' || repo === 'agent-building-handbook') {
    return `book/${locale === 'zh-CN' ? 'zh-cn' : 'en'}/${section}/${id}.md`
  }
  if (repo === 'computer-science') return `${locale === 'zh-CN' ? 'zh' : 'en'}/book/${section}/${id}.md`
  if (repo === 'machine-learning') return `book/src/${section}/${id}.md`
  if (repo === 'coding-interview-questions') return `book/${id}.md`
  throw new Error(`No adoption adapter for ${repo}.`)
}

// Returns the body with relative image targets rewritten to ./assets/<name>
// and the list of assets that must be copied beside the new file.
export function planAssets(body, sourceFile) {
  const sourceDir = path.dirname(sourceFile)
  const assets = []
  const blockers = []
  const rewritten = body.replace(IMAGE_RE, (full, open, target, close) => {
    if (/^(?:https?:|data:|\/|#)/i.test(target)) return full
    const clean = target.split(/[?#]/)[0]
    const source = path.resolve(sourceDir, clean)
    if (!fs.existsSync(source)) { blockers.push(`missing image ${target}`); return full }
    const name = path.basename(clean)
    assets.push({ from: source, name })
    return `${open}./assets/${name}${close}`
  })
  return { body: rewritten, assets, blockers }
}

export function adoptionPlan({ repo, root, file, existingIds = [], date = today() }) {
  const known = existingIds instanceof Set ? existingIds : new Set(existingIds)
  const absolute = resolveInside(root, file)
  if (!fs.existsSync(absolute)) throw new Error(`No such draft: ${file}`)
  if (fs.statSync(absolute).isDirectory()) throw new Error(`Refusing to adopt a directory: ${file}. Name individual files.`)
  const original = fs.readFileSync(absolute, 'utf8')
  const { data, body } = splitFrontmatter(original)
  const blockers = []
  const warnings = []
  if (!body.trim()) blockers.push('document body is empty')
  const heading = firstHeading(body, null)
  // A CJK heading slugifies to an empty string, so fall back to the filename.
  const id = data.id ?? (slugify(heading ?? '') || slugify(path.basename(file, '.md')))
  if (!ID_RE.test(id)) blockers.push(`cannot derive a valid kebab-case id (got "${id}"); pass --id`)
  if (known.has(id)) blockers.push(`id ${id} already exists in a manifest; pass --id to choose another`)
  const title = data.title ?? heading ?? path.basename(file, '.md')
  const locale = detectLocale(body, data)
  if (data.locale === 'zh') warnings.push('normalized locale zh → zh-CN')
  const created = String(data.created ?? '').slice(0, 10) || date
  const dropped = Object.keys(data).filter((key) => !['id', 'locale', 'title', 'status', 'created', 'updated', 'tags'].includes(key))
  if (dropped.length) warnings.push(`dropping publication-specific frontmatter: ${dropped.join(', ')}`)
  return {
    id, title, locale, created, body,
    absolute, original, dropped, warnings, blockers,
    frontmatter: { id, locale, title, status: 'draft', created, updated: date, tags: data.tags ?? [] },
  }
}
