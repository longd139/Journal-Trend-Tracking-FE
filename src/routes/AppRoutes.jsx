import { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
// import LoginPage from '../pages/LoginPage';
// import RegisterPage from '../pages/RegisterPage';

// 1. Lazy load LandingPage (đảm bảo file LandingPage.jsx đã có chữ "export default function LandingPage")
const LandingPage = lazy(() => import('../pages/LandingPage'));
const LoginPage = lazy(() => import('../pages/AuthPage/LoginPage'));
const RegisterPage = lazy(() => import('../pages/AuthPage/RegisterPage'));

// 2. Màn hình chờ
const FallbackLoading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-[#0B1020]">
    <div className="text-sm font-semibold text-white animate-pulse">
      Loading system...
    </div>
  </div>
);

// 3. Khởi tạo Router với cấu trúc mảng CHUẨN
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<FallbackLoading />}>
        <LandingPage />
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
]);
