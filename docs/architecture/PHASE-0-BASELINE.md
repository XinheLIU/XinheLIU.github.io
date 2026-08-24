# Phase 0 Baseline Report

Date: 2026-08-24

Status: Complete

Companion to `WRITING-ARCHITECTURE-PLAN.md`. This file records the state of every
repository as observed during Phase 0 (Repository Recovery and Baseline). It is
the reference for uncommitted work, source/generated directory identification,
public routes, and build baselines before any migration begins.

## 1. Repository Recovery

### site-source worktree repair

- `site-source` is a Git worktree of `XinheLIU.github.io` checked out on the
  `source` branch.
- Symptom: its `.git` pointer referenced the stale path
  `/Users/xhl/GitHub/site-infrastructure/XinheLIU.github.io/.git/worktrees/site-source`,
  which no longer exists.
- Fix: ran `git worktree repair /Users/xhl/GitHub/writing/site-source` from the
  main worktree. `git worktree list` now reports:

  ```text
  /Users/xhl/GitHub/writing/XinheLIU.github.io  85b61b1 [main]
  /Users/xhl/GitHub/writing/site-source         2faf5b9 [source]
  ```

- After repair, `site-source` reports "up to date with origin/source" at commit
  2faf5b9 ("Install OpenSpec slash commands and skills for Claude Code and opencode").

### MachineLearning object recovery

- The local clone is shallow (boundary f5205f5) and was missing the object
  referenced by `HEAD` (`refs/heads/master` -> cdbe1995...).
- Fix: `git fetch origin master` (plus fetches of the remote dependabot
  branches, one of which was a stale remote-tracking ref to a missing object).
- Verified: `git cat-file -t cdbe199540d70990f1ea951f1374d5fbac76d8c0` -> `commit`;
  `git fetch origin` now completes cleanly.
- History older than f5205f5 ("Create ReadMe.md") is still absent locally
  (shallow boundary). Do not reconstruct history manually; deepen the clone
  only if a later phase needs it.

### Workspace root

- `/Users/xhl/GitHub/writing` is not a Git repository. The plan file therefore
  has a tracked canonical home in `site-source/docs/architecture/` on the
  `source` branch (see below).

## 2. Uncommitted Work Inventory (preserved, untouched)

Rule 10 of the plan: do not commit, stash, or discard current uncommitted work
as an implicit migration step. Nothing below was modified by Phase 0. Build
baselines used only ignored/generated directories.

### site-source (branch source)

- Modified: `CLAUDE.md`
- Untracked:
  - `.vscode/extensions.json`
  - `draft/Enterprise-AI-Architect/`
  - `draft/Langchain-Change/`
  - `draft/first-principles-time-management.md`
  - `draft/production-tools-recommendation/`
  - `draft/time-management-blog.md`
  - `themes/xinhe-site/scripts/mermaid-fence.js`

### Coding-with-Agents (branch main)

- Branch is ahead of `origin/main` by 2 commits (unpushed local commits).
- Modified: `README.md`, `ROADMAP.md`, `book/en/03-power-user/README.md`,
  `book/en/04-team/code-review.md`, `book/en/RESOURCEs.md`, `book/en/SUMMARY.md`,
  `book/zh-cn/03-power-user/README.md`, `book/zh-cn/05-architect/README.md`,
  `book/zh-cn/README.md`
- Deleted (working tree): files under `.agents/skills/`, `.claude/agents/`,
  `.claude/skills/` (skill/agent definitions removed but not staged).
- Untracked: none significant.

### ComputerScience (branch main)

- Modified: `.github/workflows/deploy.yml`, `.vitepress/book.ts`,
  `.vitepress/theme/BookBreadcrumbs.vue`, `.vitepress/theme/LanguageSwitch.vue`,
  `.vitepress/theme/ui-language.ts`, `package.json`,
  `zh/book/01-foundations/01-environment-and-tools/git/git.md`
- Untracked: `.claude/`, `.learning-manifest.json`, `.synapse-cache.json`,
  `.vitepress/route-path.ts`, `design-system/`, `tests/`,
  `zh/book/01-foundations/01-environment-and-tools/git/LazyGit.png`

### MachineLearning (branch master)

- Modified: `.gitignore`, `README.md`
- Deleted (working tree): the entire legacy Jekyll site under `docs/`
  (~80 files: posts, layouts, includes, assets).
- Untracked: `.claude/`, `CLAUDE.md`, `LICENSE.md`, `book/`, `raw/`

### Coding-Interview-Questions

- `master` worktree: clean, up to date with `origin/master` (c6e1357).
- Secondary worktree `Coding-Interview-Questions.worktrees/local-preview-launch`
  on branch `agents/local-preview-launch` (496917b): clean.

### XinheLIU.github.io main worktree

- On `main`, up to date with `origin/main` (85b61b1); only untracked `.DS_Store`.

## 3. Source vs Generated Directories

