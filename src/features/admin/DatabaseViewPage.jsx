import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Database, FileText, Users, Hash, BookOpen,
  TrendingUp, Network, RefreshCw, Clock,
  Globe, Brain, Archive, Layers, FileCheck,
  AlertTriangle, CheckCircle2, Sparkles,
} from 'lucide-react';
import { adminAPI } from './api';

/* ═══════════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════════ */

const card = 'bg-card border border-border rounded-2xl';

const ZERO_RETRY_DELAY_MS = 4_000; // retry after 4s if cache was stale (all zeros)

const SOURCE_META = {
  openalex: { icon: Globe, label: 'OpenAlex', color: '#4F8CFF' },
  semantic_scholar: { icon: Brain, label: 'Semantic Scholar', color: '#A78BFA' },
  arxiv: { icon: Archive, label: 'arXiv', color: '#34D399' },
  core: { icon: Layers, label: 'CORE', color: '#F59E0B' },
};

const NEO4J_COLOR = '#4F8CFF';
const PAPER_COLOR = '#4F8CFF';
const AUTHOR_COLOR = '#34D399';
const KEYWORD_COLOR = '#A78BFA';
const JOURNAL_COLOR = '#F59E0B';

/* ═══════════════════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════════════════ */

function StatCard({ label, value, Icon, accent, sub }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className={`${card} p-4 flex items-center gap-3.5 group cursor-default hover:shadow-lg hover:shadow-primary/5`}
    >
      <div
        className="p-2.5 rounded-xl shrink-0 transition-colors"
        style={{ background: `${accent}14`, color: accent }}
      >
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
        <div className="text-lg font-bold text-foreground font-mono tabular-nums">
          {value?.toLocaleString() ?? '—'}
        </div>
        {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
      </div>
    </motion.div>
  );
}

