## Why

The site splits intellectual work across separate destinations - Writing, Technical Notes, Books, and slide decks reachable only from inside an article. Readers cannot discover a work by topic and move between its available formats. The prior plan proposed a nested "one work, many outputs" model, but the actual inventory has only one multi-format case (Palantir: article + two decks). A flat model - one artifact per work, peer-linked through `related` - fits the real inventory without speculative abstraction, and still lets readers cross between formats.

## What Changes

- Add `source/_data/works.yml` as the flat source of truth: one entry per publishable artifact (article, note, slides, book, future video/audio), with a `type` and optional `related: [keys]`.
- Add a unified bilingual Library page at `/library/` and `/library-zh/` that shows one row per artifact, with independent topic and format filters and search across localized titles, summaries, and topics.
- Add a "ALSO AVAILABLE AS" related-works section on article and note pages, rendered after the existing slide iframe and before the body, listing related works as direct links.
- Add related-works links to standalone slide decks by hardcoding them into each deck's static HTML at authoring time (no runtime manifest fetch).
- **BREAKING**: Remove `Writing` and `Technical Notes` as primary navigation destinations. Their routes (`/writing/`, `/writing-zh/`, `/technical-notes/`, `/technical-notes-zh/`) become compatibility redirects into Library.
- Migrate the existing `source/_data/books.yml` entry into `works.yml`; remove `books.yml` once no template reads it.
- Preserve every existing article, slide deck, book, and language-switch URL.
- Keep the existing `{% slides %}` iframe embedding in article introductions; do not replace it with a cover preview.
- Posts gain a single `work_key` front-matter field that identifies their entry in `works.yml`. No `output_id` - the post is the artifact.
- Standalone decks identify their work via their existing `window.DECK` metadata plus hardcoded related links in the deck HTML.

## Capabilities

### New Capabilities

- `work-manifest`: `works.yml` as the flat source of truth for publishable artifacts. Defines work types (`article`, `note`, `slides`, `book`, `video`, `audio`), the `related` peer-link field, `work_key` front-matter binding, manifest resolution, and the rendering contract for the "ALSO AVAILABLE AS" related-works section on content pages and standalone decks.
- `library`: The unified bilingual Library discovery page. One row per artifact, independent topic and format filters, search, bilingual rendering, primary navigation entry, and compatibility redirects from `/writing/` and `/technical-notes/` routes.

### Modified Capabilities

None. No existing specs to modify - this is greenfield.

## Impact

- **New files**: `source/_data/works.yml`, `themes/xinhe-site/layout/library.ejs`, a related-works EJS partial, a theme helper for manifest resolution, `source/library/index.md`, `source/library-zh/index.md`.
- **Modified files**: primary navigation partial, `source/writing/index.md` and `source/technical-notes/index.md` (become redirect pages), post front matter (add `work_key`), Palantir article front matter, each Palantir deck's static HTML (add related links).
- **Removed files**: `source/_data/books.yml` (after migration).
- **Dependencies**: no new runtime or build dependencies introduced. Uses existing Hexo `_data/` support and theme stack.
- **Routes**: `/library/` and `/library-zh/` are new; `/writing/`, `/writing-zh/`, `/technical-notes/`, `/technical-notes-zh/` become redirects; all article, deck, and book URLs unchanged.
- **Bilingual behavior**: a work appears in a locale's Library only if it has a URL for that locale. Monolingual works are hidden from the other locale's Library.
