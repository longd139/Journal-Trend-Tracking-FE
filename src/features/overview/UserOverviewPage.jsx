import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, YAxis, PieChart, Pie, Cell,
  ComposedChart, Line, Legend,
} from 'recharts';
import {
  FileText, TrendingUp, Award, Users, UserPlus,
  AlertCircle, User, ArrowUpRight, TrendingUp as TrendingUpIcon, Clock,
  Bookmark, Search, BookOpen, ArrowRight, Gauge,
  Network, Trophy, Calendar, Lightbulb, Activity,
  ChartPie, MessageSquareText, UserSearch, Lock,
} from 'lucide-react';
import { overviewAPI } from './api';
import { trendAPI } from '../search/trend.api';
import { paperAPI } from '../search/paper.api';
import { bookmarkAPI } from '../bookmarks/api';
import { authorAPI } from '../search/author.api';
import useActivityStore from '../../store/useActivityStore';
import { useStaleWhileRevalidate } from '../../hooks/useStaleWhileRevalidate.js';
import { UpgradeRequestDialog } from '../user/UpgradeRequestDialog';
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
const CHART_COLORS = ['#F97316', '#FB923C', '#FDBA74', '#EA580C', '#C2410C'];

const spring = { type: 'spring', stiffness: 300, damping: 30 };

/* Custom Tooltip — white text on dark bg */
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px' }}>
      <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 11, margin: 0 }}>{name}</p>
      <p style={{ color: 'var(--foreground)', fontSize: 11, margin: '2px 0 0' }}>{value}%</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   StatCard — Tier 1 elevated surface with spotlight effect
   ═══════════════════════════════════════════════════════════════════════════ */
