import * as React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { BookmarkMinus, BookOpen, Loader2, AlertTriangle } from 'lucide-react';
import { bookmarkAPI } from '../lib/api/bookmark.api';

const GlowBadge = ({ color, children }) => (
  <span
    className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm dark:shadow-none"
    style={{
      background: `${color}15`,
      color: color,
      borderColor: `${color}30`,
    }}
  >
    {children}
  </span>
);

export default function BookmarksView() {
  const { t } = useTranslation('dashboard');
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const fetchBookmarks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await bookmarkAPI.getBookmarks();
      const list = Array.isArray(data) ? data : data?.bookmarks || data?.list || [];
      setBookmarks(list);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
      if (err.response && err.response.status === 401) {
        setError(
          'Phiên làm việc đã hết hạn hoặc Token không hợp lệ. Bạn hãy bấm Sign Out rồi đăng nhập lại nhé!',
        );
      } else {
        setError('Unable to load bookmarks. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const removeBookmark = async (bookmarkId) => {
    setRemovingId(bookmarkId);
    try {
      await bookmarkAPI.deleteBookmark(bookmarkId);
      setBookmarks((prev) => prev.filter((b) => b.bookmarkId !== bookmarkId));
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    } finally {
      setRemovingId(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center space-y-4 transition-colors duration-300 bg-gray-50 dark:bg-[#0B1020]">
        <Loader2 size={32} className="text-blue-500 animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading bookmarks...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center space-y-4 transition-colors duration-300 bg-gray-50 dark:bg-[#0B1020]">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">
            Error
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            {error}
          </p>
        </div>
        <button
          type="button"
          onClick={fetchBookmarks}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center space-y-4 transition-colors duration-300 bg-gray-50 dark:bg-[#0B1020]">
        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#1B2235] border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm dark:shadow-none">
          <BookOpen size={28} className="text-gray-400 dark:text-gray-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {t('headings.bookmarks')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('subtitles.bookmarks')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0B1020]">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('headings.bookmarks')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-[#A0AEC0]">
            {bookmarks.length} {bookmarks.length === 1 ? 'paper' : 'papers'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {bookmarks.map((b, i) => (
            <motion.div
              key={b.bookmarkId || i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border p-5 bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors shadow-sm dark:shadow-none"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {b.keywordText && (
                      <GlowBadge color="#4F8CFF">
                        {b.keywordText}
                      </GlowBadge>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {b.createdAt
                        ? new Date(b.createdAt).toLocaleDateString()
                        : ''}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                    {b.paperTitle || 'Untitled Paper'}
                  </h4>
                  {b.notes && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1.5 line-clamp-2">
                      "{b.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <button
                    onClick={() => removeBookmark(b.bookmarkId)}
                    disabled={removingId === b.bookmarkId}
                    className="p-2.5 rounded-lg border bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-all group shadow-sm dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove from bookmarks"
                  >
                    {removingId === b.bookmarkId ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <BookmarkMinus size={18} />
                    )}
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
