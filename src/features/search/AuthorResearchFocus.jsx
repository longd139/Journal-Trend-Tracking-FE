import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertCircle, PieChartIcon } from 'lucide-react';
import { authorAPI } from './author.api';

/* ═══════════════════════════════════════════════════════════════════════════
   Color palette
   ═══════════════════════════════════════════════════════════════════════════ */

const TOPIC_COLORS = [
  '#DEDBC8',
  '#C5BFA0',
  '#A09878',
  '#8A8468',
  '#6B6550',
  '#B8B298',
  '#948C70',
  '#7A7458',
];

/* ═══════════════════════════════════════════════════════════════════════════
   Loading Skeleton
   ═══════════════════════════════════════════════════════════════════════════ */

function FocusSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl p-5 border border-border bg-card animate-pulse">
          <div className="h-64 bg-primary/3 rounded-full w-64 mx-auto" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-primary/8 shrink-0" />
              <div className="flex-1 h-3 bg-primary/5 rounded" />
              <div className="h-3 w-10 bg-primary/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Custom Tooltip
   ═══════════════════════════════════════════════════════════════════════════ */

function CustomPieTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0];
  const item = entry.payload;
  return (
    <div className="rounded-lg border border-primary/10 bg-card/95 backdrop-blur-sm p-3 shadow-xl max-w-xs">
      <p className="text-xs font-semibold text-foreground mb-1">{item.topicName}</p>
      <div className="text-[11px] text-muted-foreground space-y-0.5">
        <div>
          Papers: <span className="font-mono font-semibold text-foreground">{item.paperCount}</span>
          {' '}({item.percentage?.toFixed(1)}%)
        </div>
        {item.subfield && <div>Subfield: {item.subfield}</div>}
        {item.field && <div>Field: {item.field}</div>}
        {item.domain && <div>Domain: {item.domain}</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Custom Legend
   ═══════════════════════════════════════════════════════════════════════════ */

function renderLegend(props) {
  const { payload } = props;
  if (!payload) return null;
  return (
    <div className="space-y-1.5 mt-2">
      {payload.map((entry, index) => {
        const item = entry.payload;
        return (
          <div key={index} className="flex items-center gap-2.5 text-[11px]">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: entry.color }}
            />
            <span className="text-muted-foreground truncate flex-1">{item.topicName}</span>
            <span className="font-mono font-semibold text-foreground w-10 text-right">
              {item.percentage?.toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function AuthorResearchFocus({ keyword, onTopicClick }) {
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

    async function fetchFocus() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await authorAPI.researchFocus(keyword.trim());
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          console.error('Research focus fetch error:', err);
          setError(err?.message || 'Failed to load research focus');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    const timer = setTimeout(fetchFocus, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [keyword]);

  /* ─── Nothing to show ─── */
  if (!keyword || !keyword.trim()) return null;

  /* ─── Loading ─── */
  if (isLoading) return <FocusSkeleton />;

  /* ─── Error ─── */
  if (error) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[11px] text-amber-400/70">
        <AlertCircle size={13} className="shrink-0" />
        <span>Research focus unavailable. {error}</span>
      </div>
    );
  }

  /* ─── Empty ─── */
  if (!data || !data.topics || data.topics.length === 0) return null;

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
          Research Focus
          <span className="text-primary/60 ml-1.5 font-normal normal-case">
            — {data.totalTopics ?? data.topics.length} topics
          </span>
        </span>
      </div>

      <div className="rounded-xl p-5 border border-border bg-card">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Pie Chart */}
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.topics}
                  dataKey="paperCount"
                  nameKey="topicName"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={2}
                >
                  {data.topics.map((_, index) => (
                    <Cell
                      key={index}
                      fill={TOPIC_COLORS[index % TOPIC_COLORS.length]}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend + details */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <PieChartIcon size={13} className="text-primary/40" />
              <span className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
                Topic Distribution
              </span>
            </div>
            {onTopicClick && (
              <p className="text-[10px] text-primary/50 mb-3 -mt-1 italic">
                {t('author.topicClickHint')}
              </p>
            )}
            <div className="space-y-1.5">
              {data.topics.map((topic, i) => (
                <motion.div
                  key={topic.topicName || i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.04, duration: 0.25 }}
                  onClick={() => onTopicClick?.(topic)}
                  className="flex items-center gap-2.5 group cursor-pointer rounded-lg px-2 py-1.5 -mx-2 hover:bg-primary/5 active:bg-primary/10 transition-colors"
                  title={topic.topicName} // hiển thị tooltip full tên khi hover
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onTopicClick?.(topic); }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: TOPIC_COLORS[i % TOPIC_COLORS.length] }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] text-foreground/80 truncate group-hover:text-foreground transition-colors">
                      {topic.topicName}
                    </div>
                    {topic.subfield && (
                      <div className="text-[10px] text-muted-foreground truncate">
                        {[topic.subfield, topic.field].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-semibold text-foreground">
                      {topic.paperCount}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {topic.percentage?.toFixed(1)}%
                    </div>
                  </div>
                  {/* Click indicator arrow */}
                  <span className="text-[10px] text-primary/30 group-hover:text-primary/60 transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                    →
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
