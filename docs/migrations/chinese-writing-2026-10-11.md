# 历史中文文章迁移记录

Last updated: 2026-10-11

范围：Ego Browser 已登录的公众号「佚名小司机」和知乎「XINHE LIU」已发表中文长文。跳过后台草稿和已删除记录。文章迁入站点源码，提交与部署通过仓库既有流程执行。

两平台各 11 篇有效文章，去重后 12 篇。新增 11 篇；《越努力越平庸的真相》已有站点版本，保持原正文和 URL，并补齐其中英文文件的必填元数据。

## 迁移清单

| 文章 | 两平台最早发表日期（上海时区） | 正文来源 | 本地配图文件数 | 站点路由 |
| --- | --- | --- | --- | --- |
| [告别2019(上)](../../source/_posts/farewell-to-2019-part-1/zh-CN.md) | 2019-12-27 | 微信 | 0 | /writing/farewell-to-2019-part-1-zh/ |
| [2024年的一些收获](../../source/_posts/lessons-from-2024/zh-CN.md) | 2025-01-31 | 微信 | 1 | /writing/lessons-from-2024-zh/ |
| [再见，黑天鹅飞过的2020](../../source/_posts/farewell-to-2020/zh-CN.md) | 2021-01-01 | 微信 | 0 | /writing/farewell-to-2020-zh/ |
| [第一个“双月”](../../source/_posts/my-first-two-months/zh-CN.md) | 2021-05-08 | 微信 | 0 | /writing/my-first-two-months-zh/ |
| [你好2020](../../source/_posts/hello-2020/zh-CN.md) | 2020-01-01 | 微信 | 0 | /writing/hello-2020-zh/ |
| [回国与求职复盘](../../source/_posts/returning-to-china-and-job-search/zh-CN.md) | 2021-04-06 | 微信 | 1 | /writing/returning-to-china-and-job-search-zh/ |
| [告别2019(下）](../../source/_posts/farewell-to-2019-part-2/zh-CN.md) | 2020-01-01 | 微信 | 0 | /writing/farewell-to-2019-part-2-zh/ |
| [2021年度总结](../../source/_posts/year-in-review-2021/zh-CN.md) | 2022-02-02 | 微信 | 0 | /writing/year-in-review-2021-zh/ |
| [在没有“大小周”的世界里](../../source/_posts/a-world-without-alternating-workweeks/zh-CN.md) | 2021-07-10 | 微信 | 1 | /writing/a-world-without-alternating-workweeks-zh/ |
| [2023年初的小作文](../../source/_posts/reflections-at-the-start-of-2023/zh-CN.md) | 2023-01-30 | 微信 | 2 | /writing/reflections-at-the-start-of-2023-zh/ |
| [读书笔记《做最好的自己》李开复](../../source/_posts/be-your-personal-best-reading-notes/zh-CN.md) | 2023-05-03 | 知乎 | 2 | /writing/be-your-personal-best-reading-notes-zh/ |

## 正文、配图与排版

- 11 篇中文文章均为原生 Markdown，位于 source/_posts/<id>/zh-CN.md。标题、强调、列表、引用和链接均使用 Markdown 语法；正文不含 HTML 包装或内联样式。
- 7 个原配图文件位于各文章的 zh-CN/ 资源目录；正文以标准相对链接引用，例如 `![配图](./zh-CN/93d5c6fe69b27145.png)`。6 张用于公开正文，另 1 张为 2023 年小作文另一平台版本的配图。
- 《回国与求职复盘》《在没有“大小周”的世界里》采用微信完整正文，并补上仅知乎版本包含的原配图。
- 原始平台版本的 JSON 移入 [chinese-writing-2026-10-11-originals/](./chinese-writing-2026-10-11-originals/)，与公开文章分开保存，仍保留原始 URL、时间、正文和图片来源。
- 已移除之前 content/posts/ 中的 11 篇 HTML 正文及 collections/posts.yml 中对应的投影条目；通过 Hexo 原生文章流程发布，原站点 URL 保持不变。
- 原始发表日期依据平台证据中的最早日期保存，迁移日期单独记录为 2026-10-11。站内发布日期按作者要求重新排期，详见 [站内发布排期](./site-publication-dates-2026-10-11.md)；原文日期落款保留不变。
- 主题新增相对配图链接解析，将 Markdown 中相对于源文件的路径映射到 Hexo 原生文章资源 URL；无需文章投影或 HTML 配图解析。

## 验证

- npm test：15 项通过，包括源文件相对配图链接、站点子路径和不应重写的链接。
- 从 HTML 转为 Markdown 后，11 篇全文逐字比对一致（仅忽略空白及不可见排版字符）。
- 清理缓存后完整 Hexo 构建成功。11 个原 URL 及中文 Library 条目均存在；6 张正文图片均指向已生成的本地资源，原段落均已核对保留。
- Ego Browser 逐篇检查 11 个文章页面：6 张正文配图全部加载成功；《2024年的一些收获》和读书笔记在 390px 手机宽度下无横向溢出。
- 迁入 source/_posts/ 的 11 篇文章：内容契约审计零问题。
- 已补齐 source/_posts/working-harder-growing-mediocre/ 中英文文件的 id、locale、status、created、updated，站内发表日期为 2026-10-11。
- ./write check site-source 完整门禁通过：构建成功，内容契约基线检查没有新增或恶化的问题。
