import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCheck,
  Trash2,
  MessageSquare,
  TrendingUp,
  ShieldAlert,
  FileText,
  RefreshCw,
  Inbox,
  Clock,
  UserCheck,
  BellRing,
  Lock,
} from 'lucide-react';
import { notificationAPI } from './api';
import { adminAPI } from '../admin/api';
import { paperAPI } from '../search/paper.api';
import { UpgradeRequestDialog } from '../user/UpgradeRequestDialog';
import { useNotificationStore } from '../../store/useNotificationStore';
import NotificationDetailDialog from './NotificationDetailDialog';

/* ═══════════════════════════════════════════════════════════════════════════
   Type → icon + color mapping
   ═══════════════════════════════════════════════════════════════════════════ */

const ICON_MAP = {
  new_paper: FileText,
  citations: MessageSquare,
  trend: TrendingUp,
  system: FileText,
  security: ShieldAlert,
  sync: RefreshCw,
  upgrade_prompt: UserCheck,
};

const COLOR_MAP = {
  new_paper: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  citations: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  trend: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  system: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  security: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  sync: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  upgrade_prompt: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
};

function normalizeNotif(api) {
  return {
    id: api.notifId,
    type: api.type || 'system',
    title: api.title || '',
    desc: api.message || '',
    detail: api.message || '',
    relatedPaperId: api.relatedPaperId,
    relatedPaperTitle: api.relatedPaperTitle,
    relatedJournalId: api.relatedJournalId,
    relatedJournalName: api.relatedJournalName,
    relatedTopicId: api.relatedTopicId,
    relatedTopicName: api.relatedTopicName,
    relatedKeywordId: api.relatedKeywordId,
    relatedKeywordText: api.relatedKeywordText,
    read: api.isRead === true,
    timestamp: api.createdAt ? new Date(api.createdAt).getTime() : Date.now(),
    rawCreatedAt: api.createdAt,
    actionable: !!api.relatedPaperId,
  };
}

