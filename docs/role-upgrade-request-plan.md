# SCITRACK — Role Upgrade Request Flow Plan

## Hiện Trạng

```
❌ POST /api/users/me/upgrade — có nhưng KHÔNG AI GỌI (không có nút trong FE)
❌ Upgrade instant, không cần admin approval
❌ Không có form thu thập thông tin người dùng
❌ AcademicLimitAlert chỉ là text tĩnh, không click được
❌ Không có entity/model cho upgrade request
```

---

## Flow Mới

```
┌──────────────────────────────────────────────────────────────┐
│  USER FLOW (Academic User)                                   │
│                                                              │
│  STEP 1: User thấy AcademicLimitAlert                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ⚠️ You've used 8/10 searches this month.               │  │
│  │ Upgrade to Researcher for unlimited access.            │  │
│  │ [🔓 Request Upgrade]  ← NÚT MỚI, CLICK ĐƯỢC            │  │
│  └────────────────────────────────────────────────────────┘  │
│                          ↓                                    │
│  STEP 2: Điền form                                           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📋 RESEARCHER UPGRADE REQUEST                           │  │
│  │                                                        │  │
│  │ Full Name: [John Doe___________________]               │  │
│  │ Institution: [Stanford University_______]               │  │
│  │ Research Field: [Computer Science ▼_______]             │  │
│  │ Current Position: [PhD Student ▼_________]              │  │
│  │ ORCID (optional): [0000-0000-0000-0000__]               │  │
│  │                                                        │  │
│  │ Reason for upgrade:                                     │  │
│  │ ┌────────────────────────────────────────────────────┐  │  │
│  │ │ I am conducting a systematic review on...           │  │  │
│  │ │ Need access to advanced analytics to...             │  │  │
│  │ └────────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │ [Cancel]  [Submit Request]                             │  │
│  └────────────────────────────────────────────────────────┘  │
│                          ↓                                    │
│  STEP 3: Confirmation                                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ✅ Request submitted!                                    │  │
│  │ Your upgrade request is pending admin review.           │  │
│  │ You'll be notified when it's processed.                 │  │
│  │ [View My Requests]   [OK]                               │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  ADMIN FLOW                                                  │
│                                                              │
│  STEP 1: Admin nhận notification                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🔔 New upgrade request from John Doe                    │  │
│  │    Stanford University — Computer Science               │  │
│  └────────────────────────────────────────────────────────┘  │
│                          ↓                                    │
│  STEP 2: Admin Panel — Upgrade Requests tab                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📋 UPGRADE REQUESTS                                     │  │
│  │ ┌────────────────────────────────────────────────────┐  │  │
│  │ │ User          | Field         | Status  | Date      │  │  │
│  │ │───────────────|───────────────|─────────|───────────│  │  │
│  │ │ John Doe      | Computer Sci  | PENDING | 17/07/26  │  │  │
│  │ │   Stanford U.  | PhD Student   |         |           │  │  │
│  │ │   "I am conducting a systematic review..."           │  │  │
│  │ │   [View Details]  [✅ Approve]  [❌ Reject]          │  │  │
│  │ ├────────────────────────────────────────────────────┤  │  │
│  │ │ Jane Smith    | Biology       | PENDING | 16/07/26  │  │  │
│  │ │   MIT          | PostDoc       |         |           │  │  │
│  │ │   [View Details]  [✅ Approve]  [❌ Reject]          │  │  │
│  │ └────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                          ↓                                    │
│  STEP 3: Admin Approve → User gets notification              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ✅ Admin approved John Doe's upgrade request            │  │
│  │ Role changed: academic_user → researcher                │  │
│  │ Notification sent to John Doe                           │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Database

### New Table

```sql
CREATE TABLE ROLE_UPGRADE_REQUEST (
    RequestID       UNIQUEIDENTIFIER    NOT NULL  DEFAULT NEWID(),
    UserID          UNIQUEIDENTIFIER    NOT NULL,
    FullName        NVARCHAR(200)       NOT NULL,
    Institution     NVARCHAR(300)       NOT NULL,
    ResearchField   NVARCHAR(200)       NOT NULL,
    [Position]      NVARCHAR(100)       NOT NULL,
    Orcid           NVARCHAR(50)        NULL,
    Reason          NVARCHAR(MAX)       NOT NULL,
    Status          NVARCHAR(20)        NOT NULL  DEFAULT 'PENDING'
                        CHECK (Status IN ('PENDING','APPROVED','REJECTED')),
    AdminNote       NVARCHAR(500)       NULL,
    ReviewedBy      UNIQUEIDENTIFIER    NULL,
    ReviewedAt      DATETIME2(0)        NULL,
    CreatedAt       DATETIME2(0)        NOT NULL  DEFAULT SYSDATETIME(),

    CONSTRAINT PK_ROLE_UPGRADE_REQUEST PRIMARY KEY (RequestID),
    CONSTRAINT FK_UPGRADE_REQ_User     FOREIGN KEY (UserID)     REFERENCES [USER](UserID),
    CONSTRAINT FK_UPGRADE_REQ_Admin    FOREIGN KEY (ReviewedBy) REFERENCES [USER](UserID)
);
CREATE INDEX IX_UPGRADE_REQ_UserID   ON ROLE_UPGRADE_REQUEST(UserID);
CREATE INDEX IX_UPGRADE_REQ_Status   ON ROLE_UPGRADE_REQUEST(Status);
CREATE INDEX IX_UPGRADE_REQ_CreatedAt ON ROLE_UPGRADE_REQUEST(CreatedAt DESC);
```

### Entity: `RoleUpgradeRequest`

```java
@Entity
@Table(name = "ROLE_UPGRADE_REQUEST")
public class RoleUpgradeRequest {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserID")
    private User user;

