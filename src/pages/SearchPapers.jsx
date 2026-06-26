import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Clock, Trash2 } from 'lucide-react';
import { Input } from '../components/ui/input';
import { AcademicLimitAlert } from './AcademicLimitAlert';
import { AdvancedFilter } from './AdvancedFilter';
import { PaperItemCard } from './PaperItemCard';
import { PaperDetailDialog } from './PaperDetailDialog';
import Neo4jGraphCard from '../components/Neo4jGraphCard';

// ĐÃ SỬA ĐƯỜNG DẪN IMPORT CHUẨN XÁC - TRÁNH LỖI ĐỎ LÒM CỦA VITE
import { paperAPI } from '../lib/api/paper.api';

const FIELD_DATA = [
 { n: 'AI & ML', v: 45, c: '#DEDBC8' },
 { n: 'Biotech', v: 30, c: '#DEDBC8' },
 { n: 'Climate', v: 25, c: '#A09878' },
];

const SUGGESTED_KEYWORDS = [
 'Transformer',
 'Large Language Models',
 'Computer Vision',
 'Genome Editing',
 'Neural Networks',
 'Deep Learning',
];

export default function SearchPapers() {
 const { t } = useTranslation('search');
 const [papers, setPapers] = useState([]);
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState(null);

 // State quản lý phân trang
 const [currentPage, setCurrentPage] = useState(0);
 const [totalPages, setTotalPages] = useState(1);
 const [totalElements, setTotalElements] = useState(0);

 const [query, setQuery] = useState('');
 const [savedBookmarks, setSavedBookmarks] = useState([]);
 const [filters, setFilters] = useState({
 startYear: '',
 endYear: '',
 fields: [],
 minCitations: '',
 openAccess: false,
 });
 const [showGraph, setShowGraph] = useState(false);
 const [selectedPaper, setSelectedPaper] = useState(null);

 // ─── Search history ─────────────────────────────────────────────────────
 const [searchHistory, setSearchHistory] = useState([]);
 const [showSuggestions, setShowSuggestions] = useState(false);
 const searchInputRef = useRef(null);

 // ─── Viewed papers history ──────────────────────────────────────────────
 const [viewedPapers, setViewedPapers] = useState([]);

 const currentRole = sessionStorage.getItem('userRole');
 const storageKey = `scitrack_bookmarks_${currentRole}`;

 // Reset về trang đầu khi từ khóa hoặc bộ lọc thay đổi
 useEffect(() => {
 setCurrentPage(0);
 }, [query, filters]);

 useEffect(() => {
 const loadPapersData = async () => {
  setIsLoading(true);
  setError(null);
  try {
  // Nếu có query thì gọi API search (POST), ngược lại gọi API lấy dữ liệu có sẵn (GET)
  if (query && query.trim()) {
   const requestBody = {
   query: query.trim(),
   authorName: '',
   journalId: '',
   page: currentPage,
   };

   const response = await paperAPI.searchPapers(requestBody);

   // Response structure: { status, message, data: { papers, totalElements, totalPages, currentPage, pageSize, hasNext, hasPrev }, timestamp }
   if (response && response.data) {
   const { papers, totalElements: respTotalElements, totalPages: respTotalPages } = response.data;
   const validPapers = Array.isArray(papers) ? papers.filter((p) => p !== null && p !== undefined) : [];
   setPapers(validPapers);
   setTotalPages(respTotalPages || 1);
   setTotalElements(respTotalElements || validPapers.length);
   } else {
   setPapers([]);
   setTotalPages(1);
   setTotalElements(0);
   }
  } else {
   // Gọi API GET /api/v1/papers chỉ với page + size để hiển thị dữ liệu có sẵn (Cố định hiển thị 5 bài báo)
   const apiParams = { page: currentPage, size: 5 };
   const response = await paperAPI.search(apiParams);

   if (response && response.papers && Array.isArray(response.papers)) {
   const validPapers = response.papers.filter((p) => p !== null && p !== undefined);
   setPapers(validPapers);
   setTotalPages(response.totalPages || 1);
   setTotalElements(response.totalElements || validPapers.length);
   } else if (Array.isArray(response)) {
   const validPapers = response.filter((p) => p !== null && p !== undefined);
   setPapers(validPapers);
   setTotalPages(Math.ceil(validPapers.length / 5) || 1);
   setTotalElements(validPapers.length);
   } else {
   const validPapers = response?.list || [];
   setPapers(validPapers);
   setTotalPages(response?.totalPages || 1);
   setTotalElements(response?.totalElements || validPapers.length);
   }
  }
  } catch (err) {
  console.error('API error:', err);
  if (err.response && err.response.status === 401) {
   setError(
   'Phiên làm việc đã hết hạn hoặc Token không hợp lệ. Bạn hãy bấm Sign Out rồi đăng nhập lại nhé!',
   );
  } else {
   setError(t('results.error'));
  }
  } finally {
  setIsLoading(false);
  }
 };

 const delayDebounce = setTimeout(() => {
  loadPapersData();
 }, 400);

 return () => clearTimeout(delayDebounce);
 }, [query, filters, currentPage]);

 useEffect(() => {
 const localData = sessionStorage.getItem(storageKey);
 if (localData) {
  try {
  setSavedBookmarks(JSON.parse(localData));
  } catch (e) {
  setSavedBookmarks([]);
  }
 } else {
  setSavedBookmarks([]);
 }
 }, [storageKey]);

 // Load search history from localStorage
 useEffect(() => {
 const key = `scitrack_search_history_${currentRole}`;
 try {
  const data = localStorage.getItem(key);
  if (data) setSearchHistory(JSON.parse(data));
 } catch { setSearchHistory([]); }
 }, [currentRole]);

 // Load viewed papers from localStorage
 useEffect(() => {
 const key = `scitrack_viewed_papers_${currentRole}`;
 try {
  const data = localStorage.getItem(key);
  if (data) setViewedPapers(JSON.parse(data));
 } catch { setViewedPapers([]); }
 }, [currentRole]);

 const toggleBookmark = (paper) => {
 if (!paper || !paper.title) return;
 setSavedBookmarks((prev) => {
  const isAlreadySaved = prev.some((p) => p.title === paper.title);
  const newData = isAlreadySaved
  ? prev.filter((p) => p.title !== paper.title)
  : [...prev, paper];
  sessionStorage.setItem(storageKey, JSON.stringify(newData));
  return newData;
 });
 };

 const clearAllFilters = () => {
 setFilters({
  startYear: '',
  endYear: '',
  fields: [],
  minCitations: '',
  openAccess: false,
 });
 };

 // ─── Save keyword to search history ─────────────────────────────────────
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

 // ─── View paper (save to history + open dialog) ─────────────────────────
 const handleViewPaper = (paper) => {
 setSelectedPaper(paper);
 if (!paper || !paper.title) return;
 const key = `scitrack_viewed_papers_${currentRole}`;
 const entry = {
  title: paper.title,
  authors: paper.authors,
  year: paper.pubYear || paper.year,
  field: paper.fieldName || paper.field,
  viewedAt: new Date().toISOString(),
 };
 const updated = [entry, ...viewedPapers.filter((p) => p.title !== entry.title)].slice(0, 20);
 setViewedPapers(updated);
 localStorage.setItem(key, JSON.stringify(updated));
 };

 const clearViewedPapers = () => {
 const key = `scitrack_viewed_papers_${currentRole}`;
 setViewedPapers([]);
 localStorage.removeItem(key);
 };

 // Filter history based on current query input
 const filteredSuggestions = query.trim()
 ? searchHistory.filter((k) => k.toLowerCase().includes(query.toLowerCase()))
 : searchHistory;

 const renderPageNumbers = () => {
 const pages = [];
 const maxVisiblePages = 5;
 let startPage = Math.max(0, currentPage - 2);
 let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

 if (endPage - startPage < maxVisiblePages - 1) {
  startPage = Math.max(0, endPage - maxVisiblePages + 1);
 }

 for (let i = startPage; i <= endPage; i++) {
  pages.push(
  <button
   key={i}
   type="button"
   onClick={() => setCurrentPage(i)}
   className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
   currentPage === i
    ? 'bg-blue-500 text-white '
    : 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-white border border-[#DEDBC8]/10'
   }`}
  >
   {i + 1}
  </button>,
  );
 }
 return pages;
 };

 return (
 <div className="space-y-5 p-8 max-w-6xl mx-auto min-h-screen bg-transparent">
  <AcademicLimitAlert
  userRole={currentRole}
  searchCount={3}
  maxLimit={10}
  />

  {/* Search Bar */}
  <div className="relative">
  <Search
   size={16}
   className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-gray-400 dark:text-slate-400"
  />
  <Input
   ref={searchInputRef}
   type="text"
   placeholder={t('placeholder')}
   value={query}
   onChange={(e) => setQuery(e.target.value)}
   onKeyDown={(e) => {
   if (e.key === 'Enter' && query.trim()) {
    saveToSearchHistory(query);
    setShowSuggestions(false);
   }
   }}
   onFocus={() => {
   if (searchHistory.length > 0) setShowSuggestions(true);
   }}
   onBlur={() => {
   // Delay so click on suggestion registers before hiding
   setTimeout(() => setShowSuggestions(false), 150);
   }}
   className="pl-11 pr-4 py-5 rounded-xl text-sm transition-colors focus-visible:border-gray-300 dark:focus-visible:border-white/20 focus-visible:ring-0 bg-[#101010] border-[#DEDBC8]/10 text-gray-900 dark:text-slate-200 "
  />

  {/* Search suggestions dropdown */}
  {showSuggestions && filteredSuggestions.length > 0 && (
   <div className="absolute top-full left-0 right-0 mt-1 z-20 rounded-xl border bg-[#101010] border-[#DEDBC8]/10 shadow-lg overflow-hidden">
   {filteredSuggestions.slice(0, 8).map((kw) => (
    <button
    key={kw}
    type="button"
    onMouseDown={(e) => {
     e.preventDefault();
     setQuery(kw);
     saveToSearchHistory(kw);
     setShowSuggestions(false);
    }}
    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-slate-300"
    >
    <Clock size={12} className="text-gray-400 dark:text-slate-500 shrink-0" />
    <span className="flex-1 truncate">{kw}</span>
    <button
     type="button"
     onMouseDown={(e) => {
     e.preventDefault();
     e.stopPropagation();
     removeSearchHistoryItem(kw);
     }}
     className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 dark:text-slate-500 hover:text-red-500 shrink-0"
    >
     <X size={11} />
    </button>
    </button>
   ))}
   <div className="border-t border-gray-100 border-[#DEDBC8]/5">
    <button
    type="button"
    onMouseDown={(e) => {
     e.preventDefault();
     clearSearchHistory();
    }}
    className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] font-medium text-gray-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
    >
    <Trash2 size={11} /> Clear search history
    </button>
   </div>
   </div>
  )}
  </div>

  {/* Quick Search Tags */}
  <div className="flex gap-2 flex-wrap items-center text-xs">
  <span className="text-gray-500 dark:text-slate-500 mr-1">
   {t('quickSearch')}
  </span>
  {FIELD_DATA.map((f) => (
   <button
   key={f.n}
   type="button"
   onClick={() => { setQuery(f.n); saveToSearchHistory(f.n); }}
   className="px-3 py-1.5 rounded-full font-medium transition-transform hover:scale-105"
   style={{
    background: `${f.c}1A`,
    color: f.c,
    border: `1px solid ${f.c}25`,
   }}
   >
   {f.n}
   </button>
  ))}
  {query && (
   <button
   type="button"
   onClick={() => setQuery('')}
   className="px-3 py-1.5 rounded-full font-medium flex items-center gap-1 transition-colors bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-white/5 dark:border border-[#DEDBC8]/10 dark:text-slate-400 dark:hover:bg-white/10"
   >
   <X size={10} /> {t('clearQuery')}
   </button>
  )}
  </div>

  {/* Two-column layout */}
  <div className="flex flex-col lg:flex-row items-start gap-6 pt-2 w-full">
  
  {/* Left Column: Fixed layout cho bộ lọc và từ khóa gợi ý */}
  <div className="w-full lg:w-[320px] shrink-0 space-y-4">
   <AdvancedFilter
   userRole={currentRole}
   filters={filters}
   setFilters={setFilters}
   clearFilters={clearAllFilters}
   fieldData={FIELD_DATA}
   />

   <div className="rounded-xl p-5 space-y-4 transition-all duration-300 bg-[#101010] border border-[#DEDBC8]/10 ">
   <h5 className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-slate-400">
    {t('suggestedKeywords')}
   </h5>
   <div className="flex flex-wrap gap-2">
    {SUGGESTED_KEYWORDS.map((kw) => (
    <button
     key={kw}
     type="button"
     onClick={() => { setQuery(kw); saveToSearchHistory(kw); }}
     className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-all duration-200 text-left truncate max-w-full ${
     query.toLowerCase() === kw.toLowerCase()
      ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/40 font-medium'
      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900 dark:bg-[#121824]/60 dark:text-slate-300 border-[#DEDBC8]/5 dark:hover:bg-white/5 dark:hover:text-white'
     }`}
    >
     {kw}
    </button>
    ))}
   </div>
   </div>

   {/* Recently Viewed Papers */}
   <div className="rounded-xl p-5 space-y-3 transition-all duration-300 bg-[#101010] border border-[#DEDBC8]/10 ">
   <div className="flex items-center justify-between">
    <h5 className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-slate-400">
    Recently Viewed
    </h5>
    {viewedPapers.length > 0 && (
    <button
     type="button"
     onClick={clearViewedPapers}
     className="text-[10px] text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
    >
     <Trash2 size={10} /> Clear
    </button>
    )}
   </div>
   {viewedPapers.length === 0 ? (
    <p className="text-[11px] text-gray-400 dark:text-slate-600 italic">
    No papers viewed yet
    </p>
   ) : (
    <div className="space-y-2">
    {viewedPapers.slice(0, 5).map((paper, i) => (
     <button
     key={paper.title || i}
     type="button"
     onClick={() => handleViewPaper(paper)}
     className="w-full text-left p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
     >
     <div className="flex items-center gap-1.5 mb-0.5">
      {paper.field && (
      <span
       className="text-[9px] font-bold px-1.5 py-0.5 rounded"
       style={{
       background: `${FIELD_DATA.find((f) => f.n === paper.field)?.c || '#DEDBC8'}1A`,
       color: FIELD_DATA.find((f) => f.n === paper.field)?.c || '#DEDBC8',
       }}
      >
       {paper.field}
      </span>
      )}
      {paper.year && (
      <span className="text-[10px] text-gray-400 dark:text-slate-500">{paper.year}</span>
      )}
     </div>
     <p className="text-[11px] font-medium text-gray-700 dark:text-slate-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
      {paper.title}
     </p>
     <p className="text-[10px] text-gray-400 dark:text-slate-600 mt-0.5">
      Viewed {(() => {
      const diff = Date.now() - new Date(paper.viewedAt).getTime();
      const mins = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      if (mins < 1) return 'just now';
      if (mins < 60) return `${mins}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return new Date(paper.viewedAt).toLocaleDateString();
      })()}
     </p>
     </button>
    ))}
    </div>
   )}
   </div>
  </div>

  {/* Right Column */}
  <div className="flex-1 min-w-0 space-y-4 w-full flex flex-col">
   <p className="text-xs pl-1 text-gray-500 dark:text-slate-500">
   {t('results.found', { count: totalElements })}
   </p>

   {/* Knowledge Graph Toggle */}
   {query && query.trim() && papers.length > 0 && (
   <div className="mb-3">
    <button
    type="button"
    onClick={() => setShowGraph((prev) => !prev)}
    className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-slate-400 hover:text-[#DEDBC8] dark:hover:text-blue-400 transition-colors mb-2"
    >
    {showGraph ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    {t('graph.toggle')}
    </button>
    {showGraph && <Neo4jGraphCard keyword={query.trim()} />}
   </div>
   )}

   <div className="space-y-3 flex-1">
   {isLoading && (
    <div className="text-center py-12 text-xs animate-pulse text-gray-500 dark:text-slate-400">
    {t('results.loading')}
    </div>
   )}

   {error && (
    <div className="text-center py-12 text-xs rounded-xl text-red-600 bg-red-50 border border-red-200 dark:text-red-400 dark:border-red-500/10 dark:bg-red-500/5">
    {error}
    </div>
   )}

   {!isLoading && !error && papers.length === 0 && (
    <div className="text-center py-12 text-xs rounded-xl border text-gray-500 bg-white border-gray-200 dark:text-slate-500 border-[#DEDBC8]/5 bg-[#101010]/30">
    {t('results.noResults')}
    </div>
   )}

   {!isLoading &&
    !error &&
    papers.map((paper, i) => (
    <PaperItemCard
     key={paper.id || paper.title || i}
     paper={paper}
     index={i}
     badgeColor={
     FIELD_DATA.find((f) => f.n === paper.field)?.c || '#DEDBC8'
     }
     isSaved={savedBookmarks.some(
     (saved) => saved.title === paper.title,
     )}
     onToggleBookmark={toggleBookmark}
     onClick={(p) => handleViewPaper(p)}
    />
    ))}
   </div>

   {/* Thanh phân trang bằng Flexbox hiện đại */}
   {!isLoading && !error && totalPages > 1 && (
   <div className="flex items-center justify-center gap-1.5 pt-6 pb-2">
    <button
    type="button"
    disabled={currentPage === 0}
    onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-transparent text-slate-400 border border-[#DEDBC8]/10 hover:bg-white/[0.04] hover:bg-white/5 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
    >
    <ChevronLeft size={14} /> Prev
    </button>

    <div className="flex items-center gap-1.5 mx-1">
    {renderPageNumbers()}
    </div>

    <button
    type="button"
    disabled={currentPage === totalPages - 1}
    onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-transparent text-slate-400 border border-[#DEDBC8]/10 hover:bg-white/[0.04] hover:bg-white/5 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
    >
    Next <ChevronRight size={14} />
    </button>
   </div>
   )}
  </div>
  </div>

  <PaperDetailDialog
  paper={selectedPaper}
  open={!!selectedPaper}
  onOpenChange={(open) => {
   if (!open) setSelectedPaper(null);
  }}
  />
 </div>
 );
}