# SCITRACK — Đánh giá năng lực hệ thống (CẬP NHẬT)

> **Ngày gốc:** 2026-07-02 | **Ngày cập nhật:** 2026-07-05
> **Phạm vi:** Kiểm tra toàn bộ (BE + FE) dựa trên 12 yêu cầu gốc và 34 mục thiếu sót đã xác định

---

## 📊 Tổng quan tiến độ

| Phạm vi | Tổng mục | ✅ Đã xong | ❌ Chưa làm | Tỷ lệ |
|---------|----------|-----------|------------|-------|
| BE P0-P2 | 12 | 11 | 1 | **92%** |
| FE P0 | 5 | 5 | 0 | **100%** |
| FE P1-P2 | 12 | 10 | 2 | **83%** |
| **TỔNG** | **29** | **26** | **3** | **90%** |

---

# BACKEND — Những gì đã hoàn thành từ danh sách thiếu sót

## ✅ Đã sửa xong

| # | Mục | Ưu tiên cũ | Chi tiết |
|---|-----|-----------|----------|
| 1 | **Email delivery** | 🔴 P0 | `EmailServiceImpl.java` — `JavaMailSender` + `MimeMessageHelper`, HTML email template, `@Async`. Gửi verification, password reset, simple email |
| 2 | **Citation export** | 🔴 P0 | `CitationService.java` — BibTeX, RIS, APA (7th), MLA (9th). Single endpoint `GET /api/v1/papers/{paperId}/citation` + bulk `POST /api/v1/papers/citations/export` |
| 3 | **Multiple notification types** | 🔴 P0 | Enum 4 loại đều đã trigger: NEW_PAPER (`NotificationTriggerService`), TREND_ALERT (`TrendingTopicSyncService` — top 5 trending, mỗi 12h), SYSTEM (trial notification), UPGRADE_PROMPT (`PaperSearchServiceImpl` — 80% & 100% limit). Tất cả push qua SSE |
| 4 | **User-controlled sorting** | 🔴 P0 | `PaperSearchRequestDTO` — `sortBy` (relevance/citations/title/date) + `sortDirection` (asc/desc). Endpoint `GET /api/v1/papers/sorted` |
| 6 | **AI summarization** | 🟠 P1 | `AISummarizationService.java` — DeepSeek-powered: `summarizeAbstract()`, `extractMethodology()`, `batchAnalyze()`. Cache 1h TTL |
| 7 | **Personalized recommendations** | 🟠 P1 | `PaperRecommendationServiceImpl.java` — Hybrid: content-based (Neo4j) + collaborative filtering + cold-start fallback. Endpoint `GET /api/v1/papers/recommendations` |
| 8 | **Similar papers endpoint** | 🟠 P1 | `PaperRecommendationServiceImpl.getSimilarPapers()` — 2 strategies (same field + Neo4j keyword overlap). Endpoint `GET /api/v1/papers/{paperId}/similar` |
| 9 | **WebSocket/real-time push** | 🟠 P1 | `NotificationSseController.java` — SSE (Server-Sent Events). Endpoint `GET /api/v1/notifications/stream`. Per-user emitter registry, 5-min timeout + heartbeat |
| 10 | **Bulk operations** | 🟡 P2 | `POST/DELETE /api/v1/bookmarks/bulk` + `DELETE /api/v1/notifications/bulk` |
| 11 | **Refresh token** | 🟡 P2 | `POST /api/auth/refresh-token` — 64-byte random token, 7-day expiry, rotation, `UserSession` storage |
| 12 | **Rate limiting** | 🟡 P2 | `RateLimitInterceptor.java` — Bucket4j token-bucket, 3 tiers (public 30rpm / authenticated 60rpm / admin 120rpm), `X-RateLimit-*` headers, `WebConfig.java` wired to `/api/**` |

## ❌ Vẫn chưa làm

| # | Mục | Ưu tiên | Chi tiết |
|---|-----|---------|----------|
| 5 | **Reports với AI** | 🟠 P1 | `ReportServiceImpl.java` vẫn hardcoded template tiếng Việt. AI services (DeepSeek, Gemini) đã có sẵn nhưng chưa tích hợp vào report pipeline |

---

# FRONTEND — Những gì đã hoàn thành từ danh sách thiếu sót

## ✅ P0: UI đã kết nối API

