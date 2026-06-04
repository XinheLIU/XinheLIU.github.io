---
title: Computational Advertising (3) Ad Strategy
date: 2025-08-08 13:58:27
permalink: /en/ads/intro-3/
categories:
  - Technology
tags:
  - Ads
  - AI & Machine Learning
updated: 2024-12-15 13:30:00
summary_en: Strategy notes on budget pacing, traffic allocation, behavior decomposition, and optimization controls inside ads systems.
summary_zh: 围绕预算节奏、流量分配、行为分解和优化控制整理广告策略问题。
topic_cluster: ads-systems
public_focus: Public-safe strategy notes for allocation, pacing, and optimization policy.
featured_asset: /ads/intro-3/Ads-Strategy-Behavior-Decomp.png
confidentiality_safe: true
site_locale: en
lang_switch: /ads/intro-3/
last_updated: 2026-05-31
---
# Ad Strategy

- [Ad Strategy](#ad-strategy)
  - [Traffic Strategy](#traffic-strategy)
    - [User Experience Strategy](#user-experience-strategy)
    - [Visual & Layout Strategy](#visual--layout-strategy)
  - [Delivery Strategy](#delivery-strategy)
    - [Cold Start](#cold-start)
    - [Stability](#stability)
      - [Cost Stability](#cost-stability)
      - [Delivery Stability](#delivery-stability)
      - [Model Optimizations](#model-optimizations)
    - [Bidding Strategy](#bidding-strategy)
  - [Conversions and Attribution](#conversions-and-attribution)
    - [Conversions](#conversions)
    - [Attribution](#attribution)
  - [Creative and Intelligent Delivery](#creative-and-intelligent-delivery)
    - [Creative Sourcing & Management](#creative-sourcing--management)
  - [Asset Data Retrieval Capabilities](#asset-data-retrieval-capabilities)
    - [Diagnostics](#diagnostics)
    - [Intelligent / Automated Delivery](#intelligent--automated-delivery)

## Traffic Strategy

**Core Goal**

- Maximize User Lifetime Value (LTV), balancing user retention with monetization efficiency.
- Traffic strategy operates on recommendation principles:
  - *Ad-load control*: Multi-objective conversions, value exchanges, and feed blending (incorporating multiple formats and soft/hard ads).
  - *Blending*: Controlling ad intervals ($adgap$) and density ($adload$) to protect user experience.
  - *Long-term topics*:
    - Sourcing: Creative and content quality.
    - Inventory expansion: Identifying under-utilized slots.
    - User experience: Quantifying user experience metrics and retention drops.
- **Key Strategy Handles**
  - **Ad-load** (Ad Density)
    - *Purpose*: Boosting ad inventory during high-demand events (e.g., shopping festivals) to maximize revenue.
    - *Benchmarks*: Competitor benchmarks (e.g. Facebook caps at ~8%), revenue simulations, and long-term user retention impacts.
  - **Frequency Capping**
    - *Purpose*: Preventing repetitive ads from degrading user experience.
    - *Attempts*: Multi-placement joint capping $\to$ single placement capping; similarity-based capping; long-term capping; down-ranking similar creatives via $hidden\_cost$ penalties.
    - *Debates*: Rigid rules vs. dynamic rules; creative diversity impacts; using client IDs for capping raises fairness issues.
  - **Adgap** (Ad Placements Gap)
    - *Definition*: The minimum number of organic posts between ads.
    - *Purpose*: Restricting ad density per user session.
    - *Future directions*: Personalized gaps (user- or query-level); modeling ad-ad mutual interference; optimizing session-level expected returns.
- **Other Key Issues**
  - *HiddenCost and LTV*: Quantifying the user retention drop caused by ads (e.g., down-ranking ad scores using experience-based penalties).
  - *Inventory Bottlenecks*: When high-value slots are saturated, unlocking native-format feeds or running auctions on new screens.
  - *Attention Decay*: In long content (e.g., articles, long feeds), user attention decays rapidly; ads should target the top of the session.

### User Experience Strategy

How do we balance ad revenue and user experience?

- Validate the direct impact of the strategy in experiments, rather than trying to resolve intermediate mediation questions (e.g. measure actual revenue drops when expanding ad-load, rather than comparing content qualities).
- *Common Pitfalls*:
  - Extrapolating marginal returns from static historical logs (current content experience $\neq$ additional content experience).
  - Drawing un-actionable conclusions (e.g. organic content has better experience $\neq$ expanding organic feeds will improve retention).

**Experimental Design**

| **Block Mechanism** | **Core Comparison** | **Pros & Cons** |
|---|---|---|
| **Pre-retrieval filtering** | Target ad vs. backup ad + organic | Minimal revenue loss; but backup content quality is uncontrolled |
| **Bumping eCPM threshold** | Target ad vs. backup ad + organic | Highly flexible; but might not block ads completely |
| **Retrieval filter + matching ad-load**| Target ad vs. organic | Cleanest ad-vs-organic comparison; requires constant tuning |
| **Re-ranking masking** | Target ad vs. backup ad + organic | High content quality; but maximum revenue loss |

- *Reality*: We cannot fully control the quality or volume of alternative backup ads. The best practice is: retrieval-level filtering combined with pacing to align overall ad-load (controlling volume rather than quality).
- *Data Trap*: Contradictory conclusions across experiments (e.g., different retention impacts for different categories). The root cause lies in the quality differences of alternative backup content.
- *Temporal Decay*: Experiment results degrade over time (e.g. ad-blocking experiments showing smaller retention losses over a 5-year span).
  - *Hypotheses*: User self-selection (sensitive users have churned), ad tolerance/habituation increases, or product adjustments.
  - *Recommendation*: Rely on direct empirical experiments, avoiding complex speculative attributions.

{% mermaid %}
graph LR
    A[Factors affecting ad-induced LTV loss]
    A --> B[Ad Content / Creative]
    A --> C[Ad Strategy]
    A --> D[External Factors]

    B --> B1[Campaign type & category shifts]
    B --> B2[Creative quality]
    B2 --> B21[CTR / dislike / report rates]

    C --> C1[Traffic strategy]
    C1 --> C11[adload / gap / startpos / duplicate / new slots]
    C --> C2[Visual / layout style]
    C --> C3[Delivery policy]

    D --> D1[User-side characteristics]
    D1 --> D11[User acquisition quality]
    D1 --> D12[Client performance]
    D1 --> D13[User-side product updates]
    D1 --> D14[Seasonality / cohort shifts]
    D --> D2[E-commerce marketplace factors]
{% endmermaid %}

### Visual & Layout Strategy

Integrating ad formats and visual elements into native product layouts to boost performance:

- Enhancing ad click-through rates and conversion rates.
- Boosting advertiser ROI, supporting custom vertical brand campaigns.
- Guiding creators and advertisers to align their assets with the platform's visual styles.

Placements & Models:

- **Style Optimization Components**
  - *Model Features*: Incorporating creative style IDs into prediction towers.
  - *CTA Buttons*: Optimizing CTA button triggers. Buttons account for ~30% of conversions; color schemes and trigger timings are optimized.
  - *End-cards / Overlays*: Redesigning download and install overlays to capture high-intent users post-video.
  - *Cards*: Redesigning download and e-commerce cards (showing prices, ratings, categories).
- **Personalized Layout Models**
  - *Core*: Rich candidate visual options + personalized selection models.
  - A/B tests only select the average best format, neglecting user diversity. Personalized models select the optimal visual combination for each user.
  - *Visual elements*: Containers, assets, UI themes, trigger times, and screen positions.
  - *Execution*:
    1) Generating diverse styles (2-3 distinct layouts).
    2) Text assets: automated generation using LLMs.
    3) Image assets: automated template generation.
    4) Bidding and pre-ranking integration: scoring format options online.
- **Comment Sections**: Introducing comment features and management tools on ads.
  - Comment monitoring and moderation tools for merchants.
  - Comment sorting to boost conversions.
  - Comment cold start.
- **Interactive Formats**: AR, 3D overlays, and screen gestures.
- **UX Components**: Redesigning app redirection funnels and deep-linking buttons.

## Delivery Strategy

{% mermaid %}
graph LR
    I[Core Delivery Strategies] --> J[Stability]
    I --> K[Duplication governance]
    I --> L[Cold start]
    I --> M[Budget optimization]
    I --> N[Compensation policies]
    I --> O[Ad Quality controls]
{% endmermaid %}

### Cold Start

What problem are we solving?

| Dimension | System Perspective | Client Perspective |
|---|---|---|
| **Core Goal** | Maximize global platform revenue | Accelerate individual ad delivery |
| **Costs** | Opportunity costs (traffic exploration) | Cost overruns, creative wasting |
| **Focus** | Long-term model learning and pacing | Short-term campaign ROI |

- **System Perspective**
  1. **Cold Start in Models**: New ads lack historical interaction logs (CTR, CVR), leading to extreme estimation variance. The system must spend traffic to "explore" the ad's true quality.
  2. **Exploration vs. Exploitation (EE)**: Short-term sacrifices (exploring uncertain new ads) are necessary to capture long-term platform returns, preventing the system from getting stuck in local optima (head ad dominance).
  3. **Data Imbalance / Long-Tail Learning**: New ads have sparse logs; models must learn from sparse long-tail distributions to prevent established ads from monopolizing all slots.
- **Client Perspective**
  1. **起量 (Delivery Volume)**: New ads must scale quickly to spend budgets. Slow delivery wastes operational effort and budget schedules.
  2. **Lifecycle Bounds**: Creative life cycles are short (e.g. 7 days). Slow cold start directly leads to campaign failures.
  3. **Advertiser Duplication**: If the system fails to deliver new ads, advertisers will copy and deploy massive duplicate campaigns to gamble on model variance, degrading the platform's auction health.

How do we optimize?

1. **Bidding Adjustments (Fine Ranking)**
   - *Methods*: Setting personalized bidding caps for new campaigns; implementing dynamic bid scaling; deploying vertical industry bid rules.
   - *Impact*: Counteracts low competitiveness caused by model variance, accelerating initial delivery while preventing cost overruns.
2. **Boost (Priority Auction) Mechanisms**
   - *Methods*: Adding positive constants or coefficients to the ad's $eCPM$ ($hidden\_cost = const \times boost\_coef$).
   - *Impact*: Artificially elevates new ads in auctions, speeding up exploration.
3. **Traffic Allocation (Retrieval / Pre-ranking)**: Balancing exploration and exploitation.
   - *Bandit Algorithms*: Epsilon-Greedy, Thompson Sampling, Upper Confidence Bound (UCB).
   - {% asset_img Explore-and-Exploit.png Explore & Exploit Graph %}
   - *Heuristic Assignment*:
     - **RecentPVR**: Routing new ads to traffic segments that display fresh click patterns.
     - **RankUser**: Solving bipartite matching offline to pre-align new ads with suitable user clusters.
     - **Campaign Inheritance**: Inheriting the profile of a successful campaign within the same account to speed up initial targeting.
     - **Targeted Exploration**: Routing new ads to traffic segments where CVR/CTR model variance is low, ensuring stable early learning.
     - **Diversity Boosts**: Forcing new ads to explore a wide variety of publisher apps to capture broad profiles.
- **Uncertainty Modeling**: Classic EE cannot handle personalized "prediction uncertainty." We model the standard deviation of pCTR/pCVR, boosting ads that have high uncertainty to accelerate learning.
- **Meta-Learning & Transfer Learning**: Using model architectures (e.g., DDN) to transfer weights from similar mature campaigns.
- **Sampling & Debiasing**: Re-weighting losses for new ad samples during training.
- **Metric Controls**: Redefining cold start success (e.g. using "delivery rate" instead of absolute "conversion count").

| **Problem** | **Strategy Handle** | **Impact** |
|---|---|---|
| Model variance (cold start) | Model tuning, Boost mechanisms | Improves pCTR/pCVR accuracy, mitigates bias |
| Slow learning (EE) | Bidding adjustments, traffic boosts | Accelerates sample collection, reduces search costs |
| Data sparsity | Meta-learning, transfer learning | Boosts model representation on sparse logs |
| Customer pacing complaints | Bidding caps, traffic quotas | Delivers fast initial impressions, shortens learning |
| Spillover bias in tests | Double-sided splitting, budget pacing | Isolates treatment/control groups, ensures clean tests |

### Stability

From the advertiser's perspective, a mature delivery system must be predictable in both cost and pacing. Predictability involves: **delivery** (achieving cost targets) and **stability** (maintaining consistent costs across periods). 

In cost stability, our goal is to keep the daily CPA within target bounds. In delivery stability, we target reducing abrupt drops in delivery volume, protecting campaign lifespans.

#### Cost Stability

**Core Problem**: Ensuring CPA meets the advertiser's targets; reducing bid-CPA fluctuations.
**Solutions**:
1. **Model Bias Correction**: Improving real-time log joining to reduce hour-level data delays; using multi-dimensional Isotonic Regression calibration.
2. **Pacing Control**: Upgrading PID and MPC control loops to adjust $rank\_bid$ dynamically based on real-time CPA ratios.
3. **Vertical Focus**: Deploying dedicated models and tighter control loops for high-sensitivity verticals (e.g. financial leads, gaming pay events).

#### Delivery Stability

**Core Problem**: Extending campaign lifespans, reducing abrupt drops in delivery.
**Solutions**:
1. **Drop Diagnosis & Prediction**:
   - Hour-level drop prediction models (Precision=0.87, Recall=0.82).
   - *Diagnostics*:
     - **System factors** (50%): Drop in $eCPM$ competitiveness, pCTR drop, or pCVR drop.
     - **Uncertain factors** (45%): Model variance, competitive spikes, or sudden brand budget spikes.
     - **Advertiser actions** (5%): Manual bid cuts, budget reductions, or targeting edits.
     - **Environmental factors**: Target audience saturation, material fatigue, or market-level competition.
2. **Pacing Supports**: Deploying dedicated budget pacing buffers to smooth out temporary drops in model scores.
3. **Ranking Interventions**: Adjusting fine-ranking calibrations and pre-ranking filters during drop alerts to keep campaigns competitive.

| Dimension | Core Metric | Target |
|---|---|---|
| **Cost Stability** | Proportion of spend within target CPA bounds | Boost CPA delivery success in sensitive verticals |
| **Delivery Stability**| Rate of un-manipulated campaign drops | Reduce abrupt ad drops by >40% |

#### Model Optimizations

- **Catastrophic Forgetting Mitigation**
  - *Data replay and parameter isolation*: Deploying MFTC frameworks to replay historical data; applying parameter update penalties (e.g., L2 constraints) during streaming updates.
  - *Long-term memory*: Preserving campaign-level features and historical conversion aggregates; using Meta-Learning to generate robust embeddings.
  - *Training pipeline*: Layer-wise learning combined with multi-day shuffling; optimizing streaming intervals to balance fresh logs with model stability.
- **Feature Engineering**
  - *Generalization*: Replacing raw advertiser IDs with category, merchant, and campaign attribute features; incorporating rolling statistical features.
  - *Sampling*: Limiting head campaign sampling to increase the sampling rates of tail and dropping campaigns.
- **Model Architecture**
  - *Ensembles*: Blending batch-trained models with online-trained models.
  - *Real-time Sessions*: Incorporating real-time session features into fine ranking to predict drop risks.

### Bidding Strategy

Bidding strategies include advertiser-facing products (TargetCost, NoBid) and platform-facing optimization strategies:

- **Cold Start Bidding**: Elevating bids during the learning phase to accelerate exploration (more direct than ranking boosts, and shifts some testing cost to the advertiser).
- **Private Bid Adjustments**:
  - Dynamically adjusting bids based on proprietary models to capture deep conversions.
  - Applied in joint modeling, multi-touch attribution, and campaign inheritance.
  - Resolves vertical industry limitations in universal models; allows deep conversions ($private\_deep\_cvr$) to guide bid competitiveness.
- **Auxiliary Event Bidding**:
  - Leveraging shallow events (e.g., installs, registrations) to optimize sparse deep conversion targets (e.g., purchases).
  - *Mechanism*:
    1) Training models on high-volume shallow events (2nd eCVR).
    2) Blending the shallow model scores with the deep model scores to balance variance and bias.
  - *Requirements*: High correlation between shallow and deep events; accurate 2nd eCVR predictions; identifying deep target under-estimation.

In summary, bidding strategies act as system-level compensators to optimize campaign delivery, implemented by multiplying raw bids by dynamic correction factors.

## Conversions and Attribution

### Conversions

- Defining the event the advertiser is willing to pay for.
- Platforms continue to deepen conversion targets to align with advertiser ROI.
- Deeper targets simplify bidding for advertisers while locking transaction loops and data into the platform.

| | No Conversion Data | Shallow Conversion | Deep Conversion | Ultimate State |
|---|---|---|---|---|
| **In-app Shop** | CPM | Product View | Add to Cart, Purchase | ROI |
| **Online App** | CPC | Download, Install | Active + Retention, Purchase | ROI |
| **Lead Generation**| CPM | Form Submit, Phone Click | Course Purchase, Credit Approval | ROI |

### Attribution

Attribution determines how conversion credit is distributed across touchpoints, shaping advertiser ROI assessments, channel budgets, platform billing, and model training.

Key Aspects:

1. **Owner**: Advertiser self-attribution, publisher attribution, or third-party attribution. Platforms compete to manage attribution.
2. **Touchpoint Scope**: Clicks, impressions, video views, likes, etc.
3. **Logic**:
   - Single-Touch (First Click, Last Click).
   - Multi-Touch (MTA - linear, time-decay, logistic regression weights).
   - Incrementality (Uplift).
- *Attribution Design*: Balancing analytical validity and platform revenue. Platforms build Markov chains and decay curves to demonstrate the value of upper-funnel touchpoints.
  - **ESM2 (Entire Space Multi-Task Modeling)**: Decomposing post-click behaviors to predict conversions.
  - {% asset_img Ads-Strategy-Behavior-Decomp.png %}

## Creative and Intelligent Delivery

Helping advertisers create high-performing ads:

- **Creative Sourcing & Management**:
  - Asset libraries to store, tag, and retrieve video/image files.
  - AI tools for video script generation, auto-editing, and image processing.
- **Intelligent Delivery**:
  - Auto-targeting (expanding and narrowing audiences dynamically).
  - Automated bidding policies.
  - Sourcing ecosystem governance (identifying duplicate and low-quality materials).
- **Platform Portals**:
  - ByteDance: Ocean Engine, Creative Studio.
  - Alibaba: Alimama, Qianniu.

### Creative Sourcing & Management

- **Asset Management**: Sourcing lists, uploads/deletes, tagging, and cross-account asset sharing.
- **Asset Taxonomy**: First-run, high-quality, AIGC, low-quality, low-efficiency, and duplicates.
- **Analytics**: Tag analytics, creative diagnosis, audience analysis, and comment monitoring.
- **Distribution**: Creative pre-auditing, player diagnostic logs.

*Goal*: An all-in-one smart creation portal blending AIGC generation with performance analytics.

## Asset Data Retrieval Capabilities

- Retrieval by metadata and category tags.
- Retrieval by asset owners.
- Linking assets with active campaigns and creative instances.

---

### Diagnostics

Platform diagnostic tools help advertisers troubleshoot delivery bottlenecks:

- **Systemic issues**:
  - Tracing the funnel (identifying where candidates are filtered out).
  - $eCPM$ competitiveness, bid multipliers, and model estimation bias.
  - Campaign pacing and cold start stages.
- **External factors**:
  - Advertiser operations (manual bid cuts, low budgets, duplicate campaigns).
  - Market shifts (traffic drops, competitor entry).

### Intelligent / Automated Delivery

| Module | Core Models | Products | Key Features |
|---|---|---|---|
| **Audience Selection** | Targeting quality scoring, traffic value estimation | Automated targeting, recommended segments | Auto-expansion |
| **Cost Control** | CPA estimation, traffic replay modeling, bidding curves | Bidding guides, auction heat indexes, auto-bidding | Budget pacing, campaign budget optimizations |
| **Creative Assets** | Creative pre-scoring, video quality models, copy generators | Programmatic creative, copywriting suggestions | Dynamic creative blending, landing page templates |
| **Pacing & Governance** | Cold start prediction, campaign pruning models | Campaign diagnostics, automated scheduling | Auto-pilot labs, A/B splits |

{% mermaid %}
graph LR
    A[Advertiser Demands] --> B[Controllable variables]
    A --> C[Uncontrollable variables]
    D[Automated Ad Products] --> E[Audience Selection]
    D --> F[Traffic Matching]
    D --> G[Feedback & Diagnosis]
    D --> H[Pacing & Control]

    B --> B1[Stable delivery]
    B --> B2[Target CPA]
    B --> B3[Predictable operation]
    B --> B4[Predictable cold start]

    D --> E1[Placements]
    D --> E2[Targeting]
    F --> F1[Creative]
    F --> F2[Landing Page]
    G --> G1[Diagnostics / Guides]
    G --> G2[Data disclosures]
    H --> H1[Bidding]
    H --> H2[Budgeting]

    classDef mainNode fill:#f9f,stroke:#333,stroke-width:2px
    classDef subNode fill:#bbf,stroke:#333,stroke-width:1px
    classDef leafNode fill:#dfd,stroke:#333,stroke-width:1px

    class A,D mainNode
    class B,C,E,F,G,H subNode
    class B1,B2,B3,B4,E1,E2,F1,F2,G1,G2,H1,H2 leafNode
{% endmermaid %}
