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
const UserOverviewPage = lazy(
  () => import('../features/overview/UserOverviewPage.jsx'),
);
const GapExplorerLayout = lazy(
  () => import('../features/overview/GapExplorerLayout.jsx'),
);
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx'));
const VerifyEmailPage = lazy(() => import('../pages/VerifyEmailPage.jsx'));

// Trang User / Researcher
const SearchPapers = lazy(() => import('../features/search/SearchPapers.jsx'));
const UnifiedSearch = lazy(() => import('../features/search/UnifiedSearch.jsx'));
const PaperDetailPage = lazy(() => import('../features/search/PaperDetailPage.jsx'));

const BookmarksView = lazy(() => import('../features/bookmarks/BookmarksView.jsx'));
const ReadingHistoryPage = lazy(() => import('../features/history/ReadingHistoryPage.jsx'));
const ReportsView = lazy(() => import('../features/reports/ReportsViewPage.jsx'));
const FollowsView = lazy(() => import('../features/follows/FollowsView.jsx'));
const AuthorProfilePage = lazy(() => import('../features/follows/AuthorProfilePage.jsx'));
const JournalProfilePage = lazy(() => import('../features/follows/JournalProfilePage.jsx'));
const NotificationsPage = lazy(() => import('../features/notifications/NotificationsPage.jsx'));
const MyReportsPage = lazy(() => import('../features/reports/MyReportsPage.jsx'));
const SettingsPage = lazy(() => import('../features/settings/SettingsPage.jsx'));

// Trang Admin
const UserManagement = lazy(() => import('../features/admin/UserManagementPage.jsx'));
const DatabaseView = lazy(() => import('../features/admin/DatabaseViewPage.jsx'));
const SyncData = lazy(() => import('../features/admin/SyncDataPage.jsx'));
const AdminAuditLog = lazy(() => import('../features/admin/AdminAuditLogPage.jsx'));
const AdminConfig = lazy(() => import('../features/admin/AdminConfigPage.jsx'));
const PdfRequestsPage = lazy(() => import('../features/admin/PdfRequestsPage.jsx'));
const AdminNotificationsPage = lazy(() => import('../features/admin/AdminNotificationsPage.jsx'));
const AdminReportsPage = lazy(() => import('../features/admin/AdminReportsPage.jsx'));

// ==========================================
// 2. COMPONENT LOADING & BẢO VỆ ROUTE
// ==========================================
const FallbackLoading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="text-sm font-semibold text-foreground animate-pulse">
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

/**
 * Route /:roleName/reports — renders the correct page based on role:
 * - admin    → AdminReportsPage (manage user reports + paper flags)
 * - others   → ReportsView (generate trend reports)
 */
const ReportsPageRouter = () => {
  const role = sessionStorage.getItem('userRole');
  return role === 'admin' ? <AdminReportsPage /> : <ReportsView />;
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
  {
    path: '/verify-email',
    element: (
      <Suspense fallback={<FallbackLoading />}>
        <VerifyEmailPage />
      </Suspense>
    ),
  },

  // --- Nhóm Routes Dashboard (Cấu trúc Cha - Con) ---
  {
    path: '/:roleName', // Bắt URL có dạng /admin, /researcher, /academic_user
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
        path: 'follows',
        element: (
          <ProtectedRoute allowedRoles={['researcher', 'academic_user']}>
            <Suspense fallback={<FallbackLoading />}>
              <FollowsView />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'author-profile',
        element: (
          <ProtectedRoute allowedRoles={['researcher', 'academic_user']}>
            <Suspense fallback={<FallbackLoading />}>
              <AuthorProfilePage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'journal-profile',
        element: (
          <ProtectedRoute allowedRoles={['researcher', 'academic_user']}>
            <Suspense fallback={<FallbackLoading />}>
              <JournalProfilePage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'notifications',
        element: (
          <ProtectedRoute allowedRoles={['researcher', 'academic_user', 'admin']}>
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
        path: 'gap-explorer', // -> URL thực tế: /:roleName/gap-explorer
        element: (
          <ProtectedRoute allowedRoles={['researcher']}>
            <Suspense fallback={<FallbackLoading />}>
              <GapExplorerLayout />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'search', // -> /:roleName/search
        element: (
          <ProtectedRoute allowedRoles={['researcher', 'academic_user']}>
            <Suspense fallback={<FallbackLoading />}>
              <UnifiedSearch />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'journal-search',
        element: <Navigate to="../search" replace />,
      },
      {
        path: 'search-author',
        element: <Navigate to="../search" replace />,
      },
      {
        path: 'papers/:paperId', // -> URL thực tế: /:roleName/papers/:paperId
        element: (
          <ProtectedRoute allowedRoles={['researcher', 'academic_user']}>
            <Suspense fallback={<FallbackLoading />}>
              <PaperDetailPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },

      {
        path: 'reading-history',
        element: (
          <ProtectedRoute allowedRoles={['researcher', 'academic_user']}>
            <Suspense fallback={<FallbackLoading />}>
              <ReadingHistoryPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },

      {
        path: 'reports', // -> /:roleName/reports
        element: (
          <ProtectedRoute allowedRoles={['researcher', 'academic_user', 'admin']}>
            <Suspense fallback={<FallbackLoading />}>
              <ReportsPageRouter />
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
        path: 'pdf-requests',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<FallbackLoading />}>
              <PdfRequestsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin-notifications',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<FallbackLoading />}>
              <AdminNotificationsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-reports',
        element: (
          <Suspense fallback={<FallbackLoading />}>
            <MyReportsPage />
          </Suspense>
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
