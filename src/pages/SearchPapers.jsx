import * as React from "react";
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

// Thay đổi import từ đường dẫn tương đối chính xác đến file input của bạn
import { Input } from "../components/ui/input";

// Gọi các sub-components nằm ngay cùng cấp thư mục pages
import { AcademicLimitAlert } from "./AcademicLimitAlert";
import { AdvancedFilter } from "./AdvancedFilter";
import { PaperItemCard } from "./PaperItemCard";

const FIELD_DATA = [
  { n: "AI & ML", v: 45, c: "#4F8CFF" },
  { n: "Biotech", v: 30, c: "#8B5CF6" },
  { n: "Climate", v: 25, c: "#00D1B2" }
];

// Mock data đã được cập nhật đầy đủ Metadata theo yêu cầu bài toán
const PAPERS = [
  { 
    title: "Attention Is All You Need", 
    authors: "Vaswani et al.", 
    year: 2017, 
    citations: 85432, 
    field: "AI & ML", 
    trend: "Super Hot", 
    openAccess: true,
    journal: "Advances in Neural Information Processing Systems (NeurIPS)",
    doi: "10.48550/arXiv.1706.03762",
    abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely."
  },
  { 
    title: "Deep Residual Learning for Image Recognition", 
    authors: "He et al.", 
    year: 2016, 
    citations: 124500, 
    field: "AI & ML", 
    trend: "Stable", 
    openAccess: true,
    journal: "IEEE Conference on Computer Vision and Pattern Recognition (CVPR)",
    doi: "10.1109/CVPR.2016.90",
    abstract: "Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions. We provide comprehensive empirical evidence showing that these residual networks are easier to optimize, and can gain accuracy from considerably increased depth."
  },
  { 
    title: "CRISPR-Cas9 Structures and Mechanisms", 
    authors: "Jiang et al.", 
    year: 2017, 
    citations: 4500, 
    field: "Biotech", 
    trend: "Rising", 
    openAccess: false,
    journal: "Annual Review of Biophysics",
    doi: "10.1146/annurev-biophys-070816-033653",
    abstract: "The CRISPR-Cas9 system has revolutionized genome editing due to its simplicity, efficiency, and versatility. Derived from a bacterial adaptive immune system, Cas9 is an RNA-guided endonuclease that targets specific DNA sequences for cleavage. This review summarizes recent structural and mechanistic insights into how Cas9 recognizes target DNA, undergoes conformational changes, and executes precise double-stranded breaks."
  },
];

// Mock dữ liệu từ khóa xu hướng (sau này sẽ kết nối API Axios lấy trendScore từ Neo4j)
const SUGGESTED_KEYWORDS = [
  "Transformer", "Large Language Models", "Computer Vision", "Genome Editing", "Neural Networks", "Deep Learning"
];

export default function SearchPapers() {
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
    setFilters({ startYear: "", endYear: "", fields: [], minCitations: "", openAccess: false });
  };

  // Hàm xử lý khi người dùng click vào từ khóa gợi ý
  const handleKeywordClick = (keyword) => {
    setQuery(keyword);
  };

  const filteredPapers = PAPERS.filter((p) => {
    const matchesQuery = !query ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.authors.toLowerCase().includes(query.toLowerCase()) ||
      p.field.toLowerCase().includes(query.toLowerCase()) ||
      (p.abstract && p.abstract.toLowerCase().includes(query.toLowerCase())); // Tìm kiếm cả trong abstract

    if (!matchesQuery) return false;

    if (currentRole === "researcher") {
      if (filters.startYear && p.year < parseInt(filters.startYear, 10)) return false;
      if (filters.endYear && p.year > parseInt(filters.endYear, 10)) return false;
      if (filters.fields.length > 0 && !filters.fields.includes(p.field)) return false;
      if (filters.minCitations && p.citations < parseInt(filters.minCitations, 10)) return false;
      if (filters.openAccess && !p.openAccess) return false;
    }

    return true;
  });

  return (
    <div className="space-y-5 p-8 max-w-6xl mx-auto text-slate-100 min-h-screen bg-[#0B0F19]">
      <AcademicLimitAlert userRole={currentRole} searchCount={3} maxLimit={10} />

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-slate-400" />
        <Input
          type="text"
          placeholder="Search academic papers by title, author, field, abstract..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-11 pr-4 py-5 rounded-xl text-sm bg-[#1B2235] border-white/10 text-slate-200 focus-visible:border-blue-500/50"
        />
      </div>

      <div className="flex gap-2 flex-wrap items-center text-xs">
        <span className="text-slate-500 mr-1">Quick search:</span>
        {FIELD_DATA.map((f) => (
          <button
            key={f.n}
            type="button"
            onClick={() => setQuery(f.n)}
            className="px-3 py-1.5 rounded-full font-medium transition-transform hover:scale-105"
            style={{ background: `${f.c}1A`, color: f.c, border: `1px solid ${f.c}33` }}
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2 items-start">
        {/* Sidebar chứa Filter và Suggested Keywords */}
        <div className="md:col-span-1 space-y-4">
          <AdvancedFilter 
            userRole={currentRole}
            filters={filters}
            setFilters={setFilters}
            clearFilters={clearAllFilters}
            fieldData={FIELD_DATA}
          />

          {/* Thiết kế cấu trúc Keyword gợi ý ngay phía dưới Bộ lọc */}
          <div className="bg-[#1B2235] border border-white/5 rounded-xl p-4 space-y-3">
            <h5 className="text-xs uppercase tracking-wider font-bold text-slate-400">
              Suggested Keywords
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => handleKeywordClick(kw)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border transition-all duration-200 text-left truncate max-w-full ${
                    query.toLowerCase() === kw.toLowerCase()
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/40 font-medium"
                      : "bg-[#121824]/60 text-slate-300 border-white/5 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Danh sách kết quả */}
        <div className="md:col-span-3 space-y-3">
          <p className="text-xs text-slate-500 pl-1">
            Found {filteredPapers.length} {filteredPapers.length === 1 ? "paper" : "papers"} matching your criteria
          </p>

          {filteredPapers.map((paper, i) => (
            <PaperItemCard
              key={paper.title}
              paper={paper}
              index={i}
              badgeColor={FIELD_DATA.find((f) => f.n === paper.field)?.c || "#4F8CFF"}
              isSaved={savedBookmarks.some((saved) => saved.title === paper.title)}
              onToggleBookmark={toggleBookmark}
            />
          ))}
        </div>
      </div>
    </div>
  );
}