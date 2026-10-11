import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const yaml = require('js-yaml')

export const LOCALES = ['en', 'zh-CN']
export const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function normalizeLocale(locale) {
  return locale === 'zh' || locale === 'zh-cn' ? 'zh-CN' : locale
}

export function readYaml(file, fallback = null) {
  if (!fs.existsSync(file)) return fallback
  return yaml.load(fs.readFileSync(file, 'utf8')) ?? fallback
}

export function writeYaml(file, value) {
  atomicWrite(file, yaml.dump(value, { lineWidth: 120, noRefs: true, sortKeys: false }))
}

export function splitFrontmatter(text) {
  const match = text.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/)
  if (!match) return { data: {}, body: text }
  return { data: yaml.load(match[1]) ?? {}, body: text.slice(match[0].length) }
}

export function renderMarkdown(data, body) {
  const normalizedBody = body.replace(/^\s+/, '').replace(/\s+$/, '')
  return `---\n${yaml.dump(data, { lineWidth: 120, noRefs: true, sortKeys: false })}---\n\n${normalizedBody}\n`
}

export function atomicWrite(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const temporary = `${file}.tmp-${process.pid}-${Date.now()}`
  fs.writeFileSync(temporary, content)
  fs.renameSync(temporary, file)
}

export function slugify(value) {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function assertId(id) {
  if (!ID_RE.test(id)) throw new Error(`Invalid content id "${id}"; use lowercase kebab-case.`)
}

export function today() {
  return new Date().toISOString().slice(0, 10)
}

export function dateString(value, fallback = today()) {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return value ? String(value).slice(0, 10) : fallback
}

export function firstExcerpt(body) {
  const paragraphs = body
    .replace(/```[\s\S]*?```/g, '')
    .split(/\r?\n\s*\r?\n/)
    .map((part) => part.replace(/^#+\s+.*$/gm, '').replace(/^>\s?/gm, '').trim())
    .filter((part) => part && !/^Last updated:?\s*/i.test(part) && !/^[-*]\s+\[[ x]\]/i.test(part))
  return summarize(paragraphs[0] ?? '')
}

export function summarize(text, max = 300) {
  const flat = text.replace(/\s+/g, ' ').trim()
  if (flat.length <= max) return flat
  return `${flat.slice(0, max - 1).replace(/\s+\S*$/, '')}…`
}

export function firstHeading(body, fallback) {
  return body.match(/^#\s+(.+)$/m)?.[1]?.trim() || fallback
}

export function localeValue(value, locale) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[locale] ?? (locale === 'zh-CN' ? value.zh : null) ?? value.en ?? null
  }
  return value ?? null
}

export function normalizeRoute(route) {
  if (!route) return null
  if (/^https?:\/\//.test(route)) return route
  const withLeadingSlash = route.startsWith('/') ? route : `/${route}`
  if (/\.[a-z0-9]+$/i.test(withLeadingSlash)) return withLeadingSlash
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

export function absoluteUrl(base, route) {
  if (!route) return null
  if (/^https?:\/\//.test(route)) return route
  const baseUrl = new URL(String(base).replace(/\/$/, ''))
  const normalized = normalizeRoute(route)
  if (baseUrl.pathname !== '/' && normalized.startsWith(`${baseUrl.pathname.replace(/\/$/, '')}/`)) {
    return `${baseUrl.origin}${normalized}`
  }
  return `${baseUrl.href.replace(/\/$/, '')}${normalized}`
}

export function resolveInside(root, relativePath) {
  const resolvedRoot = path.resolve(root)
  const resolved = path.resolve(resolvedRoot, relativePath)
  if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`Path escapes repository: ${relativePath}`)
  }
  return resolved
}

export function loadSourceRegistry(root) {
  const file = path.join(root, 'source-registry.yml')
  const document = readYaml(file, { sources: [] })
  if (!Array.isArray(document.sources)) throw new Error(`${file} must contain a sources list.`)
  return document.sources
}

export function resolveSourceRoot(root, source, localSources = false) {
  const relative = localSources ? source.local_path : source.path
  return relative ? path.resolve(root, relative) : null
}

export function fileHash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
}

export function bodyImageTargets(body) {
  const matches = []
  const re = /!\[([^\]]*)\]\(\s*<?([^)>\s]+)>?(?:\s+"[^"]*")?\s*\)/g
  let match
  while ((match = re.exec(body)) !== null) {
    if (!/^(?:https?:|data:|\/|#)/i.test(match[2])) matches.push(match[2])
  }
  return matches
}

export function replaceContentLinks(body, links, locale) {
  return body.replace(/\]\(\s*content:([a-z0-9]+(?:-[a-z0-9]+)*)(?:\s+"[^"]*")?\s*\)/g, (full, id) => {
    const target = links[id]?.[locale]
    return target ? `](${target})` : full
  })
}
