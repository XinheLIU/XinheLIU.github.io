---
title: Computational Advertising (2) Computational Ad System
date: 2024-07-30 19:33:48
permalink: /en/ads/intro-2/
categories:
  - Technology
tags:
  - Ads
  - AI & Machine Learning
updated: 2024-12-12 14:30:00
summary_en: A technical walkthrough of ad-system architecture, candidate generation, ranking, modeling, and engineering constraints.
summary_zh: 从召回、建模、排序到工程约束，拆解计算广告系统的技术结构。
topic_cluster: ads-systems
public_focus: Public-safe architecture notes for ads retrieval, ranking, and modeling systems.
note_type: system-diagram
featured_asset: /ads/intro-2/Ads-Model-HNSW.png
confidentiality_safe: true
site_locale: en
lang_switch: /ads/intro-2/
last_updated: 2026-05-31
---

- [Ad System Overview](#ad-system-overview)
  - [How are Ads Delivered?](#how-are-ads-delivered)
  - [Overview of the Relationship Between Ad Strategies and Systems](#overview-of-the-relationship-between-ad-strategies-and-systems)
  - [Ads vs. Recommendation vs. Search](#ads-vs-recommendation-vs-search)
- [Ranking](#ranking)
  - [Retrieval (Recall)](#retrieval-recall)
    - [Key-Value Retrieval](#key-value-retrieval)
    - [Vector Indexing: ANN (Approximate Nearest Neighbor)](#vector-indexing-ann-approximate-nearest-neighbor)
    - [Deep Retrieval (KDD 21, ByteDance AI Lab)](#deep-retrieval-kdd-21-bytedance-ai-lab)
    - [Retrieval Strategies](#retrieval-strategies)
  - [Pre-ranking (Coarse Ranking)](#pre-ranking-coarse-ranking)
    - [LTR (Learning to Rank)](#ltr-learning-to-rank)
    - [R2S Model](#r2s-model)
    - [Pre-ranking Strategies](#pre-ranking-strategies)
  - [Fine Ranking](#fine-ranking)
    - [Click-Through Rate Prediction Problem](#click-through-rate-prediction-problem)
    - [Recommendation Models and Deep Models](#recommendation-models-and-deep-models)
    - [Fine Ranking Strategies](#fine-ranking-strategies)
    - [Calibration in Fine Ranking](#calibration-in-fine-ranking)
  - [Re-ranking / Blending](#re-ranking--blending)
    - [Long-Term Direction: Incrementality Bidding & Deep Organic Integration](#long-term-direction-incrementality-bidding--deep-organic-integration)
- [Bidding](#bidding)
  - [Auction and Billing Mechanisms in Ad Systems](#auction-and-billing-mechanisms-in-ad-systems)
    - [Separation of Bidding Points and Billing Points](#separation-of-bidding-points-and-billing-points)
    - [GFP Billing in ADX (Ad Exchange) Markets](#gfp-billing-in-adx-ad-exchange-markets)
  - [Bidding Products](#bidding-products)
  - [Bidding Strategies](#bidding-strategies)
  - [Bidding Algorithms](#bidding-algorithms)
- [Reference](#reference)

## Ad System Overview

### How are Ads Delivered?

Bidding ad workflow: Ad Candidates $\to$ Model Scoring $\to$ Auction/Billing ($CTR \times CVR \times Bid$, second-price billing) $\to$ User Feedback $\to$ Model Training.

- **Before Send (Online Auction Phase):**
  - A user request triggers the core orchestrator component.
  - The orchestrator manages a multi-stage pipeline:
    - **Retrieval (Recall)**: Filters out a candidate set from millions of ads (incorporating targeting rules, pacing, and frequency capping).
    - **Pre-ranking**: Trims the candidate set to reduce computational load.
    - **Fine Ranking**: Scores the remaining candidates, predicting and calibrating CTR and CVR.
    - Returns the top candidates with their final expected revenues.
  - While returning the winning ad, the billing pipeline calculates costs.
- **After Send (Logging & Feedback Phase):**
  - Upon sending the ad, the system logs billing events, updates pacing states, and pushes feature snapshots for training.
  - *Sample Joining*:
    - Collects feature snapshots from the online auction logs.
    - Collects user action labels (impressions, clicks, conversions).
    - Joins features and labels using unique request IDs, pushing samples to a message queue.
  - *Streaming Model Updates*:
    - Streaming jobs fetch joined samples for real-time online training, updating model parameters.
    - Model parameters are pushed to online prediction nodes periodically to keep predictions fresh.

### Overview of the Relationship Between Ad Strategies and Systems

Ad monetization involves three parties: publishers, advertisers, and users. The platform maximizes revenue by balancing the interests of all three, necessitating a complex system.
The stages in the pipeline: pre-ranking reduces model scoring pressure; fine ranking predicts the exact value for sorting; re-ranking is dominated by organic feed blending constraints.
Sorting: Fine ranking sorts ads based on expected revenue ($eCPM = pCTR \times pCVR \times Bid$). Placements must pass an $eCPM$ threshold to enter the auction.
Bidding: For advertisers, bidding expresses cost and acquisition targets; for platforms, bidding products are levers for pacing and optimization. Bidding formulas require heavy parameter tuning.
Conversions: Defining the conversion event shapes both model labels and bidding goals.
Attribution: Calculating advertiser ROI, billing, and model training rely on attribution, which involves resolving touchpoint windows and billing points.

### Ads vs. Recommendation vs. Search

Business Differences:

| Dimension | Search | Recommendation | Ads |
|---|---|---|---|
| **User Intent** | Active and explicit | Passive discovery | Semi-active, inferred intent |
| **Monetization Goal** | Weak | Medium | Strong |
| **Feedback Type** | Explicit (clicks, bounce) | Implicit (dwell time, clicks) | Explicit + conversion (purchases, installs) |
| **Strategic Bottleneck**| Query intent, recency | Personalization, diversity | Balancing ad-revenue and user experience |

System Differences:

1. **Candidate Pool Scale**
   - Search/Recommendation: Billions.
   - Ads: Millions.
   - *Reason*: Ads must pass strict active billing limits, advertiser budgets, targeting rules, and compliance filters, shrinking candidates early.
2. **Ultimate Objectives**
   - Search: Ranking task.
     - Sort items based on relevance to the query (Learning to Rank - LTR).
   - Recommendation: Directly optimizing expected engagement per request ($E(R_i)$ e.g., stay time).
     - Heavy reliance on personalization and rich user feedback logs due to the lack of explicit queries.
   - Ads: Requires predicting the exact probability of clicks and conversions (CTR, CVR).
3. **Model Assumptions**
   - Search: Information Retrieval (PageRank) + Machine Learning to Rank.
   - Recommendation:
     - *Online-offline mismatch*: User actions on a single request do not directly correspond to long-term satisfaction (stay time vs. stay duration). Offline metrics and online gains often diverge.
     - *Implicit offline goals*: Models must combine multiple single-request feedbacks to approximate long-term user satisfaction. Requires:
       1) Identifying which behaviors serve as good short-term proxies for long-term satisfaction.
       2) Tuning the blending formula to balance diverse user feedbacks.
     - *Control-oriented*: The model operates on a control problem—optimizing the strategy to find and maximize short-term proxies for long-term satisfaction.
     - *Non-independent requests*: The model must run multi-step optimizations across multiple requests (Listwise optimization to diversify a session feed).
   - Ads:
     - *Online-offline alignment*: Offline metrics (measuring single-request revenue) align strongly with online revenues (total monetization), as request volume is less sensitive to ad system updates.
     - *Explicit offline goals*: The ranking formula ($eCPM$) is clear; offline models train on explicit labels (pCTR, pCVR).
     - *Precision-oriented*: Ad models focus on prediction accuracy.
   - *Shared Architecture*: Both share the three-stage funnel: Retrieval $\to$ Pre-ranking $\to$ Fine Ranking.

## Ranking

Ranking is the core of ad delivery, scored by $sorted\_eCPM$:

$$sorted\_eCPM = eCPM + hidden\_cost$$

$$eCPM = pCTR \times pCVR \times rank\_bid \times 1000$$

- $rank\_bid$ is the advertiser's bid ($cpa\_bid$) adjusted by risk control and pacing strategies.
- $hidden\_cost$ is a control variable incorporating user experience, platform health, ad-load intervals, cold-start boosts, and down-ranking parameters.
- The system must identify the single highest-value ad for each request.

### Retrieval (Recall)

**Objective**: Filter millions of candidates down to ~10,000.
**Features**: Multi-channel, indexing.
**Goal**: Unsupervised matching (ANN/quantization) $\to$ Supervised matching directly predicting fine-ranking outputs (DR).
**Challenges**: Huge database sizes; strict online latency bounds (<10ms); complex targeting filters (billions of intersection bitmaps).

Common Retrieval Algorithms:

#### Key-Value Retrieval

- **Inverted Indexing**: Filtering eligible items, building inverted indexes on targeting criteria (e.g. city, age, gender), sorting items within each index key by popularity, recency, or click rates, and writing results to a KV store.

#### Vector Indexing: ANN (Approximate Nearest Neighbor)

- **Vectorized Retrieval**: Representing users and ads as embeddings, and indexing them to allow online vector search (approximated nearest neighbors). User embeddings combine context and demographics.
- **Hierarchical Navigable Small World (HNSW)**
  - NSW links items to their nearest neighbors to build a navigable graph. When searching or inserting a new vector, it routes via "highways" to find the $m$ nearest neighbors.
  - HNSW adds skip-list concepts, building a multi-layer graph to speed up search.
  - {% asset_img Ads-Model-HNSW.png "HNSW Architecture" %}
- **Inverted File with Product Quantization (IVF_PQ)**: Clusters vectors to build a cluster-ID inverted index, speeding up distance computations.
- *ANN Limitations in Ads*:
  - ANN only guarantees a lower bound on search quality, not a guarantee on recall.
  - When targeting criteria are dense, ANN search quality decays.
  - Chasing $CTR \times CVR \times Bid$ directly within vector spaces is difficult, limiting retrieval models to single-target proxy functions (fitting expected fine-ranking outputs).
- **Quantized Retrieval**: Brute-force retrieval (Quantization + GPU) on Douyin Ads.
  $$\max_{t_u, t_a} P \left( Q(u; t_u)^T Q(a_i; t_a) \right) > Q(u; t_u)^T Q(a_j; t_a) \quad \vert \quad u^T a_i > u^T a_j \quad t_u, t_a \in \mathbb{R}^{2^q}$$
  $$\text{s.t.} \quad t_u^k < t_u^{k + 1}, \quad t_a^k < t_a^{k + 1}, \quad k \in \left[ 1, 2^q - 1 \right]$$
  Using 8-bit quantization achieves offline NDCG loss within 0.02%.
- **Index Rule Learning (IRL)**: Rather than filtering by targeting rules post-vector search, IRL learns features that filter out ineligible ads early during the search, saving computing overhead.

#### Deep Retrieval (KDD 21, ByteDance AI Lab)

- Deep Retrieval (DR) learns an index structure end-to-end, directly linking retrieval targets with training objectives.
- *Key Contributions*:
  - Breaks the limitations of inner-product or distance-based searches, enabling indexing to synchronize with arbitrary deep networks.
  - Uses graph-based encoding, allowing a single item to carry multiple indexes to enhance representation.
  - Employs an online Expectation-Maximization (EM) algorithm to support streaming updates.
  - Built for large-scale production, handling massive catalogs and complex filtering rules efficiently.
  - Proved the viability of end-to-end index learning in industrial retrieval.

#### Retrieval Strategies

- Designing multi-channel retrieval sources and filtering rules.
- Integrating with targeting systems to identify the most relevant audience ("You might also like").

### Pre-ranking (Coarse Ranking)

**Objective**: Filter ~10,000 candidates down to ~1,000.
**Features**: Dual-tower architectures, cached ad-side embeddings, zero online cross-features.
**Goal**: Supervised learning; L2R vs. predicting CTR/CVR directly.
**Challenges**: Latency constraints.

#### LTR (Learning to Rank)

- **Pointwise**: Scores each document (ad) independently. The model learns absolute relevance scores.
- **Pairwise**: Models the relative order between two documents, evaluating document pairs. It does not account for absolute positions in the list, treating errors at the top of the list the same as errors at the bottom.
- **Listwise**: Scores the entire list of candidates for a query. Models the optimal ranking function $F$ directly.
- *Representative Algorithms*: RankSVM, GBDT, RankNet, LambdaRank, LambdaMART.
  - **RankNet**: Employs a logistic loss function to optimize pairwise classification errors.
  - **LambdaRank**: Defines the gradient of the loss function (Lambda) as the NDCG change when swapping two documents, optimizing NDCG directly.
  - **LambdaMART**: Combines GBDT with LambdaRank.
- *LTR Metrics*: Precision, Recall, AUC, DCG (Discounted Cumulative Gain), and NDCG.
- *Ads Challenge*: Online-offline metric alignment. Chasing NDCG improvements does not always translate to online ad revenue gains, necessitating multi-dimensional evaluations.

#### R2S Model

- A simplified, lightweight version of fine-ranking models, optimized for top-ranking candidates.
- Pointwise sigmoid cross-entropy treats candidates independently ($P(y_i = label|x)$). In pre-ranking, candidates are list-dependent ($P(y_i = label|x, list)$).
- **Softmax Loss (Weighted Cross-Entropy)**: Formulates pre-ranking as a multi-class classification problem—selecting the single highest-$sorted\_eCPM$ ad from the candidate list.
  - Optimizes `softmax_cross_entropy_with_logits` using sampled softmax loss.
- *Features*: Incorporating sparse NAS and user-side feature extraction layers.
- *Trend*: Deep pre-ranking networks.

#### Pre-ranking Strategies

- Primarily focused on model structural improvements; strategies are usually shared with fine-ranking objectives.

### Fine Ranking

**Objective**: Score ~1,000 candidates, select the top winners.
**Features**: Deep networks, cached embeddings, high-order online feature crossing.
**Goal**: Predicting CTR and CVR: $f(user, content, ad)$.
**Challenges**:
- *Data*: Extreme conversion sparsity (positive samples can be 0.1% or 0.01% of negatives), causing extreme class imbalances.
- *Systematic bias*: Exposure bias, position bias, and contextual variance (search vs. feed).
- *Double Objectives*: Requires predicting both relative sorting order (for selection) and absolute probabilities (for bidding and billing).

#### Click-Through Rate Prediction Problem

Evolution:

- **Binary Logistic Regression (KDD 2013, Google)**: Employs **FTRL** (Follow-the-Regularized-Leader) to train models online on massive sparse datasets.
  - FTRL combines past gradients to re-weight parameters, minimizes deviations from prior parameters, and applies L1 regularization to ensure sparsity.
- **GBDT + LR (Facebook, 2014)**: A two-stage pipeline where continuous features are fed into GBDT trees, and the tree leaf indices are used as categorical features in a linear LR model.
  - GBDT captures non-linear feature combinations and performs automated feature selection.
- **Feature Crossing (LinkedIn, 2014)**:
  - *Global prediction*: Linear models using demographics and ad features (shares global coefficients to generalize and handle cold start).
  - *Feature crossing*: Pairwise feature interactions to capture non-linear relationships.
  - *User/Ad-specific coefficients*: Learning unique coefficients per user or per ad.
- **Calibration (Twitter, 2015)**: A two-stage pipeline of Ranking + Calibration (Isotonic Regression).

#### Recommendation Models and Deep Models

{% asset_img Ads-Model-Fine-Ranking-Models.png "Ad Fine Ranking Model Evolution" %}

- **Collaborative Filtering to Factorization Machine (FM)**: Matrix factorization extracts latent user and item vectors (embeddings), scoring them using inner products.
- **Wide & Deep (Google, 2016)**: Combines a linear model (Wide part, for memory/memorization) with a deep neural network (Deep part, for generalization).
  - Variations: DeepFM (replacing the Wide part with an FM layer) and Deep & Cross Network (DCN).
  - *All-Embedding*: Upgrading deep ranking models to end-to-end embedding networks.
- **DIN & DIEN (Alibaba)**:
  - **DIN**: Introduces local activation units to simulate attention, weighting user history items based on their relevance to the candidate item.
  - **DIEN**: Models the dynamic evolution of user interests over time using GRU layers with attention.

Model Improvements in 4 Areas:

1. **Model Complexity**: Deepening networks (e.g., Wide & Deep $\to$ Deep Crossing).
   - Multi-Task learning (Shared-Bottom, MMoE, PLE).
   - LHUC (Learning Hidden Unit Contributions) to personalize neural network weights.
2. **Feature Crossing**: Transitioning from manual crossing to automated high-order crossing (e.g., AutoInt, CDot).
3. **Model Ensembles**: Combining diverse architectures (e.g., transfer learning for cold ads, combining batch and online networks).
4. **Cross-domain Integration**: Borrowing structures from NLP (e.g. BERT-based sequence modeling).

#### Fine Ranking Strategies

- Incorporating platform long-term values (LTV, creator health) into the ranking score.
- Balancing exploration and exploitation (EE) for cold ads.
- Integrating with re-ranking flow controls.

#### Calibration in Fine Ranking

- Unlike recommendation, ad predictions affect bidding and billing directly. Predicted CTR and CVR must align with posterior click and conversion rates.
- Platforms apply **Isotonic Regression** and **Empirical Bayes** calibration to correct for system-level high- or low-estimations, accounting for conversion feedback delays.

### Re-ranking / Blending

Re-ranking organizes organic posts and commercial ads in the final feed:

1. **RecRank**: Sorting organic recommendations.
2. **Ad Load Controller**: Inserting ad placements into the feed while respecting ad-load limits and minimum organic gaps.
3. **Auction**: Scoring and running auctions for the designated ad slots, determining the final winning ads.

#### Long-Term Direction: Incrementality Bidding & Deep Organic Integration

- **Uplift Bidding**: Bidding based on the conversion lift attributable to the ad:
  $$Uplift = P(convert | ad) - P(convert | no\_ad)$$
- Eliminates paying for conversions that would have occurred organically.
- *Bidding Formula*:
  $$Bid = Uplift \times rank\_bid$$

## Bidding

### Auction and Billing Mechanisms in Ad Systems

- Ad inventory allocation is resolved through auctions.
- Bidding mechanisms shape advertiser behaviors and platform revenues.

Common Auction Types:

1. **Generalized First Price (GFP)**: High bidder wins, pays their exact bid.
   - *Pros*: Simple logic.
   - *Cons*: Highly unstable; bidders constantly adjust bids to probe competitor prices.
2. **Generalized Second Price (GSP)**: High bidder wins, pays the bid of the runner-up (plus a minimum increment).
   - *Pros*: Mitigates bid probing; truth-telling is a dominant strategy in single-slot auctions.
   - *Cons*: In multi-slot auctions, GSP is not completely strategy-proof.
3. **Vickrey-Clarke-Groves (VCG)**: High bidder wins, pays the external cost they impose on other bidders (the total value loss of competitors due to their presence).
   - *Pros*: Strategy-proof; truth-telling is a Nash equilibrium.
   - *Cons*: Exceptionally complex for advertisers to understand.
- *Industry standard*: Most platforms employ GSP.

#### Separation of Bidding Points and Billing Points

- Bidding occurs at impressions (`send/show`).
- Bidding points have evolved: CPM $\to$ CPC $\to$ CPA $\to$ oCPC/oCPM.
- *Billing separation (oCPX)*: Bidding on deep actions (conversions, CVR), but billing on clicks (oCPC) or impressions (oCPM).
  - Reduces publisher risks (billing is closer to impressions).
  - Aligns with advertiser ROI (bidding is based on conversions).

| Billing Method | Bidding Point | Billing Point | Model Predicts | Publisher Risk | Advertiser Risk |
|---|---|---|---|---|---|
| **CPM** | show | show | - | Low | High |
| **CPC** | click | click | pCTR | Medium | Medium |
| **CPA** | convert | convert | pCTR, pCVR | High | Low |
| **oCPC** | convert | click | pCTR, pCVR | Medium | Low |
| **oCPM** | convert | show | pCTR, pCVR | Low | Low |

#### GFP Billing in ADX (Ad Exchange) Markets

- RTB markets and Ad Exchanges (including Google Ad Manager) have transitioned from second-price (GSP) to first-price (GFP) auctions.
- *Drivers for GFP in ADX*:
  - **Multi-layered auctions**: Header Bidding and unified auctions led to inconsistencies in GSP (e.g. ADX second-price outputs losing against external first-price bids).
  - **Market equilibrium**: Bidders adjusting to average values naturally converges the market to first-price.
  - **Transparency**: GFP reduces publishers' incentives to manipulate second-price values (e.g., rigging reserve prices).
  - Google's shift to GFP in 2019 simplified programmatic bidding and boosted clearing prices.

### Bidding Products

- Platforms provide automated bidding products to help advertisers maximize volume and control costs.
- Automated bidding couples directly with the ranking system.

Core Design Parameters:

- **Objective/Constraint**: E.g., capping average CPA (TargetCost), spending full budget (NoBid/MaxConversion), or capping individual cost (CostCap).
- **Pacing cycle**: Daily or weekly budgets.
- **Control granularity**: Campaign or ad group levels.
- **Control algorithms**: Proportional-Integral-Derivative (PID) control, Model Predictive Control (MPC).

{% mermaid %}
graph TD
    A["Bidding Product Design"]
    B["Control Algorithm (PID/MPC)"]
    C["Historical Data"]
    D["Pacing Cycle"]
    E["Pacing Granularity"]

    A --> B
    A --> C
    A --> D
    A --> E
{% endmermaid %}

Bidding Product Profiles:

| Product Name | Constraint & Objective | Pacing Cycle | Control Granularity | Control Strategy |
|---|---|---|---|---|
| **TargetCost** (Manual Bid) | Keep average CPA near target (constraint), maximize volume (goal) | Daily | Campaign / Ad Group | MPC dynamically adjusts $rank\_bid$ based on real-time CPA ratios |
| **NoBid** (Max Conversion) | Spend full budget (constraint), minimize CPA (goal) | Daily | Campaign | Dynamically explores $rank\_bid$ using budget delivery curves |
| **CostCap** | Keep average CPA below ceiling (constraint), maximize volume | Daily | Campaign | Adjusts $rank\_bid$ to balance pacing speeds and CPA constraints |

## Reference

- Guo, C., Pleiss, G., & Weinberger, K. Q. (2017). [On Calibration of Modern Neural Networks](https://www.semanticscholar.org/paper/On-Calibration-of-Modern-Neural-Networks-Guo-Pleiss/d65ce2b8300541414bfe51d03906fca72e93523c).
- M. Milgrom. [Price Discovery](https://book.douban.com/subject/35128229/).
- [Google Ad Manager Transition to First-Price Auction](https://blog.google/products/admanager/update-first-price-auctions-google-ad-manager/).