function formatRelativeTime(notif, t) {
  if (notif.rawCreatedAt) {
    try {
      const d = new Date(notif.rawCreatedAt);
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return t('notifications.justNow');
      if (diffMins < 60) return t('notifications.minutesAgo', { count: diffMins });
      if (diffHours < 24) return t('notifications.hoursAgo', { count: diffHours });
      if (diffDays < 7) return t('notifications.daysAgo', { count: diffDays });
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      // fall through
    }
  }
  if (notif.timestamp) {
    const diff = Date.now() - notif.timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('notifications.justNow');
    if (mins < 60) return t('notifications.minutesAgo', { count: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t('notifications.hoursAgo', { count: hours });
    const days = Math.floor(hours / 24);
    if (days < 7) return t('notifications.daysAgo', { count: days });
    return new Date(notif.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return '';
}

/* ═══════════════════════════════════════════════════════════════════════════
   Notification Card
   ═══════════════════════════════════════════════════════════════════════════ */

function NotificationCard({ notif, onClick, onDismiss }) {
  const { t } = useTranslation('common');
  const colors = COLOR_MAP[notif.type] || COLOR_MAP.system;
  const Icon = ICON_MAP[notif.type] || FileText;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 60, transition: { duration: 0.2 } }}
      onClick={() => onClick(notif)}
      className={`group relative p-5 rounded-2xl cursor-pointer transition-all duration-300 border ${
        !notif.read
          ? 'bg-primary/[0.06] border-primary/30 shadow-sm'
          : 'bg-card border-primary/15 hover:bg-primary/[0.03] hover:border-primary/25'
      }`}
    >
      {!notif.read && (
        <div className="absolute top-3.5 left-5 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
      )}

      <div className="flex items-start gap-4">
        <div className={`mt-0.5 w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colors.bg}`}>
          <Icon size={20} className={colors.text} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h4
              className={`text-sm font-bold truncate ${
                !notif.read ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {notif.title}
            </h4>
            <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap flex items-center gap-1">
              <Clock size={10} />
              {formatRelativeTime(notif, t)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{notif.desc}</p>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(notif.id);
        }}
        className="absolute bottom-4 right-4 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Skeleton
   ═══════════════════════════════════════════════════════════════════════════ */

function NotificationSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-primary/15 bg-card p-5 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/8" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 bg-primary/8 rounded" />
              <div className="h-3 w-full bg-primary/5 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════════════════════════════════ */

export default function NotificationsPage() {
  const { t } = useTranslation('common');
  const [dialogNotif, setDialogNotif] = useState(null);
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Sync with global store so sidebar badge updates instantly
  const setStoreUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  const userRole = sessionStorage.getItem('userRole');
  const isAcademic = userRole === 'academic_user' || userRole === 'academic';
  const [searchesLeft, setSearchesLeft] = useState(null);
  const quotaExhausted = isAcademic && searchesLeft === 0;
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    if (!isAcademic) return;
    (async () => {
      try {
        const data = await paperAPI.getUsage();
        if (data?.remainingSearches != null) setSearchesLeft(data.remainingSearches);
      } catch { /* silently ignore */ }
    })();
  }, [isAcademic]);
  const isAdmin = userRole === 'admin';

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const list = await notificationAPI.getNotifications({ page: 0, size: 50 });
      setNotifs(Array.isArray(list) ? list.map(normalizeNotif) : []);
    } catch {
      // keep current
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await notificationAPI.getUnreadCount();
      const count = result?.unreadCount ?? 0;
      setUnreadCount(count);
      setStoreUnreadCount(count);
    } catch {
      // silent
    }
  }, [setStoreUnreadCount]);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Auto-refresh polling
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchNotifications(true);
      fetchUnreadCount();
    }, 30000); // every 30s
    return () => clearInterval(interval);
  }, [autoRefresh, fetchNotifications, fetchUnreadCount]);

  /* Admin sync notification */
  useEffect(() => {
    if (!isAdmin) return;
    const fetchSyncNotif = async () => {
      try {
        const response = await adminAPI.getSyncNotification();
        const notifData = response?.data || response;
        if (notifData && Object.keys(notifData).length > 0) {
          const fields = Object.entries(notifData)
            .map(([k, v]) => `${k}: ${v}`)
            .join(' · ');
          setNotifs((prev) => {
            const others = prev.filter((n) => n.type !== 'sync' || n.read);
            return [
              {
                id: `sync-${Date.now()}`,
                type: 'sync',
                title: response?.message || 'Sync Update',
                desc: fields || 'Sync notification received',
                detail: Object.entries(notifData)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join('\n'),
                read: false,
                timestamp: Date.now(),
                actionable: false,
              },
              ...others,
            ];
          });
        }
      } catch {
        // silent
      }
    };
    fetchSyncNotif();
    const interval = setInterval(fetchSyncNotif, 60000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const filteredNotifs = filter === 'unread' ? notifs.filter((n) => !n.read) : notifs;

  // Group notifications by date
  const groupedNotifs = (() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const weekAgo = new Date(today.getTime() - 7 * 86400000);

    const groups = { [t('notifications.today')]: [], [t('notifications.yesterday')]: [], [t('notifications.thisWeek')]: [], [t('notifications.earlier')]: [] };

    filteredNotifs.forEach((n) => {
      const d = n.rawCreatedAt ? new Date(n.rawCreatedAt) : new Date(n.timestamp);
      const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());

      if (dateOnly.getTime() >= today.getTime()) {
        groups[t('notifications.today')].push(n);
      } else if (dateOnly.getTime() >= yesterday.getTime()) {
        groups[t('notifications.yesterday')].push(n);
      } else if (dateOnly.getTime() >= weekAgo.getTime()) {
        groups[t('notifications.thisWeek')].push(n);
      } else {
        groups[t('notifications.earlier')].push(n);
      }
    });

    // Remove empty groups
    return Object.entries(groups).filter(([, items]) => items.length > 0);
  })();

  const markAsRead = async (id) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => {
      const next = Math.max(0, c - 1);
      setStoreUnreadCount(next);
      return next;
    });
    try { await notificationAPI.markAsRead(id); } catch { /* revert on next fetch */ }
  };

  const markAllAsRead = async () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    setStoreUnreadCount(0);
    try { await notificationAPI.markAllAsRead(); } catch { /* revert on next fetch */ }
  };

  const dismissNotif = async (id) => {
    const notif = notifs.find((n) => n.id === id);
    setNotifs((prev) => prev.filter((n) => n.id !== id));
    if (notif && !notif.read) {
      setUnreadCount((c) => {
        const next = Math.max(0, c - 1);
        setStoreUnreadCount(next);
        return next;
      });
    }
    try { await notificationAPI.deleteNotification(id); } catch { /* revert on next fetch */ }
  };

  const handleSelect = (notif) => {
    setDialogNotif(notif);
    if (!notif.read) markAsRead(notif.id);
  };

  const handleSearchKeyword = (keyword) => {
    setDialogNotif(null);
    const rawRole = sessionStorage.getItem('userRole') || 'researcher';
    const role = rawRole === 'academic' ? 'academic_user' : rawRole;
    navigate(`/${role}/search?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="relative min-h-screen bg-transparent">
      {/* Lock overlay when quota exhausted */}
      {quotaExhausted && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center space-y-4 px-6 py-10 rounded-2xl border border-border bg-card max-w-sm">
            <Lock size={32} className="text-primary/40 mx-auto" />
            <div>
              <p className="text-sm font-semibold text-foreground">Search limit reached</p>
              <p className="text-xs text-muted-foreground mt-1">
                You have used all your monthly searches. Upgrade to Researcher to access notifications and all features.
              </p>
            </div>
            <button
              onClick={() => setUpgradeOpen(true)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-foreground transition-colors"
            >
              Upgrade to Researcher
            </button>
          </div>
        </div>
      )}
    <div className="p-6 sm:p-8 space-y-6 min-h-screen bg-transparent">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">{t('notifications.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0
              ? t('notifications.unreadSummary', { unread: unreadCount, total: notifs.length })
              : t('notifications.notificationCount', { count: notifs.length })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-refresh toggle */}
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
              autoRefresh
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'text-muted-foreground border-border hover:text-foreground hover:border-primary/20'
            }`}
            title={autoRefresh ? t('notifications.autoRefreshActive') : t('notifications.autoRefreshEnable')}
          >
            <RefreshCw size={12} className={autoRefresh ? 'animate-spin-slow' : ''} />
            {t('notifications.live')}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 border border-border transition-all"
            >
              <CheckCheck size={14} />
              {t('notifications.markAllRead')}
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 p-1 rounded-xl bg-muted/40 border border-border w-fit">
        {[
          { key: 'all', label: t('notifications.all') },
          { key: 'unread', label: `${t('notifications.unread')}${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => {
              setFilter(key);
              setSelectedNotif(null);
            }}
            className={`px-4 py-2 rounded-[10px] text-xs font-bold transition-all duration-300 ${
              filter === key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && <NotificationSkeleton />}

      {/* List — Grouped by date */}
      {!loading && filteredNotifs.length > 0 && (
        <div className="space-y-6">
          <AnimatePresence>
            {groupedNotifs.map(([group, items]) => (
              <div key={group} className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground px-1">
                  {group}
                </span>
                {items.map((n) => (
                  <NotificationCard
                    key={n.id}
                    notif={n}
                    onClick={handleSelect}
                    onDismiss={dismissNotif}
                  />
                ))}
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty */}
      {!loading && filteredNotifs.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 px-6"
        >
          <div className="w-20 h-20 rounded-full bg-muted/40 flex items-center justify-center mb-5">
            <Inbox size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1.5">
            {filter === 'unread' ? t('notifications.noUnreadTitle') : t('notifications.emptyTitle')}
          </h3>
          <p className="text-xs text-muted-foreground text-center max-w-[280px] leading-relaxed">
            {filter === 'unread'
              ? t('notifications.noUnreadDesc')
              : t('notifications.emptyDesc')}
          </p>
        </motion.div>
      )}
      <NotificationDetailDialog
        notif={dialogNotif}
        open={!!dialogNotif}
        onClose={() => setDialogNotif(null)}
        onSearchKeyword={handleSearchKeyword}
      />
    </div>

    {/* Upgrade Request Dialog */}
    <AnimatePresence>
      <UpgradeRequestDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </AnimatePresence>
    </div>
  );
}
