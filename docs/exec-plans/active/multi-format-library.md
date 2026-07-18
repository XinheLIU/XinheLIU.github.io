# Multi-Format Library Execution Plan

Last updated: 2026-07-19

Status: Active, implementation not started

## Objective

Organize articles, technical notes, HTML slide decks, external books, and future
video or audio as formats of a shared intellectual work. Readers must be able to
discover a work by topic or format and move in both directions between its
available outputs.

## Why

The current site treats articles as archive entries, books as separate data, and
slides as assets discoverable only from inside an article. Adding a top-level
section for every future format would fragment related material and make the
primary navigation grow with the publishing medium.

The stable entity should be the work. Format is a way to consume that work.

## Product Decisions

1. Replace the reader-facing `Writing` destination with `Library`.
2. Fold technical notes into Library as a content format while preserving their
   existing public URLs.
3. Keep `Projects` separate because it describes technical work rather than a
   publishing format.
4. Show one Library row per work, not one row per output.
5. Provide independent topic and format filters.
6. Designate one primary output for each work. The work title links to it.
7. Render the same format rail on every site-rendered output.
8. Give standalone slide decks direct links to their article and other formats.
9. Mark external outputs, such as books or hosted media, with an external-link
   indicator.
10. Keep `/slides/` as an asset route, not a primary navigation destination.
11. Store work relationships in one structured manifest.
12. Replace live slide iframes in article introductions with a format rail and a
    static deck-cover preview.

## Navigation And Routes

Target primary navigation:

```text
Home | Library | Projects | About
```

Target canonical archive routes:

```text
/library/
/library-zh/
```

Preserve these existing routes as compatibility redirects or equivalent stable
entry points:

```text
/writing/
/writing-zh/
/technical-notes/
/technical-notes-zh/
```

Do not change existing article, book, slide, or language-switch URLs during the
initial migration.

## Content Model

Create `source/_data/works.yml` as the source of truth for Library discovery and
cross-format relationships. Migrate the current book entry from
`source/_data/books.yml` into this manifest after all consumers use the new data.

Proposed shape:

```yaml
- key: palantir-ontology
  topic_cluster: enterprise-ai
  primary_output: article
  title_en: Palantir Ontology
  title_zh: Palantir Ontology
  summary_en: How semantics becomes an operational system.
  summary_zh: 语义如何成为可执行的业务系统。
  featured_asset: /images/palantir-ontology/ontology-system.png
  outputs:
    - id: article
      type: article
      url_en: /writing/palantir-ontology/
      url_zh: /writing/palantir-ontology-zh/
      minutes_en: 45
      minutes_zh: 45
    - id: deep-dive
      type: slides
      label_en: Deep deconstruction
      label_zh: 深度解构
      url_en: /slides/palantir-ontology/en/
      url_zh: /slides/palantir-ontology/zh/
      minutes_en: 8
      minutes_zh: 8
      slide_count: 30
```

Supported output types initially:

```text
article | note | slides | book | video | audio
```

Each output has a stable `id` because a work may have multiple outputs of the
same type. Optional fields may include `cover`, `external`, `status_en`,
`status_zh`, and format-specific counts or duration.

Posts reference the manifest through an explicit front-matter field:

```yaml
work_key: palantir-ontology
output_id: article
```

Standalone slide decks identify themselves through their existing `window.DECK`
metadata:

```js
window.DECK = {
  workKey: "palantir-ontology",
  outputId: "deep-dive",
  locale: "en"
};
```

## Reader Experience

### Library

The Library intro remains compact and archive-focused. Below it, provide:

- Topic filters using the existing topic clusters.
- Format filters for All, Articles, Notes, Slides, Books, Video, and Audio.
- Search across localized work titles, summaries, and topics.
- One row per work with preview, localized summary, topic, date, and available
  format links.

Selecting a format filter keeps the work grouped but promotes the matching
output link. It must not duplicate the work into separate rows.

### Format Rail

Place the format rail below the title and metadata and before the main content:

```text
AVAILABLE AS

[ Article - 45 min ] [ Slides - 8 min ] [ Visual deck - 7 min ]
       CURRENT
```

Behavior:

- The current output is visibly selected and is not a redundant link.
- Other outputs are direct links.
- External outputs open in a new tab and show an external-link icon.
- Labels use localized reader language: Read, View slides, Watch, or Listen.
- On narrow screens, items wrap into stable full-width or two-column rows rather
  than horizontal scrolling.
- Use existing theme typography, spacing, colors, and icon assets. Add no new
  dependency.

### Articles And Notes

- Render the format rail from `work_key` and `output_id`.
- Replace the opening live slide iframe with a linked static 16:9 cover preview.
- Keep an inline deck reference only where it contributes editorial context.
- Use the output-specific cover when supplied; otherwise fall back to the work's
  featured asset.

