import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, TrendingUp, TrendingDown, Star, BookOpen, AlertCircle } from 'lucide-react';
import { StatCard } from './SharedUI';
import { paperAPI } from '../lib/api/paper.api';

/* ═══════════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════════ */

const Q_COLORS = {
  Q1: '#34D399',
  Q2: '#F59E0B',
  Q3: '#FB923C',
  Q4: '#EF4444',
};

/* ═══════════════════════════════════════════════════════════════════════════
   Top Journals — horizontal bar chart
   ═══════════════════════════════════════════════════════════════════════════ */

function TopJournalBars({ journals }) {
  if (!journals || journals.length === 0) return null;

  const maxCount = Math.max(...journals.map((j) => j.paperCount || 0), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen size={13} className="text-[#DEDBC8]/40" />
        <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500">
          Top Journals
        </span>
      </div>
      <div className="space-y-1.5">
        {journals.map((journal, i) => {
          const widthPct = maxCount > 0 ? ((journal.paperCount || 0) / maxCount) * 100 : 0;
          const qColor = Q_COLORS[journal.quartile] || '#6B7280';

          return (
            <motion.div
              key={journal.journalName || i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
              className="flex items-center gap-2 group"
            >
              {/* Journal name */}
              <span className="w-44 text-[11px] text-gray-400 truncate shrink-0 text-right group-hover:text-[#DEDBC8]/80 transition-colors">
                {journal.journalName}
              </span>

              {/* Bar */}
              <div className="flex-1 h-5 bg-[#DEDBC8]/3 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ delay: 0.4 + i * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${qColor}50, ${qColor})` }}
                />
              </div>

              {/* Paper count */}
              <span className="w-8 text-[11px] font-mono font-semibold text-[#E1E0CC] text-right shrink-0">
                {journal.paperCount}
              </span>

              {/* Quartile badge */}
              {journal.quartile && (
                <span
                  className="w-8 text-center shrink-0 text-[10px] font-bold px-1 py-0.5 rounded"
                  style={{ background: `${qColor}18`, color: qColor }}
                >
                  {journal.quartile}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Loading Skeleton
   ═══════════════════════════════════════════════════════════════════════════ */

function QuickStatsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-4 border border-[#DEDBC8]/5 bg-[#101010] animate-pulse space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 bg-[#DEDBC8]/8 rounded" />
              <div className="h-8 w-8 bg-[#DEDBC8]/5 rounded-lg" />
            </div>
            <div className="h-6 w-20 bg-[#DEDBC8]/8 rounded" />
            <div className="h-3 w-12 bg-[#DEDBC8]/5 rounded-full" />
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3 w-36 bg-[#DEDBC8]/5 rounded" />
            <div className="flex-1 h-4 bg-[#DEDBC8]/3 rounded-full" />
            <div className="h-3 w-6 bg-[#DEDBC8]/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function KeywordQuickStats({ keyword }) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!keyword || !keyword.trim()) {
      setStats(null);
      setError(null);
      return;
    }

    let cancelled = false;

    async function fetchStats() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await paperAPI.getKeywordQuickStats(keyword.trim());
        if (!cancelled) {
          setStats(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Quick stats fetch error:', err);
          setError(err?.message || 'Failed to load keyword statistics');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    // Short debounce — fire slightly before the main search
    const timer = setTimeout(fetchStats, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [keyword]);

  /* ─── Nothing to show ─── */
  if (!keyword || !keyword.trim()) return null;

  /* ─── Loading ─── */
  if (isLoading) return <QuickStatsSkeleton />;

  /* ─── Error ─── */
  if (error) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[11px] text-amber-400/70">
        <AlertCircle size={13} className="shrink-0" />
        <span>Quick stats unavailable for this keyword.</span>
      </div>
    );
  }

  /* ─── Empty / no data ─── */
  if (!stats || (stats.totalPapers === 0 && !stats.totalCitations)) return null;

  /* ─── Derived values ─── */
  const yoyChange =
    stats.yoyGrowthRate != null
      ? `${stats.yoyGrowthRate > 0 ? '+' : ''}${stats.yoyGrowthRate.toFixed(1)}%`
      : '—';

  const yoyDirection = stats.yoyGrowthDirection || 'neutral';
  const yoyAccent =
    yoyDirection === 'up' ? '#34D399' : yoyDirection === 'down' ? '#EF4444' : '#6B7280';

  /* ─── Render ─── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5"
    >
      {/* Section label */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-[#DEDBC8]/20" />
        <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500">
          Quick Stats
          <span className="text-[#DEDBC8]/60 ml-1.5 font-normal normal-case">
            for "{stats.keyword || keyword}"
          </span>
        </span>
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Papers */}
        <StatCard
          label="Total Papers"
          value={(stats.totalPapers ?? 0).toLocaleString()}
          change=""
          Icon={FileText}
          accent="#4F8CFF"
        />

        {/* Total Citations */}
        <StatCard
          label="Total Citations"
          value={(stats.totalCitations ?? 0).toLocaleString()}
          change=""
          Icon={Star}
          accent="#A78BFA"
        />

        {/* YoY Growth */}
        <StatCard
          label="YoY Growth"
          value={stats.yoyGrowthRate != null ? `${Math.abs(stats.yoyGrowthRate).toFixed(1)}%` : '—'}
          change={yoyChange}
          Icon={yoyDirection === 'up' ? TrendingUp : yoyDirection === 'down' ? TrendingDown : TrendingUp}
          accent={yoyAccent}
        />

        {/* Avg Citations per Paper */}
        <StatCard
          label="Avg Citations/Paper"
          value={stats.avgCitationsPerPaper != null ? stats.avgCitationsPerPaper.toFixed(1) : '—'}
          change=""
          Icon={TrendingUp}
          accent="#00D1B2"
        />
      </div>

      {/* Top Journals bar chart */}
      <TopJournalBars journals={stats.topJournals} />
    </motion.div>
  );
}
