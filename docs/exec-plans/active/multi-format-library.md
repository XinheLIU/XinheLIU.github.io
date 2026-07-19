# Multi-Format Library Execution Plan

Last updated: 2026-07-19

Status: Active, implementation not started

> **Model revision (2026-07-19):** Exploration against the real inventory
> (one multi-format case) moved this plan from a nested "one work, many
> outputs" model to a flat "one artifact per work, peer-linked through
> `related`" model. Formal specs live in the OpenSpec change
> `openspec/changes/add-library/`. This document is the living narrative;
> the OpenSpec change is the spec record.

## Objective

Organize articles, technical notes, HTML slide decks, external books, and
future video or audio as works in a shared Library. Readers must be able to
discover a work by topic or format and move between related formats.

## Why

The current site treats articles as archive entries, books as separate data, and
slides as assets discoverable only from inside an article. Adding a top-level
section for every future format would fragment related material and make the
primary navigation grow with the publishing medium.

The stable entity is the work. Format is a property of the work, not a separate
destination. Related works link to each other as peers.

## Product Decisions

1. Replace the reader-facing `Writing` destination with `Library`.
2. Fold technical notes into Library as a work `type` while preserving their
   existing public URLs.
3. Keep `Projects` separate because it describes technical work rather than a
   publishing format.
4. Show one Library row per artifact, not one row per intellectual topic. A
   topic that has an article and two slide decks produces three rows.
5. Provide independent topic and format filters.
6. Link related works as peers through a `related` field. No primary output,
   no format rail with current state.
7. Render an "ALSO AVAILABLE AS" related-works section on article and note
   pages when related works exist for the current locale.
8. Give standalone slide decks direct related-works links, hardcoded into
   each deck's static HTML at authoring time.
9. Mark external outputs, such as books or hosted media, with an
   external-link indicator.
10. Keep `/slides/` as an asset route, not a primary navigation destination.
11. Store works in one flat structured manifest, `source/_data/works.yml`.
12. Keep the existing `{% slides %}` iframe in article introductions. Do not
    replace it with a cover preview. The related-works section is additive.

## Navigation And Routes

Target primary navigation:

```text
Home | Library | Projects | About
```

Target canonical Library routes:

```text
/library/
/library-zh/
```

Preserve these existing routes as compatibility redirects:

```text
/writing/            -> /library/
/writing-zh/         -> /library-zh/
/technical-notes/    -> /library/
/technical-notes-zh/ -> /library-zh/
```

Do not change existing article, book, slide, or language-switch URLs during the
initial migration.

## Content Model

Create `source/_data/works.yml` as the flat source of truth for Library
discovery and cross-format relationships. Migrate the current book entry from
`source/_data/books.yml` into this manifest after all consumers use the new
data.

Proposed shape (one entry per publishable artifact):

```yaml
- key: palantir-article
  type: article
  topic_cluster: enterprise-ai
  title_en: Deconstructing Palantir Ontology
  title_zh: 深度解构 Palantir Ontology
  summary_en: How semantics becomes an operational system.
  summary_zh: 语义如何成为可执行的业务系统。
  featured_asset: /images/palantir-ontology/ontology-system.png
  url_en: /writing/palantir-ontology/
  url_zh: /writing/palantir-ontology-zh/
  related: [palantir-deck-1, palantir-deck-2]

- key: palantir-deck-1
  type: slides
  title_en: Palantir Ontology - Deep Deconstruction
  title_zh: Palantir Ontology · 深度解构
  url_en: /slides/palantir-ontology/en/
  url_zh: /slides/palantir-ontology/zh/
  slide_count: 30
  related: [palantir-article, palantir-deck-2]

- key: palantir-deck-2
  type: slides
  title_en: Palantir Ontology - From Semantics to Action
  title_zh: Palantir Ontology · 从语义到行动
  url_en: /slides/palantir-semantic-to-action/en/
  url_zh: /slides/palantir-semantic-to-action/zh/
  slide_count: 29
  related: [palantir-article, palantir-deck-1]

- key: coding-with-agents
  type: book
  topic_cluster: agentic-engineering
  title_en: Coding with Agents
  title_zh: Coding with Agents
  summary_en: A practical guide to building software with coding agents.
  summary_zh: 一本关于如何和编程智能体协作构建软件的实践指南。
  url_en: /Coding-with-Agents/
  external: true
```

