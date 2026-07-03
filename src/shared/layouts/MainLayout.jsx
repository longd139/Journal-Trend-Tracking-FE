import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import SyncFloatingPanel from '../../features/admin/SyncFloatingPanel';
import {
  BarChart3,
  Home,
  Search,
  BookOpen,
  UserSearch,
  FileText,
  Users,
  Globe,
  Database,
  Settings,
  Bookmark,
  Bell,
  BellRing,
  AlertTriangle,
  Sun,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sliders,
  Cloud,
  Menu,
  X,
  HelpCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { userAPI } from '../../features/user/api';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../features/user/store';
import ScitrackSLogo from '../../components/prisma/ScitrackSLogo';
import SupportDialog from '../../components/common/SupportDialog';

/* ═══════════════════════════════════════════════════════════════════════════
   Sidebar
   ═══════════════════════════════════════════════════════════════════════════ */

function Sidebar({ role, activeTab, navigate, user, open, onClose }) {
  const { t } = useTranslation('common');
  const [supportOpen, setSupportOpen] = useState(false);

  const academicNav = [
    { id: 'overview', Icon: Home, label: t('sidebar.overview') },
    { id: 'search', Icon: Search, label: t('sidebar.searchPapers') },
    { id: 'journal-search', Icon: BookOpen, label: t('sidebar.searchJournals') },
    { id: 'search-author', Icon: UserSearch, label: t('sidebar.searchAuthor') },
    { id: 'analytics', Icon: BarChart3, label: t('sidebar.analytics') },
    { id: 'bookmarks', Icon: Bookmark, label: t('sidebar.bookmarks') },
    { id: 'follows', Icon: Bell, label: t('sidebar.follows') },
    { id: 'notifications', Icon: BellRing, label: t('sidebar.notifications') },
    { id: 'reports', Icon: FileText, label: t('sidebar.reports') },
  ];

  const researcherNav = [
    { id: 'overview', Icon: Home, label: t('sidebar.overview') },
    { id: 'search', Icon: Search, label: t('sidebar.searchPapers') },
    { id: 'journal-search', Icon: BookOpen, label: t('sidebar.searchJournals') },
    { id: 'search-author', Icon: UserSearch, label: t('sidebar.searchAuthor') },
    { id: 'analytics', Icon: BarChart3, label: t('sidebar.analytics') },
    { id: 'bookmarks', Icon: Bookmark, label: t('sidebar.bookmarks') },
    { id: 'follows', Icon: Bell, label: t('sidebar.follows') },
    { id: 'notifications', Icon: BellRing, label: t('sidebar.notifications') },
    { id: 'reports', Icon: FileText, label: t('sidebar.reports') },
  ];

  const adminNav = [
    { id: 'overview', Icon: Home, label: t('sidebar.dashboard') },
    { id: 'users', Icon: Users, label: t('sidebar.userManagement') },
    { id: 'system-api', Icon: Globe, label: t('sidebar.apiMonitoring') },
    { id: 'database', Icon: Database, label: t('sidebar.database') },
    { id: 'sync-data', Icon: RefreshCw, label: t('sidebar.syncData') },
    { id: 'audit-logs', Icon: ShieldCheck, label: t('sidebar.auditLogs') },
    { id: 'configs', Icon: Sliders, label: t('sidebar.configs') },
    { id: 'data-sources', Icon: Cloud, label: t('sidebar.dataSources') },
  ];

  let nav = academicNav;
  if (role === 'admin') nav = adminNav;
  if (role === 'researcher') nav = researcherNav;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-60 flex flex-col border-r bg-black/60 backdrop-blur-sm border-[#DEDBC8]/10 transition-transform duration-300 lg:sticky lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
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
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden ml-auto p-1.5 rounded-lg text-gray-400 hover:text-[#E1E0CC] hover:bg-white/5 transition-all"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ id, Icon, label }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => { navigate(`/${role}/${id}`); onClose(); }}
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
        {/* Support */}
        <button
          onClick={() => setSupportOpen(true)}
          className="w-full flex items-center justify-center gap-2 text-xs py-2.5 rounded-lg font-bold transition-all bg-[#DEDBC8]/5 text-gray-400 hover:bg-[#DEDBC8]/15 hover:text-[#E1E0CC]"
        >
          <HelpCircle size={14} />
          {t('sidebar.support')}
        </button>

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

      {/* Support Dialog */}
      <SupportDialog
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
        role={role}
      />
    </aside>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TopBar
   ═══════════════════════════════════════════════════════════════════════════ */

function TopBar({ title, subtitle, onMenuClick, user, role, navigate }) {
  const { t } = useTranslation('common');
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b shrink-0 bg-black/40 backdrop-blur-sm border-[#DEDBC8]/10 relative z-50">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-[#E1E0CC] hover:bg-white/5 transition-all"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-sm sm:text-base font-black text-[#E1E0CC] font-display">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] sm:text-xs mt-0.5 text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <LanguageSwitcher />

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

        {/* User avatar + settings */}
        <button
          onClick={() => navigate(`/${role}/settings`)}
          className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border transition-all bg-[#101010]/80 border-[#DEDBC8]/10 hover:border-[#DEDBC8]/25 hover:bg-[#101010] group"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-black shrink-0 bg-[#DEDBC8] overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              getInitials(user?.fullName)
            )}
          </div>
          <div className="hidden sm:block text-left min-w-0 max-w-[120px]">
            <div className="text-xs font-semibold text-[#E1E0CC] truncate">
              {user ? user.fullName : t('sidebar.loading')}
            </div>
            <div className="flex items-center gap-1.5">
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
            className="text-gray-500 group-hover:text-[#E1E0CC] transition-colors group-hover:rotate-90 duration-300 shrink-0"
          />
        </button>
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

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pathParts = location.pathname.split('/');
  const activeTab = pathParts[pathParts.length - 1] || 'overview';
  const role = sessionStorage.getItem('userRole') || 'academic';

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

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
    'journal-search': {
      title: t('headings.searchJournals'),
      sub: t('subtitles.searchJournals'),
    },
    'search-author': {
      title: t('headings.searchAuthor'),
      sub: t('subtitles.searchAuthor'),
    },
    reports: { title: t('headings.reports'), sub: t('subtitles.reports') },
    analytics: { title: t('headings.analytics'), sub: t('subtitles.analytics') },
    bookmarks: {
      title: t('headings.bookmarks'),
      sub: t('subtitles.bookmarks'),
    },
    follows: {
      title: t('headings.follows'),
      sub: t('subtitles.follows'),
    },
    notifications: {
      title: t('headings.notifications'),
      sub: t('subtitles.notifications'),
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
    'audit-logs': {
      title: t('headings.auditLogs'),
      sub: t('subtitles.auditLogs'),
    },
    configs: {
      title: t('headings.configs'),
      sub: t('subtitles.configs'),
    },
    'data-sources': {
      title: t('headings.dataSources'),
      sub: t('subtitles.dataSources'),
    },
  };

  const currentHeader = titles[activeTab] || {
    title: t('headings.dashboard'),
    sub: t('subtitles.welcomeBack'),
  };

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        role={role}
        activeTab={activeTab}
        navigate={navigate}
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          title={currentHeader.title}
          subtitle={currentHeader.sub}
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
          role={role}
          navigate={navigate}
        />
        {/* Content area with fixed background video (below TopBar) */}
        <div className="flex-1 relative overflow-hidden">
          {/* Background video — stays fixed while content scrolls */}
          <div className="absolute inset-0 pointer-events-none z-0">
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
          <main className="h-full overflow-y-auto overflow-x-hidden relative z-10">
            {children}
          </main>
        </div>
        <SyncFloatingPanel />
      </div>
    </div>
  );
}
