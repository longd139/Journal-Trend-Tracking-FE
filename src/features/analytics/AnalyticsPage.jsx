import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  BarChart3, TrendingUp, Star, FileText, Hash, Activity,
  AlertCircle, Sparkles, ArrowUpRight, Layers, Loader2, Search, Plus, X,
  Globe, TrendingDown, Target,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, LineChart, Line, Legend,
  Cell,
} from 'recharts';
import { toast } from 'sonner';
import { analyticsAPI } from './api';
import { paperAPI } from '../search/paper.api';
import { graphAPI } from '../search/graph.api';
import { Skeleton } from '../../components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';

/* ═══════════════════════════════════════════════════════════════════════════
   Chart Colors
   ═══════════════════════════════════════════════════════════════════════════ */

const COLORS = ['#4F8CFF', '#00D1B2', '#F59E0B', '#A78BFA', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];

const TREND_COLORS = {
  rising: '#00D1B2',
  declining: '#EF4444',
  stable: '#F59E0B',
};

/* ── Helper: convert GrowthMetric {value, direction} to display string ── */
function formatGrowth(metric) {
  if (!metric || typeof metric !== 'object') return undefined;
  const { value, direction } = metric;
  if (direction === 'up') return `+${value}%`;
  if (direction === 'down') return `-${value}%`;
  return '→';
}

/* ═══════════════════════════════════════════════════════════════════════════
   Stat Card
   ═══════════════════════════════════════════════════════════════════════════ */

