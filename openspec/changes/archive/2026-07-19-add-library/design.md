## Context

Hexo 7.3.0 static site with a custom `xinhe-site` theme, deployed to GitHub Pages. Content is bilingual (EN/ZH) with `site_locale` and `lang_switch` front-matter fields. Today the site has separate destinations for Writing (article archive), Technical Notes, and Books (a single `_data/books.yml` entry). Two Palantir slide decks exist as static HTML under `source/slides/`, reachable only via `{% slides %}` iframe tags inside the Palantir article.

A prior execution plan (`docs/exec-plans/active/multi-format-library.md`) proposed a nested "one work, many outputs" model with a format rail, primary-output designation, and runtime manifest fetch for standalone decks. Exploration revealed the actual inventory has exactly one multi-format case (Palantir). The nested model is speculative abstraction for that inventory. This change adopts a flat model: one artifact per work, peer-linked through `related`.

## Goals / Non-Goals

**Goals:**
- Establish `works.yml` as a flat, single source of truth for publishable artifacts.
- Unify Writing, Technical Notes, Books, and standalone Slides under one Library with topic and format filters.
- Render related-works links on articles, notes, and standalone decks so readers can cross between formats.
- Preserve every existing article, deck, book, and language-switch URL.
- Introduce no new runtime or build dependency.

**Non-Goals:**
- Nested "one work, many outputs" model (rejected for this inventory).
- Removing or replacing the existing `{% slides %}` iframe in article introductions.
- Runtime manifest fetch for standalone decks (hardcoding related links instead).
- Merging the two Palantir decks (they have distinct editorial angles).
- Accounts, progress tracking, recommendations, or analytics.
- Redesigning Projects or About.
- Hosting external books or media locally.

## Decisions

### Decision 1: Flat work model (one row per artifact) over nested outputs

**Choice:** Each publishable artifact is its own work in `works.yml`. The Palantir article is one work; each Palantir deck is a separate work. They link to each other via `related`.

**Why:** The inventory has one multi-format case. A nested `outputs[]` array, primary-output designation, and `work_key + output_id` dual-reference add machinery that serves a single special case. The flat model admits the same reality (two decks, one article, all related) with one less layer of abstraction.

**Alternatives considered:**
- *Nested outputs (prior plan):* one work with `outputs: [article, slides, slides]`. Richer for a catalog where every work has 4-5 formats. Over-built for this site.
- *Hybrid (admit both):* works may have `outputs` OR be flat. Worst of both - two mental models to maintain.

### Decision 2: `related` peer links over format rail with current state

**Choice:** Articles and notes render an "ALSO AVAILABLE AS" section listing related works as direct links. No current/selected state, no primary-output designation.

**Why:** The format rail's current-state affordance ("you are here") is valuable when a work has many outputs of the same type. With at most 2-3 related works per artifact, a simple link list is enough and simpler to render and maintain.

**Alternatives considered:**
- *Format rail with CURRENT state (prior plan):* richer but adds current-output tracking, per-output durations, and a selected-state visual contract.

### Decision 3: Hardcode related links in standalone deck HTML over runtime fetch

**Choice:** Each deck's static HTML includes its related-works links directly, authored at the same time as the deck. No `window.DECK` manifest lookup, no runtime JSON fetch, no failure mode.

**Why:** Decks are already hand-authored static HTML. A deck has 1-2 related works. Hardcoding 1-2 stable URLs is consistent with the existing deck authoring workflow and eliminates a network request, a generated JSON artifact, and a graceful-degradation code path.

**Alternatives considered:**
- *Runtime JSON fetch (prior plan Phase 4):* single source of truth, but adds a network request and failure mode for 1-2 links. Not worth it.
- *Build-time HTML injection:* Hexo rewrites deck HTML during build to inject related links. Intrusive - decks are static source, not Hexo-rendered.

**Trade-off:** If `works.yml` changes a related work's URL, the deck HTML must be updated by hand. Mitigated by: small deck count, stable URLs (permalinks), and a build-time validator (Decision 6) that catches dangling references.

### Decision 4: Keep the `{% slides %}` iframe in article introductions

**Choice:** Do not replace the opening slide iframe with a static cover preview. The iframe stays as-is. The "ALSO AVAILABLE AS" section is additive, rendered after the iframe.

