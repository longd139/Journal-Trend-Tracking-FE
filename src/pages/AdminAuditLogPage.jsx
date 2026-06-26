import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Search, RefreshCw, ChevronLeft, ChevronRight,
  Calendar, User, Activity, Database, FileText,
} from 'lucide-react';
import { adminAPI } from '../lib/api/admin.api';

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
  const { t } = useTranslation('common');
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white font-display">Audit Logs</h1>
          <p className="text-xs text-gray-400 mt-1">Track all administrative actions across the system</p>
        </div>
        <button onClick={fetchLogs} disabled={loading}
          className="p-2.5 rounded-xl bg-white/[0.04] border border-[#DEDBC8]/10 text-gray-400 hover:text-white transition-colors">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
          className="px-3 py-2 rounded-lg border border-[#DEDBC8]/20 bg-[#151922] text-sm text-[#E1E0CC] outline-none">
          <option value="">All Actions</option>
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
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Admin</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Target</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">IP Address</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  <RefreshCw size={20} className="animate-spin mx-auto mb-2" />Loading...
                </td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  <Activity size={24} className="mx-auto mb-2 opacity-30" />No audit logs found
                </td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.auditId} className="border-b border-[#DEDBC8]/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#DEDBC8]/10 flex items-center justify-center">
                          <User size={12} className="text-[#DEDBC8]" />
                        </div>
                        <span className="text-xs text-[#E1E0CC] font-medium">{log.adminEmail || 'System'}</span>
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
            <span className="text-xs text-gray-500">Page {page + 1} of {totalPages}</span>
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
