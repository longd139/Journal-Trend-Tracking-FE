import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookmarkMinus, BookOpen, Calendar, User, ExternalLink } from 'lucide-react';

const FIELD_DATA = [
  { n: "AI & ML", v: 45, c: "#4F8CFF" },
  { n: "Biotech", v: 30, c: "#8B5CF6" },
  { n: "Climate", v: 25, c: "#00D1B2" }
];

export default function BookmarksView() {
  const [bookmarks, setBookmarks] = useState([]);

  // Lấy chính xác hòm lưu trữ theo Role người dùng hiện tại
  const currentRole = sessionStorage.getItem('userRole') || 'academic';
  const storageKey = `scitrack_bookmarks_${currentRole}`;

  useEffect(() => {
    const localData = sessionStorage.getItem(storageKey);
    if (localData) {
      try {
        setBookmarks(JSON.parse(localData));
      } catch (e) {
        setBookmarks([]);
      }
    } else {
      setBookmarks([]);
    }
  }, [storageKey]);

  const removeBookmark = (titleToRemove) => {
    const newData = bookmarks.filter(p => p.title !== titleToRemove);
    setBookmarks(newData);
    sessionStorage.setItem(storageKey, JSON.stringify(newData));
  };

  // ==========================================
  // GIAO DIỆN 1: KHI COLLECTION TRỐNG
  // ==========================================
  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-4 text-slate-100 bg-[#0B0F19]">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-center">
          <BookOpen size={26} className="text-slate-500" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-200 mb-1">Your reading list is empty</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Go to Search Papers and click the bookmark icon to save articles here.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // GIAO DIỆN 2: DANH SÁCH BÀI BÁO ĐÃ LƯU
  // ==========================================
  return (
    <div className="p-8 space-y-5 max-w-6xl mx-auto text-slate-100 min-h-screen bg-[#0B0F19]">
      <div className="mb-2">
        <h2 className="text-lg font-bold text-slate-100 tracking-tight">Saved Papers</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          You have {bookmarks.length} saved {bookmarks.length === 1 ? 'paper' : 'papers'} in your collection.
        </p>
      </div>

      <div className="space-y-3">
        {bookmarks.map((p, i) => {
          if (!p || !p.title) return null;

          // SỬA TẬN GỐC LỖI TO_LOCALE_STRING: Kiểm soát an toàn kiểu số trích dẫn
          const rawCitations = p.citations !== undefined && p.citations !== null ? p.citations : 0;
          const displayCitations = typeof rawCitations === 'number' ? rawCitations : parseInt(rawCitations, 10) || 0;

          // CHUẨN HÓA KHỚP TRƯỜNG DỮ LIỆU TỪ HÒM STORAGE API
          const paperAuthors = p.author || p.authors || "Unknown Author";
          const paperJournal = p.journal || "Unspecified journal";
          const paperYear = p.publishYear || p.year || "N/A";
          
          // Xác định link chuyển tiếp bài báo
          const articleUrl = p.link || (p.doi ? `https://doi.org/${p.doi}` : "#");
          const badgeColor = FIELD_DATA.find((f) => f.n === p.field)?.c || "#4F8CFF";

          return (
            <motion.div 
              key={p.id || p.title || i} 
              initial={{ opacity: 0, y: 6 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.04 }}
              className="rounded-xl border p-5 bg-transparent border-white/[0.08] hover:border-white/20 transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                
                {/* Khối nội dung thông tin (Bên trái) */}
                <div className="space-y-2 flex-1 min-w-0">
                  
                  {/* Tên tác giả */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <User size={12} className="shrink-0 text-slate-500" />
                    <span className="truncate text-slate-300">{paperAuthors}</span>
                  </div>

                  {/* Tiêu đề bài báo bọc link điều hướng */}
                  <h4 className="text-sm font-semibold text-slate-100 hover:text-blue-400 transition-colors line-clamp-2 pt-0.5">
                    <a href={articleUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {p.title}
                    </a>
                  </h4>

                  {/* Năm & Tạp chí */}
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

                  {/* Nhãn lĩnh vực & OpenAccess */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span 
                      className="text-[10px] px-2 py-0.5 rounded-md font-semibold tracking-wide uppercase"
                      style={{ backgroundColor: `${badgeColor}15`, color: badgeColor }}
                    >
                      {p.field || "General Academic"}
                    </span>
                    {p.openAccess && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-amber-500/10 text-amber-400">
                        Open Access
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Khối trích dẫn & Nút xóa (Bên phải) */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t border-white/5 md:border-t-0">
                  
                  <div className="text-left md:text-right">
                    <div className="text-base font-bold text-slate-200 tracking-tight">
                      {displayCitations.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                      Citations
                    </div>
                    {p.trend && (
                      <div className="text-[10px] font-semibold mt-0.5 text-emerald-400 font-mono">
                        {p.trend}
                      </div>
                    )}
                  </div>
                  
                  {/* Cụm nút hành động */}
                  <div className="flex items-center gap-1.5">
                    {/* Nút mở link trực tiếp */}
                    <a
                      href={articleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg border bg-white/[0.02] text-slate-400 border-white/[0.06] hover:bg-white/5 hover:text-white transition-all"
                      title="Open Article Link"
                    >
                      <ExternalLink size={14} />
                    </a>

                    {/* Nút XÓA BOOKMARK */}
                    <button 
                      type="button"
                      onClick={() => removeBookmark(p.title)}
                      className="p-2 rounded-lg border bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                      title="Remove from bookmarks"
                    >
                      <BookmarkMinus size={14} />
                    </button>
                  </div>

                </div>

              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}