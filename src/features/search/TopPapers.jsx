import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PaperItemCard } from './PaperItemCard';
import { paperAPI } from './paper.api';
import { bookmarkAPI } from '../bookmarks/api';
import { prependToCache, removeFromCache } from '../../hooks/useStaleWhileRevalidate.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Loading Skeleton
   ═══════════════════════════════════════════════════════════════════════════ */

function Skeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-[#101010] border border-[#DEDBC8]/5 rounded-2xl p-5 space-y-3 animate-pulse"
        >
          <div className="flex items-center gap-2">
            <div className="h-3 w-16 bg-[#DEDBC8]/10 rounded-full" />
            <div className="h-3 w-12 bg-[#DEDBC8]/5 rounded-full" />
          </div>
          <div className="h-4 w-3/4 bg-[#DEDBC8]/8 rounded" />
          <div className="h-3 w-full bg-[#DEDBC8]/5 rounded" />
          <div className="flex gap-2 pt-2">
            <div className="h-5 w-14 bg-[#DEDBC8]/10 rounded-full" />
            <div className="h-5 w-16 bg-[#DEDBC8]/10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function TopPapers({ keyword, sortBy = 'relevance' }) {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  // Fetch user's bookmarks to know which papers are saved
  const refreshBookmarks = useCallback(async () => {
    try {
      const response = await bookmarkAPI.getMyBookmarks();
      // Normalize every possible response shape into an array
      let items = null;
      if (Array.isArray(response)) {
        items = response;
      } else if (response && Array.isArray(response.data)) {
        items = response.data;
      } else if (response?.data && Array.isArray(response.data.data)) {
        items = response.data.data;
      } else if (response?.data?.data && Array.isArray(response.data.data.data)) {
        items = response.data.data.data;
      } else {
        // Last resort: search for any array in the first level
        if (response && typeof response === 'object') {
          for (const val of Object.values(response)) {
            if (Array.isArray(val)) { items = val; break; }
          }
        }
      }
      if (Array.isArray(items)) {
        const ids = new Set();
        items.forEach((b) => {
          const pid = b.paperId || b.paper?.paperId;
          if (pid) ids.add(pid);
        });
        setBookmarkedIds(ids);
      } else {
        console.warn('[TopPapers] Could not extract bookmark list from response:', response);
      }
    } catch (err) {
      console.error('[TopPapers] Failed to fetch bookmarks:', err);
    }
  }, []);

  useEffect(() => { refreshBookmarks(); }, [refreshBookmarks]);

  const handleToggleBookmark = useCallback(async (paper) => {
    const paperId = paper.paperId;
    if (!paperId) return;

    const wasBookmarked = bookmarkedIds.has(paperId);

    // Optimistic update — toggle instantly for smooth UX
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (wasBookmarked) next.delete(paperId);
      else next.add(paperId);
      return next;
    });

    try {
      if (wasBookmarked) {
        await bookmarkAPI.removeBookmarkByPaper(paperId);
        // Optimistic: remove from cached bookmarks list
        removeFromCache('bookmarks-list', (item) => item.paperId === paperId);
        toast.success('Removed from bookmarks');
      } else {
        const res = await bookmarkAPI.addBookmark(paperId);
        const bm = res?.data?.data || res?.data || res;
        // Optimistic: add to cached bookmarks list so it shows instantly
        prependToCache('bookmarks-list', {
          bookmarkId: bm?.bookmarkId || `temp-${paperId}`,
          paperId,
          paperTitle: paper.title || 'Untitled',
          keywordId: null,
          keywordText: null,
          collectionId: null,
          collectionName: null,
          notes: null,
          createdAt: new Date().toISOString(),
        });
        toast.success('Saved to bookmarks');
      }
    } catch (err) {
      // 409 = already bookmarked → state is already correct, ignore
      if (err?.response?.status !== 409) {
        // Revert on real error
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          if (wasBookmarked) next.add(paperId);
          else next.delete(paperId);
          return next;
        });
        toast.error(err?.response?.data?.message || err?.message || 'Failed');
      }
    }
  }, [bookmarkedIds]);

  useEffect(() => {
    if (!keyword || !keyword.trim()) {
      setPapers([]);
      setError(null);
      return;
    }

    let cancelled = false;

    async function fetchPapers() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await paperAPI.getTopPapers(keyword.trim());
        if (!cancelled) {
          setPapers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Top papers fetch error:', err);
          setError(err?.message || 'Failed to load top papers');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    const timer = setTimeout(fetchPapers, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [keyword]);

  // Client-side sorting based on sortBy prop
  const sortedPapers = useMemo(() => {
    if (!papers.length) return [];
    const sorted = [...papers];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => (b.pubYear || b.year || 0) - (a.pubYear || a.year || 0));
      case 'oldest':
        return sorted.sort((a, b) => (a.pubYear || a.year || 0) - (b.pubYear || b.year || 0));
      case 'leastCited':
        return sorted.sort((a, b) => (a.citationCount ?? 0) - (b.citationCount ?? 0));
      case 'mostCited':
        return sorted.sort((a, b) => (b.citationCount ?? 0) - (a.citationCount ?? 0));
      case 'titleAZ':
        return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'titleZA':
        return sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
      case 'relevance':
      default:
        return sorted.sort((a, b) => (b.citationCount ?? 0) - (a.citationCount ?? 0));
    }
  }, [papers, sortBy]);

  if (!keyword || !keyword.trim()) return null;
  if (isLoading) return <Skeleton />;

  if (error) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[11px] text-amber-400/70">
        <AlertCircle size={13} className="shrink-0" />
        <span>Top papers unavailable.</span>
      </div>
    );
  }

  if (!papers.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Star size={13} className="text-[#DEDBC8]/40" />
        <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500">
          Top Cited Papers
        </span>
        <span className="text-[10px] text-gray-500 ml-auto">
          Most influential papers for this topic
        </span>
      </div>

      {/* Paper cards */}
      <div className="grid grid-cols-1 gap-4">
        {sortedPapers.map((paper, i) => (
          <motion.div
            key={paper.paperId || i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <PaperItemCard
              paper={paper}
              index={i}
              badgeColor="#F59E0B"
              isSaved={bookmarkedIds.has(paper.paperId)}
              onToggleBookmark={handleToggleBookmark}
              onClick={(p) => {
                const role = sessionStorage.getItem('userRole') || 'researcher';
                sessionStorage.setItem('scitrack_referrer', window.location.pathname);
                navigate(`/${role}/papers/${p.paperId}`);
              }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
