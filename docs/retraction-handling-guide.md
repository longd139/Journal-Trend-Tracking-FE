# Giải pháp cập nhật dữ liệu khi bài báo bị gỡ (Retraction)

## 1. Thực trạng hiện tại

### Backend (Spring Boot) — đã có sẵn

**File:** `service/JournalEnrichmentService.java`

| Thành phần | Trạng thái | Chi tiết |
|------------|-----------|----------|
| Tự động tải SCImago CSV | ✅ **Đã có** | Tải từ `https://www.scimagojr.com/journalrank.php?out=csv` |
| Scheduler hàng tháng | ✅ **Đã có** | `@Scheduled(cron = "0 0 3 1 * ?")` — 3h sáng ngày 1 mỗi tháng |
| Match ISSN → name | ✅ **Đã có** | Batch 500 records/lần |
| Update quartile + SJR | ✅ **Đã có** | Cập nhật DB tự động |
| Flag tắt/bật | ✅ **Đã có** | `app.scimago.enabled=true` |
| API trigger manual | ✅ **Đã có** | `POST /api/admin/sync/enrich-journals` (không cần upload file) |
| API upload CSV tay | ✅ **Đã có** | `POST /api/admin/sync/enrich-journals/upload` |

### Frontend (React) — đã có

| Component | File | Vai trò |
|-----------|------|---------|
| SyncDataPage.jsx | `src/features/admin/SyncDataPage.jsx` | Upload SCImago CSV (admin) |
| SearchJournal.jsx | `src/features/search/SearchJournal.jsx` | Hiển thị badge Q1-Q4 |
| KeywordQuickStats.jsx | `src/features/search/KeywordQuickStats.jsx` | Badge quartile trên biểu đồ |
| AdvancedFilter.jsx | `src/features/search/AdvancedFilter.jsx` | Filter tìm kiếm theo quartile |
| JournalQualityResult.jsx | `src/features/reports/components/JournalQualityResult.jsx` | Báo cáo chất lượng journal |

---

## 2. Vấn đề cần giải quyết

**Phát biểu bài toán:** Khi một bài báo (paper) bị tác giả hoặc nhà xuất bản gỡ xuống (retraction / removal), nó vẫn xuất hiện trong kết quả tìm kiếm, thống kê, báo cáo — gây hiểu lầm cho người dùng.

**Phạm vi ảnh hưởng:**
- Search papers
- Thống kê keyword / journal
- Báo cáo journal quality
- Analytics / dashboard

**Lưu ý quan trọng:** Quartile là thuộc tính của **journal**, không phải của từng **paper**. Khi paper bị retract, quartile của journal chứa nó **không thay đổi**. Vấn đề là paper đó không còn giá trị học thuật và cần được đánh dấu/ẩn.

---

## 3. Giải pháp

### Phase 1: Backend — Check retraction định kỳ (khoảng 50 dòng code)

**File cần sửa:** `service/JournalEnrichmentService.java`

Thêm 1 method scheduler mới:

```java
/**
 * Kiểm tra retraction hàng tuần qua CrossRef API.
 * Chạy 4h sáng Chủ nhật.
 */
@Scheduled(cron = "0 0 4 * * SUN")
public void checkRetractedPapers() {
    // 1. Lấy danh sách paper có DOI từ DB
    List<Paper> papers = paperRepository.findByDoiIsNotNullAndRetractedFalse();
    
    for (Paper paper : papers) {
        // 2. Gọi CrossRef API
        // GET https://api.crossref.org/works/{doi}
        // Kiểm tra trường "update-to" / "retracted"
        boolean isRetracted = crossRefClient.checkRetraction(paper.getDoi());
        
        if (isRetracted) {
            paper.setRetracted(true);
            paper.setRetractedAt(LocalDateTime.now());
            paperRepository.save(paper);
            log.warn("Paper retracted: {} ({})", paper.getTitle(), paper.getDoi());
        }
    }
}
```

**Các API endpoint mới cho admin:**

| Method | Endpoint | Mục đích |
|--------|----------|----------|
| `GET` | `/api/v1/admin/papers?retracted=true` | Danh sách paper bị retract |
| `POST` | `/api/v1/admin/papers/{id}/mark-retracted` | Đánh dấu retract thủ công |
| `POST` | `/api/v1/admin/papers/mark-retracted/batch` | Batch đánh dấu hàng loạt |
| `POST` | `/api/v1/admin/sync/check-retraction` | Trigger kiểm tra retraction thủ công |

### Phase 2: Frontend — Badge + Filter (khoảng 30 dòng code)

**File cần sửa:** `src/features/search/SearchPapers.jsx`

```jsx
// Hiển thị badge trên paper bị retract
{paper.retracted && (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full 
                   text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
    ⚠ Retracted
  </span>
)}
```

**File cần sửa:** `src/features/search/AdvancedFilter.jsx`

```jsx
// Thêm checkbox ẩn bài báo retract
<label className="flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    checked={filters.hideRetracted}
    onChange={(e) => setFilters({ ...filters, hideRetracted: e.target.checked })}
  />
  <span className="text-sm">Ẩn bài báo đã retract</span>
</label>
```

**File cần sửa:** `src/features/search/paper.api.js`

```javascript
// Thêm param excludeRetracted
const params = {
  ...otherParams,
  ...(filters.hideRetracted && { excludeRetracted: true }),
};
```

### Tổng kết thay đổi

| File | Thay đổi | Dòng code |
|------|----------|-----------|
| `JournalEnrichmentService.java` | Thêm scheduler check retraction + CrossRef client | ~50 |
| `PaperRepository.java` | Thêm query `findByDoiIsNotNullAndRetractedFalse` | ~5 |
| `AdminSyncController.java` | Thêm endpoint trigger check retraction | ~10 |
| `SearchPapers.jsx` | Thêm badge Retracted | ~10 |
| `AdvancedFilter.jsx` | Thêm checkbox Ẩn bài báo retract | ~15 |
| `paper.api.js` | Thêm param `excludeRetracted` | ~5 |
| **Tổng** | | **~95 dòng** |

---

## 4. So sánh các giải pháp

| Giải pháp | Effort | Ổn định | Bảo trì | Ghi chú |
|-----------|--------|---------|---------|---------|
| **SCImago enrich** (quartile journal) | ✅ **0 ngày** | Cao | Zero | Đã có sẵn, tự chạy hàng tháng |
| **CrossRef retraction check** (paper) | ~0.5 ngày | Cao | Thấp | API free, không cần key |
| **Admin đánh dấu retract thủ công** | ~0.5 ngày | Trung bình | Trung bình | Dự phòng khi API fail |
| **FE badge + filter** | ~0.5 ngày | Cao | Thấp | UX, không ảnh hưởng logic |
| **Popup/search results** | 0 ngày | - | - | Có thể làm sau nếu cần |

---

## 5. Lưu ý khi triển khai

1. **CrossRef API rate limit:** ~50 requests/s với public API, ~100/s với API key (free). Nếu có >10k papers cần check, nên xử lý batch + backoff.
2. **SCImago quartz update:** Backend đã tự động tải SCImago CSV và cập nhật quartile hàng tháng. Admin có thể trigger manual qua `POST /api/admin/sync/enrich-journals` bất cứ lúc nào.
3. **Không cần external cron:** Spring `@Scheduled` tự xử lý. Chỉ cần deploy là chạy.
4. **Paper retracted không ảnh hưởng đến journal quartile:** Không tự động giảm/hạ quartile khi có paper bị gỡ.
5. **Admin vẫn có thể sửa quartile thủ công** nếu cần — backend có sẵn `Journal` entity với field `quartile`.
