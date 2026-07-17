# SCITRACK "Idea" Feature — Implementation Plan v4

## Context

Thêm tab "Idea" vào sidebar. Trang Idea có 2 tab nội bộ:
- **New Analysis**: Nhập ý tưởng → AI trích xuất keywords + gợi ý → User tương tác xóa/thêm keywords → Confirm → Search papers → Tải PDF RAM → AI phân tích → Bảng đánh giá clickable
- **History**: Danh sách các lần phân tích trước đây, lưu trong DB. User click vào 1 history item → xem lại toàn bộ kết quả đã lưu (không cần gọi lại pipeline)

## Overall Feasibility: ✅ KHẢ THI

---

## User Flow (New Analysis — 4 Bước)

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Nhập ý tưởng                                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Textarea lớn (~500px)                                     │  │
│  │  "Mô tả ý tưởng nghiên cứu của bạn..."                     │  │
│  │  [Submit]                                                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                          ↓                                       │
│  STEP 2: Chọn keywords (TƯƠNG TÁC)                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Keywords trích xuất từ ý tưởng:                           │  │
│  │  [deep learning ✕] [lung cancer ✕] [CT imaging ✕]          │  │
│  │                                                            │  │
│  │  Keywords gợi ý thêm (AI suggested):                       │  │
│  │  [+ convolutional neural networks] [+ medical AI] [+ ...]  │  │
│  │                                                            │  │
│  │  Thêm keyword: [___________] [+ Add]                       │  │
│  │                                                            │  │
│  │  [Confirm & Search]                                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                          ↓                                       │
│  STEP 3: Đang phân tích (loading)                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  ⏳ Searching OpenAlex with 5 keywords...                   │  │
│  │  ⏳ Downloading PDFs for top papers...                      │  │
│  │  ⏳ AI evaluating papers against your idea...               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                          ↓                                       │
│  STEP 4: Bảng kết quả (tương tác)                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Paper Title        | TOPIC | METHOD | GAP | CITE         │  │
│  │  ─────────────────────────────────────────────────────     │  │
│  │  Deep CNN for...    | ✅true│ ✅true │ ❌false│ ✅true      │  │
│  │  Lung nodule...     | ✅true│ ❌false│ ✅true │ ✅true      │  │
│  │  ...                |  ...  |  ...   |  ...  |  ...       │  │
│  │                                                            │  │
│  │  Click cell → Popover hiện evidence quote từ PDF           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Vấn Đề Storage — In-Memory Processing

### Nguyên tắc: "Tải PDF ≠ Lưu PDF"

```
┌──────────────────────────────────────────────────────────────┐
│                   JVM MEMORY (RAM) — Stateless               │
│                                                              │
│  PDF URL ──→ HTTP GET byte[] ──→ PDDocument.load(byte[])    │
│              (tồn tại ~2-3s)          │                      │
│                                       ↓                      │
│                              PDFTextStripper.getText()       │
│                                       │                      │
│                                       ↓                      │
│                              Text gửi cho DeepSeek AI        │
│                                       │                      │
│                                       ↓                      │
│                              byte[] & PDDocument bị GC hủy   │
└──────────────────────────────────────────────────────────────┘

❌ KHÔNG ghi filesystem    ❌ KHÔNG lưu database
❌ KHÔNG upload Cloudinary  ✅ CHỈ trong RAM, GC tự dọn
```

### Trả lời giảng viên về storage

> *"Hệ thống sử dụng In-Memory Stream Processing — PDF được tải dưới dạng byte array trong RAM, trích xuất text xong là Java Garbage Collector tự giải phóng. Đây là kiến trúc stateless processing: dữ liệu chỉ tồn tại trong thời gian xử lý request (~2-3 giây), không persist vào bất kỳ storage nào. Điều này cũng tránh vấn đề bản quyền — hệ thống không lưu trữ hay phân phối lại bản sao PDF."*

---

## Evidence Quote: Cơ Chế Hoạt Động

```
BACKEND (xử lý 1 lần)                        FRONTEND (hiển thị nhiều lần)

PDF byte[] → extract text                    Nhận JSON response
     ↓                                             ↓
AI Prompt: Đánh giá + TRÍCH NGUYÊN VĂN       Lưu vào React state (useState)
     ↓                                             ↓
AI Response JSON chứa evidenceQuote          User click cell → Popover đọc
(string đã trích sẵn)                        evidenceQuote từ state → hiển thị
     ↓                                             ↓
byte[] PDF bị GC hủy                        User nghi ngờ? Click paper title
                                             → mở PDF gốc (pdfUrl) tự verify
```

**Mỗi cell chứa sẵn evidenceQuote dạng string.** Click → Popover hiển thị, không cần gọi BE.

---

## API Design (5 Endpoints)

### Endpoint 1: Trích xuất keywords (nhẹ, nhanh ~2s)

```
POST /api/v1/ideas/extract-keywords
Body: { "ideaText": "..." }

Response:
{
  "extractedKeywords": [
    "deep learning",
    "lung cancer diagnosis",
    "medical imaging"
  ],
  "suggestedKeywords": [
    "convolutional neural networks",
    "computer-aided detection",
    "thoracic CT analysis",
    "transfer learning medical"
  ]
}
```