function Section({ title, Icon, accent, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`${card} p-5`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 rounded-full" style={{ background: accent }} />
        <Icon size={14} style={{ color: accent }} />
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex-1 h-2 bg-primary/5 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}60, ${color})` }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Loading Skeleton
   ═══════════════════════════════════════════════════════════════════════════ */

function Skeleton() {
  return (
    <div className="p-6 space-y-5 animate-pulse">
      <div className="h-7 w-48 bg-primary/8 rounded" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${card} p-4 flex items-center gap-3`}>
            <div className="h-10 w-10 bg-primary/8 rounded-xl" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-16 bg-primary/8 rounded" />
              <div className="h-5 w-20 bg-primary/5 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${card} p-5 space-y-3`}>
          <div className="h-5 w-20 bg-primary/8 rounded" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-primary/5 rounded-lg" />
            ))}
          </div>
        </div>
        <div className={`${card} p-5 space-y-3`}>
          <div className="h-5 w-24 bg-primary/8 rounded" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-primary/5 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function DatabaseViewPage() {
  const { t } = useTranslation('admin');
  const { t: tc } = useTranslation('common');
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const cancelledRef = useRef(false);
  const zeroRetryRef = useRef(null);

  const fetchStats = useCallback(async ({ isRetry = false } = {}) => {
    if (!isRetry) setIsLoading(true);
    setError(null);
    try {
      const response = await adminAPI.getSyncStats();
      if (cancelledRef.current) return;

      const data = response.data || response;

      // ── Edge case: cache just expired → all zeros ──
      // BE says retry after 3–5 s; we use 4 s.
      if (!isRetry && data?.papers?.total === 0) {
        setStats(data); // show zeros briefly rather than a loader
        setIsLoading(false);
        zeroRetryRef.current = setTimeout(() => {
          if (!cancelledRef.current) fetchStats({ isRetry: true });
        }, ZERO_RETRY_DELAY_MS);
        return;
      }

      setStats(data);
    } catch (err) {
      if (!cancelledRef.current) {
        console.error('Stats error:', err);
        setError(err?.message || t('database.loadError'));
      }
    } finally {
      if (!cancelledRef.current) setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    cancelledRef.current = false;
    fetchStats();
    return () => {
      cancelledRef.current = true;
      clearTimeout(zeroRetryRef.current);
    };
  }, [fetchStats]);

  /* ─── Loading ─── */
  if (isLoading) return <Skeleton />;

  /* ─── Error ─── */
  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground mb-1">{t('database.loadError')}</h3>
          <p className="text-xs text-red-400">{error}</p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-[0.97]"
        >
          {tc('actions.retry')}
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const { papers, authors, keywords, journals, researchFields, researchTopics, neo4j, syncLogs } = stats;

  /* ─── Derived values ─── */
  const sourceEntries = papers?.bySource
    ? Object.entries(papers.bySource).sort(([, a], [, b]) => b - a)
    : [];
  const maxSourceCount = Math.max(...sourceEntries.map(([, c]) => c), 1);

  const yearEntries = papers?.byYear
    ? Object.entries(papers.byYear).sort(([a], [b]) => Number(b) - Number(a)).slice(0, 12)
    : [];
  const maxYearCount = Math.max(...yearEntries.map(([, c]) => c), 1);

  const hasOrphans = (authors?.orphaned > 0 || keywords?.orphaned > 0);

  /* ═══════════════════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════════════════ */

  return (
    <div className="p-6 space-y-5">
      {/* ── Header — compact, title is in TopBar ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-muted-foreground">{t('database.systemOverview')}</span>
          {syncLogs?.lastSync && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <CheckCircle2 size={11} className="text-emerald-500" />
              {t('database.lastSync')}{' '}
              <span className="text-primary/70 font-medium">
                {new Date(syncLogs.lastSync).toLocaleString()}
              </span>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => fetchStats()}
          disabled={isLoading}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all active:scale-[0.97] disabled:opacity-40"
          title={t('database.refreshStats')}
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </motion.div>

      {/* ── Top Stat Cards (4 main KPIs) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label={t('database.papers')} value={papers?.total} Icon={FileText} accent={PAPER_COLOR} />
        <StatCard label={t('database.authors')} value={authors?.total} Icon={Users} accent={AUTHOR_COLOR} />
        <StatCard label={t('database.keywords')} value={neo4j?.keywordNodes} Icon={Hash} accent={KEYWORD_COLOR} />
        <StatCard label={t('database.journals')} value={journals?.total} Icon={BookOpen} accent={JOURNAL_COLOR} />
      </div>

      {/* ── Main 2-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ── Left: Papers detail ── */}
        <div className="space-y-4">
          <Section title={t('database.paperBreakdown')} Icon={FileText} accent={PAPER_COLOR}>
            {/* Open Access & PDF */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-xl bg-primary/[0.02] border border-border text-center">
                <div className="text-xl font-bold text-emerald-500 font-mono tabular-nums">
                  {papers?.openAccess?.toLocaleString() ?? '—'}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5 font-semibold">
                  {t('database.openAccess')}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-primary/[0.02] border border-border text-center">
                <div className="text-xl font-bold text-primary font-mono tabular-nums">
                  {papers?.hasPdfUrl?.toLocaleString() ?? '—'}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5 font-semibold">
                  {t('database.hasPdfUrl')}
                </div>
              </div>
            </div>

            {/* By Source */}
            {sourceEntries.length > 0 && (
              <div className="pt-4 border-t border-border">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  {t('database.papersBySource')}
                </h5>
                <div className="space-y-2.5">
                  {sourceEntries.map(([source, count]) => {
                    const meta = SOURCE_META[source] || { icon: Database, label: source, color: '#6B7280' };
                    const Icon = meta.icon;
                    return (
                      <div key={source} className="flex items-center gap-2.5">
                        <Icon size={13} style={{ color: meta.color }} className="shrink-0" />
                        <span className="text-[11px] text-muted-foreground w-28 truncate">{meta.label}</span>
                        <MiniBar value={count} max={maxSourceCount} color={meta.color} />
                        <span className="text-[11px] font-mono font-semibold text-foreground w-10 text-right shrink-0">
                          {count.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* By Year */}
            {yearEntries.length > 0 && (
              <div className="pt-4 border-t border-border">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  {t('database.papersByYear')}
                </h5>
                <div className="space-y-2">
                  {yearEntries.map(([year, count]) => (
                    <div key={year} className="flex items-center gap-2.5">
                      <span className="text-[11px] text-muted-foreground w-10 font-mono">{year}</span>
                      <MiniBar value={count} max={maxYearCount} color={PAPER_COLOR} />
                      <span className="text-[11px] font-mono font-semibold text-foreground w-10 text-right">
                        {count.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">
          {/* Neo4j Graph */}
          <Section title={t('database.knowledgeGraph')} Icon={Network} accent={NEO4J_COLOR}>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-accent-blue/[0.03 border border-accent-blue/10 text-center">
                <div className="text-xl font-bold text-accent-blue font-mono tabular-nums">
                  {neo4j?.paperNodes?.toLocaleString() ?? '—'}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5 font-semibold">
                  {t('database.paperNodes')}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                <div className="text-xl font-bold text-emerald-500 font-mono tabular-nums">
                  {neo4j?.keywordNodes?.toLocaleString() ?? '—'}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5 font-semibold">
                  {t('database.keywordNodes')}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-violet-500/5 border border-violet-500/10 text-center">
                <div className="text-xl font-bold text-violet-500 font-display">
                  {neo4j?.relationships?.toLocaleString() ?? '—'}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5 font-semibold">
                  {t('database.relationships')}
                </div>
              </div>
            </div>
          </Section>

          {/* Research Fields & Topics */}
          <Section title={t('database.researchTopicsTitle')} Icon={TrendingUp} accent="#F59E0B">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center">
                <div className="text-xl font-bold text-amber-500 font-display">
                  {researchFields?.total?.toLocaleString() ?? '—'}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5 font-semibold">{t('database.fields')}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-violet-500/5 border border-violet-500/10 text-center">
                <div className="text-xl font-bold text-violet-500 font-display">
                  {researchTopics?.total?.toLocaleString() ?? '—'}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5 font-semibold">{t('database.topics')}</div>
              </div>
            </div>
            {researchTopics?.trending > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <Sparkles size={14} className="text-amber-400" />
                <span className="text-xs text-amber-400/80">
                  {t('database.trendingTopics', { count: researchTopics.trending.toLocaleString() })}
                </span>
              </div>
            )}
          </Section>

          {/* Orphaned Data Warnings */}
          {hasOrphans && (
            <Section title={t('database.dataHealth')} Icon={FileCheck} accent="#EF4444">
              <div className="space-y-2">
                {authors?.orphaned > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={13} className="text-red-400" />
                      <span className="text-xs text-red-400/80">{t('database.orphanedAuthors')}</span>
                    </div>
                    <span className="text-xs font-bold text-red-400">{authors.orphaned}</span>
                  </div>
                )}
                {keywords?.orphaned > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={13} className="text-red-400" />
                      <span className="text-xs text-red-400/80">{t('database.orphanedKeywords')}</span>
                    </div>
                    <span className="text-xs font-bold text-red-400">{keywords.orphaned}</span>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* No orphans — show healthy badge */}
          {!hasOrphans && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <CheckCircle2 size={13} className="text-emerald-500" />
              <span className="text-[11px] text-emerald-400/80">{t('database.dataHealthy')}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Sync Logs Footer ── */}
      <Section title={t('database.syncActivity')} Icon={Clock} accent="var(--primary)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-primary/[0.02] border border-border text-center">
            <div className="text-2xl font-bold text-primary font-display">
              {syncLogs?.total?.toLocaleString() ?? '—'}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 font-semibold flex items-center justify-center gap-1">
              <RefreshCw size={10} />
              {t('database.totalSyncRuns')}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-primary/[0.02] border border-border text-center">
            <div className="text-sm font-bold text-primary/80 font-mono">
              {syncLogs?.lastSync
                ? new Date(syncLogs.lastSync).toLocaleString()
                : t('database.never')}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 font-semibold flex items-center justify-center gap-1">
              <Clock size={10} />
              {t('database.lastSyncTime')}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
