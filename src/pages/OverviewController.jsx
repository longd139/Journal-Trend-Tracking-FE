import React from 'react';
import AdminOverviewPage from './AdminOverviewPage';
import UserOverviewPage from './UserOverviewPage';

export default function OverviewController() {
  // Lấy role từ sessionStorage (nếu chưa có thì mặc định là 'user')
  const currentRole = sessionStorage.getItem('userRole') || 'user'; 

  // TRẠM PHÂN LUỒNG
  if (currentRole === 'admin') {
    // Nếu là Admin -> Hiển thị Dashboard của Admin
    return <AdminOverviewPage />;
  }

  // Mặc định (User / Researcher) -> Hiển thị Dashboard bài báo khoa học
  return <UserOverviewPage />;
}