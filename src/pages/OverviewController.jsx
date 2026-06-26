import React from 'react';
import AdminOverviewPage from './AdminOverviewPage';
import UserOverviewPage from './UserOverviewPage';

export default function OverviewController() {
 // Lấy role từ sessionStorage (nếu chưa có thì mặc định là 'user')
 const currentRole = sessionStorage.getItem('userRole') || 'user'; 

 // Đắp thêm cái div bao ngoài với background đồng bộ
 // Tailwind sẽ tự động đổi bg dựa trên chế độ Dark/Light của toàn trang
 return (
 <div className="min-h-full bg-transparent">
  {currentRole === 'admin' ? (
  <AdminOverviewPage />
  ) : (
  <UserOverviewPage />
  )}
 </div>
 );
}