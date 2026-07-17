# SCITRACK Flow 3 — Research Workspace Enhancement Plan

## Thực Trạng

Flow 3 đã có nền tảng tốt (~80% hoàn thiện). Các tính năng CRUD cơ bản đều chạy. Cần fix bugs + thêm AI để nâng cấp.

```
✅ Bookmarks + Collections — Full CRUD, bulk ops, export
✅ Follows — 4 entity types, notification toggle
✅ Reading History — Deduplicated, timestamps, auto-prune
✅ Notifications — Grouped by date, SSE backend ready
✅ Citation Export — 4 formats, server + client fallback

🔧 Recommendations — Engine có nhưng bị bypass (DEBUG comment)
🔧 Reports — Chỉ có keyword trend, thiếu Journal + Author UI
🔧 SSE Notifications — Backend có nhưng FE dùng polling
🔧 Bookmark Notes — Có trong DB nhưng FE không hiển thị
🔧 CSV Export — Thiếu journal, year, citations, DOI
```

---

## Kiến Trúc Flow 3 Mới

```
┌──────────────────────────────────────────────────────────────────┐
│  RESEARCH WORKSPACE (3 Tabs)                                     │
│                                                                  │
│  [🔖 My Library]  [🤖 Recommendations]  [📊 Reports]             │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  TAB 1: MY LIBRARY                                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ┌─ Bookmarks ─────────────────────────────────────────┐  │   │
│  │  │ [All] [Collection A] [Collection B] [+ New]          │  │   │
│  │  │ ┌──────────────────────────────────────────────────┐ │  │   │
│  │  │ │ ☐ Paper title...  [📝 Notes]  🔥234 cites  ⭐Save│ │  │   │
│  │  │ │ ☐ Paper title...  [📝 Notes]  🔥189 cites  ⭐Save│ │  │   │
│  │  │ └──────────────────────────────────────────────────┘ │  │   │
│  │  │ [☐ Select All]  [🗑 Bulk Remove]  [📥 Export (4)]   │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                            │   │
│  │  ┌─ Follows ──────────────────────────────────────────┐   │   │
│  │  │ [All] [Journals] [Topics] [Keywords] [Authors]      │   │   │
│  │  │ 📚 Nature Medicine    🔔on  [Unfollow]              │   │   │
│  │  │ 🏷 deep learning      🔔on  [Unfollow]              │   │   │
│  │  └────────────────────────────────────────────────────┘   │   │
│  │                                                            │   │
│  │  ┌─ Reading History ─────────────────────────────────┐    │   │
│  │  │ 📄 Paper title...      2 hours ago                  │   │   │
│  │  │ 📄 Paper title...      Yesterday                    │   │   │
│  │  └────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  TAB 2: RECOMMENDATIONS (🆕 AI-Powered)                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  🤖 FOR YOU — Based on your research interests             │   │
│  │  ┌────────────────────────────────────────────────────┐   │   │
│  │  │ Interest Profile:                                    │   │   │
│  │  │ 🔑 Top keywords: deep learning, medical imaging...   │   │   │
│  │  │ 📚 Top journals: Nature Medicine, IEEE TMI...        │   │   │
│  │  │ 🏷 Top fields: AI/ML, Radiology, Computer Vision     │   │   │
│  │  │                                                      │   │   │
│  │  │ 📄 Recommended Papers:                               │   │   │
│  │  │ ┌──────────────────────────────────────────────────┐ │   │   │
│  │  │ │ ⭐94% match — "Vision Transformer for..."          │ │   │   │
│  │  │ │   Reason: Matches your interest in medical AI     │ │   │   │
│  │  │ │   [Save] [Not interested]                         │ │   │   │
│  │  │ ├──────────────────────────────────────────────────┤ │   │   │
│  │  │ │ ⭐87% match — "Federated Learning in Healthcare"   │ │   │   │
│  │  │ │   Reason: Related to your searches on privacy     │ │   │   │
│  │  │ │   [Save] [Not interested]                         │ │   │   │
│  │  │ └──────────────────────────────────────────────────┘ │   │   │
│  │  └────────────────────────────────────────────────────┘   │   │
│  │                                                            │   │
│  │  🔄 TRENDING IN YOUR FIELDS                                │   │
│  │  ┌────────────────────────────────────────────────────┐   │   │
│  │  │ 📄 Paper title...  🔥1,234 cites  ↗+45% this month  │   │   │
│  │  │ 📄 Paper title...  🔥890 cites   ↗+32% this month   │   │   │
│  │  └────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  TAB 3: REPORTS                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  [📈 Keyword Trend]  [📚 Journal Quality]  [👤 Author Impact]│   │
│  │  ─────────────────────────────────────────────────────    │   │
│  │                                                            │   │
│  │  📈 KEYWORD TREND (đã có)                                  │   │
│  │  ┌─ Search + Generate Report ──────────────────────────┐  │   │
│  │  ┌─ Report History Table ──────────────────────────────┐  │   │
│  │                                                            │   │
│  │  📚 JOURNAL QUALITY (🆕 UI)                                 │   │
│  │  ┌─ Search journal → Impact Factor + Quartile + Stats ──┐  │   │
│  │                                                            │   │
│  │  👤 AUTHOR IMPACT (🆕 UI)                                   │   │
│  │  ┌─ Search author → H-Index + Citations + Collaborations┐  │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Backend Implementation

| # | Task | Mô tả | Effort |
|---|---|---|---|
| B1 | **Fix Recommendation Engine** | Bỏ DEBUG bypass, kích hoạt hybrid engine (interest profile + content-based + collaborative). Fix lỗi hang đã comment. Thêm L1 RAM cache 30ph | 3h |
| B2 | `GET /recommendations` | Trả về interest profile + recommended papers kèm match score + reason | 1h |
| B3 | `GET /recommendations/trending-in-field` | Trending papers trong research field của user (dùng Neo4j + OpenAlex) | 1h |
| B4 | Fix CSV Export | Thêm journal, year, citations, DOI vào BookmarkResponse DTO | 30ph |
| B5 | Bookmark Notes API | `PUT /bookmarks/{id}/notes` — cập nhật notes cho bookmark | 20ph |
| B6 | SSE Notification Client | Thêm `EventSource` listener trong FE để thay thế polling | 30ph |
| B7 | DTOs | `RecommendationResponse`, `InterestProfile`, `TrendingInFieldResponse` | 45ph |

**Tổng BE: ~7h**

## Frontend Implementation

| # | Task | Mô tả | Effort |
|---|---|---|---|
| F1 | Tab 1: My Library | Gộp Bookmarks + Follows + Reading History vào 1 page với sub-tabs | 2h |
| F2 | Tab 1: Bookmark Notes | Thêm inline edit notes trên mỗi bookmark card | 45ph |
| F3 | Tab 2: Recommendations | Interest Profile card + Recommended Papers list + Feedback buttons | 2.5h |
| F4 | Tab 2: Trending in Field | Grid cards trending papers với growth indicator | 1h |
| F5 | Tab 3: Journal Quality Report | Search input + kết quả IF, quartile, stats chart | 1.5h |
| F6 | Tab 3: Author Impact Report | Search input + h-index, citations, collaborations | 1.5h |
| F7 | SSE Notifications | Thay polling 30s → `EventSource` real-time | 30ph |
| F8 | Sidebar gộp | Gộp Bookmarks + Follows + History + Notifications → 1 "Workspace" sidebar item | 30ph |

**Tổng FE: ~10.5h**

---

## Cấu Trúc Sidebar Mới

```
Trước (7 items riêng lẻ):          Sau (gộp vào Workspace):
┌─────────────────────┐            ┌─────────────────────┐
│ 📊 Overview         │            │ 📊 Overview         │
│ 🔍 Search           │            │ 🔍 Search           │
│ 📖 Journal Search   │            │ 📖 Journal Search   │
│ 👤 Author Search    │            │ 👤 Author Search    │
│ ⭐ Bookmarks        │            │ 💼 Workspace    🆕   │
│ 📜 Reading History  │            │ 🧠 Idea Analysis    │
│ 🔔 Follows          │            │ 📈 Analytics        │
│ 🔔 Notifications    │            │ 📄 Reports          │
│ 📄 Reports          │            └─────────────────────┘
└─────────────────────┘
```

Workspace gộp: Bookmarks + Collections + Follows + Reading History + Notifications trong 1 page với tabs.

---

## AI Integration Points

| # | AI Call | Mục đích |
|---|---|---|
| 1 | **Recommendation scoring** | Interest profile → score từng candidate paper → giải thích lý do gợi ý |

Recommendation engine **không cần gọi AI mỗi lần** — dùng hybrid algorithm (content + collaborative) là chính, AI chỉ để generate "reason" text giải thích tại sao gợi ý paper này.

---

## Tổng Effort Flow 3: ~17.5h

| Layer | Effort |
|---|---|
| Backend | 7h |
| Frontend | 10.5h |

---

## Verification

1. Tab My Library: Bookmarks hiển thị + notes editable inline
2. Tab My Library: Collections CRUD hoạt động
3. Tab My Library: Follows tabs filter đúng entity type
4. Tab My Library: Reading History hiển thị deduplicated
5. Tab Recommendations: Interest Profile hiển thị đúng keywords/journals/fields của user
6. Tab Recommendations: Paper cards có match score + reason + Save/Not Interested buttons
7. Tab Recommendations: Click Save → paper vào bookmarks (sync với Tab 1)
8. Tab Recommendations: Click Not Interested → ẩn paper, không hiện lại
9. Tab Reports: Journal Quality → search journal → hiển thị IF, quartile, stats
10. Tab Reports: Author Impact → search author → hiển thị h-index, citations
11. SSE: Nhận notification real-time, sidebar badge cập nhật không cần polling
12. CSV Export: File chứa đầy đủ journal, year, citations, DOI
