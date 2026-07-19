## 1. Manifest foundation

- [x] 1.1 Create `source/_data/works.yml` with flat entries for the Palantir article, both Palantir decks (each its own work with `type: slides`), and the Coding with Agents book (migrated from `books.yml`). Include `key`, `type`, `title_en`, `title_zh`, `url_en`, `url_zh`, `topic_cluster`, `related`, and `featured_asset` where applicable.
- [x] 1.2 Add a theme helper that resolves a work by key and locale, returning `title`, `url`, `type`, `slide_count`, `external`, and the related-works list filtered to entries that have a URL for the requested locale. Return null when the work or its locale URL is missing.
- [x] 1.3 Add a build-time validator script (Hexo helper, no new dependency) that checks: key uniqueness; every `related` key exists in the manifest; every post with `work_key` references an existing work; every `url_en`/`url_zh` resolves in generated output. Emit errors that fail the build and warnings for missing bidirectional reverse links.
- [x] 1.4 Wire the validator into the Hexo build so it runs during generation and fails the build on errors.

## 2. Post front-matter binding

- [x] 2.1 Add `work_key: palantir-article` (or the chosen key) to `source/_posts/palantir-ontology/en.md` and `zh-CN.md` front matter. Do not add `output_id`.
- [x] 2.2 Add `work_key` to the Coding with Agents intro post(s) if they exist; otherwise ensure the book work has no post binding and is resolved by URL alone.
- [x] 2.3 Run the validator and confirm no orphan `work_key` errors.

## 3. Library page

- [x] 3.1 Create `source/library/index.md` and `source/library-zh/index.md` with `layout: library`, `site_locale`, and `lang_switch` front matter.
- [x] 3.2 Create `themes/xinhe-site/layout/library.ejs` that reads `site.data.works` and renders one row per work for the current locale (only works with a URL for that locale).
- [x] 3.3 Each row renders localized title, summary, topic, date, type label, featured asset (or fallback placeholder), and a direct link to the work's locale URL.
- [x] 3.4 Implement the topic filter using existing `topic_cluster` values; selecting a topic shows only works with that cluster.
- [x] 3.5 Implement the format filter with options: All, Articles, Notes, Slides, Books, Video, Audio. Selecting a format shows only works of that `type`.
- [x] 3.6 Implement a search input that filters by localized title, summary, and topic in the current locale.
- [x] 3.7 Ensure topic filter, format filter, and search compose correctly (all three apply together).
- [x] 3.8 Render external-link indicator and `target="_blank"` for works with `external: true`.

## 4. Related-works rendering on articles and notes

- [x] 4.1 Create a related-works EJS partial that reads the current post's `work_key`, resolves the work, and renders an "ALSO AVAILABLE AS" section listing each related work that has a URL for the current locale.
- [x] 4.2 Render the partial in the post (article) layout after the existing slide iframe and before the main body.
- [x] 4.3 Render the same partial in the note layout if notes use a distinct layout.
- [x] 4.4 Localize the link verb by related work type: Read (article, note), View slides (slides), Watch (video), Listen (audio), Read book (book).
- [x] 4.5 Omit the section entirely when the work has no related entries, or when no related entries have a URL for the current locale.
- [x] 4.6 Render external-link icon and `target="_blank"` for related works with `external: true`.

## 5. Standalone deck integration

- [x] 5.1 Add a related-works control to `source/slides/palantir-ontology/en/index.html` and `zh/index.html` with hardcoded links to the Palantir article and the sibling deck.
- [x] 5.2 Add the same control to `source/slides/palantir-semantic-to-action/en/index.html` and `zh/index.html` linking to the article and the other deck.
- [x] 5.3 Ensure every related link uses `target="_top"` (or `_blank`) so it navigates the top-level browser window, not the deck's internal DOM.
- [x] 5.4 Position the control so it does not overlap slide content, the HUD, or overview mode at any viewport size.
- [x] 5.5 Confirm arrow-key navigation, overview mode, resizing, and print styles still work with the control present.

## 6. Navigation and routing

- [x] 6.1 Update the primary navigation partial: replace the Writing entry with Library. Link to `/library/` on English pages and `/library-zh/` on Chinese pages based on `site_locale`.
- [x] 6.2 Convert `source/writing/index.md` into a redirect page targeting `/library/`.
- [x] 6.3 Create or update `source/writing-zh/` to redirect to `/library-zh/`.
- [x] 6.4 Convert `source/technical-notes/index.md` into a redirect page targeting `/library/`.
- [x] 6.5 Create or update `source/technical-notes-zh/` to redirect to `/library-zh/`.
- [x] 6.6 Verify existing article URLs (`/writing/palantir-ontology/`, `/writing/palantir-ontology-zh/`), deck URLs (`/slides/...`), book URLs, and all `lang_switch` URLs remain unchanged.

## 7. Migration and cleanup

- [x] 7.1 Search the theme for any template reading `site.data.books` and update it to read `site.data.works` filtered to `type: book`.
- [x] 7.2 Remove `source/_data/books.yml`.
- [x] 7.3 Run the validator to confirm no references to `books.yml` remain and the book work resolves from `works.yml`.

## 8. Documentation and verification

- [x] 8.1 Update `design/DESIGN.md` with the Library model and flat work manifest; update its Last updated date.
- [x] 8.2 Update `AGENTS.md` front-matter conventions to document `work_key` and the manifest; update its Last updated date.
- [x] 8.3 Update `docs/exec-plans/active/multi-format-library.md` so it stays coherent with this change (the flat-model revision is captured separately in the OpenSpec change).
- [x] 8.4 Run `yarn clean && yarn build`; confirm no warnings introduced by this change.
- [x] 8.5 Run `yarn server`; preview `/library/` and `/library-zh/`.
- [x] 8.6 Verify topic and format filters compose correctly; verify search in EN and ZH.
- [x] 8.7 Preview the Palantir article; verify "ALSO AVAILABLE AS" renders after the iframe with both deck links.
- [x] 8.8 Open `/slides/palantir-ontology/en/` directly; verify the related-works control appears and links open top-level.
- [x] 8.9 Verify `/writing/`, `/writing-zh/`, `/technical-notes/`, `/technical-notes-zh/` redirect to Library.
- [x] 8.10 Verify primary navigation shows Library on both locales.
- [x] 8.11 Check mobile widths: Library rows wrap correctly, related-works section wraps without clipping, deck companion control does not overlap content.
- [x] 8.12 Check keyboard navigation and focus visibility through filters, related links, and the deck companion control.
- [x] 8.13 Confirm light and dark themes preserve readable contrast on Library rows and the related-works section.
