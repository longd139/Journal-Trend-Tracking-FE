# Kế hoạch hoàn thiện tính năng Reports

> **Yêu cầu:** "Generate simple analytical reports"
> **Ngày:** 10/07/2026
> **Phương án được chọn:** Hướng A — Export Center + Persistence

---

## 1. Hiện trạng

### Đã có (Working)

| Lớp | Đã làm được |
|-----|------------|
| **BE - ReportController** | 3 endpoint generate report: `/api/public/reports/keyword-trend`, `/author-impact`, `/journal-quality` |
| **BE - ReportServiceImpl** | Generate dữ liệu từ Neo4j + SQL Server + OpenAlex, có insight text tiếng Việt, có cache |
| **BE - Entity + Repository** | Bảng `REPORT` và `ReportRepository` đã được định nghĩa nhưng chưa dùng |
| **FE - ReportsViewPage** | Giao diện 3 card input (Keyword, Author, Journal), gọi API, hiển thị kết quả |
| **FE - API module** | `reports/api.js` kết nối đúng 3 endpoint |

### Còn thiếu (Gaps)

| # | Vấn đề | Mức độ |
|---|--------|--------|
| 1 | **FE hiển thị raw JSON** trong `<pre>` block — không có chart, stat card, insight format | 🔴 Nghiêm trọng |
| 2 | **Chưa có Export PDF/CSV** — người dùng chỉ download được file .json | 🔴 Nghiêm trọng |
| 3 | **Report không được lưu vào DB** — entity `Report` + `ReportRepository` có sẵn nhưng không được dùng | 🟡 Trung bình |
| 4 | **History là ephemeral** — lưu trong React state, mất khi refresh trang | 🟡 Trung bình |
| 5 | **Không có custom date range** — `periodStart`/`periodEnd` bị hardcode trong service | 🟢 Thấp |
| 6 | **BE endpoint là public** nhưng FE route bắt auth — không đồng nhất | 🟢 Thấp |

---

## 2. Phân tích trùng lặp với Search/Analytics

Reports hiện tại **trùng ~80-90% dữ liệu** với Search và Analytics. Bảng dưới đây chỉ ra chính xác field nào trùng, field nào là duy nhất:

### Keyword Trend Report vs Search

| Field trong Report | Đã có ở đâu | Trùng? |
|-------------------|-------------|:------:|
| `keyword` | KeywordQuickStats title | Trùng |
| `totalPapers` | KeywordQuickStats card 1 | Trùng |
| `yoyGrowthRate` | KeywordQuickStats card 3 | Trùng |
| `status` ("Đang bùng nổ"/"Ổn định"/"Bão hòa") | KeywordQuickStats `yoyGrowthDirection` | Gần trùng |
| `topRelatedKeywords` | RelatedTrends (trả về nhiều hơn: top 10) | Trùng |
| `yearlyBreakdown` | Analytics chart (nhưng là user-scoped) | Khác scope |
| **`insight`** (đoạn văn phân tích) | **Không có ở đâu** | **DUY NHẤT** |

### Author Impact Report vs Search

| Field trong Report | Đã có ở đâu | Trùng? |
|-------------------|-------------|:------:|
| `authorName`, `affiliation` | AuthorQuickStats header | Trùng |
| `hIndex`, `totalPapers` | AuthorQuickStats cards | Trùng |
| `status` ("Đang sung sức"/"Đã dừng") | AuthorTimeline (hiển thị ngầm) | Gần trùng |
| `topField` | AuthorResearchFocus (trả về tất cả field) | Trùng |
| `topCollaborators` | AuthorCoAuthors (trả về nhiều hơn) | Trùng |
| **`insight`** (đoạn văn phân tích) | **Không có ở đâu** | **DUY NHẤT** |

### Journal Quality Report vs Search

| Field trong Report | Đã có ở đâu | Trùng? |
|-------------------|-------------|:------:|
| `journalName`, `issn`, `publisher` | JournalHeader | Trùng |
| `quartile`, `impactFactor` | JournalHeader (có badge màu) | Trùng |
| `totalPapers`, `totalCitations` | JournalQuickStats cards | Trùng |
| `topKeywords` | JournalTopKeywords pills | Trùng |
| `taste` ("định hướng biên tập") | JournalTopKeywords (dạng pill) | Gần trùng |
| **`insight`** (đoạn văn + lời khuyên submit) | **Không có ở đâu** | **DUY NHẤT** |

