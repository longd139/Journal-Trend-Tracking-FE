# SCITRACK — Đánh giá năng lực hệ thống

> **Ngày:** 2026-07-02
> **Phạm vi:** Kiểm tra toàn bộ (BE + FE) dựa trên 12 yêu cầu gốc và nhu cầu thực tế của researcher

---

## 12 yêu cầu gốc của hệ thống

1. User authentication and authorization
2. Search research papers by keyword, author, or journal
3. View paper details and publication information
4. Track publication trends by keyword or topic
5. Display charts and dashboard statistics
6. View trending research topics
7. Save bookmarks for papers or keywords
8. Follow journals or research topics
9. Receive notifications for newly published papers
10. Generate simple analytical reports
11. Synchronize data from external academic APIs
12. Manage users and system configuration (Admin)

---

# BACKEND — Những gì ĐÃ làm được

## ✅ Đã hoàn thiện và hoạt động

| # | Yêu cầu | Trạng thái | Chi tiết |
|---|---------|-----------|----------|
| 1 | **Auth & authorization** | ✅ Xong | Register, login (email + Google OAuth), JWT có token blacklist, 3 role (ADMIN / RESEARCHER / ACADEMIC_USER), bảo vệ endpoint theo role bằng `@PreAuthorize` |
| 2 | **Paper search** | ✅ Xong | Tìm theo keyword (Neo4j graph → SQL → OpenAlex fallback), theo author, theo journal. Async graph search cho deep exploration |
| 3 | **Paper details** | ✅ Xong | Đầy đủ thông tin: title, abstract (tái tạo từ inverted index), authors, citations, DOI, OA status, publication date, journal |
| 4 | **Trend tracking** | ✅ Xong | `KeywordQuickStatsService` — papers/citations/YoY growth theo keyword. `WeeklyBreakoutService` — top 5 breakout topics kèm sparkline |
| 5 | **Dashboard statistics** | ✅ Xong | 3 tầng dashboard: Public (`/api/public/dashboard`), Authenticated (`/api/v1/overview/statistics`), User-role-specific (`/api/v1/overview/user`) |
| 6 | **Trending topics** | ✅ Xong | Hot keywords (theo tần suất tìm kiếm), trending keywords (từ config), Google Trends sync |
| 7 | **Bookmarks** | ✅ Xong | CRUD bookmark cho paper & keyword. Collections (thư mục) với CRUD đầy đủ |
| 8 | **Follow system** | ✅ Xong | Follow journal/topic/keyword. Bật/tắt notification cho từng follow |
| 9 | **Notifications** | ✅ Xong | `NotificationTriggerService` tạo notification NEW_PAPER khi paper mới khớp với follow của user. CRUD endpoints |
| 10 | **Reports (backend)** | ⚠️ Một phần | 3 API reports: keyword trend, author impact, journal quality, insight bằng tiếng Việt theo template. Có cache |
| 11 | **Data sync** | ✅ Xong | 4 nguồn: OpenAlex (chính, deep sync tối đa 40k papers/keyword), Semantic Scholar, arXiv, CORE. Bulk async sync có progress tracking. Scheduled auto-sync 2h sáng hàng ngày |
| 12 | **Admin management** | ✅ Xong | User CRUD, system configs, data sources, audit logs, PDF request workflow, cache management |

## 🔶 Điểm mạnh khác của BE (ngoài 12 yêu cầu)

| Tính năng | Mô tả |
|-----------|-------|
| **Author analytics** | Quick stats (h-index, affiliation, timeline, research focus pie, co-author network) — lấy từ OpenAlex |
| **Journal analytics** | Quartile, Impact Factor, CiteScore, editorial "taste" keywords, timeline, top papers/authors |
| **Neo4j graph** | Keyword-paper graph, co-occurrence queries, niche topic discovery, paper-keyword network |
| **Gemini AI** | Keyword expansion (6 từ khóa liên quan) với cache 1h + fallback map nội bộ |
| **Advanced filtering** | API hỗ trợ lọc theo year range, research field, journal, OA status, min citations |
| **PDF request workflow** | User gửi yêu cầu → admin tìm/duyệt/từ chối |
| **Search history** | Lưu lịch sử tìm kiếm để xếp hạng "hot" keywords và hiển thị lại cho user |
| **Bookmark collections** | Tổ chức bookmark theo thư mục (vượt ngoài bookmark đơn giản) |
| **Health check** | Kiểm tra trạng thái hệ thống (SQL Server + Neo4j connectivity) |

