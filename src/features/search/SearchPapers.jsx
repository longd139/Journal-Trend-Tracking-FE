import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, Trash2, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
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
    const key = `scitrack_search_history_${currentRole}`;
    try {
      const data = localStorage.getItem(key);
      if (data) setSearchHistory(JSON.parse(data));
    } catch {
      setSearchHistory([]);
    }
  }, [currentRole]);

  // ─── Helpers ───
  const saveToSearchHistory = (keyword) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    const key = `scitrack_search_history_${currentRole}`;
    const updated = [trimmed, ...searchHistory.filter((k) => k !== trimmed)].slice(0, 10);
    setSearchHistory(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const clearSearchHistory = () => {
    const key = `scitrack_search_history_${currentRole}`;
    setSearchHistory([]);
    localStorage.removeItem(key);
    setShowSuggestions(false);
  };

  const removeSearchHistoryItem = (keyword) => {
    const key = `scitrack_search_history_${currentRole}`;
    const updated = searchHistory.filter((k) => k !== keyword);
    setSearchHistory(updated);
    localStorage.setItem(key, JSON.stringify(updated));
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* ─── Search Bar ─── */}
        <div className="relative">
          <div className="relative">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#DEDBC8]/40 z-10" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && query.trim()) handleSearch(query); }}
              onFocus={() => { if (searchHistory.length > 0) setShowSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className="w-full pl-12 pr-14 py-4 rounded-2xl text-sm bg-[#101010] border border-[#DEDBC8]/10 text-[#E1E0CC] placeholder:text-gray-500 focus:outline-none focus:border-[#DEDBC8]/30 focus:ring-1 focus:ring-[#DEDBC8]/10 transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); sessionStorage.removeItem('scitrack_papers_query'); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[#DEDBC8]/10 text-[#DEDBC8]/60 hover:bg-[#DEDBC8]/20 hover:text-[#DEDBC8] transition-all"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search suggestions */}
          <AnimatePresence>
            {showSuggestions && filteredSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 right-0 mt-2 z-20 rounded-2xl border bg-[#101010] border-[#DEDBC8]/10 shadow-xl overflow-hidden"
              >
                {filteredSuggestions.slice(0, 8).map((kw) => (
                  <button key={kw} type="button"
                    onMouseDown={(e) => { e.preventDefault(); handleSearch(kw); }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-xs text-left hover:bg-white/5 transition-colors text-slate-300"
                  >
                    <Clock size={12} className="text-gray-500 shrink-0" />
                    <span className="flex-1 truncate">{kw}</span>
                    <button type="button"
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); removeSearchHistoryItem(kw); }}
                      className="p-0.5 rounded hover:bg-white/10 text-gray-500 hover:text-red-400 shrink-0"
                    ><X size={11} /></button>
                  </button>
                ))}
                <div className="border-t border-[#DEDBC8]/5">
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); clearSearchHistory(); }}
                    className="w-full flex items-center gap-2 px-5 py-2.5 text-[11px] font-medium text-gray-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                  ><Trash2 size={11} /> Clear search history</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Pre-search: Weekly Breakout + Trending ─── */}
        {!query.trim() && (
          <WeeklyBreakout onKeywordClick={handleSearch} />
        )}

        {/* ─── Post-search: Quick Stats + Neo4j Graph ─── */}
        {query && query.trim() && (
          <>
            <div className="flex items-center gap-2">
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

              {/* Sort Dropdown */}
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
                </SelectContent>
              </Select>
            </div>

            <div className={`grid gap-6 ${showFilters ? 'grid-cols-1 lg:grid-cols-[260px_1fr]' : 'grid-cols-1'}`}>
              {showFilters && (
                <AdvancedFilter
                  filters={filters}
                  setFilters={setFilters}
                  clearFilters={() => setFilters({ fields: [], startYear: '', endYear: '', minCitations: '', openAccess: false })}
                />
              )}
              <div className="space-y-8">
                <KeywordQuickStats keyword={query.trim()} />
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                >
              <div className="space-y-8">
                <KeywordGraphExplorer keyword={query.trim()} onKeywordClick={handleSearch} />
                <TopPapers keyword={query.trim()} sortBy={sortBy} />
              </div>
            </motion.div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
