// Adoption mechanics: copy a loose draft into canonical content with contract
// frontmatter, copy its local assets, and never touch a publication manifest.
import fs from 'node:fs'
import path from 'node:path'
import {
  atomicWrite, renderMarkdown, resolveInside, today,
} from './lib/content-system.mjs'
import {
  adoptionPlan, adoptionTarget, manifestIds, planAssets, wordCount,
} from './lib/drafts.mjs'

export function formatDrafts(drafts) {
  if (!drafts.length) return 'No drafts found.'
  const headers = ['REPO', 'ID', 'LOCALE', 'REASON', 'UPDATED', 'WORDS', 'PATH']
  const rows = drafts.map((draft) => [
    draft.repo, draft.id, draft.locale, draft.reason, draft.updated || '-',
    draft.empty ? 'empty' : String(draft.words), draft.path,
  ])
  const widths = headers.map((header, index) => Math.max(header.length, ...rows.map((row) => row[index].length)))
  return [headers, ...rows].map((row) => row.map((cell, index) => cell.padEnd(widths[index])).join('  ').trimEnd()).join('\n')
}

export function adopt({ repo, repoRoot, file, flags, manifestIdList = manifestIds(repoRoot) }) {
  const plan = adoptionPlan({ repo, root: repoRoot, file, existingIds: manifestIdList, date: today() })
  if (flags.id) { plan.frontmatter.id = flags.id; plan.id = flags.id }
  if (flags.title) { plan.frontmatter.title = flags.title; plan.title = flags.title }
  if (flags.locale) {
    if (!['en', 'zh-CN'].includes(flags.locale)) throw new Error('Locale must be en or zh-CN.')
    plan.frontmatter.locale = flags.locale; plan.locale = flags.locale
  }
  const target = adoptionTarget({ repo, id: plan.id, locale: plan.locale, section: flags.section })
  const targetAbsolute = resolveInside(repoRoot, target)
  if (fs.existsSync(targetAbsolute)) plan.blockers.push(`target already exists: ${target}`)
  const assets = planAssets(plan.body, plan.absolute)
  plan.blockers.push(...assets.blockers)

  console.log(`Adopt ${repo}/${file} → ${target}`)
  console.log(`  id ${plan.id} · locale ${plan.locale} · status draft · ${wordCount(plan.body)} words`)
  for (const warning of plan.warnings) console.log(`  warning: ${warning}`)
  for (const blocker of plan.blockers) console.log(`  blocker: ${blocker}`)
  if (plan.blockers.length) throw new Error(`Cannot adopt ${file}: ${plan.blockers.join('; ')}`)
  if (assets.assets.length) console.log(`  assets: ${assets.assets.map((asset) => asset.name).join(', ')}`)
  if (flags['dry-run']) return { target, plan, applied: false }

  const content = renderMarkdown(plan.frontmatter, assets.body)
  const created = []
  try {
    atomicWrite(targetAbsolute, content)
    created.push(targetAbsolute)
    if (assets.assets.length) {
      const directory = path.resolve(path.dirname(targetAbsolute), 'assets')
      fs.mkdirSync(directory, { recursive: true })
      for (const asset of assets.assets) {
        const destination = path.join(directory, asset.name)
        fs.copyFileSync(asset.from, destination)
        created.push(destination)
      }
    }
    if (flags['remove-source']) {
      if (fs.readFileSync(plan.absolute, 'utf8') !== plan.original) throw new Error('Source changed during adoption; keeping it.')
      fs.rmSync(plan.absolute)
    }
  } catch (error) {
    for (const file of created.reverse()) fs.rmSync(file, { force: true })
    throw error
  }
  console.log(`Adopted. ${repo === 'site-source' ? `Run ./write publish ${plan.id} to publish it.` : 'Add it to collections/book.yml when it belongs in the book.'}`)
  return { target, plan, applied: true }
}
