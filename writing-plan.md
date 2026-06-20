# Writing Plan — Road to ~100 Posts

Last updated: 2026-06-06

## Positioning

**AI × Data Science × Business Architecture — turning algorithms, agents, and analytics into real business systems in China.**

Personal story angle: *From Quant to AI Business Architect* (Goldman quant → ByteDance DS → AI solution/business architect).
Content direction: *AI业务架构笔记* — ToB AI, data agents, pharma/retail/O2O/advertising systems.

One-liner (EN):
> I write about building practical AI business systems: data agents, growth algorithms, decision science, and enterprise AI architecture.

One-liner (ZH):
> 我关注如何把数据科学、算法和AI Agent真正落到业务系统里，形成可解释、可评估、可交付的业务智能。

Default language: **English-first with Chinese business examples.** Bilingual (en.md / zh-CN.md) for flagship posts only — see strategy below.

## Niche (the defensible core)

> AI Agent + Data Science + Business Decision Systems — how to build AI systems that help companies **sense, decide, and act.**

Strongest where **technical model thinking meets messy real business execution.** Few people can write that; most write generic LLM commentary.

## Standard post template

```text
1. The business problem
2. Why naive solutions fail
3. A simple framework
4. Technical design
5. Organizational / delivery constraints
6. Practical checklist
```

Not every post needs all six. Short "note" posts can be just framework + checklist.

## Strategy: how to reach ~100 fast

The mistake is treating each post as a from-scratch essay. Instead, mine **assets you already have** and **split big topics into series**. Concrete levers, ranked by speed:

1. **Series-ify everything.** One deep topic = 4–8 posts. A/B testing is already 2; it can be 8. Recsys is 3; it can be 10. A single budget-allocation idea becomes: problem → naive baseline → quant framing → model → backtest → org constraints → checklist. That's 6 posts from one brain-dump.
2. **Mine existing artifacts.** Slide decks, internal docs, interview prep, code comments, Slack/Lark threads, project retros. Each is a draft. Convert, don't create.
3. **English-first, Chinese-later (or skip).** Don't gate publishing on translation. Write EN, ship it. Translate only the 15–20 flagship posts. Bilingual ≠ every post bilingual.
4. **Three post sizes** so volume stays high:
   - **Notes (300–600 words):** one framework, one table, one checklist. ~30 min each. Target 40 of these.
   - **Standard (1000–1800 words):** full template. ~2 hrs each. Target 45.
   - **Flagship (2500+ words, bilingual):** the differentiated, link-worthy pieces. Target 15.
5. **Reading notes are free posts.** Every paper/book/talk you process → a `reading-notes` post. You already read constantly; capture it. Target 15.
6. **Batch by pillar.** Write 5 ads posts in one sitting while the context is loaded, not 1 ads + 1 agent + 1 career scattered.
7. **Reuse the diagram pipeline.** Mermaid is already wired in. Frameworks-as-diagrams are fast and distinctive.

Math: 40 notes + 45 standard + 15 flagship = 100. If you ship ~3/week (very doable with batching), that's ~8 months. Front-load notes to build momentum.

## Taxonomy (7 pillars)

```text
/ai-agents              # AI Agent Engineering
/data-science           # Data Science for Business
/algo-growth            # Algorithmic Growth / Ads / O2O
/business-architecture  # AI Business Architecture
/pharma-ai              # Healthcare / Pharma Channel AI
/career                 # Career / Thinking Frameworks
/reading-notes          # Papers, books, talks
```

## Mapping existing posts

| Existing post | Pillar | Series it anchors |
| --- | --- | --- |
| ab-test-intro-1, -2 | data-science | A/B Testing & Experimentation (→ 8) |
| ads-intro-1, -2, -3 | algo-growth | Computational Advertising (→ 8) |
| causal-intro-1 | data-science | Causal Inference (→ 6) |
| recsys-101-intro-1, -2, -3 | algo-growth | Recommender Systems (→ 10) |
| coding-with-agents-intro | ai-agents | Agent Engineering (→ 12) |

You already have the skeleton of 5 series. Finishing them alone is ~30 more posts.

