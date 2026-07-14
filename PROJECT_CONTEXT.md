# SCITRACK — Project Context Document
> **Mục đích:** Tài liệu này tổng hợp toàn bộ ngữ cảnh dự án SCITRACK để bạn có thể mang đi prompt ở bất kỳ AI nào (ChatGPT, Gemini, Claude, v.v.) nhằm tìm ý tưởng cải tiến, tính năng mới, hoặc giải pháp kỹ thuật.

---

## 1. TỔNG QUAN DỰ ÁN

**SCITRACK** — AI-Powered Academic Research Analytics. Một ứng dụng full-stack giúp các nhà nghiên cứu tìm kiếm, phân tích, và trực quan hóa các bài báo học thuật với đồ thị từ khóa (keyword-graph exploration).

**Hai dự án con:**
- **Backend:** Spring Boot 3.5.14, Java 21, Maven (`Journal-Trend-Tracking-BE/`)
- **Frontend:** React 18, Vite 6, Tailwind CSS v4 (`Journal-Trend-Tracking-FE/`)

**Mục tiêu cốt lõi:** Giúp nhà nghiên cứu (researcher) và người dùng học thuật (academic user) có thể:
- Tìm kiếm bài báo khoa học theo từ khóa, tác giả, tạp chí
- Phân tích xu hướng nghiên cứu qua biểu đồ
- Khám phá mạng lưới từ khóa-paper dạng đồ thị (graph visualization)
- Bookmark bài báo yêu thích, theo dõi tác giả/tạp chí
- Tạo báo cáo phân tích (trend, author impact, journal quality)
- Admin quản lý người dùng, đồng bộ dữ liệu từ API bên ngoài, giám sát hệ thống

---

## 2. TECH STACK (FRONTEND)

| Loại | Công nghệ | Version |
|------|-----------|---------|
| Framework | React | 18.3.1 |
| Build tool | Vite | 6.3.5 |
| Styling | Tailwind CSS | 4.1.12 |
| Router | React Router DOM | 7.16.0 |
| State management | Zustand | 5.0.14 |
| HTTP client | Axios | 1.16.1 |
| UI primitives | Radix UI | 50+ components |
| Icons | Lucide React | 0.487.0 |
| Charts | Recharts | 2.15.2 |
| Graph vis | vis-network + vis-data | 10.1.0 / 8.0.4 |
| Animation | Motion (Framer Motion) | 12.23.24 |
| Forms | React Hook Form | 7.55.0 |
| i18n | react-i18next + i18next | 26.3.1 |
| Auth (Google) | @react-oauth/google | 0.13.5 |
| Material UI (secondary) | MUI v7 | 7.3.5 |
| Toast | Sonner | 2.0.3 |
| Drag & Drop | react-dnd | 16.0.1 |
| Carousel | Embla Carousel React | 8.6.0 |
| Confetti | canvas-confetti | 1.9.4 |
| Theme | next-themes | 0.4.6 |

**Chỉ có 1 biến môi trường:** `VITE_API_URL` (mặc định `http://localhost:8080`)

---

## 3. KIẾN TRÚC THƯ MỤC (FRONTEND)

