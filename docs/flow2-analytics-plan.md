# SCITRACK Flow 2 — Analytics & Trend Prediction Plan

## Thực Trạng

```
FE (AnalyticsPage.jsx)              BE (AnalyticsController)
───────────────────────────         ──────────────────────────
❌ AnalyticsPage tồn tại nhưng       ✅ /by-country (keyword-level)
   KHÔNG có route, KHÔNG có          ✅ /by-institution (keyword-level)
   sidebar item                      ✅ /trend-by-country (keyword-level)

FE gọi 4 endpoints ẢO:              BE có nhưng FE KHÔNG dùng:
  /overview       → trả về lỗi      ✅ /keyword-trend (Bùng nổ/Ổn định/Bão hòa)
  /trends         → trả về lỗi      ✅ /related-trends (co-occurring)
  /keywords       → trả về lỗi      ✅ /research-topics/trending
  /compare        → sai URL         ✅ /publication-trends (MONTHLY/WEEKLY/YEARLY)

🔴 FE & BE hoàn toàn không khớp — Analytics page chưa từng hoạt động
🔴 Không có AI prediction
🔴 Analytics là system-wide, không personalized cho user
```

---

## Kiến Trúc Flow 2 Mới

```
┌──────────────────────────────────────────────────────────────────┐
│  ANALYTICS PAGE (3 Tabs)                                        │
│                                                                  │
│  [📊 My Analytics]  [🔮 Trend Prediction]  [🗺 Research Landscape]│
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  TAB 1: MY ANALYTICS (personalized)                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │   │
│  │  │ Papers   │ │Citations │ │ H-Index  │ │ Active Fields│ │   │
│  │  │   1,234  │ │   5,678  │ │    23    │ │      4       │ │   │
│  │  │  ↑12%   │ │  ↑8%    │ │  →       │ │  +1 this mo  │ │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘ │   │
│  │                                                            │   │
│  │  📈 Publication Trends (your papers over time)              │   │
│  │  [AreaChart: papers + citations by year/month]              │   │
│  │                                                            │   │
│  │  🔑 Your Top Keywords (từ search history + bookmarks)       │   │
│  │  [HorizontalBarChart: top 10 keywords]                      │   │
│  │                                                            │   │
│  │  ⚖️ Keyword Comparison (chọn 2-4 keywords để so sánh)       │   │
│  │  [BarChart + MetricsTable]                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  TAB 2: TREND PREDICTION (🆕 AI-powered)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  🤖 AI TREND FORECAST                                      │   │
│  │  ┌────────────────────────────────────────────────────┐   │   │
│  │  │ 🔥 RISING STARS (keywords sẽ bùng nổ 6-12 tháng tới)│   │   │
│  │  │ • "federated learning healthcare"  ↗ +340% expected │   │   │
│  │  │ • "vision transformer medical"     ↗ +280% expected │   │   │
│  │  │ • "quantum machine learning"       ↗ +210% expected │   │   │
│  │  ├────────────────────────────────────────────────────┤   │   │
│  │  │ 📉 DECLINING (keywords đang giảm nhiệt)              │   │   │
│  │  │ • "traditional CNN classification" ↘ -15% trend     │   │   │
│  │  ├────────────────────────────────────────────────────┤   │   │
│  │  │ 🎯 MATCHED TO YOUR INTERESTS                         │   │   │
│  │  │ • "explainable AI radiology"  → matches your field  │   │   │
│  │  │ • "multi-modal medical imaging" → emerging in your  │   │   │
│  │  │   research area                                     │   │   │
│  │  └────────────────────────────────────────────────────┘   │   │
│  │                                                            │   │
│  │  📊 Trend Timeline (selected keyword)                       │   │
│  │  [LineChart: historical + predicted growth]                 │   │
│  │  ── actual ─ ─ predicted (dashed)                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  TAB 3: RESEARCH LANDSCAPE (🆕)                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  🗺 RESEARCH FIELD MAP                                     │   │
│  │  ┌────────────────────────────────────────────────────┐   │   │
│  │  │                                                    │   │   │
│  │  │   [AI/ML] ——— [Medical Imaging]                    │   │   │
│  │  │      │              │                              │   │   │
│  │  │      ├── [NLP]      ├── [Radiology]                │   │   │
│  │  │      │              │                              │   │   │
│  │  │      └── [CV]       └── [Pathology]                │   │   │
│  │  │                                                    │   │   │
│  │  │  Bubble size = paper count                         │   │   │
│  │  │  Color = trend direction (🟢 rising 🟡 stable 🔴)  │   │   │
│  │  └────────────────────────────────────────────────────┘   │   │
│  │                                                            │   │
│  │  📋 FIELD BREAKDOWN                                        │   │
│  │  | Field              | Papers | Growth | Hot? |           │   │
│  │  | Deep Learning      | 12,450 | +23%   | 🔥   |           │   │
│  │  | Medical Imaging    |  8,920 | +31%   | 🔥🔥 |           │   │
│  │  | NLP                |  5,340 | +5%    | 🟡   |           │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## API Design

### Endpoint 1: User Overview (FIX — thay thế endpoint ảo)

```
GET /api/v1/analytics/overview
Authorization: Bearer <token>

