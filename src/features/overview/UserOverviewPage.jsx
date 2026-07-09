import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, YAxis, PieChart, Pie, Cell,
} from 'recharts';
import {
  FileText, TrendingUp, Star, Users, UserPlus,
  AlertCircle, User, ArrowUpRight,
} from 'lucide-react';
import { overviewAPI } from './api';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

/* ═══════════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════════ */
const CHART_COLORS = ['#DEDBC8', '#4F8CFF', '#00D1B2', '#F59E0B', '#A78BFA', '#EF4444', '#FB923C', '#34D399'];

/* ═══════════════════════════════════════════════════════════════════════════
   StatCard
   ═══════════════════════════════════════════════════════════════════════════ */
function StatCard({ label, value, sub, Icon, accent, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group p-5 rounded-2xl border flex flex-col gap-3 bg-[#101010] border-[#DEDBC8]/5 hover:border-[#DEDBC8]/15 transition-colors duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="p-2.5 rounded-xl" style={{ background: `${accent}18`, color: accent }}>
          <Icon size={20} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-[#E1E0CC] font-display leading-tight">{value}</p>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mt-0.5">{label}</p>
      </div>
      {sub && <p className="text-[11px] text-gray-600">{sub}</p>}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   GlowBadge
   ═══════════════════════════════════════════════════════════════════════════ */
function GlowBadge({ color, children }) {
  return (
    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap"
      style={{ background: `${color}12`, color, borderColor: `${color}25` }}>
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
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-5 rounded-2xl border bg-[#101010] border-[#DEDBC8]/5 space-y-3">
              <Skeleton className="h-10 w-10 rounded-xl bg-white/5" />
              <Skeleton className="h-8 w-20 rounded bg-white/5" />
              <Skeleton className="h-3 w-28 rounded bg-white/5" />
            </div>
          ))}
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
  const isAcademic = role === 'academic_user' || role === 'academic';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [publicData, setPublicData] = useState(null);  // from /api/public/dashboard/overview
  const [userData, setUserData] = useState(null);       // from /api/v1/overview/user

  // Author selection
  const [selectedAuthorId, setSelectedAuthorId] = useState('__system__');
  const [followedAuthors, setFollowedAuthors] = useState([]);
  const [authorsLoading, setAuthorsLoading] = useState(false);

  const fetchOverview = useCallback(async (authorId) => {
    setLoading(true);
    setError(null);
    const effectiveId = authorId && authorId !== '__system__' ? authorId : null;
    try {
      // Call both APIs in parallel
      const [pubResult, userResult] = await Promise.all([
        overviewAPI.getPublicOverview(effectiveId),
        overviewAPI.getUserOverview(effectiveId),
      ]);
      setPublicData(pubResult);
      setUserData(userResult);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load overview';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFollowedAuthors = useCallback(async () => {
    setAuthorsLoading(true);
    try {
      const authors = await overviewAPI.getFollowedAuthors();
      setFollowedAuthors(Array.isArray(authors) ? authors : []);
    } catch {
      setFollowedAuthors([]);
    } finally {
      setAuthorsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      if (isResearcher) {
        await fetchFollowedAuthors();
      }
      await fetchOverview(null);
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          onClick={() => fetchOverview(selectedAuthorId)}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#DEDBC8]/10 text-[#DEDBC8] border border-[#DEDBC8]/20 hover:bg-[#DEDBC8]/20 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const pd = publicData || {};
  const ud = userData || {};
  const isAuthorView = selectedAuthorId !== '__system__';
  const hasFollowedAuthors = followedAuthors.length > 0;
  const currentAuthor = followedAuthors.find((a) => a.authorId === selectedAuthorId);

  // ── 4 Stat Cards — from /api/public/dashboard/overview ──
  const isAuthorCards = isAuthorView && pd.authorName;

  const systemCards = [
    { label: 'Papers Tracked', value: (pd.papersTracked ?? '—').toLocaleString(), sub: 'Total papers indexed in the system', Icon: FileText, accent: '#4F8CFF' },
    { label: 'Total Citations', value: (pd.totalCitations ?? '—').toLocaleString(), sub: 'Cumulative citations across all papers', Icon: TrendingUp, accent: '#DEDBC8' },
    { label: 'Paper Growth', value: (pd.paperGrowth ?? '—').toLocaleString(), sub: 'New papers added this month', Icon: Star, accent: '#00D1B2' },
    { label: 'Total Authors', value: (pd.totalAuthors ?? '—').toLocaleString(), sub: 'Unique authors in the system', Icon: Users, accent: '#A78BFA' },
  ];

  const authorCards = [
    { label: 'Published Papers', value: (pd.authorTotalPapers ?? '—').toLocaleString(), sub: `Works by ${pd.authorName || currentAuthor?.authorName || 'author'}`, Icon: FileText, accent: '#4F8CFF' },
    { label: 'Total Citations', value: (pd.authorTotalCitations ?? '—').toLocaleString(), sub: 'Citations across all works', Icon: TrendingUp, accent: '#DEDBC8' },
    { label: 'h-Index', value: (pd.authorHIndex ?? '—').toLocaleString(), sub: `${pd.authorHIndex ?? 'N'} papers with ≥ ${pd.authorHIndex ?? 'N'} citations each`, Icon: Star, accent: '#00D1B2' },
    { label: 'Co-Authors', value: (pd.authorCoAuthors ?? '—').toLocaleString(), sub: 'Unique collaborators', Icon: UserPlus, accent: '#F59E0B' },
  ];

  const statCards = isAuthorCards ? authorCards : systemCards;

  // ── Author detail — from /api/v1/overview/user ──
  const citationHistory = ud.citationHistory || [];
  const researchFields = ud.researchFields || [];
  const recentPublications = ud.recentPublications || [];
  const hIndex = ud.hIndex;

  // ── Search quota sub text (academic users only) ──
  const searchesLeft = ud.searchesRemaining;
  const searchLimit = ud.monthlySearchLimit;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* ─── Header + Author Selector ─── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#E1E0CC] font-display">
              {t('headings.researchOverview') || 'Research Overview'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {t('subtitles.userOverview') || 'Your personalized academic research dashboard'}
            </p>
          </div>

          {isResearcher && (
            <Select
              value={selectedAuthorId}
              onValueChange={(authorId) => {
                setSelectedAuthorId(authorId);
                fetchOverview(authorId);
              }}
              disabled={authorsLoading}
            >
              <SelectTrigger className="w-[220px] shrink-0 bg-[#DEDBC8]/5 border-[#DEDBC8]/15 text-[#E1E0CC] h-9 text-xs">
                <SelectValue placeholder={authorsLoading ? 'Loading...' : 'My Dashboard'} />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#DEDBC8]/15 text-[#E1E0CC]">
                <SelectItem
                  value="__system__"
                  className="text-xs hover:bg-[#DEDBC8]/10 focus:bg-[#DEDBC8]/10 cursor-pointer"
                >
                  My Dashboard
                </SelectItem>
                {!hasFollowedAuthors && (
                  <div className="px-2 py-3 text-xs text-gray-500 text-center">
                    No authors followed yet
                  </div>
                )}
                {followedAuthors.map((author) => (
                  <SelectItem
                    key={author.authorId}
                    value={author.authorId}
                    className="text-xs hover:bg-[#DEDBC8]/10 focus:bg-[#DEDBC8]/10 cursor-pointer"
                  >
                    {author.authorName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* ─── Stat Cards (from /api/public/dashboard/overview) ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <StatCard key={i} index={i} {...card} />
          ))}
        </div>

        {/* ─── Author-specific section ─── */}
        <AnimatePresence mode="wait">
          {isAuthorView && currentAuthor && (
            <motion.div
              key={selectedAuthorId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Author name banner */}
              <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border bg-[#101010] border-[#DEDBC8]/10">
                <div className="p-2 rounded-xl bg-[#DEDBC8]/10">
                  <User size={18} className="text-[#DEDBC8]/60" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#E1E0CC]">{currentAuthor.authorName}</p>
                  <p className="text-xs text-gray-500">
                    h-Index: {hIndex != null ? hIndex : '—'}
                    {' · '}
                    {recentPublications.length} publications listed
                  </p>
                </div>
              </div>

              {/* ── Charts Row ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Citation History — Bar Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="lg:col-span-2 rounded-2xl border p-6 bg-[#101010] border-[#DEDBC8]/5"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-bold text-[#E1E0CC]">
                        {t('user.researchImpact') || 'Citation History'}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">Citations received per year</p>
                    </div>
                    <ArrowUpRight size={16} className="text-[#DEDBC8]/50" />
                  </div>
                  {citationHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={citationHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-5" vertical={false} />
                        <XAxis dataKey="y" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
                        <Tooltip
                          cursor={{ fill: 'rgba(222,219,200,0.04)' }}
                          contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, fontSize: 12, color: '#E1E0CC' }}
                          formatter={(value) => [value, 'Citations']}
                          labelFormatter={(label) => `Year ${label}`}
                        />
                        <Bar dataKey="citations" fill="#DEDBC8" radius={[6, 6, 0, 0]} maxBarSize={44} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[240px] text-gray-500 text-sm">No citation data available</div>
                  )}
                </motion.div>

                {/* Research Fields — Pie Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl border p-6 bg-[#101010] border-[#DEDBC8]/5 flex flex-col"
                >
                  <h3 className="text-sm font-bold text-[#E1E0CC] mb-4">
                    {t('user.researchFields') || 'Research Fields'}
                  </h3>
                  {researchFields.length > 0 ? (
                    <>
                      <div className="flex-1 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={160}>
                          <PieChart>
                            <Pie
                              data={researchFields}
                              cx="50%" cy="50%"
                              innerRadius={45} outerRadius={70}
                              dataKey="value"
                              stroke="none"
                              paddingAngle={3}
                            >
                              {researchFields.map((f, i) => (
                                <Cell key={i} fill={f.color || CHART_COLORS[i % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, fontSize: 12, color: '#E1E0CC' }}
                              formatter={(value) => [`${value}%`, '']}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2.5 mt-2">
                        {researchFields.slice(0, 6).map((f, i) => (
                          <div key={f.name || i} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ background: f.color || CHART_COLORS[i % CHART_COLORS.length] }}
                              />
                              <span className="text-gray-400 truncate">{f.name}</span>
                            </div>
                            <span
                              className="font-bold ml-2 shrink-0"
                              style={{ color: f.color || CHART_COLORS[i % CHART_COLORS.length] }}
                            >
                              {f.value}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">No field data</div>
                  )}
                </motion.div>
              </div>

              {/* ── Recent Publications Table ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border overflow-hidden bg-[#101010] border-[#DEDBC8]/5"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#DEDBC8]/5">
                  <div>
                    <h3 className="text-sm font-bold text-[#E1E0CC]">
                      {t('user.recentPublications') || 'Recent Publications'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Latest published research</p>
                  </div>
                </div>
                {recentPublications.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#DEDBC8]/5">
                          {['Title', 'Journal', 'Year', 'Role', 'Citations'].map((h) => (
                            <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {recentPublications.map((p, i) => (
                          <motion.tr
                            key={p.paperId || i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.05 }}
                            className="border-b border-[#DEDBC8]/5 hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-6 py-4">
                              <span className="text-sm font-semibold text-[#E1E0CC] block max-w-xs truncate">
                                {p.title}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-[#DEDBC8] font-medium">
                              {p.journal || '—'}
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-400">{p.year || '—'}</td>
                            <td className="px-6 py-4">
                              <GlowBadge
                                color={
                                  p.role === 'First Author' ? '#E1E0CC'
                                    : p.role === 'Corresponding Author' ? '#4F8CFF'
                                    : '#A09878'
                                }
                              >
                                {p.role || 'Author'}
                              </GlowBadge>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-[#E1E0CC]">
                              {(p.citations ?? 0).toLocaleString()}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
                    No publications to display
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── No author selected (researcher) ─── */}
        {isResearcher && !isAuthorView && !hasFollowedAuthors && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 px-5 py-12 rounded-2xl border border-dashed bg-[#101010]/50 border-[#DEDBC8]/10 text-center"
          >
            <div className="p-3 rounded-xl bg-[#DEDBC8]/5">
              <UserPlus size={24} className="text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#E1E0CC]">
                Follow authors to unlock research insights
              </p>
              <p className="text-xs text-gray-500 mt-1 max-w-md">
                Search for authors, follow them, then switch the dropdown above to see their citation history, research fields, and publications.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
