# Site UI & Interaction Polish Plan

Last updated: 2026-07-20

**Status: COMPLETE.** All four phases plus item 9b are implemented on the live theme (verified
via clean rebuilds and dev-server checks throughout — see the Status section below for the
per-phase detail). Moved here from `docs/exec-plans/active/`. Nothing has been committed to git.

## Status

Direction **approved** via static previews — English (`site-ui-sample.html`), Chinese
(`site-ui-sample-zh.html`), and post header (`site-ui-sample-post.html`), all in both themes:
warm-cream + coral light theme, unchanged dark theme, serif display type (Cormorant Garamond
EN-light / Source Serif 4 EN-dark / Noto Serif SC ZH), and the quiet typographic post header
(item 9b) with the drop-cap flourish kept.

Shipped to the live theme so far:

- **Phase 1 (P0):** items 1–5 — `--radius-xl`, focus-visible rings, theme-FOUC head script,
  viewport fix, and the rewritten bilingual 404 (+ `source/404.md`).
- **Item 9b (post header):** photo banner → typographic header; prev/next thumbnails → text cards.
- **Phase 2:** items 6, 6b, 7 — light theme reskinned to cream + coral; display webfonts loaded
  (Cormorant Garamond / Source Serif 4 / Noto Serif SC, per-language via Google Fonts CDN);
  `.page-title` / `.section-head h2` set to the serif display face; light-only coral primary
  button; og:/twitter: meta added. Dark theme now loads Source Serif 4 (was silently falling to
  Georgia).
- **Phase 3:** items 8, 9, 10, 11 — filter/search empty state (`writing.ejs` + JS toggle);
  removed the fake enterprise-ai placeholder row; `:active` press feedback on buttons, filter
  chips, and utility circles; global `prefers-reduced-motion` guard.
- **Phase 4:** items 12, 13, 14 — inlined the shared header/search/back-top icons as SVG;
  FontAwesome conditionally skipped on the FA-free layouts (home/library/projects/about),
  verified via clean rebuild; `100dvh` fallback; tabular-nums on metrics/stats/dates. AOS
  found to be genuinely in use (not dead) and left in place — see item 12's correction note.

All four phases are now shipped on the live theme. Default theme stays dark, so the cream
reskin shows after toggling to light. Nothing has been committed to git.

## Context

The site already runs a mature, intentional design system (`design/DESIGN.md` +
`themes/xinhe-site/source/css/xinhe-site.css`, 1743 lines). This is **not** a
redesign — it's a polish pass. The design direction (calm, technical, archive-forward,
minimal chrome, one accent) is correct and stays. Every item below either fixes a
concrete bug, closes a gap between the spec and the shipped implementation, or
finishes an unfinished state — without adding decorative weight the design deliberately avoids.

Scope guardrails (do not violate — these are design intent, not oversights):

- No flashy gradients, blobs, or oversized hero sections.
- Keep one accent color per theme. Keep motion quiet.
- Keep JS framework-free and GitHub Pages-safe.
- Work within Hexo + `xinhe-site`. No framework/library migration.
- Touch only what each item names. Match existing token/naming style.

## Findings (verified against the codebase)

Priority key: **P0** correctness/accessibility bug · **P1** spec-vs-impl gap, high impact ·
**P2** finishing polish.

### P0 — Bugs & accessibility

1. **Undefined `--radius-xl` breaks the About-hero avatar.**
   `xinhe-site.css:985` sets `border-radius: var(--radius-xl)` but `--radius-xl` is
   never defined (only `sm/md/lg/pill` exist). With no fallback the declaration is
   invalid → the avatar renders as a hard `0`-radius square. *Fix:* define `--radius-xl`
   (e.g. `20px`) in `:root`, or use `var(--radius-lg)`.

2. **No keyboard focus states on interactive controls.**
   Only inputs get `:focus` (`xinhe-site.css:1259`). Nav links, `.btn`, `.filter-button`,
   `.theme-toggle`, `.lang-switch`, `.nav-utility`, archive-row links, and contribution
   cells have **no visible focus indicator** — keyboard users can't see where they are.
   The `--focus-ring` token already exists; it's just not applied. *Fix:* add a single
   `:focus-visible` rule set reusing `--focus-ring` across these controls.

