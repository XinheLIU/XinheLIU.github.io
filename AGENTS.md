# AGENTS.md

Last updated: 2026-07-19

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project

Hexo 7.3.0 static blog deployed to GitHub Pages. Source files live on the `source` branch; generated output is deployed to the `main` branch via `hexo-deployer-git`.

## Commands

```bash
yarn server          # local dev server at http://localhost:4000
yarn build           # generate static files to public/
yarn clean           # clear public/ and db.json cache
yarn deploy          # clean + generate + push to main branch (GitHub Pages)
```

Typical local preview workflow:
```bash
yarn clean && yarn server
```

Typical deploy workflow:
```bash
yarn clean && yarn deploy
```

## Branch Strategy

- `source` — Hexo source files (posts, config, theme). **Edit here.**
- `main` — generated static output. **Never edit directly;** it is overwritten by `yarn deploy`.

## Architecture

```
_config.yml          # site-wide Hexo config (theme, deploy target, markdown options)
source/_posts/       # bilingual article folders with en.md / zh-CN.md pairs
source/library/      # Library landing page (English)
source/library-zh/   # Library landing page (Chinese)
source/writing/      # writing archive — compatibility redirect to /library/
source/writing-zh/   # writing archive (Chinese) — compatibility redirect to /library-zh/
source/technical-notes/      # technical notes archive — compatibility redirect to /library/
source/technical-notes-zh/  # technical notes (Chinese) — compatibility redirect to /library-zh/
source/projects/     # projects landing pages
source/about/        # merged About & Contact entry
source/about-zh/     # Chinese personal information and contact entry
source/contact/      # compatibility redirect to /about/
source/_data/works.yml   # flat source of truth for Library and related-works linking
themes/xinhe-site/   # active theme; customizations go here
themes/xinhe-site/scripts/work-manifest.js     # theme helpers (getWork, getRelatedWorks, getAllWorks)
themes/xinhe-site/scripts/work-validator.js   # build-time manifest integrity validator
scaffolds/           # templates for new posts/pages
public/              # generated output (gitignored on source branch)
.deploy_git/         # working tree used by hexo-deployer-git for the main branch
```

Key rendering stack (configured in `_config.yml`):
- **Markdown**: `hexo-renderer-markdown-it-plus` with KaTeX math and emoji
- **Diagrams**: `hexo-tag-mermaid` — use `{% mermaid %}...{% endmermaid %}` tags
- **Code highlighting**: `hexo-prism-plugin` with line numbers

## Writing Posts

New bilingual post pair:
```bash
mkdir -p source/_posts/example-topic
# create source/_posts/example-topic/en.md and source/_posts/example-topic/zh-CN.md
```

Front-matter fields commonly used by the active site:
```yaml
---
title:
date:
layout:
permalink:
categories:
tags:
site_locale:
lang_switch:
summary_en:
summary_zh:
topic_cluster:
public_focus:
confidentiality_safe: true
work_key:         # bound to a key in source/_data/works.yml
last_updated:
---
```

Post assets should sit beside the language file they belong to:

```text
source/_posts/example-topic/
  en.md
  en/
    diagram.png
  zh-CN.md
  zh-CN/
    diagram.png
```

Keep `permalink` and `lang_switch` explicit on both language files so published URLs stay stable.

Math: wrap inline with `$...$`, block with `$$...$$` (KaTeX).

## Docs

`如何测试和部署.md` — current repo-specific setup, preview, and deploy guide in Chinese.

`design/DESIGN.md` — current design system and implementation constraints for the public site.

`site-redesign-plan.md` — redesign status record and remaining cleanup checklist.
