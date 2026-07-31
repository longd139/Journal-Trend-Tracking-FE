import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  GraduationCap, RefreshCw, Clock, CheckCircle2, XCircle, Eye,
  Inbox, ChevronLeft, ChevronRight, User, Building2, FileText,
  Link, ExternalLink, Hash,
} from 'lucide-react';
import { adminAPI } from '../admin/api';
import { toast } from 'sonner';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '../../components/ui/sheet';

const spring = { type: 'spring', stiffness: 300, damping: 30 };

const STATUS_META = {
  PENDING:  { icon: Clock,        bg: 'bg-amber-500/10', text: 'text-amber-400',  border: 'border-amber-500/20',  accent: '#F59E0B', label: 'Pending' },
  APPROVED: { icon: CheckCircle2, bg: 'bg-emerald-500/10',text: 'text-emerald-400',border: 'border-emerald-500/20',accent: '#34D399', label: 'Approved' },
  REJECTED: { icon: XCircle,      bg: 'bg-gray-500/10',   text: 'text-gray-400',   border: 'border-gray-500/20',   accent: '#6B7280', label: 'Rejected' },
};

const FILTERS = [
  { key: null, label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
];

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.PENDING;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${meta.bg} ${meta.text} ${meta.border}`}>
      <Icon size={10} /> {meta.label}
    </span>
  );
}

export default function AdminUpgradeRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState(null);
  const [selected, setSelected] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getUpgradeRequests({ page, size: 15, status: statusFilter });
      if (res?.data) {
        setRequests(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load upgrade requests:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const openDetail = async (req) => {
    try {
      const res = await adminAPI.getUpgradeRequestDetail(req.requestId);
      setSelected(res?.data || req);
    } catch {
      setSelected(req);
    }
    setSheetOpen(true);
  };

  const handleAction = async (action) => {
    if (!selected) return;
    if (action === 'reject' && !selected._adminNote?.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setProcessing(true);
    try {
      if (action === 'approve') {
        await adminAPI.approveUpgradeRequest(selected.requestId, selected._adminNote || '');
      } else {
        await adminAPI.rejectUpgradeRequest(selected.requestId, selected._adminNote || '');
      }
      setSheetOpen(false);
      fetchRequests();
    } catch (err) {
      console.error('Failed to process request:', err);
    } finally {
      setProcessing(false);
    }
  };

  function formatDate(ts) {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  const parseLinks = (paperLinks) => {
    if (!paperLinks) return [];
    try { return JSON.parse(paperLinks); } catch {
      return paperLinks.split('\n').map(l => l.trim()).filter(Boolean);
    }
  };

  const parseFiles = (paperFileUrls) => {
    if (!paperFileUrls) return [];
    try { return JSON.parse(paperFileUrls); } catch { return []; }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={spring}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <GraduationCap size={20} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground font-display">Upgrade Requests</h1>
            <p className="text-sm text-muted-foreground">Review and process researcher upgrade applications</p>
          </div>
        </div>
        <button onClick={fetchRequests}
          className="p-2 rounded-xl bg-card-elevated border border-card-elevated-border text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw size={16} />
        </button>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f.key || 'all'} onClick={() => { setStatusFilter(f.key); setPage(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
              ${statusFilter === f.key
                ? 'bg-primary/15 text-primary border-primary/30'
                : 'bg-card-elevated text-muted-foreground border-card-elevated-border hover:border-primary/15'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-card-elevated border border-card-elevated-border animate-pulse" />
          ))
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Inbox size={32} className="text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No upgrade requests found.</p>
          </div>
        ) : (
          requests.map((r, i) => {
            const meta = STATUS_META[r.status] || STATUS_META.PENDING;
            const Icon = meta.icon;
            return (
              <motion.div key={r.requestId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, ...spring }}
                onClick={() => openDetail(r)}
                className="group cursor-pointer flex items-start gap-4 p-4 rounded-2xl bg-card-elevated border border-card-elevated-border hover:border-primary/15 transition-all">
                <div className={`p-2.5 rounded-xl border ${meta.bg} ${meta.border}`}>
                  <Icon size={16} style={{ color: meta.accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <StatusBadge status={r.status} />
                    <span className="text-[10px] text-muted-foreground">{formatDate(r.createdAt)}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">{r.userFullName}</h4>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Building2 size={10} /> {r.institution}</span>
                    <span className="flex items-center gap-1"><User size={10} /> {r.position}</span>
                    {r.researchField && <span className="truncate">{r.researchField}</span>}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="p-2 rounded-xl bg-card-elevated border border-card-elevated-border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-muted-foreground px-3">{page + 1} / {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="p-2 rounded-xl bg-card-elevated border border-card-elevated-border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 bg-background border-l border-card-elevated-border">
          {selected && (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-5 border-b border-card-elevated-border">
                <SheetTitle className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <GraduationCap size={16} className="text-emerald-400" />
                  </div>
                  <span className="text-base font-display">Upgrade Request</span>
                </SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <StatusBadge status={selected.status} />

                <div className="space-y-3">
                  <DetailRow icon={User} label="Name" value={selected.userFullName} />
                  <DetailRow icon={Building2} label="Institution" value={selected.institution} />
                  <DetailRow icon={GraduationCap} label="Position" value={selected.position} />
                  <DetailRow icon={FileText} label="Field" value={selected.researchField} />
                  {selected.orcid && <DetailRow icon={Hash} label="ORCID" value={selected.orcid} />}
                  <DetailRow icon={User} label="Email" value={selected.userEmail} />
                </div>

                {/* Reason */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Reason</p>
                  <p className="text-sm text-foreground bg-card-hover rounded-xl p-3 border border-card-elevated-border">
                    {selected.reason}
                  </p>
                </div>

                {/* Paper Links */}
                {selected.paperLinks && parseLinks(selected.paperLinks).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                      <Link size={11} /> Research Paper Links
                    </p>
                    <div className="space-y-1">
                      {parseLinks(selected.paperLinks).map((link, i) => (
                        <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-primary hover:underline break-all">
                          <ExternalLink size={10} className="shrink-0" />
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Uploaded Files */}
                {selected.paperFileUrls && parseFiles(selected.paperFileUrls).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                      <FileText size={11} /> Uploaded PDF Files
                    </p>
                    <div className="space-y-1">
                      {parseFiles(selected.paperFileUrls).map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-primary hover:underline break-all">
                          <FileText size={10} className="shrink-0" />
                          PDF Document {i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Note */}
                {selected.status !== 'PENDING' && (
                  <>
                    {selected.adminNote && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Admin Note</p>
                        <p className="text-sm text-blue-400/80 bg-blue-500/5 rounded-xl p-3 border border-blue-500/10">
                          {selected.adminNote}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      <span>Reviewed by {selected.reviewedByName || 'admin'} at {formatDate(selected.reviewedAt)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              {selected.status === 'PENDING' && (
                <div className="p-5 border-t border-card-elevated-border space-y-3">
                  <textarea
                    placeholder="Admin note (optional)..."
                    value={selected._adminNote || ''}
                    onChange={(e) => setSelected({ ...selected, _adminNote: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg text-xs border border-input bg-input-background text-foreground placeholder:text-muted-foreground/50 outline-none resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleAction('approve')} disabled={processing}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-medium hover:bg-emerald-500/20 transition-all disabled:opacity-50">
                      Approve & Upgrade
                    </button>
                    <button onClick={() => handleAction('reject')} disabled={processing}
                      className="flex-1 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-medium hover:bg-red-500/20 transition-all disabled:opacity-50">
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon size={13} className="text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
      <span className="text-sm text-foreground truncate">{value}</span>
    </div>
  );
}
