# Personal Site Proposition

Last updated: 2026-05-31

## Purpose

This document captures the public positioning that the current site should reinforce. It is a content guide, not an implementation plan.

## Core Identity

English:

```text
Charles
Personal site, writing, and technical notes.
```

Chinese:

```text
昕和
个人网站、写作与技术笔记。
```

Use technical depth in the body copy, not as the site title.

## Positioning

Recommended English framing:

```text
Engineer and technical writer working across data, AI, and product systems.
```

Recommended Chinese framing:

```text
关注数据、AI 与产品系统交叉处工程问题的工程师与技术写作者。
```

Allowed domain language:

```text
Recommendation systems
Ads systems
Experimentation
Causal measurement
Applied AI
Agent workflows
```

Do not make any one domain the top-level public brand.

## Public Structure

The production navigation has five destinations:

| Primary page | 中文名称 | Purpose | Production route |
| --- | --- | --- | --- |
| Home | 首页 | Personal homepage, profile snapshot, featured entry points | `/`, `/home-zh/` |
| Writing | 写作 | Long-form technical writing archive | `/writing/`, `/writing-zh/` |
| Technical Notes | 技术笔记 | Diagrams, methods, invariants, system notes | `/technical-notes/`, `/technical-notes-zh/` |
| Projects | 项目 | Public-safe project themes and external artifacts | `/projects/`, `/projects-zh/` |
| About & Contact | 个人信息和联系方式 | Compact bio, public boundary, GitHub and email | `/about/`, `/about-zh/` |

`/contact/` remains only as a compatibility route that forwards readers to About & Contact.

## Language Model

Use mirrored English and Chinese pages.

```text
English page -> English visible copy only
Chinese page -> Chinese visible copy only
```

Do not mix bilingual sections on the same production page.

## Sensitive Content Policy

Public pages should describe domains and reusable lessons, not private work details.

Use:

```text
Recommendation and ads systems
Experimentation and causal measurement
Enterprise AI and agent workflows
Data-heavy product systems
```

Avoid:

```text
Employer-specific internal projects
Client names
Private metrics
Internal architecture details
Non-public case studies
```

## Entry Copy

Homepage baseline:

```text
Charles

Personal site, writing, and technical notes.

I am an engineer and technical writer working across data, AI, and product systems.
This site is a public resume, writing archive, and place to collect technical notes.
```

Chinese homepage baseline:

```text
昕和的个人主页。

个人网站、写作与技术笔记。
```

About baseline:

```text
I work on technical systems that sit between product questions, measurement, modeling, and execution.
I publish public-safe writing, notes, and project summaries here.
```