### Insight text hiện tại là gì?

- **Không dùng AI/LLM** — là template tiếng Việt cứng dựa trên ngưỡng số
- VD Keyword Trend: growth > 20% → `"Chủ đề X đang bùng nổ với mức tăng trưởng Y%. Đây là lĩnh vực nghiên cứu nóng..."`
- VD Journal Quality: Q1 → `"Đây là tạp chí hàng đầu, tỉ lệ chấp nhận thường thấp, đòi hỏi chất lượng nghiên cứu xuất sắc."`

---

## 3. Phương án được chọn: Hướng A — Export Center + Persistence

### Lý do chọn

| Tiêu chí từ yêu cầu | Hướng A | Hướng B (AI) | Hướng C (New data) |
|---------------------|:---:|:---:|:---:|
| **Generate** — có output file | ✅ PDF/CSV | ✅ Text AI | ❌ Vẫn online |
| **Simple** — đơn giản | ✅ html2pdf | ❌ Cần tích hợp Gemini | ❌ Cần query mới |
| **Analytical** — có phân tích | ✅ Insight text sẵn | ✅ AI insight | ✅ Chỉ số mới |
| **Reports** — lưu, chia sẻ | ✅ Lưu DB + download | ❌ Thiếu persistence | ❌ Thiếu persistence |
| **Tận dụng code hiện có** | ✅ Giữ nguyên BE | ⚠️ Phải sửa nhiều | ❌ Viết lại nhiều |

**Kết luận:** Search là để **khám phá** dữ liệu. Reports là để **đóng gói và mang đi** — xuất PDF, lưu lại, chia sẻ. Đây mới là giá trị thực sự của tính năng Reports.

---

## 4. Kế hoạch triển khai chi tiết

### Bước 1: FE — Formatted result UI (1-2 ngày)

**Mục tiêu:** Thay raw JSON `<pre>` block bằng giao diện trực quan.

**Cần làm:**

#### 1a. KeywordTrendResult component
```
┌──────────────────────────────────────────────┐
│  📊 Báo cáo xu hướng từ khóa                  │
│                                              │
│  "Artificial Intelligence"                   │
│  ┌──────────┐                                │
│  │ ĐANG BÙNG NỔ │  (+35.2% YoY)              │
│  └──────────┘                                │
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 12,450   │ │  +35.2%  │ │  4,200   │      │
│  │ Papers   │ │  Growth  │ │Citations │      │
│  └──────────┘ └──────────┘ └──────────┘      │
│                                              │
│  📈 Xu hướng theo năm (Recharts BarChart)     │
│  ▁▃▅▆▇█  (2020: 1.2K → 2024: 4.5K)         │
│                                              │
│  🔗 Chủ đề liên quan: ML, NLP, Computer Vision│
│                                              │
│  💬 Insight:                                 │
│  "Chủ đề AI đang bùng nổ với mức tăng trưởng  │
│   35.2%. Đây là lĩnh vực nghiên cứu nóng..."  │
│                                              │
│  [📥 Export PDF]  [📥 Export CSV]  [💾 Save] │
└──────────────────────────────────────────────┘
```

**Dependencies:**
- Recharts `BarChart` cho yearly breakdown (đã có sẵn trong dự án)
- `StatCard` từ `SharedUI.jsx` (đã có)
- `GlowBadge` / `StatusPill` từ `SharedUI.jsx` (đã có)

#### 1b. AuthorImpactResult component
```
┌──────────────────────────────────────────────┐
│  👤 Báo cáo tác động tác giả                   │
│                                              │
│  "Andrew Ng" — Stanford University           │
│  ┌──────────────┐                            │
│  │ ĐANG SUNG SỨC │  (còn hoạt động nghiên cứu) │
│  └──────────────┘                            │
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  h-index │ │  250+    │ │  ML/AI   │      │
│  │    132   │ │  Papers  │ │Top Field │      │
│  └──────────┘ └──────────┘ └──────────┘      │
│                                              │
│  🤝 Top cộng sự:                             │
│  • Yann LeCun (45 papers)                    │
│  • Geoffrey Hinton (38 papers)               │
│  • Fei-Fei Li (30 papers)                    │
│                                              │
│  💬 Insight: "Tác giả có chỉ số h-index...    │
│     Lĩnh vực nghiên cứu chính là ML/AI..."    │
│                                              │
│  [📥 Export PDF]  [📥 Export CSV]  [💾 Save] │
└──────────────────────────────────────────────┘
```

