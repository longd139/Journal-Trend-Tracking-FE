import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, Trash2, SlidersHorizontal, ArrowUpDown, Lock, Gauge } from 'lucide-react';
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

export default function SearchPapers() {
  const { t } = useTranslation('search');
  const navigate = useNavigate();
  const savedQuery = sessionStorage.getItem('scitrack_papers_query') || '';
  const [query, setQuery] = useState(savedQuery);
  const [searchedKeyword, setSearchedKeyword] = useState(savedQuery);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ fields: [], startYear: '', endYear: '', minCitations: '', openAccess: false });
  const [sortBy, setSortBy] = useState('relevance');
  const searchInputRef = useRef(null);
  const [apiSuggestions, setApiSuggestions] = useState([]);
  const debounceRef = useRef(null);

  const currentRole = sessionStorage.getItem('userRole');
  const isAcademic = currentRole === 'academic_user' || currentRole === 'academic';
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
        if (data?.remainingSearches != null) setSearchesLeft(data.remainingSearches);
        if (data?.monthlyLimit != null) setSearchLimit(data.monthlyLimit);
        if (data?.resetDate != null) setResetDate(data.resetDate);
      } catch { /* silently ignore */ }
    })();
  }, [isAcademic]);

  // Use user-specific key for search history (per account, not per role)
  const userId = user?.id || user?.email || currentRole;
  const historyKey = useMemo(() => `scitrack_search_history_${userId}`, [userId]);

  // Map UI sort value → API sortBy + sortDirection
  const SORT_MAP = {
    relevance:  { sortBy: 'relevance',  sortDirection: 'desc' },
    newest:     { sortBy: 'date',       sortDirection: 'desc' },
    oldest:     { sortBy: 'date',       sortDirection: 'asc'  },
    mostCited:  { sortBy: 'citations',  sortDirection: 'desc' },
    leastCited: { sortBy: 'citations',  sortDirection: 'asc'  },
    titleAZ:    { sortBy: 'title',      sortDirection: 'asc'  },
    titleZA:    { sortBy: 'title',      sortDirection: 'desc' },
  };

  const [searchParams] = useSearchParams();

  // Restore persisted search
  useEffect(() => {
    const saved = sessionStorage.getItem('scitrack_papers_query');
    if (saved && saved.trim() && !query) {
      setQuery(saved);
      setSearchedKeyword(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle incoming keyword from URL (e.g. from Trending Topics card click)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q.trim() && q.trim() !== query.trim()) {
      handleSearch(q.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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

  // ─── Helpers ───
  const saveToSearchHistory = (keyword) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...searchHistory.filter((k) => k !== trimmed)].slice(0, 10);
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
        action: { label: 'Upgrade', onClick: () => navigate(`/${currentRole}/settings`) },
        duration: 6000,
      });
      return;
    }

    // Update input + history + trigger results IMMEDIATELY
    setQuery(kw);
    setSearchedKeyword(kw);
    saveToSearchHistory(kw);
    sessionStorage.setItem('scitrack_papers_query', kw);
    setShowSuggestions(false);
    setApiSuggestions([]);

    // ── Quota check in background (fire-and-forget, non-blocking) ──
    if (isAcademic) {
      paperAPI.checkQuota(kw)
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
  };

  // Merge API suggestions + filtered history (API first, no duplicates)
  const filteredHistory = query.trim()
    ? searchHistory.filter((k) => k.toLowerCase().includes(query.toLowerCase()))
    : searchHistory;
  const historyExtras = filteredHistory.filter(
    (k) => !apiSuggestions.some((s) => s.toLowerCase() === k.toLowerCase())
  );
  const allSuggestions = [...apiSuggestions, ...historyExtras];

  /* ═══════════════════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════════════════ */

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* ─── Search Bar ─── */}
        <div className="relative">
          <div className="relative">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#DEDBC8]/40 z-10" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={quotaExhausted ? 'Search limit reached — upgrade to continue' : t('placeholder')}
              value={query}
              disabled={quotaExhausted}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && query.trim()) handleSearch(query); }}
              onFocus={() => { if (!quotaExhausted && (searchHistory.length > 0 || apiSuggestions.length > 0)) setShowSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className={`w-full pl-12 pr-14 py-4 rounded-2xl text-sm bg-[#101010] border text-[#E1E0CC] placeholder:text-gray-500 focus:outline-none focus:border-[#DEDBC8]/30 focus:ring-1 focus:ring-[#DEDBC8]/10 transition-all ${
                quotaExhausted
                  ? 'border-red-500/20 opacity-50 cursor-not-allowed'
                  : 'border-[#DEDBC8]/10'
              }`}
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setSearchedKeyword(''); setApiSuggestions([]); sessionStorage.removeItem('scitrack_papers_query'); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[#DEDBC8]/10 text-[#DEDBC8]/60 hover:bg-[#DEDBC8]/20 hover:text-[#DEDBC8] transition-all"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search suggestions (API autocomplete + history) */}
          <AnimatePresence>
            {showSuggestions && allSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 right-0 mt-2 z-20 rounded-2xl border bg-[#101010] border-[#DEDBC8]/10 shadow-xl overflow-hidden"
              >
                {allSuggestions.slice(0, 10).map((kw) => {
                  const isFromApi = apiSuggestions.some((s) => s.toLowerCase() === kw.toLowerCase());
                  return (
                    <button key={kw} type="button"
                      onMouseDown={(e) => { e.preventDefault(); handleSearch(kw); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-xs text-left hover:bg-white/5 transition-colors text-slate-300"
                    >
                      {isFromApi ? (
                        <Search size={12} className="text-[#DEDBC8]/40 shrink-0" />
                      ) : (
                        <Clock size={12} className="text-gray-500 shrink-0" />
                      )}
                      <span className="flex-1 truncate">{kw}</span>
                      {!isFromApi && (
                        <button type="button"
                          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); removeSearchHistoryItem(kw); }}
                          className="p-0.5 rounded hover:bg-white/10 text-gray-500 hover:text-red-400 shrink-0"
                        ><X size={11} /></button>
                      )}
                    </button>
                  );
                })}
                {historyExtras.length > 0 && (
                  <div className="border-t border-[#DEDBC8]/5">
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); clearSearchHistory(); }}
                      className="w-full flex items-center gap-2 px-5 py-2.5 text-[11px] font-medium text-gray-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                    ><Trash2 size={11} /> Clear search history</button>
                  </div>
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
            className="rounded-xl border border-[#DEDBC8]/10 bg-[#101010] p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Gauge size={14} className={quotaExhausted ? 'text-red-400' : searchesLeft <= 3 ? 'text-amber-400' : 'text-[#DEDBC8]/50'} />
                <span className="text-xs font-semibold text-[#E1E0CC]">Search Quota</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold font-mono ${quotaExhausted ? 'text-red-400' : searchesLeft <= 3 ? 'text-amber-400' : 'text-[#DEDBC8]'}`}>
                  {searchesLeft} / {searchLimit}
                </span>
                {resetDate && (
                  <span className="text-[10px] text-gray-500">
                    · Resets {new Date(resetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-[#DEDBC8]/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(100, ((searchLimit - searchesLeft) / searchLimit) * 100))}%` }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                className={`h-full rounded-full ${quotaExhausted ? 'bg-red-500/60' : searchesLeft <= 3 ? 'bg-amber-500/50' : 'bg-[#DEDBC8]/30'}`}
              />
            </div>
            {quotaExhausted && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#DEDBC8]/5">
                <div className="flex items-center gap-2 text-[11px] text-red-400/80">
                  <Lock size={12} />
                  <span>Monthly limit reached. Upgrade to Researcher for unlimited searches.</span>
                </div>
                <button
                  onClick={() => navigate(`/${currentRole}/settings`)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-[#DEDBC8] text-[#0B1020] hover:bg-[#E1E0CC] transition-colors shrink-0 ml-3"
                >
                  Upgrade
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── Pre-search: Weekly Breakout + Trending ─── */}
        {!searchedKeyword && (
          <WeeklyBreakout onKeywordClick={handleSearch} />
        )}

        {/* ─── Post-search: Quick Stats + Graph ─── */}
        {searchedKeyword && (
          <>
            {/* Toolbar: Sort + Filters */}
            <div className="flex items-center gap-2">
              {/* Sort Dropdown — moved first */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[170px] h-[30px] text-[11px] font-semibold rounded-lg border-[#DEDBC8]/10 bg-[#101010] text-gray-500 hover:text-[#E1E0CC] hover:border-[#DEDBC8]/20 focus:ring-0">
                  <ArrowUpDown size={12} className="text-[#DEDBC8]/40" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#101010] border-[#DEDBC8]/10 text-[#E1E0CC] rounded-xl">
                  <SelectItem value="relevance" className="text-[11px] cursor-pointer">{t('sort.relevance')}</SelectItem>
                  <SelectItem value="newest" className="text-[11px] cursor-pointer">{t('sort.newest')}</SelectItem>
                  <SelectItem value="oldest" className="text-[11px] cursor-pointer">{t('sort.oldest')}</SelectItem>
                  <SelectItem value="mostCited" className="text-[11px] cursor-pointer">{t('sort.mostCited')}</SelectItem>
                  <SelectItem value="leastCited" className="text-[11px] cursor-pointer">{t('sort.leastCited')}</SelectItem>
                  <SelectItem value="titleAZ" className="text-[11px] cursor-pointer">{t('sort.titleAZ')}</SelectItem>
                  <SelectItem value="titleZA" className="text-[11px] cursor-pointer">{t('sort.titleZA')}</SelectItem>
                </SelectContent>
              </Select>

              {/* Filters Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  showFilters
                    ? 'bg-[#DEDBC8]/10 text-[#DEDBC8] border-[#DEDBC8]/30'
                    : 'text-gray-500 border-[#DEDBC8]/10 hover:text-[#E1E0CC] hover:border-[#DEDBC8]/20'
                }`}
              >
                <SlidersHorizontal size={13} />
                Filters
                {Object.values(filters).some(v => v && (!Array.isArray(v) || v.length > 0) && v !== false) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DEDBC8]" />
                )}
              </button>
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
                      filters={filters}
                      setFilters={setFilters}
                      clearFilters={() => setFilters({ fields: [], startYear: '', endYear: '', minCitations: '', openAccess: false })}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content */}
            <div className="space-y-8">
              <KeywordQuickStats keyword={searchedKeyword} />
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="space-y-8">
                  <KeywordGraphExplorer keyword={searchedKeyword} onKeywordClick={handleSearch} />
                  <TopPapers keyword={searchedKeyword} sortBy={sortBy} />
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