**Why:** Iframe removal was the most complex part of the prior plan (cover asset generation, preview state, format-rail-as-replacement). The iframe already works and provides a "try slides now" hook. The related-works section delivers the cross-format discovery value without touching the iframe.

**Alternatives considered:**
- *Replace iframe with static 16:9 cover (prior plan):* faster page load, but loses the live deck hook and adds cover-asset authoring.
- *Click-to-play poster that swaps in the iframe:* middle ground, but adds JS complexity for marginal gain.

### Decision 5: Monolingual works hidden from the other locale's Library

**Choice:** A work appears in the EN Library only if it has `url_en`, and in the ZH Library only if it has `url_zh`. Monolingual works are not shown with cross-language markers.

**Why:** Clean symmetric libraries. Cross-language markers ("English only") add visual noise and editorial judgment that the site's current bilingual discipline doesn't need.

**Alternatives considered:**
- *Show with cross-language marker:* noisier, admits asymmetry the site doesn't currently practice.
- *Ghosted/disabled chips:* implies a translation is coming; may not be.

### Decision 6: Build-time manifest integrity validator

**Choice:** A small Hexo helper (script, not a dependency) runs during build to verify: every `key` is unique; every `related` key exists as a work; every `url_en`/`url_zh` resolves in generated output; every post with `work_key` references an existing work.

**Why:** The manifest is the source of truth. Without validation, orphan keys, dangling `related` references, and stale post `work_key` fields accumulate silently. A build-time check is cheap and catches drift before deploy.

**Alternatives considered:**
- *No validator:* rely on manual review. Fails at scale; the manifest is meant to grow.

### Decision 7: Render "ALSO AVAILABLE AS" only when related entries exist

**Choice:** The related-works section renders on an article or note page when the work has one or more `related` entries. Works with no related entries omit the section entirely.

**Why:** An empty "ALSO AVAILABLE AS" section is visual noise. The prior plan's "always render the format rail" made sense when every work had at least itself as an output; in the flat model, a work with no related works has nothing to surface. This preserves the spirit (consistent rendering when there IS content) without a broken empty state.

**Note:** This refines the explore-mode answer "always render" to the flat model's semantics - render whenever there is something to render.

## Risks / Trade-offs

- **[Library shows multiple rows for multi-format topics]** -> The Palantir topic produces 3 rows (article + 2 decks). Acceptable: honest representation, and the format filter collapses to one format at a time. A real library doesn't collapse the book and audiobook into one row.
- **[Related links in deck HTML can go stale]** -> If a related work's URL changes, the deck HTML must be updated by hand. Mitigated by stable permalinks, small deck count, and the build-time validator catching dangling manifest keys (URL drift within a key is not caught - accepted).
- **[Flat model doesn't scale to many multi-format works]** -> If the catalog grows to many works each with 4-5 formats, the flat model produces more rows and the related-links list gets long. Migration to nested outputs is additive (group flat works under a parent key). Defer until inventory warrants.
- **[Validator adds build complexity]** -> A small script, but still code to maintain. Justified: the manifest is the source of truth and silent drift is the failure mode.
- **[Standalone decks don't auto-update when works.yml changes]** -> Accepted. Decks are hand-authored; related links are part of that authoring. Documented as an author responsibility.

## Migration Plan

1. Add `works.yml` with the Palantir (3 works) and Coding with Agents (1 work) entries.
2. Add `work_key` front matter to the Palantir article and the book intro post.
3. Build the Library page and related-works partial; wire into the theme.
4. Add related links to the two Palantir decks' static HTML.
5. Add compatibility redirects from `/writing/`, `/writing-zh/`, `/technical-notes/`, `/technical-notes-zh/` to Library.
6. Update primary navigation: replace Writing with Library.
7. Run the build-time validator; fix any drift.
8. Remove `books.yml` after confirming no template reads it.
9. Build, preview, verify bilingual Library, article related-works section, and standalone deck links.

**Rollback:** Revert the theme changes and remove `works.yml`. Existing posts and decks are unchanged (the `work_key` front-matter field is inert without the theme helper). `books.yml` is restored from git. Routes revert by removing redirect pages.

## Open Questions

- Should the validator also check that standalone deck HTML contains a related-works link to every work that lists the deck as related (bidirectional integrity)? Propose: yes, as a warning, not an error.
- Should the `{% slides %}` tag be deprecated long-term, or kept as the inline-embed mechanism? Defer; out of scope for this change.
