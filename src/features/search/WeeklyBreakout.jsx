import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Sparkles, AlertCircle, Tag, Minus } from 'lucide-react';
import { trendAPI } from './trend.api';

/* ═══════════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════════ */

const GREEN = '#34D399';
const RED = '#EF4444';
const NEUTRAL = '#DEDBC8';

/**
 * Determine accent color from growth rate.
 *   growthRate > 0  → green  (surging)
 *   growthRate < 0  → red    (declining)
 *   growthRate == 0 → white  (stable / neutral)
 */
function getGrowthColor(growthRate) {
  const rate = growthRate ?? 0;
  if (rate > 0) return { color: GREEN, isUp: true, isNeutral: false };
  if (rate < 0) return { color: RED, isUp: false, isNeutral: false };
  return { color: NEUTRAL, isUp: false, isNeutral: true };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sparkline — tiny inline SVG chart
   ═══════════════════════════════════════════════════════════════════════════ */

function Sparkline({ data, color, height = 40 }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (100 - padding * 2);
    const y = padding + (height - padding * 2) - ((val - min) / range) * (height - padding * 2);
    return { x, y };
  });

  const linePath = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
  const areaPath =
    linePath +
    ` L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`;

  const uid = `spark-${color.replace('#', '')}`;

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      className="w-full h-auto"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${uid})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BreakoutSkeleton — shimmer placeholder
   ═══════════════════════════════════════════════════════════════════════════ */

function BreakoutSkeleton() {
  return (
    <div className="space-y-5">
      {/* Trending chips skeleton (top) */}
      <div className="flex items-center gap-2">
        <div className="h-3 w-20 bg-[#DEDBC8]/8 rounded-full" />
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-7 w-20 bg-[#DEDBC8]/5 rounded-full" />
          ))}
        </div>
      </div>
      {/* Breakout cards skeleton (bottom) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#101010] border border-[#DEDBC8]/5 rounded-2xl p-5 space-y-3 animate-pulse"
          >
            <div className="h-4 w-2/3 bg-[#DEDBC8]/8 rounded" />
            <div className="h-10 w-full bg-[#DEDBC8]/5 rounded-lg" />
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 bg-[#DEDBC8]/5 rounded-full" />
              <div className="h-3 w-14 bg-[#DEDBC8]/5 rounded-full" />
            </div>
            <div className="h-5 w-20 bg-[#DEDBC8]/8 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TrendingChips — simple clickable tag row
   ═══════════════════════════════════════════════════════════════════════════ */

function TrendingChips({ keywords, onKeywordClick }) {
  if (!keywords.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.45, duration: 0.35 }}
      className="flex items-center gap-2.5 flex-wrap"
    >
      <Tag size={13} className="text-[#DEDBC8]/30 shrink-0" />
      {keywords.map((kw, i) => (
        <motion.button
          key={kw.keywordText}
          type="button"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45 + i * 0.04 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => onKeywordClick?.(kw.keywordText)}
          className="px-3.5 py-1.5 rounded-full text-[11px] font-medium transition-all
                     bg-[#DEDBC8]/4 text-[#DEDBC8]/65 border border-[#DEDBC8]/8
                     hover:bg-[#DEDBC8]/10 hover:text-[#DEDBC8] hover:border-[#DEDBC8]/20"
        >
          {kw.keywordText}
        </motion.button>
      ))}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function WeeklyBreakout({ onKeywordClick }) {
  const [breakoutTopics, setBreakoutTopics] = useState([]);
  const [trendingKeywords, setTrendingKeywords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setIsLoading(true);
      setError(null);
      try {
        const [breakout, trending] = await Promise.all([
          trendAPI.getWeeklyBreakout(),
          trendAPI.getTrendingKeywords(10),
        ]);

        if (!cancelled) {
          setBreakoutTopics(Array.isArray(breakout) ? breakout : []);
          setTrendingKeywords(Array.isArray(trending) ? trending : []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Trend API fetch error:', err);
          setError(err?.message || 'Failed to load trending topics');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  /* ─── Loading ─── */
  if (isLoading) return <BreakoutSkeleton />;

  /* ─── Error ─── */
  if (error) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[11px] text-amber-400/70">
        <AlertCircle size={13} className="shrink-0" />
        <span>Trending topics unavailable — try again shortly.</span>
      </div>
    );
  }

  /* ─── Empty ─── */
  if (!breakoutTopics.length && !trendingKeywords.length) return null;

  /* ─── Render ─── */
  return (
    <div className="space-y-5">
      {/* ── Trending keyword chips (top) ── */}
      {trendingKeywords.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <TrendingUp size={13} className="text-[#DEDBC8]/40" />
            <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500">
              Trending Now
            </span>
          </div>
          <TrendingChips keywords={trendingKeywords} onKeywordClick={onKeywordClick} />
        </div>
      )}

      {/* ── Breakout sparkline cards (bottom) ── */}
      {breakoutTopics.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#DEDBC8]/50" />
            <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500">
              Weekly Breakout Topics
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {breakoutTopics.map((topic, i) => {
              const { color, isUp, isNeutral } = getGrowthColor(topic.growthRate);

              return (
                <motion.button
                  key={topic.keywordText}
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4, borderColor: isNeutral ? 'rgba(222,219,200,0.12)' : `${color}30` }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onKeywordClick?.(topic.keywordText)}
                  className="relative bg-[#101010] border border-[#DEDBC8]/5 rounded-2xl p-5 text-left transition-all duration-300 group cursor-pointer overflow-hidden"
                >
                  {/* Ambient glow orb — only for growth/decline */}
                  {!isNeutral && (
                    <div
                      className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-15 transition-opacity duration-500"
                      style={{ background: color }}
                    />
                  )}

                  {/* Top accent line — only for growth/decline */}
                  {!isNeutral && (
                    <div
                      className="absolute top-0 left-4 right-4 h-[2px] rounded-b-full opacity-40 group-hover:opacity-80 transition-opacity"
                      style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
                    />
                  )}

                  {/* Keyword name */}
                  <h4 className="text-sm font-semibold text-[#E1E0CC] mb-3 truncate font-display pt-1">
                    {topic.keywordText}
                  </h4>

                  {/* Sparkline chart */}
                  <div className="mb-3">
                    <Sparkline data={topic.sparkline} color={color} />
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] text-gray-500 font-medium">
                      {(topic.totalPapers ?? 0).toLocaleString()} papers
                    </span>

                    {/* Growth rate */}
                    {isNeutral ? (
                      <span className="text-[11px] font-semibold flex items-center gap-0.5 text-gray-500">
                        <Minus size={10} />
                        {(topic.growthRate ?? 0).toFixed(1)}%
                      </span>
                    ) : (
                      <span
                        className="text-[11px] font-semibold flex items-center gap-0.5"
                        style={{ color }}
                      >
                        {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {isUp && '+'}{topic.growthRate?.toFixed(1) ?? 0}%
                      </span>
                    )}
                  </div>

                  {/* Growth label badge */}
                  <span
                    className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide"
                    style={
                      isNeutral
                        ? {
                            background: 'rgba(222,219,200,0.06)',
                            color: '#9CA3AF',
                            border: '1px solid rgba(222,219,200,0.10)',
                          }
                        : {
                            background: `${color}14`,
                            color: color,
                            border: `1px solid ${color}28`,
                          }
                    }
                  >
                    {topic.growthLabel}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
