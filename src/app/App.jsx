// import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <>
      {/* Giữ lại phần style global của bạn (hoặc đưa vào index.css/App.css) */}
      {/* <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style> */}

      {/* Gọi hệ thống Route */}
      {/* <AppRoutes /> */}
    </>
  );
}
// ─── Shared atoms ─────────────────────────────────────────────────────────────

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ role, activeTab, setTab, navigate }) {
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
    <aside
      className="w-60 flex flex-col border-r h-screen sticky top-0 shrink-0"
      style={{ background: '#131A2A', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <div
        className="p-5 border-b flex items-center gap-3"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br from-blue-500 via-purple-500 to-teal-400"
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
              onClick={() => setTab(id)}
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
        <div
          className="flex items-center gap-3 p-2 rounded-lg"
          style={{ background: '#1B2235' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)' }}
          >
            {role === 'admin' ? 'AD' : 'SC'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {role === 'admin' ? 'Admin User' : 'Dr. Sarah Chen'}
            </div>
            <div className="text-[10px] truncate" style={{ color: '#A0AEC0' }}>
              {role === 'admin' ? 'System Administrator' : 'MIT · Researcher'}
            </div>
          </div>
          <Settings size={12} style={{ color: '#A0AEC0' }} />
        </div>
        <button
          onClick={() => navigate('landing')}
          className="w-full text-xs py-2 rounded-lg font-medium transition-all hover:text-foreground"
          style={{ color: '#A0AEC0', background: 'rgba(255,255,255,0.04)' }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ─── Top bar ─────────────────────────────────────────────────────────────────
function TopBar({ title, subtitle }) {
  return (
    <header
      className="flex items-center justify-between px-6 py-4 border-b shrink-0"
      style={{ background: '#0B1020', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <div>
        <h1
          className="text-base font-black text-white font-display"
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
        <button
          className="relative p-2 rounded-lg border transition-colors"
          style={{
            background: '#1B2235',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <Bell size={15} style={{ color: '#A0AEC0' }} />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: '#4F8CFF' }}
          />
        </button>
      </div>
    </header>
  );
}

// ─── Landing page ─────────────────────────────────────────────────────────────

// ─── Auth page ────────────────────────────────────────────────────────────────

// ─── User dashboard sub-views ─────────────────────────────────────────────────

// ─── Admin sub-views ──────────────────────────────────────────────────────────

// ─── Dashboard wrappers ───────────────────────────────────────────────────────
function UserDashboard({ navigate }) {
  const [tab, setTab] = useState('overview');
  const titles = {
    overview: 'Research Overview',
    search: 'Search Papers',
    analytics: 'Analytics',
    reports: 'Reports',
  };
  const subs = {
    overview: 'Your personalized academic intelligence dashboard',
    search: undefined,
    analytics: undefined,
    reports: undefined,
  };
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: '#0B1020' }}
    >
      <Sidebar
        role="user"
        activeTab={tab}
        setTab={(t) => setTab(t)}
        navigate={navigate}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={titles[tab]} subtitle={subs[tab]} />
        <main className="flex-1 overflow-y-auto p-6">
          {tab === 'overview' && <UserOverview />}
          {tab === 'search' && <SearchPapers />}
          {tab === 'analytics' && <AnalyticsView />}
          {tab === 'reports' && <ReportsView />}
        </main>
      </div>
    </div>
  );
}

function AdminDashboard({ navigate }) {
  const [tab, setTab] = useState('overview');
  const titles = {
    overview: 'Admin Dashboard',
    users: 'User Management',
    api: 'API Monitoring',
    database: 'Database Management',
  };
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: '#0B1020' }}
    >
      <Sidebar
        role="admin"
        activeTab={tab}
        setTab={(t) => setTab(t)}
        navigate={navigate}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          title={titles[tab]}
          subtitle={
            tab === 'overview'
              ? 'System health and administration console'
              : undefined
          }
        />
        <main className="flex-1 overflow-y-auto p-6">
          {tab === 'overview' && <AdminOverview />}
          {tab === 'users' && <UserManagement />}
          {tab === 'api' && <APIMonitoring />}
          {tab === 'database' && <DatabaseView />}
        </main>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
// export default function App() {
//   const [page, setPage] = useState('landing');
//   const navigate = (p) => setPage(p);

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
//         ::-webkit-scrollbar { width: 4px; height: 4px; }
//         ::-webkit-scrollbar-track { background: transparent; }
//         ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
//         ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
//       `}</style>
//       <motion.div
//         key={page}
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.3 }}
//         className="size-full"
//       >
//         {page === 'landing' && <LandingPage navigate={navigate} />}
//         {page === 'login' && <AuthPage mode="login" navigate={navigate} />}
//         {page === 'register' && (
//           <AuthPage mode="register" navigate={navigate} />
//         )}
//         {page === 'userDash' && <UserDashboard navigate={navigate} />}
//         {page === 'adminDash' && <AdminDashboard navigate={navigate} />}
//       </motion.div>
//     </>
//   );
// }