```
src/
├── main.jsx                        # Entry point: GoogleOAuthProvider + RouterProvider + Toaster
├── app/
│   ├── router.jsx                  # ĐỊNH NGHĨA TOÀN BỘ ROUTES (React Router v7, lazy loading)
│   └── providers/
│       └── RouterProvider.jsx      # Wrapper cho router
├── features/                       # TỔ CHỨC THEO FEATURE (mỗi feature có page + api riêng)
│   ├── auth/                       # AuthPage, LoginPage, RegisterPage, ResetPasswordPage, AuthLayout, api.js
│   ├── landing/                    # LandingPage, FeaturedSlider
│   ├── overview/                   # OverviewController, UserOverviewPage, AdminOverviewPage, api.js, HealthCheckToast
│   ├── search/                     # SearchPapers, SearchJournal, SearchAuthor, PaperDetailPage
│   │                               # + Neo4jGraphCard, AuthorSuggestions, WeeklyBreakout, SimilarPapers
│   │                               # + CitationExport, PaperDetailDialog
│   │                               # + paper.api.js, journal.api.js, author.api.js, trend.api.js, graph.api.js
│   ├── bookmarks/                  # BookmarksView, BulkActionBar, CollectionsPanel, api.js, collectionsApi.js
│   ├── follows/                    # FollowsView, FollowCard, FollowDialog, FollowCardSkeleton, api.js
│   ├── history/                    # ReadingHistoryPage
│   ├── notifications/              # NotificationsPage, NotificationBell, api.js
│   ├── reports/                    # ReportsViewPage, GeneratorCard, ReportHistoryTable
│   │                               # + KeywordTrendResult, AuthorImpactResult, JournalQualityResult
│   │                               # + api.js, config.js
│   ├── settings/                   # SettingsPage, AppearanceSettings, NotificationSettings, ChangePasswordForm
│   ├── analytics/                  # AnalyticsPage, api.js (Admin Analytics)
│   ├── admin/                      # UserManagementPage, DatabaseViewPage, SyncDataPage, AdminConfigPage
│   │                               # + AdminOverviewPage, AdminAuditLogPage, PdfRequestsPage
│   │                               # + AnalyticsView, SyncFloatingPanel, api.js, userStore.js
│   └── user/                       # store.js (useAuthStore - Zustand persist), api.js, schema.js, AcademicLimitAlert
├── components/
│   ├── ui/                         # 50+ shadcn/ui-style components (Radix + Tailwind)
│   │                               # button, card, dialog, dropdown-menu, form, input, select,
│   │                               # table, tabs, tooltip, sidebar, chart, calendar, carousel, ...
│   │   ├── utils.js                # cn() utility (clsx + tailwind-merge)
│   │   └── use-mobile.js
│   ├── common/                     # LanguageSwitcher, SupportDialog
│   ├── figma/                      # ImageWithFallback (Figma asset bridge)
│   ├── prisma/                     # Animation components: AnimatedLetter, ScitrackSLogo, WordsPullUp, WordsPullUpMultiStyle
│   ├── KeepAlive.jsx               # Session keep-alive component
│   ├── SearchWithHistory.jsx       # Search bar with history
│   └── SharedUI.jsx                # Reusable atoms: GlowBadge, StatusPill, StatCard, SectionBadge
├── shared/
│   └── layouts/
│       └── MainLayout.jsx          # DashboardLayout: sidebar + topbar + <Outlet/>
├── lib/
│   ├── apiClient.js                # Axios instance + auth interceptor (Bearer token) + language header
│   └── api/                        # health.api.js, ai.api.js
├── store/
│   └── useSyncStore.js             # Bulk sync state management (tasks, progress polling)
├── hooks/                          # useLocalization.js, useTheme.js, useGraphSearch.js, useStaleWhileRevalidate.js
├── utils/                          # localization.js, citationGenerators.js
├── constants/
│   └── mockData.js                 # Mock data + test accounts
├── i18n/
│   ├── index.js                    # i18next config: 2 languages (en, vi), 12 namespaces
│   └── locales/{en,vi}/            # 12 namespaces: common, auth, dashboard, reports, analytics,
│                                   #   search, settings, graph, landing, follow, support, admin
├── styles/
│   └── index.css                   # Tailwind v4 + theme variables
├── pages/                          # HomePage.jsx, NotFoundPage.jsx (legacy wrapper pages)
└── services/                       # auth.services.js (legacy)
```

---

## 4. HỆ THỐNG ROUTES

### Public Routes (không cần đăng nhập)
| Path | Component | Mô tả |
|------|-----------|-------|
| `/` | LandingPage | Landing page giới thiệu sản phẩm |
| `/login` | LoginPage | Full-screen split layout đăng nhập |
| `/auth` | AuthPage | Auth page với left panel tĩnh |
| `/register` | RegisterPage | Đăng ký tài khoản |
| `/reset-password` | ResetPasswordPage | Quên mật khẩu |

### Dashboard Routes (cần đăng nhập) — `/`{roleName}`/`{page}
| Path | Allowed Roles | Component |
|------|--------------|-----------|
| `/:roleName/overview` | Tất cả | OverviewController → UserOverviewPage / AdminOverviewPage |
| `/:roleName/search` | researcher, academic_user | SearchPapers |
| `/:roleName/journal-search` | researcher, academic_user | SearchJournal |
| `/:roleName/search-author` | researcher, academic_user | SearchAuthor |
| `/:roleName/papers/:paperId` | researcher, academic_user | PaperDetailPage |
| `/:roleName/bookmarks` | researcher, academic_user | BookmarksView |
| `/:roleName/follows` | researcher, academic_user | FollowsView |
| `/:roleName/notifications` | researcher, academic_user | NotificationsPage |
| `/:roleName/reading-history` | researcher, academic_user | ReadingHistoryPage |
| `/:roleName/reports` | researcher, academic_user | ReportsView |
| `/:roleName/settings` | Tất cả | SettingsPage |
| `/:roleName/users` | admin | UserManagementPage |
| `/:roleName/database` | admin | DatabaseViewPage |
| `/:roleName/sync-data` | admin | SyncDataPage |
| `/:roleName/audit-logs` | admin | AdminAuditLogPage |
| `/:roleName/configs` | admin | AdminConfigPage |
| `/:roleName/pdf-requests` | admin | PdfRequestsPage |
| `*` | — | NotFoundPage (404) |

---

## 5. LUỒNG AUTH (END-TO-END)

