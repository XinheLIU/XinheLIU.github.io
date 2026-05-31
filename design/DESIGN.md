# Charles Personal Site Design System

Last updated: 2026-05-31

## Purpose

This design system defines the current personal website for Charles / 昕和. The site should read as a personal homepage, resume, and technical writing archive first. Technical specialties such as recommendation, ads, experimentation, causal measurement, and applied AI appear as expertise areas inside the site, not as the site's main identity.

The system is designed for Hexo + `xinhe-site` on GitHub Pages. Implementation should stay static, portable, and compatible with Markdown pages plus small EJS/CSS/JS overrides.

## Product Model

Public navigation has five destinations:

- Home
- Writing
- Technical Notes
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

Light theme:

- White/Apple-like personal website surface.
- `--bg: #fbfbfd`
- `--surface: #f5f5f7`
- `--surface-warm: #ffffff`
- `--fg: #1d1d1f`
- `--muted: #6e6e73`
- `--accent: #0071e3`

Dark theme:

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

English:

- Display: `SF Pro Display`, `Söhne`, `Inter`, system sans.
- Body: `SF Pro Text`, `Söhne`, `Inter`, system sans.
- Mono: `Söhne Mono`, `JetBrains Mono`, Menlo, Consolas.

Chinese:

- Display: `Songti SC`, `Noto Serif CJK SC`, `Source Han Serif SC`, `PingFang SC`.
- Body: `PingFang SC`, `Noto Sans CJK SC`, `Microsoft YaHei`, system sans.

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

- Primary actions use foreground fill (`--fg`) with background text (`--bg`).
- Secondary actions use a border and neutral surface.
- Accent/teal actions are reserved for rare generated or highlighted states.

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

## Interaction Rules

`themes/xinhe-site/source/js/xinhe-site.js` owns three interactions:

- Archive filters and search via `data-filter`, `data-topic`, and `data-search`.
- Theme persistence through `localStorage` key `xinhe-site-theme`.
- Contact draft preview through `data-contact-form` and `data-contact-preview`.

Do not add framework dependencies. Keep JavaScript small, static, and GitHub Pages-safe.

## Theme Implementation Notes

Recommended implementation path:

- Keep Hexo + `xinhe-site`.
- Use Markdown pages for Home, Writing, Technical Notes, Projects, and About & Contact.
- Use EJS partials for the shared header, footer, archive rows, and card components.
- Keep `themes/xinhe-site/source/css/xinhe-site.css` as the main override layer.
- Keep `themes/xinhe-site/source/js/xinhe-site.js` as the small enhancement script.
- Add front matter gradually for high-priority posts: `summary_en`, `summary_zh`, `topic_cluster`, `public_focus`, and preview image references.

Do not:

- Switch frameworks.
- Add new public page categories.
- Create a sales-heavy agency site.
- Reintroduce legacy theme branding into visible navigation or footer chrome.