## The ~100-post backlog

Legend: **[N]** note · **[S]** standard · **[F]** flagship · ✅ exists. Series numbering shows where existing posts sit.

### Pillar 1 — AI Agent Engineering (`/ai-agents`) · 18 posts

**Agent Engineering series**
1. ✅ coding-with-agents-intro
2. [F] Agent Development Is Management: Why Eval Is Performance Review
3. [S] ReAct vs Workflow: When Should an Enterprise Agent Think, and When Follow SOP?
4. [S] The AI Agent Stack for Business: Data, Tools, Memory, Eval, Workflow, UI
5. [S] Why Most Data Agents Fail: Missing Semantic Layers, Workflows, Ownership
6. [S] Designing Tool Interfaces for Agents: The API Is the Prompt
7. [S] Agent Memory: What to Store, What to Derive, What to Forget
8. [S] Eval-Driven Agent Development: Building the Test Harness First
9. [N] Permission Boundaries: How to Let an Agent Act Without Letting It Wreck
10. [N] Single Agent vs Multi-Agent: When Orchestration Earns Its Cost
11. [N] The Harness Is the Product: Why Scaffolding Beats Model Choice
12. [S] Coding Agents in Practice: What Works, What Still Needs a Human
13. [N] Context Engineering: Compaction, Retrieval, and the 1M-Token Trap
14. [N] Why Agent Demos Lie: The Gap Between Notebook and Production
15. [S] Building a Data Agent: From NL Question to Trustworthy SQL
16. [N] Structured Output vs Free Text: Forcing Agents to Be Parseable
17. [N] Agent Observability: Logging Decisions, Not Just Outputs
18. [F] The Agent-Business Mapping: Turning an Org Chart into an Agent Architecture

### Pillar 2 — Data Science for Business (`/data-science`) · 20 posts

**A/B Testing & Experimentation series**
1. ✅ ab-test-intro-1
2. ✅ ab-test-intro-2
3. [S] Sample Size, Power, and Why Your Test Was Underpowered
4. [S] Network Effects & Interference: When A/B Testing Breaks
5. [S] Sequential Testing and Always-Valid p-values
6. [N] Guardrail Metrics: Shipping Without Breaking the Business
7. [N] The Peeking Problem and How Teams Cheat Without Knowing
8. [S] Experiment Platforms: What to Build vs Buy

**Causal Inference series**
9. ✅ causal-intro-1
10. [S] Difference-in-Differences for Business Decisions
11. [S] Propensity Scores and Matching: Practical Pitfalls
12. [S] Uplift Modeling: Targeting Who's Persuadable, Not Who Converts
13. [N] Instrumental Variables, Explained for Practitioners
14. [N] When You Can't Run an Experiment: A Decision Tree

**Metrics & Decision Science**
15. [F] The Real Difference Between BI, Data Science, and AI Agents
16. [S] Designing a Metric System That Survives Goodhart's Law
17. [S] Attribution: Last-Touch Is Wrong, Now What?
18. [N] North Star Metrics: How to Pick One Without Lying to Yourself
19. [N] Business Diagnosis: A Framework for "Why Did the Number Move?"
20. [S] From Dashboard to Decision: Closing the Analytics Loop

### Pillar 3 — Algorithmic Growth / Ads / O2O (`/algo-growth`) · 22 posts

**Computational Advertising series**
1. ✅ ads-intro-1
2. ✅ ads-intro-2
3. ✅ ads-intro-3
4. [S] Bidding Strategies: From Manual CPC to Auto-Bidding Under Constraints
5. [S] Budget Pacing: Spending Smoothly Without Leaving ROI on the Table
6. [S] CTR/CVR Prediction: Calibration Matters More Than AUC
7. [N] Ghost Ads and Incrementality: Measuring What Ads Actually Cause
8. [N] The Auction Is a Mechanism: GSP, VCG, and Why It Matters

