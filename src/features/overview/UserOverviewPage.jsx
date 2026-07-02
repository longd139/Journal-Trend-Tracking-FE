import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, YAxis, PieChart, Pie, Cell,
} from 'recharts';
import {
  FileText, TrendingUp, Star, Users, Bookmark, BookOpen,
  Wifi, Cpu, ArrowUpRight, Sparkles, AlertCircle, Loader2,
} from 'lucide-react';
import { overviewAPI } from './api';
import { Skeleton } from '../../components/ui/skeleton';

/* ═══════════════════════════════════════════════════════════════════════════
   Chart Colors
   ═══════════════════════════════════════════════════════════════════════════ */
const CHART_COLORS = ['#DEDBC8', '#A09878', '#E1E0CC', '#4F8CFF', '#00D1B2', '#F59E0B', '#EF4444', '#8B5CF6'];

/* ═══════════════════════════════════════════════════════════════════════════
   StatCard
   ═══════════════════════════════════════════════════════════════════════════ */
function StatCard({ label, value, change, Icon, accent, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group p-5 rounded-2xl border flex flex-col gap-3 bg-[#101010] border-[#DEDBC8]/5 hover:border-[#DEDBC8]/15 transition-colors duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="p-2.5 rounded-xl" style={{ background: `${accent}15`, color: accent }}>
          <Icon size={20} />
        </div>
        {change && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${String(change).startsWith('+') ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
            {change}
          </span>
        )}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-[#E1E0CC]">{value}</p>
      </div>
    </motion.div>
  );
}

function GlowBadge({ color, children }) {
  return (
    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap"
      style={{ background: `${color}12`, color: color, borderColor: `${color}25` }}>
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Loading Skeleton
   ═══════════════════════════════════════════════════════════════════════════ */
function OverviewSkeleton() {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 animate-pulse">
        {/* Hero skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20 rounded bg-white/5" />
          <Skeleton className="h-8 w-64 rounded bg-white/5" />
          <Skeleton className="h-4 w-96 rounded bg-white/5" />
        </div>
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-2xl border bg-[#101010] border-[#DEDBC8]/5 space-y-3">
              <Skeleton className="h-10 w-10 rounded-xl bg-white/5" />
              <Skeleton className="h-6 w-20 rounded bg-white/5" />
            </div>
          ))}
        </div>
        {/* Chart skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 rounded-2xl border p-6 bg-[#101010] border-[#DEDBC8]/5">
            <Skeleton className="h-48 w-full rounded bg-white/5" />
          </div>
          <div className="rounded-2xl border p-6 bg-[#101010] border-[#DEDBC8]/5">
            <Skeleton className="h-48 w-full rounded bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   User Overview Page
   ═══════════════════════════════════════════════════════════════════════════ */
export default function UserOverviewPage() {
  const { t } = useTranslation('dashboard');
  const role = sessionStorage.getItem('userRole') || 'academic';
  const isResearcher = role === 'researcher';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let result;
      if (isResearcher) {
        result = await overviewAPI.getUserOverview();
      } else {
        result = await overviewAPI.getRoleStatistics();
      }
      setData(result);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load overview';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [isResearcher]);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  // ── Loading ──
  if (loading) return <OverviewSkeleton />;

  // ── Error ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-4 p-8">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#E1E0CC] mb-1">{error}</h3>
          <p className="text-sm text-gray-400">Unable to load dashboard data.</p>
        </div>
        <button
          onClick={fetchOverview}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#DEDBC8]/10 text-[#DEDBC8] border border-[#DEDBC8]/20 hover:bg-[#DEDBC8]/20 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Normalize data ──
  const d = data || {};

  // Stat cards
  const statCards = isResearcher
    ? [
      { label: t('user.totalCitations'), value: (d.totalCitations ?? d.citationCount ?? 0).toLocaleString(), change: d.citationGrowth, Icon: TrendingUp, accent: '#DEDBC8' },
      { label: t('user.publishedPapers'), value: (d.publishedPapers ?? d.paperCount ?? 0).toLocaleString(), change: d.paperGrowth, Icon: FileText, accent: '#DEDBC8' },
      { label: t('user.hIndex'), value: d.hIndex ?? d.hindex ?? '—', change: d.hIndexGrowth, Icon: Star, accent: '#E1E0CC' },
      { label: 'Co-authors', value: (d.coAuthors ?? d.coauthorCount ?? 0).toLocaleString(), change: d.coauthorGrowth, Icon: Users, accent: '#A09878' },
    ]
    : [
      { label: 'Saved Papers', value: (d.savedPapers ?? d.bookmarkCount ?? 0).toLocaleString(), change: d.savedGrowth, Icon: Bookmark, accent: '#DEDBC8' },
      { label: 'Papers Read', value: (d.papersRead ?? d.readCount ?? 0).toLocaleString(), change: d.readGrowth, Icon: BookOpen, accent: '#DEDBC8' },
      { label: 'Topics', value: (d.topicCount ?? d.topics ?? 0).toLocaleString(), change: d.topicGrowth, Icon: Wifi, accent: '#A09878' },
      { label: 'Insights', value: (d.insightCount ?? d.insights ?? 0).toLocaleString(), change: d.insightGrowth, Icon: Cpu, accent: '#E1E0CC' },
    ];

  // Chart data
  const chartData = isResearcher
    ? (d.citationHistory || d.citationsOverTime || [])
    : (d.publicationTrends || d.trends || []);

  // Pie data
  const rawPieData = isResearcher
    ? (d.researchFields || d.fields || [])
    : (d.fieldDistribution || d.fields || []);
  const pieData = Array.isArray(rawPieData)
    ? rawPieData.map((f, i) => ({
        n: f.name || f.n || f.fieldName || f.key || `Item ${i + 1}`,
        v: f.value || f.v || f.percentage || f.percent || 0,
        c: f.color || f.c || CHART_COLORS[i % CHART_COLORS.length],
      }))
    : [];

  // Table data
  const tableData = isResearcher
    ? (d.recentPublications || d.publications || [])
    : (d.recommendedPapers || d.recommendations || d.papers || []);

  // Chart key mapping
  const isBarChart = isResearcher;
  const chartXKey = isResearcher ? 'y' : 'm';
  const chartDataKeys = isResearcher
    ? ['citations']
    : (d.trendKeys || ['iot', 'emb', 'ai']);

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* ─── Stats Banner ─── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-[#101010] via-[#141414] to-[#101010] border-[#DEDBC8]/10"
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#DEDBC8]/50 to-transparent" />
          <div className="px-5 sm:px-7 py-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles size={14} className="text-[#DEDBC8]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#DEDBC8]/70">
                    {isResearcher ? 'Researcher Dashboard' : 'Academic Dashboard'}
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-black text-[#E1E0CC] font-display tracking-tight">
                  {isResearcher ? 'Your Research Impact' : 'Research Explorer'}
                </h1>
                <p className="text-xs text-gray-500 mt-1 max-w-md">
                  {isResearcher
                    ? 'Publication metrics, citations, and global academic reach.'
                    : 'Discover trending topics and organize your academic journey.'}
                </p>
              </div>
              {/* Quick stats pills */}
              <div className="flex flex-wrap items-center gap-2">
                {statCards.slice(0, 4).map((stat, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#DEDBC8]/5 border border-[#DEDBC8]/8">
                    <stat.Icon size={13} style={{ color: stat.accent }} />
                    <div>
                      <div className="text-sm font-bold text-[#E1E0CC]">{stat.value}</div>
                      <div className="text-[9px] text-gray-500 uppercase">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Stat Cards ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => <StatCard key={i} index={i} {...stat} />)}
        </div>

        {/* ─── Charts Row ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="lg:col-span-2 rounded-2xl border p-6 bg-[#101010] border-[#DEDBC8]/5"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-[#E1E0CC]">
                  {isResearcher ? t('user.researchImpact') : t('user.publicationTrends')}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isResearcher ? 'Total citations received per year' : 'Publication trends over time'}
                </p>
              </div>
              <ArrowUpRight size={16} className="text-[#DEDBC8]/50" />
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                {isBarChart ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-5" vertical={false} />
                    <XAxis dataKey={chartXKey} tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
                    <Tooltip cursor={{ fill: 'rgba(222,219,200,0.04)' }} contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, fontSize: 12, color: '#E1E0CC' }} />
                    {chartDataKeys.map((key, i) => (
                      <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[6, 6, 0, 0]} maxBarSize={40} />
                    ))}
                  </BarChart>
                ) : (
                  <AreaChart data={chartData}>
                    <defs>
                      {chartDataKeys.map((key, i) => (
                        <linearGradient key={key} id={`ga${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-5" />
                    <XAxis dataKey={chartXKey} tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
                    <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, fontSize: 12, color: '#E1E0CC' }} />
                    {chartDataKeys.map((key, i) => (
                      <Area key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} fill={`url(#ga${i})`} strokeWidth={2} />
                    ))}
                  </AreaChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-gray-500 text-sm">No chart data available</div>
            )}
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="rounded-2xl border p-6 bg-[#101010] border-[#DEDBC8]/5 flex flex-col"
          >
            <h3 className="text-sm font-bold text-[#E1E0CC] mb-4">
              {isResearcher ? t('user.researchFields') : 'Field Distribution'}
            </h3>
            {pieData.length > 0 ? (
              <>
                <div className="flex-1 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="v" stroke="none" paddingAngle={3}>
                        {pieData.map((f, i) => <Cell key={i} fill={f.c} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, fontSize: 12, color: '#E1E0CC' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2.5 mt-2">
                  {pieData.map((f) => (
                    <div key={f.n} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: f.c }} />
                        <span className="text-gray-400">{f.n}</span>
                      </div>
                      <span className="font-bold" style={{ color: f.c }}>{f.v}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">No data</div>
            )}
          </motion.div>
        </div>

        {/* ─── Publications / Recommendations Table ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="rounded-2xl border overflow-hidden bg-[#101010] border-[#DEDBC8]/5"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#DEDBC8]/5">
            <div>
              <h3 className="text-sm font-bold text-[#E1E0CC]">
                {isResearcher ? t('user.recentPublications') : 'Recommended Papers'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {isResearcher ? 'Your latest published research' : 'Curated picks based on your interests'}
              </p>
            </div>
          </div>
          {tableData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                {isResearcher ? (
                  <>
                    <thead>
                      <tr className="border-b border-[#DEDBC8]/5">
                        {['Paper Title', 'Journal', 'Year', 'Role', 'Citations'].map((h) =>
                          <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((p, i) => (
                        <motion.tr key={p.paperId || i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + i * 0.08 }}
                          className="border-b border-[#DEDBC8]/5 hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-6 py-4"><span className="text-sm font-semibold text-[#E1E0CC] block max-w-xs truncate">{p.title}</span></td>
                          <td className="px-6 py-4 text-xs text-[#DEDBC8] font-medium">{p.journal || p.journalName || '—'}</td>
                          <td className="px-6 py-4 text-xs text-gray-400">{p.year || p.pubYear || '—'}</td>
                          <td className="px-6 py-4"><GlowBadge color={(p.role || '') === 'First Author' ? '#E1E0CC' : '#A09878'}>{p.role || 'Author'}</GlowBadge></td>
                          <td className="px-6 py-4 text-sm font-bold text-[#E1E0CC]">{(p.citations ?? p.citationCount ?? 0).toLocaleString()}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </>
                ) : (
                  <>
                    <thead>
                      <tr className="border-b border-[#DEDBC8]/5">
                        {['Title', 'Authors', 'Year', 'Field', 'Citations'].map((h) =>
                          <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((p, i) => {
                        const field = p.fieldName || p.field || '';
                        const fieldColor = CHART_COLORS[i % CHART_COLORS.length];
                        let authors = '';
                        if (Array.isArray(p.authors)) {
                          authors = p.authors.map((a) => (typeof a === 'string' ? a : a.fullName || a.name || '')).filter(Boolean).join(', ');
                        } else if (typeof p.authors === 'string') {
                          authors = p.authors;
                        }
                        return (
                          <motion.tr key={p.paperId || i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + i * 0.08 }}
                            className="border-b border-[#DEDBC8]/5 hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-6 py-4"><span className="text-sm font-semibold text-[#E1E0CC] block max-w-[280px] truncate">{p.title}</span></td>
                            <td className="px-6 py-4 text-xs text-gray-400">{authors || 'Unknown'}</td>
                            <td className="px-6 py-4 text-xs text-gray-400">{p.year || p.pubYear || '—'}</td>
                            <td className="px-6 py-4">{field && <GlowBadge color={fieldColor}>{field}</GlowBadge>}</td>
                            <td className="px-6 py-4 text-sm font-bold text-[#E1E0CC]">{(p.citations ?? p.citationCount ?? 0).toLocaleString()}</td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </>
                )}
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-gray-500 text-sm">No publications to display</div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