Response:
{
  "totalPapers": 1234,
  "totalCitations": 5678,
  "hIndex": 23,
  "activeFields": 4,
  "growth": {
    "papers": { "value": 12, "direction": "up" },
    "citations": { "value": 8, "direction": "up" },
    "hIndex": { "value": 1, "direction": "up" },
    "activeFields": { "value": 1, "direction": "up" }
  }
}
```

**Data source:** User's search history, bookmarks, follows → aggregate paper stats từ SQL Server.

### Endpoint 2: User Publication Trends (FIX)

```
GET /api/v1/analytics/trends?period=yearly|monthly

Response:
{
  "period": "yearly",
  "data": [
    { "label": "2021", "paperCount": 45, "citationCount": 120 },
    { "label": "2022", "paperCount": 89, "citationCount": 340 },
    ...
  ]
}
```

**Data source:** Papers related to user's keywords/interests, grouped by year/month.

### Endpoint 3: User Keyword Analytics (FIX)

```
GET /api/v1/analytics/keywords

Response:
{
  "topKeywords": [
    { "keyword": "deep learning", "paperCount": 156, "citationSum": 890 },
    { "keyword": "medical imaging", "paperCount": 98, "citationSum": 560 },
    ...
  ]
}
```

**Data source:** Aggregate từ user's search history + bookmarked papers + followed keywords.

### Endpoint 4: AI Trend Prediction (🆕)

```
GET /api/v1/analytics/trend-prediction?field=medical+imaging

Response:
{
  "risingStars": [
    {
      "keyword": "federated learning healthcare",
      "currentPapers": 234,
      "growthRate": 340,
      "predictedPeak": "2027-Q2",
      "confidence": 85,
      "matchesUserInterest": true,
      "rationale": "Growing at 340% YoY, driven by privacy regulations in healthcare"
    }
  ],
  "declining": [
    {
      "keyword": "traditional CNN classification",
      "currentPapers": 1200,
      "growthRate": -15,
      "rationale": "Saturated field, shifting toward transformer architectures"
    }
  ],
  "matchedToUser": [
    {
      "keyword": "explainable AI radiology",
      "growthRate": 210,
      "relevanceReason": "Matches your interest in medical imaging + deep learning"
    }
  ],
  "generatedAt": "2026-07-17T10:00:00"
}
```

**Cách hoạt động:**
1. Lấy publication trends từ OpenAlex `group_by=publication_year` cho các keyword trong field
2. Tính growth rate thực tế 3 năm gần nhất
3. Gửi cho DeepSeek: "Dựa trên trend data này, keyword nào sẽ bùng nổ 6-12 tháng tới?"
4. AI cross-reference với user's interests → đánh dấu `matchesUserInterest`

### Endpoint 5: Research Landscape (🆕)

```
GET /api/v1/analytics/research-landscape

Response:
{
  "fields": [
    {
      "fieldName": "Deep Learning",
      "paperCount": 12450,
      "growthRate": 23,
      "trendDirection": "rising",    // rising | stable | declining
      "subFields": [
        { "name": "Computer Vision", "paperCount": 5600, "growthRate": 18 },
        { "name": "NLP", "paperCount": 4300, "growthRate": 31 }
      ],
      "topKeywords": ["transformer", "attention mechanism", ...]
    }
  ],
  "crossFieldTrends": [
    {
      "connection": "Deep Learning × Medical Imaging",
      "growthRate": 45,
      "description": "Fastest growing interdisciplinary area"
    }
  ]
}
```

**Data source:** Neo4j graph (ResearchField nodes + relationships) + OpenAlex trends.

---

## 💰 AI Cost Optimization — Cache Strategy

### Vấn Đề

Trend Prediction gọi DeepSeek AI. Nếu không cache, mỗi user mở Analytics tab là 1 AI call:
- 100 users × 2 lần/ngày × $0.003/lần = **$18/tháng** (riêng Analytics)
- Nhiều user cùng research field → gọi lại AI với cùng input

### Giải Pháp: 2-Tier Cache

| AI Call | L1 RAM | L2 DB | Hit Rate |
|---|---|---|---|
| Trend Prediction | 6h TTL, key = `fieldName + date` | `TREND_PREDICTION_CACHE` (1 ngày) | ~85% |
| Research Landscape | 1h TTL, key = `fieldName` | Không cần (Neo4j query) | ~70% |

### DB Table

```sql
-- =============================================
-- TREND_PREDICTION_CACHE
-- Cache ket qua AI trend prediction theo field + date
-- Nhieu user cung field → shared cache
-- =============================================
CREATE TABLE TREND_PREDICTION_CACHE (
    cache_id      UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    field_name    NVARCHAR(200) NOT NULL,
    cache_date    DATE NOT NULL,                -- Ngay cache (1 ngay 1 lan)
    result_json   NVARCHAR(MAX) NOT NULL,       -- Toan bo prediction JSON
    created_at    DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT UQ_TREND_FIELD_DATE UNIQUE (field_name, cache_date)
);

