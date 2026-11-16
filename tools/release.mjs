// Release planning and execution: inspect a repository's git state, print the
// exact next deployment step, and run it only when explicitly confirmed.
// Never stages, commits, advances pins or touches submodules.
import fs from 'node:fs'
import { spawnSync } from 'node:child_process'

function git(root, args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' })
  if (result.status !== 0) return null
  return result.stdout.trim()
}

export function inspectRepo(root) {
  if (!fs.existsSync(root)) return { exists: false, isGit: false, blockers: ['checkout is missing'] }
  if (!git(root, ['rev-parse', '--is-inside-work-tree'])) {
    return { exists: true, isGit: false, blockers: ['no git repository; see Agent-Building-Handbook/AGENTS.md for the remote setup'] }
  }
  const branch = git(root, ['branch', '--show-current']) || null
  const remote = git(root, ['remote', 'get-url', 'origin']) || null
  const status = (git(root, ['status', '--porcelain']) || '').split('\n').filter(Boolean)
  const counts = git(root, ['rev-list', '--left-right', '--count', '@{u}...HEAD'])
  const [behind, ahead] = counts ? counts.split(/\s+/).map(Number) : [null, null]
  return {
    exists: true, isGit: true, branch, remote, dirty: status.length,
    dirtyPaths: status.slice(0, 5), ahead, behind,
    blockers: remote ? [] : ['no origin remote configured'],
  }
}

export function planRelease(name, config, state) {
  if (!state.isGit) return { steps: [], blockers: state.blockers }
  if (!config.release) return { steps: [], blockers: ['pre-publication repository: no release path yet'] }
  if (config.release === 'deploy') {
    return {
      steps: [
        { label: 'Clean generated output and cache', command: 'npm', args: ['run', 'clean'] },
        { label: 'Aggregate and deploy to the main branch', command: 'npm', args: ['run', 'deploy'] },
      ],
      blockers: [],
    }
  }
  const blockers = []
  if (state.dirty) blockers.push(`${state.dirty} uncommitted change(s); commit them or pass --allow-dirty`)
  if (state.ahead === 0) blockers.push('nothing to ship (branch is level with its upstream)')
  if (state.ahead === null) blockers.push('branch has no upstream; push it once with -u to track it')
  return {
    steps: [{ label: `Push ${state.branch} to origin`, command: 'git', args: ['push', 'origin', state.branch] }],
    blockers,
  }
}

export function printState(name, state) {
  if (!state.isGit) { console.log(`${name}: ${state.blockers.join('; ')}`); return }
  const tracking = state.ahead === null ? 'no upstream' : `ahead ${state.ahead}, behind ${state.behind}`
  console.log(`${name}: branch ${state.branch}, remote ${state.remote ?? 'none'}, ${tracking}, ${state.dirty} worktree change(s)`)
  for (const line of state.dirtyPaths) console.log(`  ${line}`)
}
