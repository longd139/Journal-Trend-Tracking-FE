# Scientific Journal Publication Trend Tracking System - Frontend

Frontend cho hệ thống **Scientific Journal Publication Trend Tracking System**.

---

# Công nghệ sử dụng

- React
- Vite
- JavaScript
- TailwindCSS
- React Router DOM
- Axios

---

# Cấu trúc thư mục

```bash
src/
├── api/           # Cấu hình axios
├── assets/        # Hình ảnh, icon, file tĩnh
├── components/    # Các component tái sử dụng
│   ├── common/
│   ├── layouts/
│   ├── charts/
│   └── ui/
├── constants/     # Biến hằng toàn cục
├── contexts/      # React Context
├── hooks/         # Custom hooks
├── layouts/       # Layout tổng
├── pages/         # Các trang chính
├── routes/        # Cấu hình route
├── services/      # Gọi API
├── styles/        # CSS/Tailwind global
├── utils/         # Hàm hỗ trợ
└── data/          # Mock data
```

---

# Cài đặt project

## Clone project

```bash
git clone <repository-url>
```

---

## Di chuyển vào thư mục project

```bash
cd Journal-Trend-Tracking-FE
```

---

## Cài dependencies

```bash
npm install
```

---

# Environment Variables

Tạo file `.env` ở thư mục gốc.

Ví dụ:

```env
VITE_API_URL=http://localhost:5000
```

---

# Chạy project

```bash
npm run dev
```

Project sẽ chạy tại:

```bash
http://localhost:5173
```

---

# Build project

```bash
npm run build
```

---

# Preview production build

```bash
npm run preview
```

---

# Quy tắc Git Workflow

## QUAN TRỌNG

- Không push trực tiếp lên `main`
- Không code trực tiếp trên `develop`
- Mỗi task phải có branch riêng
- Phải tạo Pull Request trước khi merge

---

# Cấu trúc branch

```bash
main
develop
feature/*
```

---

# Tạo branch mới

Ví dụ:

```bash
git checkout develop
git pull

git checkout -b feature/login-page
```

---

# Commit Convention

Commit đúng format:

```bash
feat: thêm login page
fix: sửa lỗi navbar
refactor: tối ưu dashboard layout
docs: cập nhật README
style: format code
```

---

# Quy tắc code

## Bắt buộc

- Bật Format on Save
- Dùng Prettier để format code
- Hạn chế code trùng lặp
- Component phải tái sử dụng được

---

# VSCode Extensions khuyên dùng

- Prettier
- Tailwind CSS IntelliSense
- ES7+ React Snippets

---

# Quy tắc gọi API

Tất cả API phải viết trong:

```bash
src/services/
```

Không viết trực tiếp API trong component/page.

---

# Axios Config

File cấu hình axios:

```bash
src/api/axiosClient.js
```

---

# Quy tắc đặt tên

## Component

Dùng PascalCase.

Ví dụ:

```bash
JournalCard.jsx
SearchBar.jsx
```

---

## Service

Ví dụ:

```bash
journalService.js
authService.js
```

---

# Các chức năng frontend hiện tại

- Authentication UI
- Dashboard
- Publication trends
- Search & filter
- Analytics charts
- Responsive layout

---

# Lưu ý

- Không push file `.env`
- Không sửa branch của người khác
- Luôn pull `develop` mới nhất trước khi code

---

# Contributors

Frontend Team - Scientific Journal Publication Trend Tracking System
