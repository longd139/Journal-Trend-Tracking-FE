import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Clock, CheckCircle2, XCircle, Eye, Inbox, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { reportAPI } from './api';
import { paperAPI } from '../search/paper.api';
import { UpgradeRequestDialog } from '../user/UpgradeRequestDialog';

const spring = { type: 'spring', stiffness: 300, damping: 30 };

const STATUS_META = {
  pending:   { icon: Clock,         bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', labelKey: 'myReports.status.pending' },
  reviewed:  { icon: Eye,           bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/20',   labelKey: 'myReports.status.reviewed' },
  resolved:  { icon: CheckCircle2,  bg: 'bg-emerald-500/10',text: 'text-emerald-400',border: 'border-emerald-500/20',labelKey: 'myReports.status.resolved' },
  dismissed: { icon: XCircle,       bg: 'bg-gray-500/10',   text: 'text-gray-400',   border: 'border-gray-500/20',   labelKey: 'myReports.status.dismissed' },
};

function StatusBadge({ status, t }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${meta.bg} ${meta.text} ${meta.border}`}>
      <Icon size={10} />
      {t(meta.labelKey)}
    </span>
  );
}

export default function MyReportsPage() {
  const { t } = useTranslation('reports');

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const currentRole = sessionStorage.getItem('userRole') || 'researcher';
  const isAcademic = currentRole === 'academic_user' || currentRole === 'academic';
  const [searchesLeft, setSearchesLeft] = useState(null);
  const quotaExhausted = isAcademic && searchesLeft === 0;
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    if (!isAcademic) return;
    (async () => {
      try {
        const data = await paperAPI.getUsage();
        if (data?.remainingSearches != null) setSearchesLeft(data.remainingSearches);
      } catch { /* silently ignore */ }
    })();
  }, [isAcademic]);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getMyReports({ page, size: 15 });
      if (res?.data) {
        setReports(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  function formatDate(ts) {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="relative min-h-screen bg-transparent">
      {/* Lock overlay when quota exhausted */}
      {quotaExhausted && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center space-y-4 px-6 py-10 rounded-2xl border border-border bg-card max-w-sm">
            <Lock size={32} className="text-primary/40 mx-auto" />
            <div>
              <p className="text-sm font-semibold text-foreground">Search limit reached</p>
              <p className="text-xs text-muted-foreground mt-1">
                You have used all your monthly searches. Upgrade to Researcher to view my reports and access all features.
              </p>
            </div>
            <button
              onClick={() => setUpgradeOpen(true)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-foreground transition-colors"
            >
              Upgrade to Researcher
            </button>
          </div>
        </div>
      )}
    <div className="min-h-screen p-6 lg:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
        <h1 className="text-xl font-bold text-foreground font-display">{t('myReports.heading')}</h1>
        <p className="text-sm text-muted-foreground">{t('myReports.subtitle')}</p>
      </motion.div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-card-elevated border border-card-elevated-border animate-pulse" />
          ))
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Inbox size={32} className="text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">{t('myReports.empty')}</p>
          </div>
        ) : (
          reports.map((r, i) => (
            <motion.div
              key={r.reportId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, ...spring }}
              className="p-4 rounded-2xl bg-card-elevated border border-card-elevated-border hover:border-primary/15 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-card-hover border border-border/50">
                    <FileText size={16} className="text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={r.status} t={t} />
                      <span className="text-[10px] text-muted-foreground">{formatDate(r.createdAt)}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-foreground line-clamp-1">{r.title}</h4>
                    {r.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.description}</p>
                    )}
                    {r.adminNote && (
                      <div className="mt-2 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                        <p className="text-[11px] text-blue-400/80">
                          <span className="font-medium">{t('myReports.adminLabel')}</span> {r.adminNote}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
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
    </div>

    {/* Upgrade Request Dialog */}
    <AnimatePresence>
      <UpgradeRequestDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </AnimatePresence>
    </div>
  );
}
