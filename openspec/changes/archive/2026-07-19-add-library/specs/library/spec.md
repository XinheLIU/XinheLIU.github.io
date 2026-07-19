## ADDED Requirements

### Requirement: Library page exists at canonical routes

The system SHALL provide a Library page at `/library/` (English) and `/library-zh/` (Chinese). Each page SHALL render in its respective locale with localized interface copy.

#### Scenario: English library route

- **WHEN** a reader navigates to `/library/`
- **THEN** the system SHALL serve the English Library page with English interface copy

#### Scenario: Chinese library route

- **WHEN** a reader navigates to `/library-zh/`
- **THEN** the system SHALL serve the Chinese Library page with Chinese interface copy

### Requirement: One row per artifact

The Library SHALL display one row per work entry in the manifest, not one row per intellectual topic. A topic that has an article and two slide decks SHALL produce three rows. Each row SHALL show the work's localized title, summary, topic, date, type, and a direct link to the work's URL for the current locale.

#### Scenario: Multi-format topic renders multiple rows

- **WHEN** the Palantir topic has one article and two slide decks as separate manifest entries
- **THEN** the Library SHALL render three rows for that topic, one for each work

#### Scenario: Row links directly to the work

- **WHEN** a reader clicks a Library row's link
- **THEN** the link SHALL navigate directly to that work's URL for the current locale

### Requirement: Topic filter

The Library SHALL provide a topic filter using the existing `topic_cluster` values from the manifest. Selecting a topic SHALL show only works with that `topic_cluster`. The filter SHALL compose with the format filter and search.

#### Scenario: Filter by topic

- **WHEN** a reader selects the "enterprise-ai" topic filter
- **THEN** the Library SHALL show only works whose `topic_cluster` is `enterprise-ai`

#### Scenario: Topic and format filters compose

- **WHEN** a reader selects the "enterprise-ai" topic filter and the "slides" format filter
- **THEN** the Library SHALL show only slide-deck works whose `topic_cluster` is `enterprise-ai`

### Requirement: Format filter

The Library SHALL provide a format filter with options for All, Articles, Notes, Slides, Books, Video, and Audio. Selecting a format SHALL show only works of that `type`. The filter SHALL compose with the topic filter and search.

#### Scenario: Filter by slides format

- **WHEN** a reader selects the "Slides" format filter
- **THEN** the Library SHALL show only works whose `type` is `slides`

### Requirement: Search

The Library SHALL provide a search input that filters works by localized title, summary, and topic. Search SHALL work in both English and Chinese. Search SHALL compose with the topic and format filters.

#### Scenario: Search by title

- **WHEN** a reader types "Palantir" in the search input
- **THEN** the Library SHALL show only works whose title, summary, or topic contains "Palantir" in the current locale

#### Scenario: Search in Chinese

- **WHEN** a reader types Chinese characters in the search input on the Chinese Library page
- **THEN** the Library SHALL match works whose `title_zh`, `summary_zh`, or topic contains those characters

### Requirement: Primary navigation entry

The primary navigation SHALL include a "Library" entry linking to `/library/` on English pages and `/library-zh/` on Chinese pages. The navigation SHALL NOT include separate "Writing" or "Technical Notes" entries.

#### Scenario: English navigation

- **WHEN** a reader views any English page
- **THEN** the primary navigation SHALL show a "Library" link to `/library/`

#### Scenario: Chinese navigation

- **WHEN** a reader views any Chinese page
- **THEN** the primary navigation SHALL show a "Library" link to `/library-zh/`

### Requirement: Compatibility redirects from old archive routes

The routes `/writing/`, `/writing-zh/`, `/technical-notes/`, and `/technical-notes-zh/` SHALL redirect to their respective Library routes (`/library/` or `/library-zh/`). The redirects SHALL preserve locale. Existing article, slide deck, book, and language-switch URLs SHALL remain unchanged.

#### Scenario: Writing route redirects to library

- **WHEN** a reader navigates to `/writing/`
- **THEN** the system SHALL redirect to `/library/`

#### Scenario: Chinese technical-notes route redirects

- **WHEN** a reader navigates to `/technical-notes-zh/`
- **THEN** the system SHALL redirect to `/library-zh/`

#### Scenario: Article URL preserved

- **WHEN** a reader navigates to `/writing/palantir-ontology/`
- **THEN** the system SHALL serve the article at that URL unchanged

### Requirement: Locale visibility matches manifest

The English Library SHALL show only works with `url_en`. The Chinese Library SHALL show only works with `url_zh`. Monolingual works SHALL be hidden from the locale they lack a URL for.

#### Scenario: English library shows only English-available works

- **WHEN** a work has `url_zh` but no `url_en`
- **THEN** the work SHALL NOT appear in the English Library at `/library/`

### Requirement: No new dependencies

The Library and related-works rendering SHALL use only the existing Hexo stack, theme partials, and theme assets. No new runtime or build dependency SHALL be introduced.

#### Scenario: Build completes without new dependencies

- **WHEN** the build runs after the Library is implemented
- **THEN** `package.json` SHALL contain no new dependencies compared to before the change

### Requirement: Library rows preserve existing featured assets

Each Library row SHALL display the work's featured asset or cover when one is declared in the manifest. Works without a featured asset SHALL render a fallback that does not break the row layout.

#### Scenario: Work with featured asset

- **WHEN** a work declares a `featured_asset` path
- **THEN** the Library row SHALL display that asset as its preview image

#### Scenario: Work without featured asset

- **WHEN** a work does not declare a `featured_asset`
- **THEN** the Library row SHALL render a fallback placeholder and the row layout SHALL remain intact
