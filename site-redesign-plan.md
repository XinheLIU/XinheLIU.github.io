# Site Redesign Status

Last updated: 2026-05-31

## Status

The redesign is implemented. The site now runs on `themes/xinhe-site`; older Matery extraction files are no longer part of the active implementation.

## What Shipped

- Primary navigation now has five destinations: Home, Writing, Technical Notes, Projects, About & Contact.
- `/contact/` is preserved as a compatibility route for the merged About & Contact page.
- English and Chinese public pages are separated by route.
- Shared shell, footer, theme toggle, and language switch are implemented in the extracted theme.
- Header controls use visible 34px language/theme circles and the nav no longer inherits Materialize red styling.
- English visible identity is `Charles`; Chinese visible identity is `昕和`.
- Custom landing pages and archive layouts exist for Writing, Technical Notes, Projects, and About.
- Representative posts now carry archive metadata such as summaries, topic clusters, note types, and public-safety flags.

## Active Production Paths

Primary content routes:

```text
/
/home-zh/
/writing/
/writing-zh/
/technical-notes/
/technical-notes-zh/
/projects/
/projects-zh/
/about/
/about-zh/
/contact/
```

Primary implementation paths:

```text
_config.yml
themes/xinhe-site/_config.yml
themes/xinhe-site/layout/**/*.ejs
themes/xinhe-site/source/css/xinhe-site.css
themes/xinhe-site/source/js/xinhe-site.js
source/_posts/*.md
source/about/
source/contact/
source/projects/
source/projects-zh/
source/technical-notes/
source/technical-notes-zh/
source/writing/
source/writing-zh/
```

## Design Sources

The retained design reference is:

```text
design/DESIGN.md
```

Prototype HTML artifacts under `design/` are historical source material only. They should not be treated as production files or implementation targets.

## Remaining Cleanup

Safe next steps:

1. Remove obsolete prototype HTML files from `design/` once the source-of-truth docs are retained.
2. Remove inactive `themes/matery/` copies when the worktree cleanup is approved.
3. Keep reducing unreferenced Matery-era layouts, widgets, CSS, and JS from `themes/xinhe-site`.
4. Replace remaining Materialize and AOS dependencies only when the equivalent behavior already exists in custom code.
5. Trim legacy taxonomy and utility pages only after confirming whether Tags, Categories, and Friends still need to exist publicly.

## Historical Note

Older redesign notes referred to `themes/matery/` as the active implementation target. That is no longer true. Treat those references as historical context from the extraction phase.
