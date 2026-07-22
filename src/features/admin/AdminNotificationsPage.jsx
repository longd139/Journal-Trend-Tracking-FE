import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, RefreshCw, Check, CheckCheck, Trash2, Inbox, UserPlus, AlertTriangle,
  Flag, CheckCircle2, XCircle, TrendingUp, Radio, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { adminAPI } from './api';
import axiosClient from '../../lib/apiClient.js';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../components/ui/tooltip';

/* ═══════════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════════ */

const TYPE_META = {
  new_user:      { icon: UserPlus,       bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', accent: '#34D399', label: 'New user' },
  user_report:   { icon: Flag,           bg: 'bg-orange-500/10',  text: 'text-orange-400',  border: 'border-orange-500/20',  accent: '#F97316', label: 'User report' },
  sync_completed:{ icon: CheckCircle2,   bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/20',    accent: '#4F8CFF', label: 'Sync OK' },
  sync_failed:   { icon: XCircle,        bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/20',     accent: '#EF4444', label: 'Sync failed' },
  system_alert:  { icon: AlertTriangle,  bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20',   accent: '#F59E0B', label: 'System alert' },
  content_alert: { icon: TrendingUp,     bg: 'bg-violet-500/10',  text: 'text-violet-400',  border: 'border-violet-500/20',  accent: '#8B5CF6', label: 'Content alert' },
};

const DEFAULT_META = { icon: Bell, bg: 'bg-gray-500/10', text: 'text-muted-foreground', border: 'border-gray-500/20', accent: '#6B7280', label: 'Unknown' };

const TYPE_FILTERS = [
  { key: null, labelKey: 'adminNotifications.filterAll' },
  { key: 'new_user', labelKey: 'adminNotifications.filterNewUser' },
  { key: 'user_report', labelKey: 'adminNotifications.filterReport' },
  { key: 'sync_completed', labelKey: 'adminNotifications.filterSyncCompleted' },
  { key: 'sync_failed', labelKey: 'adminNotifications.filterSyncFailed' },
  { key: 'system_alert', labelKey: 'adminNotifications.filterSystem' },
  { key: 'content_alert', labelKey: 'adminNotifications.filterContent' },
];

const spring = { type: 'spring', stiffness: 300, damping: 30 };

/* ═══════════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════════ */

function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════════════════ */

function TypeBadge({ type }) {
  const meta = TYPE_META[type] || DEFAULT_META;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${meta.bg} ${meta.text} ${meta.border}`}>
      <Icon size={10} />
      {meta.label}
    </span>
  );
}

function StatCard({ icon: Icon, accent, value, label, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, ...spring }}
      whileHover={{ y: -4 }}
      className="group relative p-4 rounded-2xl border flex flex-col gap-3
        bg-card-elevated border-card-elevated-border
        hover:border-primary/15 transition-colors duration-300
        shadow-[inset_0_1px_0_0_rgba(148,163,184,0.06)]
        overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(600px circle at 50% 0%, ${accent}10, transparent 70%)` }}
      />
      <div className="relative flex items-center justify-between">
        <div className="p-2 rounded-xl bg-card-hover border border-border/50">
          <Icon size={16} style={{ color: accent }} />
        </div>
      </div>
      <div className="relative flex flex-col gap-0.5">
        <span className="text-2xl font-bold text-foreground font-display tabular-nums">{value}</span>
        <span className="text-[11px] text-muted-foreground font-medium tracking-wide">{label}</span>
      </div>
    </motion.div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-card-elevated border border-card-elevated-border animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-card-hover" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-card-hover rounded w-3/4" />
        <div className="h-3 bg-card-hover rounded w-1/2" />
      </div>
      <div className="h-8 w-20 bg-card-hover rounded-lg" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function AdminNotificationsPage() {
  const { t } = useTranslation('admin');
  const { t: tc } = useTranslation('common');

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAdminNotifications({
        page,
        size: 15,
        type: typeFilter,
      });
      if (res?.data) {
        setNotifications(res.data);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load admin notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Auto-refresh every 60s
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchNotifications]);

  const stats = useMemo(() => {
    const counts = {};
    notifications.forEach((n) => {
      const key = n.type || 'unknown';
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [notifications]);

  const handleMarkRead = async (notifId) => {
    try {
      await axiosClient.put(`/api/v1/notifications/${notifId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.notifId === notifId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axiosClient.put('/api/v1/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (notifId) => {
    try {
      await axiosClient.delete(`/api/v1/notifications/${notifId}`);
      setNotifications((prev) => prev.filter((n) => n.notifId !== notifId));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const STAT_CARDS = [
    { key: 'total', icon: Bell, accent: 'var(--primary)', label: tc('notifications.title') || 'Total', value: notifications.length },
    { key: 'new_user', icon: UserPlus, accent: '#34D399', label: TYPE_META.new_user?.label || 'New Users', value: stats.new_user || 0 },
    { key: 'user_report', icon: Flag, accent: '#F97316', label: 'Reports', value: stats.user_report || 0 },
    { key: 'sync', icon: Radio, accent: '#4F8CFF', label: 'Sync', value: (stats.sync_completed || 0) + (stats.sync_failed || 0) },
  ];

  return (
    <div className="min-h-screen p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20">
            <Bell size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground font-display">
              {t('adminNotifications.title')}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all
                  ${autoRefresh
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-card-elevated text-muted-foreground border-card-elevated-border hover:border-primary/15'
                  }`}
              >
                <RefreshCw size={13} className={autoRefresh ? 'animate-spin-slow' : ''} />
                {autoRefresh ? 'Auto' : 'Manual'}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {autoRefresh ? 'Auto-refresh every 60s' : 'Manual refresh mode'}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={fetchNotifications}
                disabled={loading}
                className="p-2 rounded-xl bg-card-elevated border border-card-elevated-border text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Refresh now</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleMarkAllRead}
                className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                <CheckCheck size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>{tc('notifications.markAllRead') || 'Mark all read'}</TooltipContent>
          </Tooltip>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card, i) => (
          <StatCard key={card.key} icon={card.icon} accent={card.accent} value={card.value} label={card.label} index={i} />
        ))}
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.key || 'all'}
            onClick={() => { setTypeFilter(f.key); setPage(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
              ${typeFilter === f.key
                ? 'bg-primary/15 text-primary border-primary/30'
                : 'bg-card-elevated text-muted-foreground border-card-elevated-border hover:border-primary/15 hover:text-foreground'
              }`}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="p-4 rounded-2xl bg-card-elevated border border-card-elevated-border mb-4">
              <Inbox size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground font-display">
              {t('adminNotifications.emptyTitle')}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {t('adminNotifications.emptyDesc')}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {notifications.map((n) => {
              const meta = TYPE_META[n.type] || DEFAULT_META;
              const Icon = meta.icon;
              return (
                <motion.div
                  key={n.notifId}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={spring}
                  className={`group relative flex items-start gap-4 p-4 rounded-2xl border transition-all
                    ${!n.isRead
                      ? 'bg-card-elevated border-primary/10 shadow-[inset_0_1px_0_0_rgba(79,140,255,0.06)]'
                      : 'bg-card-elevated/50 border-card-elevated-border opacity-75'
                    } hover:border-primary/15`}
                >
                {/* Unread indicator */}
                {!n.isRead && (
                  <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                )}
                {/* Icon */}
                <div className={`p-2.5 rounded-xl border ${meta.bg} ${meta.border} ml-1`}>
                  <Icon size={16} style={{ color: meta.accent }} />
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <TypeBadge type={n.type} />
                        <span className="text-[10px] text-muted-foreground">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-foreground line-clamp-1">
                        {n.title}
                      </h4>
                      {n.message && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {!n.isRead && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => {
                                axiosClient.put(`/api/v1/notifications/${n.notifId}/read`).then(() => {
                                  setNotifications((prev) =>
                                    prev.map((x) => (x.notifId === n.notifId ? { ...x, isRead: true } : x))
                                  );
                                }).catch(() => {});
                              }}
                              className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-400 transition-colors"
                            >
                              <Check size={14} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Mark as read</TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleDelete(n.notifId)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="p-2 rounded-xl bg-card-elevated border border-card-elevated-border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-muted-foreground px-3">
            {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="p-2 rounded-xl bg-card-elevated border border-card-elevated-border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
