import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  Cell,
} from 'recharts';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { authorAPI } from './author.api';
import { paperAPI } from './paper.api';

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
            className="rounded-xl p-4 border border-border bg-card animate-pulse space-y-3"
          >
            <div className="h-3 w-16 bg-primary/8 rounded" />
            <div className="h-6 w-20 bg-primary/8 rounded" />
          </div>
        ))}
      </div>
      <div className="rounded-xl p-5 border border-border bg-card animate-pulse">
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
          <span className="text-muted-foreground">{entry.name}:</span>
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

export default function AuthorTimeline({ keyword, onBarClick, highlightYear }) {
  const { t } = useTranslation('search');
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
        // Fetch timeline + works count in parallel for accuracy
        const [timelineResult, worksResult] = await Promise.all([
          authorAPI.timeline(keyword.trim()),
          paperAPI.searchPapersByAuthor({ authorName: keyword.trim(), page: 0, size: 1 }).catch(() => null),
        ]);

        if (cancelled) return;

        // Cross-reference: author profile may undercount vs actual works API.
        // Scale yearly bars proportionally so they reflect reality more accurately.
        const worksTotal = worksResult?.totalElements
          || worksResult?.data?.totalElements
          || 0;
        const authorTotal = timelineResult?.totalPapers || 0;
        const scale = (worksTotal > 0 && authorTotal > 0 && worksTotal > authorTotal)
          ? worksTotal / authorTotal
          : 1;

        if (scale > 1 && timelineResult?.timeline) {
          timelineResult.timeline = timelineResult.timeline.map(point => ({
            ...point,
            worksCount: Math.round(point.worksCount * scale),
            _originalWorksCount: point.worksCount,
          }));
          timelineResult.totalPapers = worksTotal;
          timelineResult._authorProfileTotal = authorTotal;
        }

        setData(timelineResult);
      } catch (err) {
        if (!cancelled) {
          console.error('Author timeline fetch error:', err);
          setError(err?.message || t('author.error'));
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
        <span>{t('author.timelineUnavailable', { error })}</span>
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
        <span className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
          Publication Timeline
        </span>
      </div>

      {/* Chart */}
      <div className="rounded-xl p-5 border border-border bg-card">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={timeline} margin={{ top: 8, right: 8, left: -10, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={false}
              label={{
                value: t('author.papers'),
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 10, fill: 'var(--muted-foreground)' },
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={false}
              label={{
                value: t('author.citations'),
                angle: 90,
                position: 'insideRight',
                style: { fontSize: 10, fill: 'var(--muted-foreground)' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: 'var(--muted-foreground)' }}
              iconType="circle"
              iconSize={8}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="citedByCount"
              name={t('author.citations')}
              stroke="var(--chart-4)"
              strokeWidth={2.5}
              dot={{ fill: 'var(--chart-4)', r: 3, strokeWidth: 0 }}
              activeDot={{ fill: 'var(--chart-4)', r: 5, strokeWidth: 2, stroke: 'var(--background)' }}
            />
            <Bar
              yAxisId="left"
              dataKey="worksCount"
              name={t('author.papers')}
              radius={[4, 4, 0, 0]}
              barSize={20}
              onClick={(data) => {
                // Recharts 2.x passes the chart data entry; fields may be direct or nested in .payload
                const entry = data?.payload || data;
                const count = entry?.worksCount ?? data?.worksCount ?? 0;
                console.log('[Timeline] bar clicked:', { year: entry?.year ?? data?.year, count, raw: data });
                if (count > 0 && onBarClick) {
                  onBarClick(data);
                }
              }}
              cursor="pointer"
            >
              {timeline.map((entry, index) => {
                const isActive = highlightYear != null && entry.year === highlightYear;
                const hasData = entry.worksCount > 0;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill="var(--chart-1)"
                    fillOpacity={isActive ? 1 : hasData ? 0.85 : 0.25}
                  />
                );
              })}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
