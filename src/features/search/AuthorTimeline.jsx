import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { authorAPI } from './author.api';

/* ═══════════════════════════════════════════════════════════════════════════
   Loading Skeleton
   ═══════════════════════════════════════════════════════════════════════════ */

function TimelineSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-4 border border-primary/5 bg-card animate-pulse space-y-3"
          >
            <div className="h-3 w-16 bg-primary/8 rounded" />
            <div className="h-6 w-20 bg-primary/8 rounded" />
          </div>
        ))}
      </div>
      <div className="rounded-xl p-5 border border-primary/5 bg-card animate-pulse">
        <div className="h-64 bg-primary/3 rounded-lg" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Custom Tooltip
   ═══════════════════════════════════════════════════════════════════════════ */

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-primary/10 bg-card/95 backdrop-blur-sm p-3 shadow-xl">
      <p className="text-xs font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-[11px]">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: entry.color }}
          />
          <span className="text-gray-400">{entry.name}:</span>
          <span className="font-mono font-semibold text-foreground">
            {entry.value?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function AuthorTimeline({ keyword }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!keyword || !keyword.trim()) {
      setData(null);
      setError(null);
      return;
    }

    let cancelled = false;

    async function fetchTimeline() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await authorAPI.timeline(keyword.trim());
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          console.error('Author timeline fetch error:', err);
          setError(err?.message || 'Failed to load timeline');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    const timer = setTimeout(fetchTimeline, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [keyword]);

  /* ─── Nothing to show ─── */
  if (!keyword || !keyword.trim()) return null;

  /* ─── Loading ─── */
  if (isLoading) return <TimelineSkeleton />;

  /* ─── Error ─── */
  if (error) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[11px] text-amber-400/70">
        <AlertCircle size={13} className="shrink-0" />
        <span>Timeline unavailable. {error}</span>
      </div>
    );
  }

  /* ─── Empty ─── */
  if (!data || !data.timeline || data.timeline.length === 0) return null;

  const timeline = data.timeline.sort((a, b) => a.year - b.year);

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
        <div className="w-1 h-4 rounded-full bg-primary/20" />
        <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500">
          Publication Timeline
        </span>
      </div>

      {/* Chart */}
      <div className="rounded-xl p-5 border border-primary/5 bg-card">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={timeline} margin={{ top: 8, right: 8, left: -10, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(222,219,200,0.06)" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(222,219,200,0.1)' }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
              label={{
                value: 'Papers',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 10, fill: '#6B7280' },
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
              label={{
                value: 'Citations',
                angle: 90,
                position: 'insideRight',
                style: { fontSize: 10, fill: '#6B7280' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: '#9CA3AF' }}
              iconType="circle"
              iconSize={8}
            />
            <Bar
              yAxisId="left"
              dataKey="worksCount"
              name="Papers"
              fill="#DEDBC8"
              radius={[4, 4, 0, 0]}
              barSize={20}
              fillOpacity={0.85}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="citedByCount"
              name="Citations"
              stroke="#A09878"
              strokeWidth={2.5}
              dot={{ fill: '#A09878', r: 3, strokeWidth: 0 }}
              activeDot={{ fill: '#A09878', r: 5, strokeWidth: 2, stroke: '#0B1020' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
