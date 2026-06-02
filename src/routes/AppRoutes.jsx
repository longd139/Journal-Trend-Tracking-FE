import { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import RegisterPage from '../pages/AuthPage/RegisterPage.jsx';
import LoginPage from '../pages/AuthPage/LoginPage.jsx';

// 1. IMPORT CÁC TRANG CHÍNH
const LandingPage = lazy(() => import('../pages/LandingPage'));
const AuthPage = lazy(() => import('../pages/AuthPage/AuthPage'));

// 2. IMPORT CÁC TRANG CỦA USER DASHBOARD VÀO ĐÂY
// ⚠️ Lưu ý: Ông nhớ check lại đúng tên file và đường dẫn của ông nha!
const Overview = lazy(() => import('../pages/UserOverviewPage.jsx'));
const SearchPapers = lazy(() => import('../pages/SearchPapers.jsx')); // Tên file của ông
const AnalyticsView = lazy(() => import('../pages/AnalyticsView.jsx')); // Tên file của ông
const ReportsView = lazy(() => import('../pages/ReportsViewPage.jsx')); // Tên file của ông

const FallbackLoading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-[#0B1020]">
    <div className="text-sm font-semibold text-white animate-pulse">
      Loading system...
    </div>
  </div>
);

export const router = createBrowserRouter([
  // Routes công khai
  {
    path: '/',
    element: (
      <Suspense fallback={<FallbackLoading />}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    path: '/auth',
    element: (
      <Suspense fallback={<FallbackLoading />}>
        <AuthPage />
      </Suspense>
    ),
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<FallbackLoading />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<FallbackLoading />}>
        <RegisterPage />
      </Suspense>
    ),
  },

  // CHUỖI ROUTES CỦA DASHBOARD (ĐÃ RÁP HÀNG REAL)
  {
    path: '/overview',
    element: (
      <DashboardLayout>
        <Suspense fallback={<FallbackLoading />}>
          <Overview />
        </Suspense>
      </DashboardLayout>
    ),
  },
  {
    path: '/search',
    element: (
      <DashboardLayout>
        <Suspense fallback={<FallbackLoading />}>
          <SearchPapers />
        </Suspense>
      </DashboardLayout>
    ),
  },
  {
    path: '/analytics',
    element: (
      <DashboardLayout>
        <Suspense fallback={<FallbackLoading />}>
          <AnalyticsView />
        </Suspense>
      </DashboardLayout>
    ),
  },
  {
    path: '/reports',
    element: (
      <DashboardLayout>
        <Suspense fallback={<FallbackLoading />}>
          <ReportsView />
        </Suspense>
      </DashboardLayout>
    ),
  },
]);