- `extractedKeywords`: AI trích xuất trực tiếp từ ý tưởng của user
- `suggestedKeywords`: AI gợi ý thêm các keyword liên quan (dùng lại pattern của `GeminiService` keyword expansion)
- User xem, xóa keyword không muốn, thêm keyword mới → tự chọn bộ cuối cùng

### Endpoint 2: Phân tích (nặng, ~30-60s)

```
POST /api/v1/ideas/analyze
Body: {
  "ideaText": "...",
  "selectedKeywords": ["deep learning", "lung cancer diagnosis", "convolutional neural networks"]
}

Response:
{
  "analysisId": "uuid",        ← ID để load lại từ history
  "keywords": [...],
  "papers": [
    {
      "paperId": "uuid",
      "title": "...",
      "pdfUrl": "https://...",
      "abstractText": "...",
      "criteria": [
        {
          "criterionName": "TOPIC_MATCH",
          "value": true,
          "evidenceQuote": "We present a deep CNN specifically designed for lung cancer classification..."
        },
        ...
      ]
    }
  ]
}
```

Sau khi response thành công → BE tự động lưu vào bảng `IDEA_ANALYSIS` (async, không block response).

### Endpoint 3: Lịch sử phân tích

```
GET /api/v1/ideas/history?page=0&size=10

Response:
{
  "items": [
    {
      "analysisId": "uuid",
      "ideaText": "...",
      "keywords": ["kw1", "kw2"],
      "paperCount": 4,
      "createdAt": "2026-07-15T10:30:00"
    }
  ],
  "totalItems": 12,
  "totalPages": 2,
  "currentPage": 0
}
```

### Endpoint 4: Chi tiết 1 lần phân tích cũ

```
GET /api/v1/ideas/history/{analysisId}

Response: (giống hệt response của /analyze — load từ resultJson trong DB)
{
  "analysisId": "uuid",
  "ideaText": "...",
  "keywords": [...],
  "papers": [...],          ← evidenceQuote đầy đủ, được lưu từ lần chạy trước
  "createdAt": "2026-07-15T10:30:00"
}
```

### Endpoint 5: Xóa 1 history

```
DELETE /api/v1/ideas/history/{analysisId}
→ 204 No Content
```

---

## 4 Tiêu Chí Đánh Giá

| # | Tiêu chí | Ý nghĩa |
|---|---|---|
| 1 | **TOPIC_MATCH** | Paper có nghiên cứu cùng chủ đề với ý tưởng không? |
| 2 | **METHOD_RELEVANT** | Phương pháp của paper có liên quan đến ý tưởng không? |
| 3 | **GAP_ADDRESSED** | Paper có giải quyết gap/lỗ hổng được đề cập trong ý tưởng không? |
| 4 | **CITE_WORTHY** | Paper có đáng để trích dẫn trong bài báo về ý tưởng này không? |

---

## 🏆 Research Gap Analysis — Tính Năng Lõi Tạo Khác Biệt

### Tại Sao Cần?

> **Câu hỏi của giảng viên:** *"Google Scholar đã tìm được paper, tại sao tôi phải dùng hệ thống này?"*

**Câu trả lời:** Hệ thống không chỉ tìm paper — nó **tự động phân tích chéo 5-10 papers để chỉ ra chính xác khoảng trống nghiên cứu (research gap)** mà researcher có thể khai thác. Đây là việc nếu làm thủ công, researcher phải đọc hàng trăm paper và tự tổng hợp trong nhiều tuần.

### Flow

```
Sau khi AI đánh giá từng paper (Step 3 hoàn thành)
        ↓
AI Prompt thứ 3: Cross-Paper Gap Analysis
Input: ideaText + tất cả paper evaluations (criteria + evidence)
        ↓
AI tổng hợp → 4 danh mục + Novelty Score
        ↓
Hiển thị trong Step 4 (TRƯỚC bảng chi tiết)
```

### UI Hiển Thị

