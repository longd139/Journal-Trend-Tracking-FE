import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, X, BookOpen, FileText, Star, User, Hash,
  TrendingUp, AlertCircle, Library, Newspaper, Globe,
  Clock, Trash2, Lock, Gauge, History,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../user/store.js';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { paperAPI } from './paper.api';
import { journalAPI } from './journal.api';
import { StatCard } from '../../components/SharedUI';
import TopPapers from './TopPapers';
import PaperListSidebar from './PaperListSidebar';
import FollowButton from '../follows/FollowButton';

/* ═══════════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════════ */

const Q_COLORS = { Q1: '#34D399', Q2: '#F59E0B', Q3: '#FB923C', Q4: '#EF4444' };

/** Quick check whether a string looks like a UUID (used to decide API-vs-cache path). */
const _isUUID = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

/* ═══════════════════════════════════════════════════════════════════════════
   Journal Header
   ═══════════════════════════════════════════════════════════════════════════ */

function JournalHeader({ journal }) {
  const navigate = useNavigate();
  const role = sessionStorage.getItem('userRole') || 'academic';
  if (!journal) return null;
  const qColor = Q_COLORS[journal.quartile] || 'var(--muted-foreground)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-border bg-card-recessed p-6 space-y-4"
    >
      {/* Journal name */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Library size={18} className="text-primary/40" />
            <h2 className="text-lg font-bold text-foreground font-display">
              {journal.journalName}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-foreground/60">
            {journal.publisher && (
              <span className="flex items-center gap-1">
                <Globe size={11} />
                {journal.publisher}
              </span>
            )}
            {journal.issn && (
              <span className="flex items-center gap-1">
                <Hash size={11} />
                ISSN {journal.issn}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Follow */}
          <FollowButton
            journalId={journal.journalId}
            journalName={journal.journalName}
          />
          {/* Impact Factor */}
          {journal.impactFactor != null && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <TrendingUp size={12} className="text-amber-400" />
              <span className="text-xs font-bold text-amber-400">IF {journal.impactFactor}</span>
            </div>
          )}
          {/* Quartile */}
          {journal.quartile && (
            <span
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: `${qColor}18`, color: qColor, border: `1px solid ${qColor}30` }}
            >
              {journal.quartile}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Timeline Chart
   ═══════════════════════════════════════════════════════════════════════════ */

function TimelineChart({ timeline }) {
  if (!timeline || timeline.length === 0) return null;

  const sorted = [...timeline].sort((a, b) => a.year - b.year);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-border bg-card-recessed p-6 space-y-4"
    >
      <div className="flex items-center gap-2">
        <TrendingUp size={14} className="text-primary/40" />
        <span className="text-[11px] uppercase tracking-wider font-bold text-foreground/60">
          Publication Timeline
        </span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sorted} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="paperGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="citationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="year"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: 'var(--popover-foreground)', fontWeight: 600 }}
              itemStyle={{ color: 'var(--popover-foreground)' }}
            />
            <Area
              type="monotone"
              dataKey="paperCount"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#paperGradient)"
              name="Papers"
            />
            <Area
              type="monotone"
              dataKey="citationCount"
              stroke="var(--chart-4)"
              strokeWidth={2}
              fill="url(#citationGradient)"
              name="Citations"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-[11px] text-foreground/60">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
          Papers
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground" />
          Citations
        </span>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Top Authors
   ═══════════════════════════════════════════════════════════════════════════ */