Supported work types initially:

```text
article | note | slides | book | video | audio
```

Each work has a stable `key`. The two Palantir decks stay separate because they
have distinct editorial angles. Optional fields include `featured_asset`,
`external`, `slide_count`, `status_en`, `status_zh`, and format-specific counts
or duration.

Posts reference the manifest through a single front-matter field:

```yaml
work_key: palantir-article
```

There is no `output_id` - the post is the artifact. Standalone slide decks
identify their work through their existing `window.DECK` metadata and carry
hardcoded related-works links in their own HTML.

## Reader Experience

### Library

The Library intro remains compact and archive-focused. Below it, provide:

- Topic filters using the existing topic clusters.
- Format filters for All, Articles, Notes, Slides, Books, Video, and Audio.
- Search across localized work titles, summaries, and topics.
- One row per artifact with preview, localized summary, topic, date, type
  label, and a direct link to the work's URL for the current locale.

Selecting a format filter narrows the list to works of that type. A topic with
an article and two decks renders three rows; the format filter collapses to one
format at a time.

### Related-Works Section

Place the "ALSO AVAILABLE AS" section on article and note pages after the
existing slide iframe (when present) and before the main content:

```text
ALSO AVAILABLE AS

  · Deep Deconstruction (slides, 30)  · From Semantics to Action (slides, 29)
```

Behavior:

- Render the section only when the work has one or more related entries that
  exist in the current locale. Omit it entirely otherwise.
- Each related work is a direct link to its URL for the current locale.
- External works open in a new tab and show an external-link icon.
- Link verbs localize by related work type: Read, View slides, Watch, Listen.
- On narrow screens, links wrap into stable rows rather than horizontal
  scrolling.
- Use existing theme typography, spacing, colors, and icon assets. Add no new
  dependency.

### Articles And Notes

- Render the related-works section from the post's `work_key` and the manifest.
- Keep the opening `{% slides %}` iframe as-is. Do not replace it with a cover
  preview.
- Keep an inline deck reference only where it contributes editorial context.

### Slide Decks

- Add a quiet related-works control to each deck's static HTML, with links
  hardcoded at authoring time.
- Include `Read article` or the appropriate peer link on the closing slide.
- Preserve full-screen keyboard controls and the 16:9 stage.
- Do not let the related-works control overlap slide content, the HUD, or
  overview mode.
- Related links target the top-level page (`target="_top"` or `_blank`), never
  navigating only inside the deck's own DOM.

### External Books And Future Media

- Use a local overview or introduction as a work when one exists.
- Keep the complete external book, video, or audio as a sibling work with
  `external: true`.
- Clearly show host and external-link behavior without visually demoting the
  external work.
- Do not require a local proxy page solely to hide an external URL.

## Bilingual Visibility

A work appears in the EN Library only if it has `url_en`, and in the ZH
Library only if it has `url_zh`. Monolingual works are hidden from the locale
they lack a URL for. Related-works links follow the same rule: a related work
without a URL for the current locale is omitted from the section in that locale.

## Implementation Phases

### Phase 1: Manifest Foundation

1. Add `source/_data/works.yml` with the Palantir article, both Palantir
   decks, and the Coding with Agents book as flat entries.
2. Add a single `work_key` field to the Palantir article's front matter.
3. Add a theme helper that resolves a work by key and locale, returning
   title, URL, type, and related works filtered to the current locale.
4. Add a build-time validator (Hexo helper, no new dependency) that checks
   key uniqueness, related-key existence, post `work_key` binding, URL
   resolution, and warns on missing bidirectional reverse links.

Verify:

- Every manifest key is unique.
- Every `related` key exists as a work.
- Every post `work_key` references an existing work.
- Every local URL resolves in generated output.
- Existing book and article URLs remain unchanged.