```
┌──────────────────────────────────────────────────────────────┐
│  📊 RESEARCH GAP ANALYSIS                                     │
│  ──────────────────────────────────────────────────────────  │
│                                                              │
│  ✅ WHAT IS ALREADY SOLVED                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ • CNN-based lung cancer classification                 │  │
│  │   → Papers #1 (94.2% accuracy), #2 (transfer learning),│  │
│  │     #4 (ensemble methods)                              │  │
│  │                                                        │  │
│  │ • Data augmentation for small medical datasets         │  │
│  │   → Papers #1 (GAN-based), #3 (traditional augment)    │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ⚠️ PARTIALLY ADDRESSED (có đề cập nhưng chưa hoàn thiện)     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ • Explainable AI trong chẩn đoán y tế                  │  │
│  │   → Paper #2 dùng Grad-CAM nhưng chỉ visualization,    │  │
│  │     không có quantitative evaluation                    │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  🔴 RESEARCH GAPS — CƠ HỘI NGHIÊN CỨU                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ • Không paper nào kết hợp Transformer architecture     │  │
│  │   với lung CT segmentation                             │  │
│  │                                                        │  │
│  │ • Thiếu benchmark dataset cho dân số châu Á             │  │
│  │   → Tất cả papers dùng LIDC-IDRI (US population)       │  │
│  │                                                        │  │
│  │ • Chưa có nghiên cứu về federated learning             │  │
│  │   trong lung cancer diagnosis                          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  💡 SUGGESTED RESEARCH DIRECTIONS                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 1. Vision Transformer (ViT) for 3D lung CT analysis    │  │
│  │ 2. Multi-ethnic dataset collection & validation        │  │
│  │ 3. Privacy-preserving federated learning framework     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  🎯 NOVELTY SCORE                                     │    │
│  │  ████████████████████░░░░░░░░  68%                    │    │
│  │                                                       │    │
│  │  Ý tưởng của bạn có 68% khía cạnh chưa từng được      │    │
│  │  khai thác trong các paper hiện có. Đây là hướng       │    │
│  │  nghiên cứu CÓ TIỀM NĂNG ĐÓNG GÓP MỚI.               │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

### Cách Tính Novelty Score

AI đánh giá dựa trên 4 yếu tố:
| Yếu tố | Trọng số | Cách tính |
|---|---|---|
| **Topic Overlap** | 30% | Có bao nhiêu paper cùng chủ đề chính xác? (ít = cao) |
| **Method Coverage** | 30% | Phương pháp user đề xuất đã có paper nào dùng chưa? (chưa = cao) |
| **Gap Saturation** | 25% | Các gap user nêu ra đã được giải quyết bao nhiêu %? (ít = cao) |
| **Citation Density** | 15% | Mức độ "đông đúc" của field (nhiều paper = khó đột phá) |

```
Novelty Score = AI đánh giá trên thang 0-100, kèm giải thích 1-2 câu
```

### Prompt Engineering

```
You are a senior research advisor. Based on the evaluation of N papers 
against the researcher's idea, perform a cross-paper gap analysis.

OUTPUT ONLY VALID JSON — no markdown, no explanation outside the JSON:

{
  "solvedAreas": [
    {
      "area": "brief description",
      "papers": ["paper title or #id", ...],
      "summary": "1-2 sentences"
    }
  ],
  "partiallyAddressed": [
    {
      "area": "brief description",
      "papers": ["paper title or #id"],
      "limitation": "what's still missing"
    }
  ],
  "researchGaps": [
    {
      "gap": "brief description",
      "rationale": "why this is a gap based on paper evidence",
      "suggestedDirection": "concrete suggestion for researcher"
    }
  ],
  "noveltyScore": 68,
  "noveltyExplanation": "2-3 sentences explaining the score"
}
```

### Tích Hợp Vào Response

Thêm field `gapAnalysis` vào `IdeaAnalysisResponse`:

```json
{
  "analysisId": "uuid",
  "keywords": [...],
  "papers": [...],
  "gapAnalysis": {
    "solvedAreas": [...],
    "partiallyAddressed": [...],
    "researchGaps": [...],
    "suggestedDirections": [...],
    "noveltyScore": 68,
    "noveltyExplanation": "..."
  }
}
```

### Lưu Trữ

`gapAnalysis` được lưu cùng trong `resultJson` của bảng `IDEA_ANALYSIS` — không cần thêm cột mới.

### Effort

| Thành phần | Effort |
|---|---|
| Prompt engineering (gap analysis) | 45ph |
| GapAnalysisDTO + parse JSON | 20ph |
| Tích hợp vào `IdeaAnalysisService.analyze()` (AI call thứ 3) | 30ph |
| UI: GapAnalysisPanel component | 45ph |
| **Tổng thêm** | **~2.5h** |

---

## 📝 Automated Literature Review Draft — Đề Xuất 2

### Tại Sao Cần?

> Sau khi có Gap Analysis, researcher biết paper nào liên quan. Nhưng họ vẫn phải **tự viết** Related Work section. Mất 2-4 giờ đọc + paraphrase + trích dẫn.

**Giải pháp:** AI tự động sinh bản nháp Literature Review từ kết quả phân tích, kèm citation đầy đủ.

### Flow

```
Sau Gap Analysis (AI call thứ 3 hoàn thành)
        ↓
AI Prompt thứ 4: Generate Literature Review Draft
Input: ideaText + paper evaluations + gap analysis
        ↓
AI sinh Related Work text với in-text citations [1][2]...
        ↓