#### 1c. JournalQualityResult component
```
┌──────────────────────────────────────────────┐
│  📰 Báo cáo chất lượng tạp chí                 │
│                                              │
│  "Nature" — Nature Publishing Group          │
│  ISSN: 0028-0836                             │
│                                              │
│  ┌──────┐  ┌──────────────┐                  │
│  │  Q1  │  │  IF: 64.8    │                  │
│  └──────┘  └──────────────┘                  │
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  50,000+ │ │ 2.1M+    │ │  64.8    │      │
│  │  Papers  │ │Citations │ │  IF      │      │
│  └──────────┘ └──────────┘ └──────────┘      │
│                                              │
│  🏷️ Định hướng biên tập:                     │
│  "Genomics, CRISPR, Protein Folding..."      │
│                                              │
│  💬 Insight: "Đây là tạp chí hàng đầu...      │
│     Tỉ lệ chấp nhận thấp, đòi hỏi..."         │
│                                              │
│  [📥 Export PDF]  [📥 Export CSV]  [💾 Save] │
└──────────────────────────────────────────────┘
```

### Bước 2: FE + BE — Lưu report vào database (1 ngày)

**BE:**
- `POST /api/v1/reports` — lưu report vào bảng `REPORT` (entity + repository đã có sẵn)
- `GET /api/v1/reports` — danh sách report của user (phân trang)
- `GET /api/v1/reports/{id}` — chi tiết + download file nếu có
- `DELETE /api/v1/reports/{id}` — xóa report

**Cần thêm vào ReportRepository:**
```java
List<Report> findByUser_UserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
long countByUser_UserId(UUID userId);
```

**FE:**
- Gọi API để lưu report sau khi generate
- History table load từ BE, không mất khi refresh
- Thêm cột: Report Name, Type, Date Generated, Status, Actions (View/Download/Delete)

### Bước 3: FE — Export PDF/CSV (nửa ngày)

**Cài đặt:**
```bash
npm install html2pdf.js
```

**Cách làm:**
- Ref component chứa formatted result (từ Bước 1)
- `html2pdf()` chụp toàn bộ ref → tải xuống file `.pdf`
- CSV export: parse JSON kết quả → tạo Blob CSV → tải xuống
- Không cần BE thay đổi gì

### Bước 4: Tích hợp "Generate Report" từ Search (nửa ngày)

Thêm nút "📊 Generate Report" ở 3 vị trí:
- **KeywordQuickStats** (sau khi search keyword)
- **SearchAuthor** (trang kết quả tác giả)
- **SearchJournal** (trang kết quả tạp chí)

Người dùng click → chuyển sang trang Reports với input đã được điền sẵn, tự động generate.

---

## 5. Tổng quan thời gian

| Bước | Mô tả | Thời gian | Độ ưu tiên |
|------|-------|-----------|:----------:|
| 1 | Formatted result UI (3 component) | 1-2 ngày | 🔴 Cao nhất |
| 2 | Lưu report vào DB (BE + FE) | 1 ngày | 🟡 Trung bình |
| 3 | Export PDF/CSV (FE only) | 0.5 ngày | 🟡 Trung bình |
| 4 | Tích hợp nút từ Search | 0.5 ngày | 🟢 Thấp |
| **Tổng** | | **3-4 ngày** | |

---

## 6. Tech stack sử dụng

| Thành phần | Công nghệ | Đã có trong dự án? |
|-----------|----------|:---:|
| Charts | Recharts (`BarChart`, `ResponsiveContainer`) | ✅ |
| UI components | `StatCard`, `GlowBadge`, `StatusPill` từ `SharedUI.jsx` | ✅ |
| Animation | Framer Motion (`motion/react`) | ✅ |
| PDF export | `html2pdf.js` | ❌ Cần cài |
| CSV export | Client-side Blob (không cần thư viện) | ✅ |
| BE API | Spring Boot REST + JPA | ✅ |
| DB storage | SQL Server — bảng `REPORT` | ✅ |
