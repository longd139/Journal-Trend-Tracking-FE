import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import RegisterPage from '../pages/AuthPage/RegisterPage.jsx';
import LoginPage from '../pages/AuthPage/LoginPage.jsx';
import ResetPasswordPage from '../pages/ResetPasswordPage.jsx';

// ==========================================
// 1. IMPORT CÁC TRANG (Lazy Loading)
// ==========================================
const LandingPage = lazy(() => import('../pages/LandingPage'));
const AuthPage = lazy(() => import('../pages/AuthPage/AuthPage'));
const OverviewController = lazy(
  () => import('../pages/OverviewController.jsx'),
);
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx'));

// Trang User / Researcher
const SearchPapers = lazy(() => import('../pages/SearchPapers.jsx'));
const AnalyticsView = lazy(() => import('../pages/AnalyticsView.jsx'));
const BookmarksView = lazy(() => import('../pages/BookmarksView.jsx'));
const ReportsView = lazy(() => import('../pages/ReportsViewPage.jsx'));
const SettingsPage = lazy(() => import('../pages/SettingsPage.jsx'));

// Trang Admin
const UserManagement = lazy(() => import('../pages/UserManagementPage.jsx'));
const APIMonitoring = lazy(() => import('../pages/APIMonitoringPage.jsx'));
const DatabaseView = lazy(() => import('../pages/DatabaseViewPage.jsx'));

// ==========================================
// 2. COMPONENT LOADING & BẢO VỆ ROUTE
// ==========================================
const FallbackLoading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-[#0B1020]">
    <div className="text-sm font-semibold text-white animate-pulse">
      Loading system...
    </div>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userRole = sessionStorage.getItem('userRole');

  // Chưa đăng nhập -> Đá ra trang login
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  // Đã đăng nhập nhưng không có quyền -> Đá về trang overview của role đó
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to={`/${userRole}/overview`} replace />;
  }

  return children;
};

// ==========================================
// 3. CẤU HÌNH ROUTER (NESTED ROUTES)
// ==========================================
export const router = createBrowserRouter([
  // --- Nhóm Routes Public ---
  {
    path: '/',
    errorElement: (
      <Suspense fallback={<FallbackLoading />}>
        <NotFoundPage />
      </Suspense>
    ),
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
  {
    path: '/reset-password',
    element: (
      <Suspense fallback={<FallbackLoading />}>
        <ResetPasswordPage />
      </Suspense>
    ),
  },

  // --- Nhóm Routes Dashboard (Cấu trúc Cha - Con) ---
  {
    path: '/:roleName', // Bắt URL có dạng /admin, /researcher, /academic
    element: (
      <ProtectedRoute>
        {/* Layout cha bọc ngoài. Thẻ Outlet sẽ được thay thế bằng nội dung trang con */}
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: (
      <Suspense fallback={<FallbackLoading />}>
        <NotFoundPage />
      </Suspense>
    ),
    children: [
      {
        path: 'settings', // -> URL: /:roleName/settings
        element: (
          <Suspense fallback={<FallbackLoading />}>
            <SettingsPage />
          </Suspense>
        ),
      },
      {
        path: 'bookmarks',
        element: (
          <ProtectedRoute allowedRoles={['researcher', 'academic_user']}>
            <Suspense fallback={<FallbackLoading />}>
              <BookmarksView />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'overview', // -> URL thực tế: /:roleName/overview
        element: (
          <Suspense fallback={<FallbackLoading />}>
            <OverviewController />
          </Suspense>
        ),
      },
      {
        path: 'search', // -> URL thực tế: /:roleName/search
        element: (
          <ProtectedRoute allowedRoles={['researcher', 'academic_user']}>
            <Suspense fallback={<FallbackLoading />}>
              <SearchPapers />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'analytics', // -> URL thực tế: /:roleName/analytics
        element: (
          <ProtectedRoute allowedRoles={['researcher']}>
            <Suspense fallback={<FallbackLoading />}>
              <AnalyticsView />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'reports', // -> URL thực tế: /:roleName/reports
        element: (
          <ProtectedRoute allowedRoles={['researcher', 'academic_user']}>
            <Suspense fallback={<FallbackLoading />}>
              <ReportsView />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      // --- CÁC TRANG CỦA ADMIN ---
      {
        path: 'users',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<FallbackLoading />}>
              <UserManagement />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'system-api',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<FallbackLoading />}>
              <APIMonitoring />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'database',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<FallbackLoading />}>
              <DatabaseView />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },

  // CATCH-ALL ROUTE: Nếu gõ bậy bạ một link không tồn tại, đá thẳng về trang 404
  {
    path: '*',
    element: (
      <Suspense fallback={<FallbackLoading />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);
