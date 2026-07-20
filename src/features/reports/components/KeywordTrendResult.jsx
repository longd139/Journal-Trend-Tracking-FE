import { useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp, TrendingDown, Minus, Hash, Calendar, Lightbulb,
  BookOpen, FileText, BarChart3, Activity, Tag, PieChart, Clock,
} from 'lucide-react';
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart as RePieChart, Pie, Cell,
} from 'recharts';
import ExportButtons from './ExportButtons';

/* ═══════════════════════════════════════════════════════════════════════════
   Color Palette (validated dark-theme categorical + status)
   Categorical slots validated with dataviz/scripts/validate_palette.js
   Surface: #0A0A0A · Mode: dark · All 6 slots pass checks 1-5.
   ═══════════════════════════════════════════════════════════════════════════ */
const COLORS = {
  // ── Chart series (categorical, fixed order, never cycled) ──
  primary: '#3987e5',   // slot 1 — blue     (Publication Trend line)
  accent:  '#199e70',   // slot 2 — aqua     (Citation Trend area)
  purple:  '#9085e9',   // slot 5 — violet   (Co-occurring Keywords bar)

  // ── Status & indicators (reserved, never used as series) ──
  amber: '#F59E0B',     // neutral / warning
  green: '#34D399',     // positive growth
  red:   '#EF4444',     // negative growth

  // ── UI chrome (theme-aware via CSS variables) ──
  muted:  'var(--muted-foreground)',    // axis ticks, labels, placeholder
  cardBg: 'var(--card)',    // chart surface (follows theme)
  border: 'var(--border)',  // hairline grid / container (follows theme)
};

/** Donut chart — warm neutral palette matching researchFields CHART_COLORS */
const DONUT_COLORS = [
  '#DEDBC8',  // lightest beige
  '#C5BFA0',
  '#A09878',
  '#8A8468',
  '#6B6550',  // darkest brown
  '#4A4538',  // extra dark
];

/* ═══════════════════════════════════════════════════════════════════════════
   Tooltip Style (shared across all charts)
   ═══════════════════════════════════════════════════════════════════════════ */
const tooltipStyle = {
  contentStyle: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    fontSize: 12,
    color: 'var(--foreground)',
  },
  itemStyle: { color: 'var(--foreground)' },
  labelStyle: { color: 'var(--muted-foreground)' },
};

/* ═══════════════════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════════════════ */

/** Single KPI stat card */
function StatCard({ icon: Icon, iconColor, label, value, sub }) {
  return (
    <div
      className="rounded-xl p-4 border flex flex-col gap-1.5"
      style={{ borderColor: COLORS.border, background: COLORS.cardBg }}
    >
      <div className="flex items-center gap-2">
        <Icon size={13} style={{ color: iconColor }} />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="text-xl font-bold text-foreground font-mono tabular-nums">
        {value}
      </p>
      {sub && (
        <span className="text-[10px] text-muted-foreground truncate" title={sub}>
          {sub}
        </span>
      )}
    </div>
  );
}

/** Section header */
function SectionHeader({ icon: Icon, iconColor, title }) {
  return (
    <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
      <Icon size={13} style={{ color: iconColor }} />
      {title}
    </h4>
  );
}

