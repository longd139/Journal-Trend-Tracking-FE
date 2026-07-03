import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Star, FileText, Hash, Activity,
  AlertCircle, Sparkles, ArrowUpRight, Layers, Loader2, Search, Plus, X,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, LineChart, Line, Legend,
} from 'recharts';
import { toast } from 'sonner';
import { analyticsAPI } from './api';
import { paperAPI } from '../search/paper.api';
import { graphAPI } from '../search/graph.api';
import { Skeleton } from '../../components/ui/skeleton';

/* ═══════════════════════════════════════════════════════════════════════════
   Chart Colors
   ═══════════════════════════════════════════════════════════════════════════ */

const COLORS = ['#4F8CFF', '#00D1B2', '#F59E0B', '#A78BFA', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];

/* ═══════════════════════════════════════════════════════════════════════════
   Stat Chip
   ═══════════════════════════════════════════════════════════════════════════ */

function StatChip({ icon: Icon, label, value, change, color = '#4F8CFF' }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="p-4 rounded-xl border bg-[#101010] border-[#DEDBC8]/10 flex flex-col gap-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">{label}</span>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-[#E1E0CC]">{value}</span>
        {change && (
          <span className={`text-[11px] font-bold ${String(change).startsWith('+') ? 'text-emerald-400' : String(change).startsWith('-') ? 'text-red-400' : 'text-gray-500'}`}>
            {change}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Keyword Comparison Section
   ═══════════════════════════════════════════════════════════════════════════ */

function KeywordComparison() {
  const [keywords, setKeywords] = useState([]);
  const [input, setInput] = useState('');
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addKeyword = () => {
    const trimmed = input.trim();
    if (!trimmed || keywords.includes(trimmed) || keywords.length >= 4) return;
    setKeywords([...keywords, trimmed]);
    setInput('');
  };

  const removeKeyword = (kw) => {
    setKeywords(keywords.filter((k) => k !== kw));
    setComparisonData(null);
  };

  const handleCompare = async () => {
    if (keywords.length < 2) {
      toast.error('Add at least 2 keywords to compare');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let data;
      try {
        data = await analyticsAPI.compareKeywords(keywords);
      } catch {
        // Fallback: fetch quick stats for each keyword individually
        const results = await Promise.all(
          keywords.map((kw) => paperAPI.getKeywordQuickStats(kw).catch(() => null)),
        );
        data = {
          keywords: keywords.map((kw, i) => ({
            keyword: kw,
            totalPapers: results[i]?.totalPapers ?? 0,
            totalCitations: results[i]?.totalCitations ?? 0,
            avgCitationsPerPaper: results[i]?.avgCitationsPerPaper ?? 0,
            yoyGrowthRate: results[i]?.yoyGrowthRate ?? 0,
          })),
        };
      }
      setComparisonData(data);
    } catch (err) {
      setError(err?.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  const maxPapers = comparisonData?.keywords
    ? Math.max(...comparisonData.keywords.map((k) => k.totalPapers || 0), 1)
    : 1;

  return (
    <div className="space-y-4">
      {/* Keyword input */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addKeyword(); }}
            placeholder="Add keyword to compare..."
            disabled={keywords.length >= 4}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[#0A0A0A] border border-[#DEDBC8]/10 text-[#E1E0CC] placeholder:text-gray-500 focus:outline-none focus:border-[#DEDBC8]/30 transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={addKeyword}
          disabled={!input.trim() || keywords.length >= 4}
          className="p-2.5 rounded-xl bg-[#DEDBC8]/10 text-[#DEDBC8] border border-[#DEDBC8]/20 hover:bg-[#DEDBC8]/20 transition-all disabled:opacity-30"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Keyword chips */}
      {keywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {keywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/20"
            >
              <Hash size={11} />
              {kw}
              <button
                type="button"
                onClick={() => removeKeyword(kw)}
                className="ml-0.5 p-0.5 rounded-full hover:bg-[#4F8CFF]/20 transition-colors"
              >
                <X size={11} />
              </button>
            </span>
          ))}
          {keywords.length >= 2 && (
            <button
              type="button"
              onClick={handleCompare}
              disabled={loading}
              className="ml-2 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#DEDBC8] text-black hover:opacity-90 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Activity size={12} />}
              Compare
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {comparisonData && comparisonData.keywords && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Bar chart comparison */}
          <div className="rounded-xl border border-[#DEDBC8]/10 bg-[#101010] p-5">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Total Papers Comparison</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={comparisonData.keywords} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(222,219,200,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="keyword" tick={{ fill: '#E1E0CC', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ background: '#1B2235', border: '1px solid rgba(222,219,200,0.1)', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="totalPapers" fill="#4F8CFF" radius={[0, 6, 6, 0]} maxBarSize={32} name="Papers" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Metrics table */}
          <div className="rounded-xl border border-[#DEDBC8]/10 bg-[#101010] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#DEDBC8]/5">
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-gray-500">Keyword</th>
                  <th className="text-right px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-gray-500">Papers</th>
                  <th className="text-right px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-gray-500">Citations</th>
                  <th className="text-right px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-gray-500">Avg/Ppr</th>
                  <th className="text-right px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-gray-500">YoY</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.keywords.map((k, i) => (
                  <tr key={k.keyword} className="border-b border-[#DEDBC8]/5 last:border-b-0">
                    <td className="px-5 py-3">
                      <span className="text-xs font-semibold" style={{ color: COLORS[i % COLORS.length] }}>
                        {k.keyword}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-[#E1E0CC] font-mono">{(k.totalPapers ?? 0).toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-xs text-[#E1E0CC] font-mono">{(k.totalCitations ?? 0).toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-xs text-[#E1E0CC] font-mono">{(k.avgCitationsPerPaper ?? 0).toFixed(1)}</td>
                    <td className="px-5 py-3 text-right text-xs font-mono font-bold" style={{ color: (k.yoyGrowthRate ?? 0) >= 0 ? '#34D399' : '#EF4444' }}>
                      {(k.yoyGrowthRate ?? 0) >= 0 ? '+' : ''}{(k.yoyGrowthRate ?? 0).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Skeleton
   ═══════════════════════════════════════════════════════════════════════════ */

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-xl border bg-[#101010] border-[#DEDBC8]/5" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="h-72 rounded-xl border bg-[#101010] border-[#DEDBC8]/5" />
        <div className="h-72 rounded-xl border bg-[#101010] border-[#DEDBC8]/5" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Analytics Page
   ═══════════════════════════════════════════════════════════════════════════ */

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('yearly');
  const [hotKeywords, setHotKeywords] = useState([]);
  const [hotLoading, setHotLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, tr, kw] = await Promise.allSettled([
        analyticsAPI.getOverview(),
        analyticsAPI.getTrends(period),
        analyticsAPI.getKeywordAnalytics(),
      ]);

      if (ov.status === 'fulfilled') setOverview(ov.value);
      if (tr.status === 'fulfilled') setTrends(Array.isArray(tr.value) ? tr.value : tr.value?.timeline || []);
      if (kw.status === 'fulfilled') setKeywords(Array.isArray(kw.value) ? kw.value : kw.value?.keywords || []);

      // If all failed, show error
      if (ov.status === 'rejected' && tr.status === 'rejected' && kw.status === 'rejected') {
        setError('Failed to load analytics data');
      }
    } catch (err) {
      setError(err?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // Fetch hot keywords independently
  useEffect(() => {
    let cancelled = false;
    const fetchHot = async () => {
      setHotLoading(true);
      try {
        const data = await graphAPI.getHotKeywords(10);
        if (!cancelled) setHotKeywords(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setHotKeywords([]);
      } finally {
        if (!cancelled) setHotLoading(false);
      }
    };
    fetchHot();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <AnalyticsSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-4 p-8">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-[#E1E0CC]">{error}</h3>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#DEDBC8]/10 text-[#DEDBC8] border border-[#DEDBC8]/20 hover:bg-[#DEDBC8]/20 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={16} className="text-[#DEDBC8]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#DEDBC8]/70">Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#E1E0CC]">Research Analytics</h1>
          <p className="text-sm text-gray-500 mt-1.5 max-w-lg">
            Deep insights into your research impact, publication trends, and keyword performance.
          </p>
        </motion.div>

        {/* Stat overview */}
        {overview && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          >
            <StatChip icon={FileText} label="Total Papers" value={(overview.totalPapers ?? 0).toLocaleString()} change={overview.paperGrowth} color="#4F8CFF" />
            <StatChip icon={Star} label="Citations" value={(overview.totalCitations ?? 0).toLocaleString()} change={overview.citationGrowth} color="#A78BFA" />
            <StatChip icon={Activity} label="H-Index" value={overview.hIndex ?? '—'} change={overview.hIndexGrowth} color="#00D1B2" />
            <StatChip icon={TrendingUp} label="Avg Citations" value={overview.avgCitationsPerPaper?.toFixed(1) ?? '—'} change={overview.avgGrowth} color="#F59E0B" />
          </motion.div>
        )}

        {/* Trends Chart */}
        {trends.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-[#DEDBC8]/10 bg-[#101010] p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-[#E1E0CC]">Publication Trends</h3>
                <p className="text-xs text-gray-500 mt-0.5">Your research output over time</p>
              </div>
              <div className="flex items-center gap-1 p-1 rounded-lg bg-[#DEDBC8]/5">
                {['yearly', 'monthly'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold capitalize transition-all ${
                      period === p ? 'bg-[#DEDBC8] text-black' : 'text-gray-400 hover:text-[#E1E0CC]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trends} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="paperGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F8CFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4F8CFF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="citeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D1B2" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00D1B2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(222,219,200,0.05)" />
                <XAxis dataKey={period === 'yearly' ? 'year' : 'month'} tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1B2235', border: '1px solid rgba(222,219,200,0.1)', borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="paperCount" stroke="#4F8CFF" strokeWidth={2} fill="url(#paperGrad)" name="Papers" />
                <Area type="monotone" dataKey="citationCount" stroke="#00D1B2" strokeWidth={2} fill="url(#citeGrad)" name="Citations" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Top Keywords + Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top Keywords */}
          {keywords.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl border border-[#DEDBC8]/10 bg-[#101010] p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <Layers size={14} className="text-[#DEDBC8]/40" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Your Top Keywords</h3>
              </div>
              <div className="space-y-2">
                {keywords.slice(0, 8).map((kw, i) => {
                  const widthPct = keywords.length > 0
                    ? ((kw.paperCount || 0) / Math.max(...keywords.map((k) => k.paperCount || 0), 1)) * 100
                    : 0;
                  return (
                    <div key={kw.keyword || i} className="flex items-center gap-3">
                      <span className="w-24 text-[11px] text-gray-400 truncate text-right">{kw.keyword}</span>
                      <div className="flex-1 h-5 bg-[#DEDBC8]/3 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${widthPct}%` }}
                          transition={{ delay: 0.2 + i * 0.04, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full rounded-full"
                          style={{ background: COLORS[i % COLORS.length] }}
                        />
                      </div>
                      <span className="w-8 text-right text-[11px] font-mono font-semibold text-[#E1E0CC]">{kw.paperCount ?? 0}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Keyword Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-[#DEDBC8]/10 bg-[#101010] p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <ArrowUpRight size={14} className="text-[#DEDBC8]/40" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Keyword Comparison</h3>
            </div>
            <KeywordComparison />
          </motion.div>
        </div>

        {/* Hot Keywords */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-[#DEDBC8]/10 bg-[#101010] p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={14} className="text-[#DEDBC8]/40" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Hot Keywords</h3>
            <span className="text-[10px] text-gray-600 ml-auto">Trending across the platform</span>
          </div>

          {hotLoading && (
            <div className="space-y-2.5 py-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-5 h-5 rounded-md bg-white/10" />
                  <div className="flex-1 h-4 rounded bg-white/10" />
                  <div className="w-12 h-4 rounded bg-white/10" />
                </div>
              ))}
            </div>
          )}

          {!hotLoading && hotKeywords.length === 0 && (
            <p className="text-xs text-gray-500 py-4 text-center">No trending keywords available right now.</p>
          )}

          {!hotLoading && hotKeywords.length > 0 && (
            <ul className="space-y-2">
              {hotKeywords.map((kw, i) => {
                const rank = i + 1;
                const rankColor =
                  rank === 1 ? '#E1E0CC' :
                  rank === 2 ? '#94A3B8' :
                  rank === 3 ? '#D97706' : undefined;
                return (
                  <li
                    key={kw.keywordText || i}
                    className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span
                      className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{
                        background: rankColor ? `${rankColor}20` : 'transparent',
                        color: rankColor || '#6B7280',
                      }}
                    >
                      {rank}
                    </span>
                    <span className="flex-1 text-xs font-medium text-[#E1E0CC] truncate">
                      {kw.keywordText}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-400 shrink-0">
                      {kw.searchCount?.toLocaleString()} searches
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>

        {/* Empty state */}
        {!overview && !trends.length && !keywords.length && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-2xl bg-[#DEDBC8]/5 border border-[#DEDBC8]/10 mb-4">
              <BarChart3 size={32} className="text-[#DEDBC8]/30" />
            </div>
            <p className="text-sm text-gray-500 max-w-sm">
              Start searching and bookmarking papers to see your personalized analytics here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
