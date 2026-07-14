import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, AlertCircle, Lock, X } from 'lucide-react';
import { toast } from 'sonner';
import { PaperItemCard } from './PaperItemCard';
import { paperAPI } from './paper.api';
import { bookmarkAPI } from '../bookmarks/api';
import {
  prependToCache,
  removeFromCache,
} from '../../hooks/useStaleWhileRevalidate.js';

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

export default function TopPapers({
  keyword,
  sortBy = 'relevance',
  filters = {},
  fetchPapers: customFetchPapers,
}) {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  // Academic restriction
  const role = sessionStorage.getItem('userRole') || 'researcher';
  const isAcademic = role === 'academic_user' || role === 'academic';
  const [upgradeOpen, setUpgradeOpen] = useState(false);

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
      } else if (
        response?.data?.data &&
        Array.isArray(response.data.data.data)
      ) {
        items = response.data.data.data;
      } else {
        // Last resort: search for any array in the first level
        if (response && typeof response === 'object') {
          for (const val of Object.values(response)) {
            if (Array.isArray(val)) {
              items = val;
              break;
            }
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
        console.warn(
          '[TopPapers] Could not extract bookmark list from response:',
          response,
        );
      }
    } catch (err) {
      console.error('[TopPapers] Failed to fetch bookmarks:', err);
    }
  }, []);

  useEffect(() => {
    refreshBookmarks();
  }, [refreshBookmarks]);

  const handleToggleBookmark = useCallback(
    async (paper) => {
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
          window.dispatchEvent(new CustomEvent('bookmark-changed'));
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
          window.dispatchEvent(new CustomEvent('bookmark-changed'));
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
    },
    [bookmarkedIds],
  );

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
        const filterParams = {
          startYear: filters.startYear || filters.pubYearFrom || undefined,
          endYear: filters.endYear || filters.pubYearTo || undefined,
        };
        const data = await (customFetchPapers
          ? customFetchPapers(keyword.trim(), filterParams)
          : paperAPI.getTopPapers(keyword.trim(), filterParams));
        if (!cancelled) {
          setPapers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Papers fetch error:', err);
          setError(err?.message || 'Failed to load papers');
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
  }, [keyword, filters.startYear, filters.endYear, filters.pubYearFrom, filters.pubYearTo]);

  // Client-side sorting + year filtering based on sortBy and filters props
  const sortedPapers = useMemo(() => {
    if (!papers.length) return [];
    let filtered = [...papers];
    // Client-side year filter fallback (in case BE doesn't filter)
    if (filters.startYear) {
      const start = parseInt(filters.startYear, 10);
      if (!isNaN(start)) {
        filtered = filtered.filter((p) => (p.pubYear || p.year || 0) >= start);
      }
    }
    if (filters.endYear) {
      const end = parseInt(filters.endYear, 10);
      if (!isNaN(end)) {
        filtered = filtered.filter((p) => (p.pubYear || p.year || 0) <= end);
      }
    }
    switch (sortBy) {
      case 'newest':
        return filtered.sort(
          (a, b) => (b.pubYear || b.year || 0) - (a.pubYear || a.year || 0),
        );
      case 'oldest':
        return filtered.sort(
          (a, b) => (a.pubYear || a.year || 0) - (b.pubYear || b.year || 0),
        );
      case 'leastCited':
        return filtered.sort(
          (a, b) => (a.citationCount ?? 0) - (b.citationCount ?? 0),
        );
      case 'mostCited':
        return filtered.sort(
          (a, b) => (b.citationCount ?? 0) - (a.citationCount ?? 0),
        );
      case 'titleAZ':
        return filtered.sort((a, b) =>
          (a.title || '').localeCompare(b.title || ''),
        );
      case 'titleZA':
        return filtered.sort((a, b) =>
          (b.title || '').localeCompare(a.title || ''),
        );
      case 'relevance':
      default:
        return filtered.sort(
          (a, b) => (b.citationCount ?? 0) - (a.citationCount ?? 0),
        );
    }
  }, [papers, sortBy, filters.startYear, filters.endYear]);

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
      <div className="grid grid-cols-1 gap-6">
        {sortedPapers.map((paper, i) => (
          <motion.div
            key={paper.paperId || i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.25 + i * 0.06,
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <PaperItemCard
              paper={paper}
              index={i}
              badgeColor="#F59E0B"
              isLocked={isAcademic}
              onClick={(p) => {
                if (isAcademic) {
                  setUpgradeOpen(true);
                  return;
                }
                sessionStorage.setItem(
                  'scitrack_referrer',
                  window.location.pathname,
                );
                navigate(`/${role}/papers/${p.paperId}`);
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Upgrade to Researcher — High-end modal */}
      <AnimatePresence>
        {upgradeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
            onClick={() => setUpgradeOpen(false)}
          >
            {/* ── Modal Card ── */}
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 24 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-2xl border border-[#DEDBC8]/10 bg-[#151922] p-7 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]"
            >
              {/* Close button */}
              <button
                onClick={() => setUpgradeOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-[#DEDBC8]/5 text-gray-500 hover:bg-[#DEDBC8]/10 hover:text-[#E1E0CC] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              >
                <X size={14} />
              </button>

              <div className="text-center space-y-6">
                {/* Icon — clean flat accent */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.1,
                    duration: 0.5,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                  className="mx-auto w-14 h-14 rounded-2xl bg-[#DEDBC8]/[0.06] border border-[#DEDBC8]/10 flex items-center justify-center"
                >
                  <Lock size={22} className="text-[#DEDBC8]" />
                </motion.div>

                {/* Title + subtitle */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.15,
                    duration: 0.5,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                  className="space-y-2"
                >
                  <h3 className="text-xl font-black text-[#E1E0CC] font-display tracking-[-0.02em]">
                    Upgrade to Researcher
                  </h3>
                  <p className="text-[13px] text-gray-400 leading-relaxed max-w-[260px] mx-auto">
                    Unlock full paper details, AI summaries, citation exports,
                    and unlimited searches.
                  </p>
                </motion.div>

                {/* Feature list — staggered entry */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.2,
                    duration: 0.5,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                  className="rounded-xl bg-[#0F0F0F] border border-[#DEDBC8]/5 p-4 space-y-0"
                >
                  {[
                    'Full abstract & paper details',
                    'AI-powered paper summaries',
                    'Similar paper recommendations',
                    'Citation export (BibTeX, RIS, APA)',
                    'Unlimited searches & bookmarks',
                  ].map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.25 + i * 0.06,
                        duration: 0.4,
                        ease: [0.32, 0.72, 0, 1],
                      }}
                      className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0 border-b border-[#DEDBC8]/5 last:border-0"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#DEDBC8]/50 shrink-0" />
                      <span className="text-xs text-gray-300">{f}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Price */}
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.55,
                    duration: 0.4,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                  className="text-center"
                >
                  <span className="text-3xl font-black text-[#E1E0CC] font-display tracking-[-0.03em]">
                    $999
                  </span>
                  <span className="text-sm text-gray-500 ml-1">/year</span>
                </motion.div>

                {/* CTA — Button-in-Button pattern, no gradient */}
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.6,
                    duration: 0.5,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                  onClick={() => {
                    setUpgradeOpen(false);
                    navigate(`/${role}/settings`);
                  }}
                  className="group w-full flex items-center justify-between gap-3 px-5 py-3.5 rounded-full text-sm font-bold text-[#0B1020] bg-[#DEDBC8] hover:bg-[#E1E0CC] shadow-[0_4px_24px_-6px_rgba(222,219,200,0.15)] active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                >
                  <span className="flex-1 text-center pl-6">
                    Upgrade Now — $999/year
                  </span>
                  {/* Nested icon pill */}
                  <span className="w-8 h-8 rounded-full bg-[#0B1020]/10 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-[1px] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#0B1020]"
                    >
                      <path d="M7 17l9.2-9.2M17 17V7H7" />
                    </svg>
                  </span>
                </motion.button>

                {/* Secondary action */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    delay: 0.7,
                    duration: 0.4,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                  onClick={() => setUpgradeOpen(false)}
                  className="w-full text-xs text-gray-500 hover:text-gray-400 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                >
                  Maybe later
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