---

# BACKEND — Những gì CHƯA làm được

## 🔴 Thiếu sót nghiêm trọng — cần sửa trước khi production

| # | Thiếu sót | Ảnh hưởng | Ưu tiên |
|---|-----------|----------|---------|
| 1 | **Chưa có email delivery** | Password reset & email verification chỉ in ra terminal. User không thể reset password hay verify email trong production. Chưa cấu hình `JavaMailSender` | 🔴 P0 |
| 2 | **Chưa có citation export** | Không có BibTeX, RIS, APA, MLA. Researcher phải copy-paste thủ công — đây là tính năng sống còn | 🔴 P0 |
| 3 | **Chỉ có 1 loại notification** | Duy nhất trigger `NEW_PAPER`. Thiếu: trending topic bùng nổ, citation milestone, author đang follow có paper mới, bookmark collection được cập nhật | 🔴 P0 |
| 4 | **Không có user-controlled sorting** | Kết quả tìm kiếm chỉ sắp xếp theo `createdAt DESC`. Không sắp xếp được theo citations, relevance, title, date | 🔴 P0 |
| 5 | **Reports dùng template cứng** | 3 reports dùng chuỗi tiếng Việt cố định. Không có AI-generated insights. Gemini đã tích hợp sẵn nhưng không dùng cho report | 🟠 P1 |

## 🟠 Thiếu sót quan trọng — nên sửa sớm

| # | Thiếu sót | Ảnh hưởng | Ưu tiên |
|---|-----------|----------|---------|
| 6 | **Chưa có AI summarization** | Gemini chỉ dùng để expand keyword. Không tóm tắt abstract, không phân tích batch papers, không trích xuất methodology | 🟠 P1 |
| 7 | **Chưa có personalized recommendations** | Không có "papers you might like", không có content-based hoặc collaborative filtering. Đã có `UserSearchHistoryService` nhưng chưa dùng để gợi ý | 🟠 P1 |
| 8 | **Chưa có "similar papers" endpoint** | Không tìm được paper tương tự từ một paper gốc — đây là quy trình nghiên cứu cơ bản | 🟠 P1 |
| 9 | **Chưa có WebSocket / real-time push** | Notification chỉ dùng polling. Không có SSE, không có WebSocket | 🟠 P1 |
| 10 | **Chưa có bulk operations** | Không batch bookmark, batch export, batch delete | 🟡 P2 |
| 11 | **Chưa có refresh token** | JWT logout dùng token blacklist. Không có refresh token — user phải login lại khi token hết hạn | 🟡 P2 |
| 12 | **Chưa có rate limiting** | Chỉ theo dõi số lượt search cho mỗi user. Không giới hạn theo IP hoặc theo endpoint | 🟡 P2 |

## 🟡 Nice-to-have

| # | Thiếu sót | Ưu tiên |
|---|-----------|---------|
| 13 | Chưa có keyword comparison endpoint (so sánh nhiều keyword trên cùng biểu đồ) | 🟡 P2 |
| 14 | Chưa có research gap detection (tìm khu vực ít được nghiên cứu) | 🟡 P2 |
| 15 | Chưa có journal matching (gợi ý venue để submit paper) | 🟡 P2 |
| 16 | Chưa có automated PDF retrieval (admin phải xử lý PDF request thủ công) | 🟡 P2 |
| 17 | Chưa có country/institution breakdown cho trends | 🟡 P2 |
| 18 | Entity `PublicationTrend` và `ResearchTopic` đã tồn tại nhưng chưa có endpoint nào dùng đến | 🟡 P2 |

---