3. **Theme flash on every cold load (FOUC).**
   `xinhe-site.js` applies the stored/default `dark` theme only after the script runs,
   but `:root` defaults to light tokens. First paint is light, then it snaps to dark.
   *Fix:* inline a tiny blocking script in `head.ejs` (before stylesheets) that reads
   `localStorage['xinhe-site-theme']` and sets `data-theme` on `<html>` immediately.
   Keep the existing JS as the click handler.

4. **`user-scalable=no` blocks pinch-zoom.**
   `head.ejs:72`. Accessibility anti-pattern. *Fix:* drop `user-scalable=no` (and any
   `maximum-scale`), keep `width=device-width, initial-scale=1.0`.

5. **404 page is unbranded legacy Matery.**
   `layout/404.ejs` still uses `.bg-cover`/`.about-cover`, a day-of-week jsDelivr banner,
   inline `color:blue`, Chinese-only copy, and `target="_blank"` on the "return home"
   link (opens home in a new tab — wrong). It ignores the entire new design system and
   is a jarring dead-end. *Fix:* rewrite using the site shell + tokens (`hero-narrow`,
   `page-title`, `lead`, `.btn`), bilingual copy, same-tab home link, and a link to
   Writing/Search so it's not a dead end.

### P1 — Spec-vs-implementation gaps

6. **Distinctive typography only renders on Apple devices.**
   `DESIGN.md` names licensed/Apple-only display faces, but **no web font is loaded** — only
   icon fonts. On Windows/Android/Linux the stack falls straight to `system-ui`, so the
   display voice is invisible to most non-Mac visitors, and the dark serif silently becomes
   Georgia. *Fix (decided — Q1: self-host):* ship both display faces as `woff2` with
   `font-display: swap` + `<link rel=preload>`:
   - Light (cream): **Cormorant Garamond** 500–600, `-0.02em` — OSS stand-in for Anthropic's
     Copernicus / Tiempos Headline editorial serif (English pages only).
   - Dark: **Source Serif 4** (unchanged look).
   - Chinese pages (both themes): **Noto Serif SC** (思源宋体) headings with **Source Serif 4**
     leading the Latin glyphs (sibling family — coherent); body on the system sans stack
     (PingFang SC / Microsoft YaHei / Noto Sans SC). Not Songti (no true bold → faux-bold is
     ugly) and not Cormorant over CJK (contrast mismatch). CJK: letter-spacing 0, body lh 1.8.
   Body stays on the system sans stack (fast, native, humanist). Only the display face is loaded.

