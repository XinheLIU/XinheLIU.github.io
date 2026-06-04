---
title: Computational Advertising (1) Introduction to Ad Business
date: 2024-07-15 19:33:48
permalink: /en/ads/intro-1/
categories:
  - Technology
tags:
  - Ads
  - AI & Machine Learning
updated: 2024-12-11 13:30:00
summary_en: A business and systems introduction to internet advertising, including the marketplace, advertiser incentives, and platform constraints.
summary_zh: 从生意逻辑、广告主诉求和平台约束出发，介绍互联网广告的整体框架。
topic_cluster: ads-systems
public_focus: Public-safe overview of ads marketplace logic, incentives, and platform design constraints.
note_type: system-diagram
featured_asset: /ads/intro-1/Ads-Biz.png
confidentiality_safe: true
site_locale: en
lang_switch: /ads/intro-1/
last_updated: 2026-05-31
---

# Internet Advertising (1) Introduction to Ad Business

- [Internet Advertising (1) Introduction to Ad Business](#internet-advertising-1-introduction-to-ad-business)
  - [The Business Logic of Advertising](#the-business-logic-of-advertising)
    - [Three-Party Game](#three-party-game)
  - [Advertising Logic from the Advertiser's Perspective](#advertising-logic-from-the-advertisers-perspective)
    - [Advertiser Budget Decision Logic](#advertiser-budget-decision-logic)
    - [The Role of Marketing Science / Marketing Technology (MarTech) / Data Science](#the-role-of-marketing-science--marketing-technology-martech--data-science)
  - [Advertising Business from the Platform's Perspective](#advertising-business-from-the-platforms-perspective)
    - [What Happened in the Internet Ad Market in the Last 10 Years (2013-2023)](#what-happened-in-the-internet-ad-market-in-the-last-10-years-2013-2023)
    - [Future Trends](#future-trends)
  - [Reference](#reference)

## The Business Logic of Advertising

Internet advertising began in 1978 when Digital Equipment Corporation sent the first email ad on ARPAnet. In 1994, *Wired* magazine's website, Hotwired, launched the first banner ad, achieving an initial click-through rate of 44%, which quickly declined as banner ads became widespread. China's internet ad market started in March 1997 when IBM and Intel placed banner ads on Chinabyte. Search advertising was introduced by Yahoo in 1995, and in 1998, Goto.com (later renamed Overture) introduced pay-per-click and keyword bidding models. This company was later acquired by Yahoo, becoming the precursor to search ad bidding systems for Google and Baidu. Search advertising has high relevance because it is based on users' active queries. In 1997, pop-up ads were created to capture immediate user attention. Subsequently, rich media technology was widely applied to display ads, using animations, sound, video, and interactive elements to boost engagement. Mainstream websites usually configure these ads to auto-close or shrink, providing close options for users.

{% asset_img ads-history.png "History of Internet Advertising" %}

Today, advertising has become one of the most vital business models on the internet. Taking 2023 data as an example:

- **Google (Alphabet)**: Ad revenue accounts for approximately 80% of total revenue, making it the largest digital ad platform globally.
- **Meta (Facebook)**: Ad revenue accounts for approximately 98% of total revenue, primarily driven by Facebook and Instagram.
- **Alibaba**: Ad revenue accounts for approximately 40% of total revenue, primarily driven by Taobao and Tmall.
- **ByteDance**: Ad revenue accounts for approximately 80% of total revenue, primarily driven by Douyin and Toutiao.
- **Baidu**: Ad revenue accounts for approximately 60% of total revenue, primarily driven by search bidding.
- **Tencent**: Ad revenue accounts for approximately 15% of total revenue, primarily driven by WeChat.

### Three-Party Game

Essentially, advertising is packaging and selling users' attention to merchants, commonly referred to as the "traffic business." The main participants include advertisers, publishers (media platforms), and various upstream and downstream third parties.

{% asset_img Ads-Biz.png "Advertising Business Ecosystem" %}
{% asset_img Online-Ads-Biz-Canvas.png "Internet Advertising Business Canvas" %}

The three core roles in the traffic monetization business are: **Advertisers** (who spend money), **Media Platforms** (who make money), and **Users** (who spend time). The platform's goal is to maximize ad revenue; the advertiser's goal is to maximize ROI and scale; and users care about their app experience and content satisfaction (ads are not always entirely negative). The business model of internet advertising is essentially using computing power to facilitate the most efficient transactions among these three parties (matching business). Large tech companies dedicate major efforts to building systems that efficiently balance the interests of these three parties to achieve maximum transactions.

{% mermaid %}
graph LR
    A["Ad Delivery: A Constrained Optimization Problem"]
    
    A --> B["Constraint: User Experience"]
    A --> C["Constraint: Client Experience"]
    A --> D["Maximize: Matching Efficiency (User × Ad)"]
    
    B --> B1["Block unsafe/non-compliant ads (Risk Control)"]
    B --> B2["Ad load control (adload/adgap)"]
    B --> B3["Frequency capping on similar ads"]
    B --> B4["Cap exposure of low-quality ads"]
    
    C --> C1["Frequency control (Frequency / Total conversions / Single campaign conversions)"]
    C --> C2["Cost and ROI delivery"]
    C --> C3["Bidding strategies"]
    C --> C4["Compensation policies"]
    
    D --> D1["Exploration & Exploitation (EE) problem"]
    D1 --> D2["Precise models (CTR/CVR/DeepCVR)"]
    D1 --> D3["Cold start strategies (Exploration)"]
    D --> D4["Constraint: Machine overhead (Diminishing marginal returns)"]
    D --> D5["Multi-stage matching (Retrieval/Pre-ranking/Fine-ranking)"]
{% endmermaid %}

In this game, the factors determined by each party are:

#### What Advertisers Determine:

- **Bidding**
  - The ad system is essentially an auction system where the platform sells each user impression to advertisers through auction mechanisms. Therefore, bidding is the most vital way for advertisers to express their value.
  - Advertisers need to balance ROI and volume: higher ROI targets (cost control) usually lead to less traffic (lower bid competitiveness).
  - *Attribution Problem*: The hardest task for advertisers is calculating their true ROI, which involves attribution—calculating how many conversions were actually caused by the ad. Advertisers can choose self-attribution, publisher-side attribution, or third-party attribution. The main difficulty is that the media platform and the advertiser each hold only a subset of the data.
- **Creative / Material**: Videos, images, copywriting, etc.
  - The advertiser's most vital tool, which usually determines over 50% of the ad campaign's success.
  - With the rise of marketing content, integration of ads and organic feeds, and AIGC, platforms encourage high-quality materials, elevating the importance of creatives.
- **Infrastructure (Campaigns)**
  - Refers to creating and pausing ad campaigns/groups. Large advertisers copy campaigns to capture more traffic (due to system variance), but platforms prefer bidding to be driven by price and creative quality, implementing strategies to combat campaign duplication.
  - Platforms utilize soft and hard penalties to suppress duplicate campaigns and optimize algorithms to reduce systematic variance (e.g., reducing the weight of ID-based features).
- **Targeting**
  - Primarily used by advertisers to select specific traffic and audiences when their bidding target does not align perfectly with their ultimate business goals. Advanced advertisers use ADX/RTA, while small clients rely on pre-built audience segments.
  - In deep bidding scenarios, manual targeting has diminished in value, as models automatically align conversion costs.
- **Data Exchange**: Passing advertiser logs (such as real-time conversions) back to platforms or using joint modeling and federated learning to boost platform matching efficiency.
- **Product Portfolio**: Optimizing budget allocations across multiple channels to maximize global ROI and acquisition scale.

#### What Platforms Determine:

- **Improving Matching Efficiency**
  - Optimizing ad systems, including ranking algorithms, engineering infrastructure, and computing costs. Essentially, it is an optimization of recommendation and search systems.
  - Auction design: structuring better ranking objectives (such as incorporating user experience and ecosystem health) and fusion strategies.
  - Non-algorithmic interventions: using manual boost strategies for targets that machine learning cannot predict well (e.g., ad cold start, user experience protection).
- **Bidding (Products & Strategies)**: Heading towards automation.
  - After receiving the advertiser's bid, the platform applies various products and strategies, such as:
    - *Risk Control*: Since bidding and billing points are often separate, the platform calculates the advertiser's true value and dynamically adjusts bids to ensure costs do not deviate too far.
    - *Pacing (Flow Control)*: Controlling ad budget delivery to ensure it is spent smoothly and reasonably throughout the day based on traffic predictions.
    - *Auto-bidding*: Advertisers specify only their budgets instead of bids, and the platform optimizes bidding dynamically. This shifts bidding power from advertisers to the platform, leveraging the platform's data advantages. Highly popular globally.
    - *Bid Disturbance*: Correcting for system-level CTR/CVR over- or under-estimations to protect advertiser experience.
    - Combined ranking and bidding strategies (e.g., ad cold start, pacing).
- **Ad Attribution**
  - While advertisers use attribution to measure ROI and allocate budgets, platforms use it for model training (sample joining) and measuring ROI to guide product iterations. Platforms also productize attribution tools for clients (Incremental Value Measurement services).
- **Ad Product Design**: Deepening conversion targets.
  - Internet ad products tend to **guide advertisers to bid for targets closer to the final transaction**.
    - Deeper targets align better with the advertiser's true ROI, simplifying campaign management and enhancing platform control.
    - This requires stronger predictive and data capabilities on the platform, as bidding occurs before impressions. The platform must predict CTR, CVR, and ROI accurately. Historically, ads were sold by impressions (CPM). As technology advanced, bidding progressed to clicks (CPC), conversions (CPA), and ROI (oCPC/oCPM).
    - Platforms push advertisers to adopt closed-loop transactions and ROI-based bidding. This boosts transaction efficiency and locks advertisers into the platform's ecosystem due to high data migration costs.

| Ad Type | Bid Type | Name | Bid | Billing Point | eCPM (Revenue per Mille) | Billing Cost |
|---|---|---|---|---|---|---|
| **Performance Ads** | CPM | Cost per Mille | CPM_bid | send/show | CPM_bid * 1000 | eCPM / 1000 |
| | CPC | Cost per Click | CPC_bid | click | CPC_bid * CTR * 1000 | eCPM / (CTR * 1000) = CPC_bid |
| | CPA | Cost per Action | CPA_bid | convert | CPA_bid * CTR * CVR * 1000 | eCPM / (CTR * CVR * 1000) = CPA_bid |
| | oCPC | Optimized CPC | CPA_bid | click | Stage 1: CPC_bid * CTR * 1000 <br> Stage 2: CPA_bid * CTR * CVR * 1000 | eCPM / (CTR * 1000) = CPA_bid * CVR |
| | oCPM | Optimized CPM | CPA_bid | send/show | Stage 1: CPM_bid <br> Stage 2: CPA_bid * CTR * CVR * 1000 | eCPM / (CTR * CVR * 1000) = CPA_bid * CTR * CVR |
| **Brand Ads** | CPT | Cost per Time | Contract | Contract | - | - |
| | GD | Guaranteed Delivery | Contract | Contract | - | - |

#### What Users Determine:

- **Positive and Negative Feedback**
  - Platforms protect user experience while probing users' tolerance limits for commercial content. They collect feedback through various mechanisms:
    - *Explicit*: Likes, favorites, shopping cart adds, dislikes, reports.
    - *Implicit*: Dwell time, bounce rates, query reformulations.
    - Surveys (NPS) and customer service logs.
    - *Ultimate behavior*: User churn.
- **Incentives**
  - With personalized couponing, platforms have designed ad products integrated with shopping coupons, sharing costs with advertisers to stimulate user purchases.

## Advertising Logic from the Advertiser's Perspective

### Advertiser Budget Decision Logic

Advertising is a B2B business. Budget allocations involve business cases, organizational approvals, and buy-ins. The cycle is long, and stakeholders tend to make conservative decisions, which gives leading traffic platforms strong scale effects and barriers to entry.

1. **Two Budget Systems**:
   - *Planned Budget*:
     - *Target*: Large corporations, listed and pre-IPO companies.
     - *Features*: Decision-making is based on **precision rather than real-time efficiency** on an annual or quarterly basis.
     - *Focus*: The top priority is spending the allocated budget under each line item, followed by efficiency.
     - *Example*: From a sales perspective, meeting clients around the third-to-last week of each fiscal quarter is the optimal time to capture unspent budgets.
   - *Rolling Budget*:
     - *Target*: Companies with fast product-sales-cash cycles, especially e-commerce and internet startups.
     - *Features*: Allocating a specific proportion (XX%) of the previous cycle's revenue to the next cycle (usually on a weekly basis).
2. **Two Elements of Budget Decision Processes**:
   - *Organizational Structure*:
     - *Principle*: Budget decisions follow a "top-down" decomposition.
     - *Features*: Different organizational levels decide budget allocations at different nodes.
     - *Impact*: Decision-making paths vary widely based on client organizational setups.
   - *Evaluation Elements*:
     - *Principle*: Budgets are tied to performance targets.
     - *Key*: Chasing short-term returns on spend is a political necessity.
     - *Reality*: Not all budgets yield clear short-term revenue.
     - *Example*: The industry debated "brand vs. performance balance"—how much to invest in long-term brand building vs. short-term conversion ads.

#### Budget Decision Workflow:

1. **Node 1: Business Goals to Marketing Budgets**
   - Advertisers adjust marketing budgets annually based on strategic business goals (combining competitor benchmarks and third-party market research). Decisions lean towards three directions:
     - *Revenue First*: Suitable for pre-IPO companies focusing on valuation, targeting X times revenue growth.
     - *Profit First*: Suitable for mature or declining companies focusing on cost control, targeting X% cost reduction under similar efficiency.
     - *Market Share First*: Since a 1% increase in market share can bring a 5-10% price premium, budgets are calculated based on the investment needed to capture targeted market share.
2. **Node 2: Brand vs. Performance Allocation**
   - Typically the first cut in budget allocation:
     - *Brand budget*: Allocated to the traditional CMO (primarily media buying).
     - *Performance budget*: Allocated to E-commerce/Trade Marketing teams.
     - *Special budget*: CEO/COO-level decisions for major events (e.g., Olympic sponsorships).
     - Recently, a fourth path has emerged: specialized budgets for all-in-one mega platforms (Tencent, ByteDance, Alibaba).
     - *Decision Logic*:
       - Driven by senior executives utilizing data to measure channel-specific ROIs.
       - Performance ads are easier to compute using attribution or Marketing Mix Models (MMM).
       - Brand ads are notoriously hard to calculate; traditional marketing theories do not link cleanly with "growth." CMOs face shrinking brand budgets in favor of trade/e-commerce performance.
       - Struggling advertisers increase performance budgets for quick cash, while successful ones maintain brand investments. Brand budgets will not be wiped out; the pendulum swing between brand and performance aligns with economic cycles.
3. **Node 3: Marketing Mix Model (MMM) Channel Allocation**
   - Performance budgets are split into online (e-commerce channels) and offline retail (aligned with sales distribution structures).
   - Brand budgets are split across different tracks, partnering with agencies to identify the optimal mix of channels to maximize overall ROI.
     - *Tracks*:
       - **Traditional Media**: TV, newspapers, magazines, radio. Measured by ratings. Benchmarks: CCTV, top 5 satellite TV channels.
       - **Digital Media (Hard Ads)**: Display ads, bidding. Measured by iGRP (N+Reach). Benchmarks: Ocean Engine, Tencent.
       - **Social Media (Soft Ads)**: Influencers, stars, content. Measured by followers, likes, shares. Benchmarks: Weibo, Xiaohongshu.
       - **Out-of-Home (OOH)**: Elevators, cinemas, subways, airports. Measured by OTS (Opportunity to See) and OTC (Opportunity to Contact). Benchmark: Focus Media.
       - **Search**: Baidu, 360, Sogou. Measured by CTR, click volume. Benchmark: Baidu.
       - **AIoT**: OTT, smart speakers, smart home appliances. Benchmarks: Huawei, Xiaomi.
     - *Difficulties*: Each track has its own measurement system, making cross-channel integration exceptionally difficult.
     - Advertisers usually reserve a small portion (5%) of budget for exploring new media channels without strict KPIs.
4. **Node 4: Media Selection Within Channels**
   - Jointly decided by the Media Head and Procurement Head. Budget splits within the same track are zero-sum.
   - Requires balancing price, volume, and performance across different media publishers.
   - Digital hard ads are assessed and settled based on Reach.
5. **Node 5: Traffic Selection**
   - After determining a specific media publisher's budget, advertisers evaluate different ad formats (bidding, CPT dot bookings), placements, and price options.
   - The final plan establishes the marketing mix (horizontal allocation) and serialization (vertical frequency sequencing per user).
   - Media platforms optimize their systems to deliver targeted value to advertisers using minimum impressions (efficiency).

#### Budget Pool Illustration:

{% mermaid %}
graph LR
    Start["Business Goals"] --> Budget["Marketing Budget"]
    
    Budget --> Brand["Brand Ads"]
    Budget --> Effect["Performance Ads"]
    Budget --> Mega["Special Campaigns (Mega)"]
    Budget --> Platform["Platform Budget"]
    
    Brand --> Traditional["Traditional Media"]
    Brand --> Digital["Digital Media (Hard)"]
    Brand --> Social["Social Media (Soft)"]
    Brand --> Outdoor["Out-of-Home (OOH)"]
    Brand --> Search["Search"]
    Brand --> AIOT["AIoT"]
    
    Effect --> Ecommerce["E-commerce Ads"]
    Effect --> Trade["Trade Marketing"]
    
    Mega --> Sports["Sports Marketing"]
    Mega --> Events["Major Events"]
    
    Social --> MediaA["Media A"]
    Social --> MediaB["Media B"]
    Social --> MediaC["Media C"]
    
    MediaA --> FlowA["Placement A"]
    MediaB --> FlowB["Placement B"]
    MediaC --> FlowC["Placement C"]

    classDef red fill:#ff0000,color:#fff
    class Platform,AIOT red
{% endmermaid %}

### The Role of Marketing Science / Marketing Technology (MarTech) / Data Science

Historically, these technical tools solved the following advertiser budget challenges:

- **Business Goals to Marketing Budgets**: Combining historical, macroeconomic, and competitor data to forecast future GMV, revenue, and market share, utilizing business analysis and time-series forecasting.
- **Brand vs. Performance Allocation**
  - *Synergy strategies*: Custom research to identify optimal budget splits, maximizing returns (accounting for attribution, optimization, frequency, etc.).
  - *Measurement*: Bridging brand and performance metrics (e.g., Douyin's 5A framework—translating GMV targets into required reach across audience relationship stages).
  - *Incremental value*: Measuring true ad lift via incrementality testing (withholding ads from a control group) or offline models.
  - *Brand equity*: Measuring share-of-voice (Baidu index, BrandZ).
- **Marketing Mix / Traffic Selection**: Solved by Marketing Mix Modeling and attribution.
  - Attribution maps conversions at the individual user level, identifying which touchpoint led to a specific transaction.
  - MMM analyzes data at the aggregate level (e.g., by publisher or channel), assessing the impact of marketing combinations on final transactions.
- **Media Selection**
  - Reach-based optimization is primarily used in digital hard ads:
    - *Cross-media synergy* is triggered when the target Reach is huge and a single publisher lacks sufficient inventory.
  - Core algorithms:
    - MixReach (cross-media Reach curves).
    - Reach Curve (cross-screen Reach curves).
    - *Goal*: Optimization algorithms to help advertisers capture maximum Reach at minimum budgets.
  - *Challenges*: Reach complexity, label inconsistencies (e.g. publisher A rates an ID as male, publisher B as female), and data isolation across platforms.
  - *Solutions*: Data fusion across small panel datasets and large platform datasets.

#### Key Technologies

1. **Incrementality Testing**
   - Large advertisers run A/B tests via data matching (DMP integrations).
   - Small advertisers run pause-and-resume tests to estimate ROI.
   - Brand ads combine this with Brand Lift Studies.
2. **Attribution**: Mapping Touchpoints to Conversion Decisions
   - **Last Click Attribution**
     - Favors search/lower-funnel channels.
     - Tracks conversions via link tagging.
     - Easy to implement; suited for short decision cycles (gaming, finance).
   - **Multi-Touch Attribution (MTA)**
     - Favors display/upper-funnel channels.
     - Collects user footprints across touchpoints to analyze conversion paths.
     - Distributes credit across touchpoints using various rules (logistic regression, linear, time-decay, etc.).
     - Requires strong identity resolution capabilities.
3. **Marketing Mix Modeling (MMM)**
   - Analyzes market-level input-output relationships to assess short- and long-term marketing impacts.
   - Accounts for baseline sales, competitor spends, and ad saturation.
   - Low technical data barrier: operates on aggregated weekly data rather than individual logs.
   - *Methods*:
     - Parameter-based: Fitting ad spend and GMV using marketing response functions, usually based on log-linear forms describing diminishing returns. Can incorporate time-decay (Adstock) and carryover effects. Open-source benchmarks: Facebook's Robyn.
     - Non-parametric: Using Shapley value or Markov chain attribution to calculate marginal ROIs, adjusting channels dynamically.
     - Financial models: Applying portfolio optimizations (Markowitz, Black-Litterman) to allocate marketing budgets.
     - Advanced: Integrating MMM with incrementality tests and causal inference.

Recently, marketing science teams partner with clients to provide:

- **Advertiser Automation**: Automatically identifying high-performing ad creatives and automating budget allocations.
- **Enterprise Digital Solutions**: Helping clients deploy machine learning models locally to forecast user LTV, churn risk, and key conversion behaviors.
- **Productized Solutions**: Manuals, whitepapers, showcase case studies, and cloud products.

## Advertising Business from the Platform's Perspective

- **Platform Tools**
  - Bidding Products & Strategies: The most vital lever, implemented by modifying bidding formulas (e.g., dual bidding, ROI bidding).
  - Bid disturbance (GMV, refund rates, interaction rates).
  - Models: Scenario-specific models, data optimization, joint modeling (second-party data), and third-party integrations.
  - Traffic: Flow control (filtering low-quality traffic), manual matching, exploration-exploitation strategies, and inventory expansion.
  - UI/UX: Optimizing native placements, video styles, interactive buttons, and coupons.
- **Hidden Cost**: Incorporating user experience constraints, ad-load control, and long-term ecosystem value into ranking.
- **Conversions: Deep vs. Shallow**
  - Determined by advertiser demands and the platform's ability to model and track conversions.
    - *Closed-loop*: Entirely within the platform (e.g. e-commerce shops).
    - *Online closed-loop*: Games, web novels, utilities—tracked and passed back via API by advertisers.
    - *Lead generation*: Long path to final ROI—difficult to optimize (now using deep conversions and offline ROI models).
- **Attribution**: Determines ROI calculation.
  - Platforms chase self-attribution to lock in budgets and model logs, competing against third-party tools.
  - Incrementality testing: CLS/BLS experiments; offline uplift models.
- **Advertiser Levers**: In feed feeds, advertisers focus on creative materials; in search, they focus on bidding on keywords.
  - Creatives: The ultimate lever (high quality = broad appeal + high conversion).
  - Campaign creation: Platforms govern campaign duplication to prevent auction congestion.
  - Bidding: Balancing volume and cost. Bids vary widely based on margins.
  - Targeting: Less vital in oCPX scenarios, as models automatically align CPC/CPA.

### What Happened in the Internet Ad Market in the Last 10 Years (2013-2023)

- **Ad Product Transformation**
  - *Internet ads surpassed TV ads*: Achieved globally in 2018; achieved in China in 2014.
  - *Mobile migration*: Driven by smart devices, the Chinese digital ad market reached 550 billion RMB in 2021.
- **Evolving Placements and Formats**
  - **PC Era**:
    - Primary formats: Text links, static banners, image-text. Example: Baidu search results.
    - Text link advantages: Small file sizes, fast loading, low user intrusion.
    - Rise of banner ads to capture visual attention.
  - **Video Ads**: Richer information capacity.
    - PC video ads: Focused on video portals (Youku, iQIYI) with large player skins.
  - **Mobile Era**:
    - Smart devices drove video ad growth.
    - Short videos (under 1 minute) surpassed mid-to-long videos due to user short-term memory limits and fragmented attention spans in mobile app usage. Ads must deliver high stimulus quickly.
  - **Rise of Short Video Platforms**: ByteDance captured the mobile and short video wave, becoming the second largest ad player in China, trailing only Alibaba.
- **User Interactions**
  - *Web 1.0 (Read-Only)*: One-way ad broadcast. Players: search engines, portals (Sina, Sohu), video portals.
  - *Web 2.0 (Read-Write)*: User-Generated Content (UGC) and social graphs. Users like, comment, and share. Players: WeChat, Weibo, Douyin, Bilibili, Xiaohongshu.
  - *E-commerce Platforms*: Integrated purchase-payment-shipping flows. Players: Taobao, Meituan.
  - *Web 3.0*: AI-driven, semantic networks.
- **Content Delivery Logic**
  - One-way Web 1.0 ad formats declined.
  - Precision targeting surged, driven by mobile device logs (location, IP) and deep profiles (Tencent's social graph, Alibaba's purchase data, ByteDance's content consumption footprints).
  - Transition from "one size fits all" to "one thousand people, one thousand faces."
  - Data application, dynamic creative optimization, and Data Management Platforms (DMPs) created strong barriers to entry. Four players (Alibaba, ByteDance, Tencent, Baidu) capture over 75% of the Chinese ad market.

### Future Trends

- **Ad Monetization Bottlenecks**
  - *External shifts*: Portals and text feeds declined in favor of short video.Platforms must build new user products to break through bottlenecks (e.g., Douyin branching into e-commerce, local services, payments).
  - *Unit price caps*: Platforms face ceiling prices for single-placements, requiring multiple monetization streams.
- **Key Directions**
  1. *Diminishing technology dividends*: Search/feed formats are fully developed. Market growth relies on refined, data-driven multi-format blending (blending shopping malls, live streams, and organic feeds).
  2. *Operational automation*: Automated bidding, diagnostics, and auto-piloted pacing tools.
- **Closed-Loop Platform Domination**
  - Ad marketplaces display strong scale effects (similar to financial exchanges).
  - Platforms squeeze intermediaries (traditional ad agencies have lost their core value).
- **Advertiser Levers**
  - Advertisers have fewer manual levers; success is heavily determined by creative quality and AIGC production speed.
- **Evolving Interfaces**
  - Terminals expanding from smart phones to connected cars (smart cockpits) and IoT.
  - Placement formats transitioning into augmented reality (AR/VR/MR).
  - User interactions involving body movements and smart sensors.
  - Content delivery balancing precision targeting with user privacy protection laws. Users demand more control over their personal data usage.

## Reference

- Ad Product Heart-Method, GeekTime.
- Computational Advertising, GeekTime.
- [Who is growing? Who is falling behind in the ad market? 2023](https://wallstreetcn.com/articles/3682247)
- [Why is ByteDance doing so well in the ad platform business?](https://m.zhitongcaijing.com/content/detail/270069.html)
- [How does ByteDance do commercialization?](https://www.woshipm.com/it/4436143.html)
- [Some highly valuable facts and gossip about ByteDance](https://www.woshipm.com/it/3013817.html)
- [Ocean Engine Short Video Value Research Report](https://bytedance.larkoffice.com/file/boxcnwufM4kxuwUGc3H50Qyp9Pb)
- *Marketing Technology*
- *Big Data Marketing*