# FRONTEND — Những gì ĐÃ làm được

## ✅ Đã hoàn thiện và kết nối API thật

| # | Tính năng | Trạng thái | Chi tiết |
|---|-----------|-----------|----------|
| 1 | **Auth pages** | ✅ Xong | Login (email + Google OAuth), Register, Reset Password. `AuthPage` có role selector. JWT lưu trong Zustand + sessionStorage |
| 2 | **Search papers** | ✅ Xong | Tìm theo keyword với search history (localStorage), pre-search trending chips + weekly breakout sparkline cards, post-search Quick Stats từ API, Knowledge Graph (vis-network), Related Trends, Top Cited Papers |
| 3 | **Search authors** | ✅ Xong | Author profile card (avatar, affiliation, ORCID), stat cards (papers, citations, h-index, i10-index), publication timeline ComposedChart, research focus pie chart, co-authors network. Tất cả từ API thật |
| 4 | **Search journals** | ✅ Xong | Duyệt theo category tabs, journal cards với badge IF/quartile, detail view có timeline AreaChart, top papers, top authors. Có nút Follow. Tất cả từ API thật |
| 5 | **Follows** | ✅ Xong | Danh sách follows theo loại (All/Journal/Topic/Keyword), bật/tắt notification cho từng follow, unfollow với confirmation dialog. API thật |
| 6 | **Notifications** | ✅ Xong | NotificationBell với floating panel (tabs All/Unread, detail view, dismiss), full-page notification center, polling unread count mỗi 30s, mark-all-read. API thật |
| 7 | **Database stats (admin)** | ✅ Xong | Papers, authors, keywords, journals, Neo4j stats, source breakdown, year distribution, orphan detection. API thật, có zero-data retry |
| 8 | **Sync data (admin)** | ✅ Xong | Single sync, bulk sync (có live progress bar), deep sync OpenAlex, auto-sync toggle. API thật + Zustand store |
| 9 | **User management (admin)** | ✅ Xong | Bảng phân trang, search, role filter, add/edit, status toggle. API thật |
| 10 | **Audit logs (admin)** | ✅ Xong | Phân trang, lọc theo action. API thật |
| 11 | **i18n** | ✅ Xong | 2 ngôn ngữ (en/vi), 10 translation namespaces, `Intl` formatting, LanguageSwitcher component. Độ phủ tốt |
| 12 | **Settings — profile** | ✅ Xong | Name, institution (có autocomplete), language preference. API thật |

## 🔶 Điểm mạnh khác của FE

| Tính năng | Mô tả |
|-----------|-------|
| **Landing page** | Trang marketing đầy đủ: video background, feature bento-grid, horizontal-scroll trending papers carousel |
| **Dark-only theme** | Design system nhất quán với CSS custom properties, Tailwind v4, 50+ shadcn/ui components |
| **Framer Motion** | Animation mượt trên tất cả các trang |
| **Responsive** | Giao diện thích ứng mobile |
| **Role-based routing** | Dynamic `/:roleName` routes với `ProtectedRoute` guard |

## ⚠️ UI đã dựng nhưng dùng mock data (CHƯA kết nối API)

| Tính năng | Đã có gì | Còn thiếu gì |
|-----------|----------|-------------|
| **User Overview/Dashboard** | UI đầy đủ: stat cards, area chart, pie chart, publication table, recommended papers | TOÀN BỘ data là hardcoded. Không gọi API. BE đã có `UserOverviewService` với endpoint sẵn |
| **Admin Overview** | UI đầy đủ: stat cards, request volume chart, visitor traffic, resource usage bars, recent events | TOÀN BỘ hardcoded. Không gọi API |
| **API Monitoring** | 6 endpoint cards, latency sparklines, expandable details | TOÀN BỘ mock data |
| **Reports** | 3 quick templates, custom report modal (name, format PDF/CSV/ZIP, date range, include citations/abstracts), history table | Generate dùng `setTimeout()` giả lập. BE đã có 3 report endpoints sẵn |
| **Bookmarks** | Danh sách paper kèm details, nút remove, empty state | Dùng `sessionStorage` — mất khi tắt tab. BE đã có Bookmark + Collection CRUD đầy đủ |
| **Advanced search filters** | UI đã dựng: year range, research fields, min citations, OA toggle | Bị khóa sau màn hình "Premium". Researcher cũng không dùng được. BE đã có `GET /api/v1/papers/filter/advanced` sẵn |
| **Settings — Notifications prefs** | Card hiển thị nhãn "active" | Click vào không có tác dụng — chưa có toggle cho từng loại notification |
| **Settings — Appearance** | Card đã có | Gắn nhãn "SOON", bị disable |
| **Settings — Privacy** | Card đã có | Gắn nhãn "SOON", bị disable |

