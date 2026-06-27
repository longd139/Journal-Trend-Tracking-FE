import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Database, FileText, Users, Hash, BookOpen,
  TrendingUp, Network, RefreshCw, Clock,
  Globe, Brain, Archive, Layers, FileCheck,
  AlertTriangle, CheckCircle2, Sparkles,
} from 'lucide-react';
import { adminAPI } from '../lib/api/admin.api';

/* ═══════════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════════ */

const card = 'bg-[#101010] border border-[#DEDBC8]/5 rounded-2xl';

const SOURCE_META = {
  openalex: { icon: Globe, label: 'OpenAlex', color: '#4F8CFF' },
  semantic_scholar: { icon: Brain, label: 'Semantic Scholar', color: '#A78BFA' },
  arxiv: { icon: Archive, label: 'arXiv', color: '#34D399' },
  core: { icon: Layers, label: 'CORE', color: '#F59E0B' },
};

const NEO4J_COLOR = '#4F8CFF';
const PAPER_COLOR = '#DEDBC8';
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
      className={`${card} p-4 flex items-center gap-3.5 group cursor-default`}
    >
      <div
        className="p-2.5 rounded-xl shrink-0 transition-colors"
        style={{ background: `${accent}14`, color: accent }}
      >
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{label}</div>
        <div className="text-lg font-bold text-[#E1E0CC] font-display">
          {value?.toLocaleString() ?? '—'}
        </div>
        {sub && <div className="text-[10px] text-gray-500 mt-0.5">{sub}</div>}
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
        <h3 className="text-sm font-bold text-[#E1E0CC]">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex-1 h-2 bg-[#DEDBC8]/5 rounded-full overflow-hidden">
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
      <div className="h-7 w-48 bg-[#DEDBC8]/8 rounded" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${card} p-4 flex items-center gap-3`}>
            <div className="h-10 w-10 bg-[#DEDBC8]/8 rounded-xl" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-16 bg-[#DEDBC8]/8 rounded" />
              <div className="h-5 w-20 bg-[#DEDBC8]/5 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${card} p-5 space-y-3`}>
          <div className="h-5 w-20 bg-[#DEDBC8]/8 rounded" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-[#DEDBC8]/5 rounded-lg" />
            ))}
          </div>
        </div>
        <div className={`${card} p-5 space-y-3`}>
          <div className="h-5 w-24 bg-[#DEDBC8]/8 rounded" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-[#DEDBC8]/5 rounded-lg" />
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
  const { t } = useTranslation('dashboard');
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await adminAPI.getSyncStats();
        if (!cancelled) {
          setStats(response.data || response);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Stats error:', err);
          setError(err?.message || 'Failed to load database statistics');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchStats();
    return () => { cancelled = true; };
  }, []);

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
          <h3 className="text-sm font-bold text-[#E1E0CC] mb-1">Failed to load database statistics</h3>
          <p className="text-xs text-red-400">{error}</p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#DEDBC8]/10 text-[#DEDBC8] hover:bg-[#DEDBC8]/20 transition-all"
        >
          Retry
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
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg" style={{ background: `${NEO4J_COLOR}18`, color: NEO4J_COLOR }}>
            <Database size={17} />
          </div>
          <div>
            <h2 className="text-lg font-black text-[#E1E0CC] font-display">
              {t('headings.database')}
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              System-wide statistics and data health overview
            </p>
          </div>
        </div>

        {/* Last sync badge */}
        {syncLogs?.lastSync && (
          <div className="flex items-center gap-1.5 mt-3 ml-11">
            <CheckCircle2 size={11} className="text-emerald-500" />
            <span className="text-[10px] text-gray-500">
              Last sync:{' '}
              <span className="text-[#DEDBC8]/70 font-medium">
                {new Date(syncLogs.lastSync).toLocaleString()}
              </span>
            </span>
          </div>
        )}
      </motion.div>

      {/* ── Top Stat Cards (4 main KPIs) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Papers" value={papers?.total} Icon={FileText} accent={PAPER_COLOR} />
        <StatCard label="Authors" value={authors?.total} Icon={Users} accent={AUTHOR_COLOR} />
        <StatCard label="Keywords" value={keywords?.total} Icon={Hash} accent={KEYWORD_COLOR} />
        <StatCard label="Journals" value={journals?.total} Icon={BookOpen} accent={JOURNAL_COLOR} />
      </div>

      {/* ── Main 2-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ── Left: Papers detail ── */}
        <div className="space-y-4">
          <Section title="Paper Breakdown" Icon={FileText} accent={PAPER_COLOR}>
            {/* Open Access & PDF */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-xl bg-[#DEDBC8]/[0.02] border border-[#DEDBC8]/5 text-center">
                <div className="text-xl font-bold text-emerald-500 font-display">
                  {papers?.openAccess?.toLocaleString() ?? '—'}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5 font-semibold">
                  Open Access
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#DEDBC8]/[0.02] border border-[#DEDBC8]/5 text-center">
                <div className="text-xl font-bold text-[#DEDBC8] font-display">
                  {papers?.hasPdfUrl?.toLocaleString() ?? '—'}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5 font-semibold">
                  Has PDF URL
                </div>
              </div>
            </div>

            {/* By Source */}
            {sourceEntries.length > 0 && (
              <div className="pt-4 border-t border-[#DEDBC8]/5">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Papers by Source
                </h5>
                <div className="space-y-2.5">
                  {sourceEntries.map(([source, count]) => {
                    const meta = SOURCE_META[source] || { icon: Database, label: source, color: '#6B7280' };
                    const Icon = meta.icon;
                    return (
                      <div key={source} className="flex items-center gap-2.5">
                        <Icon size={13} style={{ color: meta.color }} className="shrink-0" />
                        <span className="text-[11px] text-gray-400 w-28 truncate">{meta.label}</span>
                        <MiniBar value={count} max={maxSourceCount} color={meta.color} />
                        <span className="text-[11px] font-mono font-semibold text-[#E1E0CC] w-10 text-right shrink-0">
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
              <div className="pt-4 border-t border-[#DEDBC8]/5">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Papers by Year
                </h5>
                <div className="space-y-2">
                  {yearEntries.map(([year, count]) => (
                    <div key={year} className="flex items-center gap-2.5">
                      <span className="text-[11px] text-gray-400 w-10 font-mono">{year}</span>
                      <MiniBar value={count} max={maxYearCount} color="#DEDBC8" />
                      <span className="text-[11px] font-mono font-semibold text-[#E1E0CC] w-10 text-right">
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
          <Section title="Knowledge Graph (Neo4j)" Icon={Network} accent={NEO4J_COLOR}>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#4F8CFF]/[0.03] border border-[#4F8CFF]/10 text-center">
                <div className="text-xl font-bold text-[#4F8CFF] font-display">
                  {neo4j?.paperNodes?.toLocaleString() ?? '—'}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5 font-semibold">
                  Paper Nodes
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#34D399]/[0.03] border border-[#34D399]/10 text-center">
                <div className="text-xl font-bold text-emerald-500 font-display">
                  {neo4j?.keywordNodes?.toLocaleString() ?? '—'}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5 font-semibold">
                  Keyword Nodes
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#A78BFA]/[0.03] border border-[#A78BFA]/10 text-center">
                <div className="text-xl font-bold text-[#A78BFA] font-display">
                  {neo4j?.relationships?.toLocaleString() ?? '—'}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5 font-semibold">
                  Relationships
                </div>
              </div>
            </div>
          </Section>

          {/* Research Fields & Topics */}
          <Section title="Research & Topics" Icon={TrendingUp} accent="#F59E0B">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-3.5 rounded-xl bg-[#F59E0B]/[0.03] border border-[#F59E0B]/10 text-center">
                <div className="text-xl font-bold text-amber-500 font-display">
                  {researchFields?.total?.toLocaleString() ?? '—'}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5 font-semibold">Fields</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#A78BFA]/[0.03] border border-[#A78BFA]/10 text-center">
                <div className="text-xl font-bold text-[#A78BFA] font-display">
                  {researchTopics?.total?.toLocaleString() ?? '—'}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5 font-semibold">Topics</div>
              </div>
            </div>
            {researchTopics?.trending > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <Sparkles size={14} className="text-amber-400" />
                <span className="text-xs text-amber-400/80">
                  <strong className="text-amber-400">{researchTopics.trending.toLocaleString()}</strong> trending topics
                </span>
              </div>
            )}
          </Section>

          {/* Orphaned Data Warnings */}
          {hasOrphans && (
            <Section title="Data Health" Icon={FileCheck} accent="#EF4444">
              <div className="space-y-2">
                {authors?.orphaned > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={13} className="text-red-400" />
                      <span className="text-xs text-red-400/80">Orphaned Authors</span>
                    </div>
                    <span className="text-xs font-bold text-red-400">{authors.orphaned}</span>
                  </div>
                )}
                {keywords?.orphaned > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={13} className="text-red-400" />
                      <span className="text-xs text-red-400/80">Orphaned Keywords</span>
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
              <span className="text-[11px] text-emerald-400/80">All data is healthy — no orphaned records</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Sync Logs Footer ── */}
      <Section title="Sync Activity" Icon={Clock} accent="#DEDBC8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-[#DEDBC8]/[0.02] border border-[#DEDBC8]/5 text-center">
            <div className="text-2xl font-bold text-[#DEDBC8] font-display">
              {syncLogs?.total?.toLocaleString() ?? '—'}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-1 font-semibold flex items-center justify-center gap-1">
              <RefreshCw size={10} />
              Total Sync Runs
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#DEDBC8]/[0.02] border border-[#DEDBC8]/5 text-center">
            <div className="text-sm font-bold text-[#DEDBC8]/80 font-mono">
              {syncLogs?.lastSync
                ? new Date(syncLogs.lastSync).toLocaleString()
                : 'Never'}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-1 font-semibold flex items-center justify-center gap-1">
              <Clock size={10} />
              Last Sync Time
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
