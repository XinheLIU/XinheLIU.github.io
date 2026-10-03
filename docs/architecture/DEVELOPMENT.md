# Development Commands and Release Workflow

Status: 2026-08-24

Last updated: 2026-10-03

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

## Writing activity and importing old posts

The home page counts essays, notes, and book chapters from their explicit
creation and revision dates. It does not count Git commits or filesystem
modification times. The initial view shows six months; the previous/next
controls browse the complete retained history.

When importing a legacy Hexo post, preserve its original date in frontmatter:

```yaml
date: 2023-05-12 10:00:00
updated: 2024-01-10 10:00:00
```

For portable content and book chapters, use the existing content contract:

```yaml
created: 2023-05-12
updated: 2024-01-10
```

- `created` takes precedence over legacy `date`. Set it to the original
  creation date, even if the post is being imported today.
- An explicit `last_updated` takes precedence over `updated` for legacy
  posts. Omit both when no genuine revision date is known; do not put the
  import date there. Equal creation/update dates count once.
- `published_at` in a publication manifest controls publication on the
  site, not the original writing date. Keep these distinct during migration.
- Translation pairs use the same stable `id`. Existing legacy posts grouped
  as `<article>/en.md` and `<article>/zh-CN.md` are paired automatically.
  A chapter listed in both book and blog manifests counts once.
- Rebuild with `npm run build` after importing or correcting dates. The
  history is regenerated from source metadata with no six-month truncation.
  Old dates appear in their historical window, not as activity today.
- Book activity reads the pinned, published manifests. Chapters need to join
  those manifests before they appear; a metadata-only placeholder without a
  source date contributes no invented writing activity.

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
