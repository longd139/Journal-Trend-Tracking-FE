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
  Settings,
  Bookmark,
  AlertTriangle,
  Sun,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sliders,
  Cloud,
} from 'lucide-react';
import { useEffect } from 'react';
import { userAPI } from '../lib/api/user.api';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/useAuthStore';
import ScitrackSLogo from '../components/prisma/ScitrackSLogo';

/* ═══════════════════════════════════════════════════════════════════════════
   Sidebar
   ═══════════════════════════════════════════════════════════════════════════ */

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
    { id: 'audit-logs', Icon: ShieldCheck, label: 'Audit Logs' },
    { id: 'configs', Icon: Sliders, label: 'Configs' },
    { id: 'data-sources', Icon: Cloud, label: 'Data Sources' },
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
    <aside className="w-60 flex flex-col border-r h-screen sticky top-0 shrink-0 bg-black/60 backdrop-blur-sm border-[#DEDBC8]/10">
      {/* Logo */}
      <div
        onClick={() => navigate(`/${role}/overview`)}
        className="p-5 border-b border-[#DEDBC8]/10 flex items-center gap-3 cursor-pointer hover:opacity-80 transition-all"
      >
        <div className="flex items-center gap-0.5">
          <ScitrackSLogo className="text-[#DEDBC8] -mr-1 w-6 h-8" />
          <span className="text-xs font-black text-[#E1E0CC] tracking-[0.05em] font-outfit">
            CITRACK
          </span>
        </div>
        <div className="text-[10px] text-gray-400">
          {role === 'admin' ? t('app.adminConsole') : t('app.researchPlatform')}
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ id, Icon, label }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => navigate(`/${role}/${id}`)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left border-l-2 ${
                active
                  ? 'bg-[#DEDBC8]/10 text-[#DEDBC8] border-[#DEDBC8]'
                  : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-[#E1E0CC]'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-[#DEDBC8]/10 space-y-3">
        {/* Language Switcher */}
        <LanguageSwitcher variant="sidebar" />

        {/* User card */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-[#101010] border border-[#DEDBC8]/5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-black shrink-0 bg-[#DEDBC8]">
            {getInitials(user?.fullName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[#E1E0CC] truncate">
              {user ? user.fullName : t('sidebar.loading')}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="text-[10px] truncate text-gray-400">
                {user ? role.toUpperCase() : t('sidebar.pleaseWait')}
              </div>
              {user && user.isVerified === false && (
                <div className="flex items-center gap-0.5 text-[8px] font-bold text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded">
                  <AlertTriangle size={8} /> {t('status.unverified')}
                </div>
              )}
            </div>
          </div>
          <Settings
            size={14}
            className="cursor-pointer text-gray-400 hover:text-[#E1E0CC] transition-colors hover:rotate-90 duration-300"
            onClick={() => navigate(`/${role}/settings`)}
          />
        </div>

        {/* Sign out */}
        <button
          onClick={() => {
            sessionStorage.removeItem('userRole');
            navigate('/login');
          }}
          className="w-full text-xs py-2.5 rounded-lg font-bold transition-all bg-white/5 text-gray-400 hover:bg-red-500 hover:text-white"
        >
          {t('sidebar.signOut')}
        </button>
      </div>
    </aside>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TopBar
   ═══════════════════════════════════════════════════════════════════════════ */

function TopBar({ title, subtitle }) {
  const { t } = useTranslation('common');
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b shrink-0 bg-black/40 backdrop-blur-sm border-[#DEDBC8]/10">
      <div>
        <h1 className="text-base font-black text-[#E1E0CC] font-display">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs mt-0.5 text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:scale-105 bg-[#DEDBC8]/10 text-gray-400 hover:text-[#E1E0CC] hover:bg-[#DEDBC8]/20"
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

/* ═══════════════════════════════════════════════════════════════════════════
   DashboardLayout
   ═══════════════════════════════════════════════════════════════════════════ */

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
    <div className="flex h-screen overflow-hidden bg-black">
      <Sidebar
        role={role}
        activeTab={activeTab}
        navigate={navigate}
        user={user}
      />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopBar
          title={currentHeader.title}
          subtitle={currentHeader.sub}
        />
        {/* Background video — stays fixed while content scrolls */}
        <div className="absolute inset-0 top-0 pointer-events-none z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-[0.12]"
            src="https://videos.pexels.com/video-files/5192068/5192068-uhd_1440_2732_25fps.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80" />
          <div className="noise-overlay absolute inset-0 opacity-[0.04]" style={{ mixBlendMode: 'overlay' }} />
        </div>
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10">
          {children}
        </main>
        <SyncFloatingPanel />
      </div>
    </div>
  );
}
