import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, Trash2, UserSearch, Lock, Gauge, History } from 'lucide-react';
import { toast } from 'sonner';
import AuthorQuickStats from './AuthorQuickStats';
import { useAuthStore } from '../user/store.js';
import { paperAPI } from './paper.api.js';
import { authorAPI } from './author.api.js';
import AuthorTimeline from './AuthorTimeline';
import AuthorResearchFocus from './AuthorResearchFocus';
import AuthorCoAuthors from './AuthorCoAuthors';
import AuthorSuggestions from './AuthorSuggestions';

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function SearchAuthor({ embedded = false, initialQuery = '' }) {
  const { t } = useTranslation('search');
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [searchedAuthor, setSearchedAuthor] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [apiSuggestions, setApiSuggestions] = useState([]);
  const [suggestHasMore, setSuggestHasMore] = useState(false);
  const [suggestTotal, setSuggestTotal] = useState(0);
  const [suggestPage, setSuggestPage] = useState(1);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [showSuggestionList, setShowSuggestionList] = useState(false);
  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);
  const resultsRef = useRef(null);

  const currentRole = sessionStorage.getItem('userRole');
  const isAcademic = currentRole === 'academic_user' || currentRole === 'academic';
  const user = useAuthStore((s) => s.user);
  const userId = user?.id || user?.email || currentRole;
  const historyKey = useMemo(() => `scitrack_author_search_history_${userId}`, [userId]);

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

  // Reset search state when leaving this page (KeepAlive keeps it mounted)
  const isAuthorRoute = location.pathname.endsWith('/search-author');
  useEffect(() => {
    if (!isAuthorRoute) {
      setQuery('');
      setSearchedAuthor('');
      setApiSuggestions([]);
      setShowSuggestions(false);
      setShowHistory(false);
      setShowSuggestionList(false);
    }
  }, [isAuthorRoute]);

  // ─── Load search history ───
  useEffect(() => {
    try {
      const data = localStorage.getItem(historyKey);
      if (data) setSearchHistory(JSON.parse(data));
    } catch {
      setSearchHistory([]);
    }
  }, [historyKey]);

  // ─── Debounced author autocomplete (API suggest) ───
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setApiSuggestions([]);
      setSuggestHasMore(false);
      setSuggestTotal(0);
      setSuggestPage(1);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setSuggestLoading(true);
        const res = await authorAPI.getSuggest(q, { page: 1, size: 20 });
        // Handle paginated response: { data: [...], total, page, hasMore }
        if (res && Array.isArray(res.data)) {
          setApiSuggestions(res.data);
          setSuggestTotal(res.total || res.data.length);
          setSuggestHasMore(res.hasMore || false);
          setSuggestPage(res.page || 1);
        } else if (Array.isArray(res)) {
          setApiSuggestions(res);
          setSuggestTotal(res.length);
          setSuggestHasMore(false);
        } else {
          setApiSuggestions([]);
          setSuggestHasMore(false);
        }
      } catch {
        setApiSuggestions([]);
        setSuggestHasMore(false);
      } finally {
        setSuggestLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // ── Embedded mode: show author suggestion list for the query ──
  useEffect(() => {
    if (embedded && initialQuery) {
      setQuery(initialQuery);
      setShowSuggestionList(true);
      setShowSuggestions(false);
    }
  }, [initialQuery, embedded]);

  // ─── Load more authors ───
  const loadMoreAuthors = async () => {
    const nextPage = suggestPage + 1;
    try {
      setSuggestLoading(true);
      const res = await authorAPI.getSuggest(query.trim(), { page: nextPage, size: 20 });
      if (res && Array.isArray(res.data)) {
        setApiSuggestions((prev) => [...prev, ...res.data]);
        setSuggestTotal(res.total || 0);
        setSuggestHasMore(res.hasMore || false);
        setSuggestPage(res.page || nextPage);
      }
    } catch {
      // silently fail
    } finally {
      setSuggestLoading(false);
    }
  };

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

    // Update UI + trigger results IMMEDIATELY
    setQuery(kw);
    setSearchedAuthor(kw);
    setShowSuggestionList(false);
    setShowSuggestions(false);
    setApiSuggestions([]);
    saveToSearchHistory(kw);
    setShowSuggestions(false);

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

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  /* ═══════════════════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════════════════ */

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* ─── Search Bar ─── */}
        <div className={embedded ? 'hidden' : 'relative'}>
          <div className="relative">
            <UserSearch size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#DEDBC8]/40 z-10" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={quotaExhausted ? 'Search limit reached — upgrade to continue' : t('author.placeholder')}
              value={query}
              disabled={quotaExhausted}
              onChange={(e) => { setQuery(e.target.value); setShowSuggestionList(false); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const q = query.trim();
                  if (!q) return;
                  setShowSuggestionList(true);
                  setShowSuggestions(false);
                }
              }}
              onFocus={() => { if (!quotaExhausted && query.trim().length >= 2) setShowSuggestions(true); }}
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
                onClick={() => { setQuery(''); }}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[#DEDBC8]/10 text-[#DEDBC8]/60 hover:bg-[#DEDBC8]/20 hover:text-[#DEDBC8] transition-all"
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
                  ? 'bg-[#DEDBC8]/20 text-[#DEDBC8]'
                  : 'bg-transparent text-[#DEDBC8]/40 hover:bg-[#DEDBC8]/10 hover:text-[#DEDBC8]'
              }`}
              title="Search history"
            >
              <History size={14} />
            </button>
          </div>

          {/* Keyword autocomplete dropdown — simple names while typing */}
          <AnimatePresence>
            {showSuggestions && query.trim().length >= 2 && !showSuggestionList && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 right-0 mt-2 z-20 rounded-2xl border bg-[#101010] border-[#DEDBC8]/10 shadow-xl overflow-hidden"
              >
                {apiSuggestions.length > 0 ? (
                  apiSuggestions.map((s) => (
                    <button key={s.authorId || s.fullName} type="button"
                      onMouseDown={(e) => { e.preventDefault(); setShowSuggestions(false); setQuery(s.fullName); setShowSuggestionList(true); }}
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-xs text-left hover:bg-white/5 transition-colors"
                    >
                      <UserSearch size={12} className="text-[#DEDBC8]/50 shrink-0" />
                      <span className="text-[#E1E0CC] truncate">{s.fullName}</span>
                      {s.hIndex != null && <span className="text-[10px] text-gray-500 ml-auto shrink-0">h-index {s.hIndex}</span>}
                    </button>
                  ))
                ) : (
                  <div className="px-5 py-4 text-xs text-gray-500 flex items-center gap-2">
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
                className="absolute top-full left-0 right-0 mt-2 z-20 rounded-2xl border bg-[#101010] border-[#DEDBC8]/10 shadow-xl overflow-hidden"
              >
                {searchHistory.length === 0 ? (
                  <div className="px-5 py-6 text-center">
                    <Clock size={24} className="mx-auto text-gray-600 mb-2" />
                    <p className="text-xs text-gray-500">No recent searches</p>
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-2.5 border-b border-[#DEDBC8]/5 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 flex items-center gap-1.5">
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
                        className="text-[10px] font-medium text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1"
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
                        className="w-full flex items-center gap-3 px-5 py-2.5 text-xs text-left hover:bg-white/5 transition-colors text-slate-300 group"
                      >
                        <Clock size={12} className="text-gray-500 shrink-0" />
                        <span className="flex-1 truncate">{kw}</span>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeSearchHistoryItem(kw);
                          }}
                          className="p-0.5 rounded hover:bg-white/10 text-gray-500 hover:text-red-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
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

        {/* ─── Suggestion list — shown after pressing Enter ─── */}
        {showSuggestionList && query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <Search size={13} className="text-[#DEDBC8]/50" />
              <span className="text-xs text-gray-400">
                {apiSuggestions.length > 0
                  ? `Showing ${apiSuggestions.length} of ${suggestTotal} author${suggestTotal !== 1 ? 's' : ''} matching "${query.trim()}"`
                  : `Searching for "${query.trim()}"...`}
              </span>
              <button
                type="button"
                onClick={() => { setShowSuggestionList(false); setQuery(''); }}
                className="ml-auto text-[10px] text-gray-500 hover:text-gray-300"
              >
                ✕ Clear
              </button>
            </div>
            {apiSuggestions.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {apiSuggestions.map((s) => (
                  <motion.button
                    key={s.authorId || s.fullName}
                    type="button"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleSearch(s.fullName)}
                    className="w-full text-left rounded-xl border border-[#DEDBC8]/8 bg-[#101010] hover:bg-[#DEDBC8]/5 hover:border-[#DEDBC8]/15 p-4 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <UserSearch size={13} className="text-[#DEDBC8]/50 shrink-0 group-hover:text-[#DEDBC8] transition-colors" />
                          <span className="text-sm font-semibold text-[#E1E0CC] truncate group-hover:text-[#DEDBC8] transition-colors">
                            {s.fullName}
                          </span>
                        </div>
                        {s.affiliation && (
                          <p className="text-[10px] text-gray-500 mt-1 truncate">{s.affiliation}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <div>
                          <p className="text-xs font-bold text-[#E1E0CC] font-mono">{s.hIndex ?? '—'}</p>
                          <p className="text-[10px] text-gray-500">h-index</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#A09878] font-mono">{(s.totalCitations ?? 0).toLocaleString()}</p>
                          <p className="text-[10px] text-gray-500">citations</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#E1E0CC] font-mono">{(s.paperCount ?? 0).toLocaleString()}</p>
                          <p className="text-[10px] text-gray-500">papers</p>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-xs text-gray-500">
                No authors found for "{query.trim()}". Try a different name.
              </div>
            )}
            {/* Load more button */}
            {suggestHasMore && (
              <div className="flex justify-center pt-1 pb-2">
                <button
                  type="button"
                  onClick={loadMoreAuthors}
                  disabled={suggestLoading}
                  className="px-5 py-2 rounded-xl text-xs font-medium text-[#DEDBC8] bg-[#DEDBC8]/5 hover:bg-[#DEDBC8]/10 border border-[#DEDBC8]/10 transition-all disabled:opacity-50"
                >
                  {suggestLoading ? 'Loading...' : `Load more (${suggestTotal - apiSuggestions.length} remaining)`}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── Pre-search: Suggested authors ─── */}
        {!embedded && !searchedAuthor && !showSuggestionList && (
          <AuthorSuggestions onAuthorClick={handleSearch} />
        )}

        {/* ─── Results (only after selecting an author) ─── */}
        {searchedAuthor && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            <AuthorQuickStats keyword={searchedAuthor} />
            {isAcademic ? (
              <div className="space-y-8">
                {/* Timeline — blurred real content */}
                <div className="relative">
                  <div className="blur-[6px] pointer-events-none select-none">
                    <AuthorTimeline keyword={searchedAuthor} />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-3 px-4">
                      <Lock size={20} className="text-[#DEDBC8]/40 mx-auto" />
                      <p className="text-xs text-gray-400 max-w-[260px]">
                        Publication timeline & citation trends — available for{' '}
                        <strong className="text-[#E1E0CC]">Researcher</strong> accounts.
                      </p>
                      <button
                        onClick={() => navigate(`/${currentRole}/settings`)}
                        className="px-4 py-2 rounded-lg text-[11px] font-semibold bg-[#DEDBC8] text-[#0B1020] hover:bg-[#E1E0CC] transition-colors"
                      >
                        Upgrade now
                      </button>
                    </div>
                  </div>
                </div>

                {/* Research Focus — blurred real content */}
                <div className="relative">
                  <div className="blur-[6px] pointer-events-none select-none">
                    <AuthorResearchFocus keyword={searchedAuthor} />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-3 px-4">
                      <Lock size={20} className="text-[#DEDBC8]/40 mx-auto" />
                      <p className="text-xs text-gray-400 max-w-[260px]">
                        Topic distribution & research domains — available for{' '}
                        <strong className="text-[#E1E0CC]">Researcher</strong> accounts.
                      </p>
                      <button
                        onClick={() => navigate(`/${currentRole}/settings`)}
                        className="px-4 py-2 rounded-lg text-[11px] font-semibold bg-[#DEDBC8] text-[#0B1020] hover:bg-[#E1E0CC] transition-colors"
                      >
                        Upgrade now
                      </button>
                    </div>
                  </div>
                </div>

                {/* Co-authors — blurred real content */}
                <div className="relative">
                  <div className="blur-[6px] pointer-events-none select-none">
                    <AuthorCoAuthors keyword={searchedAuthor} onAuthorClick={handleSearch} />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-3 px-4">
                      <Lock size={20} className="text-[#DEDBC8]/40 mx-auto" />
                      <p className="text-xs text-gray-400 max-w-[260px]">
                        Collaboration network & top co-authors — available for{' '}
                        <strong className="text-[#E1E0CC]">Researcher</strong> accounts.
                      </p>
                      <button
                        onClick={() => navigate(`/${currentRole}/settings`)}
                        className="px-4 py-2 rounded-lg text-[11px] font-semibold bg-[#DEDBC8] text-[#0B1020] hover:bg-[#E1E0CC] transition-colors"
                      >
                        Upgrade now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <AuthorTimeline keyword={searchedAuthor} />
                <AuthorResearchFocus keyword={searchedAuthor} />
                <AuthorCoAuthors keyword={searchedAuthor} onAuthorClick={handleSearch} />
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
