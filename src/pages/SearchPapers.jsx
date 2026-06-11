import * as React from 'react';
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

// Đường dẫn tương đối đi vào thư mục components dùng chung
import { Input } from '../components/ui/input';

// Gọi các sub-components nằm ngay cùng cấp thư mục pages
import { AcademicLimitAlert } from './AcademicLimitAlert';
import { AdvancedFilter } from './AdvancedFilter';
import { PaperItemCard } from './PaperItemCard';
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
  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // TỰ ĐỘNG GỌI ENDPOINT CHUẨN THÔNG QUA LAYER API
  useEffect(() => {
    const loadPapersData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Chuẩn hóa params lọc bỏ các trường rỗng/undefined
        const apiParams = {
          search: query || undefined,
          startYear: filters.startYear || undefined,
          endYear: filters.endYear || undefined,
          field: filters.fields.length > 0 ? filters.fields[0] : undefined,
          minCitations: filters.minCitations || undefined,
          openAccess: filters.openAccess ? true : undefined,
        };

        // Gọi API từ instance paperAPI đã import thành công
        const response = await paperAPI.search(apiParams);
        console.log('Dữ liệu bài báo thu được từ API:', response);

        // Kiểm tra cấu trúc phản hồi lồng `.papers` theo console log thực tế
        if (response && response.papers && Array.isArray(response.papers)) {
          // Bổ sung map phòng vệ: Đảm bảo phần tử trong mảng không bị null/undefined
          const validPapers = response.papers.filter(
            (p) => p !== null && p !== undefined,
          );
          setPapers(validPapers);
        } else if (Array.isArray(response)) {
          setPapers(response.filter((p) => p !== null && p !== undefined));
        } else {
          setPapers(response?.list || []);
        }
      } catch (err) {
        console.error('Chi tiết lỗi API:', err);
        if (err.response && err.response.status === 401) {
          setError(
            'Phiên làm việc đã hết hạn hoặc Token không hợp lệ. Bạn hãy bấm Sign Out rồi đăng nhập lại nhé!',
          );
        } else {
          setError('Không thể tải danh sách bài báo từ hệ thống.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Cơ chế hoãn 400ms để giảm spam request khi gõ chữ nhanh
    const delayDebounce = setTimeout(() => {
      loadPapersData();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query, filters]);

  // Đồng bộ trạng thái Bookmark lưu trữ
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

  // Logic ép style CSS cho thanh input search nhỏ phía trên Header
  useEffect(() => {
    const colorTopSearch = () => {
      const allInputs = document.querySelectorAll('input');
      allInputs.forEach((input) => {
        if (
          input.placeholder &&
          (input.placeholder.includes('Search papers, topics') ||
            input.placeholder.includes('topics...'))
        ) {
          input.style.setProperty('background-color', '#1B2235', 'important');
          input.style.setProperty(
            'border-color',
            'rgba(255, 255, 255, 0.1)',
            'important',
          );
          input.style.setProperty('color', '#f1f5f9', 'important');
        }
      });
    };
    colorTopSearch();
    const interval = setInterval(colorTopSearch, 500);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="space-y-5 p-8 max-w-6xl mx-auto text-slate-100 min-h-screen bg-[#0B0F19]">
      <AcademicLimitAlert
        userRole={currentRole}
        searchCount={3}
        maxLimit={10}
      />

      {/* Thanh Search chính */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-slate-400"
        />
        <Input
          type="text"
          placeholder="Search academic papers by title, author, field, abstract..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-11 pr-4 py-5 rounded-xl text-sm bg-[#1B2235] border-white/10 text-slate-200 focus-visible:border-blue-500/50"
        />
      </div>

      {/* Quick Search nhãn */}
      <div className="flex gap-2 flex-wrap items-center text-xs">
        <span className="text-slate-500 mr-1">Quick search:</span>
        {FIELD_DATA.map((f) => (
          <button
            key={f.n}
            type="button"
            onClick={() => setQuery(f.n)}
            className="px-3 py-1.5 rounded-full font-medium transition-transform hover:scale-105"
            style={{
              background: `${f.c}1A`,
              color: f.c,
              border: `1px solid ${f.c}33`,
            }}
          >
            {f.n}
          </button>
        ))}
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="px-3 py-1.5 rounded-full font-medium flex items-center gap-1 bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"
          >
            <X size={10} /> Clear query
          </button>
        )}
      </div>

      {/* Bố cục hai cột */}
      <div className="flex flex-col lg:flex-row items-stretch gap-6 pt-2 w-full">
        {/* Cột trái */}
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

          <div className="bg-[#1B2235] border border-white/5 rounded-xl p-4 space-y-3">
            <h5 className="text-xs uppercase tracking-wider font-bold text-slate-400">
              Suggested Keywords
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setQuery(kw)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border transition-all duration-200 text-left truncate max-w-full ${
                    query.toLowerCase() === kw.toLowerCase()
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 font-medium'
                      : 'bg-[#121824]/60 text-slate-300 border-white/5 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cột phải */}
        <div className="flex-1 min-w-0 space-y-3 w-full flex flex-col">
          <p className="text-xs text-slate-500 pl-1">
            Found {papers.length} {papers.length === 1 ? 'paper' : 'papers'}{' '}
            matching your criteria
          </p>

          <div className="space-y-3 flex-1">
            {isLoading && (
              <div className="text-center py-12 text-xs text-slate-400 animate-pulse">
                Đang tải dữ liệu bài báo...
              </div>
            )}

            {error && (
              <div className="text-center py-12 text-xs text-red-400 border border-red-500/10 rounded-xl bg-red-500/5">
                {error}
              </div>
            )}

            {!isLoading && !error && papers.length === 0 && (
              <div className="text-center py-12 text-xs text-slate-500 border border-white/5 bg-[#1B2235]/30 rounded-xl">
                Không tìm thấy bài báo nào.
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
        </div>
      </div>
    </div>
  );
}
