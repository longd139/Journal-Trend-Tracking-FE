import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BellRing,
  X,
  ChevronLeft,
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
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

/**
 * Normalize API notification to internal shape.
 * API returns: { notifId, type, title, message, isRead, createdAt, ... }
 * Internal uses: { id, type, title, desc, detail, read, timestamp, ... }
 */
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
    } catch { /* fall through */ }
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
   Notification item card
   ═══════════════════════════════════════════════════════════════════════════ */

function NotificationCard({ notif, isSelected, onClick, onDismiss }) {
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
      className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
        isSelected
          ? 'bg-primary/[0.06] border-primary/30 shadow-sm'
          : 'bg-card border-primary/15 hover:bg-muted/30 hover:border-primary/15'
      }`}
    >
      {/* Unread dot */}
      {!notif.read && (
        <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
      )}

      <div className="flex items-start gap-3.5">
        {/* Icon */}
        <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.bg}`}>
          <Icon size={18} className={colors.text} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
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
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {notif.desc}
          </p>
        </div>
      </div>

      {/* Dismiss button on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(notif.id);
        }}
        className="absolute bottom-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
      >
        <Trash2 size={13} />
      </button>
    </motion.div>
  );
}

function extractKeywordFromText(text) {
  if (!text || typeof text !== 'string') return '';
  const quoted = text.match(/["«]([^"»]{2,50})["»]/);
  if (quoted) return quoted[1].trim();
  const pattern = text.match(/([A-Za-z0-9\s\-+#.]{3,40}) (?:usage|increased|decreased|trend|trending|grew|growth|surge)/i);
  if (pattern) return pattern[1].trim();
  return '';
}

/* ═══════════════════════════════════════════════════════════════════════════
   Notification detail view (inline in bell panel)
   ═══════════════════════════════════════════════════════════════════════════ */

function NotificationDetail({ notif, onBack, onSearchKeyword }) {
  const { t } = useTranslation('common');
  const colors = COLOR_MAP[notif.type] || COLOR_MAP.system;
  const Icon = ICON_MAP[notif.type] || FileText;
  // Extract keyword: use relatedKeywordText first, fallback to extracting from title/message
  const keyword = notif.relatedKeywordText?.trim()
    || extractKeywordFromText(notif.title)
    || extractKeywordFromText(notif.detail)
    || '';
  const hasKeyword = !!keyword;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="h-full flex flex-col"
    >
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-5 self-start"
      >
        <ChevronLeft size={14} />
        {t('notifications.backToList')}
      </button>

      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${colors.bg}`}>
        <Icon size={26} className={colors.text} />
      </div>

      <div className="mb-5">
        <h2 className="text-lg font-black text-foreground mb-1.5 font-display tracking-tight">
          {notif.title}
        </h2>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <Clock size={11} />
          {formatRelativeTime(notif)}
        </span>
      </div>

      <div className="flex-1">
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
          {notif.detail}
        </p>
      </div>

      <div className="pt-6 border-t border-primary/10 space-y-2.5">
        {hasKeyword ? (
          <button
            onClick={() => onSearchKeyword(keyword)}
            className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:shadow-[0_0_24px_var(--primary)] flex items-center justify-center gap-2"
          >
            <Search size={15} />
            {t('notifications.searchKeyword', { keyword })}
          </button>
        ) : (
          <button
            onClick={onBack}
            className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:shadow-[0_0_24px_var(--primary)]"
          >
            {t('notifications.gotIt')}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Empty state
   ═══════════════════════════════════════════════════════════════════════════ */

function EmptyState({ t }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-6"
    >
      <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-5">
        <Inbox size={32} className="text-muted-foreground" />
      </div>
      <h3 className="text-base font-bold text-foreground mb-1.5">
        {t('notifications.emptyTitle')}
      </h3>
      <p className="text-xs text-muted-foreground text-center max-w-[240px] leading-relaxed">
        {t('notifications.emptyDesc')}
      </p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function NotificationBell() {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const userRole = sessionStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';
  const navigate = useNavigate();
  const [selectedNotif, setSelectedNotif] = useState(null);

  /* ── Fetch notifications from API ────────────────────────────────── */
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const list = await notificationAPI.getNotifications({ page: 0, size: 50, filter: undefined });
      const normalized = Array.isArray(list) ? list.map(normalizeNotif) : [];
      setNotifs(normalized);
    } catch {
      // Silently fail — keep previous data
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Fetch unread count ──────────────────────────────────────────── */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await notificationAPI.getUnreadCount();
      const count = result?.unreadCount ?? 0;
      setUnreadCount(count);
    } catch {
      // Silently fail
    }
  }, []);

  /* ── Initial fetch + polling ─────────────────────────────────────── */
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Poll unread count every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

  /* ── Re-fetch when panel opens ───────────────────────────────────── */
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isOpen, fetchNotifications, fetchUnreadCount]);

  /* ── Fetch sync notification for admin ──────────────────────────── */
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

          const syncNotif = {
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
          };
          setNotifs((prev) => {
            const others = prev.filter((n) => n.type !== 'sync' || n.read);
            return [syncNotif, ...others];
          });
        }
      } catch {
        // Silently fail
      }
    };
    fetchSyncNotif();
    const interval = setInterval(fetchSyncNotif, 60000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  /* ── Computed values ────────────────────────────────────────────── */
  const filteredNotifs =
    filter === 'unread' ? notifs.filter((n) => !n.read) : notifs;
  const allRead = unreadCount === 0;

  /* ── Actions (call real API + update local state) ────────────────── */
  const markAsRead = async (id) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await notificationAPI.markAsRead(id);
    } catch {
      // Revert silently on next fetch
    }
  };

  const markAllAsRead = async () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await notificationAPI.markAllAsRead();
    } catch {
      // Revert silently on next fetch
    }
  };

  const dismissNotif = async (id) => {
    const notif = notifs.find((n) => n.id === id);
    setNotifs((prev) => prev.filter((n) => n.id !== id));
    if (notif && !notif.read) setUnreadCount((c) => Math.max(0, c - 1));
    if (selectedNotif?.id === id) setSelectedNotif(null);
    try {
      await notificationAPI.deleteNotification(id);
    } catch {
      // Revert silently on next fetch
    }
  };

  const handleSelect = (notif) => {
    setSelectedNotif(notif);
    if (!notif.read) markAsRead(notif.id);
  };

  const handleSearchKeyword = (keyword) => {
    setIsOpen(false);
    setSelectedNotif(null);
    const rawRole = sessionStorage.getItem('userRole') || 'researcher';
    const role = rawRole === 'academic' ? 'academic_user' : rawRole;
    navigate(`/${role}/search?q=${encodeURIComponent(keyword)}`);
  };

  /* ── Keyboard: Esc to close ─────────────────────────────────────── */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (selectedNotif) {
          setSelectedNotif(null);
        } else {
          setIsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, selectedNotif]);

  /* ── Lock body scroll when panel is open ────────────────────────── */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  /* ═══════════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ─── Bell trigger ──────────────────────────────────────────── */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          setIsOpen(true);
          setSelectedNotif(null);
          setFilter('all');
        }}
        className="relative p-2.5 rounded-xl bg-card border border-border hover:border-primary/20 transition-all duration-300 shadow-sm"
      >
        {unreadCount > 0 ? (
          <BellRing size={18} className="text-primary" />
        ) : (
          <Bell size={18} className="text-muted-foreground" />
        )}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 flex items-center justify-center px-1 bg-primary text-[10px] font-black text-black rounded-full shadow-[0_0_12px_var(--primary)]"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* ─── Floating panel — rendered via portal to body ───────────── */}
      {isOpen &&
        createPortal(
          <AnimatePresence>
            <div className="fixed inset-0 z-[99999] flex items-start justify-end">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => {
                  if (selectedNotif) {
                    setSelectedNotif(null);
                  } else {
                    setIsOpen(false);
                  }
                }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              />

              {/* Panel */}
              <motion.div
                initial={{ opacity: 0, x: 80, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.97 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative h-full w-full max-w-[480px] bg-card-recessed/95 backdrop-blur-2xl border-l border-primary/10 shadow-2xl flex flex-col overflow-hidden"
              >
                {/* ─── Header ────────────────────────────────────────── */}
                <div className="shrink-0 px-6 pt-6 pb-4 border-b border-primary/8">
                  <AnimatePresence mode="wait">
                    {!selectedNotif ? (
                      <motion.div key="list-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {/* Top row */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                              <BellRing size={18} className="text-primary" />
                            </div>
                            <div>
                              <h2 className="text-base font-black text-foreground font-display tracking-tight">
                                {t('notifications.title')}
                              </h2>
                              {unreadCount > 0 && (
                                <p className="text-[11px] font-medium text-muted-foreground">
                                  {t('notifications.unreadCount', { count: unreadCount })}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {!allRead && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={markAllAsRead}
                                className="p-2 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all flex items-center gap-1"
                                title="Mark all as read"
                              >
                                <CheckCheck size={15} />
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setIsOpen(false)}
                              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all"
                            >
                              <X size={18} />
                            </motion.button>
                          </div>
                        </div>
                        {/* Filter tabs */}
                        <div className="flex gap-1.5 p-1 rounded-xl bg-primary/[0.04] border border-border">
                          {[
                            { key: 'all', label: t('notifications.all') },
                            { key: 'unread', label: `${t('notifications.unread')}${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
                          ].map(({ key, label }) => (
                            <button
                              key={key}
                              onClick={() => setFilter(key)}
                              className={`flex-1 py-2 rounded-[10px] text-xs font-bold transition-all duration-300 ${
                                filter === key
                                  ? 'bg-primary text-primary-foreground shadow-sm'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="detail-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${(COLOR_MAP[selectedNotif.type] || COLOR_MAP.system).bg}`}>
                            {(() => { const Icon = ICON_MAP[selectedNotif.type] || FileText; return <Icon size={18} className={(COLOR_MAP[selectedNotif.type] || COLOR_MAP.system).text} />; })()}
                          </div>
                          <h2 className="text-sm font-black text-foreground font-display tracking-tight truncate max-w-[280px]">
                            {selectedNotif.title}
                          </h2>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all">
                          <X size={18} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ─── Body ──────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-3 scrollbar-thin">
                  <AnimatePresence mode="wait">
                    {selectedNotif ? (
                      <NotificationDetail
                        key={`detail-${selectedNotif.id}`}
                        notif={selectedNotif}
                        onBack={() => setSelectedNotif(null)}
                        onSearchKeyword={handleSearchKeyword}
                      />
                    ) : filteredNotifs.length > 0 ? (
                      <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2 pb-6">
                        <AnimatePresence>
                          {filteredNotifs.map((n) => (
                            <NotificationCard
                              key={n.id}
                              notif={n}
                              isSelected={false}
                              onClick={handleSelect}
                              onDismiss={dismissNotif}
                            />
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    ) : (
                      <EmptyState key="empty" t={t} />
                    )}
                  </AnimatePresence>
                </div>

                {/* ─── Footer ─────────────────────────────────────────── */}
                {!selectedNotif && filteredNotifs.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="shrink-0 px-6 py-4 border-t border-primary/8 bg-card-recessed/90 backdrop-blur-xl"
                  >
                    <p className="text-[11px] text-muted-foreground text-center font-medium">
                      {filter === 'unread'
                        ? `${filteredNotifs.length} unread notification${filteredNotifs.length !== 1 ? 's' : ''}`
                        : `${notifs.length} total notification${notifs.length !== 1 ? 's' : ''} · ${unreadCount} unread`}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
