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
  AlertTriangle // Thêm icon chấm than
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { userAPI } from '../lib/api/user.api';

// 1. SIDEBAR (Giữ nguyên không đổi)
function Sidebar({ role, activeTab, navigate, user }) {
  const academicNav = [
    { id: 'overview', Icon: Home, label: 'Overview' },
    { id: 'search', Icon: Search, label: 'Search Papers' },
    { id: 'bookmarks', Icon: Bookmark, label: 'Bookmarks' },
    { id: 'reports', Icon: FileText, label: 'Reports' },
  ];

  const researcherNav = [
    { id: 'overview', Icon: Home, label: 'Overview' },
    { id: 'search', Icon: Search, label: 'Search Papers' },
    { id: 'analytics', Icon: BarChart2, label: 'Analytics' },
    { id: 'bookmarks', Icon: Bookmark, label: 'Bookmarks' },
    { id: 'reports', Icon: FileText, label: 'Reports' },
  ];

  const adminNav = [
    { id: 'overview', Icon: Home, label: 'Dashboard' },
    { id: 'users', Icon: Users, label: 'User Management' },
    { id: 'system-api', Icon: Globe, label: 'API Monitoring' },
    { id: 'database', Icon: Database, label: 'Database' },
  ];

  let nav = academicNav;
  if (role === 'admin') nav = adminNav;
  if (role === 'researcher') nav = researcherNav;

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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left border-l-2 ${
                active
                  ? 'bg-[#4F8CFF]/10 text-[#4F8CFF] border-[#4F8CFF]'
                  : 'border-transparent text-[#A0AEC0] hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}
      </nav>

      <div
        className="p-4 border-t space-y-3"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
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
            {getInitials(user?.fullName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {user ? user.fullName : 'Loading...'}
            </div>
            <div
              className="text-[10px] truncate"
              style={{ color: '#A0AEC0' }}
            >
              {user ? role.toUpperCase() : 'Please wait...'}
            </div>
          </div>
          <Settings
            size={14}
            style={{ color: '#A0AEC0' }}
            className="cursor-pointer hover:text-white transition-colors hover:rotate-90 duration-300"
            onClick={() => navigate(`/${role}/settings`)}
          />
        </div>

        <button
          onClick={() => {
            sessionStorage.removeItem('userRole'); 
            navigate('/login'); 
          }}
          className="w-full text-xs py-2.5 rounded-lg font-bold transition-all bg-white/5 text-[#A0AEC0] hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// 2. TOPBAR (ĐÃ ĐỘ LẠI PHẦN AVATAR CẢNH BÁO)
function TopBar({ title, subtitle, user, role }) {
  const navigate = useNavigate();

  // Hàm sinh chữ cái viết tắt cho Avatar TopBar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

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
      <div className="flex items-center gap-4">
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
            className="pl-8 pr-4 py-2 rounded-lg text-xs outline-none w-52 border transition-all focus:border-[#4F8CFF]"
            style={{
              background: '#1B2235',
              borderColor: 'rgba(255,255,255,0.08)',
              color: '#E2E8F0',
            }}
          />
        </div>

        {/* Chuông thông báo */}
        <NotificationBell />

        {/* ĐƯỜNG KẺ NGĂN CÁCH NHẸ */}
        <div className="h-6 w-px bg-white/10 mx-1"></div>

        {/* KHU VỰC AVATAR CÓ CẢNH BÁO CHƯA XÁC THỰC EMAIL */}
        <button 
          onClick={() => navigate(`/${role}/settings`)}
          className="relative flex items-center justify-center w-8 h-8 rounded-full transition-transform hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)' }}
          title={user?.isVerified ? "Profile Settings" : "Please verify your email"}
        >
          <span className="text-[11px] font-black text-white">
            {getInitials(user?.fullName)}
          </span>

          {/* Dấu chấm than cảnh báo nếu isVerified = false */}
          {user && user.isVerified === false && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
              {/* Hiệu ứng chớp chớp ở vòng ngoài */}
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              {/* Vòng chấm than ở trong */}
              <span className="relative flex items-center justify-center rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-[#0B1020] text-[#0B1020]">
                <AlertTriangle size={8} strokeWidth={4} />
              </span>
            </span>
          )}
        </button>

      </div>
    </header>
  );
}

// 3. XUẤT LAYOUT
export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);

  const pathParts = location.pathname.split('/');
  const activeTab = pathParts[pathParts.length - 1] || 'overview';
  const role = sessionStorage.getItem('userRole') || 'academic';

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await userAPI.profile();
        setUser(response); 
        console.log(response);
      } catch (error) {
        console.error('Không thể lấy thông tin tài khoản:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchUserProfile();
  }, [navigate]);

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
      <Sidebar
        role={role}
        activeTab={activeTab}
        navigate={navigate}
        user={user}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ĐÃ TRUYỀN THÊM USER VÀ ROLE XUỐNG TOPBAR */}
        <TopBar 
          title={currentHeader.title} 
          subtitle={currentHeader.sub} 
          user={user}
          role={role}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
}