**Recommender Systems series**
9. ✅ recsys-101-intro-1
10. ✅ recsys-101-intro-2
11. ✅ recsys-101-intro-3
12. [S] Candidate Generation vs Ranking: The Two-Stage Architecture
13. [S] Cold Start: New Users, New Items, and the Exploration Tax
14. [S] Embeddings in Recsys: From MF to Two-Tower to LLM
15. [N] Feedback Loops: How Recsys Poisons Its Own Training Data
16. [N] Diversity, Novelty, Serendipity: Beyond Accuracy Metrics
17. [S] Reranking for Business Objectives: Blending Relevance and Margin

**Budget Allocation & Growth (the quant-meets-business core)**
18. [F] From Quant Finance to O2O Marketing: Alpha, Beta, and Risk Exposure for Budget Allocation
19. [S] How to Backtest a Marketing Strategy Like a Quant Strategy
20. [S] Multi-Constraint Budget Optimization: City × Product × Channel × Time
21. [N] GMV vs ROI: The Objective Function Fight Every Growth Team Has
22. [N] Marginal ROI and Where to Spend the Next Dollar

### Pillar 4 — AI Business Architecture (`/business-architecture`) · 14 posts

1. [F] A Practical Framework for AI Business Architecture
2. [F] Translating Business Ambiguity into Technical Architecture
3. [S] ToB AI Delivery Risk: Where Clients, PMs, and Engineering Misalign
4. [S] The SOP Matrix: Mapping Workflows Before Mapping Agents
5. [S] Data Asset Planning: You Can't Build the Agent Without the Data
6. [S] Value Chain Mapping: Where AI Actually Captures Value
7. [S] ToB Productization: From Bespoke Project to Repeatable Product
8. [N] Scope Creep in AI Projects: The Five Warning Signs
9. [N] The Business Loop: Sense → Decide → Act → Measure
10. [N] Why "Just Add AI" Fails: Missing the Decision Owner
11. [N] Build vs Buy vs Wrap: Deciding the AI Stack for a Client
12. [S] Pricing AI Solutions: Outcome, Seat, or Usage?
13. [N] The Pilot Trap: Why POCs Don't Become Products
14. [S] Delivery Risk Control: A Checklist for ToB AI Engagements

### Pillar 5 — Healthcare / Pharma Channel AI (`/pharma-ai`) · 10 posts

1. [F] Pharma Channel Intelligence: Turning Traceability-Code Data into Decisions
2. [S] O2O Pharma: The Terminal Intelligence Problem
3. [S] Distribution & 动销 Analytics: Modeling Sell-Through, Not Sell-In
4. [S] 补货 & 预警 Systems: Forecasting at the Store-SKU Level
5. [N] 陈列 (Display) Optimization: A Computer-Vision-Meets-Incentives Problem
6. [N] Traceability Codes as a Data Asset: What They Unlock
7. [S] Building a Pharma Channel Data Agent: Questions Reps Actually Ask
8. [N] Why Pharma Retail Data Is Messy and How to Model Around It
9. [N] Compliance Constraints in Pharma AI: What You Can and Can't Automate
10. [S] From Distribution Data to Territory Strategy: A Case Walkthrough

### Pillar 6 — Career / Thinking Frameworks (`/career`) · 8 posts

1. [F] What I Learned Moving from Goldman Quant to ByteDance DS to AI Solutions
2. [S] How to Build Rare Skill Combinations (and Why They Compound)
3. [S] China AI Career Paths: Where the Defensible Roles Are
4. [N] First Principles for Career Decisions: Optionality vs Depth
5. [N] How I Run a Personal Knowledge System
6. [N] Reading Like an Engineer: Turning Papers into Reusable Frameworks
7. [S] Building and Leading a Data/Algo/Eng Team: Roles and Mechanisms
8. [N] Performance Reviews for Technical Teams: Eval as a Management Tool

### Pillar 7 — Reading Notes (`/reading-notes`) · 15 posts

