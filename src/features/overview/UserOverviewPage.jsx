import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, YAxis, PieChart, Pie, Cell,
  ComposedChart, Line, Legend,
} from 'recharts';
import {
  FileText, TrendingUp, Star, Users, UserPlus,
  AlertCircle, User, ArrowUpRight, Flame, Clock,
  Bookmark, Search, BookOpen, ArrowRight, Zap,
  Network, Trophy, Calendar, Sparkles, Activity,
  ChartPie, MessageSquareText, UserSearch,
} from 'lucide-react';
import { overviewAPI } from './api';
import { trendAPI } from '../search/trend.api';
import { paperAPI } from '../search/paper.api';
import { bookmarkAPI } from '../bookmarks/api';
import { authorAPI } from '../search/author.api';
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
   StatCard — Double-Bezel premium architecture
   Outer shell + inner core with nested icon + magnetic hover
   ═══════════════════════════════════════════════════════════════════════════ */
function StatCard({ label, value, sub, Icon, accent, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ delay: index * 0.07, duration: 0.65, ease: [0.32, 0.72, 0, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] } }}
      className="group"
    >
      {/* Outer Shell */}
      <div className="p-[1.5px] rounded-[1.25rem] bg-gradient-to-b from-white/[0.06] to-white/[0.02] ring-1 ring-white/[0.04]">
        {/* Inner Core */}
        <div className="p-5 rounded-[calc(1.25rem-1.5px)] flex flex-col gap-3 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(16,16,16,0.95), rgba(12,12,16,0.98))' }}>
          {/* Ambient glow spot */}
          <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full opacity-[0.08] blur-2xl pointer-events-none"
            style={{ background: accent }} />
          <div className="flex items-start justify-between relative z-10">
            <div className="p-2.5 rounded-xl border transition-all duration-500 group-hover:scale-105"
              style={{
                background: `${accent}14`,
                color: accent,
                borderColor: `${accent}22`,
                boxShadow: `0 0 20px ${accent}08`,
              }}>
              <Icon size={18} strokeWidth={1.5} />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-[1.65rem] font-bold text-[#E1E0CC] font-display leading-none tracking-tight">{value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500 mt-1.5">{label}</p>
          </div>
          {sub && <p className="text-[10px] text-gray-600 leading-relaxed relative z-10">{sub}</p>}
        </div>
      </div>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-[1.5px] rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01]">
              <div className="p-4 rounded-[calc(1rem-1.5px)] space-y-3" style={{ background: 'rgba(16,16,16,0.95)' }}>
                <Skeleton className="h-10 w-10 rounded-xl bg-white/[0.04]" />
                <Skeleton className="h-6 w-16 rounded bg-white/[0.04]" />
                <Skeleton className="h-3 w-24 rounded bg-white/[0.03]" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 p-[1.5px] rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01]">
            <div className="p-6 rounded-[calc(1rem-1.5px)] space-y-3" style={{ background: 'rgba(16,16,16,0.95)' }}>
              <Skeleton className="h-4 w-36 rounded bg-white/[0.04]" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <Skeleton key={j} className="h-8 w-24 rounded-xl bg-white/[0.04]" />
                ))}
              </div>
            </div>
          </div>
          <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01]">
            <div className="p-6 rounded-[calc(1rem-1.5px)] flex items-center justify-center" style={{ background: 'rgba(16,16,16,0.95)', minHeight: 180 }}>
              <Skeleton className="w-28 h-28 rounded-full bg-white/[0.04]" />
            </div>
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
  const navigate = useNavigate();
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

  // ── Dashboard extras (Trending, Reading History, Bookmarks) ──
  const [trendingKeywords, setTrendingKeywords] = useState([]);
  const [recentPapers, setRecentPapers] = useState([]);
  const [recentBookmarks, setRecentBookmarks] = useState([]);
  const [extrasLoading, setExtrasLoading] = useState(true);

  // ── Recommendations ──
  const [recommendations, setRecommendations] = useState([]);

  // ── Author detail enrichment (Timeline, Co-authors, Top Papers) ──
  const [authorTimeline, setAuthorTimeline] = useState(null);
  const [authorCoAuthors, setAuthorCoAuthors] = useState(null);
  const [authorTopPapers, setAuthorTopPapers] = useState([]);
  const [authorDetailLoading, setAuthorDetailLoading] = useState(false);

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

  // ── Fetch dashboard extras for "My Dashboard" mode ──
  const fetchExtras = useCallback(async () => {
    setExtrasLoading(true);
    try {
      const [trendRes, histRes, bmRes, recRes] = await Promise.allSettled([
        trendAPI.getTrendingKeywords(15),
        paperAPI.getReadingHistory(5),
        bookmarkAPI.getMyBookmarks(),
        paperAPI.getRecommendations({ page: 0, size: 5 }),
      ]);
      if (trendRes.status === 'fulfilled') {
        setTrendingKeywords(Array.isArray(trendRes.value) ? trendRes.value : []);
      }
      if (histRes.status === 'fulfilled') {
        const hData = histRes.value?.data || histRes.value || [];
        setRecentPapers(Array.isArray(hData) ? hData.slice(0, 5) : []);
      }
      if (bmRes.status === 'fulfilled') {
        const bData = bmRes.value?.data || bmRes.value || [];
        setRecentBookmarks(Array.isArray(bData) ? bData.slice(0, 5) : []);
      }
      if (recRes.status === 'fulfilled') {
        const rData = recRes.value?.recommendations || recRes.value || [];
        setRecommendations(Array.isArray(rData) ? rData : []);
      }
    } finally {
      setExtrasLoading(false);
    }
  }, []);

  // ── Fetch author detail enrichment ──
  const fetchAuthorDetail = useCallback(async (authorName) => {
    if (!authorName) {
      setAuthorTimeline(null);
      setAuthorCoAuthors(null);
      setAuthorTopPapers([]);
      return;
    }
    setAuthorDetailLoading(true);
    try {
      const [timelineRes, coAuthorsRes, topPapersRes] = await Promise.allSettled([
        authorAPI.timeline(authorName),
        authorAPI.coAuthors(authorName),
        authorAPI.topPapers(authorName),
      ]);
      if (timelineRes.status === 'fulfilled') setAuthorTimeline(timelineRes.value);
      if (coAuthorsRes.status === 'fulfilled') setAuthorCoAuthors(coAuthorsRes.value);
      if (topPapersRes.status === 'fulfilled') {
        const tp = Array.isArray(topPapersRes.value) ? topPapersRes.value : [];
        setAuthorTopPapers(tp);
      }
    } finally {
      setAuthorDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      if (isResearcher) {
        await fetchFollowedAuthors();
      }
      await Promise.all([fetchOverview(null), fetchExtras()]);
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Loading ──
  if (loading) return <OverviewSkeleton />;

  // ── Error ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-5 p-8">
        <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-red-500/10 to-red-500/5 ring-1 ring-red-500/10">
          <div className="p-4 rounded-[calc(1rem-1.5px)]" style={{ background: 'rgba(16,16,16,0.95)' }}>
            <AlertCircle size={28} strokeWidth={1.5} className="text-red-400" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#E1E0CC] mb-1">{error}</h3>
          <p className="text-sm text-gray-400">Unable to load dashboard data.</p>
        </div>
        <button
          onClick={() => fetchOverview(selectedAuthorId)}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#DEDBC8]/10 text-[#DEDBC8] border border-[#DEDBC8]/15
            hover:bg-[#DEDBC8]/18 hover:border-[#DEDBC8]/25 transition-all duration-400"
          style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
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
  const isAuthorCards = isAuthorView;

  const systemCards = [
    { label: 'Papers Tracked', value: (pd.papersTracked ?? '—').toLocaleString(), sub: 'Total papers indexed in the system', Icon: FileText, accent: '#4F8CFF' },
    { label: 'Total Citations', value: (pd.totalCitations ?? '—').toLocaleString(), sub: 'Cumulative citations across all papers', Icon: TrendingUp, accent: '#DEDBC8' },
    { label: 'Paper Growth', value: (pd.paperGrowth ?? '—').toLocaleString(), sub: 'New papers added this month', Icon: Star, accent: '#00D1B2' },
    { label: 'Total Authors', value: (pd.totalAuthors ?? '—').toLocaleString(), sub: 'Unique authors in the system', Icon: Users, accent: '#A78BFA' },
  ];

  const authorCards = [
    { label: 'Published Papers', value: (pd.authorTotalPapers ?? authorTimeline?.totalPapers ?? '—').toLocaleString(), sub: `Works by ${pd.authorName || currentAuthor?.authorName || 'author'}`, Icon: FileText, accent: '#4F8CFF' },
    { label: 'Total Citations', value: (pd.authorTotalCitations ?? authorTimeline?.totalCitations ?? '—').toLocaleString(), sub: 'Citations across all works', Icon: TrendingUp, accent: '#DEDBC8' },
    { label: 'h-Index', value: (pd.authorHIndex ?? authorTimeline?.hIndex ?? ud.hIndex ?? '—').toLocaleString(), sub: `${pd.authorHIndex ?? authorTimeline?.hIndex ?? ud.hIndex ?? 'N'} papers with ≥ ${pd.authorHIndex ?? authorTimeline?.hIndex ?? ud.hIndex ?? 'N'} citations each`, Icon: Star, accent: '#00D1B2' },
    { label: 'Co-Authors', value: (pd.authorCoAuthors ?? authorCoAuthors?.coAuthors?.length ?? '—').toLocaleString(), sub: 'Unique collaborators', Icon: UserPlus, accent: '#F59E0B' },
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
        <div className="flex items-center justify-between gap-4">
          {isAuthorView && currentAuthor ? (
            /* Author banner — replaces header text, sits on the left */
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="p-2.5 rounded-xl bg-[#DEDBC8]/8 border border-[#DEDBC8]/10 shrink-0"
                style={{ boxShadow: '0 0 20px rgba(222,219,200,0.04)' }}>
                <User size={17} strokeWidth={1.5} className="text-[#DEDBC8]/70" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#E1E0CC] truncate">{currentAuthor.authorName}</p>
                <p className="text-[10px] text-gray-500">
                  h-Index: {authorTimeline?.hIndex ?? hIndex ?? '—'}
                  {' · '}
                  {recentPublications.length} publications listed
                </p>
              </div>
            </div>
          ) : (
            <div /> /* empty spacer when no author selected */
          )}

          {isResearcher && (
            <Select
              value={selectedAuthorId}
              onValueChange={(authorId) => {
                setSelectedAuthorId(authorId);
                fetchOverview(authorId);
                if (authorId !== '__system__') {
                  const author = followedAuthors.find((a) => a.authorId === authorId);
                  if (author) fetchAuthorDetail(author.authorName);
                } else {
                  setAuthorTimeline(null);
                  setAuthorCoAuthors(null);
                  setAuthorTopPapers([]);
                }
              }}
              disabled={authorsLoading}
            >
              <SelectTrigger className="w-[220px] shrink-0 h-9 text-xs rounded-xl
                bg-[#0F1219] border border-[#DEDBC8]/12 text-[#E1E0CC]
                hover:border-[#DEDBC8]/25 hover:bg-[#131721]
                focus:ring-1 focus:ring-[#DEDBC8]/15 focus:border-[#DEDBC8]/25
                data-[placeholder]:text-gray-500
                transition-all duration-300">
                <SelectValue placeholder={authorsLoading ? 'Loading...' : 'My Dashboard'} />
              </SelectTrigger>
              <SelectContent className="z-50 min-w-[220px] rounded-xl border border-[#DEDBC8]/12 bg-[#131721] shadow-2xl shadow-black/50 backdrop-blur-xl overflow-hidden">
                <SelectItem
                  value="__system__"
                  className="text-xs text-[#E1E0CC] hover:bg-[#DEDBC8]/10 focus:bg-[#DEDBC8]/10 cursor-pointer py-2.5 px-3 data-[highlighted]:bg-[#DEDBC8]/10 data-[highlighted]:text-[#E1E0CC] outline-none"
                >
                  My Dashboard
                </SelectItem>
                {!hasFollowedAuthors && (
                  <div className="px-3 py-3 text-xs text-gray-500 text-center border-t border-[#DEDBC8]/6">
                    No authors followed yet
                  </div>
                )}
                {followedAuthors.map((author) => (
                  <SelectItem
                    key={author.authorId}
                    value={author.authorId}
                    className="text-xs text-[#E1E0CC] hover:bg-[#DEDBC8]/10 focus:bg-[#DEDBC8]/10 cursor-pointer py-2.5 px-3 data-[highlighted]:bg-[#DEDBC8]/10 data-[highlighted]:text-[#E1E0CC] outline-none"
                  >
                    {author.authorName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* ─── Quick Actions — Premium Bento Grid ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* New Search */}
          <motion.button
            initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            whileHover={{ y: -3, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/${role}/search`)}
            className="group text-left"
          >
            <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-[#4F8CFF]/20 to-[#4F8CFF]/05 ring-1 ring-[#4F8CFF]/10">
              <div className="p-4 rounded-[calc(1rem-1.5px)] flex items-center gap-3.5 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(79,140,255,0.08), rgba(30,30,40,0.95))' }}>
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-[#4F8CFF]/[0.06] blur-xl pointer-events-none" />
                <div className="p-2.5 rounded-xl bg-[#4F8CFF]/12 border border-[#4F8CFF]/15 relative z-10
                  group-hover:scale-105 group-hover:bg-[#4F8CFF]/20 transition-all duration-500"
                  style={{ boxShadow: '0 0 24px rgba(79,140,255,0.08)' }}>
                  <Search size={17} strokeWidth={1.5} className="text-[#4F8CFF]" />
                </div>
                <div className="relative z-10 min-w-0">
                  <p className="text-[13px] font-bold text-[#E1E0CC] font-display tracking-tight">New Search</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Discover papers</p>
                </div>
                <div className="ml-auto p-1.5 rounded-full bg-white/[0.04] border border-white/[0.04]
                  group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-white/[0.08] transition-all duration-500 relative z-10">
                  <ArrowUpRight size={12} className="text-gray-500 group-hover:text-[#4F8CFF] transition-colors duration-500" />
                </div>
              </div>
            </div>
          </motion.button>

          {/* Find Authors */}
          <motion.button
            initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            whileHover={{ y: -3, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/${role}/search-author`)}
            className="group text-left"
          >
            <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-[#A78BFA]/20 to-[#A78BFA]/05 ring-1 ring-[#A78BFA]/10">
              <div className="p-4 rounded-[calc(1rem-1.5px)] flex items-center gap-3.5 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.08), rgba(30,30,40,0.95))' }}>
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-[#A78BFA]/[0.06] blur-xl pointer-events-none" />
                <div className="p-2.5 rounded-xl bg-[#A78BFA]/12 border border-[#A78BFA]/15 relative z-10
                  group-hover:scale-105 group-hover:bg-[#A78BFA]/20 transition-all duration-500"
                  style={{ boxShadow: '0 0 24px rgba(167,139,250,0.08)' }}>
                  <UserSearch size={17} strokeWidth={1.5} className="text-[#A78BFA]" />
                </div>
                <div className="relative z-10 min-w-0">
                  <p className="text-[13px] font-bold text-[#E1E0CC] font-display tracking-tight">Find Authors</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Explore researchers</p>
                </div>
                <div className="ml-auto p-1.5 rounded-full bg-white/[0.04] border border-white/[0.04]
                  group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-white/[0.08] transition-all duration-500 relative z-10">
                  <ArrowUpRight size={12} className="text-gray-500 group-hover:text-[#A78BFA] transition-colors duration-500" />
                </div>
              </div>
            </div>
          </motion.button>

          {/* My Bookmarks */}
          <motion.button
            initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            whileHover={{ y: -3, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/${role}/bookmarks`)}
            className="group text-left"
          >
            <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-[#00D1B2]/20 to-[#00D1B2]/05 ring-1 ring-[#00D1B2]/10">
              <div className="p-4 rounded-[calc(1rem-1.5px)] flex items-center gap-3.5 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(0,209,178,0.08), rgba(30,30,40,0.95))' }}>
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-[#00D1B2]/[0.06] blur-xl pointer-events-none" />
                <div className="p-2.5 rounded-xl bg-[#00D1B2]/12 border border-[#00D1B2]/15 relative z-10
                  group-hover:scale-105 group-hover:bg-[#00D1B2]/20 transition-all duration-500"
                  style={{ boxShadow: '0 0 24px rgba(0,209,178,0.08)' }}>
                  <Bookmark size={17} strokeWidth={1.5} className="text-[#00D1B2]" />
                </div>
                <div className="relative z-10 min-w-0">
                  <p className="text-[13px] font-bold text-[#E1E0CC] font-display tracking-tight">My Bookmarks</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Saved papers</p>
                </div>
                <div className="ml-auto p-1.5 rounded-full bg-white/[0.04] border border-white/[0.04]
                  group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-white/[0.08] transition-all duration-500 relative z-10">
                  <ArrowUpRight size={12} className="text-gray-500 group-hover:text-[#00D1B2] transition-colors duration-500" />
                </div>
              </div>
            </div>
          </motion.button>

          {/* Trending Now */}
          <motion.button
            initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.25, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            whileHover={{ y: -3, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/${role}/search?q=`)}
            className="group text-left"
          >
            <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-[#F59E0B]/20 to-[#F59E0B]/05 ring-1 ring-[#F59E0B]/10">
              <div className="p-4 rounded-[calc(1rem-1.5px)] flex items-center gap-3.5 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(30,30,40,0.95))' }}>
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-[#F59E0B]/[0.06] blur-xl pointer-events-none" />
                <div className="p-2.5 rounded-xl bg-[#F59E0B]/12 border border-[#F59E0B]/15 relative z-10
                  group-hover:scale-105 group-hover:bg-[#F59E0B]/20 transition-all duration-500"
                  style={{ boxShadow: '0 0 24px rgba(245,158,11,0.08)' }}>
                  <Flame size={17} strokeWidth={1.5} className="text-[#F59E0B]" />
                </div>
                <div className="relative z-10 min-w-0">
                  <p className="text-[13px] font-bold text-[#E1E0CC] font-display tracking-tight">Trending Now</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Hot topics</p>
                </div>
                <div className="ml-auto p-1.5 rounded-full bg-white/[0.04] border border-white/[0.04]
                  group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-white/[0.08] transition-all duration-500 relative z-10">
                  <ArrowUpRight size={12} className="text-gray-500 group-hover:text-[#F59E0B] transition-colors duration-500" />
                </div>
              </div>
            </div>
          </motion.button>
        </div>

        {/* ─── Stat Cards — only shown in author view ─── */}
        {isAuthorCards && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map((card, i) => (
              <StatCard key={i} index={i} {...card} />
            ))}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            My Dashboard Extras — only shown in system-wide view
            ═══════════════════════════════════════════════════════════════════ */}
        {!isAuthorView && (
          <div className="space-y-5">
            {/* ── Search Usage Meter (academic users only) ── */}
            {isAcademic && searchesLeft != null && searchLimit != null && (
              <motion.div
                initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.3, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              >
                <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] ring-1 ring-white/[0.04]">
                  <div className="p-5 rounded-[calc(1rem-1.5px)] relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, rgba(16,16,16,0.95), rgba(12,12,20,0.98))' }}>
                    <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-amber-500/[0.04] blur-3xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/15"
                          style={{ boxShadow: '0 0 20px rgba(245,158,11,0.06)' }}>
                          <Zap size={14} strokeWidth={1.5} className="text-amber-400" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#E1E0CC]">Search Quota</h4>
                          <p className="text-[10px] text-gray-500">Monthly usage limit</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold font-mono tabular-nums text-[#E1E0CC]">
                        {searchesLeft} <span className="text-[10px] text-gray-500 font-normal">/ {searchLimit} left</span>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden relative z-10">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(0, Math.min(100, ((searchLimit - searchesLeft) / searchLimit) * 100))}%` }}
                        transition={{ delay: 0.6, duration: 1.2, ease: [0.32, 0.72, 0, 1] }}
                        style={{ boxShadow: '0 0 12px rgba(245,158,11,0.3)' }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-600 mt-2.5 relative z-10">
                      Used {searchLimit - searchesLeft} of {searchLimit} searches this month
                      {searchesLeft <= 3 && searchesLeft > 0 && (
                        <span className="text-amber-400 ml-1 font-medium">— Running low!</span>
                      )}
                      {searchesLeft === 0 && (
                        <span className="text-red-400 ml-1 font-medium">— Limit reached. Resets next month.</span>
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Activity Summary ── */}
            {(ud.papersViewed != null || ud.bookmarksThisMonth != null || ud.searchesThisMonth != null) && (
              <motion.div
                initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.32, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              >
                <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] ring-1 ring-white/[0.04]">
                  <div className="p-5 rounded-[calc(1rem-1.5px)] relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, rgba(16,16,16,0.95), rgba(12,12,20,0.98))' }}>
                    <div className="flex items-center gap-2.5 mb-4 relative z-10">
                      <div className="p-1.5 rounded-lg bg-[#DEDBC8]/8">
                        <Activity size={13} strokeWidth={1.5} className="text-[#DEDBC8]" />
                      </div>
                      <h4 className="text-xs font-bold text-[#E1E0CC]">This Month's Activity</h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-8 relative z-10">
                      {ud.papersViewed != null && (
                        <div className="flex items-center gap-3">
                          <p className="text-xl font-bold text-[#E1E0CC] font-mono tabular-nums">{ud.papersViewed}</p>
                          <p className="text-[10px] text-gray-500 leading-tight">Papers<br />Viewed</p>
                        </div>
                      )}
                      {ud.bookmarksThisMonth != null && (
                        <div className="flex items-center gap-3">
                          <p className="text-xl font-bold text-[#4F8CFF] font-mono tabular-nums">{ud.bookmarksThisMonth}</p>
                          <p className="text-[10px] text-gray-500 leading-tight">Bookmarks<br />Added</p>
                        </div>
                      )}
                      {ud.searchesThisMonth != null && (
                        <div className="flex items-center gap-3">
                          <p className="text-xl font-bold text-[#00D1B2] font-mono tabular-nums">{ud.searchesThisMonth}</p>
                          <p className="text-[10px] text-gray-500 leading-tight">Searches<br />Run</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Row: Trending Keywords + Field Distribution ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* ── Trending Keywords ── */}
              <motion.div
                initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.35, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                className="lg:col-span-2"
              >
                <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] ring-1 ring-white/[0.04]">
                  <div className="p-6 rounded-[calc(1rem-1.5px)] relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, rgba(16,16,16,0.95), rgba(12,12,20,0.98))' }}>
                    <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-orange-500/[0.03] blur-3xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-5 relative z-10">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/15"
                            style={{ boxShadow: '0 0 16px rgba(249,115,22,0.06)' }}>
                            <Flame size={13} strokeWidth={1.5} className="text-orange-400" />
                          </div>
                          <h3 className="text-sm font-bold text-[#E1E0CC]">Trending Topics</h3>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 ml-9">Hot research keywords right now</p>
                      </div>
                    </div>
                    {extrasLoading ? (
                      <div className="flex flex-wrap gap-2 relative z-10">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <Skeleton key={i} className="h-8 w-24 rounded-xl bg-white/5" />
                        ))}
                      </div>
                    ) : trendingKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-2 relative z-10">
                        {trendingKeywords.map((kw, i) => (
                          <motion.button
                            key={kw.keywordText || i}
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.45 + i * 0.04, duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
                            whileHover={{ scale: 1.04, y: -2, transition: { duration: 0.25 } }}
                            onClick={() => navigate(`/${role}/search?q=${encodeURIComponent(kw.keywordText)}`)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-300
                              bg-[#DEDBC8]/4 border border-[#DEDBC8]/8 text-[#DEDBC8]
                              hover:bg-[#DEDBC8]/10 hover:border-[#DEDBC8]/20 hover:text-[#E1E0CC]
                              hover:shadow-[0_0_20px_rgba(222,219,200,0.06)]"
                          >
                            {kw.keywordText}
                            {kw.paperCount != null && (
                              <span className="ml-1.5 text-[10px] text-gray-500">{kw.paperCount.toLocaleString()}</span>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-20 text-gray-500 text-xs relative z-10">
                        No trending topics yet
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* ── Research Fields — Mini Pie ── */}
              <motion.div
                initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.4, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              >
                <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] ring-1 ring-white/[0.04] h-full">
                  <div className="p-6 rounded-[calc(1rem-1.5px)] flex flex-col h-full relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, rgba(16,16,16,0.95), rgba(12,12,20,0.98))' }}>
                    <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-purple-500/[0.03] blur-3xl pointer-events-none" />
                    <div className="flex items-center gap-2 mb-4 relative z-10">
                      <div className="p-1.5 rounded-lg bg-[#A78BFA]/10 border border-[#A78BFA]/15"
                        style={{ boxShadow: '0 0 16px rgba(167,139,250,0.06)' }}>
                        <ChartPie size={13} strokeWidth={1.5} className="text-[#A78BFA]" />
                      </div>
                      <h3 className="text-sm font-bold text-[#E1E0CC]">Research Fields</h3>
                    </div>
                    {extrasLoading ? (
                      <div className="flex-1 flex items-center justify-center">
                        <Skeleton className="w-28 h-28 rounded-full bg-white/5" />
                      </div>
                    ) : researchFields.length > 0 ? (
                      <>
                        <div className="flex-1 flex items-center justify-center relative z-10">
                          <ResponsiveContainer width="100%" height={140}>
                            <PieChart>
                              <Pie
                                data={researchFields.slice(0, 8)}
                                cx="50%" cy="50%"
                                innerRadius={35} outerRadius={55}
                                dataKey="value"
                                nameKey="name"
                                stroke="none"
                                paddingAngle={2}
                              >
                                {researchFields.slice(0, 8).map((_, i) => (
                                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 10, fontSize: 11, color: '#E1E0CC' }}
                                formatter={(value) => [`${value}%`, '']}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-1.5 mt-2 relative z-10">
                          {researchFields.slice(0, 4).map((f, i) => (
                            <div key={f.name || i} className="flex items-center justify-between text-[10px]">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                <span className="text-gray-400 truncate">{f.name}</span>
                              </div>
                              <span className="text-gray-500 ml-1 shrink-0">{f.value}%</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-gray-500 text-xs relative z-10">No data</div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ── Row: Recommendations + Bookmarks ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* ── Research Recommendations ── */}
              <motion.div
                initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.42, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                className="lg:col-span-2"
              >
                <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] ring-1 ring-white/[0.04]">
                  <div className="p-6 rounded-[calc(1rem-1.5px)] relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, rgba(16,16,16,0.95), rgba(12,12,20,0.98))' }}>
                    <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-amber-400/[0.03] blur-3xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-5 relative z-10">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-amber-400/10 border border-amber-400/15"
                            style={{ boxShadow: '0 0 16px rgba(251,191,36,0.06)' }}>
                            <Sparkles size={13} strokeWidth={1.5} className="text-amber-400" />
                          </div>
                          <h3 className="text-sm font-bold text-[#E1E0CC]">For You</h3>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 ml-9">Recommended based on your interests</p>
                      </div>
                    </div>
                    {extrasLoading ? (
                      <div className="space-y-3 relative z-10">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-14 w-full rounded-xl bg-white/5" />
                        ))}
                      </div>
                    ) : recommendations.length > 0 ? (
                      <div className="space-y-2 relative z-10">
                        {recommendations.slice(0, 4).map((rec, i) => {
                          const p = rec.paper || rec;
                          return (
                            <motion.button
                              key={p.paperId || i}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 + i * 0.05, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                              onClick={() => {
                                if (p.paperId) navigate(`/${role}/search/paper/${p.paperId}`);
                              }}
                              className="w-full text-left p-3.5 rounded-xl border border-white/[0.04] hover:border-[#DEDBC8]/12
                                bg-white/[0.015] hover:bg-white/[0.03] transition-all duration-400 group"
                              style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-amber-500/8 border border-amber-500/10 shrink-0 mt-0.5
                                  group-hover:bg-amber-500/15 group-hover:scale-105 transition-all duration-500"
                                  style={{ boxShadow: '0 0 12px rgba(245,158,11,0.04)' }}>
                                  <Sparkles size={12} strokeWidth={1.5} className="text-amber-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-[#E1E0CC] line-clamp-1 group-hover:text-[#4F8CFF] transition-colors duration-400">
                                    {p.title || 'Untitled'}
                                  </p>
                                  <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-1">
                                    {p.journal && <span className="truncate">{p.journal}</span>}
                                    {p.pubYear && <span>{p.pubYear}</span>}
                                    {(p.citationCount != null) && (
                                      <span className="flex items-center gap-0.5"><Star size={9} /> {p.citationCount}</span>
                                    )}
                                  </div>
                                  {rec.reasonDetail && (
                                    <p className="text-[9px] text-gray-600 mt-1 flex items-center gap-1">
                                      <MessageSquareText size={9} /> {rec.reasonDetail}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center gap-2 relative z-10">
                        <Sparkles size={20} className="text-gray-700" />
                        <p className="text-xs text-gray-500">Search for papers to get recommendations</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* ── Bookmarks Summary ── */}
              <motion.div
                initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.45, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              >
                <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] ring-1 ring-white/[0.04] h-full">
                  <div className="p-6 rounded-[calc(1rem-1.5px)] flex flex-col h-full relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, rgba(16,16,16,0.95), rgba(12,12,20,0.98))' }}>
                    <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-blue-500/[0.03] blur-3xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-[#4F8CFF]/10 border border-[#4F8CFF]/15"
                            style={{ boxShadow: '0 0 16px rgba(79,140,255,0.06)' }}>
                            <Bookmark size={13} strokeWidth={1.5} className="text-[#4F8CFF]" />
                          </div>
                          <h3 className="text-sm font-bold text-[#E1E0CC]">Bookmarks</h3>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 ml-9">Recently saved</p>
                      </div>
                    </div>
                    {extrasLoading ? (
                      <div className="space-y-3 flex-1 relative z-10">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-12 w-full rounded-xl bg-white/5" />
                        ))}
                      </div>
                    ) : recentBookmarks.length > 0 ? (
                      <div className="space-y-2 flex-1 relative z-10">
                        {recentBookmarks.slice(0, 4).map((bm, i) => (
                          <motion.button
                            key={bm.bookmarkId || i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.06, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                            onClick={() => {
                              if (bm.paperId) navigate(`/${role}/search/paper/${bm.paperId}`);
                            }}
                            className="w-full text-left p-3 rounded-xl border border-white/[0.04] hover:border-[#DEDBC8]/12
                              bg-white/[0.015] hover:bg-white/[0.03] transition-all duration-400 group"
                            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                          >
                            <p className="text-xs font-medium text-[#E1E0CC] truncate group-hover:text-[#4F8CFF] transition-colors duration-400">
                              {bm.paperTitle || bm.keywordText || 'Untitled'}
                            </p>
                            <p className="text-[10px] text-gray-600 mt-0.5">
                              {bm.collectionName || 'General'}
                              {bm.createdAt && ` · ${new Date(bm.createdAt).toLocaleDateString()}`}
                            </p>
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 relative z-10">
                        <Bookmark size={20} className="text-gray-700" />
                        <p className="text-xs text-gray-500">No bookmarks yet</p>
                        <button
                          onClick={() => navigate(`/${role}/search`)}
                          className="text-[10px] text-[#4F8CFF] hover:underline"
                        >
                          Start exploring papers
                        </button>
                      </div>
                    )}
                    {recentBookmarks.length > 0 && (
                      <button
                        onClick={() => navigate(`/${role}/bookmarks`)}
                        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-medium
                          text-[#DEDBC8]/60 hover:text-[#DEDBC8] bg-white/[0.03] hover:bg-white/[0.06]
                          border border-white/[0.04] hover:border-white/[0.08] transition-all duration-400 relative z-10"
                        style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                      >
                        View all bookmarks <ArrowRight size={11} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ── Recently Viewed Papers ── */}
            <motion.div
              initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.48, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] ring-1 ring-white/[0.04]">
                <div className="p-6 rounded-[calc(1rem-1.5px)] relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, rgba(16,16,16,0.95), rgba(12,12,20,0.98))' }}>
                  <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-emerald-500/[0.03] blur-3xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-5 relative z-10">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[#00D1B2]/10 border border-[#00D1B2]/15"
                          style={{ boxShadow: '0 0 16px rgba(0,209,178,0.06)' }}>
                          <Clock size={13} strokeWidth={1.5} className="text-[#00D1B2]" />
                        </div>
                        <h3 className="text-sm font-bold text-[#E1E0CC]">Recently Viewed</h3>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 ml-9">Pick up where you left off</p>
                    </div>
                    <button
                      onClick={() => navigate(`/${role}/reading-history`)}
                      className="flex items-center gap-1 text-[10px] font-medium text-gray-500 hover:text-[#DEDBC8] transition-colors duration-400"
                      style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                    >
                      View history <ArrowRight size={11} />
                    </button>
                  </div>
                  {extrasLoading ? (
                    <div className="flex gap-4 overflow-hidden relative z-10">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="min-w-[220px] p-4 rounded-xl border border-white/[0.04] space-y-2 bg-white/[0.01]">
                          <Skeleton className="h-3 w-3/4 rounded bg-white/5" />
                          <Skeleton className="h-3 w-1/2 rounded bg-white/5" />
                          <Skeleton className="h-3 w-1/3 rounded bg-white/5" />
                        </div>
                      ))}
                    </div>
                  ) : recentPapers.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar relative z-10">
                      {recentPapers.map((p, i) => (
                        <motion.button
                          key={p.paperId || i}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.55 + i * 0.06, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                          whileHover={{ y: -3, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
                          onClick={() => navigate(`/${role}/search/paper/${p.paperId}`)}
                          className="shrink-0 w-[240px] p-4 rounded-xl border border-white/[0.04] hover:border-[#00D1B2]/20
                            bg-white/[0.015] hover:bg-white/[0.03] transition-all duration-400 text-left group"
                          style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                        >
                          <div className="flex items-start gap-2.5 mb-2.5">
                            <div className="p-1.5 rounded-lg bg-[#00D1B2]/8 border border-[#00D1B2]/10 shrink-0 mt-0.5
                              group-hover:bg-[#00D1B2]/15 group-hover:scale-105 transition-all duration-500">
                              <BookOpen size={12} strokeWidth={1.5} className="text-[#00D1B2]" />
                            </div>
                            <p className="text-xs font-semibold text-[#E1E0CC] line-clamp-2 leading-snug group-hover:text-[#00D1B2] transition-colors duration-400">
                              {p.paperTitle || 'Untitled'}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-gray-500">
                            {p.journalName && <span className="truncate">{p.journalName}</span>}
                            {p.pubYear && <span>{p.pubYear}</span>}
                            {p.citationCount != null && (
                              <span className="flex items-center gap-0.5">
                                <Star size={9} /> {p.citationCount}
                              </span>
                            )}
                          </div>
                          {p.viewedAt && (
                            <p className="text-[9px] text-gray-600 mt-2">
                              Viewed {new Date(p.viewedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center gap-2 relative z-10">
                      <Clock size={20} className="text-gray-700" />
                      <p className="text-xs text-gray-500">No papers viewed yet</p>
                      <button
                        onClick={() => navigate(`/${role}/search`)}
                        className="text-[10px] text-[#4F8CFF] hover:underline"
                      >
                        Search for papers to get started
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* ─── Author-specific section ─── */}
        <AnimatePresence mode="wait">
          {isAuthorView && currentAuthor && (
            <motion.div
              key={selectedAuthorId}
              initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -24, filter: 'blur(6px)' }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="space-y-5"
            >
              {/* ── Charts Row 1: Publication Timeline + Research Fields ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Publication Timeline — ComposedChart (Bars: papers/year + Line: citations/year) */}
                <motion.div
                  initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.1, duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
                  className="lg:col-span-2"
                >
                  <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] ring-1 ring-white/[0.04]">
                    <div className="p-6 rounded-[calc(1rem-1.5px)] relative overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, rgba(16,16,16,0.95), rgba(12,12,20,0.98))' }}>
                      <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#DEDBC8]/[0.02] blur-3xl pointer-events-none" />
                      <div className="flex items-center justify-between mb-6 relative z-10">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-[#DEDBC8]/8 border border-[#DEDBC8]/10"
                              style={{ boxShadow: '0 0 16px rgba(222,219,200,0.04)' }}>
                              <Calendar size={13} strokeWidth={1.5} className="text-[#DEDBC8]" />
                            </div>
                            <h3 className="text-sm font-bold text-[#E1E0CC]">Publication Timeline</h3>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1 ml-9">Research output & impact per year</p>
                        </div>
                        <div className="flex items-center gap-3 text-[10px]">
                          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-[#DEDBC8]" />Papers</span>
                          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-[#4F8CFF]" style={{ borderTop: '2px dashed #4F8CFF', height: 0 }} />Citations</span>
                        </div>
                      </div>
                      {authorDetailLoading ? (
                        <div className="flex items-center justify-center h-[260px] relative z-10">
                          <Skeleton className="w-full h-full rounded-xl bg-white/[0.03]" />
                        </div>
                      ) : authorTimeline?.timeline?.length > 0 ? (
                        <>
                          {/* Summary stats */}
                          <div className="flex items-center gap-8 mb-5 relative z-10">
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Papers</p>
                              <p className="text-lg font-bold text-[#E1E0CC] font-mono tabular-nums">
                                {authorTimeline.totalPapers?.toLocaleString() || '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Citations</p>
                              <p className="text-lg font-bold text-[#4F8CFF] font-mono tabular-nums">
                                {authorTimeline.totalCitations?.toLocaleString() || '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider">h-Index</p>
                              <p className="text-lg font-bold text-[#00D1B2] font-mono tabular-nums">
                                {authorTimeline.hIndex ?? '—'}
                              </p>
                            </div>
                          </div>
                          <ResponsiveContainer width="100%" height={220}>
                            <ComposedChart data={authorTimeline.timeline} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#DEDBC8" strokeOpacity={0.06} vertical={false} />
                              <XAxis dataKey="year" tick={{ fill: '#6B7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                              <YAxis yAxisId="left" tick={{ fill: '#6B7280', fontSize: 10 }} tickLine={false} axisLine={false} tickCount={4} width={40} />
                              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6B7280', fontSize: 10 }} tickLine={false} axisLine={false} tickCount={4} width={40} />
                              <Tooltip
                                contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, fontSize: 12, color: '#E1E0CC' }}
                              />
                              <Legend content={() => null} />
                              <Bar yAxisId="left" dataKey="worksCount" name="Papers" fill="#DEDBC8" radius={[4, 4, 0, 0]} maxBarSize={36} opacity={0.8} />
                              <Line yAxisId="right" type="monotone" dataKey="citedByCount" name="Citations" stroke="#4F8CFF" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3, fill: '#4F8CFF', strokeWidth: 0 }} />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-[260px] text-gray-500 text-sm relative z-10">No timeline data available</div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Research Fields — Pie Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.15, duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
                >
                  <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] ring-1 ring-white/[0.04] h-full">
                    <div className="p-6 rounded-[calc(1rem-1.5px)] flex flex-col h-full relative overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, rgba(16,16,16,0.95), rgba(12,12,20,0.98))' }}>
                      <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-purple-500/[0.03] blur-3xl pointer-events-none" />
                      <div className="flex items-center gap-2 mb-4 relative z-10">
                        <div className="p-1.5 rounded-lg bg-[#A78BFA]/10 border border-[#A78BFA]/15"
                          style={{ boxShadow: '0 0 16px rgba(167,139,250,0.06)' }}>
                          <ChartPie size={13} strokeWidth={1.5} className="text-[#A78BFA]" />
                        </div>
                        <h3 className="text-sm font-bold text-[#E1E0CC]">
                          {t('user.researchFields') || 'Research Fields'}
                        </h3>
                      </div>
                      {researchFields.length > 0 ? (
                        <>
                          <div className="flex-1 flex items-center justify-center relative z-10">
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
                          <div className="space-y-2.5 mt-2 relative z-10">
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
                        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm relative z-10">No field data</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* ── Charts Row 2: Collaboration Network + Top Cited Papers ── */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Collaboration Network — Co-author cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.2, duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
                  className="lg:col-span-3"
                >
                  <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] ring-1 ring-white/[0.04]">
                    <div className="p-6 rounded-[calc(1rem-1.5px)] relative overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, rgba(16,16,16,0.95), rgba(12,12,20,0.98))' }}>
                      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-purple-500/[0.03] blur-3xl pointer-events-none" />
                      <div className="flex items-center justify-between mb-5 relative z-10">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-[#A78BFA]/10 border border-[#A78BFA]/15"
                              style={{ boxShadow: '0 0 16px rgba(167,139,250,0.06)' }}>
                              <Network size={13} strokeWidth={1.5} className="text-[#A78BFA]" />
                            </div>
                            <h3 className="text-sm font-bold text-[#E1E0CC]">Co-Authors</h3>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1 ml-9">Frequent collaborators</p>
                        </div>
                        {authorCoAuthors && (
                          <span className="text-[10px] text-gray-500">
                            {authorCoAuthors.totalCoAuthors || authorCoAuthors.coAuthors?.length || 0} co-authors
                          </span>
                        )}
                      </div>
                      {authorDetailLoading ? (
                        <div className="flex flex-wrap gap-2.5 relative z-10">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 w-36 rounded-xl bg-white/[0.03]" />
                          ))}
                        </div>
                      ) : authorCoAuthors?.coAuthors?.length > 0 ? (
                        <div className="flex flex-wrap gap-2.5 relative z-10">
                          {authorCoAuthors.coAuthors.map((ca, i) => (
                            <motion.div
                              key={ca.name || i}
                              initial={{ opacity: 0, scale: 0.92 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 + i * 0.04, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                              whileHover={{ y: -3, transition: { duration: 0.25, ease: [0.32, 0.72, 0, 1] } }}
                              className="px-4 py-3 rounded-xl border border-white/[0.04] transition-all duration-400
                                bg-white/[0.02] hover:border-[#A78BFA]/20 hover:bg-[#A78BFA]/6"
                              style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                            >
                              <p className="text-xs font-semibold text-[#E1E0CC]">{ca.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-gray-500">
                                  {ca.collaborationCount} collaboration{ca.collaborationCount > 1 ? 's' : ''}
                                </span>
                                {ca.lastInstitution && (
                                  <span className="text-[9px] text-gray-600 truncate max-w-[120px]">{ca.lastInstitution}</span>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-[180px] text-gray-500 text-xs relative z-10">
                          No co-author data available
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Top Cited Papers */}
                <motion.div
                  initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.25, duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
                  className="lg:col-span-2"
                >
                  <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] ring-1 ring-white/[0.04] h-full">
                    <div className="p-6 rounded-[calc(1rem-1.5px)] flex flex-col h-full relative overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, rgba(16,16,16,0.95), rgba(12,12,20,0.98))' }}>
                      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-amber-500/[0.03] blur-3xl pointer-events-none" />
                      <div className="flex items-center justify-between mb-5 relative z-10">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-amber-400/10 border border-amber-400/15"
                              style={{ boxShadow: '0 0 16px rgba(251,191,36,0.06)' }}>
                              <Trophy size={13} strokeWidth={1.5} className="text-amber-400" />
                            </div>
                            <h3 className="text-sm font-bold text-[#E1E0CC]">Top Cited Papers</h3>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1 ml-9">Most influential works</p>
                        </div>
                      </div>
                      {authorDetailLoading ? (
                        <div className="space-y-3 flex-1 relative z-10">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-10 w-full rounded-xl bg-white/[0.03]" />
                          ))}
                        </div>
                      ) : authorTopPapers.length > 0 ? (
                        <div className="space-y-2 flex-1 relative z-10">
                          {authorTopPapers.slice(0, 5).map((p, i) => (
                            <motion.button
                              key={p.paperId || i}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.35 + i * 0.05, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                              onClick={() => {
                                if (p.paperId) navigate(`/${role}/search/paper/${p.paperId}`);
                              }}
                              className="w-full text-left p-3 rounded-xl border border-white/[0.04] hover:border-[#DEDBC8]/12
                                bg-white/[0.015] hover:bg-white/[0.03] transition-all duration-400 group"
                              style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-medium text-[#E1E0CC] line-clamp-1 group-hover:text-[#4F8CFF] transition-colors duration-400 flex-1">
                                  {p.title || 'Untitled'}
                                </p>
                                <span className="text-xs font-bold text-amber-400 font-mono tabular-nums shrink-0">
                                  {(p.citationCount ?? p.citations ?? 0).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                                {p.journal && <span className="truncate">{p.journal}</span>}
                                {p.pubYear && <span>{p.pubYear}</span>}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500 text-xs relative z-10">
                          No top papers data
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* ── Recent Publications Table ── */}
              <motion.div
                initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.3, duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
              >
                <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] ring-1 ring-white/[0.04] overflow-hidden">
                  <div className="relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, rgba(16,16,16,0.95), rgba(12,12,20,0.98))' }}>
                    <div className="absolute -bottom-10 -right-10 w-28 h-28 rounded-full bg-[#DEDBC8]/[0.02] blur-3xl pointer-events-none" />
                    <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05] relative z-10">
                      <div>
                        <h3 className="text-sm font-bold text-[#E1E0CC]">
                          {t('user.recentPublications') || 'Recent Publications'}
                        </h3>
                        <p className="text-[10px] text-gray-500 mt-0.5">Latest published research</p>
                      </div>
                    </div>
                    {recentPublications.length > 0 ? (
                      <div className="overflow-x-auto relative z-10">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/[0.04]">
                              {['Title', 'Journal', 'Year', 'Role', 'Citations'].map((h) => (
                                <th key={h} className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-gray-500">
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
                                transition={{ delay: 0.4 + i * 0.05, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                                className="border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors duration-300"
                              >
                                <td className="px-6 py-3.5">
                                  <span className="text-[13px] font-semibold text-[#E1E0CC] block max-w-xs truncate">
                                    {p.title}
                                  </span>
                                </td>
                                <td className="px-6 py-3.5 text-[11px] text-[#DEDBC8] font-medium">
                                  {p.journal || '—'}
                                </td>
                                <td className="px-6 py-3.5 text-[11px] text-gray-400">{p.year || '—'}</td>
                                <td className="px-6 py-3.5">
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
                                <td className="px-6 py-3.5 text-sm font-bold text-[#E1E0CC] font-mono tabular-nums">
                                  {(p.citations ?? 0).toLocaleString()}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-14 text-gray-500 text-sm relative z-10">
                        No publications to display
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── No author selected (researcher) ─── */}
        {isResearcher && !isAuthorView && !hasFollowedAuthors && (
          <motion.div
            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] ring-1 ring-white/[0.04]">
              <div className="flex flex-col items-center gap-3 px-6 py-14 rounded-[calc(1rem-1.5px)] text-center relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(16,16,16,0.95), rgba(12,12,20,0.98))' }}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(222,219,200,0.02),transparent_70%)] pointer-events-none" />
                <div className="p-3 rounded-xl bg-[#DEDBC8]/5 border border-[#DEDBC8]/8 relative z-10"
                  style={{ boxShadow: '0 0 24px rgba(222,219,200,0.04)' }}>
                  <UserPlus size={22} strokeWidth={1.5} className="text-gray-500" />
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-bold text-[#E1E0CC]">
                    Follow authors to unlock research insights
                  </p>
                  <p className="text-xs text-gray-500 mt-1.5 max-w-md leading-relaxed">
                    Search for authors, follow them, then switch the dropdown above to see their citation history, research fields, and publications.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
