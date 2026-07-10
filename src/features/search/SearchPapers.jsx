import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, Trash2, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import WeeklyBreakout from './WeeklyBreakout';
import KeywordQuickStats from './KeywordQuickStats';
import TopPapers from './TopPapers';
import RelatedTrends from './RelatedTrends';
import { AdvancedFilter } from './AdvancedFilter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useAuthStore } from '../user/store.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function SearchPapers() {
  const { t } = useTranslation('search');
  const [query, setQuery] = useState(() => sessionStorage.getItem('scitrack_papers_query') || '');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ fields: [], startYear: '', endYear: '', minCitations: '', openAccess: false });
  const [sortBy, setSortBy] = useState('relevance');
  const searchInputRef = useRef(null);

  const currentRole = sessionStorage.getItem('userRole');
  const user = useAuthStore((s) => s.user);

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

  const hasActiveFilters = Object.values(filters).some(
    v => v && (!Array.isArray(v) || v.length > 0) && v !== false
  );

  // Restore persisted search
  useEffect(() => {
    const saved = sessionStorage.getItem('scitrack_papers_query');
    if (saved && saved.trim() && !query) {
      setQuery(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Load search history ───
  useEffect(() => {
    try {
      const data = localStorage.getItem(historyKey);
      if (data) setSearchHistory(JSON.parse(data));
    } catch {
      setSearchHistory([]);
    }
  }, [historyKey]);

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
    setQuery(kw);
    saveToSearchHistory(kw);
    sessionStorage.setItem('scitrack_papers_query', kw);
    setShowSuggestions(false);
  };

  const filteredSuggestions = query.trim()
    ? searchHistory.filter((k) => k.toLowerCase().includes(query.toLowerCase()))
    : searchHistory;

  /* ═══════════════════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════════════════ */

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* ─── Search Bar + Sort Row ─── */}
        <div className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] ring-1 ring-white/[0.05]">
              <div className="flex items-center gap-2 rounded-[calc(1rem-1.5px)] overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(16,16,16,0.95), rgba(12,12,20,0.98))' }}>
                <Search size={17} strokeWidth={1.5} className="ml-4 text-[#DEDBC8]/30 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t('placeholder')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && query.trim()) handleSearch(query); }}
                  onFocus={() => { if (searchHistory.length > 0) setShowSuggestions(true); }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  className="flex-1 py-4 text-sm bg-transparent text-[#E1E0CC] placeholder:text-gray-500 focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(''); sessionStorage.removeItem('scitrack_papers_query'); }}
                    className="mr-3 p-1.5 rounded-full hover:bg-white/[0.06] text-gray-500 hover:text-[#E1E0CC] transition-all duration-300 shrink-0"
                  >
                    <X size={14} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>

            {/* Search suggestions */}
            <AnimatePresence>
              {showSuggestions && filteredSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                  transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute top-full left-0 right-0 mt-2 z-20 rounded-2xl border border-white/[0.06] bg-[#131721] shadow-2xl shadow-black/40 backdrop-blur-xl overflow-hidden"
                >
                  {filteredSuggestions.slice(0, 8).map((kw) => (
                    <button key={kw} type="button"
                      onMouseDown={(e) => { e.preventDefault(); handleSearch(kw); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-xs text-left hover:bg-white/[0.04] transition-colors text-[#E1E0CC]"
                    >
                      <Clock size={12} strokeWidth={1.5} className="text-gray-500 shrink-0" />
                      <span className="flex-1 truncate">{kw}</span>
                      <button type="button"
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); removeSearchHistoryItem(kw); }}
                        className="p-1 rounded hover:bg-white/8 text-gray-500 hover:text-red-400 shrink-0 transition-colors"
                      ><X size={11} strokeWidth={1.5} /></button>
                    </button>
                  ))}
                  <div className="border-t border-white/[0.04]">
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); clearSearchHistory(); }}
                      className="w-full flex items-center gap-2 px-5 py-2.5 text-[10px] font-medium text-gray-500 hover:text-red-400 hover:bg-white/[0.03] transition-colors"
                    ><Trash2 size={11} strokeWidth={1.5} /> Clear search history</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls row: Relevance (left) + Filters */}
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[155px] h-8 text-[11px] font-semibold rounded-xl
                !bg-[#0F1219] !border !border-white/[0.06] !text-gray-400
                hover:!text-[#E1E0CC] hover:!border-white/[0.12]
                focus:ring-1 focus:ring-[#DEDBC8]/10 transition-all duration-300
                !justify-start !gap-1.5 !pl-3
                [&>svg:last-child]:hidden">
                <ArrowUpDown size={11} strokeWidth={1.5} className="text-gray-500 shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="!bg-[#131721] !border !border-white/[0.08] !text-[#E1E0CC] rounded-xl shadow-2xl shadow-black/40">
                <SelectItem value="relevance" className="text-[11px] cursor-pointer !focus:bg-white/[0.06] !focus:text-[#E1E0CC] data-[highlighted]:!bg-white/[0.06] data-[highlighted]:!text-[#E1E0CC]">{t('sort.relevance')}</SelectItem>
                <SelectItem value="newest" className="text-[11px] cursor-pointer data-[highlighted]:!bg-white/[0.06] data-[highlighted]:!text-[#E1E0CC]">{t('sort.newest')}</SelectItem>
                <SelectItem value="oldest" className="text-[11px] cursor-pointer data-[highlighted]:!bg-white/[0.06] data-[highlighted]:!text-[#E1E0CC]">{t('sort.oldest')}</SelectItem>
                <SelectItem value="mostCited" className="text-[11px] cursor-pointer data-[highlighted]:!bg-white/[0.06] data-[highlighted]:!text-[#E1E0CC]">{t('sort.mostCited')}</SelectItem>
                <SelectItem value="leastCited" className="text-[11px] cursor-pointer data-[highlighted]:!bg-white/[0.06] data-[highlighted]:!text-[#E1E0CC]">{t('sort.leastCited')}</SelectItem>
                <SelectItem value="titleAZ" className="text-[11px] cursor-pointer data-[highlighted]:!bg-white/[0.06] data-[highlighted]:!text-[#E1E0CC]">{t('sort.titleAZ')}</SelectItem>
                <SelectItem value="titleZA" className="text-[11px] cursor-pointer data-[highlighted]:!bg-white/[0.06] data-[highlighted]:!text-[#E1E0CC]">{t('sort.titleZA')}</SelectItem>
              </SelectContent>
            </Select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all duration-300 ${
                showFilters
                  ? 'bg-[#DEDBC8]/10 text-[#DEDBC8] border-[#DEDBC8]/25 shadow-[0_0_12px_rgba(222,219,200,0.04)]'
                  : 'text-gray-500 border-white/[0.05] hover:text-[#E1E0CC] hover:border-white/[0.10] hover:bg-white/[0.03]'
              }`}
            >
              <SlidersHorizontal size={12} strokeWidth={1.5} />
              Filters
              {hasActiveFilters && !showFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#DEDBC8]" />
              )}
            </button>
          </div>
        </div>

        {/* ─── Pre-search: Weekly Breakout + Trending ─── */}
        {!query.trim() && (
          <WeeklyBreakout onKeywordClick={handleSearch} />
        )}

        {/* ─── Post-search: Filter expand + Quick Stats + Graph + Papers ─── */}
        {query && query.trim() && (
          <div className="space-y-5">
            {/* Filters — vertical expand/collapse with smooth transition */}
            <AnimatePresence initial={false}>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginBottom: 0 }}
                  exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                  className="overflow-hidden"
                >
                  <AdvancedFilter
                    filters={filters}
                    setFilters={setFilters}
                    clearFilters={() => setFilters({ fields: [], startYear: '', endYear: '', minCitations: '', openAccess: false })}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <KeywordQuickStats keyword={query.trim()} />
            <RelatedTrends keyword={query.trim()} onKeywordClick={handleSearch} />
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8"
            >
              <TopPapers keyword={query.trim()} sortBy={sortBy} />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
