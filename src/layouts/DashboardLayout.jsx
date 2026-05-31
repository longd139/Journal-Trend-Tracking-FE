import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, BarChart2, FileText, Users, Globe, Database, Microscope, Settings, Bell } from 'lucide-react';

// 1. SIDEBAR
function Sidebar({ role, activeTab, navigate }) {
  const userNav = [
    { id: 'overview', Icon: Home, label: 'Overview' },
    { id: 'search', Icon: Search, label: 'Search Papers' },
    { id: 'analytics', Icon: BarChart2, label: 'Analytics' },
    { id: 'reports', Icon: FileText, label: 'Reports' },
  ];
  const adminNav = [
    { id: 'overview', Icon: Home, label: 'Dashboard' },
    { id: 'users', Icon: Users, label: 'User Management' },
    { id: 'api', Icon: Globe, label: 'API Monitoring' },
    { id: 'database', Icon: Database, label: 'Database' },
  ];
  const nav = role === 'user' ? userNav : adminNav;

  return (
    <aside className="w-60 flex flex-col border-r h-screen sticky top-0 shrink-0" style={{ background: '#131A2A', borderColor: 'rgba(255,255,255,0.07)' }}>
      <div className="p-5 border-b flex items-center gap-3" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)' }}>
          <Microscope size={14} className="text-white" />
        </div>
        <div>
          <div className="text-xs font-black text-white tracking-widest">SCITRACK</div>
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
              // CHỖ NÀY ĐÃ MỞ KHÓA: Bấm phát là nhảy URL luôn
              onClick={() => navigate(`/${id}`)}
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

      <div className="p-4 border-t space-y-2" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3 p-2 rounded-lg" style={{ background: '#1B2235' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0" style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)' }}>
            {role === 'admin' ? 'AD' : 'SC'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{role === 'admin' ? 'Admin User' : 'Dr. Sarah Chen'}</div>
            <div className="text-[10px] truncate" style={{ color: '#A0AEC0' }}>{role === 'admin' ? 'System Administrator' : 'MIT · Researcher'}</div>
          </div>
          <Settings size={12} style={{ color: '#A0AEC0' }} />
        </div>
        <button
          onClick={() => {
            // 1. Xóa role đã lưu trong máy để reset trạng thái đăng nhập
            localStorage.removeItem('userRole');

            // 2. SỬA CHỖ NÀY: Chuyển hướng thẳng về trang Landing page (/)
            navigate('/');
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
    <header className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ background: '#0B1020', borderColor: 'rgba(255,255,255,0.07)' }}>
      <div>
        <h1 className="text-base font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{title}</h1>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: '#A0AEC0' }}>{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A0AEC0' }} />
          <input type="text" placeholder="Search papers, topics…" className="pl-8 pr-4 py-2 rounded-lg text-xs outline-none w-52 border" style={{ background: '#1B2235', borderColor: 'rgba(255,255,255,0.08)', color: '#E2E8F0' }} />
        </div>
        <button className="relative p-2 rounded-lg border transition-colors" style={{ background: '#1B2235', borderColor: 'rgba(255,255,255,0.08)' }}>
          <Bell size={15} style={{ color: '#A0AEC0' }} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: '#4F8CFF' }} />
        </button>
      </div>
    </header>
  );
}

// 3. XUẤT LAYOUT
export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Tự động nhận diện tab đang mở từ URL (Ví dụ: /search -> activeTab là 'search')
  const activeTab = location.pathname.substring(1) || 'overview';
  const role = localStorage.getItem('userRole') || 'user';

  // Từ điển để TopBar tự đổi tên theo Tab
  const titles = {
    overview: { title: 'Research Overview', sub: 'Your personalized academic intelligence dashboard' },
    search: { title: 'Search Papers', sub: 'Find global research publications' },
    analytics: { title: 'Analytics', sub: 'Deep dive into your data' },
    reports: { title: 'Reports', sub: 'Exported tracking documents' },
  };

  const currentHeader = titles[activeTab] || titles.overview;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0B1020' }}>
      <Sidebar role={role} activeTab={activeTab} navigate={navigate} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={currentHeader.title} subtitle={currentHeader.sub} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
}