Hiển thị trong Step 4 (SAU Gap Analysis, TRƯỚC bảng chi tiết)
```

### UI Hiển Thị

```
┌──────────────────────────────────────────────────────────────┐
│  📝 LITERATURE REVIEW DRAFT                                    │
│  ──────────────────────────────────────────────────────────  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ In recent years, deep learning approaches have shown     │  │
│  │ promising results in lung cancer diagnosis from CT       │  │
│  │ scans. Smith et al. (2024) pioneered the use of CNN      │  │
│  │ architectures for this task, achieving 94.2% accuracy    │  │
│  │ on the LIDC-IDRI benchmark [1]. Building on this work,   │  │
│  │ Chen et al. (2023) demonstrated that transfer learning   │  │
│  │ can effectively address the limited dataset problem      │  │
│  │ common in medical imaging [2].                           │  │
│  │                                                          │  │
│  │ However, several gaps remain in the current literature.  │  │
│  │ First, existing approaches rely exclusively on CNN       │  │
│  │ architectures and have not explored transformer-based    │  │
│  │ models that have shown superior performance in other     │  │
│  │ medical imaging tasks [3]. Second, all studies use the   │  │
│  │ LIDC-IDRI dataset drawn from US populations, raising     │  │
│  │ questions about generalizability to Asian populations    │  │
│  │ [1][2][4]. Third, privacy concerns preclude centralized  │  │
│  │ data collection, yet no existing work addresses          │  │
│  │ federated learning approaches in this domain.            │  │
│  │                                                          │  │
│  │ This work aims to address these gaps by...               │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  REFERENCES                                            │    │
│  │  [1] Smith et al. (2024). "Deep CNN for Lung Cancer   │    │
│  │      Detection." Medical Image Analysis, 45(2).       │    │
│  │      https://doi.org/10.xxxx/xxxxx                     │    │
│  │  [2] Chen et al. (2023). "Transfer Learning..."        │    │
│  │      https://doi.org/10.xxxx/xxxxx                     │    │
│  │  ...                                                   │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  [📋 Copy Text]  [📥 Export BibTeX]  [🔄 Regenerate]        │
└──────────────────────────────────────────────────────────────┘
```

### Prompt Engineering

```
You are an academic writing assistant. Based on the researcher's idea, 
paper evaluations, and gap analysis, write a "Related Work" section 
for their paper.

Requirements:
- Write in formal academic English
- Use in-text citations like [1], [2], etc. matching the paper numbers
- Structure: (1) What has been done, (2) What are the limitations/gaps, 
  (3) How this work addresses those gaps
- 3-5 paragraphs, ~300-500 words total
- Add a REFERENCES section at the end with full citations
- Every claim must be supported by a paper from the evaluation

OUTPUT ONLY VALID JSON:
{
  "literatureReview": "full text with [n] citations...",
  "references": [
    {
      "number": 1,
      "paperTitle": "...",
      "authors": "Smith et al.",
      "year": 2024,
      "journal": "Medical Image Analysis",
      "doi": "https://doi.org/..."
    }
  ]
}
```

### Tích Hợp Vào Response

Thêm field `literatureReview` vào `IdeaAnalysisResponse`:

```json
{
  "analysisId": "uuid",
  "keywords": [...],
  "gapAnalysis": { ... },
  "literatureReview": {
    "text": "In recent years, deep learning...",
    "references": [
      { "number": 1, "paperTitle": "...", "authors": "...", "year": 2024, "journal": "...", "doi": "..." }
    ]
  },
  "papers": [...]
}
```

### Export Formats

| Nút | Hành vi |
|---|---|
| **📋 Copy Text** | Copy `literatureReview.text` vào clipboard (plain text, giữ [n] citations) |
| **📥 Export BibTeX** | Generate BibTeX từ `literatureReview.references[]` → tải file `.bib` |
| **🔄 Regenerate** | Gọi lại AI prompt thứ 4 (giữ nguyên paper data, chỉ sinh lại text) |

### Effort

| Thành phần | Effort |
|---|---|
| Prompt engineering (literature review) | 30ph |
| LiteratureReviewDTO + parse JSON | 15ph |
| Tích hợp vào `IdeaAnalysisService.analyze()` (AI call thứ 4) | 30ph |
| UI: LiteratureReviewPanel + copy/export buttons | 1h |
| **Tổng thêm** | **~2.5h** |

---

## 💰 AI Cost Optimization — Multi-Tier Caching Strategy

### Vấn Đề

Mỗi lần Analyze gọi DeepSeek AI **4 lần** (keywords, evaluate, gap, lit review). Nếu không cache:
- 100 researchers × 3 lần/ngày × $0.02/lần = **$180/tháng**
- Cùng 1 paper có thể bị evaluate lại bởi nhiều user khác nhau

### Giải Pháp: 3-Tier Cache

```
┌─────────────────────────────────────────────────────────────┐
│                     CACHE STRATEGY                           │
│                                                             │
│  L1: RAM (ConcurrentHashMap + TTL)                          │
│  ├── Keyword extraction: 24h TTL                            │
│  │   Key = MD5(ideaText) → keywords[]                       │
│  │   Hit rate ~60% (user thường nhập lại ý tưởng cũ)        │
│  │                                                          │
│  ├── Paper evaluation: 7 days TTL                           │
│  │   Key = paperId + MD5(ideaText) → criteria[]             │
│  │   Hit rate ~40% (cùng paper, khác user, cùng idea)       │
│  │                                                          │
│  └── Gap + Lit Review: KHÔNG cache RAM                      │
│      (unique per analysis, đi thẳng L2 DB)                  │
│                                                             │
│  L2: Database                                               │
│  ├── IDEA_ANALYSIS: History chính là cache vĩnh viễn        │
│  │   Khi user xem lại từ History → 0 AI cost                │
│  │                                                          │
│  └── PAPER_EVALUATION_CACHE: (paperId, ideaHash) → criteria │
│      Chia sẻ giữa các user khác nhau                        │
│                                                             │
│  L3: DeepSeek AI API (chỉ gọi khi L1 + L2 đều miss)        │
│  └── Cost chỉ phát sinh ở L3                                │
└─────────────────────────────────────────────────────────────┘
```

### Cache Key Design

| AI Call | Cache Key | L1 TTL | L2 Storage |
|---|---|---|---|
| Extract Keywords | `MD5(ideaText)` | 24h (RAM) | Không cần (unique per request) |
| Evaluate Paper | `paperId + MD5(ideaText)` | 7 days (RAM) | `PAPER_EVALUATION_CACHE` |
| Gap Analysis | `analysisId` | N/A | `IDEA_ANALYSIS.resultJson` |
| Literature Review | `analysisId` | N/A | `IDEA_ANALYSIS.resultJson` |

### DB Tables Mới

```sql
-- =============================================
-- PAPER_EVALUATION_CACHE
-- Cache kết quả AI evaluate paper theo idea hash
-- Chia sẻ giữa các user: 2 user cùng idea → 
--   paper evaluation được reuse
-- =============================================
CREATE TABLE PAPER_EVALUATION_CACHE (
    cache_id      UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    paper_id      UNIQUEIDENTIFIER NOT NULL,
    idea_hash     VARCHAR(64) NOT NULL,           -- MD5 hash cua ideaText
    criteria_json NVARCHAR(MAX) NOT NULL,          -- JSON array cua criteria[]
    created_at    DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT UQ_PAPER_IDEA UNIQUE (paper_id, idea_hash)
);