### Phase 2: Unified Library

1. Build localized `/library/` and `/library-zh/` pages from the manifest.
2. Render one row per artifact with a direct link to the work's locale URL.
3. Extend the existing filter/search behavior to support topic and format
   filters that compose with search.
4. Update the primary navigation and homepage copy from Writing to Library.
5. Preserve old archive routes through compatibility redirects.
6. Remove `source/_data/books.yml` only after no template reads it.

Verify:

- Topic and format filters compose correctly.
- Search works in English and Chinese.
- A topic with an article and two decks renders three rows.
- Keyboard focus order follows visual order.
- Old Writing and Technical Notes URLs redirect to Library.
- Monolingual works are hidden from the locale they lack a URL for.

### Phase 3: Related-Works Section

1. Add a shared EJS partial for the "ALSO AVAILABLE AS" section.
2. Render it in article and note layouts from `work_key` plus the manifest,
   after the existing slide iframe and before the body.
3. Add localized link verbs, slide counts, external indicators, and new-tab
   behavior.

Verify:

- Every article-to-deck link has a corresponding deck-to-article link.
- Multiple slide decks remain distinguishable by title, not type alone.
- The section omits cleanly when no related works exist for the current
  locale.
- The section wraps without clipping at mobile widths.

### Phase 4: Standalone Deck Integration

1. Add a related-works control to each Palantir deck's static HTML with
   hardcoded links to the article and sibling deck.
2. Add a primary-peer action (`Read article`) to each deck's closing slide.
3. Ensure links target the top-level page, never the deck's internal DOM.

Verify:

- Directly opened decks expose the article and sibling deck.
- The control does not overlap slide content, the HUD, or overview mode.
- Arrow-key navigation, overview mode, resizing, and print styles still work.
- Embedded decks (via iframe inside articles) do not trap related-works
  navigation in the iframe.

### Phase 5: Validation And Documentation

1. Update `design/DESIGN.md`, `AGENTS.md`, and repository guidance affected by
   the new Library model. Update each Markdown file's `Last updated` date.
2. Keep this exec plan coherent with the OpenSpec change `add-library`.
3. Run `yarn clean && yarn build`.
4. Preview with `yarn server`.
5. Use the browser harness to inspect desktop and mobile Library, article, and
   standalone deck views in both languages.
6. Check keyboard navigation, focus visibility, theme switching, language
   switching, internal links, and external-link behavior.

Verify:

- Build completes without warnings introduced by this work.
- No broken local URLs exist in the manifest or rendered related-works
  sections.
- No controls overlap or resize unexpectedly at desktop and mobile widths.
- Light and dark themes preserve readable contrast.
- Generated slide canvases are visible and correctly framed.

## Acceptance Criteria

- Primary navigation exposes Library rather than separate media-format sections.
- Library displays each artifact as its own row; a multi-format topic renders
  multiple rows, one per work.
- Readers can filter the same collection by topic and by format.
- Every related article and slide deck links in both directions.
- Books and future external media participate in the same model as peer works.
- All relationships come from `works.yml`; templates do not maintain parallel
  URL lists.
- Existing public content URLs continue to work.
- English pages show English interface copy and Chinese pages show Chinese copy.
- Monolingual works are hidden from the locale they lack a URL for.
- No new runtime or build dependency is introduced.
- Desktop and mobile verification passes before deployment.

## Non-Goals

- Rewriting article, book, or slide content.
- Merging the two Palantir decks (they have distinct editorial angles).
- Adopting a nested "one work, many outputs" model (rejected for this inventory).
- Removing the `{% slides %}` iframe from article introductions.
- Runtime manifest fetch for standalone decks (hardcoding links instead).
- Hosting external books or media locally.
- Creating a top-level page for every format.
- Introducing accounts, progress tracking, recommendations, or analytics.
- Redesigning Projects or About.
- Changing deployment from static GitHub Pages.

## Rollout Boundary

Migrate only the existing book and Palantir work first. Generalize to other
articles and future formats after the first implementation passes build, link,
responsive, and bidirectional-navigation checks.
