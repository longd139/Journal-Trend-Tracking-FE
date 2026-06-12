import * as React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import { Input } from '../components/ui/input';
import { AcademicLimitAlert } from './AcademicLimitAlert';
import { AdvancedFilter } from './AdvancedFilter';
import { PaperItemCard } from './PaperItemCard';

// ĐÃ SỬA ĐƯỜNG DẪN IMPORT CHUẨN XÁC - TRÁNH LỖI ĐỎ LÒM CỦA VITE
import { paperAPI } from '../lib/api/paper.api';

const FIELD_DATA = [
  { n: 'AI & ML', v: 45, c: '#4F8CFF' },
  { n: 'Biotech', v: 30, c: '#8B5CF6' },
  { n: 'Climate', v: 25, c: '#00D1B2' },
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

  const currentRole = sessionStorage.getItem('userRole');
  const storageKey = `scitrack_bookmarks_${currentRole}`;

  useEffect(() => {
    const loadPapersData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiParams = {
          search: query || undefined,
          startYear: filters.startYear || undefined,
          endYear: filters.endYear || undefined,
          field: filters.fields.length > 0 ? filters.fields[0] : undefined,
          minCitations: filters.minCitations || undefined,
          openAccess: filters.openAccess ? true : undefined,
          page: currentPage,
          size: 5,
        };

        const response = await paperAPI.search(apiParams);

        if (response && response.papers && Array.isArray(response.papers)) {
          const validPapers = response.papers.filter(
            (p) => p !== null && p !== undefined,
          );
          setPapers(validPapers);
          setTotalPages(response.totalPages || 1);
          setTotalElements(response.totalElements || validPapers.length);
        } else if (Array.isArray(response)) {
          const validPapers = response.filter(
            (p) => p !== null && p !== undefined,
          );
          setPapers(validPapers);
          setTotalPages(Math.ceil(validPapers.length / 5) || 1);
          setTotalElements(validPapers.length);
        } else {
          const validPapers = response?.list || [];
          setPapers(validPapers);
          setTotalPages(response?.totalPages || 1);
          setTotalElements(response?.totalElements || validPapers.length);
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
              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
              : 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-white border border-white/[0.08]'
          }`}
        >
          {i + 1}
        </button>,
      );
    }
    return pages;
  };

  return (
    <div className="space-y-5 p-8 max-w-6xl mx-auto min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0B1020]">
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
          type="text"
          placeholder={t('placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-11 pr-4 py-5 rounded-xl text-sm transition-colors focus-visible:border-blue-500/50 bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/10 text-gray-900 dark:text-slate-200 shadow-sm dark:shadow-none"
        />
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
            onClick={() => setQuery(f.n)}
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
            className="px-3 py-1.5 rounded-full font-medium flex items-center gap-1 transition-colors bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-white/5 dark:border dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10"
          >
            <X size={10} /> {t('clearQuery')}
          </button>
        )}
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row items-stretch gap-6 pt-2 w-full">
        {/* Left Column */}
        <div className="w-full lg:w-[320px] shrink-0 flex flex-col justify-between gap-4">
          <div className="flex-1 flex flex-col">
            <AdvancedFilter
              userRole={currentRole}
              filters={filters}
              setFilters={setFilters}
              clearFilters={clearAllFilters}
              fieldData={FIELD_DATA}
            />
          </div>

          <div className="rounded-xl p-4 space-y-3 transition-colors duration-300 bg-white dark:bg-[#1B2235] border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
            <h5 className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-slate-400">
              {t('suggestedKeywords')}
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setQuery(kw)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border transition-all duration-200 text-left truncate max-w-full ${
                    query.toLowerCase() === kw.toLowerCase()
                      ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/40 font-medium'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900 dark:bg-[#121824]/60 dark:text-slate-300 dark:border-white/5 dark:hover:bg-white/5 dark:hover:text-white'
                  }`}
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1 min-w-0 space-y-3 w-full flex flex-col">
          <p className="text-xs pl-1 text-gray-500 dark:text-slate-500">
            {t('results.found', { count: papers.length })}
          </p>

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
              <div className="text-center py-12 text-xs rounded-xl border text-gray-500 bg-white border-gray-200 dark:text-slate-500 dark:border-white/5 dark:bg-[#1B2235]/30">
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
                    FIELD_DATA.find((f) => f.n === paper.field)?.c || '#4F8CFF'
                  }
                  isSaved={savedBookmarks.some(
                    (saved) => saved.title === paper.title,
                  )}
                  onToggleBookmark={toggleBookmark}
                />
              ))}
          </div>

          {/* THANH PHÂN TRANG */}
          {/* {!isLoading && !error && totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-6 pb-2">
              <button
                type="button"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-transparent text-slate-400 border border-white/[0.08] hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
              >
                <ChevronLeft size={14} /> Prev
              </button>

              <div className="flex items-center gap-1.5 mx-1">
                {renderPageNumbers()}
              </div>

              <button
                type="button"
                disabled={currentPage === totalPages - 1}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                }
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-transparent text-slate-400 border border-white/[0.08] hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
