---
title: Recommender Systems 101 (2) Recommendation Strategy
date: 2023-12-14 12:00:00
permalink: /en/recsys/101-intro-2/
categories:
  - Technology
tags:
  - Recommendation
  - AI & Machine Learning
updated: 2024-12-14 13:30:00
summary_en: A practical overview of recommendation strategies, from matching objectives to ranking and user experience tradeoffs.
summary_zh: 从目标设定到排序与体验平衡，整理推荐策略的核心思路。
topic_cluster: recommendation
public_focus: Public-safe discussion of recommendation strategy, user value, and system tradeoffs.
confidentiality_safe: true
site_locale: en
lang_switch: /recsys/101-intro-2/
last_updated: 2026-05-31
---

- [Three Elements of Recommender Systems: Co-Evolution of Users, Information, and Platform](#three-elements-of-recommender-systems-co-evolution-of-users-information-and-platform)
- [Role of the Strategy Product Manager](#role-of-the-strategy-product-manager)
  - [Common Recommendation Strategies](#common-recommendation-strategies)
  - [User Experience Strategy](#user-experience-strategy)
  - [Cold Start Strategy](#cold-start-strategy)
  - [Ecosystem Strategy](#ecosystem-strategy)
  - [Layout and Interaction Design](#layout-and-interaction-design)
- [Reference](#reference)

## Three Elements of Recommender Systems: Co-Evolution of Users, Information, and Platform

**In recommender systems, product definition often plays a greater role than algorithms.** The reason is that modern recommendation algorithms have matured; **the key lies in matching the right scenario.** For example:

### I. Aligning with Information Scarcity to Richness Phases

1. **Information Scarcity Phase (Daily uploads < 100)**
   - *Scenarios*: Niche professional forums, small community sites.
   - *Strategies*: Basic sorting methods, such as reverse chronological order or popularity sorting.
   - *Focus*: Designing clean layout displays to ensure core content is successfully reached.
2. **Information Accumulation Phase (Daily uploads 1,000+)**
   - *Scenarios*: Vertical platforms (local services, professional knowledge hubs).
   - *Strategies*:
     - Build a topic system to achieve structured content presentation.
     - Design content guide mechanisms to promote deeper browsing.
     - Introduce basic recommendation algorithms, such as topic-based collaborative filtering.
3. **Information Abundance Phase (Daily uploads 10,000+)**
   - *Scenarios*: Large portal sites, e-commerce giants.
   - *Strategies*: Fully implement personalized recommendations, building user-item matching models.
   - *Focus*: Balancing precision and diversity to avoid information cocoons.

### II. Aligning with Platform Growth Phases

1. **Startup Phase**
   - *Characteristics*: Limited resources (hardware, algorithms, information volume), lack of user logs.
   - *Strategies*:
     - Employ lightweight algorithms (such as TF-IDF, popularity sorting).
     - Design structured knowledge systems.
     - Prioritize touchpoint efficiency for core content.
   - *Principle*: Algorithms over pure manual operation; simple and effective over complex models.
2. **Growth Phase**
   - *Focus*: Building the recommendation ecosystem.
   - *Strategies*:
     - Mature UGC production mechanisms.
     - Establish user growth frameworks.
     - Optimize content sourcing strategies.
   - *Goal*: Lay the data foundation for personalized recommendations.
3. **Mature Phase**
   - *Focus*: Balancing business value and user experience.
   - *Core Metrics*: User retention, dwell time, conversion rate.
   - *Strategies*:
     - Build multi-objective optimization systems.
     - Design commercialized recommendation slots.
     - Optimize long-term user experience.

### III. Aligning with User Cognitive Phases

1. **User Cold Start**
   - *Core Goal*: Build user trust, promote retention.
   - *Strategies*:
     - Showcase top-tier high-quality content.
     - Leverage basic signals like device type and geographical location.
     - Design guided interest selectors.
     - Avoid premature monetization.
   - *Principle*: Experience first to cultivate user stickiness.
2. **Profile Cultivation Phase**
   - *Core Goal*: Complete the user profile.
   - *Strategies*:
     - Employ **Exploration-Exploitation** (EE) mechanisms.
     - Maintain list diversity.
     - Keep commercialization under strict bounds.
   - *Focus*: Balancing recommendation precision with exploration space.
3. **Profile Stable Phase**
   - *Core Goal*: Optimize long-term experience.
   - *Strategies*:
     - Design mechanisms to break out of filter bubbles.
     - Establish commercialized ad-recommendation blending systems.
     - Optimize social recommendation features.
   - *Principle*: Balance **commercial value and user experience** to achieve sustainable growth.

## Role of the Strategy Product Manager

Strategy PMs are responsible for platform value and user experience. Common responsibilities include:

1. **Defining Use Scenarios**
   - Such as "You might also like," "Cross-selling," "Frequently bought together," etc. Each requires tailored strategies.
2. **Clarifying Business Goals**
   - Shopping cart scenario: fast checkout + auxiliary items.
   - Homepage: based on full user profiles.
   - Cross-selling: balancing discount thresholds and easy-to-add items.
   - Long-term value: retention rate, user path optimization.
3. **Determining UI Designs**
   - Requires a combined understanding of algorithms, UI, user behavior, and business models.
4. **Constructing Model Data**
   - Handling data differences:
     - *Feature construction*: Can historical price ranges be used directly as a feature? Not quite—gender-based differences across categories are massive. However, brand preferences and price tiers can be migrated.
     - *Scenario-specific strategies*: For viewed items, judge by purchase intent. For purchased items, account for repurchase cycles. For video, separate short vs. long video.
     - *Leveraging prior knowledge*: Prioritize domain rules over raw algorithms for deterministic problems (e.g., using parenting knowledge for maternal and infant product recommendations).
5. **Algorithmic Experiments**
   - Defining objective metrics (CTR, CVR, etc.).
     - Understanding the role of evaluation metrics (e.g., applying F1 score in different scenarios).
   - Structuring input sources and data schemas.
   - Leading model iterations.
6. **Diagnosing Problems & Continuous Iteration**
   - Case studies, online experiments.
   - **Recommendation System Evaluation**:
     - *Precision*: AUC, UAUC, etc.
     - *Coverage/Diversity*: Herfindahl-Hirschman Index (HHI), Gini index.
     - *Multi-objective balance*: balancing content consumption, author ecosystem, and user retention.
     - *Metric validity*: Human evaluation systems.
   - **System Iteration Ideas**:
     - *Data introduction*: Enriching user profiles and tag systems.
     - *Retrieval optimization*: Multi-channel retrieval, efficiency audits.
     - *Ranking optimization*: Multi-objective balancing.
     - *Rule application*: Subjective overrides, real-time rules.

### Common Recommendation Strategies

### User Experience Strategy

User experience is the critical factor for recommender systems; sound user experience strategies boost user satisfaction and platform stickiness. Strategies focus on diversity, quality, and recency of content by addressing duplicates, filtering low-quality items, and handling spatial/temporal constraints.

- **Duplicate Optimization**
  - Complete duplicates: Identifying plagiarism, copies.
  - Detail page duplicates: De-duplication rules.
  - List page/Title/Similarity duplicates: Scattering/diversity rules.
- **Content Quality**
  - Low-quality content identification: User negative feedback + manual annotation.
  - Down-ranking strategies.
  - Sourcing and boosting top-tier content.
- **Spatial and Temporal Constraints**
  - Recency: Processing short, medium, and long-term fresh content.
  - Locality: Localization and regional distribution strategies.

### Cold Start Strategy

The cold start problem is a classic challenge. It refers to the situation where the system lacks sufficient user history or item interaction data, making it difficult to generate accurate recommendations.

- **User Cold Start**: Leveraging device information, registration data, and basic context to quickly establish an initial profile.
  - *Explicit interest gathering*: Guiding users to select initial interest categories.
  - *Implicit feature inference*: Inferring user cohort characteristics from IP address, device type, etc.
  - *Lookalike mapping*: Matching new users to similar existing cohorts.
  - *Popular content recommendation*: Showcasing the platform's high-quality trending items.
  - *Interest exploration*: Designing diverse recommendations to probe interest boundaries.
  - *Immediate feedback loop*: Giving higher weights to the user's initial clicks to speed up profile building.
- **Item Cold Start**: Analyzing inherent attributes like title, cover, and description.
  - *Text extraction*: Using NLP to parse topics and keywords.
  - *Multimodal analysis*: Incorporating image and video features.
  - *Similarity mapping*: Linking new items with similar trending items.
  - *Long-tail coverage*: Setting up exposure guarantee mechanisms for new items.
  - *Traffic test*: Routing new items to a small sliver of traffic to measure performance.
  - *Creator trust transfer*: Leveraging the creator's historical record to estimate initial quality.

### Ecosystem Strategy

Ecosystem strategy is the core support framework, focusing on the **positive loop between creators, content, and users**.

A healthy ecosystem balances all parties' interests, fostering quality content creation, improving user experience, and driving sustainable growth. Effective ecosystem strategies create a positive loop: **"high-quality creators produce premium content, premium content attracts more users, and users provide feedback and incentives to creators."**

- **Creator / Publishing Ecosystem**
  - Tools and guidelines: Sponsoring content creation tools, publishing guides, and best practices.
  - Creator quality index: Rating creators by originality, health, and professionalism.
  - Platform tone guidelines: Steering creation directions via recommendation biases.
  - Creator incentives: Revenue sharing, creator funds, and honorary tier systems.
  - Governance: Fostering new creators, anti-spam, and creator training.
- **Content Ecosystem**
  - Quality assurance: Audits, user reports, and automated low-quality filters.
  - Multi-format support: Diversifying media (text, images, video, audio) and genres (knowledge, entertainment, news).
  - Long-tail support: Providing exposure opportunities for high-quality niche content.
  - Distribution balance: Controlling ratios of trending vs. fresh content.
  - Safety & Copyright: Filtering sensitive content, copyright protection.
- **User Ecosystem**
  - *User segmentation*: Tailored recommendations based on user engagement levels.
    - Low-engagement users:
      - *Definition*: New, low-activity, or returned users.
      - *Active churn-risk users*: Users whose activity levels are dropping.
      - *Strategy*: Content recommendation adjustments and ad exposure protection.
    - Personalization strategies:
      - Interest exploration.
      - Diversity enhancement.
      - Long-term interest tracking.
      - Historical user cohort shifts analysis.
    - Off-platform users:
      - Surveys and competitive analysis.
      - Sharing link optimizations.
      - Trending event tracking.
    - Push optimization:
      - Multi-touch attribution: Accurately attributing app opens to push events.
      - Activation path optimization: Tuning clicks and app startup pipelines.
  - *Community atmosphere*: Fostering healthy interactions, comment moderation.
  - *User feedback*: Weight designs for likes, favorites, and shares.
    - Understanding how trending content propagates and identifying key nodes.
  - *User retention*: Personalized push, interest cultivation, and social loops.
    - User journey: Guiding new users to become power users.
    - Diagnosing dropping activity.
    - DAU, day-1 retention, and stay time attribution.
    - Tracking historical shifts in user cohorts.

### Layout and Interaction Design

Interaction design directly affects user experience and recommendation effectiveness. Smart designs reduce choice fatigue, improve data gathering, and naturally guide exploration:

- **Reducing Choice Fatigue**
  - *Example*: Netflix's autoplay previews, enabling users to preview content without clicking.
  - *Example*: Spotify's "Daily Mix" playlists, offering personalized music with a single click.
- **Improving Data Sourcing Quality**
  - *Example*: YouTube's "Not interested" and "Don't recommend channel" buttons, capturing precise negative feedback.
  - *Example*: Amazon's separation of star ratings and written reviews, lowering feedback friction.
- **Guiding User Exploration**
  - *Example*: TikTok's "Discover" page, highlighting new content categories using visual layouts.
  - *Example*: Pinterest's relevant content grids, naturally steering users into related interests.
- **Enhancing Recommendation Transparency**
  - *Example*: LinkedIn's "Because you followed X" recommendation explanations.
  - *Example*: Facebook's "Why am I seeing this ad?" disclosures.
- **Optimizing Instant Feedback Loops**
  - *Example*: Instagram's double-tap to like, simplifying feedback.
  - *Example*: Medium's progressive reading bar, implicitly gathering content consumption speed.

These designs improve user experience and feed high-quality training logs back to recommendation models, forming a positive optimization loop.

## Reference

- [DataFun: Thoughts on Recommendation Strategy Framework](https://www.datafuntalk.com/p/t_pc/course_pc_detail/video/v_6203c245e4b04d7e2fca6306)
- [Weibo Recommendation Strategy PM, Xiu-Jian Xu](https://zhuanlan.zhihu.com/p/667304142)
- [Strategy Product Manager: Models and Methodologies, Qing Shi-Wu](https://weread.qq.com/web/bookDetail/f42323b0811e7870eg018610)
- [Strategy Product Manager in Practice, Qing Shi-Wu](https://weread.qq.com/web/bookDetail/f42323b0811e7870eg018610)
- [Content Algorithms: Turning Content into Value](https://weread.qq.com/wrpage/book/share/934462?from=pingshuke)
