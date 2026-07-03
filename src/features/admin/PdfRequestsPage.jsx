import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, RefreshCw, Search, X, ExternalLink,
  CheckCircle, XCircle, Clock, Loader2, Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from './api';

/* ═══════════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════════ */

const STATUS_STYLES = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  fulfilled: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  const icons = { pending: Clock, fulfilled: CheckCircle, rejected: XCircle };
  const Icon = icons[status] || Clock;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${cls}`}>
      <Icon size={11} />
      {status}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString();
}

/* ═══════════════════════════════════════════════════════════════════════════
   Modal
   ═══════════════════════════════════════════════════════════════════════════ */

function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-[#DEDBC8]/10 bg-[#151922] shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#DEDBC8]/10">
              <h2 className="text-sm font-bold text-[#E1E0CC]">{title}</h2>
              <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PdfRequestsPage
   ═══════════════════════════════════════════════════════════════════════════ */

export default function PdfRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // requestId of currently processing row

  // Fulfill modal
  const [fulfillModal, setFulfillModal] = useState({ open: false, request: null });
  const [fulfillUrl, setFulfillUrl] = useState('');
  const [fulfillNote, setFulfillNote] = useState('');

  // Reject modal
  const [rejectModal, setRejectModal] = useState({ open: false, request: null });
  const [rejectNote, setRejectNote] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPdfRequests();
      setRequests(res?.data || []);
    } catch {
      toast.error('Failed to load PDF requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  /* ───────── Actions ───────── */

  const openFulfill = (req) => {
    setFulfillModal({ open: true, request: req });
    setFulfillUrl(req.pdfUrl || '');
    setFulfillNote('');
  };

  const handleFulfill = async () => {
    const req = fulfillModal.request;
    if (!fulfillUrl.trim()) {
      toast.error('Please enter a PDF URL');
      return;
    }
    setActionLoading(req.requestId);
    try {
      await adminAPI.fulfillPdfRequest(req.requestId, {
        pdfUrl: fulfillUrl.trim(),
        adminNote: fulfillNote.trim() || undefined,
      });
      toast.success('PDF request fulfilled');
      setFulfillModal({ open: false, request: null });
      fetchRequests();
    } catch {
      toast.error('Failed to fulfill request');
    } finally {
      setActionLoading(null);
    }
  };

  const openReject = (req) => {
    setRejectModal({ open: true, request: req });
    setRejectNote('');
  };

  const handleReject = async () => {
    const req = rejectModal.request;
    if (!rejectNote.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setActionLoading(req.requestId);
    try {
      await adminAPI.rejectPdfRequest(req.requestId, {
        adminNote: rejectNote.trim(),
      });
      toast.success('PDF request rejected');
      setRejectModal({ open: false, request: null });
      fetchRequests();
    } catch {
      toast.error('Failed to reject request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFindCandidates = async (req) => {
    setActionLoading(req.requestId);
    try {
      const res = await adminAPI.findPdfCandidates(req.requestId);
      const count = res?.data?.candidates?.length || 0;
      if (count > 0) {
        toast.success(`Found ${count} PDF candidate(s)`);
      } else {
        toast.info('No PDF candidates found');
      }
    } catch {
      toast.error('Failed to find PDF candidates');
    } finally {
      setActionLoading(null);
    }
  };

  /* ───────── Render ───────── */

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white font-display">PDF Requests</h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage user requests for PDF access to papers
            {pendingCount > 0 && (
              <span className="ml-2 text-amber-400 font-medium">
                ({pendingCount} pending)
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="p-2.5 rounded-xl bg-white/[0.04] border border-[#DEDBC8]/10 text-gray-400 hover:text-white active:scale-[0.97] transition-all duration-150"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: requests.length, color: 'text-[#DEDBC8]' },
          { label: 'Fulfilled', value: requests.filter((r) => r.status === 'fulfilled').length, color: 'text-emerald-400' },
          { label: 'Rejected', value: requests.filter((r) => r.status === 'rejected').length, color: 'text-red-400' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-[#DEDBC8]/10 bg-[#151922] p-4">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{stat.label}</div>
            <div className={`text-lg font-black mt-1 font-mono tabular-nums ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#DEDBC8]/10 bg-[#151922] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#DEDBC8]/10 text-left">
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Requestor</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Paper</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Journal</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Requested</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Admin Note</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    <Loader2 size={20} className="animate-spin mx-auto mb-2" />
                    Loading requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    <FileText size={28} className="mx-auto mb-2 opacity-30" />
                    No PDF requests yet
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  const isProcessing = actionLoading === req.requestId;
                  return (
                    <tr
                      key={req.requestId}
                      className="border-b border-[#DEDBC8]/5 hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Requestor */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#DEDBC8]/10 flex items-center justify-center">
                            <FileText size={12} className="text-[#DEDBC8]" />
                          </div>
                          <div>
                            <span className="text-xs text-[#E1E0CC] font-medium">
                              {req.requestedByEmail || 'Unknown'}
                            </span>
                            {req.resolvedByAdminEmail && (
                              <div className="text-[9px] text-gray-500">
                                resolved by: {req.resolvedByAdminEmail}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Paper */}
                      <td className="px-4 py-3 max-w-[250px]">
                        <div className="text-xs text-[#E1E0CC] font-medium leading-relaxed line-clamp-2">
                          {req.paperTitle || '—'}
                        </div>
                        {req.doi && (
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5 truncate">
                            DOI: {req.doi}
                          </div>
                        )}
                      </td>

                      {/* Journal */}
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {req.journalName || '—'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={req.status} />
                      </td>

                      {/* Requested At */}
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(req.requestedAt)}
                      </td>

                      {/* Admin Note */}
                      <td className="px-4 py-3 max-w-[180px]">
                        <span className="text-xs text-gray-400 line-clamp-2">
                          {req.adminNote || '—'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        {req.status === 'pending' ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleFindCandidates(req)}
                              disabled={isProcessing}
                              title="Find PDF candidates"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 active:scale-[0.90] transition-all duration-150"
                            >
                              {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                            </button>
                            <button
                              onClick={() => openFulfill(req)}
                              disabled={isProcessing}
                              title="Fulfill with PDF URL"
                              className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-30 active:scale-[0.90] transition-all duration-150"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={() => openReject(req)}
                              disabled={isProcessing}
                              title="Reject request"
                              className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-30 active:scale-[0.90] transition-all duration-150"
                            >
                              <XCircle size={14} />
                            </button>
                          </div>
                        ) : req.pdfUrl ? (
                          <a
                            href={req.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#DEDBC8] hover:underline"
                          >
                            <ExternalLink size={12} />
                            View PDF
                          </a>
                        ) : (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════ Fulfill Modal ════════ */}
      <Modal
        open={fulfillModal.open}
        onClose={() => setFulfillModal({ open: false, request: null })}
        title="Fulfill PDF Request"
      >
        <div className="space-y-4">
          {fulfillModal.request && (
            <div className="p-3 rounded-xl bg-black/30 border border-[#DEDBC8]/10">
              <p className="text-xs text-[#E1E0CC] font-medium line-clamp-2">
                {fulfillModal.request.paperTitle}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                by {fulfillModal.request.requestedByEmail}
              </p>
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              PDF URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              value={fulfillUrl}
              onChange={(e) => setFulfillUrl(e.target.value)}
              placeholder="https://example.com/paper.pdf"
              className="w-full px-3 py-2.5 rounded-lg border border-[#DEDBC8]/20 bg-black/40 text-xs text-[#E1E0CC] placeholder:text-gray-600 outline-none focus:border-[#DEDBC8]/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Admin Note (optional)
            </label>
            <textarea
              value={fulfillNote}
              onChange={(e) => setFulfillNote(e.target.value)}
              placeholder="Add a note for the user..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-[#DEDBC8]/20 bg-black/40 text-xs text-[#E1E0CC] placeholder:text-gray-600 outline-none focus:border-[#DEDBC8]/40 transition-colors resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setFulfillModal({ open: false, request: null })}
              className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleFulfill}
              disabled={actionLoading}
              className="px-4 py-2 rounded-lg text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 transition-colors"
            >
              {actionLoading ? 'Processing...' : 'Fulfill'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ════════ Reject Modal ════════ */}
      <Modal
        open={rejectModal.open}
        onClose={() => setRejectModal({ open: false, request: null })}
        title="Reject PDF Request"
      >
        <div className="space-y-4">
          {rejectModal.request && (
            <div className="p-3 rounded-xl bg-black/30 border border-[#DEDBC8]/10">
              <p className="text-xs text-[#E1E0CC] font-medium line-clamp-2">
                {rejectModal.request.paperTitle}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                by {rejectModal.request.requestedByEmail}
              </p>
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Rejection Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Explain why the PDF is not available..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-[#DEDBC8]/20 bg-black/40 text-xs text-[#E1E0CC] placeholder:text-gray-600 outline-none focus:border-[#DEDBC8]/40 transition-colors resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setRejectModal({ open: false, request: null })}
              className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-400 disabled:opacity-50 transition-colors"
            >
              {actionLoading ? 'Processing...' : 'Reject'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
