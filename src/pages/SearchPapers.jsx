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

const PAPERS = [
  { title: "Attention Is All You Need", authors: "Vaswani et al.", year: 2017, citations: 85432, field: "AI & ML", trend: "Super Hot", openAccess: true },
  { title: "Deep Residual Learning for Image Recognition", authors: "He et al.", year: 2016, citations: 124500, field: "AI & ML", trend: "Stable", openAccess: true },
  { title: "CRISPR-Cas9 Structures and Mechanisms", authors: "Jiang et al.", year: 2017, citations: 4500, field: "Biotech", trend: "Rising", openAccess: false },
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

  const filteredPapers = PAPERS.filter((p) => {
    const matchesQuery = !query ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.authors.toLowerCase().includes(query.toLowerCase()) ||
      p.field.toLowerCase().includes(query.toLowerCase());

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
          placeholder="Search academic papers by title, author, field..."
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
        <div className="md:col-span-1">
          <AdvancedFilter 
            userRole={currentRole}
            filters={filters}
            setFilters={setFilters}
            clearFilters={clearAllFilters}
            fieldData={FIELD_DATA}
          />
        </div>

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