Free posts — capture what you already read. Rolling backlog, fill as you go:
1. [N] Paper note — (recsys / ranking)
2. [N] Paper note — (causal inference)
3. [N] Paper note — (LLM agents / tool use)
4. [N] Paper note — (RL / bandits for allocation)
5. [N] Paper note — (uplift / incrementality)
6. [N] Book note — (business strategy)
7. [N] Book note — (quant / markets)
8. [N] Book note — (org / management)
9. [N] Talk note — (AI eng conference)
10. [N] Talk note — (data science / experimentation)
11–15. [N] Rolling: one per paper/book/talk processed.

## Tally

| Pillar | Posts | Already done |
| --- | --: | --: |
| AI Agent Engineering | 18 | 1 |
| Data Science for Business | 20 | 3 |
| Algorithmic Growth / Ads / O2O | 22 | 6 |
| AI Business Architecture | 14 | 0 |
| Pharma Channel AI | 10 | 0 |
| Career / Thinking | 8 | 0 |
| Reading Notes | 15 | 0 |
| **Total** | **107** | **10** |

107 planned, 10 shipped → **97 to go.** Buffer of 7 absorbs ideas you'll drop.

## Execution order (first 90 days)

1. **Finish the 5 in-flight series first** (recsys 4-stage, ads bidding/pacing, A/B power & interference, causal DiD/uplift). Context is already loaded → ~25 posts, mostly [S]. Highest velocity.
2. **Front-load 15 notes** across pillars to build a publishing rhythm and fill the archive.
3. **Write the 6 flagship anchors** (the ✶ from "first 10 ideas") — these are the link-worthy, differentiated pieces that define the brand. Bilingual.
4. **Open the pharma + business-architecture pillars** with one flagship each, then notes.
5. **Reading notes run in parallel** — one per source processed, no extra research cost.

## Flagship anchors (the differentiated 6 — write these well, bilingual)

- Agent Development Is Management: Why Eval Is Performance Review
- A Practical Framework for AI Business Architecture
- From Quant Finance to O2O Marketing: Alpha, Beta, and Risk Exposure for Budget Allocation
- The Real Difference Between BI, Data Science, and AI Agents
- Translating Business Ambiguity into Technical Architecture
- What I Learned Moving from Goldman Quant to ByteDance DS to AI Solutions

## AI-Assisted Production Pipeline

**The core constraint, first:** your edge is *messy real business execution* — war stories, org constraints, "why this actually failed." AI cannot generate that. If you let it try, every post collapses into generic LLM commentary, which is the exact niche you're avoiding. So the division of labor is fixed and non-negotiable:

- **AI does:** research, scaffolding, prior-art surveys, diagrams, translation, formatting, fact-checking.
- **You do:** the framework, the war stories, section 5 (org/delivery constraints), judgment calls, what actually happened.

Rule: AI fills sections 1–4 with researched scaffolding; you own section 5–6 and every concrete anecdote. A post where AI wrote section 5 sounds like everyone else's.

### Tools mapped to the job

| Tool | Use it for |
| --- | --- |
| `deep-research` skill | Prior-art surveys, "state of the art" + "why naive solutions fail" sections, fact-checked claims with citations — the [S]/[F] research layer |
| Sub-agents (parallel) | Fan out: expand one topic into 8 outlines; draft 5 notes at once; survey 5 papers in parallel |
| `ocr-and-documents` | Mine slide decks / PDFs / internal docs → raw drafts. Convert, don't create |
| `llm-wiki` | Persistent research cache. Research a pillar once, reuse across the whole series — never re-research |
| `mermaid` / `arch-diagram` | Frameworks-as-diagrams — fast, distinctive, already wired into Hexo |
| Claude Code | Draft from your bullets, edit to your voice, EN→ZH translation, front-matter scaffolding |

### Anatomy of one post, by size

**Note [N] — ~30 min, minimal AI**
1. You brain-dump bullets (voice-to-text fine).
2. AI: format into note template, build the table/checklist, generate the mermaid diagram.
3. You: 5-min read-through, fix framing. No deep-research — these are pure you.

**Standard [S] — ~2 hrs**
1. You: write the framework + war story (the parts only you have). ~10 min.
2. `deep-research`: one scoped question feeding the prior-art / technical-design sections → cited material.
3. AI: weave research into sections 1–4 around your framework.
4. You: write section 5 (org/delivery), verify claims, add anecdotes.
5. AI: diagram + front-matter + cleanup.

