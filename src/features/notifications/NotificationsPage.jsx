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
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { notificationAPI } from './api';
import { adminAPI } from '../admin/api';

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

function formatRelativeTime(notif) {
  if (notif.rawCreatedAt) {
    try {
      const d = new Date(notif.rawCreatedAt);
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      // fall through
    }
  }
  if (notif.timestamp) {
    const diff = Date.now() - notif.timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(notif.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return '';
}

/* ═══════════════════════════════════════════════════════════════════════════
   Notification Card
   ═══════════════════════════════════════════════════════════════════════════ */

function NotificationCard({ notif, onClick, onDismiss }) {
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
          ? 'bg-[#DEDBC8]/[0.04] border-[#DEDBC8]/15'
          : 'bg-white/[0.02] border-transparent hover:bg-white/[0.05] hover:border-white/[0.06]'
      }`}
    >
      {!notif.read && (
        <div className="absolute top-3.5 left-5 w-2.5 h-2.5 rounded-full bg-[#DEDBC8] shadow-[0_0_8px_rgba(222,219,200,0.5)]" />
      )}

      <div className="flex items-start gap-4">
        <div className={`mt-0.5 w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colors.bg}`}>
          <Icon size={20} className={colors.text} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h4
              className={`text-sm font-bold truncate ${
                !notif.read ? 'text-[#E1E0CC]' : 'text-gray-400'
              }`}
            >
              {notif.title}
            </h4>
            <span className="text-[10px] font-medium text-gray-500 whitespace-nowrap flex items-center gap-1">
              <Clock size={10} />
              {formatRelativeTime(notif)}
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">{notif.desc}</p>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(notif.id);
        }}
        className="absolute bottom-4 right-4 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 text-gray-500 hover:text-red-400 hover:bg-red-500/10"
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Detail Sheet
   ═══════════════════════════════════════════════════════════════════════════ */

function DetailSheet({ notif, onClose, onViewPaper }) {
  const colors = COLOR_MAP[notif.type] || COLOR_MAP.system;
  const Icon = ICON_MAP[notif.type] || FileText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="rounded-2xl border border-[#DEDBC8]/10 bg-[#101010] p-6 space-y-5"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors.bg}`}>
            <Icon size={22} className={colors.text} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#E1E0CC]">{notif.title}</h3>
            <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
              <Clock size={10} />
              {formatRelativeTime(notif)}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
        >
          ✕
        </button>
      </div>

      <p className="text-sm text-gray-300 leading-relaxed">{notif.detail}</p>

      {/* Action buttons */}
      {notif.actionable && notif.relatedPaperId && (
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onViewPaper(notif.relatedPaperId)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-black bg-[#DEDBC8] hover:bg-[#DEDBC8]/90 active:scale-[0.97] transition-all duration-150"
          >
            <ExternalLink size={14} />
            View Paper
            <ArrowRight size={14} />
          </button>
          {notif.relatedPaperTitle && (
            <span className="text-xs text-gray-500 truncate max-w-[200px]">
              {notif.relatedPaperTitle}
            </span>
          )}
        </div>
      )}
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
        <div key={i} className="rounded-2xl border border-[#DEDBC8]/5 bg-[#101010] p-5 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#DEDBC8]/8" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 bg-[#DEDBC8]/8 rounded" />
              <div className="h-3 w-full bg-[#DEDBC8]/5 rounded" />
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
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const userRole = sessionStorage.getItem('userRole');
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
      setUnreadCount(result?.unreadCount ?? 0);
    } catch {
      // silent
    }
  }, []);

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

    const groups = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] };

    filteredNotifs.forEach((n) => {
      const d = n.rawCreatedAt ? new Date(n.rawCreatedAt) : new Date(n.timestamp);
      const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());

      if (dateOnly.getTime() >= today.getTime()) {
        groups['Today'].push(n);
      } else if (dateOnly.getTime() >= yesterday.getTime()) {
        groups['Yesterday'].push(n);
      } else if (dateOnly.getTime() >= weekAgo.getTime()) {
        groups['This Week'].push(n);
      } else {
        groups['Earlier'].push(n);
      }
    });

    // Remove empty groups
    return Object.entries(groups).filter(([, items]) => items.length > 0);
  })();

  const markAsRead = async (id) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try { await notificationAPI.markAsRead(id); } catch { /* revert on next fetch */ }
  };

  const markAllAsRead = async () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try { await notificationAPI.markAllAsRead(); } catch { /* revert on next fetch */ }
  };

  const dismissNotif = async (id) => {
    const notif = notifs.find((n) => n.id === id);
    setNotifs((prev) => prev.filter((n) => n.id !== id));
    if (notif && !notif.read) setUnreadCount((c) => Math.max(0, c - 1));
    if (selectedNotif?.id === id) setSelectedNotif(null);
    try { await notificationAPI.deleteNotification(id); } catch { /* revert on next fetch */ }
  };

  const handleSelect = (notif) => {
    setSelectedNotif(notif);
    if (!notif.read) markAsRead(notif.id);
  };

  const handleViewPaper = (paperId) => {
    const role = sessionStorage.getItem('userRole') || 'researcher';
    navigate(`/${role}/papers/${paperId}`);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 min-h-screen bg-transparent">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#E1E0CC]">{t('notifications.title')}</h2>
          <p className="text-sm text-gray-400">
            {unreadCount > 0
              ? `${unreadCount} unread · ${notifs.length} total`
              : `${notifs.length} notification${notifs.length !== 1 ? 's' : ''}`}
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
                : 'text-gray-400 border-[#DEDBC8]/10 hover:text-[#E1E0CC] hover:border-[#DEDBC8]/20'
            }`}
            title={autoRefresh ? 'Auto-refresh active (30s)' : 'Enable auto-refresh'}
          >
            <RefreshCw size={12} className={autoRefresh ? 'animate-spin-slow' : ''} />
            {autoRefresh ? 'Live' : 'Live'}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-[#DEDBC8] hover:bg-[#DEDBC8]/5 border border-[#DEDBC8]/10 transition-all"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 p-1 rounded-xl bg-[#DEDBC8]/[0.04] border border-[#DEDBC8]/5 w-fit">
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => {
              setFilter(key);
              setSelectedNotif(null);
            }}
            className={`px-4 py-2 rounded-[10px] text-xs font-bold transition-all duration-300 ${
              filter === key
                ? 'bg-[#DEDBC8] text-black shadow-[0_2px_10px_rgba(222,219,200,0.2)]'
                : 'text-gray-400 hover:text-[#E1E0CC] hover:bg-white/[0.03]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Detail */}
      <AnimatePresence>
        {selectedNotif && (
          <DetailSheet
            notif={selectedNotif}
            onClose={() => setSelectedNotif(null)}
            onViewPaper={handleViewPaper}
          />
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading && <NotificationSkeleton />}

      {/* List — Grouped by date */}
      {!loading && filteredNotifs.length > 0 && (
        <div className="space-y-6">
          <AnimatePresence>
            {groupedNotifs.map(([group, items]) => (
              <div key={group} className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-600 px-1">
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
          <div className="w-20 h-20 rounded-full bg-[#DEDBC8]/5 flex items-center justify-center mb-5">
            <Inbox size={32} className="text-gray-500" />
          </div>
          <h3 className="text-base font-bold text-[#E1E0CC] mb-1.5">
            {filter === 'unread' ? 'No unread notifications' : t('notifications.emptyTitle')}
          </h3>
          <p className="text-xs text-gray-500 text-center max-w-[280px] leading-relaxed">
            {filter === 'unread'
              ? "You're all caught up! Switch to 'All' to see previous notifications."
              : t('notifications.emptyDesc')}
          </p>
        </motion.div>
      )}
    </div>
  );
}
