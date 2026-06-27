import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, Trash2, Sparkles, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { PaperItemCard } from './PaperItemCard';
import { PaperDetailDialog } from './PaperDetailDialog';
import Neo4jGraphCard from '../components/Neo4jGraphCard';
import { paperAPI } from '../lib/api/paper.api';

/* ═══════════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════════ */

const FIELD_DATA = [
  { n: 'AI & ML', v: 45, c: '#DEDBC8' },
  { n: 'Biotech', v: 30, c: '#DEDBC8' },
  { n: 'Climate', v: 25, c: '#A09878' },
  { n: 'Quantum', v: 18, c: '#DEDBC8' },
  { n: 'Medicine', v: 35, c: '#A09878' },
  { n: 'Energy', v: 15, c: '#DEDBC8' },
];

const SUGGESTED_KEYWORDS = [
  'Transformer', 'Large Language Models', 'Computer Vision',
  'Genome Editing', 'Neural Networks', 'Deep Learning',
  'Climate Change', 'Quantum Computing', 'mRNA Vaccine',
];

/* ═══════════════════════════════════════════════════════════════════════════
   Loading Skeleton
   ═══════════════════════════════════════════════════════════════════════════ */

function SkeletonCard() {
  return (
    <div className="bg-[#101010] border border-[#DEDBC8]/5 rounded-2xl p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-3 w-20 bg-[#DEDBC8]/10 rounded-full" />
        <div className="h-3 w-16 bg-[#DEDBC8]/5 rounded-full" />
      </div>
      <div className="h-4 w-3/4 bg-[#DEDBC8]/8 rounded" />
      <div className="h-3 w-full bg-[#DEDBC8]/5 rounded" />
      <div className="h-3 w-2/3 bg-[#DEDBC8]/5 rounded" />
      <div className="flex gap-2 pt-2">
        <div className="h-5 w-14 bg-[#DEDBC8]/10 rounded-full" />
        <div className="h-5 w-16 bg-[#DEDBC8]/10 rounded-full" />
        <div className="h-5 w-12 bg-[#DEDBC8]/10 rounded-full" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Empty State
   ═══════════════════════════════════════════════════════════════════════════ */

function EmptyState({ hasQuery }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-[#DEDBC8]/5 flex items-center justify-center mb-6">
        {hasQuery ? (
          <Search size={32} className="text-[#DEDBC8]/30" />
        ) : (
          <Sparkles size={32} className="text-[#DEDBC8]/30" />
        )}
      </div>
      <h3 className="text-lg font-medium text-[#E1E0CC] mb-2">
        {hasQuery ? 'No results found' : 'Start exploring'}
      </h3>
      <p className="text-sm text-gray-500 max-w-md">
        {hasQuery
          ? 'Try a different keyword or check your spelling.'
          : 'Enter a keyword above to discover academic papers, or pick a trending topic below.'}
      </p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function SearchPapers() {
  const { t } = useTranslation('search');
  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [query, setQuery] = useState('');
  const [savedBookmarks, setSavedBookmarks] = useState([]);
  const [showGraph, setShowGraph] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchInputRef = useRef(null);
  const [viewedPapers, setViewedPapers] = useState([]);

  const currentRole = sessionStorage.getItem('userRole');
  const storageKey = `scitrack_bookmarks_${currentRole}`;

  // ─── Reset page when query changes ───
  useEffect(() => { setCurrentPage(0); }, [query]);

  // ─── Load bookmarks ───
  useEffect(() => {
    const localData = sessionStorage.getItem(storageKey);
    if (localData) {
      try { setSavedBookmarks(JSON.parse(localData)); } catch { setSavedBookmarks([]); }
    } else { setSavedBookmarks([]); }
  }, [storageKey]);

  // ─── Load search history ───
  useEffect(() => {
    const key = `scitrack_search_history_${currentRole}`;
    try { const data = localStorage.getItem(key); if (data) setSearchHistory(JSON.parse(data)); }
    catch { setSearchHistory([]); }
  }, [currentRole]);

  // ─── Load viewed papers ───
  useEffect(() => {
    const key = `scitrack_viewed_papers_${currentRole}`;
    try { const data = localStorage.getItem(key); if (data) setViewedPapers(JSON.parse(data)); }
    catch { setViewedPapers([]); }
  }, [currentRole]);

  // ─── Search ───
  useEffect(() => {
    const loadPapersData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (query && query.trim()) {
          const response = await paperAPI.searchByKeyword(query.trim(), currentPage, 5);
          if (response) {
            const { papers, totalElements: respTotalElements, totalPages: respTotalPages } = response;
            const validPapers = Array.isArray(papers) ? papers.filter((p) => p !== null && p !== undefined) : [];
            setPapers(validPapers);
            setTotalPages(respTotalPages || 1);
            setTotalElements(respTotalElements || validPapers.length);
          } else {
            setPapers([]); setTotalPages(1); setTotalElements(0);
          }
        } else {
          setPapers([]); setTotalPages(1); setTotalElements(0);
        }
      } catch (err) {
        console.error('API error:', err);
        if (err.response && err.response.status === 401) {
          setError('Session expired. Please sign out and log in again.');
        } else {
          setError(t('results.error'));
        }
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => { loadPapersData(); }, 400);
    return () => clearTimeout(delayDebounce);
  }, [query, currentPage]);

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
    setShowSuggestions(false);
    setHasSearched(true);
  };

  const handleViewPaper = (paper) => {
    setSelectedPaper(paper);
    if (!paper || !paper.title) return;
    const key = `scitrack_viewed_papers_${currentRole}`;
    const entry = {
      title: paper.title, authors: paper.authors,
      year: paper.pubYear || paper.year,
      field: paper.fieldName || paper.field,
      viewedAt: new Date().toISOString(),
    };
    const updated = [entry, ...viewedPapers.filter((p) => p.title !== entry.title)].slice(0, 20);
    setViewedPapers(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const toggleBookmark = (paper) => {
    if (!paper || !paper.title) return;
    setSavedBookmarks((prev) => {
      const isAlreadySaved = prev.some((p) => p.title === paper.title);
      const newData = isAlreadySaved ? prev.filter((p) => p.title !== paper.title) : [...prev, paper];
      sessionStorage.setItem(storageKey, JSON.stringify(newData));
      return newData;
    });
  };

  const filteredSuggestions = query.trim()
    ? searchHistory.filter((k) => k.toLowerCase().includes(query.toLowerCase()))
    : searchHistory;

  // ─── Pagination ───
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, currentPage - 2);
    let end = Math.min(totalPages - 1, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(0, end - maxVisible + 1);
    for (let i = start; i <= end; i++) {
      pages.push(
        <button key={i} type="button" onClick={() => setCurrentPage(i)}
          className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
            currentPage === i
              ? 'bg-[#DEDBC8] text-black'
              : 'text-slate-400 hover:bg-white/5 hover:text-white border border-[#DEDBC8]/10'
          }`}
        >{i + 1}</button>
      );
    }
    return pages;
  };

  /* ═══════════════════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════════════════ */

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* ─── Hero Search ─── */}
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
                onClick={() => { setQuery(''); setHasSearched(false); }}
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

        {/* ─── Trending Keywords ─── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-[#DEDBC8]/50" />
            <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500">Trending</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {FIELD_DATA.map((f, i) => (
              <motion.button
                key={f.n}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => handleSearch(f.n)}
                className="px-4 py-2 rounded-full text-xs font-medium transition-all border"
                style={{
                  background: `${f.c}10`,
                  color: f.c,
                  borderColor: `${f.c}20`,
                }}
              >
                {f.n}
              </motion.button>
            ))}
            {SUGGESTED_KEYWORDS.slice(0, 5).map((kw, i) => (
              <motion.button
                key={kw}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (FIELD_DATA.length + i) * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => handleSearch(kw)}
                className="px-4 py-2 rounded-full text-xs font-medium bg-[#DEDBC8]/5 text-[#DEDBC8]/70 border border-[#DEDBC8]/10 hover:bg-[#DEDBC8]/10 hover:text-[#DEDBC8] transition-all"
              >
                {kw}
              </motion.button>
            ))}
          </div>
        </div>

        {/* ─── Knowledge Graph Toggle ─── */}
        {query && query.trim() && papers.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button type="button"
              onClick={() => setShowGraph((prev) => !prev)}
              className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-[#DEDBC8] transition-colors"
            >
              {showGraph ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {t('graph.toggle')}
            </button>
            <AnimatePresence>
              {showGraph && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
                  <Neo4jGraphCard keyword={query.trim()} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ─── Results ─── */}
        <div className="space-y-4">
          {/* Results count */}
          {query && query.trim() && !isLoading && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-xs text-gray-500">
              {t('results.found', { count: totalElements })}
            </motion.p>
          )}

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 text-xs rounded-2xl text-red-400 bg-red-500/5 border border-red-500/10">
              {error}
            </motion.div>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <SkeletonCard />
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!isLoading && !error && papers.length === 0 && (
            <EmptyState hasQuery={hasSearched && !!query.trim()} />
          )}

          {/* Paper card grid */}
          {!isLoading && !error && papers.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {papers.map((paper, i) => (
                <motion.div
                  key={paper.id || paper.title || i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <PaperItemCard
                    paper={paper}
                    index={0}
                    badgeColor={FIELD_DATA.find((f) => f.n === paper.fieldName || f.n === paper.field)?.c || '#DEDBC8'}
                    isSaved={savedBookmarks.some((saved) => saved.title === paper.title)}
                    onToggleBookmark={toggleBookmark}
                    onClick={(p) => handleViewPaper(p)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {!isLoading && !error && totalPages > 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-1.5 pt-4">
              <button type="button" disabled={currentPage === 0}
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 border border-[#DEDBC8]/10 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
              ><ChevronLeft size={14} /> Prev</button>
              <div className="flex items-center gap-1.5 mx-1">{renderPageNumbers()}</div>
              <button type="button" disabled={currentPage === totalPages - 1}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 border border-[#DEDBC8]/10 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
              >Next <ChevronRight size={14} /></button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Paper Detail Dialog */}
      <PaperDetailDialog
        paper={selectedPaper}
        open={!!selectedPaper}
        onOpenChange={(open) => { if (!open) setSelectedPaper(null); }}
      />
    </div>
  );
}
