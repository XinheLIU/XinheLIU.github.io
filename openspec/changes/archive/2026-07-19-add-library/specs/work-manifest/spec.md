## ADDED Requirements

### Requirement: Manifest is the single source of truth

The system SHALL maintain `source/_data/works.yml` as the single source of truth for publishable artifacts. Templates and pages SHALL NOT maintain parallel lists of works, article URLs, or slide URLs that duplicate manifest data.

#### Scenario: Template reads work data from the manifest

- **WHEN** a theme template needs to render a work's title, URL, or related links
- **THEN** the template SHALL resolve the data from `works.yml` via the manifest helper, not from a hardcoded list or a separate data file

#### Scenario: Books data migrates into the manifest

- **WHEN** the build runs after migration is complete
- **THEN** `source/_data/books.yml` SHALL NOT exist, and the book entry SHALL be present in `works.yml` with `type: book`

### Requirement: Flat work structure

Each entry in `works.yml` SHALL represent exactly one publishable artifact. The manifest SHALL NOT use a nested `outputs` array. Each work SHALL have a unique `key`, a `type`, and a localized URL for each locale it exists in.

#### Scenario: Multi-format topic produces separate works

- **WHEN** an intellectual topic has an article and two slide decks
- **THEN** the manifest SHALL contain three separate work entries, one for the article and one for each deck, each with its own `key`

#### Scenario: Work key uniqueness

- **WHEN** the build runs
- **THEN** every `key` in `works.yml` SHALL be unique

### Requirement: Work types

The manifest SHALL support these `type` values: `article`, `note`, `slides`, `book`, `video`, `audio`. Future types SHALL be added to this list before use.

#### Scenario: Article work

- **WHEN** a work represents a long-form article
- **THEN** its `type` SHALL be `article`

#### Scenario: Slide deck work

- **WHEN** a work represents a standalone slide deck
- **THEN** its `type` SHALL be `slides` and it MAY include a `slide_count` field

### Requirement: Related works peer links

A work MAY declare a `related` field containing a list of other work keys. Related links SHALL be bidirectional in practice: if work A lists work B as related, work B SHOULD list work A as related. The system SHALL NOT enforce bidirectionality at runtime; the build-time validator SHALL warn on missing reverse links.

#### Scenario: Article links to companion decks

- **WHEN** an article work declares `related: [deck-1, deck-2]`
- **THEN** the article's related-works section SHALL render links to both deck works

#### Scenario: Deck links back to article

- **WHEN** a deck work declares `related: [article]`
- **THEN** the deck's related-works section SHALL render a link to the article work

### Requirement: Work key binding in post front matter

Every post that corresponds to a manifest entry SHALL declare a `work_key` field in its front matter matching the entry's `key`. Posts SHALL NOT declare an `output_id` field (the post is the artifact).

#### Scenario: Article post binds to manifest

- **WHEN** the Palantir article post is rendered
- **THEN** its front matter SHALL contain `work_key: palantir-article` (or equivalent) matching a `key` in `works.yml`

#### Scenario: Orphan work key detected

- **WHEN** a post declares `work_key: foo` but no work with `key: foo` exists in the manifest
- **THEN** the build-time validator SHALL report an error

### Requirement: Manifest resolution helper

The theme SHALL provide a helper that resolves a work by key and locale, returning the work's title, URL, type, and related works for the requested locale. The helper SHALL return null if the work does not exist or does not have a URL for the requested locale.

#### Scenario: Resolve work in English

- **WHEN** the helper is called with `("palantir-article", "en")`
- **THEN** it SHALL return the work's `title_en`, `url_en`, `type`, and related works filtered to those that have `url_en`

#### Scenario: Resolve work missing in a locale

- **WHEN** the helper is called with `(key, "zh")` and the work has no `url_zh`
- **THEN** it SHALL return null

### Requirement: Related-works section on articles and notes

Article and note layouts SHALL render an "ALSO AVAILABLE AS" section after the existing slide iframe (if present) and before the main body, listing the work's related works as direct links. The section SHALL render only when the work has one or more related entries that exist in the current locale. Each link SHALL use a localized verb (Read, View slides, Watch, Listen) matching the related work's type.

#### Scenario: Article with two companion decks

- **WHEN** an article work has two related slide-deck works in the current locale
- **THEN** the "ALSO AVAILABLE AS" section SHALL render two links, each labeled with the deck title and a "View slides" verb

#### Scenario: Article with no related works

- **WHEN** an article work has no `related` field, or no related works exist in the current locale
- **THEN** the "ALSO AVAILABLE AS" section SHALL NOT render

#### Scenario: Related work missing in current locale

- **WHEN** an article work lists a related deck that has no URL for the current locale
- **THEN** that deck SHALL be omitted from the related-works section in that locale

### Requirement: Related-works links on standalone decks

Each standalone slide deck's static HTML SHALL include related-works links hardcoded in the deck markup. The links SHALL target the top-level page (not navigate inside the deck's own DOM). The related-works control SHALL NOT overlap slide content, the HUD, or overview mode.

#### Scenario: Standalone deck opened directly

- **WHEN** a reader opens `/slides/palantir-ontology/en/` directly
- **THEN** the deck SHALL display a related-works control linking to the article and any sibling decks

#### Scenario: Related link opens top-level page

- **WHEN** a reader clicks a related-works link inside a standalone deck
- **THEN** the link SHALL navigate the top-level browser window to the related work's URL, not change only the deck's internal state

### Requirement: Bilingual URL fields and locale visibility

Each work SHALL declare `url_en` and/or `url_zh`. A work SHALL appear in the EN Library only if it has `url_en`, and in the ZH Library only if it has `url_zh`. A work with only one locale URL is monolingual and SHALL be hidden from the other locale's Library.

#### Scenario: Monolingual work hidden from other locale

- **WHEN** a work has `url_en` but no `url_zh`
- **THEN** the work SHALL appear in the EN Library and SHALL NOT appear in the ZH Library

#### Scenario: Bilingual work appears in both libraries

- **WHEN** a work has both `url_en` and `url_zh`
- **THEN** the work SHALL appear in both the EN and ZH Libraries, each linking to its respective locale URL

### Requirement: External output marking

A work MAY declare `external: true` when its URL points to an external host (e.g., a hosted book or video). The related-works section and Library row SHALL render an external-link indicator for such works, and the link SHALL open in a new tab.

#### Scenario: Book links to external host

- **WHEN** a book work has `external: true` and a URL pointing to an external host
- **THEN** the Library row and related-works links SHALL show an external-link icon and open the URL in a new tab

### Requirement: Build-time manifest integrity validator

The build SHALL run a validator that checks: every `key` is unique; every `related` key exists as a work in the manifest; every post with `work_key` references an existing work; every `url_en`/`url_zh` resolves in the generated output. The validator SHALL fail the build on errors and SHALL warn on missing bidirectional reverse links.

#### Scenario: Dangling related key fails build

- **WHEN** a work declares `related: [nonexistent-key]`
- **THEN** the validator SHALL report an error and the build SHALL fail

#### Scenario: Missing reverse link warns

- **WHEN** work A lists work B as related, but work B does not list work A
- **THEN** the validator SHALL emit a warning and the build SHALL continue
