import * as React from "react";
import { Bookmark, ExternalLink, Calendar, User, BookOpen } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";

export function PaperItemCard({ paper, index, badgeColor = "#4F8CFF", isSaved, onToggleBookmark }) {
  // Phòng vệ: Nếu không có dữ liệu bài báo thì không render để tránh lỗi layout
  if (!paper || !paper.title) return null;

  // FIX LỖI CRASH 404: Ép kiểu an toàn số lượng trích dẫn, phòng hờ dữ liệu undefined/null
  const rawCitations = paper.citations !== undefined && paper.citations !== null ? paper.citations : 0;
  const displayCitations = typeof rawCitations === "number" ? rawCitations : parseInt(rawCitations, 10) || 0;

  // MAP CHÍNH XÁC CÁC TRƯỜNG DỮ LIỆU TỪ PAYLOAD API CỦA ĐẠI CA
  const paperAuthors = paper.author || "Unknown Author"; 
  const paperJournal = paper.journal || "Unspecified journal";
  const paperYear = paper.publishYear || "N/A"; 

  // Xác định link bài báo: Ưu tiên trường link trực tiếp, nếu không có mới dùng DOI
  const articleUrl = paper.link || (paper.doi ? `https://doi.org/${paper.doi}` : "#");

  return (
    <Card className="bg-transparent border-white/[0.08] p-5 shadow-none transition-all duration-200 hover:border-white/20">
      <CardContent className="p-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Khối thông tin bài báo (Bên trái) */}
        <div className="space-y-2 flex-1 min-w-0">
          
          {/* 1. Tên tác giả hiển thị trên cùng */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <User size={12} className="shrink-0 text-slate-500" />
            <span className="truncate text-slate-300">{paperAuthors}</span>
          </div>

          {/* 2. Tiêu đề bài báo chính - Đã bọc thẻ <a> click mở link sang tab mới mượt mà */}
          <h4 className="text-sm font-semibold text-slate-100 hover:text-blue-400 transition-colors line-clamp-2 pt-0.5">
            <a href={articleUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {paper.title}
            </a>
          </h4>

          {/* 3. Năm xuất bản (publishYear) & Tạp chí (journal) */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-0.5">
            <div className="flex items-center gap-1">
              <Calendar size={12} className="shrink-0 text-slate-500" />
              <span>{paperYear}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen size={12} className="shrink-0 text-slate-500" />
              <span className="truncate max-w-[280px] italic">{paperJournal}</span>
            </div>
          </div>

          {/* 4. Tags phân loại */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span 
              className="text-[10px] px-2 py-0.5 rounded-md font-semibold tracking-wide uppercase"
              style={{ backgroundColor: `${badgeColor}15`, color: badgeColor }}
            >
              {paper.field || "General Academic"}
            </span>
            {paper.trend && (
              <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-emerald-500/10 text-emerald-400">
                {paper.trend}
              </span>
            )}
            {paper.openAccess && (
              <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-amber-500/10 text-amber-400">
                Open Access
              </span>
            )}
          </div>

          {/* 5. Tóm tắt Abstract */}
          {paper.abstractText && (
            <p className="text-xs text-slate-400/70 line-clamp-2 pt-1.5 leading-relaxed">
              {paper.abstractText}
            </p>
          )}
        </div>

        {/* Khối số lượng Citations & Nút thao tác (Bên phải) */}
        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t border-white/5 md:border-t-0">
          
          {/* Lượt trích dẫn */}
          <div className="text-left md:text-right">
            <div className="text-base font-bold text-slate-200 tracking-tight">
              {displayCitations.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              Citations
            </div>
          </div>

          {/* Bộ nút lưu bài báo & link icon */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleBookmark(paper)}
              className={`p-2 rounded-lg border transition-all ${
                isSaved
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                  : "bg-white/[0.02] text-slate-400 border-white/[0.06] hover:bg-white/5 hover:text-white"
              }`}
              title={isSaved ? "Remove Bookmark" : "Save Bookmark"}
            >
              <Bookmark size={14} className={isSaved ? "fill-current" : ""} />
            </button>

            <a
              href={articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border bg-white/[0.02] text-slate-400 border-white/[0.06] hover:bg-white/5 hover:text-white transition-all"
              title="Open Full Article"
            >
              <ExternalLink size={14} />
            </a>
          </div>

        </div>

      </CardContent>
    </Card>
  );
}