# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server on localhost:5173
npm run build      # Production build (Vite)
npm run preview    # Preview production build
npm run lint       # ESLint (flat config, JS/JSX files only)
```

There is no test runner configured yet.

## Architecture

```
src/
├── main.jsx              # Entry point: renders RouterProvider + Toaster
├── App.jsx               # Dead code (original state-machine SPA, replaced by React Router)
├── routes/AppRoutes.jsx  # Single source of truth for all routes
├── layouts/              # DashboardLayout (sidebar + topbar + <Outlet/>)
├── pages/                # Page components (lazy-loaded by route)
├── lib/
│   ├── http/axiosClient.js  # Axios instance with auth interceptor
│   └── api/                 # API call functions (auth.api.js, user.api.js)
├── store/useAuthStore.js    # Zustand store (persisted tokens via localStorage)
├── components/
│   ├── ui/                  # shadcn/ui-style primitives (Radix + Tailwind)
│   ├── SharedUI.jsx         # Reusable atoms: GlowBadge, StatusPill, StatCard, SectionBadge
│   └── figma/               # Figma asset bridge
├── constants/mockData.js    # Mock data + accounts (used when BE is unavailable)
├── styles/                  # Global CSS: Tailwind v4, CSS theme variables, fonts
└── services/                # Legacy API layer (mostly empty, superseded by lib/api/)
```

**Routing**: React Router v7 with lazy loading (`React.lazy`). Routes use a dynamic `/:roleName` parent that wraps everything in `DashboardLayout`. Child routes map to role-specific pages: `overview`, `search`, `analytics`, `bookmarks`, `reports` for researchers/academics; `users`, `system-api`, `database` for admins. `ProtectedRoute` checks `sessionStorage.getItem('userRole')` — redirects to `/login` if missing, or to the correct role's overview if trying to access another role's paths.

**Auth flow**: Login → `authAPI.login()` → response contains `accessToken` + `role` → token stored in Zustand (`useAuthStore`, persisted to localStorage under key `Journal-Tracking-System`) → role stored in `sessionStorage` → navigate to `/${role}/overview`. The Axios interceptor auto-attaches `Authorization: Bearer <token>` from the Zustand store to every request. Sign-out clears sessionStorage only (token remains in localStorage via Zustand).

**Three roles**: `admin`, `researcher`, `academic_user` (stored as `academic` in sessionStorage for legacy). Each role sees different sidebar nav items and has different available routes. The `OverviewController` page switches between admin and user overviews based on sessionStorage role.

**Theme**: Dark-only design system. CSS custom properties defined in `styles/theme.css` (Tailwind v4 `@theme inline`). Key colors: `--background: #0B1020`, `--card: #1B2235`, `--primary: #4F8CFF`, `--accent: #00D1B2`. Fonts: Outfit (headings), Inter (body), JetBrains Mono (data/monospace). Scrollbar is styled globally in `main.jsx`.

**UI components**: `src/components/ui/` contains 50+ shadcn/ui-style components built on Radix UI primitives with Tailwind classes. The `cn()` utility in `components/ui/utils.js` merges Tailwind classes via `clsx` + `tailwind-merge`.

**Vite config**: Uses `@vitejs/plugin-react`, `@tailwindcss/vite`, and a custom `figmaAssetResolver` plugin that resolves `figma:asset/filename` imports to `src/assets/filename`. The `@` alias maps to `src/`.

**Recharts** is used for charting (AreaChart, ResponsiveContainer, etc.). **Framer Motion** (`motion/react`) for animations across pages.

## Environment

One env variable required: `VITE_API_URL` (default `http://localhost:8080`). Set in `.env`.