```
FE LoginPage → authAPI.login(email, password)
  → BE AuthController → AuthService → JwtTokenProvider.generate()
  → Response: { accessToken, role }
  → useAuthStore (Zustand persist → localStorage "Journal-Tracking-System")
  → sessionStorage.setItem('userRole', role)
  → Navigate to /{role}/overview
  → axiosClient interceptor: đọc useAuthStore.getState().accessToken
  → Gắn Authorization: Bearer <token> vào mọi request
  → Gắn Accept-Language từ localStorage('preferredLanguage')
```

**Google OAuth:** Sử dụng `@react-oauth/google` với `VITE_GOOGLE_CLIENT_ID`.

---

## 6. PHÂN QUYỀN (3 ROLES)

| Role | sessionStorage value | Quyền hạn |
|------|---------------------|-----------|
| ADMIN | `admin` | Quản lý users, trigger sync, xem database stats, audit logs, cấu hình hệ thống, PDF requests |
| RESEARCHER | `researcher` | Search không giới hạn, analytics, bookmarks, reports, follows, notifications, đọc history |
| ACADEMIC_USER | `academic_user` | Search có giới hạn hàng tháng, bookmarks, reports (không analytics), follows |

---

## 7. CÁC TRANG CHÍNH & CHỨC NĂNG HIỆN TẠI

### 7.1 Landing Page (`/`)
- Hero section giới thiệu SCITRACK
- Featured papers slider
- Animation components (WordsPullUp, ScitrackSLogo)

### 7.2 Auth (Login, Register, Reset Password)
- Login: full-screen split layout (form bên trái, branding bên phải)
- Register: multi-step form
- Reset password: email-based flow
- Google OAuth button

### 7.3 Search Papers (`/:role/search`)
- **Input:** thanh tìm kiếm với history (SearchWithHistory)
- **Kết quả:** danh sách papers dạng card
- Neo4jGraphCard: hiển thị đồ thị keyword-paper network
- AuthorSuggestions: gợi ý tác giả liên quan
- WeeklyBreakout: papers nổi bật trong tuần
- SimilarPapers: papers tương tự
- CitationExport: xuất citation (BibTeX, RIS, APA, MLA)
- PaperDetailDialog: xem chi tiết paper trong dialog
- SearchJournal / SearchAuthor: tương tự nhưng filter theo journal/author

### 7.4 Bookmarks (`/:role/bookmarks`)
- Danh sách papers đã bookmark
- BulkActionBar: thao tác hàng loạt (xóa, export)
- CollectionsPanel: tổ chức bookmark theo bộ sưu tập

### 7.5 Follows (`/:role/follows`)
- Danh sách tác giả/tạp chí đang theo dõi
- FollowCard + FollowDialog: thêm/sửa/xóa follow

### 7.6 Reports (`/:role/reports`)
- GeneratorCard: tạo báo cáo mới
- 3 loại báo cáo: Keyword Trend, Author Impact, Journal Quality
- ReportHistoryTable: lịch sử báo cáo đã tạo

### 7.7 Settings (`/:role/settings`)
- AppearanceSettings: theme, font size, layout density
- NotificationSettings: cấu hình thông báo
- ChangePasswordForm: đổi mật khẩu
- LanguageSwitcher: EN ↔ VI

### 7.8 Reading History (`/:role/reading-history`)
- Lịch sử papers đã đọc
- Timeline view

### 7.9 Notifications (`/:role/notifications`)
- NotificationBell (real-time indicator)
- Danh sách thông báo (paper mới từ author đang follow, etc.)

### 7.10 Overview (Dashboard)
- **UserOverview:** thống kê cá nhân, hot keywords, recent activity
- **AdminOverview:** system stats, user stats, sync status

### 7.11 Admin Pages
- **UserManagement:** CRUD users, role upgrade (academic → researcher)
- **DatabaseView:** SQL Server + Neo4j stats
- **SyncData:** Manual sync trigger (OpenAlex, Semantic Scholar, arXiv, CORE), bulk sync với progress bar
- **AdminConfig:** System configuration
- **AuditLogs:** Audit trail
- **PdfRequests:** Duyệt yêu cầu PDF
- **AnalyticsView:** Admin-level analytics dashboard

---

## 8. BACKEND TÍCH HỢP (Tóm tắt)

### Kiến trúc dual-database:
| Database | Dùng cho |
|----------|----------|
| SQL Server (JPA) | Users, papers, authors, journals, bookmarks, follows, sync logs, usage tracking |
| Neo4j (Graph - AuraDB cloud) | Paper nodes, Keyword nodes, HAS_KEYWORD relationships → graph search + visualization |