CREATE INDEX IX_TREND_CACHE_DATE 
    ON TREND_PREDICTION_CACHE(cache_date DESC);
```

### Cleanup Job

```sql
-- Scheduled job: Xoa cache > 7 ngay
-- Implement trong ScheduledCacheCleanupService.java
-- Chay moi gio, xoa TREND_PREDICTION_CACHE WHERE cache_date < DATEADD(DAY, -7, GETDATE())
```

### Chi Phí Sau Cache

| Scenario | Không cache | Có cache | Tiết kiệm |
|---|---|---|---|
| 100 user xem cùng "Medical Imaging" | 100× AI calls | 1 AI call, 99× cache hit | **99%** |
| User mở Analytics 2 lần/ngày | 2× AI calls | L1 RAM hit lần 2 | **50%** |

---

## Backend Implementation

| # | Task | Mô tả | Effort |
|---|---|---|---|
| B1 | `GET /analytics/overview` | User-personalized stat cards | 1.5h |
| B2 | `GET /analytics/trends` | User publication timeline | 1h |
| B3 | `GET /analytics/keywords` | Top keywords của user | 1h |
| B4 | `GET /analytics/trend-prediction` | AI dự đoán trend **với L1 RAM + L2 DB cache** | 2.5h |
| B5 | `GET /analytics/research-landscape` | Gom nhóm field từ Neo4j | 1.5h |
| B6 | `AnalyticsController` | Thêm 5 endpoints mới | 30ph |
| B7 | DTOs | 5 response DTOs | 1.5h |
| B8 | Entity + Cache Table | `TrendPredictionCache` entity + repository + SQL migration | 45ph |
| B9 | `ScheduledCacheCleanupService` | Cleanup job cho trend cache | 15ph |

**Tổng BE: ~10.5h**

## Frontend Implementation

| # | Task | Mô tả | Effort |
|---|---|---|---|
| F1 | Router + Sidebar | Thêm route `/analytics` + nav item `BarChart3` icon | 20ph |
| F2 | Sửa `api.js` | Fix 4 API calls (đúng endpoint) + thêm 2 API mới | 30ph |
| F3 | Tab 1: My Analytics | Stat cards + Publication Trends chart + Top Keywords + Comparison | 2h |
| F4 | Tab 2: Trend Prediction | Rising Stars / Declining cards + Trend Timeline chart + Matched to User | 2h |
| F5 | Tab 3: Research Landscape | Bubble chart (Recharts Scatter) + Field Breakdown table | 1.5h |
| F6 | i18n | en/vi cho analytics labels, trend prediction, landscape | 30ph |

**Tổng FE: ~7h**

---

## Tổng Effort Flow 2: ~18h

| Layer | Effort |
|---|---|
| Backend | 10.5h |
| Frontend | 7.5h |

---

## AI Integration Points

| # | AI Call | Input | Output |
|---|---|---|---|
| 1 | Trend Prediction | OpenAlex yearly publication data cho 20+ keywords trong field | Rising stars + declining keywords + rationale |
| 2 | Match to User | User's keywords/interests + predicted trends | Đánh dấu keyword nào liên quan đến user |

---

## Data Sources

| Data | Source |
|---|---|
| User search history | `USER_SEARCH_HISTORY` table |
| User bookmarks | `BOOKMARK` table |
| User follows | `FOLLOW` table (journals, keywords, authors) |
| Paper stats | `RESEARCH_PAPER` table (SQL Server) |
| Keyword co-occurrence | Neo4j graph (`GraphService`) |
| Publication trends | OpenAlex `group_by=publication_year` |
| Research fields | `RESEARCH_FIELD` table + Neo4j |

---

## Verification

1. `GET /analytics/overview` → user-specific stats (khác nhau giữa các user)
2. `GET /analytics/trends?period=yearly` → data theo year, đúng papers của user
3. `GET /analytics/keywords` → top keywords từ search history
4. `GET /analytics/trend-prediction?field=medical+imaging` → rising stars + declining + matched
5. `GET /analytics/research-landscape` → fields + subfields + cross-field trends
6. FE Tab 1: Stat cards hiển thị + charts render
7. FE Tab 2: Rising stars cards + trend timeline chart
8. FE Tab 3: Research landscape bubble chart + field table
9. Sidebar: Analytics nav item xuất hiện cho researcher + academic_user
10. Switch Tiếng Việt → tất cả labels đúng
