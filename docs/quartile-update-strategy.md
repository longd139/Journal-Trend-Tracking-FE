# Vấn đề cập nhật tứ phân vị (Quartile) khi bài báo bị gỡ

## 1. Kiến trúc hiện tại

Hiện tại, dữ liệu tứ phân vị (Q1, Q2, Q3, Q4) được nạp vào hệ thống theo **luồng thủ công**:

```
Admin tải scimagojr.csv từ SCImago
       ↓
Upload lên admin UI (Sync Data Page)
       ↓
POST /api/admin/sync/enrich-journals/upload
       ↓
Backend matching theo ISSN + Tên tạp chí
       ↓
Cập nhật cột Quartile trong database
       ↓
API trả về cho FE: journal suggest, quick-stats, advanced filter, reports
```

### Các điểm chạm quartile trong FE:
| Component | File | Vai trò |
|-----------|------|---------|
| SyncDataPage.jsx | `src/features/admin/SyncDataPage.jsx` | Upload SCImago CSV (admin) |
| admin/api.js | `src/features/admin/api.js` | Gọi API upload |
| SearchJournal.jsx | `src/features/search/SearchJournal.jsx` | Hiển thị badge Q1-Q4 + enrichment fallback |
| KeywordQuickStats.jsx | `src/features/search/KeywordQuickStats.jsx` | Badge quartile trên biểu đồ journal |
| AdvancedFilter.jsx | `src/features/search/AdvancedFilter.jsx` | Filter tìm kiếm theo quartile |
| JournalQualityResult.jsx | `src/features/reports/components/JournalQualityResult.jsx` | Báo cáo chất lượng journal |
| journal.api.js | `src/features/search/journal.api.js` | API suggest + search journal |
| paper.api.js | `src/features/search/paper.api.js` | API quick-stats + advanced filter |

---

## 2. Vấn đề

Khi một bài báo (paper) bị tác giả hoặc nhà xuất bản gỡ xuống (retraction / removal), hệ thống hiện tại **không có cơ chế nào để phản ứng**:

1. **Quartile là thuộc tính của journal (tạp chí), không phải của từng paper** — nên khi một paper bị gỡ, quartile của journal đó vẫn giữ nguyên.
2. **Dữ liệu SCImago chỉ được nạp một lần** — không có lịch refresh định kỳ.
3. **Không có cơ chế phát hiện paper bị retract** — nếu paper bị gỡ khỏi SCImago, dữ liệu trong hệ thống không tự biết để cập nhật.
4. **Không có journal CRUD** — admin không thể sửa thủ công quartile của từng journal nếu phát hiện sai lệch.
5. **Dữ liệu có thể lỗi thời** — SCImago cập nhật ranking hàng năm, hệ thống chỉ có dữ liệu tại thời điểm upload cuối cùng.

---

## 3. Giải pháp đề xuất

### 3.1. Giải pháp ngắn hạn: Upload định kỳ + Theo dõi thay đổi

**Mô tả:** Admin upload SCImago CSV theo định kỳ (hàng tháng/quý). Backend so sánh dữ liệu cũ và mới, báo cáo diff.

**Backend cần thêm:**

```
POST /api/admin/sync/enrich-journals/upload?dryRun=true
→ Trả về diff: { added: 5, removed: 3, changed: 12, unchanged: 1500 }

POST /api/admin/sync/enrich-journals/confirm
→ Apply diff đã tính ở dry run
```

**FE cần thêm** (SyncDataPage.jsx):
- Nút "Preview Changes" trước khi apply
- Bảng diff hiển thị journal nào thay đổi quartile
- Lịch sử upload (audit log)

**Ưu điểm:** Đơn giản, ít thay đổi, vẫn giữ luồng thủ công.
**Nhược điểm:** Vẫn phụ thuộc vào admin nhớ upload.

---

### 3.2. Giải pháp trung hạn: Tự động hóa với scheduler

**Mô tả:** Backend tự động tải SCImago CSV theo lịch (ví dụ: hàng tháng).

**Cần triển khai:**
- Backend service tự động fetch `https://www.scimagojr.com/journalrank.php?out=csv`
- Schedule: cron job mỗi tháng / mỗi quý
- So sánh dữ liệu mới với dữ liệu hiện tại
- Ghi log thay đổi và gửi notification cho admin

**FE cần thêm:**
- Tab "Sync History" trong admin — xem lịch sử các lần tự động cập nhật
- Thông báo khi có thay đổi quartile đáng kể

**Ưu điểm:** Không phụ thuộc vào admin, luôn có dữ liệu mới nhất.
**Nhược điểm:** Cần triển khai backend service.

---

### 3.3. Xử lý paper bị retraction/removal

**Vấn đề riêng:** Một paper bị gỡ không làm thay đổi quartile của journal, nhưng ảnh hưởng đến **độ chính xác của kết quả tìm kiếm và thống kê**.

**Cần triển khai ở backend:**
1. **Theo dõi trạng thái retraction** — thêm cột `retracted` / `retraction_date` vào bảng papers
2. **API endpoint kiểm tra retraction** — tích hợp với RetractionWatch API hoặc CrossRef API:
   ```
   GET https://api.crossref.org/works/{doi}
   → Kiểm tra trường "update-to" / "retracted"
   ```
3. **Scheduler định kỳ kiểm tra** — quét danh sách papers, kiểm tra trạng thái retraction hàng tuần
4. **Loại trừ paper bị retract** — khỏi thống kê, tìm kiếm, báo cáo

