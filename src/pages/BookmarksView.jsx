import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookmarkMinus, BookOpen } from 'lucide-react';
import { FIELD_DATA } from '../constants/mockData';

// Component Badge (tái sử dụng cho đồng bộ với trang Search)
const GlowBadge = ({ color, children }) => (
  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border" style={{ background: `${color}10`, color: color, borderColor: `${color}25` }}>
    {children}
  </span>
);

export default function BookmarksView() {
  const [bookmarks, setBookmarks] = useState([]);

  // LẤY ROLE HIỆN TẠI RA ĐỂ ĐỌC ĐÚNG HÒM
  const currentRole = sessionStorage.getItem('userRole') || 'academic';
  const storageKey = `scitrack_bookmarks_${currentRole}`;

  useEffect(() => {
    const localData = sessionStorage.getItem(storageKey); // Đổi thành storageKey
    if (localData) {
      setBookmarks(JSON.parse(localData));
    } else {
      setBookmarks([]);
    }
  }, [storageKey]);

  const removeBookmark = (titleToRemove) => {
    const newData = bookmarks.filter(p => p.title !== titleToRemove);
    setBookmarks(newData);
    sessionStorage.setItem(storageKey, JSON.stringify(newData)); // Đổi thành storageKey
  };

  // ==========================================
  // GIAO DIỆN 1: KHI CHƯA CÓ BÀI NÀO ĐƯỢC LƯU
  // ==========================================
  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#1B2235] border border-white/10 flex items-center justify-center">
          <BookOpen size={28} className="text-gray-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Your reading list is empty</h3>
          <p className="text-sm text-gray-400">Go to Search Papers and click the bookmark icon to save articles here.</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // GIAO DIỆN 2: KHI ĐÃ CÓ BÀI LƯU
  // ==========================================
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-bold text-white">Saved Papers</h2>
          <p className="text-sm" style={{ color: '#A0AEC0' }}>
            You have {bookmarks.length} saved {bookmarks.length === 1 ? 'paper' : 'papers'} in your collection.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {bookmarks.map((p, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border p-5 bg-[#1B2235] border-white/10 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <GlowBadge color={FIELD_DATA.find((f) => f.n === p.field)?.c ?? '#4F8CFF'}>{p.field}</GlowBadge>
                  <span className="text-xs text-gray-500 font-mono">{p.year}</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{p.title}</h4>
                <p className="text-xs text-gray-400">{p.authors}</p>
              </div>
              
              <div className="flex items-center gap-6 shrink-0">
                <div className="text-right">
                  <div className="text-xl font-black text-white">{p.citations.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">citations</div>
                  <div className="text-xs font-semibold mt-1 text-[#00D1B2] font-mono">{p.trend}</div>
                </div>
                
                {/* NÚT XÓA BOOKMARK (Màu đỏ) */}
                <button 
                  onClick={() => removeBookmark(p.title)}
                  className="p-2.5 rounded-lg border bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all group"
                  title="Remove from bookmarks"
                >
                  <BookmarkMinus size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}