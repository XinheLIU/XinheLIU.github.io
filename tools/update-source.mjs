#!/usr/bin/env node
// Controlled book-to-site update: moves a pinned book source to a newer commit,
// rebuilds the projection, and prints a reviewable summary of what changed.
// Usage: node tools/update-source.mjs <repo-subdir> <ref>
//
// The personal site never follows a book automatically. Run this explicitly,
// review the output, then commit the submodule pin change.
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const [repo, ref] = process.argv.slice(2)
if (!repo || !ref) {
  console.error('usage: node tools/update-source.mjs <repo-subdir> <ref>')
  process.exit(2)
}
const ROOT = process.cwd()
const sub = path.join(ROOT, 'sources', repo)
if (!fs.existsSync(path.join(sub, '.git'))) {
  console.error(`submodule sources/${repo} is not initialized`)
  process.exit(1)
}
const run = (cmd, cwd) => execSync(cmd, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] })

const before = run('git rev-parse HEAD', sub).trim()
console.log(`fetching sources/${repo} ...`)
run('git fetch origin --prune', sub)
const target = run(`git rev-parse ${ref}^{commit}`, sub).trim()
console.log(`moving sources/${repo} from ${before.slice(0, 8)} to ${target.slice(0, 8)}`)
run(`git checkout --detach ${target}`, sub)
console.log(`book commits included:\n${run(`git log --oneline ${before}..${target}`, sub)}`)

console.log('rebuilding projection ...')
run('node tools/aggregate-series.mjs', ROOT)
run('npx hexo generate', ROOT)

console.log('\nReview the submodule pin change with: git diff sources/' + repo)
console.log('Site pages now reflect the new book content (public/ is gitignored).')