**Flagship [F] — bilingual, the differentiated 6**
1. `deep-research` with a properly scoped question → full cited report as raw material.
2. You: lead the synthesis. This is your thesis; AI assists, doesn't drive.
3. AI: draft EN from your outline + research; run the verify step on every factual claim.
4. You: heavy edit for voice and war stories.
5. AI: EN→ZH translation, diagrams, both front-matters.
6. You: final pass on the ZH — it's your name on it.

### Batch workflow (the velocity unlock)

Per pillar sprint — research context loaded once, amortized across the whole series:
1. **Plan pass (1 agent):** expand the series into N outlines at once — problem, framework skeleton, what research each needs.
2. **Research pass (deep-research, batched):** one run per post that needs it; dump all findings into `llm-wiki` under the pillar tag so the series shares one cache.
3. **Draft pass (parallel sub-agents):** draft the notes; scaffold the standards around your frameworks.
4. **Your pass:** the irreplaceable layer — war stories, section 5, judgment, voice.
5. **Polish pass (AI):** diagrams, translation, front-matter, link-checking.

### deep-research playbook

- **Scope the question.** "auto-bidding" → bad. "current industry approaches to auto-bidding under ROI/budget constraints in display ads, key papers since 2020, known failure modes" → good. Answer its clarifying questions instead of skipping them.
- **One run per [S]/[F] post**, not per series — focused, citable material beats a sprawling survey.
- **Pipe findings into llm-wiki**, tagged by pillar. The next post in the series reads the cache, doesn't re-research.
- **Run the verify step on every flagship claim.** Credibility is the brand.
- **Never publish raw research.** It's input to your thinking, not the post.

### Guardrails (protect the brand)

- AI-drafted ≠ publishable. Every post gets your voice pass.
- Section 5 and all war stories are human-only.
- Delete any business anecdote AI invents ("in one project we saw…") — only your real examples ship.
- ZH posts get a human final pass; machine translation alone is a tell.

### Realistic throughput

| Type | Cadence (batched) | AI share |
| --- | --- | --- |
| Note | 3–4/week | format only |
| Standard | 2–3/week | research + scaffold sections 1–4 |
| Flagship | 1 per 1–2 weeks | research + draft + translate |

~5–6 posts/week in batch sprints → **97 remaining in ~4–5 months**, not 8. The deep-research + llm-wiki cache is what compresses it: research the pillar once, write the series fast.


## New System

我觉得这篇文章最有价值的地方，不是讲领导力技巧，而是讲一个人如何从：

> **“通过控制自己获得成功”**
>
> 走向
>
> **“通过影响他人成就事业”**

这其实同时发生在：

* 婚姻
* 育儿
* 管理
* 创业

甚至是人生下半场。

---

# 标题候选

### 版本1（最贴近你的感悟）

**从控制到影响：35岁后，我重新理解了领导力、婚姻和育儿**

---

### 版本2（更有传播性）

**为什么优秀的人更容易被身边的人气到？**

副标题：

> 从张瑶、播客翻车到育儿，我终于看懂了领导力的本质

---

### 版本3（最像个人成长文章）

**我的35岁课题：学会与不完美的人合作**

---

# 一、播客事件：愤怒从何而来

## 一个让我差点爆炸的下午

* 录播客
* 效率极低
* 对方准备不足
* 时间被浪费

当场忍住了。

但结束后开始内耗。

---

## 我发现问题不在张瑶

换一个人：

* 张瑶
* 薛
* 妈妈
* 同事
* 客户

类似情绪都会出现。

于是我开始怀疑：

> 真正让我痛苦的，到底是谁？

---

# 二、一个残酷发现：我在要求别人解决我的问题

很多愤怒背后其实不是：

> 你为什么这么差。

而是：

> 你为什么不能帮我分担一点。

本质上是在期待：

* 别人更专业
* 别人更负责
* 别人更主动

这样我的人生就容易一点。

但现实不是这样。

---

## 弱者思维与强者思维

