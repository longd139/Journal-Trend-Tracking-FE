import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  Flag, RefreshCw, Clock, CheckCircle2, XCircle, Eye, FileText,
  Inbox, ChevronLeft, ChevronRight, User,
} from 'lucide-react';
import { adminAPI } from '../admin/api';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '../../components/ui/sheet';

const spring = { type: 'spring', stiffness: 300, damping: 30 };

const STATUS_META = {
  pending:   { icon: Clock,         bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', accent: '#F59E0B', label: 'Pending' },
  reviewed:  { icon: Eye,           bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/20',   accent: '#4F8CFF', label: 'Reviewed' },
  resolved:  { icon: CheckCircle2,  bg: 'bg-emerald-500/10',text: 'text-emerald-400',border: 'border-emerald-500/20',accent: '#34D399', label: 'Resolved' },
  dismissed: { icon: XCircle,       bg: 'bg-gray-500/10',   text: 'text-gray-400',   border: 'border-gray-500/20',   accent: '#6B7280', label: 'Dismissed' },
};

const STATUS_FILTERS = [
  { key: null, labelKey: 'reports.filterAll' },
  { key: 'pending', labelKey: 'reports.filterPending' },
  { key: 'reviewed', labelKey: 'reports.filterReviewed' },
  { key: 'resolved', labelKey: 'reports.filterResolved' },
  { key: 'dismissed', labelKey: 'reports.filterDismissed' },
];

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${meta.bg} ${meta.text} ${meta.border}`}>
      <Icon size={10} />
      {meta.label}
    </span>
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

export default function AdminReportsPage() {
  const { t } = useTranslation('admin');
  const { t: tc } = useTranslation('common');

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getReports({ page, size: 15, status: statusFilter });
      if (res?.data) {
        setReports(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const openDetail = async (report) => {
    try {
      const res = await adminAPI.getReportDetail(report.reportId);
      setSelectedReport(res?.data || report);
    } catch {
      setSelectedReport(report);
    }
    setSheetOpen(true);
  };

  const handleStatusUpdate = async (reportId, status, adminNote) => {
    setUpdating(true);
    try {
      const res = await adminAPI.updateReportStatus(reportId, { status, adminNote });
      setSelectedReport(res?.data || { ...selectedReport, status });
      fetchReports();
    } catch (err) {
      console.error('Failed to update report status:', err);
    } finally {
      setUpdating(false);
    }
  };

  function formatDate(ts) {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

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
          <div className="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/20">
            <Flag size={20} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground font-display">
              {t('reports.title')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('reports.description')}
            </p>
          </div>
        </div>
        <button
          onClick={fetchReports}
          className="p-2 rounded-xl bg-card-elevated border border-card-elevated-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key || 'all'}
            onClick={() => { setStatusFilter(f.key); setPage(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
              ${statusFilter === f.key
                ? 'bg-primary/15 text-primary border-primary/30'
                : 'bg-card-elevated text-muted-foreground border-card-elevated-border hover:border-primary/15 hover:text-foreground'
              }`}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>

      {/* Report List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Inbox size={32} className="text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No reports found.</p>
          </div>
        ) : (
          reports.map((r, i) => {
            const meta = STATUS_META[r.status] || STATUS_META.pending;
            const Icon = meta.icon;
            return (
              <motion.div
                key={r.reportId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, ...spring }}
                onClick={() => openDetail(r)}
                className="group cursor-pointer flex items-start gap-4 p-4 rounded-2xl bg-card-elevated border border-card-elevated-border hover:border-primary/15 transition-all"
              >
                <div className={`p-2.5 rounded-xl border ${meta.bg} ${meta.border}`}>
                  <Icon size={16} style={{ color: meta.accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <StatusBadge status={r.status} />
                    <span className="text-[10px] text-muted-foreground">{formatDate(r.createdAt)}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground line-clamp-1">{r.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <User size={10} className="text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">{r.userFullName || r.userEmail || 'Unknown'}</span>
                  </div>
                  {r.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{r.description}</p>
                  )}
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
            className="p-2 rounded-xl bg-card-elevated border border-card-elevated-border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-muted-foreground px-3">{page + 1} / {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="p-2 rounded-xl bg-card-elevated border border-card-elevated-border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 bg-background border-l border-card-elevated-border">
          {selectedReport && (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-5 border-b border-card-elevated-border">
                <SheetTitle className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <FileText size={16} className="text-orange-400" />
                  </div>
                  <span className="text-base font-display">{t('reports.detail')}</span>
                </SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Status */}
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedReport.status} />
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-foreground">{selectedReport.title}</h3>

                {/* Reporter */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User size={14} />
                  <span>{t('reports.reporter')}: {selectedReport.userFullName} ({selectedReport.userEmail})</span>
                </div>

                {/* Type */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{t('reports.type')}:</span>
                  <span className="text-xs font-medium text-foreground uppercase">{selectedReport.reportType}</span>
                </div>

                {/* Target */}
                {selectedReport.targetType && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{t('reports.target')}:</span>
                    <span className="text-xs font-medium text-foreground">{selectedReport.targetType}</span>
                  </div>
                )}

                {/* Description */}
                {selectedReport.description && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">{t('report.description')}</p>
                    <p className="text-sm text-foreground bg-card-hover rounded-xl p-3 border border-card-elevated-border">
                      {selectedReport.description}
                    </p>
                  </div>
                )}

                {/* Admin Note */}
                {selectedReport.adminNote && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">{t('reports.adminNote')}</p>
                    <p className="text-sm text-blue-400/80 bg-blue-500/5 rounded-xl p-3 border border-blue-500/10">
                      {selectedReport.adminNote}
                    </p>
                  </div>
                )}

                {/* Resolved By */}
                {selectedReport.resolvedByAdminName && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    <span>Resolved by {selectedReport.resolvedByAdminName} at {formatDate(selectedReport.resolvedAt)}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-5 border-t border-card-elevated-border space-y-2">
                {selectedReport.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedReport.reportId, 'reviewed', null)}
                    disabled={updating}
                    className="w-full py-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-medium hover:bg-blue-500/20 transition-all disabled:opacity-50"
                  >
                    {t('reports.markReviewed')}
                  </button>
                )}
                {(selectedReport.status === 'pending' || selectedReport.status === 'reviewed') && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(selectedReport.reportId, 'resolved', selectedReport.adminNote || '')}
                      disabled={updating}
                      className="w-full py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-medium hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                    >
                      {t('reports.resolve')}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedReport.reportId, 'dismissed', selectedReport.adminNote || '')}
                      disabled={updating}
                      className="w-full py-2.5 rounded-xl bg-gray-500/10 text-gray-400 border border-gray-500/20 text-sm font-medium hover:bg-gray-500/20 transition-all disabled:opacity-50"
                    >
                      {t('reports.dismiss')}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
