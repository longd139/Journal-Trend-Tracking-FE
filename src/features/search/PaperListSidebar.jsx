import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, ExternalLink, FileText, Quote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { paperAPI } from './paper.api';

/**
 * Slide-out sidebar showing all papers for a keyword.
 * Triggered by clicking "Total Papers" in KeywordQuickStats.
 */
export default function PaperListSidebar({ keyword, open, onClose }) {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const role = sessionStorage.getItem('userRole') || 'researcher';

  useEffect(() => {
    if (!open || !keyword) return;
    let cancelled = false;
    setPage(0);

    async function fetchPapers() {
      setLoading(true);
      setError(null);
      try {
        const result = await paperAPI.searchPapers({
          query: keyword,
          page: 0,
          size: 50,
          sortBy: 'citations',
        });
        if (!cancelled) {
          const list = result?.papers || result?.data?.papers || [];
          setPapers(list);
          setTotal(result?.totalElements || result?.data?.totalElements || list.length);
          setHasMore((result?.totalPages || result?.data?.totalPages || 0) > 1);
          setPage(0);
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Failed to load papers');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPapers();
    return () => { cancelled = true; };
  }, [open, keyword]);

  const loadMore = async () => {
    const nextPage = page + 1;
    setLoading(true);
    try {
      const result = await paperAPI.searchPapers({
        query: keyword,
        page: nextPage,
        size: 50,
        sortBy: 'citations',
      });
      const list = result?.papers || result?.data?.papers || [];
      setPapers((prev) => [...prev, ...list]);
      setPage(nextPage);
      setHasMore((result?.totalPages || result?.data?.totalPages || 0) > nextPage + 1);
    } catch (err) {
      console.error('Load more failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-[420px] max-w-[90vw] bg-[#0B1020] border-l border-[#DEDBC8]/10 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#DEDBC8]/5 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-[#E1E0CC] flex items-center gap-2">
                  <FileText size={14} className="text-[#4F8CFF]" />
                  Papers for "{keyword}"
                </h3>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {total > 0 ? `${papers.length} of ${total} papers` : ''}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-[#DEDBC8]" />
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="px-4 py-3 rounded-lg bg-red-500/5 border border-red-500/10 text-xs text-red-400">
                  {error}
                </div>
              )}

              {/* Paper list */}
              {!loading && !error && papers.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-12">
                  No papers found for this keyword.
                </p>
              )}

              {!loading &&
                papers.map((paper, i) => (
                  <motion.div
                    key={paper.paperId || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="p-3 rounded-lg bg-[#101010] border border-[#DEDBC8]/5 hover:border-[#DEDBC8]/15 transition-colors group cursor-pointer"
                    onClick={() => {
                      navigate(`/${role}/papers/${paper.paperId}`);
                      onClose();
                    }}
                  >
                    <p className="text-xs font-medium text-[#E1E0CC] leading-snug group-hover:text-white transition-colors line-clamp-2">
                      {paper.title}
                    </p>

                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500">
                      {/* Authors */}
                      {paper.authors && paper.authors.length > 0 && (
                        <span className="truncate max-w-[200px]">
                          {paper.authors.slice(0, 3).map((a) => a.fullName || a.name).join(', ')}
                          {paper.authors.length > 3 && ' et al.'}
                        </span>
                      )}

                      {/* Year */}
                      {paper.pubYear && (
                        <span className="shrink-0">{paper.pubYear}</span>
                      )}

                      {/* Citations */}
                      {paper.citationCount != null && (
                        <span className="flex items-center gap-0.5 shrink-0">
                          <Quote size={9} />
                          {paper.citationCount}
                        </span>
                      )}
                    </div>

                    {/* Journal */}
                    {paper.journalName && (
                      <p className="text-[10px] text-gray-600 mt-0.5 truncate">
                        {paper.journalName}
                      </p>
                    )}
                  </motion.div>
                ))}
            </div>

            {/* Load more */}
            {hasMore && !loading && (
              <div className="flex justify-center pt-2 pb-1">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#DEDBC8] bg-[#DEDBC8]/5 hover:bg-[#DEDBC8]/10 border border-[#DEDBC8]/10 transition-all"
                >
                  {loading ? 'Loading...' : `Load more (${total - papers.length} remaining)`}
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[#DEDBC8]/5 shrink-0">
              <p className="text-[10px] text-gray-600 text-center">
                Click a paper to view details
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
