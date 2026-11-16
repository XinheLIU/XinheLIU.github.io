import assert from 'node:assert/strict'
import test from 'node:test'
import { REPOSITORIES } from '../tools/lib/repositories.mjs'
import { inspectRepo, planRelease } from '../tools/release.mjs'

test('site release cleans then deploys', () => {
  const plan = planRelease('site-source', REPOSITORIES['site-source'], { isGit: true, dirty: 3, ahead: null })
  assert.equal(plan.blockers.length, 0)
  assert.deepEqual(plan.steps.map((step) => step.args.join(' ')), ['run clean', 'run deploy'])
})

test('a book that is level with its upstream has nothing to ship', () => {
  const plan = planRelease('MachineLearning', REPOSITORIES.MachineLearning, { isGit: true, dirty: 0, ahead: 0, behind: 0, branch: 'master' })
  assert.match(plan.blockers.join(' '), /nothing to ship/)
})

test('dirty book worktrees are refused', () => {
  const plan = planRelease('Coding-with-Agents', REPOSITORIES['Coding-with-Agents'], { isGit: true, dirty: 2, ahead: 1, branch: 'main' })
  assert.match(plan.blockers.join(' '), /uncommitted/)
})

test('book push is planned when clean and ahead', () => {
  const plan = planRelease('Coding-with-Agents', REPOSITORIES['Coding-with-Agents'], { isGit: true, dirty: 0, ahead: 2, branch: 'main' })
  assert.deepEqual(plan.blockers, [])
  assert.deepEqual(plan.steps[0].args, ['push', 'origin', 'main'])
})

test('repositories without a release path are blocked', () => {
  const plan = planRelease('Agent-Building-Handbook', REPOSITORIES['Agent-Building-Handbook'], { isGit: true, dirty: 0, ahead: 1 })
  assert.match(plan.blockers.join(' '), /pre-publication/)
})

test('a missing checkout is reported, not thrown', () => {
  const state = inspectRepo('/nonexistent/writing/repo')
  assert.equal(state.exists, false)
  assert.match(state.blockers.join(' '), /missing/)
})