-- Index cho viec lookup theo idea hash
CREATE INDEX IX_PAPER_EVAL_CACHE_IDEA_HASH 
    ON PAPER_EVALUATION_CACHE(idea_hash);

-- Index cho viec cleanup cache cu (older than 7 days)
CREATE INDEX IX_PAPER_EVAL_CACHE_CREATED_AT 
    ON PAPER_EVALUATION_CACHE(created_at);


-- =============================================
-- IDEA_ANALYSIS (da co trong plan)
-- History + L2 cache cho toan bo ket qua
-- =============================================
CREATE TABLE IDEA_ANALYSIS (
    analysis_id   UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id       UNIQUEIDENTIFIER NOT NULL,
    idea_text     NVARCHAR(MAX) NOT NULL,
    idea_hash     VARCHAR(64) NOT NULL,           -- MD5 hash de lookup cache
    keywords      NVARCHAR(MAX),                   -- JSON array
    result_json   NVARCHAR(MAX) NOT NULL,          -- Toan bo response JSON
    paper_count   INT DEFAULT 0,
    created_at    DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at    DATETIME2,
    
    CONSTRAINT FK_IDEA_ANALYSIS_USER 
        FOREIGN KEY (user_id) REFERENCES [USER](UserID)
);

CREATE INDEX IX_IDEA_ANALYSIS_USER_ID 
    ON IDEA_ANALYSIS(user_id);
    
CREATE INDEX IX_IDEA_ANALYSIS_CREATED_AT 
    ON IDEA_ANALYSIS(created_at DESC);

CREATE INDEX IX_IDEA_ANALYSIS_IDEA_HASH 
    ON IDEA_ANALYSIS(idea_hash);


-- =============================================
-- Scheduled Cleanup Job: Xoa cache L1 RAM expired
-- Chay moi 1 gio, xoa PAPER_EVALUATION_CACHE > 7 ngay
-- =============================================
-- (Implement trong ScheduledCacheCleanupService.java)
```

### Cache Flow Khi User Analyze

```java
// Trong IdeaAnalysisService.analyze()

// ── Keywords Extraction ──
String ideaHash = DigestUtils.md5Hex(ideaText);
List<String> keywords = ramCache.get("kw:" + ideaHash);
if (keywords == null) {
    keywords = aiExtractKeywords(ideaText);  // L3: AI call (~$0.001)
    ramCache.put("kw:" + ideaHash, keywords, 24, TimeUnit.HOURS);
}