弱者：

```text
环境不好
同事不行
客户太难
```

强者：

```text
行有不得
反求诸己
```

不是自责。

而是寻找自己能影响的部分。

---

# 三、我最大的误区：把高标准变成了高期待

过去的人生经验：

* 高考
* CMU
* Goldman
* 字节

让我形成一个信念：

> 认真就能成功。

但管理世界不是这样。

---

## 标准和期待的区别

标准：

> 会议提前准备

期待：

> 所有人都像我一样重视时间

标准合理。

期待注定失望。

---

# 四、领导力的本质：从控制人到设计系统

这是我最大的顿悟。

过去：

```text
我做好
=
事情做好
```

现在：

```text
别人 × 我
=
事情做好
```

---

## Expert 与 Leader 的区别

| Expert | Leader  |
| ------ | ------- |
| 自己解决问题 | 让系统解决问题 |
| 依靠能力   | 依靠机制    |
| 管理自己   | 影响别人    |
| 追求正确   | 推动结果    |
| 控制     | 容错      |

---

## 真正成熟的领导者

不会想：

> 为什么别人这么蠢？

而会想：

> 为什么这个系统会产生这样的结果？

例如：

播客翻车。

不是：

> 张瑶不靠谱。

而是：

* 为什么没有提纲？
* 为什么没有彩排？
* 为什么没有责任分工？

---

# 五、婚姻：你想要的是伴侣，还是另一个自己？

这是很多冲突来源。

我发现自己经常希望另一半：

* 更自律
* 更高效
* 更有责任感

换句话说：

> 希望她像我。

但婚姻最大的课题可能是：

> 接受对方不是自己。

---

## 婚姻不是管理

管理可以：

* KPI
* SOP
* 绩效

婚姻不行。

婚姻更接近：

> 理解与包容。

---

# 六、孩子：你无法教会孩子自己不会的东西

播客里提到教育孩子。

让我想到一个问题：

> 严于律己，宽于待人。

我并没有做到。

---

## 孩子不会听你说什么

孩子只会看：

你怎么做。

---

如果父亲：

* 总在抱怨别人
* 总在控制别人
* 总在生气

孩子学到的也是这些。

---

真正的教育是：

> 成为你希望孩子成为的人。

---

# 七、员工：不要培养执行者，而要培养系统

管理最大的错觉：

> 找到优秀员工就解决问题。

现实：

优秀员工很少。

普通员工很多。

---

优秀管理者做的是：

让普通人也能成功。

例如：

错误说法：

> 你认真一点。

正确说法：

> 明天下午6点前给我3个观点和2个案例。

---

## 从“靠人”到“靠机制”

高水平团队依赖：

* SOP
* Checklist
* 反馈机制

而不是依赖天才。

---

# 八、人生下半场最大的课题

过去30年：

我的成功来自：

> 控制自己。

未来30年：

我的成长来自：

> 学会与他人合作。

---

## 学会销售

本质是：

理解别人。

---

## 学会婚姻

本质是：

接纳别人。

---

## 学会育儿

本质是：

影响别人。

---

## 学会管理

本质是：

成就别人。

---

# 结尾：从控制到影响

我逐渐意识到：

人生很多痛苦来自于试图控制无法控制的东西。

而成长的方向恰恰相反：

> 从控制别人，到管理自己；
>
> 从改变别人，到影响别人；
>
> 从依靠意志力，到设计系统；
>
> 从单打独斗的专家（Individual Contributor），到成就他人的领导者（Leader）。

或许这就是我35岁的人生课题：

**学会与不完美的人合作，也学会与不完美的世界相处。**

---

如果要更符合你的经历（Goldman → 字节 → AI创业 → 父亲 → 团队负责人），我甚至会把文章再升级成一个更大的主题：

> **《成为父亲之后，我终于开始理解什么是领导力》**

因为你会发现：

* 管理员工
* 对待妻子
* 教育孩子
* 创业带团队

最后考验的其实是同一种能力：

**爱、耐心、边界感，以及影响而非控制。**

这会比单纯写领导力文章深刻得多。