### Data Flow: Search Pipeline
```
User gõ keyword → FE axiosClient → BE PaperSearchOrchestrator
  ├── 1. Neo4j cache hit: query (p:Paper)-[:HAS_KEYWORD]->(k:Keyword)
  │     → lấy paper IDs → fetch full data từ SQL Server → trả kết quả
  ├── 2. Neo4j miss / stale IDs: fallback OpenAlex API → async sync
  └── 3. Neo4j IDs not found in SQL: delete stale Neo4j nodes → fallback OpenAlex
```

### External APIs:
- **OpenAlex** (`api.openalex.org`): nguồn dữ liệu paper chính
- **Semantic Scholar** (`api.semanticscholar.org`): nguồn phụ, DOI-deduplicated
- **Gemini** (`generativelanguage.googleapis.com`): AI features
- **CORE API**: paper full-text access
- **arXiv**: preprint papers

### Data Sync:
- Manual sync: admin trigger qua UI
- Scheduled: cron job 2 AM hàng ngày
- Bulk sync: theo keywords, có progress tracking (polling mỗi 2.5s)
- Sync sources: OpenAlex, Semantic Scholar, arXiv, CORE

---

## 9. THEME & DESIGN SYSTEM

**Dark-only theme.** CSS custom properties:
- `--background: #0B1020` (deep navy)
- `--card: #1B2235`
- `--primary: #4F8CFF` (blue)
- `--accent: #00D1B2` (teal)
- Fonts: Outfit (headings), Inter (body), JetBrains Mono (data/monospace)

**UI Components:** 50+ shadcn/ui-style components dùng Radix UI primitives wrapped với Tailwind classes. Tất cả đều nằm trong `src/components/ui/`.

**Animation:** Framer Motion (`motion/react`) dùng xuyên suốt các trang. Các component animation tùy chỉnh: AnimatedLetter, WordsPullUp, WordsPullUpMultiStyle.

---

## 10. i18n (ĐA NGÔN NGỮ)

- **2 ngôn ngữ:** English (en) + Vietnamese (vi)
- **12 namespaces:** common, auth, dashboard, reports, analytics, search, settings, graph, landing, follow, support, admin
- Detection: localStorage → navigator → htmlTag
- Axios gửi `Accept-Language` header dựa trên `localStorage('preferredLanguage')`

---

## 11. STATE MANAGEMENT

| Store | File | Mục đích |
|-------|------|----------|
| `useAuthStore` | `features/user/store.js` | Auth tokens, user info (Zustand + persist localStorage) |
| `useSyncStore` | `store/useSyncStore.js` | Bulk sync tasks + progress polling |
| (local) | `features/admin/userStore.js` | Admin user management state |

---

## 12. CÁC ĐIỂM CÓ THỂ CẢI TIẾN / MỞ RỘNG

Đây là những gợi ý để bạn hỏi AI khác:

1. **Tính năng mới:** Đề xuất tính năng giúp researcher làm việc hiệu quả hơn (collaboration, annotation, recommendation AI, v.v.)
2. **UX/UI:** Cải thiện trải nghiệm người dùng, dark theme, responsive mobile
3. **Performance:** Tối ưu loading, caching strategy, bundle size
4. **AI Integration:** Tận dụng Gemini API để làm gì thêm? (summarize paper, suggest related papers, chatbot hỏi đáp về paper)
5. **Graph Visualization:** Cải thiện Neo4j graph visualization (hiện dùng vis-network)
6. **Reports:** Thêm loại báo cáo mới, export format mới (PDF, PowerPoint)
7. **Social features:** Chia sẻ paper, thảo luận, comment
8. **Search nâng cao:** Semantic search, vector search, advanced filters
9. **Mobile app:** PWA hay React Native?
10. **Testing:** Hiện chưa có test runner — nên thêm Vitest + React Testing Library

---

## 13. CÂU HỎI MẪU ĐỂ PROMPT AI KHÁC

Dưới đây là một số prompt mẫu bạn có thể dùng:

> *"Tôi có một ứng dụng React phân tích bài báo học thuật tên SCITRACK. Tech stack: React 18, Vite 6, Tailwind v4, Zustand, React Router v7, Recharts, vis-network. Đây là context đầy đủ về dự án [paste toàn bộ tài liệu này]. Hãy đề xuất 5 tính năng mới giúp tăng trải nghiệm nhà nghiên cứu."*

> *"Dựa trên context dự án SCITRACK, hãy đề xuất cách cải thiện hiệu suất frontend — đặc biệt là lazy loading, code splitting, và caching strategy."*

> *"Với dự án SCITRACK, tôi muốn thêm tính năng AI-powered paper summarization. Hãy đề xuất kiến trúc FE + BE và UX flow."*

> *"Tôi muốn cải thiện mobile responsiveness cho SCITRACK. Với Tailwind v4 và layout hiện tại, hãy đề xuất strategy responsive design."*

---

*Tài liệu được tạo ngày 2026-07-13. Cập nhật khi có thay đổi lớn về kiến trúc.*