    private String fullName;
    private String institution;
    private String researchField;
    private String position;       // PhD Student, PostDoc, Professor, Researcher...
    private String orcid;
    
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String reason;

    @Enumerated(EnumType.STRING)
    private UpgradeRequestStatus status = UpgradeRequestStatus.PENDING;

    private String adminNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ReviewedBy")
    private User reviewedBy;

    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
}
```

---

## API Design

### User Endpoints

| # | Method | Endpoint | Mô tả |
|---|---|---|---|
| 1 | `POST` | `/api/users/me/upgrade-request` | Gửi yêu cầu nâng cấp (thay thế `/me/upgrade` cũ) |
| 2 | `GET` | `/api/users/me/upgrade-requests` | Xem danh sách request của mình |
| 3 | `GET` | `/api/users/me/upgrade-requests/{id}` | Xem chi tiết 1 request |

```
POST /api/users/me/upgrade-request
Body: {
  "fullName": "John Doe",
  "institution": "Stanford University",
  "researchField": "Computer Science",
  "position": "PhD Student",
  "orcid": "0000-0000-0000-0000",
  "reason": "I am conducting a systematic review..."
}

Response: {
  "requestId": "uuid",
  "status": "PENDING",
  "createdAt": "2026-07-17T10:30:00"
}
```

### Admin Endpoints

| # | Method | Endpoint | Mô tả |
|---|---|---|---|
| 4 | `GET` | `/api/admin/upgrade-requests?status=PENDING&page=0&size=20` | Danh sách request (filter theo status) |
| 5 | `GET` | `/api/admin/upgrade-requests/{id}` | Chi tiết 1 request |
| 6 | `POST` | `/api/admin/upgrade-requests/{id}/approve` | Duyệt + đổi role + notify user |
| 7 | `POST` | `/api/admin/upgrade-requests/{id}/reject` | Từ chối + adminNote + notify user |

```
POST /api/admin/upgrade-requests/{id}/approve
Body: { "adminNote": "Verified institution affiliation" } (optional)

→ User role: academic_user → researcher (KHÔNG có trial expiry)
→ Request status: PENDING → APPROVED
→ Notification gửi cho user: "Your upgrade request has been approved!"
```

```
POST /api/admin/upgrade-requests/{id}/reject
Body: { "adminNote": "Insufficient information. Please provide more details." }

→ Request status: PENDING → REJECTED
→ Notification gửi cho user: "Your upgrade request was rejected. Reason: ..."
```

---

## Backend Implementation

| # | Task | Mô tả | Effort |
|---|---|---|---|
| B1 | Entity + Repository | `RoleUpgradeRequest` + `UpgradeRequestStatus` enum + repository | 30ph |
| B2 | DTOs | `UpgradeRequestDTO`, `UpgradeRequestListResponse`, `ApproveRejectRequest` | 30ph |
| B3 | `UpgradeRequestService` | Submit, list (user), list (admin), approve, reject, notify | 2h |
| B4 | `UserController` | Sửa `POST /me/upgrade` → `POST /me/upgrade-request`, thêm GET endpoints | 30ph |
| B5 | `AdminUpgradeController` | 4 endpoints: list, detail, approve, reject | 30ph |
| B6 | Notification trigger | Tạo notification khi submit + approve + reject | 30ph |
| B7 | Disable `POST /me/upgrade` cũ | Vô hiệu hóa endpoint upgrade instant cũ | 5ph |

**Tổng BE: ~4.5h**

## Frontend Implementation

| # | Task | Mô tả | Effort |
|---|---|---|---|
| F1 | `UpgradeRequestForm.jsx` | Form: institution, field, position, orcid, reason + validation | 1.5h |
| F2 | Sửa `AcademicLimitAlert` | Thêm nút "Request Upgrade" mở form | 20ph |
| F3 | Sửa `SettingsPage` | Thêm section "Upgrade Request" + history requests | 1h |
| F4 | Sửa `NotificationsPage` | Upgrade prompt notification → click mở form hoặc xem status | 30ph |
| F5 | `AdminUpgradeRequests.jsx` | Tab mới trong admin: table requests + approve/reject buttons | 2h |
| F6 | Sửa `AdminOverviewPage` | Thêm badge "N pending upgrade requests" | 20ph |
| F7 | i18n | en/vi cho form labels, status, notifications | 30ph |

**Tổng FE: ~6h**

---

## Tổng Effort: ~11h

| Layer | Effort |
|---|---|
| Backend | 4.5h |
| Frontend | 6.5h |

---

## DB Migration

Bảng `ROLE_UPGRADE_REQUEST` cần thêm vào:
- `journal_trend_db.sql` — full schema
- `src/main/resources/schema.sql` — incremental migration

---

## Verification

1. Academic user click "Request Upgrade" → form hiển thị
2. Submit form với đầy đủ fields → request PENDING trong DB
3. Admin nhận notification "New upgrade request"
4. Admin vào Admin Panel → thấy request trong danh sách
5. Admin click Approve → user role đổi thành researcher → user nhận notification
6. Admin click Reject → request REJECTED + adminNote → user nhận notification
7. User vào Settings → thấy history requests với status
8. `POST /me/upgrade` cũ → trả về 410 Gone hoặc redirect sang endpoint mới