function TopAuthors({ authors, isAcademic }) {
  if (!authors || authors.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-border bg-card-recessed p-6 space-y-4"
    >
      <div className="flex items-center gap-2">
        <User size={14} className="text-primary/40" />
        <span className="text-[11px] uppercase tracking-wider font-bold text-foreground/60">
          Top Authors
        </span>
        <span className="text-[10px] text-foreground/60 ml-auto">By total citations</span>
      </div>

      <div className="space-y-2">
        {authors.map((author, i) => {
          const isBlurred = isAcademic && i < 3;
          return (
            <motion.div
              key={author.authorName || i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
              className={`relative flex items-center gap-4 px-4 py-3 rounded-xl bg-primary/[0.03] border border-border hover:bg-primary/[0.06] transition-colors ${
                isBlurred ? 'blur-[4px] select-none pointer-events-none' : ''
              }`}
            >
              {/* Rank */}
              <span className="w-5 text-xs font-bold text-foreground/60 text-center">#{i + 1}</span>

              {/* Author name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{author.authorName}</p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-xs font-bold text-foreground">{author.paperCount}</p>
                  <p className="text-[10px] text-foreground/60">Papers</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-foreground">{author.totalCitations?.toLocaleString()}</p>
                  <p className="text-[10px] text-foreground/60">Citations</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-muted-foreground">{author.avgCitationsPerPaper?.toFixed(1)}</p>
                  <p className="text-[10px] text-foreground/60">Avg</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Top Keywords
   ═══════════════════════════════════════════════════════════════════════════ */

function TopKeywords({ keywords }) {
  if (!keywords || keywords.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Hash size={12} className="text-primary/30" />
      {keywords.map((kw) => (
        <span
          key={kw}
          className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-accent-blue/10 text-accent-blue border border-accent-blue/20"
        >
          {kw}
        </span>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Loading Skeleton
   ═══════════════════════════════════════════════════════════════════════════ */

function JournalSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Header skeleton */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <div className="h-5 w-64 bg-primary/8 rounded" />
        <div className="h-3 w-48 bg-primary/5 rounded" />
      </div>
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl p-5 border border-border bg-card space-y-3">
            <div className="h-3 w-14 bg-primary/8 rounded" />
            <div className="h-6 w-20 bg-primary/8 rounded" />
            <div className="h-3 w-10 bg-primary/5 rounded" />
          </div>
        ))}
      </div>
      {/* Timeline skeleton */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="h-3 w-32 bg-primary/8 rounded mb-4" />
        <div className="h-48 bg-primary/3 rounded-lg" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function SearchJournal({ embedded = false, initialQuery = '' }) {
  const { t } = useTranslation('search');
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [searchedKeyword, setSearchedKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [journalStats, setJournalStats] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [topAuthors, setTopAuthors] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [apiSuggestions, setApiSuggestions] = useState([]);
  const [showSuggestionList, setShowSuggestionList] = useState(false);
  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);

  // ─── Paper List Sidebar ───
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarKeyword, setSidebarKeyword] = useState('');
  const [sidebarTotal, setSidebarTotal] = useState(null);

  const currentRole = sessionStorage.getItem('userRole') || 'researcher';
  const isAcademic = currentRole === 'academic_user' || currentRole === 'academic';
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const userId = user?.id || user?.email || currentRole;
  const historyKey = useMemo(() => `scitrack_journal_history_${userId}`, [userId]);

  // ── Search quota for academics ──
  const [searchesLeft, setSearchesLeft] = useState(null);
  const [searchLimit, setSearchLimit] = useState(null);
  const [resetDate, setResetDate] = useState(null);
  const quotaExhausted = isAcademic && searchesLeft === 0;

  useEffect(() => {
    if (!isAcademic) return;
    (async () => {
      try {
        const data = await paperAPI.getUsage();
        if (data?.remainingSearches != null) setSearchesLeft(data.remainingSearches);
        if (data?.monthlyLimit != null) setSearchLimit(data.monthlyLimit);
        if (data?.resetDate != null) setResetDate(data.resetDate);
      } catch { /* silently ignore */ }
    })();
  }, [isAcademic]);

  // Load search history
  useEffect(() => {
    try {
      const data = localStorage.getItem(historyKey);
      if (data) setSearchHistory(JSON.parse(data));
    } catch {
      setSearchHistory([]);
    }
  }, [historyKey]);

  // Helpers
  const saveToHistory = (kw) => {
    const trimmed = kw.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...searchHistory.filter((k) => k !== trimmed)].slice(0, 10);
    setSearchHistory(updated);
    localStorage.setItem(historyKey, JSON.stringify(updated));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(historyKey);
    setShowSuggestions(false);
  };

  const removeHistoryItem = (kw) => {
    const updated = searchHistory.filter((k) => k !== kw);
    setSearchHistory(updated);
    localStorage.setItem(historyKey, JSON.stringify(updated));
  };

  // Restore search on mount if query was persisted — REMOVED (now shows zero state)
  // Keep search results when navigating away — KeepAlive preserves state.
  const isJournalRoute = location.pathname.endsWith('/journal-search');
  useEffect(() => {
    if (!isJournalRoute) {
      setQuery('');
      setApiSuggestions([]);
      setShowSuggestions(false);
      setShowHistory(false);
      setShowSuggestionList(false);
    }
  }, [isJournalRoute]);

  // ─── Browse mode (categories) ───
  const [categories, setCategories] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [fieldData, setFieldData] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingField, setLoadingField] = useState(false);
  const [browseError, setBrowseError] = useState(null);

  // ─── Debounced journal autocomplete (API suggest) ───
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setApiSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        // Strip Vietnamese diacritics — OpenAlex doesn't support them
        const stripped = q.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
        const suggestions = await journalAPI.getSuggest(stripped);
        setApiSuggestions(Array.isArray(suggestions) ? suggestions : []);
      } catch {
        setApiSuggestions([]);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // ── Merge API suggestions + filtered history (API first, no duplicates) ──
  const filteredHistory = query.trim()
    ? searchHistory.filter((k) => k.toLowerCase().includes(query.toLowerCase()))
    : searchHistory;
  const mergedSuggestions = useMemo(() => {
    const apiNames = apiSuggestions.map((s) => s.name);
    const historyExtras = filteredHistory.filter(
      (k) => !apiNames.some((n) => n.toLowerCase() === k.toLowerCase()),
    );
    return { api: apiSuggestions, history: historyExtras };
  }, [apiSuggestions, filteredHistory]);

  /* ─── Search journal ─── */
  const handleSearch = (keywordOverride) => {
    const q = (keywordOverride || query).trim();
    if (!q) return;

    if (quotaExhausted) {
      toast.error('Search limit reached', {
        description: `You have used all ${searchLimit} searches this month. Upgrade to Researcher for unlimited access.`,
        action: { label: 'Upgrade', onClick: () => navigate(`/${currentRole}/settings`) },
        duration: 6000,
      });
      return;
    }

    saveToHistory(q);
    setQuery(q);
    setShowSuggestions(false);
    setApiSuggestions([]);

    // ── Quota check in background (fire-and-forget, non-blocking) ──
    if (isAcademic) {
      paperAPI.checkQuota(q)
        .then((quotaResult) => {
          if (quotaResult?.quotaConsumed) return paperAPI.getUsage();
        })
        .then((usage) => {
          if (usage?.remainingSearches != null) setSearchesLeft(usage.remainingSearches);
          if (usage?.resetDate != null) setResetDate(usage.resetDate);
        })
        .catch((err) => {
          if (err?.response?.status === 403 || err?.apiStatus === 403) {
            setSearchesLeft(0);
            toast.error('Search limit reached', {
              description: `You have used all ${searchLimit} searches this month. Upgrade to Researcher for unlimited access.`,
              action: { label: 'Upgrade', onClick: () => navigate(`/${currentRole}/settings`) },
              duration: 6000,
            });
          } else {
            console.error('Quota check failed:', err);
          }
        });
    }

    let cancelled = false;

    async function fetchAll() {
      setIsLoading(true);
      setError(null);
      setJournalStats(null);
      setTimeline(null);
      setTopAuthors([]);

      try {
        const [stats, tl, authors] = await Promise.all([
          paperAPI.getJournalQuickStats(q),
          paperAPI.getJournalTimeline(q),
          paperAPI.getJournalTopAuthors(q),
        ]);

        // Enrich quartile from journal search API (quick-stats may not include it)
        let enrichedStats = stats;
        try {
          const journals = await journalAPI.searchJournals(q, 1);
          if (journals && journals.length > 0 && journals[0].quartile) {
            enrichedStats = { ...stats, quartile: journals[0].quartile };
          }
        } catch {
          // silent — keep stats as-is
        }

        if (!cancelled) {
          if (enrichedStats) setJournalStats(enrichedStats);
          if (tl) setTimeline(Array.isArray(tl.timeline) ? tl.timeline : Array.isArray(tl) ? tl : []);
          if (authors) setTopAuthors(Array.isArray(authors) ? authors : []);
          setSearchedKeyword(q);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Journal search error:', err);
          if (err?.response?.status === 403 || err?.apiStatus === 403) {
            setSearchesLeft(0);
            toast.error('Search limit reached', {
              description: 'Upgrade to Researcher for unlimited searches.',
              action: { label: 'Upgrade', onClick: () => navigate(`/${currentRole}/settings`) },
              duration: 6000,
            });
          }
          setError(err?.message || 'Failed to load journal data');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchAll();
  };

  /* ─── Keyboard shortcut ─── */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = query.trim();
      if (!q) return;
      setShowSuggestions(false);
      handleSearch(q);
    }
  };

  /* ─── Browse mode: fetch categories when no query ─── */
  useEffect(() => {
    if (query.trim()) return;

    // Clear stale search results when returning to browse mode
    setJournalStats(null);
    setTimeline(null);
    setTopAuthors([]);
    setError(null);

    let cancelled = false;

    async function loadCategories() {
      setLoadingCategories(true);
      setBrowseError(null);
      try {
        const cats = await journalAPI.getCategories();
        if (!cancelled && Array.isArray(cats)) {
          // Normalize: ensure every category has a usable id (OpenAlex fallback
          // sends fieldId=null which gets stripped by @JsonInclude NON_NULL).
          const normalized = cats.map((c, i) => ({
            ...c,
            fieldId: c.fieldId || c.fieldName || `category-${i}`,
          }));
          // Sort by journalCount descending
          const sorted = normalized.sort((a, b) => (b.journalCount || 0) - (a.journalCount || 0));
          setCategories(sorted);
          // Auto-select first category + fetch journals if not preloaded
          if (sorted.length > 0) {
            const first = sorted[0];
            setSelectedFieldId(first.fieldId);
            if (first.topJournals && first.topJournals.length > 0) {
              setFieldData(first);
            } else if (_isUUID(first.fieldId)) {
              // Categories list lacks full journal data — fetch it
              setLoadingField(true);
              try {
                const full = await journalAPI.getByField(first.fieldId);
                if (!cancelled) setFieldData(full || first);
              } catch {
                if (!cancelled) setFieldData(first);
              } finally {
                if (!cancelled) setLoadingField(false);
              }
            } else {
              // Non-UUID id (OpenAlex) — use whatever data we have
              setFieldData(first);
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load categories:', err);
          setBrowseError(err?.message || 'Failed to load journal categories');
        }
      } finally {
        if (!cancelled) setLoadingCategories(false);
      }
    }

    loadCategories();
    return () => { cancelled = true; };
  }, [query]);

  // ── Embedded mode: show journal suggestion list for the query ──
  useEffect(() => {
    if (embedded && initialQuery) {
      setQuery(initialQuery);
      setShowSuggestionList(true);
    }
  }, [initialQuery, embedded]);

  /* ─── Browse mode: fetch journals for a specific field ─── */
  const handleFieldClick = async (fieldId) => {
    if (!fieldId) return;

    // Same tab + already has journal data → no-op (avoid redundant fetch)
    if (fieldId === selectedFieldId && fieldData?.topJournals?.length > 0) return;

    setSelectedFieldId(fieldId);
    setLoadingField(true);
    try {
      const cat = categories.find((c) => c.fieldId === fieldId);
      if (cat && cat.topJournals && cat.topJournals.length > 0) {
        setFieldData(cat);
      } else if (cat && _isUUID(fieldId)) {
        // Only call getByField for real UUIDs (DB fields); OpenAlex data is self-contained
        const data = await journalAPI.getByField(fieldId);
        setFieldData(data || cat);
      } else {
        // OpenAlex fallback — use whatever the category already carries
        setFieldData(cat || null);
      }
    } catch (err) {
      console.error('Failed to load field journals:', err);
    } finally {
      setLoadingField(false);
    }
  };

  /* ═══════════════════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════════════════ */

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* ─── Journal Search Bar ─── */}
        <div className={embedded ? 'hidden' : 'relative'}>
          <div className="relative">
            <BookOpen size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 z-10" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={quotaExhausted ? 'Search limit reached — upgrade to continue' : 'Search by journal name or ID...'}
              value={query}
              disabled={quotaExhausted}
              onChange={(e) => { setQuery(e.target.value); setShowSuggestionList(false); }}
              onKeyDown={handleKeyDown}
              onFocus={() => { if (!quotaExhausted && query.trim().length >= 2) setShowSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className={`w-full pl-12 pr-14 py-4 rounded-2xl text-sm bg-card border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/10 transition-all ${
                quotaExhausted
                  ? 'border-red-500/20 opacity-50 cursor-not-allowed'
                  : 'border-primary/10'
              }`}
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setSearchedKeyword(''); setJournalStats(null); setTimeline(null); setTopAuthors([]); setError(null); }}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-primary/10 text-primary/60 hover:bg-primary/20 hover:text-primary transition-all"
              >
                <X size={14} />
              </button>
            )}
            {/* History toggle button */}
            <button
              type="button"
              onClick={() => {
                setShowHistory(!showHistory);
                setShowSuggestions(false);
              }}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${
                showHistory
                  ? 'bg-primary/20 text-primary'
                  : 'bg-transparent text-primary/40 hover:bg-primary/10 hover:text-primary'
              }`}
              title="Search history"
            >
              <History size={14} />
            </button>
          </div>

          {/* Keyword autocomplete dropdown — simple names while typing */}
          <AnimatePresence>
            {showSuggestions && query.trim().length >= 2 && !showSuggestionList && !journalStats && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 right-0 mt-2 z-20 rounded-2xl border bg-card border-primary/10 shadow-xl shadow-black/40 overflow-hidden"
              >
                {apiSuggestions.length > 0 ? (
                  apiSuggestions.map((s) => (
                    <button key={s.id || s.name} type="button"
                      onMouseDown={(e) => { e.preventDefault(); setShowSuggestions(false); handleSearch(s.name); }}
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-xs text-left hover:bg-muted/40 transition-colors"
                    >
                      <BookOpen size={12} className="text-primary/50 shrink-0" />
                      <span className="text-foreground truncate">{s.name}</span>
                      {s.issn && <span className="text-[10px] text-foreground/60 ml-auto shrink-0">ISSN {s.issn}</span>}
                    </button>
                  ))
                ) : (
                  <div className="px-5 py-4 text-xs text-foreground/60 flex items-center gap-2">
                    <Search size={12} />
                    Press Enter to search "{query.trim()}"
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* History dropdown */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 right-0 mt-2 z-20 rounded-2xl border bg-card border-primary/10 shadow-xl shadow-black/40 overflow-hidden"
              >
                {searchHistory.length === 0 ? (
                  <div className="px-5 py-6 text-center">
                    <Clock size={24} className="mx-auto text-muted-foreground mb-2" />
                    <p className="text-xs text-foreground/60">No recent searches</p>
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-foreground/60 flex items-center gap-1.5">
                        <History size={11} />
                        Recent Searches
                      </span>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          clearHistory();
                          setShowHistory(false);
                        }}
                        className="text-[10px] font-medium text-foreground/60 hover:text-red-400 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={10} /> Clear all
                      </button>
                    </div>
                    {searchHistory.map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSearch(kw);
                          setShowHistory(false);
                        }}
                        className="w-full flex items-center gap-3 px-5 py-2.5 text-xs text-left hover:bg-muted/40 transition-colors text-foreground group"
                      >
                        <Clock size={12} className="text-foreground/60 shrink-0" />
                        <span className="flex-1 truncate">{kw}</span>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeHistoryItem(kw);
                          }}
                          className="p-0.5 rounded hover:bg-muted/10 text-foreground/60 hover:text-red-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={11} />
                        </button>
                      </button>
                    ))}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Search Quota (academic users) ─── */}
        {isAcademic && searchesLeft != null && searchLimit != null && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-primary/10 bg-card p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Gauge size={14} className={quotaExhausted ? 'text-red-400' : searchesLeft <= 3 ? 'text-amber-400' : 'text-primary/50'} />
                <span className="text-xs font-semibold text-foreground">Search Quota</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold font-mono ${quotaExhausted ? 'text-red-400' : searchesLeft <= 3 ? 'text-amber-400' : 'text-primary'}`}>
                  {searchesLeft} / {searchLimit}
                </span>
                {resetDate && (
                  <span className="text-[10px] text-foreground/60">
                    · Resets {new Date(resetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-primary/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(100, ((searchLimit - searchesLeft) / searchLimit) * 100))}%` }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                className={`h-full rounded-full ${quotaExhausted ? 'bg-red-500/60' : searchesLeft <= 3 ? 'bg-amber-500/50' : 'bg-primary/30'}`}
              />
            </div>
            {quotaExhausted && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-[11px] text-red-400/80">
                  <Lock size={12} />
                  <span>Monthly limit reached. Upgrade to Researcher for unlimited searches.</span>
                </div>
                <button
                  onClick={() => navigate(`/${currentRole}/settings`)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-foreground transition-colors shrink-0 ml-3"
                >
                  Upgrade
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── Suggestion list — shown after pressing Enter ─── */}
        {showSuggestionList && !isLoading && !journalStats && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <Search size={13} className="text-primary/50" />
              <span className="text-xs text-muted-foreground">
                {apiSuggestions.length > 0
                  ? `Found ${apiSuggestions.length} journal${apiSuggestions.length > 1 ? 's' : ''} matching "${query.trim()}"`
                  : `Searching for "${query.trim()}"...`}
              </span>
              <button
                type="button"
                onClick={() => { setShowSuggestionList(false); setQuery(''); }}
                className="ml-auto text-[10px] text-foreground/60 hover:text-foreground/80"
              >
                ✕ Clear
              </button>
            </div>
            {apiSuggestions.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {apiSuggestions.map((s) => (
                  <motion.button
                    key={s.id || s.name}
                    type="button"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => { setShowSuggestionList(false); handleSearch(s.name); }}
                    className="w-full text-left rounded-xl border border-primary/8 bg-card hover:bg-primary/5 hover:border-primary/15 p-4 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <BookOpen size={13} className="text-primary/50 shrink-0 group-hover:text-primary transition-colors" />
                          <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {s.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-foreground/60">
                          {s.issn && <span>ISSN: {s.issn}</span>}
                          {s.publisher && <span className="truncate">{s.publisher}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <div>
                          <p className="text-xs font-bold text-foreground font-mono">{(s.totalWorks ?? 0).toLocaleString()}</p>
                          <p className="text-[10px] text-foreground/60">papers</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground font-mono">{(s.totalCitations ?? 0).toLocaleString()}</p>
                          <p className="text-[10px] text-foreground/60">citations</p>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-xs text-foreground/60">
                No journals found for "{query.trim()}". Try a different keyword.
              </div>
            )}
          </motion.div>
        )}

        {/* ─── Browse mode: category tabs + journal cards ─── */}
        {!query.trim() && !isLoading && (
          <div className="space-y-5">
            {/* Loading categories */}
            {loadingCategories && (
              <div className="space-y-4">
                <div className="flex gap-2 overflow-hidden">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-9 w-36 rounded-full bg-primary/5 animate-pulse shrink-0" />
                  ))}
                </div>
                <JournalSkeleton />
              </div>
            )}

            {/* Browse error */}
            {browseError && !loadingCategories && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/10 text-[11px] text-red-400/70">
                <AlertCircle size={13} className="shrink-0" />
                <span>{browseError}</span>
              </div>
            )}

            {/* Categories loaded */}
            {!loadingCategories && categories.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
                {/* ── Section Header ── */}
                <div>
                  <h3 className="text-base font-semibold text-foreground">Browse by Research Field</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Explore top journals across {categories.length} academic disciplines</p>
                </div>

                {/* ── Category Tabs with Rank Badges ── */}
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 flex-wrap"
                >
                  {categories.map((cat, i) => {
                    const active = cat.fieldId === selectedFieldId;
                    const rank = i + 1;
                    const showRank = rank <= 5;
                    const medalColor =
                      rank === 1 ? '#F59E0B' :
                      rank === 2 ? '#9CA3AF' :
                      rank === 3 ? '#D97706' :
                      '#DEDBC8';

                    return (
                      <button
                        key={cat.fieldId}
                        type="button"
                        onClick={() => handleFieldClick(cat.fieldId)}
                        disabled={loadingField}
                        className={`relative shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border whitespace-nowrap ${
                          active
                            ? 'bg-primary/10 text-primary border-primary/25 shadow-[inset_0_1px_0_0_var(--border)]'
                            : 'text-muted-foreground border-primary/8 hover:bg-primary/5 hover:text-foreground hover:border-primary/15'
                        }`}
                      >
                        {/* Rank badge — top 5 only, positioned on top border */}
                        {showRank && (
                          <span
                            className="absolute -top-2.5 -left-2 min-w-[20px] h-5 rounded-full text-[9px] font-bold flex items-center justify-center px-1 shadow-md"
                            style={{ background: medalColor, color: '#000' }}
                          >
                            #{rank}
                          </span>
                        )}
                        {cat.fieldName}
                      </button>
                    );
                  })}
                </motion.div>

                {/* ── Field Description ── */}
                {fieldData?.description && (
                  <motion.p
                    key={selectedFieldId}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-[11px] text-muted-foreground leading-relaxed px-1 border-l-2 border-primary/20 pl-3"
                  >
                    {fieldData.description}
                  </motion.p>
                )}

                {/* ── Journal Cards Grid ── */}
                {loadingField ? (
                  <JournalSkeleton />
                ) : fieldData && fieldData.topJournals && fieldData.topJournals.length > 0 ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedFieldId}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="space-y-3"
                    >
                    {/* Journal cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {fieldData.topJournals.map((journal, i) => (
                        <motion.div
                          key={journal.journalId || i}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          onClick={() => {
                            setQuery(journal.journalName);
                            handleSearch(journal.journalName);
                          }}
                          className="rounded-2xl border border-border bg-card-recessed p-5 space-y-3 hover:border-primary/15 hover:bg-card transition-all duration-200 cursor-pointer group shadow-sm"
                        >
                          {/* Journal name + quartile */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 min-w-0">
                              <h3 className="text-sm font-bold text-foreground font-display truncate group-hover:text-primary transition-colors">
                                {journal.journalName}
                              </h3>
                              {journal.publisher && (
                                <span className="text-[11px] text-foreground/60 flex items-center gap-1">
                                  <Globe size={10} />
                                  {journal.publisher}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Follow — stopPropagation so clicking doesn't trigger the card */}
                              <span onClick={(e) => e.stopPropagation()}>
                                <FollowButton
                                  journalId={journal.journalId}
                                  journalName={journal.journalName}
                                />
                              </span>
                              {journal.impactFactor != null && (
                                <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  IF {journal.impactFactor}
                                </span>
                              )}
                              {journal.quartile && (
                                <span
                                  className="px-2 py-1 rounded-md text-[10px] font-bold"
                                  style={{
                                    background: `${Q_COLORS[journal.quartile] || 'var(--muted-foreground)'}18`,
                                    color: Q_COLORS[journal.quartile] || 'var(--muted-foreground)',
                                    border: `1px solid ${Q_COLORS[journal.quartile] || 'var(--muted-foreground)'}30`,
                                  }}
                                >
                                  {journal.quartile}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* ISSN */}
                          {journal.issn && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Hash size={10} />
                              ISSN {journal.issn}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                  </AnimatePresence>
                ) : !loadingField ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10 mb-3">
                      <Newspaper size={24} className="text-primary/20" />
                    </div>
                    <p className="text-xs text-foreground/60">
                      No journals found in this category yet.
                    </p>
                  </motion.div>
                ) : null}
              </div>
            )}

            {/* Categories empty (no error, no data, not loading) */}
            {!loadingCategories && !browseError && categories.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 mb-4">
                  <Newspaper size={32} className="text-primary/30" />
                </div>
                <p className="text-sm text-foreground/60 max-w-sm">
                  Enter a journal name to explore its statistics, top papers, authors, and publication timeline.
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* ─── Loading ─── */}
        {isLoading && <JournalSkeleton />}

        {/* ─── Error ─── */}
        {error && !isLoading && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[11px] text-amber-400/70">
            <AlertCircle size={13} className="shrink-0" />
            <span>Unable to load journal data. Please check the journal name and try again.</span>
          </div>
        )}

        {/* ─── Results ─── */}
        {!isLoading && journalStats && (
          <div className="space-y-5">
            {/* Journal Header */}
            <JournalHeader journal={journalStats} />

            {/* Top Keywords */}
            {journalStats.topKeywords?.length > 0 && (
              <TopKeywords keywords={journalStats.topKeywords} />
            )}

            {/* Stat Cards */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3"
            >
              <StatCard
                label="Total Papers"
                value={(journalStats.totalPapers ?? 0).toLocaleString()}
                change=""
                Icon={FileText}
                accent="var(--chart-1)"
                onClick={() => {
                  setSidebarKeyword(searchedKeyword);
                  setSidebarTotal(journalStats.totalPapers ?? null);
                  setSidebarOpen(true);
                }}
              />
              <StatCard
                label="Total Citations"
                value={(journalStats.totalCitations ?? 0).toLocaleString()}
                change=""
                Icon={Star}
                accent="var(--chart-3)"
              />
              <StatCard
                label="Avg Citations/Paper"
                value={journalStats.avgCitationsPerPaper != null ? journalStats.avgCitationsPerPaper.toFixed(2) : '—'}
                change=""
                Icon={TrendingUp}
                accent="var(--chart-4)"
              />
              <StatCard
                label="Quartile"
                value={journalStats.quartile || 'N/A'}
                change={!journalStats.quartile ? 'Not ranked yet' : journalStats.quartile === 'Q1' ? 'Top 25%' : journalStats.quartile === 'Q2' ? '25–50%' : journalStats.quartile === 'Q3' ? '50–75%' : 'Bottom 25%'}
                Icon={Gauge}
                accent={Q_COLORS[journalStats.quartile] || 'var(--muted-foreground)'}
              />
            </motion.div>

            {/* Timeline Chart */}
            {timeline && timeline.length > 0 && <TimelineChart timeline={timeline} />}

            {/* Top Papers — delegates bookmark & paper fetching to TopPapers component */}
            <TopPapers
              keyword={searchedKeyword}
              sortBy="mostCited"
              fetchPapers={(kw) => paperAPI.getJournalTopPapers(kw)}
            />

            {/* Top Authors */}
            {topAuthors.length > 0 && <TopAuthors authors={topAuthors} isAcademic={isAcademic} />}
          </div>
        )}
      </div>

      {/* Upgrade to Researcher Modal */}
      <AnimatePresence>
        {upgradeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
            onClick={() => setUpgradeOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 24 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-2xl border border-primary/10 bg-card p-7 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]"
            >
              <button
                onClick={() => setUpgradeOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-primary/5 text-foreground/60 hover:bg-primary/10 hover:text-foreground transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              >
                <X size={14} />
              </button>
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                  className="mx-auto w-14 h-14 rounded-2xl bg-primary/[0.06] border border-primary/10 flex items-center justify-center"
                >
                  <Lock size={22} className="text-primary" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                  className="space-y-2"
                >
                  <h3 className="text-xl font-black text-foreground font-display tracking-[-0.02em]">Upgrade to Researcher</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[260px] mx-auto">
                    Unlock full paper details, AI summaries, citation exports, and unlimited searches.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                  className="rounded-xl bg-card border border-border p-4 space-y-0"
                >
                  {['Full abstract & paper details', 'AI-powered paper summaries', 'Similar paper recommendations', 'Citation export (BibTeX, RIS, APA)', 'Unlimited searches & bookmarks'].map((f, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.06, duration: 0.4, ease: [0.32, 0.72, 0, 1] }} className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0 border-b border-border last:border-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                      <span className="text-xs text-foreground/80">{f}</span>
                    </motion.div>
                  ))}
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.4, ease: [0.32, 0.72, 0, 1] }} className="text-center">
                  <span className="text-3xl font-black text-foreground font-display tracking-[-0.03em]">$999</span>
                  <span className="text-sm text-foreground/60 ml-1">/year</span>
                </motion.div>
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                  onClick={() => { setUpgradeOpen(false); navigate(`/${currentRole}/settings`); }}
                  className="group w-full flex items-center justify-between gap-3 px-5 py-3.5 rounded-full text-sm font-bold text-primary-foreground bg-primary hover:bg-foreground shadow-sm active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                >
                  <span className="flex-1 text-center pl-6">Upgrade Now — $999/year</span>
                  <span className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-[1px] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground"><path d="M7 17l9.2-9.2M17 17V7H7" /></svg>
                  </span>
                </motion.button>
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.4, ease: [0.32, 0.72, 0, 1] }} onClick={() => setUpgradeOpen(false)} className="w-full text-xs text-foreground/60 hover:text-muted-foreground transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">Maybe later</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Paper List Sidebar (click Total Papers) ─── */}
      <PaperListSidebar
        journalName={sidebarKeyword}
        totalOverride={sidebarTotal}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  );
}
