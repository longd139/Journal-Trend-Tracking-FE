import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, Trash2, UserSearch, Lock } from 'lucide-react';
import AuthorQuickStats from './AuthorQuickStats';
import { useAuthStore } from '../user/store.js';
import AuthorTimeline from './AuthorTimeline';
import AuthorResearchFocus from './AuthorResearchFocus';
import AuthorCoAuthors from './AuthorCoAuthors';
import AuthorSuggestions from './AuthorSuggestions';

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function SearchAuthor() {
  const { t } = useTranslation('search');
  const navigate = useNavigate();
  const [query, setQuery] = useState(() => sessionStorage.getItem('scitrack_author_query') || '');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);

  const currentRole = sessionStorage.getItem('userRole');
  const isAcademic = currentRole === 'academic_user' || currentRole === 'academic';
  const user = useAuthStore((s) => s.user);
  const userId = user?.id || user?.email || currentRole;
  const historyKey = useMemo(() => `scitrack_author_search_history_${userId}`, [userId]);

  // Restore persisted search
  useEffect(() => {
    const saved = sessionStorage.getItem('scitrack_author_query');
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
    sessionStorage.setItem('scitrack_author_query', kw);
    setShowSuggestions(false);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
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
            <UserSearch size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#DEDBC8]/40 z-10" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('author.placeholder')}
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
                onClick={() => { setQuery(''); sessionStorage.removeItem('scitrack_author_query'); }}
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

        {/* ─── Pre-search: Suggested authors ─── */}
        {!query.trim() && (
          <AuthorSuggestions onAuthorClick={handleSearch} />
        )}

        {/* ─── Results (only when query is entered) ─── */}
        {query && query.trim() && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            <AuthorQuickStats keyword={query.trim()} />
            {isAcademic ? (
              <div className="space-y-8">
                {/* Timeline — blurred real content */}
                <div className="relative">
                  <div className="blur-[6px] pointer-events-none select-none">
                    <AuthorTimeline keyword={query.trim()} />
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
                    <AuthorResearchFocus keyword={query.trim()} />
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
                    <AuthorCoAuthors keyword={query.trim()} onAuthorClick={handleSearch} />
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
                <AuthorTimeline keyword={query.trim()} />
                <AuthorResearchFocus keyword={query.trim()} />
                <AuthorCoAuthors keyword={query.trim()} onAuthorClick={handleSearch} />
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
