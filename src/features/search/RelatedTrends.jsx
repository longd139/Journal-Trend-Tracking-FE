import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Hash, AlertCircle, Sparkles } from 'lucide-react';
import { paperAPI } from './paper.api';

/* ═══════════════════════════════════════════════════════════════════════════
   Loading Skeleton
   ═══════════════════════════════════════════════════════════════════════════ */

function RelatedTrendsSkeleton() {
  return (
    <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] ring-1 ring-white/[0.04]">
      <div className="p-5 rounded-[calc(1rem-1.5px)] space-y-4 animate-pulse"
        style={{ background: 'linear-gradient(135deg, rgba(16,16,16,0.95), rgba(12,12,20,0.98))' }}>
        <div className="h-3 w-28 bg-[#DEDBC8]/6 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.03] space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-[#DEDBC8]/5 rounded-md" />
                <div className="h-3 w-20 bg-[#DEDBC8]/5 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-28 bg-[#DEDBC8]/5 rounded" />
                <div className="h-5 w-16 bg-[#DEDBC8]/4 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Trend Card
   ═══════════════════════════════════════════════════════════════════════════ */

function TrendCard({ item, index, onKeywordClick }) {
  const rank = index + 1;
  const isTop3 = rank <= 3;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ delay: 0.08 + index * 0.05, duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.25, ease: [0.32, 0.72, 0, 1] } }}
      onClick={() => onKeywordClick?.(item.keyword)}
      className="group text-left w-full relative pt-3"
    >
      <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] ring-1 ring-white/[0.03]
        group-hover:ring-[#4F8CFF]/15 transition-all duration-400"
        style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}>
        <div className="p-4 pt-5 rounded-[calc(1rem-1.5px)] space-y-3 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(16,16,16,0.95), rgba(12,12,20,0.98))' }}>
          {/* Subtle hover glow */}
          <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-[#4F8CFF]/[0.02] blur-2xl pointer-events-none
            group-hover:bg-[#4F8CFF]/[0.05] transition-all duration-500" />

          {/* Keyword name */}
          <div className="relative z-10 min-w-0">
            <p className="text-[13px] font-semibold text-[#E1E0CC] leading-snug
              group-hover:text-[#4F8CFF] transition-colors duration-300
              line-clamp-2">
              {item.keyword}
            </p>
          </div>

          {/* Bottom: co-occurrence count */}
          <div className="flex items-center gap-1.5 relative z-10">
            <Hash size={10} strokeWidth={1.5} className="text-gray-500 shrink-0" />
            <span className="text-[10px] text-gray-500">
              {item.cooccurrenceCount?.toLocaleString() ?? 0} co-occurrences
            </span>
          </div>
        </div>
      </div>

      {/* Rank badge — overhanging the top border */}
      <div
        className="absolute -top-0 left-4 px-2.5 py-0.5 rounded-md text-[10px] font-bold z-10
          shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
        style={{
          background: isTop3
            ? 'linear-gradient(135deg, #4F8CFF, #3B6FD4)'
            : 'linear-gradient(135deg, #4B5563, #374151)',
          color: '#fff',
          border: `1px solid ${isTop3 ? 'rgba(79,140,255,0.5)' : 'rgba(107,114,128,0.4)'}`,
        }}
      >
        #{rank}
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function RelatedTrends({ keyword, onKeywordClick }) {
  const { t } = useTranslation('search');
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
          // Sort by co-occurrence count descending
          const sorted = Array.isArray(data)
            ? [...data].sort((a, b) => (b.cooccurrenceCount || 0) - (a.cooccurrenceCount || 0))
            : [];
          setTrends(sorted);
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

    const timer = setTimeout(fetchTrends, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [keyword]);

  /* ─── Nothing to show ─── */
  if (!keyword || !keyword.trim()) return null;

  /* ─── Loading ─── */
  if (isLoading) return <RelatedTrendsSkeleton />;

  /* ─── Error ─── */
  if (error) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[11px] text-amber-400/70">
        <AlertCircle size={13} className="shrink-0" />
        <span>Related trends unavailable for this keyword.</span>
      </div>
    );
  }

  /* ─── Empty ─── */
  if (!trends || trends.length === 0) return null;

  /* ─── Render ─── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.45, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
    >
      <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] ring-1 ring-white/[0.04]">
        <div
          className="p-5 rounded-[calc(1rem-1.5px)] space-y-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(16,16,16,0.95), rgba(12,12,20,0.98))' }}
        >
          {/* Ambient glow */}
          <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-[#4F8CFF]/[0.03] blur-3xl pointer-events-none" />

          {/* Section header */}
          <div className="flex items-center gap-2.5 relative z-10">
            <div
              className="p-1.5 rounded-lg border"
              style={{
                background: 'rgba(79,140,255,0.08)',
                borderColor: 'rgba(79,140,255,0.15)',
                boxShadow: '0 0 16px rgba(79,140,255,0.06)',
              }}
            >
              <Sparkles size={13} strokeWidth={1.5} className="text-[#4F8CFF]/70" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.08em] font-bold text-gray-500">
              {t('relatedTrends.title', 'Related Trends')}
            </span>
            <span className="text-[10px] text-gray-600 ml-auto hidden sm:block">
              {t('relatedTrends.subtitle', 'Satellite keywords from recent papers')}
            </span>
          </div>

          {/* Card grid — 3 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10">
            {trends.slice(0, 9).map((item, i) => (
              <TrendCard
                key={item.keyword || i}
                item={item}
                index={i}
                onKeywordClick={onKeywordClick}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