// ── Paper Evaluation ──
for (PaperDTO paper : papers) {
    String evalKey = "eval:" + paper.paperId + ":" + ideaHash;
    
    // L1: RAM cache
    List<Criterion> criteria = ramCache.get(evalKey);
    if (criteria != null) continue;
    
    // L2: DB cache (cross-user sharing)
    String cached = paperEvalCacheRepo.findByPaperIdAndIdeaHash(paper.paperId, ideaHash);
    if (cached != null) {
        criteria = objectMapper.readValue(cached, ...);
        ramCache.put(evalKey, criteria, 7, TimeUnit.DAYS);
        continue;
    }
    
    // L3: AI call (~$0.0025 per paper)
    criteria = aiEvaluatePaper(paper, ideaText);
    ramCache.put(evalKey, criteria, 7, TimeUnit.DAYS);
    paperEvalCacheRepo.save(paper.paperId, ideaHash, toJson(criteria));
}
```

### Chi Phí Sau Khi Có Cache

| Scenario | Không cache | Có cache | Tiết kiệm |
|---|---|---|---|
| User xem lại từ History | Gọi lại toàn bộ AI | **0 AI cost** (load từ DB) | **100%** |
| User Continue (chỉnh sửa ít) | AI call mới | Chỉ đánh giá paper mới, reuse paper cũ | **~50-70%** |
| 2 user analyze ý tưởng giống hệt | 2× AI calls | Shared paper evaluations | **~40-60%** |
| 100 user × 3 lần/ngày | $180/tháng | **~$40-60/tháng** | **~70%** |

### Cache Invalidation Rules

| Cache | Khi nào xóa |
|---|---|
| L1 RAM: keywords | Sau 24h (user có thể refine ý tưởng) |
| L1 RAM: paper evaluation | Sau 7 days (paper data không đổi) |
| L2 DB: paper evaluation | Scheduled job xóa records > 7 days |
| L2 DB: IDEA_ANALYSIS | **Không tự xóa** — user tự quản lý qua History |

---

## Lộ Trình Triển Khai (Tổng: ~23h)

### Backend (~15.5h)

| # | Task | Mô tả | Effort |
|---|---|---|---|
| B1 | PDFBox + pdfRestTemplate | Thêm dependency + bean (timeout 15s/60s, user-agent) | 30ph |
| B2 | `PdfExtractionService` | `downloadPdf(url)` → byte[] RAM; `extractText(byte[])` → String | 1.5h |
| B3 | Entities + Repositories | `IdeaAnalysis` + `PaperEvaluationCache` + `IdeaAnalysisRepository` + `PaperEvalCacheRepository` + schema migration | 1.5h |
| B4 | 10 DTOs | `ExtractKeywordsRequest/Response`, `IdeaAnalysisRequest`, `IdeaAnalysisResponse`, `HistoryListResponse`, `HistoryDetailResponse`, `PaperAnalysisDTO`, `CriterionResult`, `GapAnalysisDTO`, `LiteratureReviewDTO` | 2.5h |
| B5 | `IdeaAnalysisService` | (1) `extractKeywords()` + L1 cache, (2) `analyze()` — 4-step pipeline với **3-tier caching**: L1 RAM → L2 DB → L3 AI, (3) `getHistory()`, (4) `getHistoryDetail()`, (5) `deleteHistory()` | 8.5h |
| B6 | `ScheduledCacheCleanupService` | `@Scheduled` job xóa `PAPER_EVALUATION_CACHE` > 7 days + RAM cache TTL cleanup | 30ph |
| B7 | `IdeaController` | 5 endpoints | 30ph |

### Frontend (~7.5h)

| # | Task | Mô tả | Effort |
|---|---|---|---|
| F1 | i18n | en/vi: sidebar, tab labels, step labels, history, gap analysis, literature review | 30ph |
| F2 | `api.js` | `extractKeywords()`, `analyze()`, `getHistory()`, `getHistoryDetail()`, `deleteHistory()` | 20ph |
| F3 | `IdeaPage.jsx` | 2-tab layout: New Analysis (4-step wizard) + History | 5.5h |
| F4 | Router + Sidebar | Route `/ideas`, nav item `Lightbulb` icon | 30ph |
| F5 | Cost indicator | Hiển thị "Cached ⚡" badge khi result từ cache | 30ph |

### F3 Chi Tiết — IdeaPage Layout

```
IdeaPage.jsx
├── TabBar: [New Analysis] [History (3)]          ← badge hiện số lượng
│
├── TAB 1: New Analysis (4-step wizard)
│   ├── Step 1: Textarea + character count + Submit
│   │   └── Nút "Regenerate Keywords" (khi đến từ Continue)
│   ├── Step 2: Chip list (extracted + suggested) + manual add + Confirm
│   ├── Step 3: Loading với animated progress
│   │   └── "🔍 Searching... → 📥 Downloading PDFs... → 🤖 Evaluating papers... → 🧠 Analyzing gaps... → ✍️ Generating literature review..."
│   └── Step 4: Kết quả (cuộn dọc)
│       ├── 🏆 GAP ANALYSIS PANEL (trên cùng — quan trọng nhất)
│       │   ├── ✅ Solved Areas (xanh lá)
│       │   ├── ⚠️ Partially Addressed (vàng)
│       │   ├── 🔴 Research Gaps (đỏ — highlight)
│       │   ├── 💡 Suggested Directions
│       │   └── 🎯 Novelty Score (progress bar + explanation)
│       ├── 📝 LITERATURE REVIEW DRAFT (ở giữa)
│       │   ├── Văn bản học thuật với in-text citations [1][2]...
│       │   ├── REFERENCES section
│       │   └── [📋 Copy Text] [📥 Export BibTeX] [🔄 Regenerate]
│       └── 📊 PAPER EVALUATION TABLE (bên dưới — bằng chứng)
│           └── Click cell → Popover evidenceQuote
│
└── TAB 2: History
    ├── Danh sách: mỗi item hiển thị:
    │   - ideaText (truncated ~100 chars) + Novelty Score badge
    │   - keywords badges (thu nhỏ)
    │   - paperCount + ngày tạo
    │   - 3 nút hành động: [👁 View] [🔄 Continue] [🗑 Delete]
    ├── [View] → mở Detail View:
    │   - Gap Analysis Panel (đã lưu)
    │   - Bảng kết quả
    ├── [Continue] → chuyển sang tab New Analysis:
    │   - Load ideaText + keywords → nhảy Step 2
    ├── [Delete] → Confirm dialog → xóa
    └── Empty state