| Repository | Canonical source | Generated output | Notes |
| --- | --- | --- | --- |
| site-source | `source/` (posts, pages, data), `themes/` | `public/`, `.deploy_git/`, `db.json` | `draft/` holds untracked drafts; `public/` and `.deploy*/` are gitignored |
| Coding-with-Agents | `book/` (Honkit root; `book/en`, `book/zh-cn`) | `book/_book/` | `book/_book/` gitignored |
| ComputerScience | `en/book/`, `zh/book/`, `.vitepress/` (theme/config) | `.vitepress/dist/`, `.vitepress/cache/` | dist/cache gitignored |
| Coding-Interview-Questions | `book/`, `problems/`, `.vitepress/` | `.vitepress/dist/`, `.vitepress/cache/`, `.vitepress/.temp/`, derived `sidebar-*.json`, `problem-graph.json` | dist/cache gitignored |
| MachineLearning | `book/src/` (mdBook source root), `raw/` (drafts, untracked) | `book/_book/` (mdBook output) | legacy Jekyll `docs/` deleted in working tree (uncommitted); `book/_book/` is NOT yet gitignored |

## 4. Public URL and Route Inventory

All roots verified HTTP 200 on 2026-08-24.

| Site | Public URL | Renderer | Deploy |
| --- | --- | --- | --- |
| Personal site | https://xinheliu.github.io | Hexo 7.3.0 | local `hexo deploy` from `source` branch to `main` branch |
| Coding with Agents | https://xinheliu.github.io/Coding-with-Agents/ | Honkit | GitHub Actions Pages from `main`, artifact `book/_book` |
| Computer Science | https://xinheliu.github.io/ComputerScience/ | VitePress | GitHub Actions Pages from `main`, artifact `.vitepress/dist` |
| Coding Interview Questions | https://xinheliu.github.io/Coding-Interview-Questions/ | VitePress | GitHub Actions Pages from `master`, artifact `.vitepress/dist` |
| Machine Learning | https://xinheliu.github.io/MachineLearning/ | mdBook (`book/book.toml` site-url `/MachineLearning/`) | none configured in repo (no workflows, no gh-pages branch) |

Personal-site route prefixes observed in `public/` (post build): `/`,
`/AB-Test/*`, `/ads/*`, `/archives*`, `/books/*`, `/categories*`, `/causal/*`,
`/contact/`, `/en/*`, `/home-zh/`, `/library*`, `/page/*`, `/projects*`,
`/recsys/*`, `/slides/*`, `/tags*`, `/technical-notes*`, `/writing*`,
plus `/about*`, `/404.html`. Post permalink pattern: `/:year/:month/:day/:title/`.

The full snapshot is reproducible: `cd site-source && npm run build` then list
`public/**/index.html`.

## 5. Production Build Baselines

| Repository | Command | Result | Details |
| --- | --- | --- | --- |
| site-source | `npm run clean` + `npm run build` (hexo clean + generate) | PASS | 380 files generated |
| Coding-with-Agents | `npm run build` (honkit build ./book) | PASS | 28 en pages, 31 zh-cn pages |
| ComputerScience | `npm run docs:build` (validate + vitepress build + redirects) | FAIL at validation gate | `scripts/validate-book.mjs` exits 1: 34 missing zh localized section files, 34 unlisted en files. `npx vitepress build` alone PASSES (5.79s). Failure reflects the current uncommitted stage restructure; owner must complete it before Phase 3. |
| Coding-Interview-Questions | `npm run docs:build` | PASS | build complete in ~11s |
| MachineLearning | `mdbook build book` (mdbook v0.5.4, installed to `/tmp/cargo-mdbook/bin/mdbook` during Phase 0) | PASS | HTML written to `book/_book` |

## 6. Recovery Decisions

1. **Plan canonical home**: this directory —
   `site-source/docs/architecture/` on the `source` branch. The plan lives at
   `WRITING-ARCHITECTURE-PLAN.md` here; no second editable copy is kept at the
   workspace root.
2. **MachineLearning source root**: `book/src` is the mdBook source root and is
   complete (14 chapters, all `SUMMARY.md` targets exist, 26 Markdown files).
   The legacy `docs/` Jekyll site deletion remains preserved uncommitted work
   and is not committed or reverted during Phase 0. Its content is still
   recoverable from Git history (HEAD tree still contains `docs/`).
3. **ComputerScience validation failure**: recorded, not fixed. Fixing it would
   require committing or changing the owner's in-progress restructure, which
   Phase 0 must not do.
4. **MachineLearning deployment**: no deploy pipeline exists in the repo.
   Establishing one belongs to Phase 3; until then the live URL serves whatever
   GitHub Pages currently has.
5. **mdBook toolchain**: installed to `/tmp/cargo-mdbook/bin/mdbook` (outside
   repositories); reinstall with `cargo install mdbook` when needed. Add
   `book/_book/` to the ML `.gitignore` in a later isolated change.

## 7. Phase 0 Verification Checklist

- [x] Every source repository can be checked out independently.
- [x] Healthy repositories run their current production build (4 of 5;
      ComputerScience validation gate fails — see section 5).
- [x] Missing Machine Learning source content has an explicit recovery decision.
- [x] A route inventory exists before migrations begin.
- [x] The `source` and `main` branch responsibilities are documented
      (plan §11) and remain separate (unrelated histories, never merged).
