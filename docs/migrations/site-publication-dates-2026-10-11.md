# 站内文章发布排期

Last updated: 2026-10-11

按作者要求重新分配当前站点独立文章的展示日期。范围为 source/_posts/ 中 24 篇逻辑文章、37 个 Markdown 文件：12 篇博客（包含已有的《越努力越平庸的真相》）及 12 篇技术文章。关联书籍、笔记仓库的章节和幻灯片不在本次改动范围内。提交与部署通过仓库既有流程执行。

## 排期原则

- 以 2026-10-11 为截止日，博客位于最近一年（2025-10-11 起），技术文章位于最近一年半（2025-04-11 起）。
- 9 篇基础技术文章放在前半年（2025-04 至 2025-10），系列内部保持顺序；3 篇较新的技术文章位于 2026-06 至 2026-09。
- 历史博客按原时间顺序分散至 2025-10 至 2026-09；已有 2026-10-11 文章保留当天。24 篇文章没有同日重复，中英文同文共享日期。
- 首页地图默认显示最近六个月，较早排期可通过向前翻页查看。

## 日期字段

- date 为站内展示的发布时间；created、updated、last_updated 同步为同一天，避免把同一次历史收录重复算成发布和更新。
- 改动前存在的四个日期字段分别原样保存在 original_date、original_created、original_updated、original_last_updated；original_sources 和 imported_at 保持不变。
- 文件顶部的 YAML 注释 Last updated: 2026-10-11 记录本次元数据维护日期，不参与活动统计。正文及原文日期落款均不变，URL、语言切换与图片路径不变。
- 地图的公开说明改为发布与更新日期，并注明包含历史文章收录，不再将排期声称为原始创作日期。

## 文章清单

| 类型 | 文章 | 调整前站内发布日期 | 新站内发布日期 |
| --- | --- | --- | --- |
| 技术 | [推荐系统101(1)推荐系统介绍](../../source/_posts/recsys-101-intro-1/zh-CN.md) | 2023-12-13 | 2025-04-17 |
| 技术 | [推荐系统101(2)推荐策略](../../source/_posts/recsys-101-intro-2/zh-CN.md) | 2023-12-14 | 2025-05-06 |
| 技术 | [推荐系统101(3)算法前沿](../../source/_posts/recsys-101-intro-3/zh-CN.md) | 2023-12-15 | 2025-05-28 |
| 技术 | [因果推断（1）什么是因果推断](../../source/_posts/causal-intro-1/zh-CN.md) | 2024-01-18 | 2025-06-18 |
| 技术 | [AB实验（1）AB实验从0到1](../../source/_posts/ab-test-intro-1/zh-CN.md) | 2024-05-18 | 2025-07-09 |
| 技术 | [AB实验（2）AB实验中的难题](../../source/_posts/ab-test-intro-2/zh-CN.md) | 2024-06-20 | 2025-07-31 |
| 技术 | [计算广告（1）广告业务简介](../../source/_posts/ads-intro-1/zh-CN.md) | 2024-07-15 | 2025-08-21 |
| 技术 | [计算广告（2）计算广告系统](../../source/_posts/ads-intro-2/zh-CN.md) | 2024-07-30 | 2025-09-12 |
| 技术 | [计算广告（3）广告策略](../../source/_posts/ads-intro-3/zh-CN.md) | 2025-08-08 | 2025-10-02 |
| 博客 | [告别2019(上)](../../source/_posts/farewell-to-2019-part-1/zh-CN.md) | 2019-12-27 | 2025-10-23 |
| 博客 | [告别2019(下）](../../source/_posts/farewell-to-2019-part-2/zh-CN.md) | 2020-01-01 | 2025-11-18 |
| 博客 | [你好2020](../../source/_posts/hello-2020/zh-CN.md) | 2020-01-01 | 2025-12-09 |
| 博客 | [再见，黑天鹅飞过的2020](../../source/_posts/farewell-to-2020/zh-CN.md) | 2021-01-01 | 2026-01-15 |
| 博客 | [回国与求职复盘](../../source/_posts/returning-to-china-and-job-search/zh-CN.md) | 2021-04-06 | 2026-02-10 |
| 博客 | [第一个“双月”](../../source/_posts/my-first-two-months/zh-CN.md) | 2021-05-08 | 2026-03-12 |
| 博客 | [在没有“大小周”的世界里](../../source/_posts/a-world-without-alternating-workweeks/zh-CN.md) | 2021-07-10 | 2026-04-14 |
| 博客 | [2021年度总结](../../source/_posts/year-in-review-2021/zh-CN.md) | 2022-02-02 | 2026-05-19 |
| 技术 | [Coding with Agents 导读](../../source/_posts/coding-with-agents-intro/zh-CN.md) | 2026-06-06 | 2026-06-06 |
| 技术 | [AI 原生组织：从传统架构到超级杠杆](../../source/_posts/ai-native-org/zh-CN.md) | 2026-06-08 | 2026-06-25 |
| 博客 | [2023年初的小作文](../../source/_posts/reflections-at-the-start-of-2023/zh-CN.md) | 2023-01-30 | 2026-07-07 |
| 博客 | [读书笔记《做最好的自己》李开复](../../source/_posts/be-your-personal-best-reading-notes/zh-CN.md) | 2023-05-03 | 2026-08-13 |
| 技术 | [Palantir Ontology 深度解构：当本体从「描述世界」走向「驱动世界」](../../source/_posts/palantir-ontology/zh-CN.md) | 2026-07-18 | 2026-09-17 |
| 博客 | [2024年的一些收获](../../source/_posts/lessons-from-2024/zh-CN.md) | 2025-01-31 | 2026-09-29 |
| 博客 | [越努力越平庸的真相](../../source/_posts/working-harder-growing-mediocre/zh-CN.md) | 2026-10-11 | 2026-10-11 |

## 验证

- npm test：15 项通过；清理缓存后 ./write check site-source 完整门禁通过，没有新增或恶化的内容契约问题（其余历史基线问题仍存在）。
- 37 个文件正文逐字一致，原有日期字段全部原样保留，其他既有元数据未改变。
- 37 个文章生成页面的头部发布时间与排期一致，原 URL 保持有效。
- 中英文首页生成的活动数据各包含 24 个不同日期的站内发布事件，中英文同文去重，没有额外的同日迁移更新事件。
- 最近六个月（2026-04-11 至 2026-10-11）首页统计为 11 个活跃日、12 篇发布、3 次更新，包含未修改的 3 个关联书稿章节。
- Palantir 的手工作品清单日期已同步；重新构建后，中英文 Library 日期与文章一致。git diff --check 通过。