```

### DB Schema Migration

Thêm bảng `IDEA_ANALYSIS` vào file schema.sql (nằm cùng thư mục resources của BE).

---

## Tính Năng "Continue" — Tiếp Tục Ý Tưởng Từ History

### Problem

User quay lại sau 1 tuần, vào History thấy ý tưởng cũ → muốn tiếp tục phát triển (chỉnh sửa ý tưởng, thay đổi keywords, chạy lại để có kết quả mới nhất).

### Solution: Nút "Continue" trên mỗi History Item

```
┌──────────────────────────────────────────────────────────────┐
│  History Item                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📝 "Ứng dụng deep learning trong chẩn đoán ung thư..."   │  │
│  │    [deep learning] [lung cancer] [CNN] [+2]              │  │
│  │    4 papers • 15/07/2026                                │  │
│  │    [👁 View]  [🔄 Continue]  [🗑 Delete]                 │  │
│  │                                                          │  │
│  │    Click "Continue" →                                     │  │
│  │    1. Switch sang tab "New Analysis"                     │  │
│  │    2. Load ideaText vào textarea (Step 1)                │  │
│  │    3. Load keywords cũ vào selectedKeywords              │  │
│  │    4. Nhảy thẳng Step 2 — hiển thị keywords dạng chips   │  │
│  │    5. User có thể:                                       │  │
│  │       ✏️  Sửa lại ideaText                               │  │
│  │       ❌ Xóa keywords không muốn                          │  │
│  │       ➕ Thêm keywords mới                                │  │
│  │       🤖 Gọi "Regenerate Keywords" để AI trích xuất lại  │  │
│  │    6. Confirm → chạy pipeline → lưu thành item MỚI       │  │
│  │       (KHÔNG ghi đè item cũ)                             │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### State Flow

```
const handleContinue = (historyItem) => {
    setActiveTab("new");                    // switch tab
    setIdeaText(historyItem.ideaText);      // load ý tưởng cũ
    setSelectedKeywords(historyItem.keywords); // load keywords cũ
    setExtractedKeywords(historyItem.keywords); // hiển thị như extracted
    setSuggestedKeywords([]);               // reset suggested
    setStep(2);                             // vào thẳng Step 2
};
```

### Các mức độ "tiếp tục"

| Mức độ | Hành vi | Cần Backend? |
|---|---|---|
| **1. View** | Xem lại bảng kết quả cũ (load từ resultJson) | `GET /history/{id}` — đã có |
| **2. Continue** | Load idea + keywords vào form, user chỉnh sửa → chạy mới | Không cần thêm — dùng data từ `GET /history/{id}` |
| **3. Re-run** | Chạy lại pipeline với cùng idea + keywords (không chỉnh sửa) | Không cần thêm — gọi lại `POST /analyze` |

### Backend: Không cần thêm endpoint

Tất cả data cần cho Continue (ideaText, keywords) đã có trong response của `GET /history/{id}`.

### Frontend: Thay đổi nhỏ

| Thành phần | Thay đổi |
|---|---|
| History Item component | Thêm 3 nút hành động (View, Continue, Delete) |
| IdeaPage state | Thêm `initialData` state để nhận data từ Continue |
| Tab switching | Hàm `handleContinue()` — switch tab + set form data |
| Step navigation | Khi `initialData` có giá trị → skip Step 1, vào thẳng Step 2 |
| Step 1 | Thêm nút "Regenerate Keywords" để gọi lại AI nếu user muốn bộ keywords mới |
| Sau analyze thành công | Lưu item MỚI (analysisId mới), không ghi đè item cũ |

### Effort: +30ph trong phần Frontend F3

---

## Files Cần Tạo/Sửa

**Backend (mới — 15 files):**
| File | Purpose |
|---|---|
| `entity/jpa/IdeaAnalysis.java` | JPA entity — lưu toàn bộ kết quả phân tích |
| `repository/jpa/IdeaAnalysisRepository.java` | JPA repository — query theo userId, phân trang |
| `dto/idea/ExtractKeywordsRequest.java` | `@NotBlank String ideaText` |
| `dto/idea/ExtractKeywordsResponse.java` | `extractedKeywords[]` + `suggestedKeywords[]` |
| `dto/idea/IdeaAnalysisRequest.java` | `ideaText` + `selectedKeywords[]` |
| `dto/idea/IdeaAnalysisResponse.java` | `analysisId` + `keywords[]` + `papers[]` |
| `dto/idea/HistoryListResponse.java` | `items[]` + pagination cho GET /history |
| `dto/idea/HistoryDetailResponse.java` | Toàn bộ kết quả cũ (load từ resultJson) |
| `dto/idea/GapAnalysisDTO.java` | `solvedAreas[]`, `partiallyAddressed[]`, `researchGaps[]`, `suggestedDirections[]`, `noveltyScore`, `noveltyExplanation` |
| `dto/idea/LiteratureReviewDTO.java` | `text` (full draft), `references[]` (numbered citations) |
| `dto/idea/PaperAnalysisDTO.java` | `paperId, title, pdfUrl, abstractText, criteria[]` |
| `dto/idea/CriterionResult.java` | `criterionName, value, evidenceQuote` |
| `service/PdfExtractionService.java` | Download PDF → byte[] RAM, extract text |
| `service/IdeaAnalysisService.java` | extractKeywords() + analyze() + getHistory() + getHistoryDetail() + deleteHistory() |
| `controller/IdeaController.java` | 5 endpoints |

