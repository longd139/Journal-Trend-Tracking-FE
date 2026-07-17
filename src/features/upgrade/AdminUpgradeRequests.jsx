import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowUp, Search, CheckCircle2, XCircle, Clock, Loader2, Eye, User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { upgradeAPI } from '../upgrade/api';
import { Skeleton } from '../../components/ui/skeleton';

const STATUS_TABS = [
  { value: '', label: 'All', icon: null },
  { value: 'PENDING', label: 'Pending', icon: Clock },
  { value: 'APPROVED', label: 'Approved', icon: CheckCircle2 },
  { value: 'REJECTED', label: 'Rejected', icon: XCircle },
];

const STATUS_STYLES = {
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function AdminUpgradeRequests() {
  const { t } = useTranslation('admin');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await upgradeAPI.getAdminRequests({
        status: statusFilter || undefined,
        page,
        size: 15,
      });
      setRequests(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      console.warn('Failed to fetch upgrade requests:', err);
      toast.error('Failed to load upgrade requests');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await upgradeAPI.approveRequest(id, { adminNote: adminNote || undefined });
      toast.success('Request approved — user role upgraded to Researcher');
      setSelectedRequest(null);
      setAdminNote('');
      fetchRequests();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!adminNote.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setActionLoading(true);
    try {
      await upgradeAPI.rejectRequest(id, { adminNote });
      toast.success('Request rejected');
      setSelectedRequest(null);
      setAdminNote('');
      fetchRequests();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
      year: '2-digit', month: 'short', day: 'numeric',
    });
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#DEDBC8]/5 border border-[#DEDBC8]/8">
          <ArrowUp size={13} className="text-[#DEDBC8]" />
          <span className="text-xs font-bold text-[#DEDBC8]">Upgrade Requests</span>
        </div>
        <span className="text-[11px] text-gray-500">
          Review and manage academic user upgrade requests
        </span>
      </motion.div>

      {/* ── Status Tabs ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => { setStatusFilter(value); setPage(0); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all border ${
              statusFilter === value
                ? 'bg-[#DEDBC8]/10 text-[#E1E0CC] border-[#DEDBC8]/20'
                : 'text-gray-500 border-transparent hover:text-[#E1E0CC] hover:bg-[#DEDBC8]/5'
            }`}
          >
            {Icon && <Icon size={12} />}
            {label}
            {value === 'PENDING' && (
              <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400">
                {totalElements || ''}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl border border-[#DEDBC8]/8 bg-[#0A0D14]/80 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_100px] gap-4 px-5 py-3 border-b border-[#DEDBC8]/6 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          <span>User</span>
          <span>Details</span>
          <span>Field</span>
          <span>Position</span>
          <span>Date</span>
          <span className="text-center">Actions</span>
        </div>

        {/* Table body */}
        {loading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_100px] gap-4">
                <Skeleton className="h-8 bg-[#DEDBC8]/5" />
                <Skeleton className="h-8 bg-[#DEDBC8]/5" />
                <Skeleton className="h-8 bg-[#DEDBC8]/5" />
                <Skeleton className="h-8 bg-[#DEDBC8]/5" />
                <Skeleton className="h-8 bg-[#DEDBC8]/5" />
                <Skeleton className="h-8 bg-[#DEDBC8]/5" />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-600">
            <ArrowUp size={32} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">No upgrade requests found</p>
            <p className="text-xs mt-1">Try changing the status filter</p>
          </div>
        ) : (
          <div className="divide-y divide-[#DEDBC8]/5">
            {requests.map((req) => (
              <div
                key={req.requestId}
                className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_100px] gap-4 px-5 py-4 items-center hover:bg-[#DEDBC8]/2 transition-colors"
              >
                {/* User info */}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#E1E0CC] truncate">{req.userFullName}</p>
                  <p className="text-[10px] text-gray-500 truncate">{req.userEmail}</p>
                </div>

                {/* Details */}
                <div className="min-w-0">
                  <p className="text-xs text-[#E1E0CC] truncate">{req.institution}</p>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${STATUS_STYLES[req.status] || ''}`}>
                    {req.status}
                  </span>
                </div>

                {/* Field */}
                <div>
                  <p className="text-xs text-gray-400 truncate">{req.researchField}</p>
                </div>

                {/* Position */}
                <div>
                  <p className="text-xs text-gray-400 truncate">{req.position}</p>
                </div>

                {/* Date */}
                <div>
                  <p className="text-[11px] text-gray-500">{formatDate(req.createdAt)}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => setSelectedRequest(req)}
                    className="p-1.5 rounded-lg hover:bg-[#DEDBC8]/10 text-gray-500 hover:text-[#E1E0CC] transition-colors"
                    title="View Details"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={page <= 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#DEDBC8]/10 text-[#E1E0CC] disabled:opacity-30 hover:bg-[#DEDBC8]/20 transition-all"
          >
            Previous
          </button>
          <span className="text-xs text-gray-500">{page + 1} / {totalPages}</span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#DEDBC8]/10 text-[#E1E0CC] disabled:opacity-30 hover:bg-[#DEDBC8]/20 transition-all"
          >
            Next
          </button>
        </div>
      )}

      {/* ── Detail Modal ── */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedRequest(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-2xl border border-[#DEDBC8]/10 bg-[#0F1219] shadow-2xl p-6 space-y-5"
            >
              <h3 className="text-sm font-bold text-[#E1E0CC] flex items-center gap-2">
                <User size={16} />
                Upgrade Request Details
              </h3>

              {/* Info fields */}
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Name</p>
                    <p className="text-xs text-[#E1E0CC]">{selectedRequest.userFullName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Email</p>
                    <p className="text-xs text-[#E1E0CC]">{selectedRequest.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Institution</p>
                    <p className="text-xs text-[#E1E0CC]">{selectedRequest.institution}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Field</p>
                    <p className="text-xs text-[#E1E0CC]">{selectedRequest.researchField}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Position</p>
                    <p className="text-xs text-[#E1E0CC]">{selectedRequest.position}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">ORCID</p>
                    <p className="text-xs text-[#E1E0CC]">{selectedRequest.orcid || '—'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Reason</p>
                  <p className="text-xs text-gray-400 mt-1 p-3 rounded-xl bg-[#0A0D14] border border-[#DEDBC8]/5 leading-relaxed">
                    "{selectedRequest.reason}"
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-bold border ${STATUS_STYLES[selectedRequest.status] || ''}`}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>

              {/* Admin note / action */}
              {selectedRequest.status === 'PENDING' && (
                <div className="space-y-3 pt-3 border-t border-[#DEDBC8]/6">
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Admin note (required for rejection)..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border text-xs outline-none bg-[#0A0D14] border-[#DEDBC8]/10 text-[#E1E0CC] placeholder:text-gray-500 focus:border-[#4F8CFF]/50 resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      disabled={actionLoading}
                      onClick={() => handleApprove(selectedRequest.requestId)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition-all flex items-center justify-center gap-1.5"
                    >
                      {actionLoading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                      Approve
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleReject(selectedRequest.requestId)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-all flex items-center justify-center gap-1.5"
                    >
                      {actionLoading ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Show notes for non-pending */}
              {selectedRequest.status !== 'PENDING' && selectedRequest.adminNote && (
                <div className="p-3 rounded-xl bg-[#0A0D14] border border-[#DEDBC8]/5">
                  <p className="text-[10px] text-gray-500 font-semibold mb-1">Admin Note:</p>
                  <p className="text-xs text-gray-400">{selectedRequest.adminNote}</p>
                </div>
              )}

              <button
                onClick={() => { setSelectedRequest(null); setAdminNote(''); }}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#DEDBC8]/10 text-[#E1E0CC] hover:bg-[#DEDBC8]/20 transition-all"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
