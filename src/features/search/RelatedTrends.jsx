import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hash, AlertCircle } from 'lucide-react';
import { paperAPI } from './paper.api';

/* ═══════════════════════════════════════════════════════════════════════════
   Loading Skeleton
   ═══════════════════════════════════════════════════════════════════════════ */

function Skeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="shrink-0 w-44 bg-[#101010] border border-[#DEDBC8]/5 rounded-2xl p-4 space-y-3 animate-pulse"
        >
          <div className="h-4 w-20 bg-[#DEDBC8]/8 rounded" />
          <div className="h-3 w-16 bg-[#DEDBC8]/5 rounded-full" />
          <div className="flex items-center justify-between">
            <div className="h-3 w-12 bg-[#DEDBC8]/5 rounded-full" />
            <div className="h-4 w-10 bg-[#DEDBC8]/8 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function RelatedTrends({ keyword, onKeywordClick }) {
  const [trends, setTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!keyword || !keyword.trim()) {
      setTrends([]);
      setError(null);
      return;
    }

    let cancelled = false;

    async function fetchTrends() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await paperAPI.getRelatedTrends(keyword.trim());
        if (!cancelled) {
          setTrends(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Related trends fetch error:', err);
          setError(err?.message || 'Failed to load related trends');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    const timer = setTimeout(fetchTrends, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [keyword]);

  /* ─── Don't render if nothing ─── */
  if (!keyword || !keyword.trim()) return null;
  if (isLoading) return <Skeleton />;
  if (error) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[11px] text-amber-400/70">
        <AlertCircle size={13} className="shrink-0" />
        <span>Related trends unavailable.</span>
      </div>
    );
  }
  if (!trends.length) return null;

  /* ─── Render ─── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Hash size={13} className="text-[#DEDBC8]/40" />
        <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500">
          Related Research Trends
        </span>
      </div>

      {/* Horizontal scrollable cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {trends
          .slice()
          .sort((a, b) => (b.thisYearCount ?? 0) - (a.thisYearCount ?? 0))
          .map((trend, i) => {
          const rank = i + 1;
          const medalColor =
            rank === 1 ? '#F59E0B' :
            rank === 2 ? '#9CA3AF' :
            rank === 3 ? '#D97706' :
            '#DEDBC8';

          return (
            <motion.button
              key={trend.keyword || i}
              type="button"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onKeywordClick?.(trend.keyword)}
              className="relative bg-[#101010] border border-[#DEDBC8]/5 rounded-2xl p-4 text-left transition-all duration-300 group cursor-pointer hover:bg-[#141414] hover:border-[#DEDBC8]/15"
            >
              {/* Rank badge */}
              <span
                className="absolute -top-2 -left-2 min-w-[24px] h-6 rounded-full text-[10px] font-bold flex items-center justify-center px-1.5 shadow-md"
                style={{ background: medalColor, color: rank <= 3 ? '#000' : '#000' }}
              >
                #{rank}
              </span>

              {/* Keyword name */}
              <h4 className="text-[13px] font-semibold text-[#E1E0CC] mb-2.5 truncate group-hover:text-white transition-colors">
                {trend.keyword}
              </h4>

              {/* Co-occurrence count */}
              <div className="flex items-center gap-1.5 mb-2.5">
                <Hash size={11} className="text-gray-500" />
                <span className="text-[11px] text-gray-500">
                  {trend.cooccurrenceCount ?? 0} co-occurrences
                </span>
              </div>

              {/* This year / Last year */}
              <div className="flex items-center">
                <span className="text-[10px] text-gray-500">
                  {trend.thisYearCount ?? 0} this yr / {trend.lastYearCount ?? 0} last yr
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
