import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Clock,
  Trash2,
  SlidersHorizontal,
  ArrowUpDown,
  Lock,
  Gauge,
  History,
} from 'lucide-react';
import { toast } from 'sonner';
import WeeklyBreakout from './WeeklyBreakout';
import KeywordQuickStats from './KeywordQuickStats';
import KeywordGraphExplorer from './KeywordGraphExplorer';
import TopPapers from './TopPapers';
import { AdvancedFilter } from './AdvancedFilter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useAuthStore } from '../user/store.js';
import { paperAPI } from './paper.api.js';
import { trendAPI } from './trend.api.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function SearchPapers({ embedded = false, initialQuery = '' }) {
  const { t } = useTranslation('search');
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchedKeyword, setSearchedKeyword] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(-1); // keyboard nav in history dropdown
  const [draftFilters, setDraftFilters] = useState({
    fields: [],
    pubYearFrom: '',
    pubYearTo: '',
    minCitations: '',
    isOpenAccess: false,
    quartile: [],
  });
  const [appliedFilters, setAppliedFilters] = useState({
    fields: [],
    pubYearFrom: '',
    pubYearTo: '',
    minCitations: '',
    isOpenAccess: false,
    quartile: [],
  });
  const [sortBy, setSortBy] = useState('relevance');

  // ── Active filter chips (shown next to filter button) ──
  const activeFilterChips = useMemo(() => {
    const chips = [];
    const clear = (patch) => setAppliedFilters((p) => ({ ...p, ...patch }));
    const clearDraft = (patch) => setDraftFilters((p) => ({ ...p, ...patch }));

    // Year range
    const from = appliedFilters.pubYearFrom;
    const to = appliedFilters.pubYearTo;
    if (from || to) {
      const label = from && to ? `${from}–${to}` : from ? `From ${from}` : `To ${to}`;
      chips.push({
        key: 'year',
        label,
        onRemove: () => {
          clear({ pubYearFrom: '', pubYearTo: '' });
          clearDraft({ pubYearFrom: '', pubYearTo: '' });
        },
      });
    }

    // Open Access
    if (appliedFilters.isOpenAccess) {
      chips.push({
        key: 'oa',
        label: 'Open Access',
        onRemove: () => {
          clear({ isOpenAccess: false });
          clearDraft({ isOpenAccess: false });
        },
      });
    }

    // Min citations
    if (appliedFilters.minCitations) {
      chips.push({
        key: 'citations',
        label: `≥${appliedFilters.minCitations} citations`,
        onRemove: () => {
          clear({ minCitations: '' });
          clearDraft({ minCitations: '' });
        },
      });
    }

    // Fields
    (appliedFilters.fields || []).forEach((f) => {
      chips.push({
        key: `field-${f}`,
        label: f,
        onRemove: () => {
          clear({ fields: appliedFilters.fields.filter((x) => x !== f) });
          clearDraft({ fields: draftFilters.fields.filter((x) => x !== f) });
        },
      });
    });

    // Quartiles
    (appliedFilters.quartile || []).forEach((q) => {
      chips.push({
        key: `q-${q}`,
        label: q,
        onRemove: () => {
          clear({ quartile: appliedFilters.quartile.filter((x) => x !== q) });
          clearDraft({ quartile: draftFilters.quartile.filter((x) => x !== q) });
        },
      });
    });

    return chips;
  }, [appliedFilters, draftFilters]);
  const searchInputRef = useRef(null);
  const [apiSuggestions, setApiSuggestions] = useState([]);
  const debounceRef = useRef(null);

  const currentRole = sessionStorage.getItem('userRole');
  const isAcademic =
    currentRole === 'academic_user' || currentRole === 'academic';
  const user = useAuthStore((s) => s.user);

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
        if (data?.remainingSearches != null)
          setSearchesLeft(data.remainingSearches);
        if (data?.monthlyLimit != null) setSearchLimit(data.monthlyLimit);
        if (data?.resetDate != null) setResetDate(data.resetDate);
      } catch {
        /* silently ignore */
      }
    })();
  }, [isAcademic]);

  // Use role-based key for search history — always available, never changes.
  const historyKey = `scitrack_search_history_${currentRole}`;

  // Map UI sort value → API sortBy + sortDirection
  const SORT_MAP = {
    relevance: { sortBy: 'relevance', sortDirection: 'desc' },
    newest: { sortBy: 'date', sortDirection: 'desc' },
    oldest: { sortBy: 'date', sortDirection: 'asc' },
    mostCited: { sortBy: 'citations', sortDirection: 'desc' },
    leastCited: { sortBy: 'citations', sortDirection: 'asc' },
    titleAZ: { sortBy: 'title', sortDirection: 'asc' },
    titleZA: { sortBy: 'title', sortDirection: 'desc' },
  };

  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Handle incoming keyword from URL (e.g. from Trending Topics card click)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q.trim() && q.trim() !== query.trim()) {
      handleSearch(q.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Keep search results when navigating away — KeepAlive preserves state.
  // Only clear the input text and dropdown UI when leaving the page.
  const isSearchRoute = location.pathname.endsWith('/search');
  useEffect(() => {
    if (!isSearchRoute) {
      setQuery('');
      setApiSuggestions([]);
      setShowSuggestions(false);
      setShowHistory(false);
    }
  }, [isSearchRoute]);

  // ─── Load search history ───
  useEffect(() => {
    try {
      const data = localStorage.getItem(historyKey);
      if (data) setSearchHistory(JSON.parse(data));
    } catch {
      setSearchHistory([]);
    }
  }, [historyKey]);

  // ─── Debounced keyword autocomplete ───
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setApiSuggestions([]);
      return;
    }
    // Debounce 300ms before calling API
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const suggestions = await trendAPI.suggestKeywords(q, 8);
        setApiSuggestions(Array.isArray(suggestions) ? suggestions : []);
      } catch {
        setApiSuggestions([]);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // ── Embedded mode: auto-search when parent provides query ──
  useEffect(() => {
    if (embedded && initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery, embedded]);

  // ─── Helpers ───
  const saveToSearchHistory = (keyword) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    const updated = [
      trimmed,
      ...searchHistory.filter((k) => k !== trimmed),
    ].slice(0, 10);
    setSearchHistory(updated);
    localStorage.setItem(historyKey, JSON.stringify(updated));
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(historyKey);
    setShowSuggestions(false);
  };

  const removeSearchHistoryItem = (keyword) => {
    const updated = searchHistory.filter((k) => k !== keyword);
    setSearchHistory(updated);
    localStorage.setItem(historyKey, JSON.stringify(updated));
  };

  const handleSearch = (kw) => {
    if (quotaExhausted) {
      toast.error('Search limit reached', {
        description: `You have used all ${searchLimit} searches this month. Upgrade to Researcher for unlimited access.`,
        action: {
          label: 'Upgrade',
          onClick: () => navigate(`/${currentRole}/settings`),
        },
        duration: 6000,
      });
      return;
    }

    // Update input + history + trigger results IMMEDIATELY
    setQuery(kw);
    setSearchedKeyword(kw);
    saveToSearchHistory(kw);
    setShowSuggestions(false);
    setApiSuggestions([]);

    // ── Quota check in background (fire-and-forget, non-blocking) ──
    if (isAcademic) {
      paperAPI
        .checkQuota(kw)
        .then((quotaResult) => {
          if (quotaResult?.quotaConsumed) return paperAPI.getUsage();
        })
        .then((usage) => {
          if (usage?.remainingSearches != null)
            setSearchesLeft(usage.remainingSearches);
          if (usage?.resetDate != null) setResetDate(usage.resetDate);
        })
        .catch((err) => {
          if (err?.response?.status === 403 || err?.apiStatus === 403) {
            setSearchesLeft(0);
            toast.error('Search limit reached', {
              description: `You have used all ${searchLimit} searches this month. Upgrade to Researcher for unlimited access.`,
              action: {
                label: 'Upgrade',
                onClick: () => navigate(`/${currentRole}/settings`),
              },
              duration: 6000,
            });
          } else {
            console.error('Quota check failed:', err);
          }
        });
    }
  };

  // Merge API suggestions + filtered history (API first, no duplicates)
  const filteredHistory = query.trim()
    ? searchHistory.filter((k) => k.toLowerCase().includes(query.toLowerCase()))
    : searchHistory;
  const historyExtras = filteredHistory.filter(
    (k) => !apiSuggestions.some((s) => s.toLowerCase() === k.toLowerCase()),
  );
  const allSuggestions = [...apiSuggestions, ...historyExtras];

  /* ═══════════════════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════════════════ */

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* ─── Search Bar ─── */}
        <div className={embedded ? 'hidden' : 'relative'}>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 z-10"
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={
                quotaExhausted
                  ? 'Search limit reached — upgrade to continue'
                  : t('placeholder')
              }
              value={query}
              disabled={quotaExhausted}
              onChange={(e) => { setQuery(e.target.value); setHistoryIndex(-1); }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  // Close suggestions if open, open history dropdown
                  setShowSuggestions(false);
                  if (!showHistory) {
                    setShowHistory(true);
                    setHistoryIndex(0);
                  } else {
                    setHistoryIndex((prev) => Math.min(prev + 1, searchHistory.length - 1));
                  }
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  if (showHistory) {
                    setHistoryIndex((prev) => Math.max(prev - 1, -1));
                  }
                } else if (e.key === 'Enter') {
                  if (showHistory && historyIndex >= 0 && historyIndex < searchHistory.length) {
                    e.preventDefault();
                    handleSearch(searchHistory[historyIndex]);
                    setShowHistory(false);
                    setHistoryIndex(-1);
                  } else if (query.trim()) {
                    handleSearch(query);
                    setShowHistory(false);
                    setHistoryIndex(-1);
                  }
                } else if (e.key === 'Escape') {
                  setShowHistory(false);
                  setShowSuggestions(false);
                  setHistoryIndex(-1);
                }
              }}
              onFocus={() => {
                if (
                  !quotaExhausted &&
                  (searchHistory.length > 0 || apiSuggestions.length > 0)
                )
                  setShowSuggestions(true);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className={`w-full pl-12 pr-14 py-4 rounded-2xl text-sm bg-card border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/10 transition-all ${
                quotaExhausted
                  ? 'border-red-500/20 opacity-50 cursor-not-allowed'
                  : 'border-input'
              }`}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSearchedKeyword('');
                  setApiSuggestions([]);
                }}
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

          {/* Search suggestions (API autocomplete + history) */}
          <AnimatePresence>
            {showSuggestions && allSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 right-0 mt-2 z-20 rounded-2xl border bg-card border-border shadow-xl overflow-hidden"
              >
                {allSuggestions.slice(0, 10).map((kw) => {
                  const isFromApi = apiSuggestions.some(
                    (s) => s.toLowerCase() === kw.toLowerCase(),
                  );
                  return (
                    <button
                      key={kw}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSearch(kw);
                      }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-xs text-left hover:bg-muted/40 transition-colors text-muted-foreground"
                    >
                      {isFromApi ? (
                        <Search
                          size={12}
                          className="text-primary/40 shrink-0"
                        />
                      ) : (
                        <Clock size={12} className="text-muted-foreground shrink-0" />
                      )}
                      <span className="flex-1 truncate">{kw}</span>
                      {!isFromApi && (
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeSearchHistoryItem(kw);
                          }}
                          className="p-0.5 rounded hover:bg-muted/40 text-muted-foreground hover:text-red-400 shrink-0"
                        >
                          <X size={11} />
                        </button>
                      )}
                    </button>
                  );
                })}
                {historyExtras.length > 0 && (
                  <div className="border-t border-border">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        clearSearchHistory();
                      }}
                      className="w-full flex items-center gap-2 px-5 py-2.5 text-[11px] font-medium text-muted-foreground hover:text-red-400 hover:bg-muted/40 transition-colors"
                    >
                      <Trash2 size={11} /> Clear search history
                    </button>
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
                className="absolute top-full left-0 right-0 mt-2 z-20 rounded-2xl border bg-card border-border shadow-xl overflow-hidden"
              >
                {searchHistory.length === 0 ? (
                  <div className="px-5 py-6 text-center">
                    <Clock size={24} className="mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-xs text-muted-foreground">No recent searches</p>
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
                        <History size={11} />
                        Recent Searches
                      </span>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          clearSearchHistory();
                          setShowHistory(false);
                        }}
                        className="text-[10px] font-medium text-muted-foreground hover:text-red-400 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={10} /> Clear all
                      </button>
                    </div>
                    {searchHistory.map((kw, idx) => (
                      <button
                        key={kw}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSearch(kw);
                          setShowHistory(false);
                        }}
                        className={`w-full flex items-center gap-3 px-5 py-2.5 text-xs text-left transition-colors text-muted-foreground group ${
                          idx === historyIndex
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted/40'
                        }`}
                      >
                        <Clock size={12} className="text-muted-foreground shrink-0" />
                        <span className="flex-1 truncate">{kw}</span>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeSearchHistoryItem(kw);
                          }}
                          className="p-0.5 rounded hover:bg-muted/40 text-muted-foreground hover:text-red-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Gauge
                  size={14}
                  className={
                    quotaExhausted
                      ? 'text-red-400'
                      : searchesLeft <= 3
                        ? 'text-amber-400'
                        : 'text-primary/50'
                  }
                />
                <span className="text-xs font-semibold text-foreground">
                  Search Quota
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold font-mono ${quotaExhausted ? 'text-red-400' : searchesLeft <= 3 ? 'text-amber-400' : 'text-primary'}`}
                >
                  {searchesLeft} / {searchLimit}
                </span>
                {resetDate && (
                  <span className="text-[10px] text-muted-foreground">
                    · Resets{' '}
                    {new Date(resetDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.max(0, Math.min(100, ((searchLimit - searchesLeft) / searchLimit) * 100))}%`,
                }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                className={`h-full rounded-full ${quotaExhausted ? 'bg-red-500/60' : searchesLeft <= 3 ? 'bg-amber-500/50' : 'bg-primary/30'}`}
              />
            </div>
            {quotaExhausted && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-[11px] text-red-400/80">
                  <Lock size={12} />
                  <span>
                    Monthly limit reached. Upgrade to Researcher for unlimited
                    searches.
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/${currentRole}/settings`)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-primary text-background hover:bg-foreground transition-colors shrink-0 ml-3"
                >
                  Upgrade
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── Pre-search: Weekly Breakout + Trending ─── */}
        {!embedded && !searchedKeyword && <WeeklyBreakout onKeywordClick={handleSearch} />}

        {/* ─── Post-search: Quick Stats + Graph ─── */}
        {searchedKeyword && (
          <>
            {/* Toolbar: Sort + Filters */}
            <div className="flex items-center gap-2">
              {/* Sort Dropdown — moved first */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[170px] h-[30px] text-[11px] font-semibold rounded-lg border-input bg-card text-muted-foreground hover:text-foreground hover:border-primary/20 focus:ring-0">
                  <ArrowUpDown size={12} className="text-primary/40" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground rounded-xl">
                  <SelectItem
                    value="relevance"
                    className="text-[11px] cursor-pointer"
                  >
                    {t('sort.relevance')}
                  </SelectItem>
                  <SelectItem
                    value="newest"
                    className="text-[11px] cursor-pointer"
                  >
                    {t('sort.newest')}
                  </SelectItem>
                  <SelectItem
                    value="oldest"
                    className="text-[11px] cursor-pointer"
                  >
                    {t('sort.oldest')}
                  </SelectItem>
                  <SelectItem
                    value="mostCited"
                    className="text-[11px] cursor-pointer"
                  >
                    {t('sort.mostCited')}
                  </SelectItem>
                  <SelectItem
                    value="leastCited"
                    className="text-[11px] cursor-pointer"
                  >
                    {t('sort.leastCited')}
                  </SelectItem>
                  <SelectItem
                    value="titleAZ"
                    className="text-[11px] cursor-pointer"
                  >
                    {t('sort.titleAZ')}
                  </SelectItem>
                  <SelectItem
                    value="titleZA"
                    className="text-[11px] cursor-pointer"
                  >
                    {t('sort.titleZA')}
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Filters Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  showFilters
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'text-muted-foreground border-input hover:text-foreground hover:border-primary/20'
                }`}
              >
                <SlidersHorizontal size={13} />
                Filters
                {Object.values(draftFilters).some(
                  (v) =>
                    v && (!Array.isArray(v) || v.length > 0) && v !== false,
                ) && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>

              {/* ── Active Filter Chips ── */}
              {activeFilterChips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-primary/8 text-primary border border-primary/15"
                >
                  {chip.label}
                  <button
                    type="button"
                    onClick={chip.onRemove}
                    className="p-0.5 rounded-full hover:bg-primary/15 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>

            {/* Filters Dropdown Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pt-1">
                    <AdvancedFilter
                      filters={draftFilters}
                      setFilters={setDraftFilters}
                      clearFilters={() =>
                        setDraftFilters({
                          fields: [],
                          pubYearFrom: '',
                          pubYearTo: '',
                          minCitations: '',
                          isOpenAccess: false,
                          quartile: [],
                        })
                      }
                      onApply={() => {
                        setAppliedFilters({ ...draftFilters });
                        setShowFilters(false);
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content */}
            <div className="space-y-8">
              <KeywordQuickStats
                keyword={searchedKeyword}
                filters={appliedFilters}
              />
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="space-y-8">
                  <KeywordGraphExplorer
                    keyword={searchedKeyword}
                    onKeywordClick={handleSearch}
                    filters={appliedFilters}
                  />
                  <TopPapers
                    keyword={searchedKeyword}
                    sortBy={sortBy}
                    filters={appliedFilters}
                  />
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
