import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { History, AlertCircle, ExternalLink } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton';
import { paperAPI } from '../search/paper.api';
import { useStaleWhileRevalidate } from '../../hooks/useStaleWhileRevalidate.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════════ */

function formatRelativeTime(dateStr, t) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return t('readingHistory.justNow');
  if (diffMin === 1) return t('readingHistory.oneMinuteAgo');
  if (diffMin < 60) return t('readingHistory.minutesAgo', { count: diffMin });
  if (diffHour === 1) return t('readingHistory.oneHourAgo');
  if (diffHour < 24) return t('readingHistory.hoursAgo', { count: diffHour });
  if (diffDay === 1) return t('readingHistory.oneDayAgo');
  if (diffDay < 7) return t('readingHistory.daysAgo', { count: diffDay });

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function formatViewedAt(dateStr, t) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }) + t('readingHistory.at') + date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   Skeleton
   ═══════════════════════════════════════════════════════════════════════════ */

function HistoryCardSkeleton() {
  return (
    <div className="rounded-xl border p-5 bg-card border-primary/10">
      <div className="space-y-3">
        <Skeleton className="h-5 w-3/4 rounded bg-card" />
        <Skeleton className="h-4 w-1/2 rounded bg-card" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-32 rounded bg-card" />
          <Skeleton className="h-3 w-20 rounded bg-card" />
          <Skeleton className="h-3 w-24 rounded bg-card" />
        </div>
        <Skeleton className="h-3 w-40 rounded bg-card" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ReadingHistoryPage
   ═══════════════════════════════════════════════════════════════════════════ */

export default function ReadingHistoryPage() {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();
  const currentRole = sessionStorage.getItem('userRole') || 'researcher';

  const { data: history, loading, error, refetch, mutate } = useStaleWhileRevalidate(
    'reading-history-list',
    async () => {
      const response = await paperAPI.getReadingHistory(20);
      let items = null;
      if (Array.isArray(response)) {
        items = response;
      } else if (response && Array.isArray(response.data)) {
        items = response.data;
      } else if (response?.data && Array.isArray(response.data.data)) {
        items = response.data.data;
      }
      return Array.isArray(items) ? items : [];
    },
    { ttl: 5 * 60 * 1000, defaultValue: [] },
  );

  // Auto-refresh when a new paper is viewed (from PaperDetailPage)
  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener('reading-history-changed', handler);
    return () => window.removeEventListener('reading-history-changed', handler);
  }, [refetch]);

  const handlePaperClick = useCallback((item) => {
    if (item.paperId) {
      // Optimistically move this paper to top of history
      mutate((prev) => {
        const arr = Array.isArray(prev) ? [...prev] : [];
        const idx = arr.findIndex((h) => h.paperId === item.paperId || h.readingHistoryId === item.readingHistoryId);
        if (idx > 0) {
          const [moved] = arr.splice(idx, 1);
          arr.unshift({ ...moved, viewedAt: new Date().toISOString() });
        } else if (idx === -1) {
          arr.unshift({ ...item, viewedAt: new Date().toISOString() });
        }
        return arr;
      });
      sessionStorage.setItem('scitrack_referrer', window.location.pathname);
      navigate(`/${currentRole}/papers/${item.paperId}`);
    }
  }, [navigate, currentRole, mutate]);

  const handleDoiClick = useCallback((e, doi) => {
    e.stopPropagation();
    if (doi) {
      window.open(`https://doi.org/${doi}`, '_blank', 'noopener,noreferrer');
    }
  }, []);

  /* ── Error State ── */
  if (error && !loading && history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center space-y-4 bg-transparent p-8">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center">
          <AlertCircle size={28} className="text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">{t('headings.readingHistory')}</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <button
          onClick={refetch}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
        >
          {t('bulk.retry', 'Retry')}
        </button>
      </div>
    );
  }

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="p-8 space-y-6 min-h-screen bg-transparent">
        <div className="space-y-1">
          <Skeleton className="h-7 w-40 rounded bg-card" />
          <Skeleton className="h-4 w-64 rounded bg-card" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <HistoryCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  /* ── Empty State ── */
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center space-y-4 bg-transparent">
        <div className="w-16 h-16 rounded-2xl bg-card border border-primary/10 flex items-center justify-center">
          <History size={28} className="text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">{t('readingHistory.noPapers')}</h3>
          <p className="text-sm text-muted-foreground">{t('readingHistory.startExploring')}</p>
        </div>
        <button
          onClick={() => navigate(`/${currentRole}/search`)}
          className="px-5 py-2.5 rounded-lg text-sm font-bold bg-accent-blue text-white hover:bg-accent-blue/80 transition-all"
        >
          {t('readingHistory.startBtn')}
        </button>
      </div>
    );
  }

  /* ── Data State ── */
  return (
    <div className="p-8 space-y-6 min-h-screen bg-transparent pb-24">
      <div className="space-y-3">
        {history.map((item, i) => {
          const year = item.pubYear;
          const journal = item.journalName;
          const doi = item.doi;
          const citations = item.citationCount;
          const isOA = item.isOpenAccess === true;

          return (
            <motion.div
              key={item.readingHistoryId || item.paperId || i}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => handlePaperClick(item)}
              className="rounded-xl border p-5 bg-card border-primary/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer"
            >
              {/* Title */}
              <h4 className="text-sm font-bold text-foreground mb-1.5 hover:text-accent-blue transition-colors">
                {item.paperTitle || t('readingHistory.untitled')}
              </h4>

              {/* Journal + Year */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                {journal && <span>{journal}</span>}
                {journal && year && <span>·</span>}
                {year && <span>{year}</span>}
                {!journal && !year && <span className="text-muted-foreground">—</span>}
              </div>

              {/* DOI + Citations + Open Access */}
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-2.5 flex-wrap">
                {doi && (
                  <button
                    onClick={(e) => handleDoiClick(e, doi)}
                    className="flex items-center gap-1 text-accent-blue hover:underline transition-all"
                  >
                    <ExternalLink size={10} />
                    DOI: {doi.length > 40 ? doi.slice(0, 40) + '...' : doi}
                  </button>
                )}
                {doi && (citations != null || isOA) && <span>·</span>}
                <span>{t('readingHistory.cited')}{citations != null ? citations.toLocaleString() : '—'}</span>
                {isOA && <span>·</span>}
                {isOA && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                    {t('readingHistory.openAccess')}
                  </span>
                )}
              </div>

              {/* Viewed At */}
              <div className="text-[11px] text-muted-foreground" title={formatViewedAt(item.viewedAt, t)}>
                {t('readingHistory.viewed')}{formatRelativeTime(item.viewedAt, t)}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
