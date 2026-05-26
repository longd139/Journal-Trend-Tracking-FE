# Scientific Journal Publication Trend Tracking System - Frontend

Frontend application for the **Scientific Journal Publication Trend Tracking System**.

---

# Tech Stack

- React
- Vite
- JavaScript
- TailwindCSS
- React Router DOM
- Axios

---

# Project Structure

```bash
src/
├── api/           # Axios configuration
├── assets/        # Images, icons, static files
├── components/    # Reusable UI components
│   ├── common/
│   ├── layouts/
│   ├── charts/
│   └── ui/
├── constants/     # Global constants
├── contexts/      # React Context
├── hooks/         # Custom hooks
├── layouts/       # Layout components
├── pages/         # Application pages
├── routes/        # Route configuration
├── services/      # API service layer
├── styles/        # Global styles
├── utils/         # Helper functions
└── data/          # Mock data
```

---

# Installation

## Clone repository

```bash
git clone <repository-url>
```

---

## Move to project folder

```bash
cd Journal-Trend-Tracking-FE
```

---

## Install dependencies

```bash
npm install
```

---

# Environment Variables

Create a `.env` file in the root directory.

Example:

```env
VITE_API_URL=http://localhost:5000
```

---

# Run Development Server

```bash
npm run dev
```

Frontend will run at:

```bash
http://localhost:5173
```

---

# Build Project

```bash
npm run build
```

---

# Preview Production Build

```bash
npm run preview
```

---

# Git Workflow

## Important Rules

- Never push directly to `main`
- Never code directly on `develop`
- Every feature must have its own branch
- Pull Request is required before merge

---

# Branch Structure

```bash
main
develop
feature/*
```

---

# Create Feature Branch

Example:

```bash
git checkout develop
git pull

git checkout -b feature/login-page
```

---

# Commit Convention

Use the following commit format:

```bash
feat: add login page
fix: resolve navbar bug
refactor: optimize dashboard layout
docs: update README
style: format code
```

---

# Code Style

## Requirements

- Format on Save must be enabled
- Use Prettier for formatting
- Keep components reusable
- Avoid duplicated code

---

# VSCode Extensions

Recommended extensions:

- Prettier
- Tailwind CSS IntelliSense
- ES7+ React Snippets

---

# API Communication

All API requests should go through:

```bash
src/services/
```

Axios base configuration:

```bash
src/api/axiosClient.js
```

---

# Team Development Rules

## Components

- Use PascalCase for component names
- One component per file

Example:

```bash
JournalCard.jsx
SearchBar.jsx
```

---

## Pages

Pages should be placed inside:

```bash
src/pages/
```

---

## Services

API logic should NOT be written directly inside pages/components.

Use service files instead.

Example:

```bash
journalService.js
authService.js
```

---

# Current Development Scope

Frontend includes:

- Authentication UI
- Dashboard
- Journal statistics
- Publication trends
- Search and filter
- Analytics charts
- Responsive layout

---

# Notes

- Do not push `.env`
- Do not modify another member's feature branch
- Always pull latest `develop` before starting new work

---

# Contributors

Frontend Team - Scientific Journal Publication Trend Tracking System
