import { useState, useEffect } from 'react'; // ---> Thêm useEffect
import { Search, X, Bookmark } from 'lucide-react'; // ---> Thêm icon Bookmark
import { motion } from 'framer-motion';

// ==========================================
// 1. COMPONENT
// ==========================================
const GlowBadge = ({ color, children }) => (
  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border" style={{ background: `${color}10`, color: color, borderColor: `${color}25`, textShadow: `0 0 10px ${color}40` }}>
    {children}
  </span>
);

// ==========================================
// 2. DỮ LIỆU GIẢ 
// ==========================================
const FIELD_DATA = [
  { n: 'AI & ML', v: 45, c: '#4F8CFF' },
  { n: 'Biotech', v: 30, c: '#8B5CF6' },
  { n: 'Climate', v: 25, c: '#00D1B2' }
];

const PAPERS = [
  { title: 'Attention Is All You Need', authors: 'Vaswani et al.', year: 2017, citations: 85432, field: 'AI & ML', trend: 'Super Hot' },
  { title: 'Deep Residual Learning for Image Recognition', authors: 'He et al.', year: 2016, citations: 124500, field: 'AI & ML', trend: 'Stable' },
  { title: 'CRISPR-Cas9 Structures and Mechanisms', authors: 'Jiang et al.', year: 2017, citations: 4500, field: 'Biotech', trend: 'Rising' },
];

// ==========================================
// 3. GIAO DIỆN CHÍNH
// ==========================================
export default function SearchPapers() {
  const [query, setQuery] = useState('');
  const [savedBookmarks, setSavedBookmarks] = useState([]);

  // LẤY ROLE HIỆN TẠI RA ĐỂ LÀM CÁI TÊN KEY RIÊNG
  const currentRole = sessionStorage.getItem('userRole') || 'academic';
  const storageKey = `scitrack_bookmarks_${currentRole}`; // Tạo key riêng: scitrack_bookmarks_academic...

  // Lấy dữ liệu theo Key riêng
  useEffect(() => {
    const localData = sessionStorage.getItem(storageKey); // Đổi thành storageKey
    if (localData) {
      setSavedBookmarks(JSON.parse(localData));
    } else {
      setSavedBookmarks([]); // Nếu đổi account thì reset lại state tránh bị lưu vết cũ
    }
  }, [storageKey]); // Thêm storageKey vào đây để khi đổi role nó tự chạy lại

  // Hàm xử lý lưu
  const toggleBookmark = (paper) => {
    setSavedBookmarks((prev) => {
      const isAlreadySaved = prev.some((p) => p.title === paper.title);
      let newData;
      if (isAlreadySaved) {
        newData = prev.filter((p) => p.title !== paper.title);
      } else {
        newData = [...prev, paper];
      }
      sessionStorage.setItem(storageKey, JSON.stringify(newData)); // Đổi thành storageKey
      return newData;
    });
  };
  // ---> KẾT THÚC PHẦN THÊM MỚI CHO BOOKMARK

  const filtered = PAPERS.filter(
    (p) =>
      !query ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.authors.toLowerCase().includes(query.toLowerCase()) ||
      p.field.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-5 p-8">
      {/* Ô Tìm kiếm */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2"
          style={{ color: '#A0AEC0' }}
        />
        <input
          type="text"
          placeholder="Search papers by title, author, or field…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm outline-none transition-colors"
          style={{
            background: '#1B2235',
            borderColor: 'rgba(255,255,255,0.09)',
            color: '#E2E8F0',
          }}
        />
      </div>

      {/* Các nút Lọc (Filter) */}
      <div className="flex gap-2 flex-wrap">
        {FIELD_DATA.map((f) => (
          <button
            key={f.n}
            onClick={() => setQuery(f.n)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
            style={{
              background: `${f.c}1A`,
              color: f.c,
              border: `1px solid ${f.c}44`,
            }}
          >
            {f.n}
          </button>
        ))}
        {query && (
          <button
            onClick={() => setQuery('')}
            className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 hover:bg-white/10 transition-colors"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: '#A0AEC0',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <X size={10} /> Clear
          </button>
        )}
      </div>

      {/* Đếm số lượng kết quả */}
      <p className="text-xs" style={{ color: '#6B7280' }}>
        {filtered.length} result{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Danh sách kết quả */}
      <div className="space-y-3">
        {filtered.map((p, i) => {
          // ---> Kiểm tra xem bài này đã có trong danh sách lưu chưa
          const isSaved = savedBookmarks.some(saved => saved.title === p.title);

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 4 }}
              className="rounded-xl border p-5 cursor-default"
              style={{
                background: '#1B2235',
                borderColor: 'rgba(255,255,255,0.07)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <GlowBadge
                      color={
                        FIELD_DATA.find((f) => f.n === p.field)?.c ?? '#4F8CFF'
                      }
                    >
                      {p.field}
                    </GlowBadge>
                    <span
                      className="text-xs"
                      style={{
                        color: '#6B7280',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {p.year}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{p.title}</h4>
                  <p className="text-xs" style={{ color: '#A0AEC0' }}>
                    {p.authors}
                  </p>
                </div>
                
                {/* ---> GOM CHUNG CHỖ NÀY ĐỂ THÊM NÚT BOOKMARK KẾ BÊN CITATION */}
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <div
                      className="text-xl font-black text-white"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {p.citations.toLocaleString()}
                    </div>
                    <div className="text-xs" style={{ color: '#6B7280' }}>
                      citations
                    </div>
                    <div
                      className="text-xs font-semibold mt-1"
                      style={{
                        color: '#00D1B2',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {p.trend}
                    </div>
                  </div>

                  {/* NÚT BOOKMARK TÍCH HỢP */}
                  <button 
                    onClick={() => toggleBookmark(p)}
                    className="p-2.5 rounded-lg border transition-all hover:scale-110"
                    style={{
                      background: isSaved ? 'rgba(79, 140, 255, 0.1)' : 'rgba(255,255,255,0.02)',
                      borderColor: isSaved ? '#4F8CFF' : 'rgba(255,255,255,0.1)',
                      color: isSaved ? '#4F8CFF' : '#A0AEC0'
                    }}
                  >
                    <Bookmark size={18} fill={isSaved ? '#4F8CFF' : 'none'} />
                  </button>
                </div>
                {/* ---> KẾT THÚC CHỖ GOM */}

              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}