---

# FRONTEND — Những gì CHƯA làm được

## 🔴 Thiếu sót nghiêm trọng — UI đã có nhưng chưa kết nối API

| # | Thiếu sót | Ảnh hưởng | Ưu tiên |
|---|-----------|----------|---------|
| 1 | **Overview/Dashboard chưa kết nối** | Trang đầu tiên user thấy sau khi login hiển thị dữ liệu giả. BE đã có endpoint và hoạt động. Chỉ cần nối dây | 🔴 P0 |
| 2 | **Bookmarks chưa được lưu trữ** | Dùng `sessionStorage` — mất khi tắt tab. BE đã có CRUD API đầy đủ | 🔴 P0 |
| 3 | **Reports là giả** | `setTimeout()` mô phỏng việc tạo report. BE đã có 3 report endpoints sẵn | 🔴 P0 |
| 4 | **Advanced filters bị khóa** | UI đã dựng nhưng bị chặn bởi màn hình "Premium". BE `/filter/advanced` đã hoạt động đầy đủ | 🔴 P0 |
| 5 | **Admin overview toàn mock data** | Dashboard admin hoàn chỉnh về UI nhưng không có dữ liệu thật | 🔴 P0 |

## 🟠 Thiếu sót quan trọng — chưa có UI

| # | Thiếu sót | Ảnh hưởng | Ưu tiên |
|---|-----------|----------|---------|
| 6 | **Chưa có citation export UI** | Không có nút BibTeX/RIS/APA ở bất kỳ đâu. BE cũng chưa có endpoint, nhưng FE cần chuẩn bị UI khi BE bổ sung | 🟠 P1 |
| 7 | **Chưa có keyword comparison view** | Không chọn được 2+ keyword để xem trên cùng biểu đồ. Đây là giá trị cốt lõi của "trend tracking" | 🟠 P1 |
| 8 | **Chưa có user-facing analytics page** | Nav "Analytics" đi thẳng đến trang admin. File `analytics.json` đã có nhưng chưa có trang analytics cho user | 🟠 P1 |
| 9 | **Chưa có "similar papers" / recommendations** | Không có discovery feed, không có "you might like", không có related papers sidebar | 🟠 P1 |
| 10 | **Chưa có paper detail page** | Kết quả tìm kiếm hiển thị card nhưng click vào không ra trang chi tiết (abstract, tất cả authors, citations, related papers). BE đã có `GET /api/v1/papers/{paperId}` sẵn | 🟠 P1 |

## 🟡 Nice-to-have

| # | Thiếu sót | Ưu tiên |
|---|-----------|---------|
| 11 | Chưa có sort dropdown trên kết quả tìm kiếm (sort by citations, date, relevance) | 🟡 P2 |
| 12 | Chưa có UI đổi password (BE đã có `PUT /api/users/me/password`) | 🟡 P2 |
| 13 | Chưa có reading history tracking trên UI | 🟡 P2 |
| 14 | Chưa có bulk actions (batch bookmark, batch export) | 🟡 P2 |
| 15 | Chuỗi notification hardcoded tiếng Anh ("Just now", "Mark all read") — chưa đưa vào i18n | 🟡 P2 |
| 16 | `react-dnd` + `react-dnd-html5-backend` đã cài nhưng không dùng | 🟡 P2 |
| 17 | Chưa có profile photo upload (avatar chỉ là initials) | 🟡 P2 |