function StatCard({ icon: Icon, label, value, change, color = '#4F8CFF' }) {
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

function KeywordComparison({ t: translate }) {
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
      toast.error(translate('comparison.minTwo'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let data;
      try {
        data = await analyticsAPI.compareKeywords(keywords);
      } catch {
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
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addKeyword(); }}
            placeholder={translate('comparison.placeholder')}
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
              {translate('comparison.compare')}
            </button>
          )}
        </div>
      )}

      {comparisonData && comparisonData.keywords && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="rounded-xl border border-[#DEDBC8]/10 bg-[#101010] p-5">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">{translate('comparison.totalPapers')}</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={comparisonData.keywords} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(222,219,200,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="keyword" tick={{ fill: '#E1E0CC', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ background: '#1B2235', border: '1px solid rgba(222,219,200,0.1)', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="totalPapers" fill="#4F8CFF" radius={[0, 6, 6, 0]} maxBarSize={32} name={translate('comparison.papers')} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-[#DEDBC8]/10 bg-[#101010] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#DEDBC8]/5">
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-gray-500">{translate('comparison.keyword')}</th>
                  <th className="text-right px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-gray-500">{translate('comparison.papers')}</th>
                  <th className="text-right px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-gray-500">{translate('comparison.citations')}</th>
                  <th className="text-right px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-gray-500">{translate('comparison.avgPerPaper')}</th>
                  <th className="text-right px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-gray-500">{translate('comparison.yoy')}</th>
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
   Trend Prediction Tab
   ═══════════════════════════════════════════════════════════════════════════ */

function TrendPredictionTab({ t }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedKeyword, setSelectedKeyword] = useState(null);

  const fetchPrediction = useCallback(async () => {
    setLoading(true);
    try {
      const data = await analyticsAPI.getTrendPrediction();
      setPrediction(data);
    } catch {
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrediction(); }, [fetchPrediction]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl border bg-[#101010] border-[#DEDBC8]/5" />
          ))}
        </div>
        <div className="h-72 rounded-xl border bg-[#101010] border-[#DEDBC8]/5" />
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-[#DEDBC8]/5 border border-[#DEDBC8]/10">
          <Sparkles size={32} className="text-[#DEDBC8]/30" />
        </div>
        <p className="text-sm text-gray-500 max-w-sm">{t('trendPrediction.noData')}</p>
        <button
          onClick={fetchPrediction}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#DEDBC8]/10 text-[#DEDBC8] border border-[#DEDBC8]/20 hover:bg-[#DEDBC8]/20 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const hasRising = prediction.risingStars?.length > 0;
  const hasDeclining = prediction.declining?.length > 0;
  const hasMatched = prediction.matchedToUser?.length > 0;

  // Build timeline data from selected keyword or first rising star
  const timelineTarget = selectedKeyword || prediction.risingStars?.[0]?.keyword;
  const timelineData = prediction.timeline?.[timelineTarget] || [];

  return (
    <div className="space-y-6">
      {/* AI label */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#00D1B2]/10 to-[#4F8CFF]/10 border border-[#00D1B2]/20 w-fit">
        <Sparkles size={14} className="text-[#00D1B2]" />
        <span className="text-[11px] font-bold text-[#00D1B2]">{t('trendPrediction.title')}</span>
        {prediction.generatedAt && (
          <span className="text-[10px] text-gray-500 ml-2">
            Updated {new Date(prediction.generatedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rising Stars */}
        <div className="rounded-xl border border-[#DEDBC8]/10 bg-[#101010] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <TrendingUp size={14} className="text-emerald-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#E1E0CC]">{t('trendPrediction.risingStars')}</h4>
              <p className="text-[10px] text-gray-500">{t('trendPrediction.risingStarsDesc')}</p>
            </div>
          </div>
          {hasRising ? (
            <div className="space-y-3">
              {prediction.risingStars.slice(0, 5).map((item, i) => (
                <button
                  key={item.keyword || i}
                  onClick={() => setSelectedKeyword(item.keyword)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedKeyword === item.keyword
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold text-[#E1E0CC] leading-tight flex-1">{item.keyword}</span>
                    <span className="text-[10px] font-bold text-emerald-400 shrink-0 whitespace-nowrap">
                      +{item.growthRate}%
                    </span>
                  </div>
                  {item.rationale && (
                    <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{item.rationale}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {item.confidence && (
                      <span className="text-[9px] text-gray-500">
                        {t('trendPrediction.confidence')}: {item.confidence}%
                      </span>
                    )}
                    {item.predictedPeak && (
                      <span className="text-[9px] text-gray-500">
                        {t('trendPrediction.predictedPeak')}: {item.predictedPeak}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-4 text-center">{t('trendPrediction.noData')}</p>
          )}
        </div>

        {/* Declining */}
        <div className="rounded-xl border border-[#DEDBC8]/10 bg-[#101010] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-red-500/10">
              <TrendingDown size={14} className="text-red-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#E1E0CC]">{t('trendPrediction.declining')}</h4>
              <p className="text-[10px] text-gray-500">{t('trendPrediction.decliningDesc')}</p>
            </div>
          </div>
          {hasDeclining ? (
            <div className="space-y-3">
              {prediction.declining.slice(0, 5).map((item, i) => (
                <div key={item.keyword || i} className="p-3 rounded-lg border border-transparent hover:bg-white/5 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold text-[#E1E0CC] leading-tight flex-1">{item.keyword}</span>
                    <span className="text-[10px] font-bold text-red-400 shrink-0 whitespace-nowrap">
                      {item.growthRate}%
                    </span>
                  </div>
                  {item.rationale && (
                    <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{item.rationale}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-4 text-center">{t('trendPrediction.noData')}</p>
          )}
        </div>

        {/* Matched to User */}
        <div className="rounded-xl border border-[#DEDBC8]/10 bg-[#101010] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-[#A78BFA]/10">
              <Target size={14} className="text-[#A78BFA]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#E1E0CC]">{t('trendPrediction.matchedToYou')}</h4>
              <p className="text-[10px] text-gray-500">{t('trendPrediction.matchedToYouDesc')}</p>
            </div>
          </div>
          {hasMatched ? (
            <div className="space-y-3">
              {prediction.matchedToUser.slice(0, 5).map((item, i) => (
                <button
                  key={item.keyword || i}
                  onClick={() => setSelectedKeyword(item.keyword)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedKeyword === item.keyword
                      ? 'border-[#A78BFA]/30 bg-[#A78BFA]/5'
                      : 'border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold text-[#E1E0CC] leading-tight flex-1">{item.keyword}</span>
                    <span className="text-[10px] font-bold text-emerald-400 shrink-0 whitespace-nowrap">
                      +{item.growthRate}%
                    </span>
                  </div>
                  {item.relevanceReason && (
                    <p className="text-[10px] text-[#A78BFA] mt-1 leading-relaxed">{item.relevanceReason}</p>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-4 text-center">{t('trendPrediction.noData')}</p>
          )}
        </div>
      </div>

      {/* Trend Timeline Chart */}
      {timelineData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#DEDBC8]/10 bg-[#101010] p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-[#E1E0CC]">
                {t('trendPrediction.trendTimeline')}: <span className="text-[#4F8CFF]">{timelineTarget}</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{t('trendPrediction.historical')} vs {t('trendPrediction.predicted').toLowerCase()}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={timelineData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(222,219,200,0.05)" />
              <XAxis dataKey="year" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1B2235', border: '1px solid rgba(222,219,200,0.1)', borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="actual" stroke="#4F8CFF" strokeWidth={2} name={t('trendPrediction.historical')} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="predicted" stroke="#00D1B2" strokeWidth={2} strokeDasharray="6 3" name={t('trendPrediction.predicted')} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Research Landscape Tab
   ═══════════════════════════════════════════════════════════════════════════ */

function ResearchLandscapeTab({ t }) {
  const [landscape, setLandscape] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLandscape = useCallback(async () => {
    setLoading(true);
    try {
      const data = await analyticsAPI.getResearchLandscape();
      setLandscape(data);
    } catch {
      setLandscape(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLandscape(); }, [fetchLandscape]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-72 rounded-xl border bg-[#101010] border-[#DEDBC8]/5" />
        <div className="h-48 rounded-xl border bg-[#101010] border-[#DEDBC8]/5" />
      </div>
    );
  }

  if (!landscape) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-[#DEDBC8]/5 border border-[#DEDBC8]/10">
          <Globe size={32} className="text-[#DEDBC8]/30" />
        </div>
        <p className="text-sm text-gray-500 max-w-sm">{t('researchLandscape.noData')}</p>
        <button
          onClick={fetchLandscape}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#DEDBC8]/10 text-[#DEDBC8] border border-[#DEDBC8]/20 hover:bg-[#DEDBC8]/20 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const fields = landscape.fields || [];

  // Sort fields by paperCount descending, take top 10 for chart
  const topFields = [...fields].sort((a, b) => b.paperCount - a.paperCount).slice(0, 10);

  const getTrendColor = (direction) => TREND_COLORS[direction] || TREND_COLORS.stable;

  return (
    <div className="space-y-6">
      {/* Bar Chart - Top Fields */}
      {topFields.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#DEDBC8]/10 bg-[#101010] p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-[#E1E0CC]">{t('researchLandscape.title')}</h3>
              <p className="text-xs text-gray-500 mt-0.5">Top 10 fields by paper count</p>
            </div>
            <div className="flex items-center gap-3">
              {Object.entries(TREND_COLORS).map(([key, color]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[10px] text-gray-400">{t(`researchLandscape.${key}`)}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={Math.max(200, topFields.length * 35)}>
            <BarChart data={topFields} layout="vertical" margin={{ left: 120, right: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(222,219,200,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="fieldName" tick={{ fill: '#E1E0CC', fontSize: 10 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip
                contentStyle={{ background: '#1B2235', border: '1px solid rgba(222,219,200,0.1)', borderRadius: 12, fontSize: 12 }}
                formatter={(value, name) => {
                  if (name === 'paperCount') return [value.toLocaleString(), t('researchLandscape.papers')];
                  return [value, name];
                }}
              />
              <Bar dataKey="paperCount" radius={[0, 6, 6, 0]} maxBarSize={24}>
                {topFields.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getTrendColor(entry.trendDirection)} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
   Tab 1: My Analytics
   ═══════════════════════════════════════════════════════════════════════════ */

function MyAnalyticsTab({ t, trends, keywords, period, setPeriod, trendingTopics, topLoading }) {
  return (
    <div className="space-y-6">

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
              <h3 className="text-sm font-bold text-[#E1E0CC]">{t('charts.publicationsOverTime')}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{t('charts.researchGrowth')}</p>
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
              <Area type="monotone" dataKey="paperCount" stroke="#4F8CFF" strokeWidth={2} fill="url(#paperGrad)" name={t('comparison.papers')} />
              <Area type="monotone" dataKey="citationCount" stroke="#00D1B2" strokeWidth={2} fill="url(#citeGrad)" name="Citations" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Top Keywords + Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Keyword Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-[#DEDBC8]/10 bg-[#101010] p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <ArrowUpRight size={14} className="text-[#DEDBC8]/40" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">{t('charts.keywordComparison')}</h3>
          </div>
          <KeywordComparison t={t} />
        </motion.div>
      </div>

      {/* Top Keywords — from user data */}
      {keywords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-[#DEDBC8]/10 bg-[#101010] p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Layers size={14} className="text-[#DEDBC8]/40" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">{t('charts.yourTopKeywords')}</h3>
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

      {/* Trending Topics — from OpenAlex */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-[#DEDBC8]/10 bg-[#101010] p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={14} className="text-[#DEDBC8]/40" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">{t('cards.hotKeywords')}</h3>
          <span className="text-[10px] text-gray-600 ml-auto">{t('charts.trendingKeywords')}</span>
        </div>

        {topLoading && (
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

        {!topLoading && trendingTopics.length === 0 && (
          <p className="text-xs text-gray-500 py-4 text-center">{t('hotKeywords.empty')}</p>
        )}

        {!topLoading && trendingTopics.length > 0 && (
          <ul className="space-y-2">
            {trendingTopics.map((topic, i) => {
              const rank = i + 1;
              const rankColor =
                rank === 1 ? '#E1E0CC' :
                rank === 2 ? '#94A3B8' :
                rank === 3 ? '#D97706' : undefined;
              return (
                <li
                  key={topic.keyword || topic.keywordText || i}
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
                    {topic.keyword || topic.displayName || topic.keywordText}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400 shrink-0">
                    {(topic.paperCount ?? topic.searchCount ?? 0).toLocaleString()} papers
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </motion.div>

      {/* Empty state */}
      {!trends.length && !keywords.length && (
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
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Analytics Page
   ═══════════════════════════════════════════════════════════════════════════ */

export default function AnalyticsPage() {
  const { t } = useTranslation('analytics');
  const [activeTab, setActiveTab] = useState('my-analytics');

  const [trends, setTrends] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('yearly');
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [topLoading, setTopLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tr, kw] = await Promise.allSettled([
        analyticsAPI.getTrends(period),
        analyticsAPI.getKeywordAnalytics(),
      ]);

      if (tr.status === 'fulfilled') setTrends(Array.isArray(tr.value) ? tr.value : tr.value?.timeline || []);
      if (kw.status === 'fulfilled') setKeywords(Array.isArray(kw.value) ? kw.value : kw.value?.keywords || []);

      if (tr.status === 'rejected' && kw.status === 'rejected') {
        setError('Failed to load analytics data');
      }
    } catch (err) {
      setError(err?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // Fetch trending topics from OpenAlex
  useEffect(() => {
    let cancelled = false;
    const fetchTrending = async () => {
      setTopLoading(true);
      try {
        const data = await analyticsAPI.getTrendingTopics();
        if (!cancelled) setTrendingTopics(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setTrendingTopics([]);
      } finally {
        if (!cancelled) setTopLoading(false);
      }
    };
    fetchTrending();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={16} className="text-[#DEDBC8]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#DEDBC8]/70">Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#E1E0CC]">Research Analytics</h1>
          <p className="text-sm text-gray-500 mt-1.5 max-w-lg">
            Deep insights into your research impact, publication trends, and AI-powered predictions.
          </p>
        </motion.div>

        {/* 3-Tab Layout */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full sm:w-auto flex bg-[#101010] border border-[#DEDBC8]/10 p-1 rounded-xl">
            <TabsTrigger
              value="my-analytics"
              className="flex-1 sm:flex-none data-[state=active]:bg-[#DEDBC8] data-[state=active]:text-black text-gray-400 text-xs font-bold px-4 py-2 rounded-lg transition-all"
            >
              <BarChart3 size={14} className="mr-1.5" />
              {t('tabs.myAnalytics')}
            </TabsTrigger>
            <TabsTrigger
              value="trend-prediction"
              className="flex-1 sm:flex-none data-[state=active]:bg-[#DEDBC8] data-[state=active]:text-black text-gray-400 text-xs font-bold px-4 py-2 rounded-lg transition-all"
            >
              <Sparkles size={14} className="mr-1.5" />
              {t('tabs.trendPrediction')}
            </TabsTrigger>
            <TabsTrigger
              value="research-landscape"
              className="flex-1 sm:flex-none data-[state=active]:bg-[#DEDBC8] data-[state=active]:text-black text-gray-400 text-xs font-bold px-4 py-2 rounded-lg transition-all"
            >
              <Globe size={14} className="mr-1.5" />
              {t('tabs.researchLandscape')}
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: My Analytics */}
          <TabsContent value="my-analytics" className="mt-6">
            {loading ? (
              <AnalyticsSkeleton />
            ) : error ? (
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
            ) : (
              <MyAnalyticsTab
                t={t}
                trends={trends}
                keywords={keywords}
                period={period}
                setPeriod={setPeriod}
                trendingTopics={trendingTopics}
                topLoading={topLoading}
              />
            )}
          </TabsContent>

          {/* Tab 2: Trend Prediction */}
          <TabsContent value="trend-prediction" className="mt-6">
            <TrendPredictionTab t={t} />
          </TabsContent>

          {/* Tab 3: Research Landscape */}
          <TabsContent value="research-landscape" className="mt-6">
            <ResearchLandscapeTab t={t} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
