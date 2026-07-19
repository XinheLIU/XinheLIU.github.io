# Charles Personal Site Design System

Last updated: 2026-07-19

## Purpose

This design system defines the current personal website for Charles / 昕和. The site should read as a personal homepage, resume, and technical writing archive first. Technical specialties such as recommendation, ads, experimentation, causal measurement, and applied AI appear as expertise areas inside the site, not as the site's main identity.

The system is designed for Hexo + `xinhe-site` on GitHub Pages. Implementation should stay static, portable, and compatible with Markdown pages plus small EJS/CSS/JS overrides.

## Product Model

Public navigation has four destinations:

- Home
- Library
- Projects
- About & Contact

Do not reintroduce a separate Contact nav item. `/contact/` exists only as a compatibility redirect to `/about/`.

Language is separated by page, not mixed inline:

- English pages use English visible copy only.
- Chinese pages use Chinese visible copy only.
- Proper nouns and technical product names such as GitHub, Hexo, HTML, CSS, and EJS may remain untranslated.
- Each page has a small language icon link to its counterpart.

## Visual Direction

The site should feel calm, technical, readable, and personal. It should resemble a resume plus blog archive, not a product landing page, agency website, or generic AI SaaS page.

Core posture:

- Compact, archive-forward layouts.
- Strong but quiet typography.
- Public-safe professional framing.
- Visible writing/project previews.
- Minimal decorative chrome.
- Utility controls as small icons, not prominent CTAs.

Avoid:

- Making "decision systems" the site title or top-level identity.
- Flashy gradients, decorative blobs, or oversized startup hero sections.
- Dense corporate consulting jargon.
- Hidden or mixed bilingual paragraphs on one page.
- Public claims that imply private employer/client details.

## Theme System

The site has two switchable themes controlled by `data-theme` on `:root`.

Light theme (Anthropic / Claude-like warm editorial surface):

- Tinted cream canvas with warm ink text and one scarce coral accent. Deliberately warm — not the cool gray-white of most AI tools. Cards sit one step *darker* than the canvas (color-block depth, not white-on-white elevation).
- `--bg: #faf9f5` (cream canvas)
- `--surface: #f5f0e8` (soft cream — chips, subtle fills)
- `--surface-warm: #efe9de` (cream card — panels, cards, tinted sections)
- `--fg: #141413` (warm ink — headlines and body)
- `--muted: #6c6a64` (warm muted)
- `--meta: #8e8b82`
- `--border: #e6dfd8`, `--border-soft: #ebe6df` (warm hairlines)
- `--accent: #cc785c` (Anthropic coral), `--accent-hover: #a9583e`, `--accent-on: #ffffff`
- `--focus-ring: 0 0 0 3px rgba(204, 120, 92, 0.20)` (coral-tinted)

Dark theme (unchanged — black/OpenAI-like technical reading surface):

- Black/OpenAI-like technical reading surface.
- `--bg: #0d0d0d`
- `--surface: #1a1a1a`
- `--surface-warm: #111111`
- `--fg: #f5f5f5`
- `--muted: #b7b7b7`
- `--accent: #10a37f`

The theme toggle is intentionally tiny: a circular 34px icon button using `●` and `○`. It should never become a labeled CTA.

## Typography

Use the shared CSS tokens in `themes/xinhe-site/source/css/xinhe-site.css`.

The display face is a **serif** in both themes, tuned per theme for the theme's identity. It must be self-hosted (`woff2`, `font-display: swap`, preloaded) so it renders on every platform, not only Apple devices.

English:

- Display (light / cream): `Cormorant Garamond` at weight 500–600 with `-0.02em` tracking — the closest open-source stand-in for Anthropic's Copernicus / Tiempos Headline editorial serif. Fallback: `EB Garamond`, then `Georgia`, `ui-serif`, serif.
- Display (dark): `Source Serif 4` (self-hosted successor to the design's `Source Serif Pro`), `Georgia`, `ui-serif`, serif.
- Body (both themes): humanist sans — `-apple-system`, `SF Pro Text`, `Inter`, system sans. (`Inter` is the faithful substitute for Anthropic's StyreneB if a web body face is ever added.)
- Mono: `JetBrains Mono`, Menlo, Consolas, monospace.

Do not use a geometric or grotesk display face in the light theme — the Garamond serif is what carries the warm, literary editorial voice; a sans headline reverts the site to a generic AI-tool look.

Chinese:

- Display (both themes): `Noto Serif SC` (思源宋体) at weight 500–600 — a real multi-weight Song serif that renders crisp at display sizes. Latin glyphs inside a Chinese heading lead with `Source Serif 4` (the sibling superfamily of Source Han Serif / Noto Serif SC, so the two read as one type system), then `Source Han Serif SC`, serif. Load only the heading serif; body needs no CJK web font.
- Do **not** use `Songti SC` for headings — it has no true bold, so a synthesized faux-bold renders lumpy. Do **not** pair a high-contrast Latin serif (e.g. Cormorant Garamond) with a CJK serif — the weight/contrast mismatch looks broken.
- Body: `PingFang SC`, `Microsoft YaHei`, `Noto Sans SC`, system sans — a clean humanist sans, system-present on every platform.
- CJK type rules: no negative letter-spacing (glyphs are square); body line-height `1.8`, heading line-height `1.3–1.4`.

Scale:

- Display title: `56px`, line-height `1.08`, tracking `-0.02em`.
- Page title: `40px`, line-height `1.15`.
- Section heading: `28px`, line-height `1.2`.
- Card title: `20px`, line-height `1.3`.
- Body: `16px`, line-height `1.65`.
- Large lead: `18px`, line-height `1.6`.
- Metadata and controls: `12px` to `13px`.

## Layout

Desktop is the primary target, with responsive rules for tablet and mobile widths.

Layout constants:

- Container max width: `1200px`.
- Desktop gutter: `48px`.
- Tablet/phone gutter tokens keep the header controls and page content from overlapping at narrow widths.
- Major section spacing: `96px`.
- Compact section spacing: `64px`.
- Card/grid gap: usually `16px` to `32px`.

Preferred page rhythm:

1. Sticky header.
2. Hero or narrow page intro.
3. Archive or card section.
4. Supporting implementation/content section.
5. Quiet footer.

Use wide whitespace as the primary separator. Do not add heavy dividers or decorative backgrounds.

## Header And Navigation

Header structure:

- Left: circular `X` brand mark plus `Charles` / `昕和` and "Personal site" / Chinese equivalent.
- Center: five public nav links.
- Right: language icon, theme icon, and at most one contextual action.

Rules:

- Language switch: 34px circle, visible label `中` on English pages and `EN` on Chinese pages.
- Theme switch: 34px circle, visible label `●` / `○`.
- Legacy theme notes must not appear in the visible header or launcher chrome.
- Header/nav must never inherit Materialize red or pink styling.
- Header actions should feel like utility icons, not marketing buttons.

## Components

Use existing classes from `themes/xinhe-site/source/css/xinhe-site.css`; do not invent parallel component systems.

Core components:

- `.brand-lockup`, `.brand-mark`, `.brand-name`
- `.site-nav`, `.nav-actions`, `.utility-actions`
- `.lang-switch`, `.theme-toggle`
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-teal`
- `.hero`, `.hero-narrow`, `.hero-panel`
- `.display-title`, `.page-title`, `.lead`, `.eyebrow`
- `.section`, `.section-tinted`, `.section-head`
- `.card-grid`, `.card`
- `.archive-list`, `.archive-row`, `.archive-row.has-preview`
- `.post-preview`, `.preview-chart`, `.preview-grid`, `.preview-diagram`
- `.filter-bar`, `.filter-button`, `.search-field`
- `.split-panel`, `.sidebar-panel`, `.summary-list`, `.summary-item`
- `.contact-grid`, `.contact-card`, `.field`, `.contact-preview`
- `.site-footer`, `.footer-row`, `.footer-links`

Cards:

- Use 16px radius.
- Use `--border-soft` for containment.
- Use very soft hover lift only.
- Avoid colored left-border cards.

Buttons:

- Light (cream) theme: the primary CTA uses the coral accent fill (`--accent`) with white text (`--accent-on`) — the signature Anthropic voltage. Keep coral scarce: primary buttons and rare full-bleed callouts only, never scattered across small elements.
- Dark theme: primary actions keep the foreground fill (`--fg`) with background text (`--bg`) — unchanged.
- Secondary actions use a border and neutral surface in both themes.
- Reserve the dark-theme teal accent for rare generated or highlighted states.

Archive rows:

- Use row-based layouts for writing and notes.
- Keep image-style preview blocks visible.
- Tags sit on the right as quiet pills.
- Filters and search should remain functional through `themes/xinhe-site/source/js/xinhe-site.js`.

Preview blocks:

- Use `.post-preview` with one of `.preview-chart`, `.preview-grid`, or `.preview-diagram`.
- These are placeholders for existing post diagrams/images.
- Do not remove previews from Writing, Technical Notes, or Projects.

## Content Rules

Top-level identity:

- "Charles"
- "昕和"
- "Personal site"
- "Engineer and technical writer"
- "Writing archive"
- "Projects"

Specialty language may appear in body content:

- recommendation systems
- ads systems
- experimentation
- causal measurement
- applied AI
- agent workflows
- data-heavy product systems

Keep these as domains of work, not the brand headline.

Public safety:

- Do not expose employer-specific projects.
- Do not name private clients.
- Do not invent private metrics.
- Do not describe internal architecture or non-public case studies.
- Use domain-level descriptions and reusable public artifacts.

## Page Guidance

Home:

- Lead with Charles / 昕和 as a person.
- Explain the site as resume, writing archive, and project index.
- Include a compact profile snapshot.
- Link toward Writing and About & Contact.

Writing:

- Treat as a serious blog archive.
- Keep filters and search.
- Use visible previews for each writing cluster.
- Organize existing posts by topic without rewriting the whole archive.

Technical Notes:

- Treat as implementation notes, diagrams, invariants, and system sketches.
- Prefer concise summaries and visual previews.
- Keep the distinction from long-form Writing.

Projects:

- Use public-safe project themes, not private case studies.
- Show reusable artifacts, diagrams, or domain themes.
- Keep preview cards visible.

About & Contact:

- Combine biography, professional frame, GitHub link, contact prompts, and contact draft.
- It should feel like a compact resume intro.
- Contact copy should invite focused technical conversations, not sales inquiries.

Article / post pages:

- Lead with a quiet typographic header on the normal page surface — no full-bleed photo banner. Order: eyebrow (topic cluster / category) → serif title in the display face (`--fg` ink, not white) → a mono meta row (date · reading time · tags as quiet pills) → a thin hairline.
- Do **not** auto-assign decorative stock banners (retire `theme.featureImages` and the daily `/medias/banner/` mechanism). A bright photographic hero is the "oversized hero / decorative chrome" this system avoids.
- A lead image is opt-in only: when a post sets `img`, render it *below* the header as a contained, rounded, toned-down image card — never full-bleed. Prefer the post's own diagram/preview asset over generic photography.

## Interaction Rules

`themes/xinhe-site/source/js/xinhe-site.js` owns three interactions:

- Archive filters and search via `data-filter`, `data-topic`, and `data-search`.
- Theme persistence through `localStorage` key `xinhe-site-theme`.
- Contact draft preview through `data-contact-form` and `data-contact-preview`.

Do not add framework dependencies. Keep JavaScript small, static, and GitHub Pages-safe.

## Theme Implementation Notes

Recommended implementation path:

- Keep Hexo + `xinhe-site`.
- Use Markdown pages for Home, Library, Projects, and About & Contact.
- Use EJS partials for the shared header, footer, archive rows, card components, and related-works panel.
- Keep `themes/xinhe-site/source/css/xinhe-site.css` as the main override layer.
- Keep `themes/xinhe-site/source/js/xinhe-site.js` as the small enhancement script.
- Add front matter gradually for high-priority posts: `work_key`, `summary_en`, `summary_zh`, `topic_cluster`, `public_focus`, and preview image references.
- Use `source/_data/works.yml` as the flat source of truth for the Library and related-works linking.

Do not:

- Switch frameworks.
- Add new public page categories.
- Create a sales-heavy agency site.
- Reintroduce legacy theme branding into visible navigation or footer chrome.
