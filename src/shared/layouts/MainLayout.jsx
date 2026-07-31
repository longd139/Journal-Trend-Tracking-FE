import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import ThemeToggle from '../../components/common/ThemeToggle';
import SyncFloatingPanel from '../../features/admin/SyncFloatingPanel';
import KeepAlive from '../../components/KeepAlive';
import NotificationBell from '../../features/notifications/NotificationBell';
import {
  Home,
  Search,
  FileText,
  Users,
  Database,
  Settings,
  Bookmark,
  History,
  Bell,
  BellRing,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Sliders,
  Flag,
  Menu,
  X,
  Lightbulb,
  Sun,
  Moon,
  GitBranch,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { userAPI } from '../../features/user/api';
import { useAuthStore } from '../../features/user/store';
import { useNotificationStore } from '../../store/useNotificationStore';
import ScitrackSLogo from '../../components/prisma/ScitrackSLogo';
import { useTheme } from '../../hooks/useTheme';

/* ═══════════════════════════════════════════════════════════════════════════
   Sidebar
   ═══════════════════════════════════════════════════════════════════════════ */

function Sidebar({ role, activeTab, navigate, user, open, onClose, unreadCount = 0, pdfPendingCount = 0 }) {
  const { t } = useTranslation('common');
  const clearTokens = useAuthStore((s) => s.clearTokens);

  const academicNav = [
    { id: 'overview', Icon: Home, label: t('sidebar.overview') },
    { id: 'search', Icon: Search, label: t('sidebar.searchPapers') },
    { id: 'gap-explorer', Icon: GitBranch, label: t('sidebar.gapExplorer') },
    { id: 'bookmarks', Icon: Bookmark, label: t('sidebar.bookmarks') },
    { id: 'reading-history', Icon: History, label: t('sidebar.readingHistory') },
    { id: 'follows', Icon: Bell, label: t('sidebar.follows') },
    { id: 'notifications', Icon: BellRing, label: t('sidebar.notifications') },
  ];

  const researcherNav = [
    { id: 'overview', Icon: Home, label: t('sidebar.overview') },
    { id: 'search', Icon: Search, label: t('sidebar.searchPapers') },
    { id: 'gap-explorer', Icon: GitBranch, label: t('sidebar.gapExplorer') },
    { id: 'bookmarks', Icon: Bookmark, label: t('sidebar.bookmarks') },
    { id: 'reading-history', Icon: History, label: t('sidebar.readingHistory') },
    { id: 'follows', Icon: Bell, label: t('sidebar.follows') },
    { id: 'notifications', Icon: BellRing, label: t('sidebar.notifications') },
  ];

  const adminNav = [
    { id: 'overview', Icon: Home, label: t('sidebar.dashboard') },
    { id: 'users', Icon: Users, label: t('sidebar.userManagement') },
    { id: 'database', Icon: Database, label: t('sidebar.database') },
    { id: 'sync-data', Icon: RefreshCw, label: t('sidebar.syncData') },
    { id: 'pdf-requests', Icon: FileText, label: t('sidebar.pdfRequests') },
    { id: 'admin-notifications', Icon: BellRing, label: t('sidebar.notifications') },
    { id: 'audit-logs', Icon: ShieldCheck, label: t('sidebar.auditLogs') },
    { id: 'configs', Icon: Sliders, label: t('sidebar.configs') },
  ];

  let nav = academicNav;
  if (role === 'admin') nav = adminNav;
  if (role === 'researcher') nav = researcherNav;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-60 flex flex-col border-r bg-sidebar/95 backdrop-blur-sm border-sidebar-border transition-transform duration-300 lg:sticky lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Logo */}
      <div
        onClick={() => navigate(`/${role}/overview`)}
        className="p-5 border-b border-sidebar-border flex items-center gap-3 cursor-pointer hover:opacity-80 transition-all"
      >
        <div className="flex items-center gap-0.5">
          <ScitrackSLogo className="text-sidebar-primary -mr-1 w-6 h-8" />
          <span className="text-xs font-black text-sidebar-foreground tracking-[0.05em] font-outfit">
            CITRACK
          </span>
        </div>
        <div className="text-[10px] text-muted-foreground">
          {role === 'admin' ? t('app.adminConsole') : t('app.researchPlatform')}
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-sidebar-foreground hover:bg-muted transition-all"
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
                  ? 'bg-sidebar-primary/10 text-sidebar-primary border-sidebar-primary'
                  : 'border-transparent text-muted-foreground hover:bg-muted hover:text-sidebar-foreground'
              }`}
            >
              <Icon size={15} />
              {label}
              {((id === 'notifications') || (id === 'admin-notifications')) && unreadCount > 0 && (
                <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              {id === 'pdf-requests' && pdfPendingCount > 0 && (
                <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                  {pdfPendingCount > 99 ? '99+' : pdfPendingCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        {/* Sign out */}
        <button
          onClick={() => {
            sessionStorage.removeItem('userRole');
            // Clear persisted search queries so next user sees clean state
            sessionStorage.removeItem('scitrack_papers_query');
            sessionStorage.removeItem('scitrack_journal_query');
            sessionStorage.removeItem('scitrack_author_query');
            sessionStorage.removeItem('scitrack_referrer');
            clearTokens();
            toast.success(t('toast.signedOut', 'Signed out successfully'), { duration: 3000 });
            navigate('/login');
          }}
         className="w-full text-xs py-2.5 rounded-lg font-bold transition-all bg-foreground/5 text-muted-foreground hover:bg-red-500 hover:text-foreground"
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

function TopBar({ title, subtitle, onMenuClick, user, role, navigate }) {
  const { t } = useTranslation('common');
  const { resolvedTheme, setTheme } = useTheme();

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b shrink-0 bg-background/80 backdrop-blur-sm border-border relative z-50">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-sm sm:text-base font-black text-foreground font-display">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] sm:text-xs mt-0.5 text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Language Switcher — hidden */}
        {/* <LanguageSwitcher /> */}

        {/* Notification Bell */}
        <NotificationBell />

        {/* User avatar + settings */}
        <button
          onClick={() => navigate(`/${role}/settings`)}
          className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border transition-all bg-card/80 border-border hover:border-ring/30 hover:bg-card group"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-primary-foreground shrink-0 bg-primary overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              getInitials(user?.fullName)
            )}
          </div>
          <div className="hidden sm:block text-left min-w-0 max-w-[120px]">
            <div className="text-xs font-semibold text-foreground truncate">
              {user ? user.fullName : t('sidebar.loading')}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="text-[10px] truncate text-muted-foreground">
                {user ? role.toUpperCase() : t('sidebar.pleaseWait')}
              </div>
              {user && user.isActive === false && (
                <div className="flex items-center gap-0.5 text-[8px] font-bold text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded">
                  <AlertTriangle size={8} /> {t('status.unverified')}
                </div>
              )}
            </div>
          </div>
          <Settings
            size={14}
            className="text-muted-foreground group-hover:text-foreground transition-colors group-hover:rotate-90 duration-300 shrink-0"
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
  const backgroundUrl = useAuthStore((s) => s.backgroundUrl);
  const backgroundColor = useAuthStore((s) => s.backgroundColor);

  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);
  const pdfPendingCount = useNotificationStore((s) => s.pdfPendingCount);
  const fetchPdfPendingCount = useNotificationStore((s) => s.fetchPdfPendingCount);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pathParts = location.pathname.split('/').filter(Boolean);
  // Use the second segment as activeTab (first is roleName)
  // e.g. /academic/search → 'search', /academic/papers/123 → 'papers'
  const activeTab = pathParts[1] || 'overview';
  const role = sessionStorage.getItem('userRole') || 'academic';

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Poll unread notification count every 30s (researcher / academic only)
  const intervalRef = useRef(null);
  useEffect(() => {
    if (role === 'admin') return;
    fetchUnreadCount();
    intervalRef.current = setInterval(fetchUnreadCount, 30_000);
    return () => clearInterval(intervalRef.current);
  }, [role, fetchUnreadCount]);

  // Poll PDF pending count every 30s (admin only)
  const pdfIntervalRef = useRef(null);
  useEffect(() => {
    if (role !== 'admin') return;
    fetchPdfPendingCount();
    pdfIntervalRef.current = setInterval(fetchPdfPendingCount, 30_000);
    return () => clearInterval(pdfIntervalRef.current);
  }, [role, fetchPdfPendingCount]);

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
    reports: { title: t('headings.reports'), sub: t('subtitles.reports') },
    'my-reports': { title: t('headings.myReports'), sub: t('subtitles.myReports') },
    ideas: { title: t('headings.idea'), sub: t('subtitles.idea') },
    'gap-explorer': { title: t('headings.gapExplorer'), sub: t('subtitles.gapExplorer') },
    bookmarks: {
      title: t('headings.bookmarks'),
      sub: t('subtitles.bookmarks'),
    },
    'reading-history': {
      title: t('headings.readingHistory'),
      sub: t('subtitles.readingHistory'),
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
    'pdf-requests': {
      title: t('headings.pdfRequests'),
      sub: t('subtitles.pdfRequests'),
    },
    'admin-notifications': {
      title: t('headings.adminNotifications'),
      sub: t('subtitles.adminNotifications'),
    },
    papers: {
      title: t('headings.paperDetails'),
      sub: t('subtitles.paperDetails'),
    },
  };

  // Map route segments to sidebar highlights (e.g. papers → search)
  const sidebarActiveTab = activeTab === 'papers' ? 'search' : activeTab;

  const currentHeader = titles[activeTab] || {
    title: t('headings.dashboard'),
    sub: t('subtitles.welcomeBack'),
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        role={role}
        activeTab={sidebarActiveTab}
        navigate={navigate}
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadCount={unreadCount}
        pdfPendingCount={pdfPendingCount}
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
        <div className="flex-1 relative overflow-hidden bg-background">
          {/* Background — solid color (instant), then image, otherwise default video */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {backgroundColor ? (
              <div
                className="absolute inset-0 w-full h-full"
                style={{ background: backgroundColor, opacity: 0.15 }}
              />
            ) : backgroundUrl ? (
              <img
                src={backgroundUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-[0.15]"
              />
            ) : (
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-[0.12]"
                src="https://videos.pexels.com/video-files/5192068/5192068-uhd_1440_2732_25fps.mp4"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/80" />
            <div className="noise-overlay absolute inset-0 opacity-[0.04]" style={{ mixBlendMode: 'overlay' }} />
          </div>
          <main className="h-full overflow-y-auto overflow-x-hidden relative z-10">
            <KeepAlive />
          </main>
        </div>
        <SyncFloatingPanel />
      </div>
    </div>
  );
}