**FE cần thêm:**
- Badge "Retracted" / "Đã gỡ" trên paper detail
- Filter: "Ẩn bài báo đã retract"
- Cảnh báo trong report nếu có paper/journal bị ảnh hưởng

**Luồng xử lý retraction:**
```
Scheduler (hàng tuần)
       ↓
Lấy danh sách papers cần kiểm tra
       ↓
Gọi CrossRef / RetractionWatch API
       ↓
Nếu phát hiện retracted → cập nhật trạng thái
       ↓
Nếu cần → chạy lại quá trình enrich quartile
       ↓
Gửi notification cho admin
```

---

### 3.4. Admin CRUD cho Journal (sửa quartile thủ công)

**Mô tả:** Thêm trang quản lý journal để admin có thể xem và sửa thông tin (bao gồm quartile) khi cần.

**Các API cần thêm (backend):**

```
GET    /api/v1/admin/journals?page=1&size=20&search=&quartile=
       → Danh sách journal kèm quartile, ISSN, publisher

PUT    /api/v1/admin/journals/{id}
       Body: { quartile: "Q1", impactFactor: 12.5 }
       → Cập nhật thủ công thông tin journal

POST   /api/v1/admin/journals/batch-update
       Body: [{ id: 1, quartile: "Q2" }, { id: 2, quartile: "Q1" }]
       → Batch update hàng loạt

GET    /api/v1/admin/journals/changelog
       → Lịch sử thay đổi quartile
```

**FE cần xây dựng:**
- Trang `JournalManagementPage.jsx` — datatable với search, filter, sort
- Modal edit journal — cho phép sửa quartile, impact factor
- Batch upload / bulk edit
- Audit log — ai đã thay đổi gì, khi nào
- Gắn trong admin navigation (`/admin/journals`)

**Ưu điểm:** Admin chủ động kiểm soát, xử lý được mọi trường hợp đặc biệt.
**Nhược điểm:** Tốn công xây dựng, vẫn là thao tác thủ công.

---

### 3.5. Tổng hợp: Kiến trúc đề xuất hoàn chỉnh

```
┌─────────────────────────────────────────────────────────┐
│                      SCHEDULER                          │
│  ┌─────────────────┐  ┌──────────────────────────────┐  │
│  │ Monthly: Fetch   │  │ Weekly: Check retraction     │  │
│  │ SCImago CSV      │  │ via CrossRef API             │  │
│  └────────┬────────┘  └─────────────┬────────────────┘  │
│           │                         │                   │
└───────────┼─────────────────────────┼───────────────────┘
            │                         │
            ▼                         ▼
┌─────────────────────────────────────────────────────────┐
│                     BACKEND                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Sync Engine                                       │   │
│  │  - So sánh diff quartile                         │   │
│  │  - Cập nhật database                             │   │
│  │  - Ghi audit log                                 │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Journals CRUD                                     │   │
│  │  - Admin override quartile                       │   │
│  │  - Batch update                                  │   │
│  │  - Search / Filter / Sort                        │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
            │                         │
            ▼                         ▼
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ SyncDataPage │  │ JournalMgmt  │  │ Search/Filter │  │
│  │ - Upload CSV │  │ - CRUD table │  │ - Ẩn retract │  │
│  │ - Dry run    │  │ - Edit modal │  │ - Badge mới  │  │
│  │ - Sync hist  │  │ - Audit log  │  │ - Cảnh báo   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Lộ trình triển khai đề xuất

| Phase | Nội dung | Mức độ ưu tiên |
|-------|----------|----------------|
| **Phase 1** | Preview diff trước khi upload SCImago + hiển thị lịch sử sync | Cao |
| **Phase 2** | Admin CRUD cho journals (sửa quartile thủ công) | Cao |
| **Phase 3** | Kiểm tra retraction paper qua CrossRef API + ẩn/đánh dấu | Trung bình |
| **Phase 4** | Tự động tải SCImago CSV theo lịch (scheduler) | Thấp |
| **Phase 5** | Notification cho admin khi có thay đổi lớn | Thấp |

---

## 5. Tác động đến các file hiện tại

| File | Thay đổi cần thiết |
|------|-------------------|
| `src/features/admin/SyncDataPage.jsx` | Thêm dry-run preview, sync history tab, diff table |
| `src/features/admin/api.js` | Thêm API endpoints cho dry run, confirm, history |
| **File mới:** `src/features/admin/JournalManagementPage.jsx` | CRUD datatable cho journals |
| **File mới:** `src/features/admin/JournalEditModal.jsx` | Modal sửa thông tin journal |
| `src/features/admin/api.js` | Thêm CRUD API calls |
| `src/features/search/SearchPapers.jsx` | Filter ẩn paper retracted |
| `src/features/search/paper.api.js` | Có thể cần param `excludeRetracted` |
| Các file hiển thị quartile | Có thể cần badge/icon cảnh báo nếu dữ liệu cũ |

---

## 6. Lưu ý quan trọng

1. **Quartile là thuộc tính của journal, không phải paper** — nếu paper bị retract, chỉ cần xử lý ở mức paper (ẩn / đánh dấu), quartile của journal không tự động thay đổi.
2. **SCImago chỉ cập nhật 1 lần/năm** — không cần chạy scheduler quá thường xuyên. Upload hàng quý là đủ.
3. **CrossRef API có rate limit** — nếu có nhiều papers cần kiểm tra retraction, cần xử lý batch + backoff.
4. **Hiện tại FE không có test** — cần cân nhắc viết test cho các component mới.
