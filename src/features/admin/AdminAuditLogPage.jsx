import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  Shield, RefreshCw, Search, ChevronLeft, ChevronRight,
  User, Database, FileText, Trash2, Pencil, Plus,
  LogIn, Globe, Clock, Activity, Inbox,
} from 'lucide-react';
import { adminAPI } from './api';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../../components/ui/sheet';

/* ═══════════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════════ */

const ACTION_META = {
  CREATE:  { icon: Plus,     bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', accent: '#34D399' },
  UPDATE:  { icon: Pencil,   bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20',   accent: '#F59E0B' },
  DELETE:  { icon: Trash2,   bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/20',     accent: '#EF4444' },
  LOGIN:   { icon: LogIn,    bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/20',    accent: '#4F8CFF' },
};

const DEFAULT_META = { icon: FileText, bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', accent: '#6B7280' };

const ACTION_FILTERS = ['ALL', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'];

const STAT_CARDS = [
  { key: 'total',   icon: Activity, accent: '#DEDBC8', labelKey: 'auditLogs.stats.total' },
  { key: 'CREATE',  icon: Plus,     accent: '#34D399', labelKey: 'auditLogs.stats.created' },
  { key: 'UPDATE',  icon: Pencil,   accent: '#F59E0B', labelKey: 'auditLogs.stats.updated' },
  { key: 'DELETE',  icon: Trash2,   accent: '#EF4444', labelKey: 'auditLogs.stats.deleted' },
  { key: 'LOGIN',   icon: LogIn,    accent: '#4F8CFF', labelKey: 'auditLogs.stats.logins' },
];

const spring = { type: 'spring', stiffness: 300, damping: 30 };

/* ═══════════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════════ */

function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
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
}

function formatFullDate(timestamp) {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleString();
}

function getInitial(email) {
  if (!email) return '?';
  return email.charAt(0).toUpperCase();
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════════════════ */

function ActionBadge({ action }) {
  const meta = ACTION_META[action] || DEFAULT_META;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${meta.bg} ${meta.text} ${meta.border}`}>
      <Icon size={10} />
      {action}
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
        shadow-[inset_0_1px_0_0_rgba(222,219,200,0.04)]
        overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle 200px at 50% 0%, ${accent}08, transparent 60%)`,
        }}
      />
      <div className="relative z-10 flex items-start justify-between">
        <div className="p-2 rounded-lg" style={{ background: `${accent}18`, color: accent }}>
          <Icon size={16} />
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-xl font-bold text-foreground font-mono tabular-nums">{value.toLocaleString()}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Admin Audit Log Page
   ═══════════════════════════════════════════════════════════════════════════ */

export default function AdminAuditLogPage() {
  const { t } = useTranslation('admin');
  const { t: tc } = useTranslation('common');

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const fetchLogs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await adminAPI.getAuditLogs({
        page,
        size: 15,
        action: actionFilter !== 'ALL' ? actionFilter : undefined,
        adminId: searchQuery.trim() || undefined,
      });
      const pageData = res?.data;
      setLogs(pageData?.content || []);
      setTotalPages(pageData?.totalPages || 0);
      setTotalElements(pageData?.totalElements || 0);
    } catch {
      setLogs([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, actionFilter, searchQuery]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchLogs(true), 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  // Compute stats from all fetched logs (approximate — shows current page distribution)
  const stats = useMemo(() => {
    const counts = { total: totalElements, CREATE: 0, UPDATE: 0, DELETE: 0, LOGIN: 0 };
    logs.forEach((l) => {
      if (counts[l.action] !== undefined) counts[l.action]++;
    });
    // If we have totalElements from backend, use it; otherwise sum current page
    if (!totalElements) {
      counts.total = logs.length;
    }
    return counts;
  }, [logs, totalElements]);

  const handleSelectLog = (log) => {
    setSelectedLog(log);
    setSheetOpen(true);
  };

  const handleFilterChange = (action) => {
    setActionFilter(action);
    setPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen bg-transparent">
      {/* ─── Header Banner ─── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-[#101010] via-[#141414] to-[#101010] border-primary/10"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
        <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Shield size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground font-display">{t('auditLogs.title')}</h2>
              <p className="text-[11px] text-gray-500">{t('auditLogs.description')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Auto-refresh toggle */}
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                autoRefresh
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'text-gray-400 border-primary/10 hover:text-foreground hover:border-primary/20'
              }`}
            >
              <RefreshCw size={11} className={autoRefresh ? 'animate-spin-slow' : ''} />
              {autoRefresh ? 'Live' : 'Live'}
            </button>
            <button
              onClick={() => fetchLogs()}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 bg-white/[0.04] text-gray-400 hover:text-foreground hover:bg-white/[0.08] active:scale-[0.97] transition-all duration-150 border border-primary/8"
            >
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
              {tc('actions.refresh')}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ─── Stats Summary Cards ─── */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {STAT_CARDS.map((card, i) => (
            <StatCard
              key={card.key}
              index={i}
              icon={card.icon}
              accent={card.accent}
              value={stats[card.key]}
              label={t(card.labelKey)}
            />
          ))}
        </div>
      )}

      {/* ─── Filter Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Action filter pills */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-primary/[0.04] border border-primary/5">
          {ACTION_FILTERS.map((action) => (
            <button
              key={action}
              onClick={() => handleFilterChange(action)}
              className={`px-3.5 py-2 rounded-[10px] text-[11px] font-bold transition-all duration-300 ${
                actionFilter === action
                  ? 'bg-primary text-black shadow-[0_2px_10px_rgba(222,219,200,0.2)]'
                  : 'text-gray-400 hover:text-foreground hover:bg-white/[0.03]'
              }`}
            >
              {action === 'ALL' ? t('auditLogs.allActions') : action}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative flex-1 max-w-[260px] sm:ml-auto">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={t('auditLogs.searchPlaceholder')}
            className="w-full pl-8 pr-3 py-2 rounded-xl text-xs border bg-card border-primary/10 text-foreground placeholder:text-gray-600 focus:outline-none focus:border-primary/25 transition-colors"
          />
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="rounded-2xl border border-primary/10 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary/10">
                <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-[30%]">
                  {t('auditLogs.table.admin')}
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-[100px]">
                  {t('auditLogs.table.action')}
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-[25%]">
                  {t('auditLogs.table.target')}
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-[140px]">
                  {t('auditLogs.table.ipAddress')}
                </th>
                <th className="text-right px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-[100px]">
                  {t('auditLogs.table.date')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-5 py-4">
                      <div className="flex items-center gap-4 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-primary/8 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-36 bg-primary/8 rounded" />
                          <div className="h-2.5 w-24 bg-primary/5 rounded" />
                        </div>
                        <div className="h-5 w-16 bg-primary/8 rounded shrink-0" />
                        <div className="h-3 w-28 bg-primary/5 rounded shrink-0 hidden md:block" />
                        <div className="h-3 w-16 bg-primary/5 rounded shrink-0" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center justify-center py-16 px-6">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center mb-4">
                        <Inbox size={28} className="text-gray-500" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground mb-1">{t('auditLogs.emptyTitle')}</h3>
                      <p className="text-xs text-gray-500 text-center max-w-[260px]">{t('auditLogs.emptyDesc')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.auditId}
                    onClick={() => handleSelectLog(log)}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  >
                    {/* Admin */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-bold text-primary">{getInitial(log.adminEmail)}</span>
                        </div>
                        <span className="text-xs text-foreground font-medium truncate block max-w-[180px]">
                          {log.adminEmail || t('auditLogs.system')}
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4">
                      <ActionBadge action={log.action} />
                    </td>

                    {/* Target */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Database size={11} className="text-gray-600 shrink-0" />
                        {log.targetTable ? (
                          <span className="text-xs text-gray-400 truncate block" title={`${log.targetTable}${log.targetId ? ` #${log.targetId}` : ''}`}>
                            <span className="text-primary">{log.targetTable}</span>
                            {log.targetId && (
                              <span className="text-gray-600 ml-1 font-mono text-[10px]">
                                #{typeof log.targetId === 'string' ? log.targetId.substring(0, 8) : log.targetId}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </div>
                    </td>

                    {/* IP Address */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Globe size={11} className="text-gray-600 shrink-0" />
                        <span className="text-xs text-gray-500 font-mono truncate block max-w-[110px]">{log.ipAddress || '—'}</span>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Clock size={11} className="text-gray-600 shrink-0" />
                        <span
                          className="text-xs text-gray-500 whitespace-nowrap"
                          title={formatFullDate(log.createdAt)}
                        >
                          {formatRelativeTime(log.createdAt)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination ─── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-primary/10">
            <span className="text-xs text-gray-500 font-mono tabular-nums">
              {t('auditLogs.pagination', { current: page + 1, total: totalPages })}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 active:scale-[0.97] disabled:opacity-30 transition-all duration-150"
              >
                <ChevronLeft size={15} />
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                const pn = start + i;
                if (pn >= totalPages) return null;
                return (
                  <button
                    key={pn}
                    onClick={() => setPage(pn)}
                    className={`w-8 h-8 rounded-lg text-[11px] font-bold transition-all duration-150 ${
                      pn === page
                        ? 'bg-primary text-black'
                        : 'text-gray-400 hover:text-foreground hover:bg-white/5'
                    }`}
                  >
                    {pn + 1}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 active:scale-[0.97] disabled:opacity-30 transition-all duration-150"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Detail Sheet ─── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md !bg-card border-l border-primary/10 p-0 flex flex-col"
        >
          {selectedLog && (
            <>
              <SheetHeader className="px-6 py-5 border-b border-primary/10 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <Shield size={18} />
                  </div>
                  <div>
                    <SheetTitle className="text-base font-bold text-foreground">{t('auditLogs.detail.title')}</SheetTitle>
                    <p className="text-[10px] font-mono text-gray-500 mt-0.5">
                      {t('auditLogs.detail.auditId')}: {typeof selectedLog.auditId === 'string' ? selectedLog.auditId.substring(0, 12) : selectedLog.auditId}
                    </p>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Action badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    {t('auditLogs.detail.action')}
                  </span>
                  <ActionBadge action={selectedLog.action} />
                </div>

                {/* Admin */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    {t('auditLogs.detail.admin')}
                  </span>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-primary/[0.02] border border-primary/5">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <User size={15} className="text-primary" />
                    </div>
                    <span className="text-sm text-foreground font-medium">
                      {selectedLog.adminEmail || t('auditLogs.system')}
                    </span>
                  </div>
                </div>

                {/* Target */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    {t('auditLogs.detail.target')}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-primary/[0.02] border border-primary/5">
                      <p className="text-[9px] uppercase tracking-wider text-gray-600 mb-0.5">{t('auditLogs.detail.targetTable')}</p>
                      <p className="text-sm font-medium text-primary">{selectedLog.targetTable || '—'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-primary/[0.02] border border-primary/5">
                      <p className="text-[9px] uppercase tracking-wider text-gray-600 mb-0.5">{t('auditLogs.detail.targetId')}</p>
                      <p className="text-sm font-mono text-foreground truncate">{selectedLog.targetId || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* IP Address */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    {t('auditLogs.detail.ipAddress')}
                  </span>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-primary/[0.02] border border-primary/5">
                    <Globe size={15} className="text-gray-500" />
                    <span className="text-sm font-mono text-foreground">{selectedLog.ipAddress || '—'}</span>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    {t('auditLogs.detail.timestamp')}
                  </span>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-primary/[0.02] border border-primary/5">
                    <Clock size={15} className="text-gray-500" />
                    <span className="text-sm text-foreground">{formatFullDate(selectedLog.createdAt)}</span>
                  </div>
                </div>

                {/* Details — if API returns old/new values */}
                {(selectedLog.oldValue || selectedLog.newValue || selectedLog.details) && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      {t('auditLogs.detail.details') || 'Details'}
                    </span>
                    <div className="p-3 rounded-xl bg-primary/[0.02] border border-primary/5">
                      <pre className="text-[11px] text-gray-400 font-mono whitespace-pre-wrap leading-relaxed">
                        {selectedLog.details || JSON.stringify({ oldValue: selectedLog.oldValue, newValue: selectedLog.newValue }, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
