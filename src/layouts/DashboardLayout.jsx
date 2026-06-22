import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NotificationBell from '../pages/NotificationBell';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import SyncFloatingPanel from '../components/SyncFloatingPanel';
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
  AlertTriangle,
  Sun,
  Moon,
  RefreshCw,
} from 'lucide-react';
import { useEffect } from 'react';
import { userAPI } from '../lib/api/user.api';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/useAuthStore';

// 1. SIDEBAR
function Sidebar({ role, activeTab, navigate, user }) {
  const { t } = useTranslation('common');

  const academicNav = [
    { id: 'overview', Icon: Home, label: t('sidebar.overview') },
    { id: 'search', Icon: Search, label: t('sidebar.searchPapers') },
    { id: 'bookmarks', Icon: Bookmark, label: t('sidebar.bookmarks') },
    { id: 'reports', Icon: FileText, label: t('sidebar.reports') },
  ];

  const researcherNav = [
    { id: 'overview', Icon: Home, label: t('sidebar.overview') },
    { id: 'search', Icon: Search, label: t('sidebar.searchPapers') },
    { id: 'analytics', Icon: BarChart2, label: t('sidebar.analytics') },
    { id: 'bookmarks', Icon: Bookmark, label: t('sidebar.bookmarks') },
    { id: 'reports', Icon: FileText, label: t('sidebar.reports') },
  ];

  const adminNav = [
    { id: 'overview', Icon: Home, label: t('sidebar.dashboard') },
    { id: 'users', Icon: Users, label: t('sidebar.userManagement') },
    { id: 'system-api', Icon: Globe, label: t('sidebar.apiMonitoring') },
    { id: 'database', Icon: Database, label: t('sidebar.database') },
    { id: 'sync-data', Icon: RefreshCw, label: t('sidebar.syncData') },
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
    <aside className="w-60 flex flex-col border-r h-screen sticky top-0 shrink-0 bg-white dark:bg-[#131A2A] border-gray-200 dark:border-white/5 transition-colors duration-300">
      <div
        onClick={() => navigate(`/${role}/overview`)}
        className="p-5 border-b border-gray-200 dark:border-white/5 flex items-center gap-3 cursor-pointer hover:opacity-80 transition-all"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-md bg-gradient-to-br from-blue-500 via-purple-500 to-teal-400"
        >
          <Microscope size={14} className="text-white" />
        </div>
        <div>
          <div className="text-xs font-black text-gray-900 dark:text-white tracking-widest font-outfit">
            {t('app.name')}
          </div>
          <div className="text-[10px] mt-0.5 text-gray-500 dark:text-[#A0AEC0]">
            {role === 'admin' ? t('app.adminConsole') : t('app.researchPlatform')}
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
                  ? 'bg-blue-50 dark:bg-[#4F8CFF]/10 text-blue-600 dark:text-[#4F8CFF] border-blue-600 dark:border-[#4F8CFF]'
                  : 'border-transparent text-gray-600 dark:text-[#A0AEC0] hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-white/5 space-y-3">
        {/* Language Switcher */}
        <LanguageSwitcher variant="sidebar" />

        <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-[#1B2235] border border-gray-100 dark:border-transparent transition-colors">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 shadow-sm bg-gradient-to-br from-blue-500 via-purple-500 to-teal-400"
          >
            {getInitials(user?.fullName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">
              {user ? user.fullName : t('sidebar.loading')}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="text-[10px] truncate text-gray-500 dark:text-[#A0AEC0]">
                {user ? role.toUpperCase() : t('sidebar.pleaseWait')}
              </div>
              {user && user.isVerified === false && (
                <div className="flex items-center gap-0.5 text-[8px] font-bold text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-500/10 px-1 py-0.5 rounded">
                  <AlertTriangle size={8} /> {t('status.unverified')}
                </div>
              )}
            </div>
          </div>
          <Settings
            size={14}
            className="cursor-pointer text-gray-400 hover:text-gray-900 dark:text-[#A0AEC0] dark:hover:text-white transition-colors hover:rotate-90 duration-300"
            onClick={() => navigate(`/${role}/settings`)}
          />
        </div>

        <button
          onClick={() => {
            sessionStorage.removeItem('userRole');
            navigate('/login');
          }}
          className="w-full text-xs py-2.5 rounded-lg font-bold transition-all bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-[#A0AEC0] hover:bg-red-500 dark:hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20"
        >
          {t('sidebar.signOut')}
        </button>
      </div>
    </aside>
  );
}

// 2. TOPBAR
function TopBar({ title, subtitle }) {
  const { t } = useTranslation('common');
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b shrink-0 bg-white dark:bg-[#0B1020] border-gray-200 dark:border-white/5 transition-colors duration-300">
      <div>
        <h1
          className="text-base font-black text-gray-900 dark:text-white font-display"
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs mt-0.5 text-gray-500 dark:text-[#A0AEC0]">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-4">
        {/* Search bar */}
        <div className="relative hidden md:block">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#A0AEC0]"
          />
          <input
            type="text"
            placeholder={t('topbar.searchPlaceholder')}
            className="pl-8 pr-4 py-2 rounded-lg text-xs outline-none w-52 border transition-all focus:border-[#4F8CFF] bg-gray-100 dark:bg-[#1B2235] border-gray-200 dark:border-white/10 text-gray-900 dark:text-[#E2E8F0]"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:scale-105 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-[#A0AEC0] hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/20"
          title={resolvedTheme === 'dark' ? t('topbar.switchToLight') : t('topbar.switchToDark')}
        >
          {resolvedTheme === 'dark' ? (
            <Sun size={16} />
          ) : (
            <Moon size={16} />
          )}
        </button>

        {/* Notification Bell */}
        <NotificationBell />
      </div>
    </header>
  );
}

// 3. DASHBOARD LAYOUT
export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('dashboard');

  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

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
        console.error('Cannot fetch user profile:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const titles = {
    overview: {
      title: role === 'admin' ? t('headings.systemDashboard') : t('headings.researchOverview'),
      sub: role === 'admin' ? t('subtitles.adminOverview') : t('subtitles.userOverview'),
    },
    search: {
      title: t('headings.searchPapers'),
      sub: t('subtitles.search'),
    },
    analytics: { title: t('headings.analytics'), sub: t('subtitles.analytics') },
    reports: { title: t('headings.reports'), sub: t('subtitles.reports') },
    bookmarks: {
      title: t('headings.bookmarks'),
      sub: t('subtitles.bookmarks'),
    },
    users: { title: t('headings.userManagement'), sub: t('subtitles.userManagement') },
    'system-api': {
      title: t('headings.apiMonitoring'),
      sub: t('subtitles.apiMonitoring'),
    },
    database: {
      title: t('headings.database'),
      sub: t('subtitles.database'),
    },
    'sync-data': {
      title: t('headings.syncData'),
      sub: t('subtitles.syncData'),
    },
    settings: { title: t('headings.settings'), sub: t('subtitles.settings') },
  };

  const currentHeader = titles[activeTab] || {
    title: t('headings.dashboard'),
    sub: t('subtitles.welcomeBack'),
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0B1020] transition-colors duration-300">
      <Sidebar
        role={role}
        activeTab={activeTab}
        navigate={navigate}
        user={user}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          title={currentHeader.title}
          subtitle={currentHeader.sub}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {children}
        </main>
        <SyncFloatingPanel />
      </div>
    </div>
  );
}