---

# Lộ trình bổ sung

## Phase 1: Nối những thứ đã có sẵn (P0 — 2-3 tuần)

| # | Công việc | Bên | Công sức |
|---|-----------|-----|----------|
| 1 | **Kết nối Bookmarks FE ↔ BE API** — thay sessionStorage bằng API calls | FE | 1-2 ngày |
| 2 | **Kết nối Reports FE ↔ BE API** — thay `setTimeout()` bằng API thật | FE | 1-2 ngày |
| 3 | **Kết nối Dashboard/Overview FE ↔ BE API** — thay mock data bằng `UserOverviewService` | FE | 2-3 ngày |
| 4 | **Kết nối Admin Overview FE ↔ BE API** — thay mock data bằng API thật | FE | 1-2 ngày |
| 5 | **Mở khóa Advanced Filters** cho researcher — gỡ bỏ "Premium" overlay | FE | 1 ngày |
| 6 | **Thêm Paper Detail page** — trang xem chi tiết paper khi click vào card | FE | 2-3 ngày |
| 7 | **Cấu hình email (SMTP)** cho password reset & email verification | BE | 1-2 ngày |

## Phase 2: Tính năng cốt lõi cho researcher (P1 — 3-4 tuần)

| # | Công việc | Bên | Công sức |
|---|-----------|-----|----------|
| 8 | **Citation export** — endpoint BibTeX, RIS, APA + nút export trên UI | BE + FE | 3-4 ngày |
| 9 | **Keyword comparison chart** — chọn nhiều keyword, hiển thị trên cùng biểu đồ | BE + FE | 3-4 ngày |
| 10 | **User-facing Analytics page** — trang phân tích riêng cho researcher | FE | 2-3 ngày |
| 11 | **AI paper summarization** — dùng Gemini tóm tắt abstract, trích xuất key findings | BE | 3-5 ngày |
| 12 | **"Similar papers" endpoint** — gợi ý paper tương tự dựa trên Neo4j graph | BE + FE | 3-4 ngày |
| 13 | **User-controlled sorting** trên kết quả tìm kiếm | BE + FE | 1-2 ngày |
| 14 | **Thêm notification types** — trending topic surge, citation milestone | BE | 2-3 ngày |

## Phase 3: Tính năng tạo khác biệt (P2 — 4-6 tuần)

| # | Công việc | Bên | Công sức |
|---|-----------|-----|----------|
| 15 | **Personalized recommendations** — gợi ý dựa trên bookmark, search history, follows | BE + FE | 5-7 ngày |
| 16 | **Research gap detection** — dùng Neo4j query tìm khu vực ít paper | BE + FE | 4-5 ngày |
| 17 | **WebSocket/SSE** cho real-time notifications | BE + FE | 3-4 ngày |
| 18 | **Journal matching** — gợi ý venue phù hợp để submit paper | BE | 3-4 ngày |
| 19 | **Bulk operations** — batch bookmark, batch export | BE + FE | 2-3 ngày |
| 20 | **Refresh token mechanism** | BE | 2-3 ngày |
| 21 | **API Monitoring page** — kết nối dữ liệu thật (Prometheus/Actuator) | BE + FE | 3-4 ngày |
| 22 | **Settings pages** — Appearance, Privacy, Notification preferences | FE | 2-3 ngày |

---

# Tổng kết

| | Backend | Frontend |
|---|---------|----------|
| **Đã hoàn thiện** | ~80% trong 12 yêu cầu | ~60% trong 12 yêu cầu |
| **BE có API, FE chưa kết nối** | — | 5 tính năng lớn (bookmarks, reports, dashboard, advanced filters, admin overview) |
| **Cả 2 bên đều thiếu** | Citation export, AI summarization, keyword comparison, personalized recommendations, paper detail page | Tương tự + chưa có sort, chưa có analytics page |
| **Thắng nhanh nhất** | Nối FE UI có sẵn với BE API có sẵn (Phase 1) — hệ thống đạt ~90% của 12 yêu cầu gốc | |