6b. **Light theme reskin — warm cream + coral (Anthropic-inspired).**  *(New — supersedes the old Apple-white light theme.)*
   Replace the light `:root` tokens with the cream/coral/warm-ink set now recorded in
   `DESIGN.md` (canvas `#faf9f5`, card `#efe9de`, ink `#141413`, coral `#cc785c`). The edit
   itself is token-only (`xinhe-site.css:1–56`), but the accent flip (blue→coral) **cascades**
   to everything referencing `--accent`: links, `.filter-button.is-active`, focus rings,
   `.post-preview` gradients, `.contribution-cell` levels 1/3, `.chip-teal`, the progress bar.
   *Fix:* recolor the light tokens; retint `--focus-ring` to coral alpha; make `.btn-primary`
   coral **in light theme only** (theme-scoped override — dark keeps its ink fill, per "dark is
   fine"); re-check the coral-vs-green contribution mix still reads. In this palette cards are
   *darker* than the canvas — confirm `--surface-warm` panels separate cleanly from `--bg`.
   Dark theme tokens are untouched.

7. **No social/OpenGraph meta — shared links have no preview.**
   `head.ejs` emits `title`/`description`/`keywords` but zero `og:*` / `twitter:*` tags
   and no `og:image`. Any share (Slack, WeChat, X, LinkedIn) renders a bare URL. *Fix:*
   add `og:title/description/type/url/image` + `twitter:card=summary_large_image` in
   `head.ejs`, deriving from the same `pageTitle`/`description` vars already computed.
   Add one default share image (reuse `profile.png` or a simple branded card).

8. **No empty state for search/filter.**
   `xinhe-site.js setupFilters()` hides non-matching rows; a zero-match query leaves a
   silent blank archive. *Fix:* render a small "No writing matches that filter/search"
   message (bilingual, styled like `.quiet-callout`) toggled when all items are hidden.

9. **Placeholder archive row reads as broken.**
   `writing.ejs:147` appends a hardcoded `enterprise-ai` row with no link, no date, and a
   fake preview after the real posts. It looks like a broken card. *Fix:* either remove it,
   or restyle as an explicit "reserved topic / coming soon" state that clearly isn't a post.

9b. **Post cover — replace the loud photo banner with a quiet typographic header.** *(New — from screenshot review. **DONE** — pulled forward from Phase 3.)*
   `post-cover.ejs` hash-assigns a random bright banner from `theme.featureImages[]` (or
   `page.img`) as a full-bleed `.bg-cover` photo with only a 12–28% dark overlay
   (`xinhe-site.css:1439`), which forces `.post-title` to white. The saturated stock photo
   (e.g. the red railway) is exactly the "oversized hero / decorative chrome" the design
   rejects, and its brightness clashes with the cream/charcoal reading surface. The DB's
   content-first / editorial guidance (minimal chrome, serif headline, no loud imagery,
   distraction-free) says lead with type, not a photo.
   *Fix (recommended — Option A):* drop the photographic cover entirely. Render a calm header
   on the normal page background: eyebrow (topic cluster / category) → serif title in the
   display face (Cormorant / Noto Serif SC per lang, `--fg` ink — **not** white) → a mono meta
   row (date · reading time · tags as quiet `.chip` pills) → a thin hairline. Mirrors the
   `hero-narrow` pattern already used on Writing / Technical Notes, so post pages match the rest
   of the site. Remove the `theme.featureImages` hash-random assignment and the
   `.bg-cover` / `.post-cover` white-title overrides.
   *Optional (Option B):* if a post explicitly sets `page.img`, show it **below** the header as a
   contained, rounded, `--border-soft` image card (not full-bleed), toned down
   (`filter: saturate(.9)` + theme-tinted overlay) — never the auto-assigned stock banner.
   Prefer the post's own `post_preview_asset()` diagram over generic photography, matching the
   archive previews. Default (no `img`) = Option A, no image at all.
   Touches: `post-cover.ejs`, the `.bg-cover` / `.post-cover` / `post.css` rules, and retires
   `theme.featureImages` + the daily `/medias/banner/` mechanism (also used by the legacy 404 in
   item 5, so both retire together).
   *Shipped:* `post-cover.ejs` rewritten to `.post-hero` (eyebrow → serif title → mono meta +
   tag pills → hairline); duplicate tag/date block removed from `post-detail.ejs`; and
   `prev-next.ejs` rebuilt as text-only `.post-nav` cards (the prev/next thumbnails were the last
   `featureImages` usage on a post). A post page now carries zero stock photos.

### P2 — Finishing polish

10. **No active/pressed feedback.**
    Buttons and cards animate on `:hover` but nothing on `:active`. The design references
    physical press feedback. *Fix:* add `transform: translateY(1px)` / `scale(0.98)` on
    `:active` for `.btn`, `.filter-button`, and the utility circles.

11. **Reduced-motion guard is incomplete.**
    Only `.contribution-cell` honors `prefers-reduced-motion` (`xinhe-site.css:1148`).
    Hover lifts, button transforms, and smooth scroll aren't guarded. *Fix:* one global
    `@media (prefers-reduced-motion: reduce)` block neutralizing transforms/transitions
    and `scroll-behavior`.

12. **Legacy CSS/JS weight loaded on every page.** *(**DONE** — scoped to the safe subset.)*
    `main-style.ejs` loads Materialize, AOS, animate.css, lightgallery, and `matery.css`
    (2296 lines) before the 1743-line override layer — much of it only to be overridden
    with `!important`. FontAwesome's full `all.css` (7933 lines) loaded for ~2 icons
    (search, bars) that could be inline SVGs like the profile icons already are.
    This is exactly the redesign-plan's open cleanup item #4.
    *Shipped:* inlined the header search/hamburger icons, the mobile-nav search icon, the
    search-modal title icon, and the back-top arrow as inline SVG (`.icon-svg`) across
    `navigation.ejs` / `mobile-nav.ejs` / `search.ejs` / `back-top.ejs`. FontAwesome is now
    conditionally skipped in `main-style.ejs` for the layouts confirmed to carry zero `fa-`
    usage: home (`is_home()`, since the auto-generated `/` route has no `page.layout`),
    `home`, `library`, `projects`, `about` — verified via a clean rebuild across every EN/ZH
    variant (0 FA links, 0 broken icon refs).
    *Correction from the original finding:* AOS is **not** dead weight — it's actively used
    by the `category`/`tag`/`friends` layouts (still-linked taxonomy pages) and several
    comment-plugin partials, so it was **not** removed. Materialize and `matery.css` remain
    load-bearing for grid/modal/sidenav across the theme and were correctly left for the
    dedicated later pass per the Q2 light-touch decision.
    (Note: mid-implementation, an unrelated in-progress change consolidated the Writing +
    Technical Notes nav entries into a single "Library" destination — `writing.ejs` /
    `technical-notes.ejs` layouts are now orphaned. The FA-gating list above targets the
    live `library` layout, not the orphaned ones.)

13. **`min-height: 100vh` → `100dvh`.** *(**DONE**.)*
    `xinhe-site.css` — avoids the iOS Safari viewport jump. Kept the `100vh` line before it
    as a fallback for browsers without `dvh` support; the later declaration wins where supported.

14. **Tabular figures for data.** *(**DONE**.)*
    Added `font-variant-numeric: tabular-nums` to `.metric strong`, `.stat-item strong`, and
    `.archive-row .meta` so stats, metrics, and dates align on the mono stack.

## Execution order

Follow the skill's fix-priority (highest impact / lowest risk first). Each phase is
independently shippable; verify after each.

1. **Phase 1 — P0 correctness (items 1–5).** Small, contained, high user-visible value.
   `--radius-xl`, focus-visible, theme-FOUC head script, viewport, 404 rewrite.
2. **Phase 2 — Light-theme reskin + typography + meta (items 6, 6b, 7).** The warm-cream
   reskin, the self-hosted display faces (Cormorant Garamond / Source Serif 4), and the
   sharing fix. Biggest visible change — reskin and fonts land together so the light theme is
   never seen half-migrated.
3. **Phase 3 — States + components (items 8, 9, 9b, 10, 11).** Empty state, placeholder-row
   cleanup, the typographic post header (item 9b), active/press, reduced-motion. Makes the
   interface feel finished and brings post pages onto the design language.
4. **Phase 4 — Polish (items 13–14), then dependency cleanup (item 12) last.**
   Cleanup is highest-risk (touches shared legacy CSS) so it goes after everything else is
   stable and diffable.

## Verification

- `yarn clean && yarn server`, check each changed surface at desktop / tablet / phone widths.
- Toggle light⇄dark and reload cold (hard refresh) — no theme flash (item 3).
- Tab through header, filters, and cards — visible focus ring everywhere (item 2).
- Load `/404.html` directly and via a bad URL — branded, bilingual, working home link (item 5).
- Search the Writing archive for gibberish — empty-state message shows (item 8).
- Run one page through a link-preview debugger (or view source) — `og:*` tags present (item 7).
- Non-Mac browser (or DevTools font override) — display face is the loaded web font, not
  generic sans (item 6).
- Diff `public/` before/after the dependency cleanup to confirm nothing visual regressed (item 12).

## Decisions (resolved)

- **Q1 (typography):** display faces are Cormorant Garamond (English light), Source Serif 4
  (English dark), Noto Serif SC + Source Serif 4 (Chinese, both themes). Body stays on the
  system sans stack. **Delivery:** loaded via Google Fonts CDN (`preconnect` + `display=swap`),
  loaded conditionally per page language, *not* self-hosted — Noto Serif SC must come from the
  CDN anyway (multi-MB CJK needs the CDN's auto-subsetting), and one delivery path avoids mixed
  FOUT. Self-hosting the two Latin faces remains an easy later hardening (removes the third-party
  request) but was deferred.
- **Q2 (cleanup depth):** light touch this round — inline the 2 header icons + remove unused AOS only;
  defer the deeper `matery.css` teardown to a later dedicated pass.
- **Light theme direction:** reskinned from Apple-white to Anthropic/Claude warm-cream + coral +
  Garamond serif (see item 6b). Dark theme unchanged.