### Slide Decks

- Add a quiet companion-output control to the deck interface.
- Include `Read article` or the appropriate primary-output action on the closing
  slide.
- Preserve full-screen keyboard controls and the 16:9 stage.
- Do not let the companion control overlap slide content, the HUD, or overview.
- When a deck is embedded, companion links must target the top-level page or a
  new tab rather than navigating only inside the iframe.

### External Books And Future Media

- Use a local overview or introduction as the primary output when one exists.
- Keep the complete external book, video, or audio as a sibling output.
- Clearly show host and external-link behavior without visually demoting the
  external output.
- Do not require a local proxy page solely to hide an external URL.

## Implementation Phases

### Phase 1: Manifest Foundation

1. Add `source/_data/works.yml` with the existing book and Palantir outputs.
2. Add explicit `work_key` and `output_id` metadata to related posts.
3. Add work identity metadata to each related deck.
4. Add a small theme helper that resolves a work, locale, current output, and
   primary output without duplicating lookup logic across templates.

Verify:

- Every manifest key and output ID is unique.
- Every local URL resolves in generated output.
- Every localized output falls back explicitly when a translation is absent.
- Existing book and article URLs remain unchanged.

### Phase 2: Unified Library

1. Build localized `/library/` and `/library-zh/` pages from the manifest.
2. Render one row per work with direct format links.
3. Extend the existing filter/search behavior to support topic and format.
4. Update the primary navigation and homepage copy from Writing to Library.
5. Preserve old archive routes through compatibility pages or redirects.
6. Remove `source/_data/books.yml` only after no template reads it.

Verify:

- Work counts do not increase when additional formats are added.
- Topic and format filters compose correctly.
- Search works in English and Chinese.
- Keyboard focus order follows visual order.
- Old Writing and Technical Notes URLs still lead to valid content.

### Phase 3: Bidirectional Format Rail

1. Add a shared EJS partial for the format rail.
2. Render it in article and note layouts from front matter plus the manifest.
3. Replace the Palantir article's opening slide iframe with a cover preview.
4. Add localized format labels, durations, counts, current state, and external
   indicators.

Verify:

- Every article-to-slide link has a corresponding slide-to-article link.
- Multiple slide decks remain distinguishable by label, not type alone.
- Missing optional metadata degrades without empty labels or broken layout.
- The rail wraps without clipping at mobile widths.

### Phase 4: Standalone Deck Integration

1. Generate a public JSON representation of the relevant manifest fields during
   the Hexo build.
2. Add a small shared deck script that reads `window.DECK`, loads the manifest,
   and renders companion links.
3. Add a primary-output action to each deck's closing slide.
4. Keep decks usable if the manifest request fails by hiding only the companion
   control.

Verify:

- Directly opened decks expose the article and sibling outputs.
- Decks embedded in another page do not trap companion navigation in the iframe.
- Arrow-key navigation, overview mode, resizing, and print styles still work.
- A failed manifest request does not affect slide rendering or navigation.

### Phase 5: Validation And Documentation

1. Update `design/DESIGN.md`, `CLAUDE.md`, and repository guidance affected by
   the new Library model. Update each Markdown file's `Last updated` date.
2. Run `yarn clean && yarn build`.
3. Preview with `yarn server`.
4. Use the browser harness to inspect desktop and mobile Library, article, and
   standalone deck views in both languages.
5. Check keyboard navigation, focus visibility, theme switching, language
   switching, internal links, and external-link behavior.

Verify:

- Build completes without warnings introduced by this work.
- No broken local URLs exist in the manifest or rendered format rails.
- No controls overlap or resize unexpectedly at desktop and mobile widths.
- Light and dark themes preserve readable contrast.
- Generated slide canvases are visible and correctly framed.

## Acceptance Criteria

- Primary navigation exposes Library rather than separate media-format sections.
- Library displays each work once and exposes all available formats.
- Readers can filter the same collection by topic and by format.
- Every related article and slide deck links in both directions.
- Books and future external media participate in the same model.
- All relationships come from `works.yml`; templates do not maintain parallel
  URL lists.
- Existing public content URLs continue to work.
- English pages show English interface copy and Chinese pages show Chinese copy.
- No new runtime or build dependency is introduced.
- Desktop and mobile verification passes before deployment.

## Non-Goals

- Rewriting article, book, or slide content.
- Hosting external books or media locally.
- Creating a top-level page for every format.
- Introducing accounts, progress tracking, recommendations, or analytics.
- Redesigning Projects or About.
- Changing deployment from static GitHub Pages.

## Rollout Boundary

Migrate only the existing book and Palantir work first. Generalize to other
articles and future formats after the first implementation passes build, link,
responsive, and bidirectional-navigation checks.
