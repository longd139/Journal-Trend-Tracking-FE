import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import DashboardLayout from '../shared/layouts/MainLayout.jsx';
import AuthLayout from '../features/auth/AuthLayout.jsx';
import AuthPage from '../features/auth/AuthPage.jsx';
import LoginPage from '../features/auth/LoginPage.jsx';
import RegisterPage from '../features/auth/RegisterPage.jsx';
import ResetPasswordPage from '../features/auth/ResetPasswordPage.jsx';

// ==========================================
// 1. IMPORT CÁC TRANG (Lazy Loading)
// ==========================================
const LandingPage = lazy(() => import('../features/landing/LandingPage'));
const OverviewController = lazy(
  () => import('../features/overview/OverviewController.jsx'),
);
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx'));

// Trang User / Researcher
const SearchPapers = lazy(() => import('../features/search/SearchPapers.jsx'));
const SearchJournal = lazy(() => import('../features/search/SearchJournal.jsx'));
const SearchAuthor = lazy(() => import('../features/search/SearchAuthor.jsx'));
const PaperDetailPage = lazy(() => import('../features/search/PaperDetailPage.jsx'));

const BookmarksView = lazy(() => import('../features/bookmarks/BookmarksView.jsx'));
const ReportsView = lazy(() => import('../features/reports/ReportsViewPage.jsx'));
const AnalyticsPage = lazy(() => import('../features/analytics/AnalyticsPage.jsx'));
const FollowsView = lazy(() => import('../features/follows/FollowsView.jsx'));
const NotificationsPage = lazy(() => import('../features/notifications/NotificationsPage.jsx'));
const SettingsPage = lazy(() => import('../features/settings/SettingsPage.jsx'));

// Trang Admin
const UserManagement = lazy(() => import('../features/admin/UserManagementPage.jsx'));
const APIMonitoring = lazy(() => import('../features/admin/APIMonitoringPage.jsx'));
const DatabaseView = lazy(() => import('../features/admin/DatabaseViewPage.jsx'));
const SyncData = lazy(() => import('../features/admin/SyncDataPage.jsx'));
const AdminAuditLog = lazy(() => import('../features/admin/AdminAuditLogPage.jsx'));
const AdminConfig = lazy(() => import('../features/admin/AdminConfigPage.jsx'));
const AdminDataSources = lazy(() => import('../features/admin/AdminDataSourcePage.jsx'));

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
  // --- Nhóm Routes Auth (Layout chung với left panel tĩnh) ---
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/auth',
        element: <AuthPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
  // --- Login standalone (full-screen split layout) ---
  {
    path: '/login',
    element: <LoginPage />,
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
          <ProtectedRoute allowedRoles={['researcher', 'academic']}>
            <Suspense fallback={<FallbackLoading />}>
              <BookmarksView />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'follows',
        element: (
          <ProtectedRoute allowedRoles={['researcher', 'academic']}>
            <Suspense fallback={<FallbackLoading />}>
              <FollowsView />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'notifications',
        element: (
          <ProtectedRoute allowedRoles={['researcher', 'academic']}>
            <Suspense fallback={<FallbackLoading />}>
              <NotificationsPage />
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
          <ProtectedRoute allowedRoles={['researcher', 'academic']}>
            <Suspense fallback={<FallbackLoading />}>
              <SearchPapers />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'journal-search', // -> URL thực tế: /:roleName/journal-search
        element: (
          <ProtectedRoute allowedRoles={['researcher', 'academic']}>
            <Suspense fallback={<FallbackLoading />}>
              <SearchJournal />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'search-author', // -> URL thực tế: /:roleName/search-author
        element: (
          <ProtectedRoute allowedRoles={['researcher', 'academic']}>
            <Suspense fallback={<FallbackLoading />}>
              <SearchAuthor />
            </Suspense>
          </ProtectedRoute>
        ),
      },

      {
        path: 'papers/:paperId', // -> URL thực tế: /:roleName/papers/:paperId
        element: (
          <ProtectedRoute allowedRoles={['researcher', 'academic']}>
            <Suspense fallback={<FallbackLoading />}>
              <PaperDetailPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },

      {
        path: 'reports', // -> URL thực tế: /:roleName/reports
        element: (
          <ProtectedRoute allowedRoles={['researcher', 'academic']}>
            <Suspense fallback={<FallbackLoading />}>
              <ReportsView />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'analytics', // -> URL thực tế: /:roleName/analytics
        element: (
          <ProtectedRoute allowedRoles={['researcher', 'academic']}>
            <Suspense fallback={<FallbackLoading />}>
              <AnalyticsPage />
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
      {
        path: 'sync-data',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<FallbackLoading />}>
              <SyncData />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'audit-logs',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<FallbackLoading />}>
              <AdminAuditLog />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'configs',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<FallbackLoading />}>
              <AdminConfig />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'data-sources',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<FallbackLoading />}>
              <AdminDataSources />
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