| # | Mục | Đã làm |
|---|-----|--------|
| 1 | **Overview/Dashboard** | `UserOverviewPage.jsx` — gọi 3 API thật: `getUserOverview()`, `getRoleStatistics()`, `getPublicOverview()`. Có loading skeleton + error retry |
| 2 | **Bookmarks** | `BookmarksView.jsx` — dùng `bookmarkAPI.getMyBookmarks()` + CRUD collections qua API. Không còn `sessionStorage` |
| 3 | **Reports** | `ReportsViewPage.jsx` — gọi `reportAPI.getKeywordTrend/getJournalQuality/getAuthorImpact()`. Không còn `setTimeout()` |
| 4 | **Advanced filters** | `AdvancedFilter.jsx` — không còn "Premium" overlay. `AcademicLimitAlert` là dead code, không được import |
| 5 | **Admin overview** | `AdminOverviewPage.jsx` — gọi `adminAPI.getOverview()`, auto-refresh 60s, loading/error/retry state. 5 stat cards + status banner |

## ✅ P1: Tính năng mới đã có UI

| # | Mục | Chi tiết |
|---|-----|----------|
| 6 | **Citation export UI** | `CitationExport.jsx` — tab BibTeX/RIS/APA, copy-to-clipboard, download. `citationGenerators.js` — `generateBibtex()`, `generateRIS()`, `generateAPA()`. Bulk export trong `BookmarksView.jsx` |
| 7 | **Keyword comparison view** | `AnalyticsPage.jsx` — `KeywordComparison()` component với BarChart (recharts), multi-keyword input |
| 8 | **User-facing analytics page** | Route `/analytics` protected với `allowedRoles={['researcher', 'academic_user']}`. Admin bị loại khỏi route này |
| 9 | **Similar papers / recommendations** | `SimilarPapers.jsx` — hiển thị 4 paper liên quan dựa trên keyword overlap, filter current paper, clickable cards |
| 10 | **Paper detail page** | `PaperDetailPage.jsx` — 800+ dòng: title, authors, field badges, stat chips, abstract, AI summary, methodology, keyword tags, citation export, similar papers, bookmark toggle, PDF request, follow button |

## ✅ P2: Nice-to-have đã có

| # | Mục | Chi tiết |
|---|-----|----------|
| 11 | **Sort dropdown** | `SearchPapers.jsx` — 7 lựa chọn: relevance, newest, oldest, most/least cited, title A-Z/Z-A. Có i18n |
| 12 | **Password change UI** | `ChangePasswordForm.jsx` — current/new/confirm password, show/hide toggle, validation, auto-close after success |
| 14 | **Bulk actions** | `BulkActionBar.jsx` — floating bottom bar: deselect all, export selected, remove selected. Batch export panel trong bookmarks |
| 15 | **i18n cho notifications** | Đã có trong `common.json`, `settings.json`, `follow.json` (en + vi). `NotificationsPage.jsx` + `NotificationBell.jsx` dùng `useTranslation()` |
| 17 | **Profile photo upload** | `SettingsPage.jsx` — avatar upload với file input, base64 preview, hover Camera overlay, remove button |

## ❌ Vẫn chưa làm

| # | Mục | Ưu tiên | Chi tiết |
|---|-----|---------|----------|
| 13 | **Reading history UI** | 🟡 P2 | BE đã có đầy đủ: entity, repository, service, controller (`GET /api/v1/reading-history`). FE có API function `getReadingHistory()` trong `paper.api.js`. Nhưng chưa có React component nào hiển thị |
| 16 | **react-dnd usage** | 🟡 P2 | Package vẫn trong `package.json` nhưng không import ở đâu trong `src/` |

---

# 🔴 3 mục còn tồn đọng

| # | Mục | Bên | Ưu tiên | Công sức ước tính |
|---|-----|-----|---------|------------------|
| 1 | **Reports với AI** — thay hardcoded template bằng DeepSeek/Gemini (AI services đã có sẵn) | BE | 🟠 P1 | 2-3 ngày |
| 2 | **Reading history UI** — tạo component hiển thị lịch sử đọc (BE + API function đã có sẵn) | FE | 🟡 P2 | 1-2 ngày |
| 3 | **react-dnd usage** — dùng hoặc gỡ khỏi package.json | FE | 🟡 P2 | 1 ngày |

---

# 📈 So sánh các lần kiểm tra

| | 2026-07-02 (gốc) | 2026-07-05 (lần 1) | 2026-07-05 (lần 2) |
|---|-----------------|--------------------|---------------------|
| **BE hoàn thiện** | ~80% của 12 yêu cầu | 71% (8/12) | **92% (11/12)** |
| **FE P0 kết nối API** | 0/5 | 80% (4/5) | **100% (5/5)** |
| **FE P1 chưa có UI** | 0/5 | 100% (5/5) | **100% (5/5)** |
| **FE P2 nice-to-have** | 0/7 | 71% (5/7) | **71% (5/7)** |
| **Tổng mục đã xong** | — | 22/29 (78%) | **26/29 (90%)** |
| **Còn tồn đọng** | 29 | 6 | **3** |