function StatCard({ label, value, sub, Icon, accent, index = 0 }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty('--mouse-x', `${x}%`);
    cardRef.current.style.setProperty('--mouse-y', `${y}%`);
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.setProperty('--mouse-x', '50%');
      cardRef.current.style.setProperty('--mouse-y', '50%');
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, ...spring }}
      whileHover={{ y: -6 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative p-5 rounded-2xl border flex flex-col gap-3
        bg-card-elevated border-card-elevated-border
        hover:border-primary/20 transition-colors duration-300
        shadow-[inset_0_1px_0_0_var(--border)]
        overflow-hidden"
      style={{ '--mouse-x': '50%', '--mouse-y': '50%' }}
    >
      {/* Spotlight glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle 300px at var(--mouse-x) var(--mouse-y), ${accent}08, transparent 60%)`,
        }}
      />
      <div className="flex items-start justify-between relative z-10">
        <div className="p-2.5 rounded-xl" style={{ background: `${accent}18`, color: accent }}>
          <Icon size={20} />
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-2xl font-bold text-foreground font-display leading-tight tracking-[-0.03em]">{value}</p>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">{label}</p>
      </div>
      {sub && <p className="text-[11px] text-muted-foreground relative z-10">{sub}</p>}
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
            <div key={i} className="p-5 rounded-2xl border bg-card-elevated border-card-elevated-border space-y-3">
              <Skeleton className="h-10 w-10 rounded-xl bg-muted/40" />
              <Skeleton className="h-8 w-20 rounded bg-muted/40" />
              <Skeleton className="h-3 w-28 rounded bg-muted/40" />
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
  const navigate = useNavigate();
  const location = useLocation();
  const role = sessionStorage.getItem('userRole') || 'academic';
  const isResearcher = role === 'researcher';
  const isAcademic = role === 'academic_user' || role === 'academic';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [publicData, setPublicData] = useState(null);
  const [userData, setUserData] = useState(null);

  // ── Search quota (fetched separately, like search page) ──
  const [searchQuota, setSearchQuota] = useState(null);
  const quotaExhausted = isAcademic && (searchQuota?.remainingSearches === 0);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // Activity store for instant counter updates
  const activityPapersViewed = useActivityStore((s) => s.papersViewed);
  const activityBookmarks = useActivityStore((s) => s.bookmarksThisMonth);
  const activitySearches = useActivityStore((s) => s.searchesThisMonth);
  const activityInit = useActivityStore((s) => s.initFromApi);
  const activityIncrPapers = useActivityStore((s) => s.incrementPapersViewed);
  const activityIncrBookmarks = useActivityStore((s) => s.incrementBookmarks);
  const activityIncrSearches = useActivityStore((s) => s.incrementSearches);

  // Author selection
  const [selectedAuthorId, setSelectedAuthorId] = useState('__system__');
  const [followedAuthors, setFollowedAuthors] = useState([]);
  const [authorsLoading, setAuthorsLoading] = useState(false);

  // ── Dashboard extras — cached (shared with tab pages) ──
  const {
    data: recentPapersRaw,
    loading: papersLoading,
    refetch: refetchPapers,
  } = useStaleWhileRevalidate('reading-history-list', async () => {
    const res = await paperAPI.getReadingHistory(20);
    let items = null;
    if (Array.isArray(res)) items = res;
    else if (res && Array.isArray(res.data)) items = res.data;
    else if (res?.data && Array.isArray(res.data.data)) items = res.data.data;
    return Array.isArray(items) ? items : [];
  });

  const {
    data: bookmarksRaw,
    loading: bookmarksLoading,
    refetch: refetchBookmarks,
  } = useStaleWhileRevalidate('bookmarks-list', async () => {
    const res = await bookmarkAPI.getMyBookmarks();
    let items = null;
    if (Array.isArray(res)) items = res;
    else if (res && Array.isArray(res.data)) items = res.data;
    else if (res?.data && Array.isArray(res.data.data)) items = res.data.data;
    return Array.isArray(items) ? items : [];
  });

  const recentPapers = Array.isArray(recentPapersRaw)
    ? recentPapersRaw.slice(0, 5)
    : [];
  const recentBookmarks = Array.isArray(bookmarksRaw)
    ? bookmarksRaw.slice(0, 5)
    : [];

  // ── Trending + Recommendations (not cached — lightweight) ──
  const [trendingKeywords, setTrendingKeywords] = useState([]);
  const [extrasLoading, setExtrasLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);

  // ── Author detail enrichment (Timeline, Co-authors, Top Papers) ──
  const [authorTimeline, setAuthorTimeline] = useState(null);
  const [authorCoAuthors, setAuthorCoAuthors] = useState(null);
  const [authorTopPapers, setAuthorTopPapers] = useState([]);
  const [authorDetailLoading, setAuthorDetailLoading] = useState(false);

  // ── Cached system overview for instant Research Fields ──
  const {
    data: cachedUserOverview,
    refetch: refetchOverview,
  } = useStaleWhileRevalidate('user-overview-system', () => overviewAPI.getUserOverview(null));

  const fetchOverview = useCallback(async (authorId) => {
    setLoading(true);
    setError(null);
    const effectiveId = authorId && authorId !== '__system__' ? authorId : null;
    try {
      const [pubResult, userResult] = await Promise.all([
        overviewAPI.getPublicOverview(effectiveId),
        overviewAPI.getUserOverview(effectiveId),
      ]);
      setPublicData(pubResult);
      setUserData(userResult);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || t('user.failedToLoad');
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

  const fetchExtras = useCallback(async () => {
    setExtrasLoading(true);
    try {
      const promises = [
        trendAPI.getTrendingKeywords(30),
        paperAPI.getRecommendations({ page: 0, size: 5 }),
      ];
      if (isAcademic) {
        promises.push(paperAPI.getUsage());
      }
      const [trendRes, recRes, quotaRes] = await Promise.allSettled(promises);
      if (trendRes.status === 'fulfilled') {
        const trending = Array.isArray(trendRes.value) ? trendRes.value : [];
        // Merge with user's own search history (localStorage) to fill the card
        const historyKey = `scitrack_search_history_${role}`;
        let historyKeywords = [];
        try {
          const raw = localStorage.getItem(historyKey);
          if (raw) {
            historyKeywords = JSON.parse(raw);
          }
        } catch { /* ignore */ }
        const trendingNames = new Set(
          trending.map((t) => (typeof t === 'string' ? t : t.keywordText).toLowerCase())
        );
        const extraFromHistory = historyKeywords
          .filter((k) => !trendingNames.has(k.toLowerCase()))
          .slice(0, 15)
          .map((k) => ({ keywordText: k }));
        setTrendingKeywords([...trending, ...extraFromHistory]);
      }
      if (recRes.status === 'fulfilled') {
        const rData = recRes.value?.recommendations || recRes.value || [];
        setRecommendations(Array.isArray(rData) ? rData : []);
      }
      if (quotaRes && quotaRes.status === 'fulfilled') {
        setSearchQuota(quotaRes.value);
      }
    } finally {
      setExtrasLoading(false);
    }
  }, [isAcademic]);

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
      if (isResearcher || isAcademic) {
        await fetchFollowedAuthors();
      }
      await Promise.all([fetchOverview(null), fetchExtras()]);
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when navigating back to overview (KeepAlive keeps component mounted)
  useEffect(() => {
    if (location.pathname.endsWith('/overview')) {
      if (isResearcher || isAcademic) fetchFollowedAuthors();
      fetchExtras();
      refetchPapers();
      refetchBookmarks();
      refetchOverview();
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keep search quota in sync (re-fetch on navigate back + on every search) ──
  useEffect(() => {
    if (!isAcademic) return;

    const refreshQuota = async () => {
      try {
        const usage = await paperAPI.getUsage();
        if (usage) setSearchQuota(usage);
      } catch { /* silently ignore */ }
    };

    // Re-fetch when navigating back to overview
    if (location.pathname.endsWith('/overview')) {
      refreshQuota();
    }

    // Re-fetch immediately when a search is performed anywhere in the app
    const onSearch = () => {
      refreshQuota();
      refetchOverview();
    };
    window.addEventListener('activity:search', onSearch);
    return () => window.removeEventListener('activity:search', onSearch);
  }, [location.pathname, isAcademic]);

  // ── Seed activity store from API data on initial load ──
  useEffect(() => {
    if (userData) {
      activityInit({
        papersViewed: userData.papersViewed ?? 0,
        bookmarksThisMonth: userData.bookmarksThisMonth ?? 0,
        searchesThisMonth: userData.searchesThisMonth ?? 0,
      });
    }
  }, [userData, activityInit]);

  // ── Listen for real-time activity events ──
  useEffect(() => {
    const onPaperViewed = () => activityIncrPapers();
    const onBookmark = () => activityIncrBookmarks();
    const onSearch = () => activityIncrSearches();

    window.addEventListener('activity:paper-viewed', onPaperViewed);
    window.addEventListener('activity:bookmark', onBookmark);
    window.addEventListener('activity:search', onSearch);

    return () => {
      window.removeEventListener('activity:paper-viewed', onPaperViewed);
      window.removeEventListener('activity:bookmark', onBookmark);
      window.removeEventListener('activity:search', onSearch);
    };
  }, [activityIncrPapers, activityIncrBookmarks, activityIncrSearches]);

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
          <h3 className="text-lg font-bold text-foreground mb-1">{error}</h3>
          <p className="text-sm text-muted-foreground">{t('user.unableToLoad')}</p>
        </div>
        <button
          onClick={() => fetchOverview(selectedAuthorId)}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
        >
          {t('user.retry')}
        </button>
      </div>
    );
  }

  const pd = publicData || {};
  const ud = userData || cachedUserOverview || {};
  const researchFields = ud.researchFields || [];

  const isAuthorView = selectedAuthorId !== '__system__';
  const hasFollowedAuthors = followedAuthors.length > 0;
  const currentAuthor = followedAuthors.find((a) => a.authorId === selectedAuthorId);

  // ── 4 Stat Cards — consolidated palette: blue for data, cream for key, teal for growth ──
  const isAuthorCards = isAuthorView && pd.authorName;

  const authorCards = [
    { label: t('user.publishedPapers'), value: (pd.authorTotalPapers ?? '—').toLocaleString(), sub: t('user.worksBy', { name: pd.authorName || currentAuthor?.authorName || t('user.roleAuthor') }), Icon: FileText, accent: '#4F8CFF' },
    { label: t('user.totalCitations'), value: (pd.authorTotalCitations ?? '—').toLocaleString(), sub: t('user.citationsAcrossWorks'), Icon: TrendingUp, accent: '#DEDBC8' },
    { label: t('user.hIndex'), value: (pd.authorHIndex ?? '—').toLocaleString(), sub: t('user.hIndexSubtext', { h: pd.authorHIndex ?? 'N' }), Icon: Award, accent: '#00D1B2' },
    { label: t('user.coAuthors'), value: (pd.authorCoAuthors ?? '—').toLocaleString(), sub: t('user.uniqueCollaborators'), Icon: UserPlus, accent: '#DEDBC8' },
  ];

  const statCards = isAuthorCards ? authorCards : [];

  // ── Author detail — from /api/v1/overview/user ──
  const citationHistory = ud.citationHistory || [];
  const recentPublications = ud.recentPublications || [];
  const hIndex = ud.hIndex;

  // ── Search quota (academic users only) ──
  // Prefer dedicated usage API (same as search page), fall back to overview API
  const searchesLeft = searchQuota?.remainingSearches ?? ud.searchesRemaining;
  const searchLimit = searchQuota?.monthlyLimit ?? ud.monthlySearchLimit;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* ─── Header Row: Author Selector + Quick Actions ─── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="flex-1" />

          <div className="flex items-center gap-3 flex-wrap">
            {/* Quick Actions — integrated beside header on desktop */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigate(`/${role}/search`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
                  bg-primary text-primary-foreground hover:bg-foreground transition-all duration-200"
              >
                <Search size={12} /> {t('user.newSearch')}
              </button>
              <span className="w-px h-5 bg-primary/10 mx-1" />
              <button
                onClick={() => navigate(`/${role}/bookmarks`)}
                className="flex items-center gap-1 text-[11px] font-medium text-primary/50 hover:text-primary transition-colors"
              >
                <Bookmark size={12} /> {t('user.bookmarks')}
              </button>
              <button
                onClick={() => navigate(`/${role}/search?q=`)}
                className="flex items-center gap-1 text-[11px] font-medium text-primary/50 hover:text-primary transition-colors"
              >
                <TrendingUpIcon size={12} /> {t('user.trendingTopics')}
              </button>
            </div>

            {(isResearcher || isAcademic) && (
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
                <SelectTrigger className="w-[200px] shrink-0 bg-card border-primary/10 text-foreground h-9 text-xs rounded-xl">
                  <SelectValue placeholder={authorsLoading ? t('user.loading') : t('user.myDashboard')} />
                </SelectTrigger>
                <SelectContent className="bg-card border-primary/10 text-foreground shadow-lg shadow-black/40">
                  <SelectItem
                    value="__system__"
                    className="text-xs data-[highlighted]:bg-primary/10 data-[highlighted]:text-foreground focus:bg-primary/10 focus:text-foreground cursor-pointer rounded-lg mx-1 my-0.5"
                  >
                    {t('user.myDashboard')}
                  </SelectItem>
                  {!hasFollowedAuthors && (
                    <div className="px-2 py-3 text-xs text-muted-foreground text-center">
                      {t('user.noFollowedAuthors')}
                    </div>
                  )}
                  {followedAuthors.map((author) => (
                    <SelectItem
                      key={author.authorId}
                      value={author.authorId}
                      className="text-xs data-[highlighted]:bg-primary/10 data-[highlighted]:text-foreground focus:bg-primary/10 focus:text-foreground cursor-pointer rounded-lg mx-1 my-0.5"
                    >
                      {author.authorName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* ─── Author Banner + Stat Cards ─── */}
        {isAuthorView && currentAuthor && (
          <>
            {/* Author name banner — Tier 1 elevated */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 rounded-2xl border bg-card-elevated border-card-elevated-border shadow-[inset_0_1px_0_0_var(--border)]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <User size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">{currentAuthor.authorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('user.hIndexLabel')}: {authorTimeline?.hIndex ?? hIndex ?? '—'}
                    {' · '}
                    {t('user.publicationsListed', { count: recentPublications.length })}
                  </p>
                </div>
              </div>
              {authorTimeline && (
                <div className="flex items-center gap-4 text-xs">
                  <div className="text-center">
                    <p className="font-bold text-foreground font-mono tabular-nums">{authorTimeline.totalPapers?.toLocaleString() || '—'}</p>
                    <p className="text-[10px] text-muted-foreground">{t('user.papers')}</p>
                  </div>
                  <div className="w-px h-6 bg-primary/10" />
                  <div className="text-center">
                    <p className="font-bold text-accent-blue font-mono tabular-nums">{authorTimeline.totalCitations?.toLocaleString() || '—'}</p>
                    <p className="text-[10px] text-muted-foreground">{t('user.citations')}</p>
                  </div>
                  <div className="w-px h-6 bg-primary/10" />
                  <div className="text-center">
                    <p className="font-bold text-accent-teal font-mono tabular-nums">{authorCoAuthors?.coAuthors?.length ?? '—'}</p>
                    <p className="text-[10px] text-muted-foreground">{t('user.coAuthors')}</p>
                  </div>
                </div>
              )}
            </div>

            {isAuthorCards && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                  <StatCard key={i} index={i} {...card} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            My Dashboard Extras — only shown in system-wide view
            ═══════════════════════════════════════════════════════════════════ */}
        {!isAuthorView && (
          <div className="space-y-5">
            {/* ── Search Usage Meter (academic users only) ── */}
            {isAcademic && searchesLeft != null && searchLimit != null && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, ...spring }}
                className="rounded-2xl border p-5 bg-card-recessed border-card-recessed-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Gauge size={14} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{t('user.searchQuota')}</h4>
                      <p className="text-[10px] text-muted-foreground">{t('user.monthlyLimit')}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold font-mono tabular-nums text-foreground">
                    {searchesLeft} <span className="text-[10px] text-muted-foreground font-normal">/ {searchLimit} {t('user.remaining')}</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-primary/8 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(0, Math.min(100, ((searchLimit - searchesLeft) / searchLimit) * 100))}%` }}
                    transition={{ delay: 0.5, ...spring }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {t('user.usageText', { used: searchLimit - searchesLeft, limit: searchLimit })}
                  {searchesLeft <= 3 && searchesLeft > 0 && (
                    <span className="text-primary ml-1">— {t('user.runningLow')}</span>
                  )}
                  {searchesLeft === 0 && (
                    <span className="text-red-400 ml-1">— {t('user.limitReached')}</span>
                  )}
                </p>
              </motion.div>
            )}

            {/* ── Activity Summary (hidden) ── */}

            {/* ── Row: Trending Keywords (3 cols) + Research Fields (2 cols) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              {/* ── Trending Keywords ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, ...spring }}
                className="lg:col-span-3 rounded-2xl border p-6 bg-card-recessed border-card-recessed-border"
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <TrendingUpIcon size={15} className="text-accent-teal" /> Trending Keywords
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{t('user.hotKeywords')}</p>
                  </div>
                </div>
                {extrasLoading ? (
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-24 rounded-xl bg-muted/40" />
                    ))}
                  </div>
                ) : trendingKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {trendingKeywords.map((kw, i) => (
                      <motion.button
                        key={kw.keywordText || i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + i * 0.04, ...spring }}
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate(`/${role}/search?q=${encodeURIComponent(kw.keywordText)}`)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200
                          bg-primary/5 border-primary/10 text-primary
                          hover:bg-primary/12 hover:border-primary/25 hover:text-foreground"
                      >
                        {kw.keywordText}
                        {kw.paperCount != null && (
                          <span className="ml-1.5 text-[10px] text-muted-foreground">{kw.paperCount.toLocaleString()}</span>
                        )}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-20 text-muted-foreground text-xs">
                    {t('user.noTrendingData')}
                  </div>
                )}
              </motion.div>

              {/* ── Research Fields — Mini Pie ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, ...spring }}
                className="lg:col-span-2 rounded-2xl border p-6 bg-card-recessed border-card-recessed-border flex flex-col relative overflow-hidden"
              >
                {quotaExhausted && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
                    <div className="text-center space-y-3 px-4">
                      <Lock size={20} className="text-primary/40 mx-auto" />
                      <p className="text-xs text-muted-foreground max-w-[200px]">
                        Research fields — available when you have searches remaining.
                      </p>
                      <button
                        onClick={() => setUpgradeOpen(true)}
                        className="px-4 py-2 rounded-lg text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-foreground transition-colors"
                      >
                        Upgrade
                      </button>
                    </div>
                  </div>
                )}
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
                  <ChartPie size={15} className="text-primary" /> {t('user.researchFields')}
                </h3>
                {extrasLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <Skeleton className="w-28 h-28 rounded-full bg-muted/40" />
                  </div>
                ) : researchFields.length > 0 ? (
                  <>
                    <div className="flex-1 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height={140}>
                        <PieChart>
                          <Pie
                            data={researchFields.slice(0, 4)}
                            cx="50%" cy="50%"
                            innerRadius={35} outerRadius={55}
                            dataKey="value"
                            nameKey="name"
                            stroke="none"
                            paddingAngle={2}
                          >
                            {researchFields.slice(0, 4).map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-1.5 mt-2">
                      {researchFields.slice(0, 4).map((f, i) => (
                        <div key={f.name || i} className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                            <span className="text-muted-foreground truncate">{f.name}</span>
                          </div>
                          <span className="text-muted-foreground ml-1 shrink-0">{f.value}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs">No data</div>
                )}
              </motion.div>
            </div>

            {/* ── Row: Recommendations (4 cols) + Bookmarks (1 col) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              {/* ── Research Recommendations ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, ...spring }}
                className="lg:col-span-4 rounded-2xl border p-6 bg-card-recessed border-card-recessed-border"
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <TrendingUpIcon size={15} className="text-primary" /> Paper Trending
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Popular recent papers you might find interesting</p>
                  </div>
                </div>
                {extrasLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-14 w-full rounded-xl bg-muted/40" />
                    ))}
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="space-y-2">
                    {recommendations.slice(0, 4).map((rec, i) => {
                      const p = rec.paper || rec;
                      return (
                        <motion.button
                          key={p.paperId || i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.45 + i * 0.05, ...spring }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (p.paperId) navigate(`/${role}/papers/${p.paperId}`);
                          }}
                          className="w-full text-left p-3 rounded-xl border border-primary/6 hover:border-primary/15
                            bg-transparent hover:bg-primary/3 transition-all duration-200 group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 rounded-lg bg-primary/10 shrink-0 mt-0.5">
                              <Lightbulb size={12} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground line-clamp-1 group-hover:text-accent-blue transition-colors">
                                {p.title || t('user.untitled')}
                              </p>
                              <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                                {p.journal && <span className="truncate">{p.journal}</span>}
                                {p.pubYear && <span>{p.pubYear}</span>}
                                {(p.citationCount != null) && (
                                  <span className="flex items-center gap-0.5"><Award size={9} /> {p.citationCount}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                    <Lightbulb size={20} className="text-foreground/80" />
                    <p className="text-xs text-muted-foreground">Search for papers to get recommendations</p>
                  </div>
                )}
              </motion.div>

              {/* ── Bookmarks Summary (compact sidebar) ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, ...spring }}
                className="lg:col-span-1 rounded-2xl border p-5 bg-transparent border-dashed border-border flex flex-col relative overflow-hidden"
              >
                {quotaExhausted && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
                    <div className="text-center space-y-3 px-4">
                      <Lock size={20} className="text-primary/40 mx-auto" />
                      <p className="text-xs text-muted-foreground max-w-[200px]">
                        Bookmarks — available when you have searches remaining.
                      </p>
                      <button
                        onClick={() => setUpgradeOpen(true)}
                        className="px-4 py-2 rounded-lg text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-foreground transition-colors"
                      >
                        Upgrade
                      </button>
                    </div>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Bookmark size={15} className="text-accent-blue" /> {t('user.bookmarks')}
                  </h3>
                </div>
                {bookmarksLoading ? (
                  <div className="space-y-3 flex-1">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-xl bg-muted/40" />
                    ))}
                  </div>
                ) : recentBookmarks.length > 0 ? (
                  <div className="space-y-2 flex-1">
                    {recentBookmarks.slice(0, 4).map((bm, i) => (
                      <motion.button
                        key={bm.bookmarkId || i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.48 + i * 0.06, ...spring }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (bm.paperId) navigate(`/${role}/papers/${bm.paperId}`);
                        }}
                        className="w-full text-left p-2.5 rounded-xl border border-primary/6 hover:border-primary/15
                          bg-transparent hover:bg-primary/3 transition-all duration-200 group"
                      >
                        <p className="text-xs font-medium text-foreground truncate group-hover:text-accent-blue transition-colors">
                          {bm.paperTitle || bm.keywordText || t('user.untitled')}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {bm.collectionName || t('user.general')}
                          {bm.createdAt && ` · ${new Date(bm.createdAt).toLocaleDateString()}`}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
                    <Bookmark size={20} className="text-foreground/80" />
                    <p className="text-xs text-muted-foreground">No bookmarks yet</p>
                  </div>
                )}
                {recentBookmarks.length > 0 && (
                  <button
                    onClick={() => navigate(`/${role}/bookmarks`)}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-medium
                      text-primary/60 hover:text-primary bg-primary/5 hover:bg-primary/10 transition-all"
                  >
                    {t('user.viewAll')} <ArrowRight size={12} />
                  </button>
                )}
              </motion.div>
            </div>

            {/* ── Recently Viewed Papers ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.44, ...spring }}
              className="rounded-2xl border p-6 bg-transparent border-dashed border-border relative overflow-hidden"
            >
              {quotaExhausted && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
                  <div className="text-center space-y-3 px-4">
                    <Lock size={20} className="text-primary/40 mx-auto" />
                    <p className="text-xs text-muted-foreground max-w-[200px]">
                      Recently viewed papers — available when you have searches remaining.
                    </p>
                    <button
                      onClick={() => setUpgradeOpen(true)}
                      className="px-4 py-2 rounded-lg text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-foreground transition-colors"
                    >
                      Upgrade
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Clock size={15} className="text-accent-teal" /> {t('user.recentlyViewed')}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{t('user.pickUpWhereLeft')}</p>
                </div>
                <button
                  onClick={() => navigate(`/${role}/reading-history`)}
                  className="flex items-center gap-1 text-[10px] font-medium text-primary/50 hover:text-primary transition-colors"
                >
                  {t('user.viewHistory')} <ArrowRight size={11} />
                </button>
              </div>
              {papersLoading ? (
                <div className="flex gap-4 overflow-hidden">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="min-w-[220px] p-4 rounded-xl border border-border space-y-2">
                      <Skeleton className="h-3 w-3/4 rounded bg-muted/40" />
                      <Skeleton className="h-3 w-1/2 rounded bg-muted/40" />
                      <Skeleton className="h-3 w-1/3 rounded bg-muted/40" />
                    </div>
                  ))}
                </div>
              ) : recentPapers.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                  {recentPapers.map((p, i) => (
                    <motion.button
                      key={p.paperId || i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.06, ...spring }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/${role}/papers/${p.paperId}`)}
                      className="shrink-0 w-[240px] p-4 rounded-xl border border-primary/6 hover:border-primary/15
                        bg-transparent hover:bg-primary/3 transition-all duration-200 text-left group"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div className="p-1 rounded-md bg-accent-teal/10 shrink-0 mt-0.5">
                          <BookOpen size={12} className="text-accent-teal" />
                        </div>
                        <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-accent-teal transition-colors">
                          {p.paperTitle || t('user.untitled')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        {p.journalName && <span className="truncate">{p.journalName}</span>}
                        {p.pubYear && <span>{p.pubYear}</span>}
                        {p.citationCount != null && (
                          <span className="flex items-center gap-0.5">
                            <Award size={9} /> {p.citationCount}
                          </span>
                        )}
                      </div>
                      {p.viewedAt && (
                        <p className="text-[9px] text-muted-foreground mt-2">
                          Viewed {new Date(p.viewedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                  <Clock size={20} className="text-foreground/80" />
                  <p className="text-xs text-muted-foreground">No papers viewed yet</p>
                  <button
                    onClick={() => navigate(`/${role}/search`)}
                    className="text-[10px] text-accent-blue hover:underline"
                  >
                    Search for papers to get started
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* ─── Author-specific section ─── */}
        <AnimatePresence mode="wait">
          {isAuthorView && currentAuthor && (
            <motion.div
              key={selectedAuthorId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ...spring }}
              className="space-y-6"
            >
              {/* ── Charts Row 1: Publication Timeline + Research Fields ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Publication Timeline — Tier 2 recessed */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, ...spring }}
                  className="lg:col-span-2 rounded-2xl border p-6 bg-card-recessed border-card-recessed-border"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Calendar size={15} className="text-primary" /> {t('user.publicationTimeline')}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{t('user.researchOutput')}</p>
                    </div>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded" style={{ background: '#DEDBC8' }} />{t('user.papersChart')}</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-accent-blue" style={{ borderTop: '2px dashed #4F8CFF', height: 0 }} />{t('user.citationsChart')}</span>
                    </div>
                  </div>
                  {authorDetailLoading ? (
                    <div className="flex items-center justify-center h-[260px]">
                      <Skeleton className="w-full h-full rounded-xl bg-muted/40" />
                    </div>
                  ) : authorTimeline?.timeline?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                        <ComposedChart data={authorTimeline.timeline} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} vertical={false} />
                          <XAxis dataKey="year" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} tickLine={false} axisLine={false} />
                          <YAxis yAxisId="left" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} tickLine={false} axisLine={false} tickCount={4} width={40} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} tickLine={false} axisLine={false} tickCount={4} width={40} />
                          <Tooltip
                            contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
                            labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
                            itemStyle={{ color: 'var(--foreground)' }}
                          />
                          <Legend content={() => null} />
                          <Bar yAxisId="left" dataKey="worksCount" name={t('user.papersChart')} fill="#DEDBC8" radius={[4, 4, 0, 0]} maxBarSize={36} opacity={0.8} />
                          <Line yAxisId="right" type="monotone" dataKey="citedByCount" name={t('user.citationsChart')} stroke="#4F8CFF" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3, fill: '#4F8CFF', strokeWidth: 0 }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">No timeline data available</div>
                  )}
                </motion.div>

                {/* Research Fields — Pie Chart — Tier 2 recessed */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, ...spring }}
                  className="rounded-2xl border p-6 bg-card-recessed border-card-recessed-border flex flex-col"
                >
                  <h3 className="text-base font-semibold text-foreground mb-4">
                    {t('user.researchFields')}
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
                            <Tooltip content={<CustomTooltip />} />
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
                              <span className="text-muted-foreground truncate">{f.name}</span>
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
                    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">No field data</div>
                  )}
                </motion.div>
              </div>

              {/* ── Charts Row 2: Collaboration Network + Top Cited Papers ── */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Co-Authors — Tier 2 recessed */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, ...spring }}
                  className="lg:col-span-3 rounded-2xl border p-6 bg-card-recessed border-card-recessed-border"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Network size={15} className="text-primary" /> {t('user.coAuthors')}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{t('user.frequentCollaborators')}</p>
                    </div>
                    {authorCoAuthors && (
                      <span className="text-[10px] text-muted-foreground">
                        {t('user.nCoAuthors', { count: authorCoAuthors.totalCoAuthors || authorCoAuthors.coAuthors?.length || 0 })}
                      </span>
                    )}
                  </div>
                  {authorDetailLoading ? (
                    <div className="flex flex-wrap gap-2.5">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-36 rounded-xl bg-muted/40" />
                      ))}
                    </div>
                  ) : authorCoAuthors?.coAuthors?.length > 0 ? (
                    <div className="flex flex-wrap gap-2.5">
                      {authorCoAuthors.coAuthors.map((ca, i) => (
                        <motion.div
                          key={ca.name || i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.04, ...spring }}
                          whileHover={{ y: -2 }}
                          className="px-4 py-3 rounded-xl border transition-all duration-200
                            bg-primary/3 border-primary/8 hover:border-primary/25 hover:bg-primary/6"
                        >
                          <p className="text-xs font-semibold text-foreground">{ca.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground">
                              {t('user.collaboration', { count: ca.collaborationCount })}
                            </span>
                            {ca.lastInstitution && (
                              <span className="text-[9px] text-muted-foreground truncate max-w-[120px]">{ca.lastInstitution}</span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[180px] text-muted-foreground text-xs">
                      No co-author data available
                    </div>
                  )}
                </motion.div>

                {/* Top Cited Papers — Tier 2 recessed */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, ...spring }}
                  className="lg:col-span-2 rounded-2xl border p-6 bg-card-recessed border-card-recessed-border flex flex-col"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Trophy size={15} className="text-primary" /> {t('user.topCitedPapers')}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{t('user.mostInfluential')}</p>
                    </div>
                  </div>
                  {authorDetailLoading ? (
                    <div className="space-y-3 flex-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-xl bg-muted/40" />
                      ))}
                    </div>
                  ) : authorTopPapers.length > 0 ? (
                    <div className="space-y-2 flex-1">
                      {authorTopPapers.slice(0, 5).map((p, i) => (
                        <motion.button
                          key={p.paperId || i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.35 + i * 0.05, ...spring }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (p.paperId) navigate(`/${role}/papers/${p.paperId}`);
                          }}
                          className="w-full text-left p-3 rounded-xl border border-primary/6 hover:border-primary/15
                            bg-transparent hover:bg-primary/3 transition-all duration-200 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-medium text-foreground line-clamp-1 group-hover:text-accent-blue transition-colors flex-1">
                              {p.title || t('user.untitled')}
                            </p>
                            <span className="text-xs font-bold text-primary font-mono tabular-nums shrink-0">
                              {(p.citationCount ?? p.citations ?? 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                            {p.journal && <span className="truncate">{p.journal}</span>}
                            {p.pubYear && <span>{p.pubYear}</span>}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs">
                      No top papers data
                    </div>
                  )}
                </motion.div>
              </div>

              {/* ── Recent Publications Table ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, ...spring }}
                className="rounded-2xl border overflow-hidden bg-card-recessed border-card-recessed-border"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {t('user.recentPublications')}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{t('user.latestPublished')}</p>
                  </div>
                </div>
                {recentPublications.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          {[t('user.tableTitle'), t('user.tableJournal'), t('user.tableYear'), t('user.tableRole'), t('user.tableCitations')].map((h) => (
                            <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                            transition={{ delay: 0.35 + i * 0.05, ...spring }}
                            className="border-b border-border hover:bg-muted/10 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <span className="text-sm font-semibold text-foreground block max-w-xs truncate">
                                {p.title}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-primary font-medium">
                              {p.journal || '—'}
                            </td>
                            <td className="px-6 py-4 text-xs text-muted-foreground">{p.year || '—'}</td>
                            <td className="px-6 py-4">
                              <GlowBadge
                                color={
                                  p.role === 'First Author' ? '#E1E0CC'
                                    : p.role === 'Corresponding Author' ? '#4F8CFF'
                                    : '#A09878'
                                }
                              >
                                {p.role === 'First Author' ? t('user.roleFirstAuthor')
                                  : p.role === 'Corresponding Author' ? t('user.roleCorrespondingAuthor')
                                  : p.role || t('user.roleAuthor')}
                              </GlowBadge>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-foreground">
                              {(p.citations ?? 0).toLocaleString()}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    {t('user.noPublications')}
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
            transition={spring}
            className="flex flex-col items-center gap-3 px-5 py-12 rounded-2xl border border-dashed bg-transparent border-primary/10 text-center"
          >
            <div className="p-3 rounded-xl bg-primary/5">
              <UserPlus size={24} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Follow authors to unlock research insights
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-md">
                {t('user.emptyStateText')}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Upgrade Request Dialog */}
      <AnimatePresence>
        <UpgradeRequestDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
      </AnimatePresence>
    </div>
  );
}
