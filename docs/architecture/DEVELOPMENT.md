# Development Commands and Release Workflow

Status: 2026-08-24

This file records the explicit local preview commands for each repository and
the controlled book-to-site update workflow (plan §15 Phase 5).

## Local preview and build commands

| Repository | Preview | Production build |
| --- | --- | --- |
| Personal site (`site-source`) | `npm run server` (http://localhost:4000) | `npm run build` (aggregate + `hexo generate`) |
| Coding-with-Agents | `npm run serve` (VitePress dev) | `npm run build` (VitePress) |
| Coding-with-Agents (legacy) | `npm run serve:honkit` | `npm run build:honkit` |
| MachineLearning | `npm run serve` (VitePress dev) | `npm run build` (VitePress + legacy redirects) |
| MachineLearning (legacy) | `npm run serve:mdbook` | `npm run build:mdbook` |
| ComputerScience | `npm run docs:dev` | `npm run docs:build` |
| Coding-Interview-Questions | `npm run docs:dev` | `npm run docs:build` |

A clean checkout of the personal site reproduces the full build:

```bash
git clone -b source https://github.com/XinheLIU/XinheLIU.github.io.git site-source
cd site-source
git submodule update --init --recursive
npm ci
npm run build
```

The same steps run in `.github/workflows/ci.yml` (audit baseline gate + build).

## Content audit

```bash
node tools/audit-content.mjs                          # report
node tools/audit-content.mjs --json /tmp/a.json       # machine-readable
node tools/audit-content.mjs --check-baseline docs/architecture/audit-report.json   # CI gate
```

The baseline gate fails when a new error/warning appears or an existing
finding worsens; fixed findings always pass. When a violation is intentionally
accepted, regenerate the baseline:

```bash
node tools/audit-content.mjs --json docs/architecture/audit-report.json
# review CONTENT-AUDIT-REPORT.md and commit both
```

## Controlled book-to-site update workflow

Books publish independently. The personal site moves to a newer book version
only through this explicit, reviewable operation:

```bash
# 1. In the book repository: build, deploy, and select a stable commit/release.
# 2. In site-source:
node tools/update-source.mjs Coding-with-Agents <commit-or-tag>
git diff sources/Coding-with-Agents          # review the pin change
git add sources/Coding-with-Agents && git commit -m "chore: pin Coding-with-Agents at <sha>"
git push origin source                       # site CI validates + deploys
```

Properties:

- A submodule pin records an exact commit; book development never silently
  changes the personal site.
- The site build reads only the public content contract (collection manifests
  and the paths they declare), never book internals or generated output.
- No cross-repository automation exists yet: per the plan, automation is added
  only after this manual workflow has been used several times.

## Remaining Phase 5 follow-ups

- Per-book CI copies of the audit rules (each book validating its own content
  before deployment).
- Conversion of legacy `{% mermaid %}` tags in site posts to portable fenced
  blocks: blocked until `themes/xinhe-site/scripts/mermaid-fence.js` (currently
  uncommitted work) is committed, because a clean checkout depends on that
  filter to render fenced Mermaid in posts.
- MachineLearning Pages source switch (repo setting: GitHub Actions).
