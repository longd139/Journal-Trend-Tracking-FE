import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Search, RefreshCw, ChevronLeft, ChevronRight,
  Calendar, User, Activity, Database, FileText, Shield,
} from 'lucide-react';
import { adminAPI } from './api';

const ACTION_COLORS = {
  CREATE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  UPDATE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
  LOGIN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

function ActionBadge({ action }) {
  const cls = ACTION_COLORS[action] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  return (
    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${cls}`}>
      {action}
    </span>
  );
}

export default function AdminAuditLogPage() {
  const { t } = useTranslation('admin');
  const { t: tc } = useTranslation('common');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAuditLogs({
        page,
        size: 15,
        action: actionFilter || undefined,
      });
      const pageData = res?.data;
      setLogs(pageData?.content || []);
      setTotalPages(pageData?.totalPages || 0);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [page, actionFilter]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-[#101010] via-[#141414] to-[#101010] border-[#DEDBC8]/10"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
        <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Shield size={15} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#E1E0CC] font-display">{t('auditLogs.title')}</h2>
              <p className="text-[11px] text-gray-500">{t('auditLogs.description')}</p>
            </div>
          </div>
          <button onClick={fetchLogs} disabled={loading}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 bg-white/[0.04] text-gray-400 hover:text-[#E1E0CC] hover:bg-white/[0.08] transition-colors border border-[#DEDBC8]/8">
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> {tc('actions.refresh')}
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-3">
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
          className="px-3 py-2 rounded-lg border border-[#DEDBC8]/20 bg-[#151922] text-sm text-[#E1E0CC] outline-none">
          <option value="">{t('auditLogs.allActions')}</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="LOGIN">LOGIN</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#DEDBC8]/10 bg-[#151922] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#DEDBC8]/10 text-left">
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('auditLogs.table.admin')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('auditLogs.table.action')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('auditLogs.table.target')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('auditLogs.table.ipAddress')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('auditLogs.table.date')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  <RefreshCw size={20} className="animate-spin mx-auto mb-2" />{tc('actions.loading')}
                </td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  <Activity size={24} className="mx-auto mb-2 opacity-30" />{t('auditLogs.noLogsFound')}
                </td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.auditId} className="border-b border-[#DEDBC8]/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#DEDBC8]/10 flex items-center justify-center">
                          <User size={12} className="text-[#DEDBC8]" />
                        </div>
                        <span className="text-xs text-[#E1E0CC] font-medium">{log.adminEmail || t('auditLogs.system')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><ActionBadge action={log.action} /></td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {log.targetTable && <span className="text-[#DEDBC8]">{log.targetTable}</span>}
                      {log.targetId && <span className="text-gray-500 ml-1">#{log.targetId?.substring(0, 8)}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{log.ipAddress || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#DEDBC8]/10">
            <span className="text-xs text-gray-500">{t('auditLogs.pagination', { current: page + 1, total: totalPages })}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
