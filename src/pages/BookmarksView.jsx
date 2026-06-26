import * as React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { BookmarkMinus, BookOpen } from 'lucide-react';
import { FIELD_DATA } from '../constants/mockData';

const GlowBadge = ({ color, children }) => (
 <span
 className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border "
 style={{ background: `${color}15`, color: color, borderColor: `${color}30` }}
 >
 {children}
 </span>
);

export default function BookmarksView() {
 const { t } = useTranslation('dashboard');
 const [bookmarks, setBookmarks] = useState([]);

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

 if (bookmarks.length === 0) {
 return (
  <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center space-y-4 bg-transparent">
  <div className="w-16 h-16 rounded-2xl bg-[#101010] border border-[#DEDBC8]/10 flex items-center justify-center ">
   <BookOpen size={28} className="text-gray-400 text-gray-500" />
  </div>
  <div>
   <h3 className="text-lg font-bold text-[#E1E0CC] mb-1">{t('headings.bookmarks')}</h3>
   <p className="text-sm text-gray-500 text-gray-400">{t('subtitles.bookmarks')}</p>
  </div>
  </div>
 );
 }

 return (
 <div className="p-8 space-y-6 min-h-screen bg-transparent">
  <div className="flex items-center justify-between mb-2">
  <div>
   <h2 className="text-lg font-bold text-[#E1E0CC]">{t('headings.bookmarks')}</h2>
   <p className="text-sm text-gray-400">
   {bookmarks.length} {bookmarks.length === 1 ? 'paper' : 'papers'}
   </p>
  </div>
  </div>

  <div className="space-y-3">
  <AnimatePresence>
   {bookmarks.map((p, i) => (
   <motion.div
    key={p.title || i}
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ delay: i * 0.05 }}
    className="rounded-xl border p-5 bg-[#101010] border-[#DEDBC8]/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors "
   >
    <div className="flex items-start justify-between gap-4">
    <div className="flex-1">
     <div className="flex items-center gap-2 mb-2">
     <GlowBadge color={FIELD_DATA.find((f) => f.n === p.field)?.c ?? '#DEDBC8'}>{p.field}</GlowBadge>
     <span className="text-xs text-gray-500 text-gray-400">{p.year}</span>
     </div>
     <h4 className="text-sm font-bold text-[#E1E0CC] mb-1">{p.title}</h4>
     <p className="text-xs text-gray-500 text-gray-400">{p.authors}</p>
    </div>

    <div className="flex items-center gap-6 shrink-0">
     <div className="text-right">
     <div className="text-xl font-bold text-[#E1E0CC]">{p.citations?.toLocaleString() || 0}</div>
     <div className="text-xs text-gray-500 text-gray-400">{t('user.totalCitations')}</div>
     <div className="text-xs font-semibold mt-1 text-emerald-600 dark:text-[#A09878]">{p.trend}</div>
     </div>

     <button
     onClick={() => removeBookmark(p.title)}
     className="p-2.5 rounded-lg border bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-all group "
     title="Remove from bookmarks"
     >
     <BookmarkMinus size={18} />
     </button>
    </div>
    </div>
   </motion.div>
   ))}
  </AnimatePresence>
  </div>
 </div>
 );
}
