# Changelog

Last updated: 2026-07-19

Versions track notable milestones in this site's source, starting from the
switch off the stock Hexo theme. Dates are commit dates; "Unreleased" is the
working tree ahead of the last commit.

## v0.5 — Library restructuring + editorial redesign (2026-07-19, unreleased)

- Replace the `Writing` / `Technical Notes` split with a single `Library`
  destination. `source/_data/works.yml` becomes the flat source of truth for
  every work (article, note, slide deck, book, video, audio); `books.yml` is
  retired.
- Add `themes/xinhe-site/scripts/work-manifest.js` (`getWork`,
  `getRelatedWorks`, `getAllWorks`) and `work-validator.js` (build-time
  manifest integrity check).
- Add a `related-works` partial ("Also available as") rendered on article/note
  pages and hardcoded into standalone slide decks, replacing the old
  primary-output/format-rail model with flat peer links.
- `/writing/`, `/writing-zh/`, `/technical-notes/`, `/technical-notes-zh/`
  become compatibility redirects to `/library/` / `/library-zh/` via a new
  generic `redirect` layout.
- Reskin the light theme to a warm cream canvas with a coral accent (Anthropic
  editorial palette) and self-hosted serif display type — Cormorant Garamond
  (EN light), Source Serif 4 (EN dark), Noto Serif SC (ZH) — replacing the
  Apple-system-font light theme. Dark theme keeps its existing palette.
- Rewrite the bilingual 404 page inside the design system (was a standalone
  Materialize-style page); add `source/404.md`.
- Replace the post photo-banner header with a quiet typographic header
  (eyebrow / serif title / mono meta row); drop the auto-assigned
  `theme.featureImages` banner mechanism.
- Redesign prev/next as text cards (was thumbnail cards); add filter/search
  empty states, `:active` press feedback, and a `prefers-reduced-motion`
  guard.
- Inline the shared header/search/back-top icons as SVG; add `og:`/`twitter:`
  meta tags.
- Document both redesigns: `docs/exec-plans/active/multi-format-library.md`
  (living plan, formalized as the OpenSpec change
  `openspec/changes/archive/2026-07-19-add-library/`) and
  `docs/exec-plans/completed/site-ui-interaction-redesign.md`.

## v0.4 — Publish Palantir ontology article and decks (2026-07-19)

- Publish the bilingual "Deconstructing Palantir Ontology" article and its two
  companion slide decks.
- Add the initial `multi-format-library` exec plan (nested work/output model,
  later revised in v0.5).

## v0.3 — AI-native-org draft and content restructuring (2026-06-21)

- Move posts and assets into per-language `en/` / `zh-CN/` folders.
- Add the AI-native-org draft materials.
- Introduce `source/_data/books.yml` as the first structured work manifest.

## v0.2 — GitHub-style homepage redesign (2026-06-04)

- Replace the oversized hero + decision-loop panel with a compact profile-hero
  partial (avatar, bio, stats, 52-week contribution graph colored by post
  date).
- Set dark mode as the default theme.
- Replace the X logo with a taichi SVG monogram; unify the About page hero
  layout with other sub-pages.

## v0.1 — Move off the stock Hexo theme (2026-05-31)

- Replace the default Hexo theme with the custom `xinhe-site` theme.
- Add `design/DESIGN.md` as the site's design system source of truth.
- Add `AGENTS.md` / `CLAUDE.md` project guidance for coding agents.
