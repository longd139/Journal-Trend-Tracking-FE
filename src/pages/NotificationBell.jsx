import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { adminAPI } from '../lib/api/admin.api';

/* ═══════════════════════════════════════════════════════════════════════════
   Mock notifications
   ═══════════════════════════════════════════════════════════════════════════ */

const ICON_MAP = {
  citations: MessageSquare,
  trend: TrendingUp,
  system: FileText,
  security: ShieldAlert,
  sync: RefreshCw,
};

const COLOR_MAP = {
  citations: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  trend: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  system: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  security: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  sync: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
};

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'citations',
    titleKey: 'newCitations',
    descKey: 'newCitationsDesc',
    detailKey: 'newCitationsDetail',
    timeKey: '2mAgo',
    timestamp: Date.now() - 2 * 60 * 1000,
    read: false,
    actionable: true,
  },
  {
    id: 2,
    type: 'trend',
    titleKey: 'trendAlert',
    descKey: 'trendAlertDesc',
    detailKey: 'trendAlertDetail',
    timeKey: '1hAgo',
    timestamp: Date.now() - 60 * 60 * 1000,
    read: false,
    actionable: true,
  },
  {
    id: 3,
    type: 'system',
    titleKey: 'systemNotification',
    descKey: 'systemNotifDesc',
    detailKey: 'systemNotifDetail',
    timeKey: '3hAgo',
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    read: true,
    actionable: false,
  },
  {
    id: 4,
    type: 'security',
    titleKey: 'securityAlert',
    descKey: 'securityAlertDesc',
    detailKey: 'securityAlertDetail',
    timeKey: '1dAgo',
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    read: true,
    actionable: true,
  },
  {
    id: 5,
    type: 'system',
    titleKey: 'systemNotification',
    descKey: 'systemNotifDesc',
    detailKey: 'systemNotifDetail',
    timeKey: '3hAgo',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    read: true,
    actionable: false,
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   Notification item card
   ═══════════════════════════════════════════════════════════════════════════ */

function NotificationCard({ notif, isSelected, onClick, onDismiss, renderTitle, renderDesc, renderTime }) {
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
          ? 'bg-[#DEDBC8]/[0.06] border-[#DEDBC8]/30 shadow-[0_0_20px_rgba(222,219,200,0.05)]'
          : 'bg-white/[0.02] border-transparent hover:bg-white/[0.05] hover:border-white/[0.06]'
      }`}
    >
      {/* Unread dot */}
      {!notif.read && (
        <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-[#DEDBC8] shadow-[0_0_8px_rgba(222,219,200,0.5)]" />
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
                !notif.read ? 'text-[#E1E0CC]' : 'text-gray-400'
              }`}
            >
              {renderTitle(notif)}
            </h4>
            <span className="text-[10px] font-medium text-gray-500 whitespace-nowrap flex items-center gap-1">
              <Clock size={10} />
              {renderTime(notif)}
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
            {renderDesc(notif)}
          </p>
        </div>
      </div>

      {/* Dismiss button on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(notif.id);
        }}
        className="absolute bottom-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 text-gray-500 hover:text-red-400 hover:bg-red-500/10"
      >
        <Trash2 size={13} />
      </button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Notification detail view
   ═══════════════════════════════════════════════════════════════════════════ */

function NotificationDetail({ notif, onBack, renderTitle, renderDetail, renderTime }) {
  const colors = COLOR_MAP[notif.type] || COLOR_MAP.system;
  const Icon = ICON_MAP[notif.type] || FileText;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="h-full flex flex-col"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-[#DEDBC8] transition-colors mb-5 self-start"
      >
        <ChevronLeft size={14} />
        Back to notifications
      </button>

      {/* Icon */}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${colors.bg}`}>
        <Icon size={26} className={colors.text} />
      </div>

      {/* Title & time */}
      <div className="mb-5">
        <h2 className="text-lg font-black text-[#E1E0CC] mb-1.5 font-display tracking-tight">
          {renderTitle(notif)}
        </h2>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
          <Clock size={11} />
          {renderTime(notif)}
        </span>
      </div>

      {/* Detail content */}
      <div className="flex-1">
        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
          {renderDetail(notif)}
        </p>
      </div>

      {/* Actions */}
      <div className="pt-6 border-t border-[#DEDBC8]/10">
        <button
          onClick={onBack}
          className="w-full py-3 rounded-xl text-sm font-bold text-black bg-[#DEDBC8] hover:bg-[#E1E0CC] transition-all duration-300 hover:shadow-[0_0_24px_rgba(222,219,200,0.25)]"
        >
          Got it
        </button>
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
      <div className="w-20 h-20 rounded-full bg-[#DEDBC8]/5 flex items-center justify-center mb-5">
        <Inbox size={32} className="text-gray-500" />
      </div>
      <h3 className="text-base font-bold text-[#E1E0CC] mb-1.5">
        {t('notifications.emptyTitle')}
      </h3>
      <p className="text-xs text-gray-500 text-center max-w-[240px] leading-relaxed">
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
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [notifs, setNotifs] = useState(MOCK_NOTIFICATIONS);

  const userRole = sessionStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';

  /* ── Fetch sync notifications for admin ─────────────────────────── */
  useEffect(() => {
    if (!isAdmin) return;
    const fetchSyncNotifs = async () => {
      try {
        const response = await adminAPI.getSyncNotifications();
        const data = response.data || response;
        if (data && data.message) {
          const syncNotif = {
            id: `sync-${Date.now()}`,
            type: 'sync',
            titleKey: null,
            title: 'Sync Notification',
            descKey: null,
            desc: data.message,
            detailKey: null,
            detail: JSON.stringify(data, null, 2),
            timeKey: null,
            time: new Date(response.timestamp || Date.now()).toLocaleString(),
            timestamp: Date.now(),
            read: false,
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
    fetchSyncNotifs();
    const interval = setInterval(fetchSyncNotifs, 60000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  /* ── Computed values ────────────────────────────────────────────── */
  const unreadCount = notifs.filter((n) => !n.read).length;
  const filteredNotifs =
    filter === 'unread' ? notifs.filter((n) => !n.read) : notifs;
  const allRead = unreadCount === 0;

  /* ── Actions ────────────────────────────────────────────────────── */
  const markAsRead = (id) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotif = (id) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
    if (selectedNotif?.id === id) setSelectedNotif(null);
  };

  const handleSelect = (notif) => {
    setSelectedNotif(notif);
    if (!notif.read) markAsRead(notif.id);
  };

  /* ── Render helpers ─────────────────────────────────────────────── */
  const renderNotifTitle = (n) => {
    if (n.titleKey) return t(`notifications.${n.titleKey}`, { ns: 'common' });
    return n.title;
  };
  const renderNotifDesc = (n) => {
    if (n.descKey) return t(`notifications.${n.descKey}`, { ns: 'common' });
    return n.desc;
  };
  const renderNotifTime = (n) => {
    if (n.timeKey) return t(`notifications.${n.timeKey}`, { ns: 'common' });
    return n.time;
  };
  const renderNotifDetail = (n) => {
    if (n.detailKey) return t(`notifications.${n.detailKey}`, { ns: 'common' });
    return n.detail;
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
        className="relative p-2.5 rounded-xl bg-[#101010] border border-[#DEDBC8]/5 hover:border-[#DEDBC8]/20 transition-all duration-300 shadow-sm"
      >
        {unreadCount > 0 ? (
          <BellRing size={18} className="text-[#DEDBC8]" />
        ) : (
          <Bell size={18} className="text-gray-400" />
        )}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 flex items-center justify-center px-1 bg-[#DEDBC8] text-[10px] font-black text-black rounded-full shadow-[0_0_12px_rgba(222,219,200,0.4)]"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* ─── Floating panel overlay ────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-end">
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
              className="relative h-full w-full max-w-[480px] bg-[#0A0D14]/95 backdrop-blur-2xl border-l border-[#DEDBC8]/10 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* ─── Header ────────────────────────────────────────── */}
              <div className="shrink-0 px-6 pt-6 pb-4 border-b border-[#DEDBC8]/8">
                <AnimatePresence mode="wait">
                  {!selectedNotif ? (
                    <motion.div
                      key="list-header"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Top row */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#DEDBC8]/10 flex items-center justify-center">
                            <BellRing size={18} className="text-[#DEDBC8]" />
                          </div>
                          <div>
                            <h2 className="text-base font-black text-[#E1E0CC] font-display tracking-tight">
                              {t('notifications.title')}
                            </h2>
                            {unreadCount > 0 && (
                              <p className="text-[11px] font-medium text-gray-400">
                                {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}
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
                              className="p-2 rounded-lg text-[11px] font-bold text-gray-400 hover:text-[#DEDBC8] hover:bg-[#DEDBC8]/5 transition-all flex items-center gap-1"
                              title="Mark all as read"
                            >
                              <CheckCheck size={15} />
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsOpen(false)}
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <X size={18} />
                          </motion.button>
                        </div>
                      </div>

                      {/* Filter tabs */}
                      <div className="flex gap-1.5 p-1 rounded-xl bg-[#DEDBC8]/[0.04] border border-[#DEDBC8]/5">
                        {[
                          { key: 'all', label: 'All' },
                          { key: 'unread', label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
                        ].map(({ key, label }) => (
                          <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`flex-1 py-2 rounded-[10px] text-xs font-bold transition-all duration-300 ${
                              filter === key
                                ? 'bg-[#DEDBC8] text-black shadow-[0_2px_10px_rgba(222,219,200,0.2)]'
                                : 'text-gray-400 hover:text-[#E1E0CC] hover:bg-white/[0.03]'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="detail-header"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            (COLOR_MAP[selectedNotif.type] || COLOR_MAP.system).bg
                          }`}
                        >
                          {(() => {
                            const Icon = ICON_MAP[selectedNotif.type] || FileText;
                            return (
                              <Icon
                                size={18}
                                className={(COLOR_MAP[selectedNotif.type] || COLOR_MAP.system).text}
                              />
                            );
                          })()}
                        </div>
                        <h2 className="text-sm font-black text-[#E1E0CC] font-display tracking-tight truncate max-w-[280px]">
                          {renderNotifTitle(selectedNotif)}
                        </h2>
                      </div>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                      >
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
                      renderTitle={renderNotifTitle}
                      renderDetail={renderNotifDetail}
                      renderTime={renderNotifTime}
                    />
                  ) : filteredNotifs.length > 0 ? (
                    <motion.div
                      key="list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-2 pb-6"
                    >
                      <AnimatePresence>
                        {filteredNotifs.map((n) => (
                          <NotificationCard
                            key={n.id}
                            notif={n}
                            isSelected={false}
                            onClick={handleSelect}
                            onDismiss={dismissNotif}
                            renderTitle={renderNotifTitle}
                            renderDesc={renderNotifDesc}
                            renderTime={renderNotifTime}
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
                  className="shrink-0 px-6 py-4 border-t border-[#DEDBC8]/8 bg-[#0A0D14]/90 backdrop-blur-xl"
                >
                  <p className="text-[11px] text-gray-500 text-center font-medium">
                    {filter === 'unread'
                      ? `${filteredNotifs.length} unread notification${filteredNotifs.length !== 1 ? 's' : ''}`
                      : `${notifs.length} total notification${notifs.length !== 1 ? 's' : ''} · ${unreadCount} unread`}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
