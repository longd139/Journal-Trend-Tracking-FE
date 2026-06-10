import * as React from "react";
import { useState, useEffect } from "react";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";

// Đường dẫn tương đối đi vào thư mục components dùng chung
import { Input } from "../components/ui/input";

// Gọi các sub-components nằm ngay cùng cấp thư mục pages
import { AcademicLimitAlert } from "./AcademicLimitAlert";
import { AdvancedFilter } from "./AdvancedFilter";
import { PaperItemCard } from "./PaperItemCard";

// ĐÃ SỬA ĐƯỜNG DẪN IMPORT CHUẨN XÁC - TRÁNH LỖI ĐỎ LÒM CỦA VITE
import { paperAPI } from "../lib/api/paper.api";

const FIELD_DATA = [
  { n: "AI & ML", v: 45, c: "#4F8CFF" },
  { n: "Biotech", v: 30, c: "#8B5CF6" },
  { n: "Climate", v: 25, c: "#00D1B2" }
];

const SUGGESTED_KEYWORDS = [
  "Transformer", "Large Language Models", "Computer Vision", "Genome Editing", "Neural Networks", "Deep Learning"
];

export default function SearchPapers() {
  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // State quản lý phân trang
  const [currentPage, setCurrentPage] = useState(0); 
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [query, setQuery] = useState("");
  const [savedBookmarks, setSavedBookmarks] = useState([]);
  const [filters, setFilters] = useState({
    startYear: "",
    endYear: "",
    fields: [],
    minCitations: "",
    openAccess: false
  });

  const currentRole = sessionStorage.getItem("userRole") || "academic";
  const storageKey = `scitrack_bookmarks_${currentRole}`;

  // Reset về trang đầu tiên nếu đổi bộ lọc
  useEffect(() => {
    setCurrentPage(0);
  }, [query, filters]);

  // TỰ ĐỘNG GỌI ENDPOINT CHUẨN THÔNG QUA LAYER API
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
          size: 5 
        };

        const response = await paperAPI.search(apiParams);
        
        if (response && response.papers && Array.isArray(response.papers)) {
          const validPapers = response.papers.filter(p => p !== null && p !== undefined);
          setPapers(validPapers);
          setTotalPages(response.totalPages || 1);
          setTotalElements(response.totalElements || validPapers.length);
        } else if (Array.isArray(response)) {
          const validPapers = response.filter(p => p !== null && p !== undefined);
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
        console.error("Chi tiết lỗi API:", err);
        if (err.response && err.response.status === 401) {
          setError("Phiên làm việc đã hết hạn hoặc Token không hợp lệ. Bạn hãy bấm Sign Out rồi đăng nhập lại nhé!");
        } else {
          setError("Không thể tải danh sách bài báo từ hệ thống.");
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

  // Đồng bộ trạng thái Bookmark lưu trữ
  useEffect(() => {
    const localData = sessionStorage.getItem(storageKey);
    if (localData) {
      try { setSavedBookmarks(JSON.parse(localData)); } catch (e) { setSavedBookmarks([]); }
    } else { setSavedBookmarks([]); }
  }, [storageKey]);

  // ÉP ĐỒNG BỘ MÀU HOÀN TOÀN TRÊN UI QUA ĐƯỜNG DOM LỚN NHỎ
  useEffect(() => {
    const colorTopSearch = () => {
      const allInputs = document.querySelectorAll("input");
      allInputs.forEach((input) => {
        input.style.setProperty("background-color", "transparent", "important"); 
        input.style.setProperty("border-color", "rgba(255, 255, 255, 0.08)", "important");
        input.style.setProperty("color", "#f1f5f9", "important");
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
      const newData = isAlreadySaved ? prev.filter((p) => p.title !== paper.title) : [...prev, paper];
      sessionStorage.setItem(storageKey, JSON.stringify(newData));
      return newData;
    });
  };

  const clearAllFilters = () => {
    setFilters({ startYear: "", endYear: "", fields: [], minCitations: "", openAccess: false });
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
              ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
              : "bg-transparent text-slate-400 hover:bg-white/5 hover:text-white border border-white/[0.08]"
          }`}
        >
          {i + 1}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="space-y-5 p-8 max-w-6xl mx-auto text-slate-100 min-h-screen bg-[#0B0F19]">
      <AcademicLimitAlert userRole={currentRole} searchCount={3} maxLimit={10} />

      {/* Thanh Search chính - Đã đổi bg thành transparent để tiệp màu hoàn toàn với nền ngoài */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-slate-400" />
        <Input
          type="text"
          placeholder="Search academic papers by title, author, field, abstract..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-11 pr-4 py-5 rounded-xl text-sm bg-transparent border-white/[0.08] text-slate-200 focus-visible:border-blue-500/40"
          style={{ backgroundColor: 'transparent' }}
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
            style={{ background: `${f.c}1A`, color: f.c, border: `1px solid ${f.c}25` }}
          >
            {f.n}
          </button>
        ))}
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="px-3 py-1.5 rounded-full font-medium flex items-center gap-1 bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"
          >
            <X size={10} /> Clear query
          </button>
        )}
      </div>

      {/* Bố cục hai cột */}
      <div className="flex flex-col lg:flex-row items-start gap-6 pt-2 w-full">
        
        {/* CỘT TRÁI - Đồng bộ nền phẳng */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-4">
          <AdvancedFilter 
            userRole={currentRole}
            filters={filters}
            setFilters={setFilters}
            clearFilters={clearAllFilters}
            fieldData={FIELD_DATA}
            className="bg-transparent border-white/[0.08]" 
          />

          <div className="bg-transparent border border-white/[0.08] rounded-xl p-4 space-y-3">
            <h5 className="text-xs uppercase tracking-wider font-bold text-slate-400">Suggested Keywords</h5>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setQuery(kw)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border transition-all duration-200 text-left truncate max-w-full ${
                    query.toLowerCase() === kw.toLowerCase()
                      ? "bg-blue-500/15 text-blue-400 border-blue-500/30 font-medium"
                      : "bg-white/[0.02] text-slate-300 border-white/[0.05] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="flex-1 min-w-0 space-y-3 w-full flex flex-col">
          <p className="text-xs text-slate-500 pl-1">
            Found {totalElements} {totalElements === 1 ? "paper" : "papers"} matching your criteria
          </p>

          <div className="space-y-3 flex-1">
            {isLoading && (
              <div className="text-center py-12 text-xs text-slate-400 animate-pulse">Đang tải dữ liệu bài báo...</div>
            )}

            {error && (
              <div className="text-center py-12 text-xs text-red-400 border border-red-500/10 rounded-xl bg-red-500/5">{error}</div>
            )}

            {!isLoading && !error && papers.length === 0 && (
              <div className="text-center py-12 text-xs text-slate-500 border border-white/[0.08] bg-white/[0.01] rounded-xl">Không tìm thấy bài báo nào.</div>
            )}

            {!isLoading && !error && papers.map((paper, i) => (
              <PaperItemCard
                key={paper.id || paper.title || i}
                paper={paper}
                index={i}
                badgeColor={FIELD_DATA.find((f) => f.n === paper.field)?.c || "#4F8CFF"}
                isSaved={savedBookmarks.some((saved) => saved.title === paper.title)}
                onToggleBookmark={toggleBookmark}
              />
            ))}
          </div>

          {/* THANH PHÂN TRANG */}
          {!isLoading && !error && totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-6 pb-2">
              <button
                type="button"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
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
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-transparent text-slate-400 border border-white/[0.08] hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}