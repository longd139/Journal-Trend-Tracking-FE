import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, RefreshCw, Search, X, ExternalLink,
  CheckCircle, XCircle, Clock, Loader2,
  ChevronLeft, ChevronRight, Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from './api';

const API_BASE = import.meta.env.VITE_API_URL || '';

/* ═══════════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════════ */

const STATUS_STYLES = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  fulfilled: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const FILTER_TABS = [
  { key: undefined, label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'fulfilled', label: 'Fulfilled' },
  { key: 'rejected', label: 'Rejected' },
];

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
            className="w-full max-w-lg rounded-2xl border border-primary/10 bg-card shadow-2xl max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-primary/10 shrink-0">
              <h2 className="text-sm font-bold text-foreground">{title}</h2>
              <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">{children}</div>
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
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState(undefined); // undefined = all
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Fulfill modal
  const [fulfillModal, setFulfillModal] = useState({ open: false, request: null });
  const [fulfillUrl, setFulfillUrl] = useState('');
  const [fulfillNote, setFulfillNote] = useState('');

  // File upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Reject modal
  const [rejectModal, setRejectModal] = useState({ open: false, request: null });
  const [rejectNote, setRejectNote] = useState('');

  // Find-candidates modal
  const [candidatesModal, setCandidatesModal] = useState({ open: false, request: null });
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPdfRequests({ status: filter, page, size: 20 });
      const payload = res?.data;
      // Backend may return Spring Page { content, totalPages, ... } or a flat array
      if (Array.isArray(payload)) {
        setRequests(payload);
        setTotalPages(1);
        setTotalElements(payload.length);
      } else {
        setRequests(payload?.content || []);
        setTotalPages(payload?.totalPages || 0);
        setTotalElements(payload?.totalElements || 0);
      }
    } catch {
      toast.error('Failed to load PDF requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // Reset page when filter changes
  useEffect(() => { setPage(0); }, [filter]);

  /* ───────── Actions ───────── */

  const openFulfill = (req) => {
    setFulfillModal({ open: true, request: req });
    setFulfillUrl('');
    setFulfillNote('');
    setUploadFile(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate PDF
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted');
      return;
    }

    // Validate size ≤ 20MB
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File must be less than 20MB');
      return;
    }

    setUploadFile(file);
    setFulfillUrl(''); // clear URL when file is selected
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('File must be less than 20MB');
      return;
    }

    setUploadFile(file);
    setFulfillUrl('');
  };

  const handleUploadFulfill = async () => {
    const req = fulfillModal.request;
    if (!uploadFile) {
      toast.error('Please select a PDF file');
      return;
    }
    setUploading(true);
    try {
      await adminAPI.uploadPdfRequest(req.requestId, uploadFile, fulfillNote.trim() || undefined);
      toast.success('PDF uploaded — request fulfilled and user notified');
      setFulfillModal({ open: false, request: null });
      setUploadFile(null);
      fetchRequests();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload PDF');
    } finally {
      setUploading(false);
    }
  };

  const handleCandidatesUpload = async () => {
    const req = candidatesModal.request;
    if (!uploadFile) {
      toast.error('Please select a PDF file');
      return;
    }
    setUploading(true);
    try {
      await adminAPI.uploadPdfRequest(req.requestId, uploadFile, undefined);
      toast.success('PDF uploaded — request fulfilled and user notified');
      setCandidatesModal({ open: false, request: null });
      setUploadFile(null);
      fetchRequests();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload PDF');
    } finally {
      setUploading(false);
    }
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
      toast.success('PDF request fulfilled — user notified');
      setFulfillModal({ open: false, request: null });
      fetchRequests();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to fulfill request');
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
      toast.success('PDF request rejected — user notified');
      setRejectModal({ open: false, request: null });
      fetchRequests();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFindCandidates = async (req) => {
    setCandidatesModal({ open: true, request: req });
    setCandidates([]);
    setCandidatesLoading(true);
    setUploadFile(null);
    try {
      const res = await adminAPI.findPdfCandidates(req.requestId);
      setCandidates(res?.data?.candidates || res?.data || []);
      if (!res?.data?.candidates?.length && (!Array.isArray(res?.data) || res?.data?.length === 0)) {
        toast.info('No PDF candidates found');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to find candidates');
    } finally {
      setCandidatesLoading(false);
    }
  };

  const quickFulfill = (candidateUrl) => {
    setFulfillUrl(candidateUrl);
    setUploadFile(null);
    setCandidatesModal({ open: false, request: null });
    // Open fulfill modal with the same request and pre-filled URL
    const req = candidatesModal.request;
    if (req) {
      setFulfillModal({ open: true, request: req });
    }
  };

  /* ───────── Render ───────── */

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const size = 20;

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
          className="p-2.5 rounded-xl bg-white/[0.04] border border-primary/10 text-gray-400 hover:text-white active:scale-[0.97] transition-all duration-150"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key ?? 'all'}
            onClick={() => setFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filter === tab.key
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-primary/10 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary/10 text-left">
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
                    No PDF requests found
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  const isProcessing = actionLoading === req.requestId;
                  return (
                    <tr
                      key={req.requestId}
                      className="border-b border-primary/5 hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Requestor */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-xs text-foreground font-medium">
                            {req.requestedByName || req.requestedByEmail || 'Unknown'}
                          </span>
                          {req.requestedByName && (
                            <span className="text-[10px] text-gray-500">{req.requestedByEmail}</span>
                          )}
                        </div>
                      </td>

                      {/* Paper */}
                      <td className="px-4 py-3 max-w-[220px]">
                        <div className="text-xs text-foreground font-medium leading-relaxed line-clamp-2">
                          {req.paperTitle || '—'}
                        </div>
                        {req.doi && (
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5 truncate">
                            DOI: {req.doi}
                          </div>
                        )}
                      </td>

                      {/* Journal */}
                      <td className="px-4 py-3 text-xs text-gray-400 max-w-[140px] truncate">
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
                      <td className="px-4 py-3 max-w-[160px]">
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
                              title="Find PDF candidates from OpenAlex"
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
                            href={req.pdfUrl.startsWith('http') ? req.pdfUrl : `${API_BASE}${req.pdfUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-primary/10">
            <span className="text-xs text-gray-500">
              Page {page + 1} of {totalPages} ({totalElements} total)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ════════ Find Candidates Modal ════════ */}
      <Modal
        open={candidatesModal.open}
        onClose={() => { setCandidatesModal({ open: false, request: null }); setUploadFile(null); }}
        title="PDF Candidates from OpenAlex"
      >
        <div className="space-y-4">
          {candidatesModal.request && (
            <div className="p-3 rounded-xl bg-black/30 border border-primary/10">
              <p className="text-xs text-foreground font-medium line-clamp-2">
                {candidatesModal.request.paperTitle}
              </p>
              {candidatesModal.request.doi && (
                <p className="text-[10px] text-gray-500 mt-1 font-mono">DOI: {candidatesModal.request.doi}</p>
              )}
            </div>
          )}

          {candidatesLoading ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <Loader2 size={20} className="animate-spin mr-2" />
              Searching OpenAlex...
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-xs">
              <Search size={24} className="mx-auto mb-2 opacity-30" />
              No PDF candidates found. You can upload a PDF directly below.
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Found {candidates.length} candidate(s)
              </p>
              {candidates.map((c, i) => {
                const url = typeof c === 'string' ? c : c?.url || c?.pdfUrl || c?.link;
                const source = typeof c === 'string' ? null : c?.source || c?.repository;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl border border-primary/10 bg-black/20"
                  >
                    <div className="flex-1 min-w-0">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline break-all line-clamp-1"
                      >
                        {url}
                      </a>
                      {source && (
                        <div className="text-[9px] text-gray-500 mt-0.5">Source: {source}</div>
                      )}
                    </div>
                    <button
                      onClick={() => quickFulfill(url)}
                      className="shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-colors"
                    >
                      Use this
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Divider ── */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-primary/10" />
            <span className="text-[10px] font-medium text-gray-600 uppercase tracking-wider">or upload your own PDF</span>
            <div className="flex-1 h-px bg-primary/10" />
          </div>

          {/* ── Upload drop zone ── */}
          {uploadFile ? (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground font-medium truncate">{uploadFile.name}</p>
                <p className="text-[10px] text-gray-500">
                  {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => { setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="p-1 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="relative flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-primary/20 bg-black/20 cursor-pointer hover:border-primary/40 hover:bg-black/30 transition-all group"
            >
              <div className="p-2.5 rounded-xl bg-white/[0.04] text-gray-500 group-hover:text-primary transition-colors">
                <Upload size={22} />
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 group-hover:text-primary transition-colors">
                  <span className="text-primary font-medium">Click to browse</span> or drag & drop
                </p>
                <p className="text-[10px] text-gray-600 mt-0.5">PDF only · Max 20 MB</p>
              </div>
            </div>
          )}

          {uploadFile && (
            <button
              onClick={handleCandidatesUpload}
              disabled={uploading}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Uploading to Cloudinary...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  Upload & Fulfill
                </>
              )}
            </button>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => { setCandidatesModal({ open: false, request: null }); setUploadFile(null); }}
              className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* ════════ Fulfill Modal ════════ */}
      <Modal
        open={fulfillModal.open}
        onClose={() => { setFulfillModal({ open: false, request: null }); setUploadFile(null); }}
        title="Fulfill PDF Request"
      >
        <div className="space-y-4">
          {fulfillModal.request && (
            <div className="p-3 rounded-xl bg-black/30 border border-primary/10">
              <p className="text-xs text-foreground font-medium line-clamp-2">
                {fulfillModal.request.paperTitle}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                by {fulfillModal.request.requestedByName || fulfillModal.request.requestedByEmail}
              </p>
            </div>
          )}

          {/* ── File upload area ── */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Upload PDF <span className="text-red-400">*</span>
            </label>

            {uploadFile ? (
              /* File selected */
              <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground font-medium truncate">{uploadFile.name}</p>
                  <p className="text-[10px] text-gray-500">
                    {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => { setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="p-1 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              /* Drop zone */
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="relative flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-primary/20 bg-black/20 cursor-pointer hover:border-primary/40 hover:bg-black/30 transition-all group"
              >
                <div className="p-2.5 rounded-xl bg-white/[0.04] text-gray-500 group-hover:text-primary transition-colors">
                  <Upload size={22} />
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 group-hover:text-primary transition-colors">
                    <span className="text-primary font-medium">Click to browse</span> or drag & drop
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5">PDF only · Max 20 MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}

            {/* Upload button when file is selected */}
            {uploadFile && (
              <button
                onClick={handleUploadFulfill}
                disabled={uploading}
                className="mt-3 w-full py-2.5 rounded-xl text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Uploading to Cloudinary...
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    Upload & Fulfill
                  </>
                )}
              </button>
            )}
          </div>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-primary/10" />
            <span className="text-[10px] font-medium text-gray-600 uppercase tracking-wider">or paste URL</span>
            <div className="flex-1 h-px bg-primary/10" />
          </div>

          {/* ── URL input ── */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              PDF URL
            </label>
            <input
              type="url"
              value={fulfillUrl}
              onChange={(e) => { setFulfillUrl(e.target.value); setUploadFile(null); }}
              placeholder="https://example.com/paper.pdf"
              className="w-full px-3 py-2.5 rounded-lg border border-primary/20 bg-black/40 text-xs text-foreground placeholder:text-gray-600 outline-none focus:border-primary/40 transition-colors"
            />
          </div>

          {/* ── Admin note ── */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Admin Note (optional)
            </label>
            <textarea
              value={fulfillNote}
              onChange={(e) => setFulfillNote(e.target.value)}
              placeholder="Add a note for the user..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-primary/20 bg-black/40 text-xs text-foreground placeholder:text-gray-600 outline-none focus:border-primary/40 transition-colors resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => { setFulfillModal({ open: false, request: null }); setUploadFile(null); }}
              className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            {/* URL fulfill button (only when no file selected) */}
            {!uploadFile && (
              <button
                onClick={handleFulfill}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'Processing...' : 'Fulfill'}
              </button>
            )}
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
            <div className="p-3 rounded-xl bg-black/30 border border-primary/10">
              <p className="text-xs text-foreground font-medium line-clamp-2">
                {rejectModal.request.paperTitle}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                by {rejectModal.request.requestedByName || rejectModal.request.requestedByEmail}
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
              className="w-full px-3 py-2.5 rounded-lg border border-primary/20 bg-black/40 text-xs text-foreground placeholder:text-gray-600 outline-none focus:border-primary/40 transition-colors resize-none"
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