**Backend (sửa — 2 files):**
| File | Change |
|---|---|
| `pom.xml` | Thêm `pdfbox 3.0.3` |
| `config/AppConfig.java` | Thêm `pdfRestTemplate` bean |
| `schema.sql` (hoặc migration) | Thêm bảng `IDEA_ANALYSIS` |

**Frontend (mới — 2 files):**
| File | Purpose |
|---|---|
| `src/features/idea/IdeaPage.jsx` | 2-tab layout: New Analysis (4-step wizard) + History (list + detail) |
| `src/features/idea/api.js` | `extractKeywords()`, `analyze()`, `getHistory()`, `getHistoryDetail()`, `deleteHistory()` |

**Frontend (sửa — 6 files):**
| File | Change |
|---|---|
| `src/app/router.jsx` | Route `/ideas` |
| `src/shared/layouts/MainLayout.jsx` | Nav item `Lightbulb` |
| `src/i18n/locales/en/common.json` | `sidebar.idea` |
| `src/i18n/locales/vi/common.json` | `sidebar.idea` |
| `src/i18n/locales/en/dashboard.json` | Heading + subtitle |
| `src/i18n/locales/vi/dashboard.json` | Heading + subtitle |

---

## Risk Analysis

| Risk | Mức độ | Cách xử lý |
|---|---|---|
| PDF không tải được (paywall, 403, timeout) | Cao | Try-catch → paper vẫn trả về, criteria = N/A. Không block response |
| PDF là ảnh (scanned, không có text) | Trung bình | PDFTextStripper trả về "" → criteria = N/A |
| AI trả về JSON không parse được | Trung bình | Try-catch → fallback regex → fail hoàn toàn: criteria rỗng |
| AI hallucinate evidence quote | Trung bình | Prompt bắt VERBATIM; disclaimer UI; link PDF gốc để verify |
| Response time 30-90s | Trung bình | Animated progress; PDF download song song; giới hạn top-5 papers |
| DeepSeek rate limit (429) | Thấp | Đã có retry trong `DeepSeekClient`; 2-3 calls/request |
| User xóa hết keywords → không còn gì để search | Thấp | Validate: ít nhất 1 keyword để enable nút Confirm |
| Không tìm thấy open-access paper nào | Trung bình | Message: "No open-access papers found. Try different keywords." |

---

## Verification

### Backend
1. `POST /extract-keywords` → response có extracted + suggested keywords
2. `POST /analyze` với selectedKeywords → response có analysisId + gapAnalysis + papers + criteria + evidenceQuote
3. `gapAnalysis` chứa đủ 4 danh mục: solvedAreas, partiallyAddressed, researchGaps, suggestedDirections
4. `gapAnalysis.noveltyScore` là số 0-100 kèm noveltyExplanation
5. Sau analyze → DB có 1 row IDEA_ANALYSIS với resultJson chứa cả gapAnalysis
6. `GET /history` → phân trang, item có ideaText + keywords + paperCount
7. `GET /history/{id}` → load từ resultJson, bao gồm gapAnalysis đầy đủ
8. `DELETE /history/{id}` → 204, xóa khỏi DB
9. Tắt `DEEPSEEK_API_KEY` → graceful degradation (gapAnalysis = null, paper criteria rỗng)
10. PDF URL lỗi → paper criteria = N/A, vẫn chạy gap analysis trên các paper còn lại

### Frontend
1. Step 2: xóa chip → biến mất; thêm keyword → xuất hiện
2. Step 2: xóa hết keywords → Confirm bị disable
3. Step 3: Loading hiển thị 5 bước progress (search → download → evaluate → gap analysis → literature review)
4. Step 4: Gap Analysis Panel hiển thị trên cùng với 4 danh mục + Novelty Score bar
5. Step 4: Literature Review Draft hiển thị ở giữa với citations [1][2]
6. Step 4: Solved Areas → màu xanh; Gaps → màu đỏ highlight
7. Step 4: Novelty Score hiển thị progress bar + explanation text
8. Step 4: Lit Review → [📋 Copy Text] copy vào clipboard thành công
9. Step 4: Lit Review → [📥 Export BibTeX] tải file .bib thành công
10. Step 4: Lit Review → [🔄 Regenerate] gọi lại AI, text mới thay thế text cũ
11. Step 4: Bảng paper bên dưới → click cell → Popover evidenceQuote
12. Step 4: Click paper title → mở PDF gốc
13. History: [View] → detail view hiển thị Gap Analysis + Literature Review + bảng
14. History: [Continue] → switch tab → load ideaText + keywords → Step 2
15. History: [Delete] → confirm → item biến mất
16. History: Empty state
17. Switch Tiếng Việt → UI đúng
18. Badge History hiển thị đúng số lượng
