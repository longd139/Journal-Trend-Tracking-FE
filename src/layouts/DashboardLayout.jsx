import { useLocation, useNavigate } from 'react-router-dom';
import NotificationBell from '../pages/NotificationBell';
import {
  Home,
  Search,
  BarChart2,
  FileText,
  Users,
  Globe,
  Database,
  Microscope,
  Settings,
  Bell,
  Bookmark,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { userAPI } from '../lib/api/user.api';

// 1. SIDEBAR
function Sidebar({ role, activeTab, navigate, user }) {
  // Menu cho Academic (Không có Analytics)
  const academicNav = [
    { id: 'overview', Icon: Home, label: 'Overview' },
    { id: 'search', Icon: Search, label: 'Search Papers' },
    { id: 'bookmarks', Icon: Bookmark, label: 'Bookmarks' },
    { id: 'reports', Icon: FileText, label: 'Reports' },
  ];

  // Menu cho Researcher (Full tính năng)
  const researcherNav = [
    { id: 'overview', Icon: Home, label: 'Overview' },
    { id: 'search', Icon: Search, label: 'Search Papers' },
    { id: 'analytics', Icon: BarChart2, label: 'Analytics' },
    { id: 'bookmarks', Icon: Bookmark, label: 'Bookmarks' },
    { id: 'reports', Icon: FileText, label: 'Reports' },
  ];

  // Menu cho Admin
  const adminNav = [
    { id: 'overview', Icon: Home, label: 'Dashboard' },
    { id: 'users', Icon: Users, label: 'User Management' },
    { id: 'system-api', Icon: Globe, label: 'API Monitoring' },
    { id: 'database', Icon: Database, label: 'Database' },
  ];

  // CHỌN MENU TỰ ĐỘNG THEO ROLE
  let nav = academicNav; // Mặc định
  if (role === 'admin') nav = adminNav;
  if (role === 'researcher') nav = researcherNav;
  // Hàm sinh chữ cái viết tắt từ tên thật (Ví dụ: "Nguyen Van Long" -> "NL")
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  return (
    <aside
      className="w-60 flex flex-col border-r h-screen sticky top-0 shrink-0"
      style={{ background: '#131A2A', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <div
        onClick={() => navigate(`/${role}/overview`)}
        className="p-5 border-b flex items-center gap-3 cursor-pointer hover:opacity-80 transition-all"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)' }}
        >
          <Microscope size={14} className="text-white" />
        </div>
        <div>
          <div className="text-xs font-black text-white tracking-widest">
            SCITRACK
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: '#A0AEC0' }}>
            {role === 'admin' ? 'Admin Console' : 'Research Platform'}
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ id, Icon, label }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => navigate(`/${role}/${id}`)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left"
              style={{
                background: active ? '#4F8CFF1A' : 'transparent',
                color: active ? '#4F8CFF' : '#A0AEC0',
                borderLeft: `2px solid ${active ? '#4F8CFF' : 'transparent'}`,
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}
      </nav>

      <div
        className="p-4 border-t space-y-2"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        {/* LOGIC PROFILE TỰ ĐỘNG ĐỔI THEO ROLE */}
        {(() => {
          const profileConfig = {
            admin: {
              initials: 'AD',
              name: 'System Admin',
              desc: 'SCITRACK Administrator',
            },
            researcher: {
              initials: 'SC',
              name: 'Dr. Sarah Chen',
              desc: 'MIT · Researcher',
            },
            academic: {
              initials: 'JP',
              name: 'Prof. James Patel',
              desc: 'Stanford · Academic',
            },
          };

          const currentProfile = profileConfig[role] || profileConfig.academic;

          return (
            <div
              className="flex items-center gap-3 p-2 rounded-lg"
              style={{ background: '#1B2235' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)',
                }}
              >
                {getInitials(user?.username)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {user ? user.username : 'Loading...'}
                </div>
                <div
                  className="text-[10px] truncate"
                  style={{ color: '#A0AEC0' }}
                >
                  {user ? role.toUpperCase() : 'Please wait...'}
                </div>
              </div>
              <Settings
                size={12}
                style={{ color: '#A0AEC0' }}
                className="cursor-pointer hover:text-white transition-colors"
                onClick={() => navigate(`/${role}/settings`)}
              />
            </div>
          );
        })()}

        <button
          onClick={() => {
            sessionStorage.removeItem('userRole'); // Xóa role
            navigate('/login'); // Đá thẳng về form đăng nhập
          }}
          className="w-full text-xs py-2 rounded-lg font-medium transition-all hover:text-white"
          style={{ color: '#A0AEC0', background: 'rgba(255,255,255,0.04)' }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// 2. TOPBAR
function TopBar({ title, subtitle }) {
  return (
    <header
      className="flex items-center justify-between px-6 py-4 border-b shrink-0"
      style={{ background: '#0B1020', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <div>
        <h1
          className="text-base font-black text-white"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: '#A0AEC0' }}>
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {/* Thanh Search */}
        <div className="relative hidden md:block">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: '#A0AEC0' }}
          />
          <input
            type="text"
            placeholder="Search papers, topics…"
            className="pl-8 pr-4 py-2 rounded-lg text-xs outline-none w-52 border"
            style={{
              background: '#1B2235',
              borderColor: 'rgba(255,255,255,0.08)',
              color: '#E2E8F0',
            }}
          />
        </div>

        {/* GẮN CÁI CHUÔNG VÀO ĐÂY (Thay thế cho nút chuông tĩnh cũ) */}
        <NotificationBell />
      </div>
    </header>
  );
}

// 3. XUẤT LAYOUT
export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // State lưu trữ thông tin người dùng thực tế
  const [user, setUser] = useState(null);

  const pathParts = location.pathname.split('/');
  const activeTab = pathParts[pathParts.length - 1] || 'overview';
  const role = sessionStorage.getItem('userRole') || 'academic';
  // TỰ ĐỘNG GỌI API KHI LAYOUT ĐƯỢC LOAD
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Thay đường dẫn '/api/users/me' bằng chuẩn endpoint của Backend bạn thiết kế
        const response = await userAPI.profile();
        setUser(response); // Lưu dữ liệu (gồm fullName, institution, v.v.) vào state
        console.log(response);
      } catch (error) {
        console.error('Không thể lấy thông tin tài khoản:', error);
        // Nếu lỗi 401 do hết hạn token, có thể đá user về trang login tại đây
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // CẬP NHẬT TỪ ĐIỂN ĐỂ HỖ TRỢ CẢ TRANG ADMIN VÀ USER
  const titles = {
    overview: {
      title: role === 'admin' ? 'System Dashboard' : 'Research Overview',
      sub:
        role === 'admin'
          ? 'Platform health and metrics'
          : 'Your personalized academic intelligence dashboard',
    },
    search: {
      title: 'Search Papers',
      sub: 'Find global research publications',
    },
    analytics: { title: 'Analytics', sub: 'Deep dive into your data' },
    reports: { title: 'Reports', sub: 'Exported tracking documents' },
    // Thêm dòng này vào trong mảng titles:
    bookmarks: {
      title: 'Saved Papers',
      sub: 'Your personal reading list and references',
    },
    users: { title: 'User Management', sub: 'Manage accounts and permissions' },
    'system-api': {
      title: 'API Monitoring',
      sub: 'Monitor platform endpoints and traffic',
    },
    database: {
      title: 'Database Control',
      sub: 'Manage schemas and data integrity',
    },
    settings: { title: 'Settings', sub: 'Manage your account profile' },
  };

  const currentHeader = titles[activeTab] || {
    title: 'Dashboard',
    sub: 'Welcome back',
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: '#0B1020' }}
    >
      {/* TRUYỀN STATE USER XUỐNG SIDEBAR */}
      <Sidebar
        role={role}
        activeTab={activeTab}
        navigate={navigate}
        user={user}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={currentHeader.title} subtitle={currentHeader.sub} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
}