/** Empty / fallback for charts with too little data */
function ChartPlaceholder({ message }) {
  return (
    <div className="flex items-center justify-center h-[200px] text-xs text-muted-foreground">
      {message || 'Not enough data to display chart'}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component — KeywordTrendResult V2
   ═══════════════════════════════════════════════════════════════════════════ */
export default function KeywordTrendResult({ data, onClose, onSave, saving, generatedAt }) {
  const { t } = useTranslation('reports');
  const navigate = useNavigate();
  const role = sessionStorage.getItem('userRole') || 'academic';
  const resultRef = useRef(null);

  // ── Guard: no data ──
  if (!data) return null;

  // ── Destructure (supports both new & legacy shape) ──
  const {
    keyword,
    reportTitle,
    summary = {},
    publicationTrend = [],
    citationTrend = [],
    coOccurringKeywords = [],
    topJournals = [],
    insight,
    // Legacy fallbacks (if BE hasn't updated)
    totalPapers,
    yoyGrowthRate,
    status,
    topRelatedKeywords,
    yearlyBreakdown,
  } = data;

  // ── Derived values with fallbacks ──
  const hasNewShape = !!summary && Object.keys(summary).length > 0;

  const displaySummary = hasNewShape
    ? summary
    : {
        totalPublications: totalPapers ?? 0,
        peakYear: yearlyBreakdown?.length
          ? yearlyBreakdown.reduce((a, b) => (a.paperCount > b.paperCount ? a : b)).year
          : null,
        totalCitations: null,
        topJournal: null,
      };

  const displayPublicationTrend = publicationTrend.length > 0
    ? publicationTrend
    : (yearlyBreakdown || []).map((y) => ({ year: y.year, count: y.paperCount }));

  const displayCoKeywords = coOccurringKeywords.length > 0
    ? coOccurringKeywords
    : (topRelatedKeywords || []).map((kw) => ({ keyword: kw, count: 0 }));

  // ── Growth icon & color ──
  const growth = yoyGrowthRate;
  const GrowthIcon = growth == null ? Minus : growth > 0 ? TrendingUp : TrendingDown;
  const growthColor = growth == null
    ? COLORS.muted
    : growth > 0
      ? COLORS.green
      : COLORS.red;

  // ── Status color ──
  const statusColors = {
    'Đang bùng nổ': COLORS.green,
    'Ổn định': COLORS.amber,
    'Bão hòa': COLORS.red,
    'Không có dữ liệu': COLORS.muted,
  };
  const statusColor = statusColors[status] || COLORS.muted;

  // ── Navigate to search ──
  const goToSearch = (kw) => {
    navigate(`/${role}/search?q=${encodeURIComponent(kw)}`);
  };

  // ── Prepare Donut data (top 5 + others) ──
  const donutData = useMemo(() => {
    if (topJournals.length === 0) return [];
    const top5 = topJournals.slice(0, 5);
    const othersCount = topJournals.slice(5).reduce((sum, j) => sum + j.count, 0);
    const result = top5.map((j) => ({ name: j.name, value: j.count }));
    if (othersCount > 0) {
      result.push({ name: 'Others', value: othersCount });
    }
    return result;
  }, [topJournals]);

  // ── Horizontal bar data (top 8, reversed for display) ──
  const hBarData = useMemo(() => {
    return [...displayCoKeywords]
      .slice(0, 8)
      .reverse()
      .map((k) => ({
        name: k.keyword,
        count: k.count,
      }));
  }, [displayCoKeywords]);

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <motion.div
      ref={resultRef}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl border border-primary/10 bg-card overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            {t('templates.trendAnalysis.name') || 'Keyword Trend Report'}
          </p>
          <h3 className="text-base font-bold text-foreground">
            {reportTitle || `Báo cáo phân tích: ${keyword}`}
          </h3>
          <p className="text-sm text-accent-blue font-mono mt-0.5">
            &quot;{keyword}&quot;
          </p>
          {generatedAt && (
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              <Clock size={10} />
              Generated: {new Date(generatedAt).toLocaleString('vi-VN')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Status badge */}
          {status && (
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: `${statusColor}1A`,
                color: statusColor,
                border: `1px solid ${statusColor}44`,
              }}
            >
              {status}
            </span>
          )}
          {growth != null && (
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold"
              style={{ color: growthColor }}
            >
              <GrowthIcon size={14} />
              {growth > 0 ? '+' : ''}{growth}% YoY
            </span>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs text-muted-foreground hover:text-foreground/80 transition-colors px-2 py-1 ml-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* ═══════════════════════════════════════════════════════════
            SECTION 1 — SUMMARY KPIs
            ═══════════════════════════════════════════════════════════ */}
        <SectionHeader
          icon={BarChart3}
          iconColor={COLORS.primary}
          title={t('summary.title') || 'Tổng quan'}
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            iconColor={COLORS.primary}
            label={t('summary.totalPublications') || 'Total Publications'}
            value={(displaySummary.totalPublications ?? 0).toLocaleString()}
          />
          <StatCard
            icon={Calendar}
            iconColor={COLORS.amber}
            label={t('summary.peakYear') || 'Peak Year'}
            value={displaySummary.peakYear ?? '—'}
          />
          <StatCard
            icon={TrendingUp}
            iconColor={COLORS.green}
            label={t('summary.totalCitations') || 'Total Citations'}
            value={
              displaySummary.totalCitations != null
                ? displaySummary.totalCitations.toLocaleString()
                : '—'
            }
          />
          <StatCard
            icon={BookOpen}
            iconColor={COLORS.purple}
            label={t('summary.topJournal') || 'Top Journal'}
            value={displaySummary.topJournal?.paperCount ?? '—'}
            sub={displaySummary.topJournal?.name || ''}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 2 — CHART 1: Publication Trend (Bar Chart)
            ═══════════════════════════════════════════════════════════ */}
        <div className="rounded-xl p-5 border" style={{ borderColor: COLORS.border, background: COLORS.cardBg }}>
          <SectionHeader
            icon={Activity}
            iconColor={DONUT_COLORS[0]}
            title={t('charts.publicationTrend') || 'Publication Trend Over Time'}
          />
          {displayPublicationTrend.length >= 2 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={displayPublicationTrend}
                margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="pubBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={DONUT_COLORS[0]} stopOpacity={1} />
                    <stop offset="100%" stopColor={DONUT_COLORS[3]} stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11, fill: COLORS.muted }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: COLORS.muted }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value) => [value.toLocaleString(), 'Papers']}
                  labelFormatter={(label) => `Year ${label}`}
                  cursor={{ fill: 'var(--muted-foreground)' }}
                />
                <Bar
                  dataKey="count"
                  fill="url(#pubBarGradient)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                  name="Papers"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartPlaceholder message="Need at least 2 years of data for trend chart" />
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 3 — CHART 2: Citation Trend (Area)
            ═══════════════════════════════════════════════════════════ */}
        <div className="rounded-xl p-5 border" style={{ borderColor: COLORS.border, background: COLORS.cardBg }}>
          <SectionHeader
            icon={TrendingUp}
            iconColor={DONUT_COLORS[0]}
            title={t('charts.citationTrend') || 'Citation Trend Over Time'}
          />
          {citationTrend.length >= 2 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={citationTrend}
                margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="citationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={DONUT_COLORS[0]} stopOpacity={0.35} />
                    <stop offset="40%" stopColor={DONUT_COLORS[2]} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={DONUT_COLORS[4]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11, fill: COLORS.muted }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: COLORS.muted }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value) => [value.toLocaleString(), 'Citations']}
                  labelFormatter={(label) => `Year ${label}`}
                  cursor={{ fill: 'var(--muted-foreground)' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={DONUT_COLORS[0]}
                  strokeWidth={2}
                  fill="url(#citationGradient)"
                  name="Citations"
                  dot={{ fill: DONUT_COLORS[0], r: 3, strokeWidth: 2, stroke: COLORS.cardBg }}
                  activeDot={{ r: 5, fill: DONUT_COLORS[0], strokeWidth: 2, stroke: 'var(--background)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ChartPlaceholder message="Need at least 2 years of citation data" />
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 4 — CHART 3: Co-occurring Keywords (Horizontal Bar)
            ═══════════════════════════════════════════════════════════ */}
        <div className="rounded-xl p-5 border" style={{ borderColor: COLORS.border, background: COLORS.cardBg }}>
          <SectionHeader
            icon={Tag}
            iconColor={DONUT_COLORS[2]}
            title={t('charts.coKeywords') || 'Co-occurring Keywords Network'}
          />
          {hBarData.length > 0 ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={Math.max(200, hBarData.length * 36)}>
                <BarChart
                  data={hBarData}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 100, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="coKwBarGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={DONUT_COLORS[4]} stopOpacity={0.5} />
                      <stop offset="50%" stopColor={DONUT_COLORS[2]} stopOpacity={0.85} />
                      <stop offset="100%" stopColor={DONUT_COLORS[0]} stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: COLORS.muted }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: 'var(--foreground)' }}
                    tickLine={false}
                    axisLine={false}
                    width={110}
                  />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(value) => [value.toLocaleString(), 'Co-occurrences']}
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#coKwBarGradient)"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={24}
                    name="Co-occurrences"
                  />
                </BarChart>
              </ResponsiveContainer>
              {/* Clickable keyword tags */}
              <div className="flex flex-wrap gap-2 pt-1">
                {displayCoKeywords.slice(0, 10).map((kw) => (
                  <button
                    key={kw.keyword}
                    onClick={() => goToSearch(kw.keyword)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200
                      bg-primary/5 border-primary/10 text-primary
                      hover:bg-primary/12 hover:border-primary/25 hover:text-foreground"
                  >
                    {kw.keyword}
                    {kw.count > 0 && (
                      <span className="ml-1.5 text-[10px] text-muted-foreground">({kw.count})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ChartPlaceholder message="No co-occurring keywords found" />
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 5 — CHART 4: Top Journals (Donut Chart)
            ═══════════════════════════════════════════════════════════ */}
        <div className="rounded-xl p-5 border" style={{ borderColor: COLORS.border, background: COLORS.cardBg }}>
          <SectionHeader
            icon={PieChart}
            iconColor={COLORS.amber}
            title={t('charts.topJournals') || 'Phân bổ theo Tạp chí (Top Journals)'}
          />
          {donutData.length > 0 ? (
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
              <div className="relative w-full max-w-[280px]">
                <ResponsiveContainer width="100%" height={280}>
                  <RePieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {donutData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(value, _name, props) => [
                        `${value.toLocaleString()} papers`,
                        props.payload.name,
                      ]}
                    />
                  </RePieChart>
                </ResponsiveContainer>
                {/* Center label — total papers */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[22px] font-bold text-foreground font-mono tabular-nums">
                    {donutData.reduce((sum, d) => sum + d.value, 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">papers</span>
                </div>
              </div>
              {/* Legend — below on mobile, right on desktop */}
              <div className="flex flex-wrap lg:flex-col gap-x-4 gap-y-1.5 justify-center">
                {donutData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: DONUT_COLORS[index % DONUT_COLORS.length] }}
                    />
                    <span className="text-foreground truncate max-w-[140px]" title={entry.name}>
                      {entry.name}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {entry.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ChartPlaceholder message="No journal distribution data" />
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 6 — Insight
            ═══════════════════════════════════════════════════════════ */}
        {insight && (
          <div
            className="rounded-xl p-4 border"
            style={{ borderColor: COLORS.border, background: COLORS.cardBg }}
          >
            <SectionHeader
              icon={Lightbulb}
              iconColor={COLORS.amber}
              title={t('insight.title') || 'Nhận định & Phân tích'}
            />
            <p className="text-sm text-foreground/80 leading-relaxed">{insight}</p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            ACTIONS — Export + Save
            ═══════════════════════════════════════════════════════════ */}
        <ExportButtons
          contentRef={resultRef}
          jsonData={data}
          filename={`keyword_trend_${keyword || 'report'}`}
          accentColor={COLORS.primary}
          onSave={onSave}
          saving={saving}
        />
      </div>
    </motion.div>
  );
}
