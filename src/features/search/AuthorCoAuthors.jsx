import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, ExternalLink, AlertCircle, ArrowRight } from 'lucide-react';
import { authorAPI } from './author.api';

/* ═══════════════════════════════════════════════════════════════════════════
   Loading Skeleton
   ═══════════════════════════════════════════════════════════════════════════ */

function CoAuthorsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-3 w-40 bg-[#DEDBC8]/8 rounded" />
        <div className="h-3 w-24 bg-[#DEDBC8]/5 rounded" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-[#DEDBC8]/5 bg-[#101010] animate-pulse">
            <div className="w-7 h-7 rounded-full bg-[#DEDBC8]/8 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-32 bg-[#DEDBC8]/8 rounded" />
              <div className="h-2 w-48 bg-[#DEDBC8]/5 rounded" />
            </div>
            <div className="h-4 w-12 bg-[#DEDBC8]/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function AuthorCoAuthors({ keyword, onAuthorClick }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!keyword || !keyword.trim()) {
      setData(null);
      setError(null);
      return;
    }

    let cancelled = false;

    async function fetchCoAuthors() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await authorAPI.coAuthors(keyword.trim());
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          console.error('Co-authors fetch error:', err);
          setError(err?.message || 'Failed to load co-authors');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    const timer = setTimeout(fetchCoAuthors, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [keyword]);

  /* ─── Nothing to show ─── */
  if (!keyword || !keyword.trim()) return null;

  /* ─── Loading ─── */
  if (isLoading) return <CoAuthorsSkeleton />;

  /* ─── Error ─── */
  if (error) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[11px] text-amber-400/70">
        <AlertCircle size={13} className="shrink-0" />
        <span>Co-authors data unavailable. {error}</span>
      </div>
    );
  }

  /* ─── Empty ─── */
  if (!data || !data.coAuthors || data.coAuthors.length === 0) return null;

  const maxCollab = Math.max(...data.coAuthors.map((c) => c.collaborationCount || 0), 1);

  /* ─── Render ─── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5"
    >
      {/* Section label */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-[#DEDBC8]/20" />
        <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500">
          Co-authors
          <span className="text-[#DEDBC8]/60 ml-1.5 font-normal normal-case">
            — analyzed {data.totalPapersAnalyzed ?? '?'} papers, {data.totalCoAuthors ?? '?'} unique co-authors
          </span>
        </span>
      </div>

      {/* Summary strip */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#DEDBC8]/3 border border-[#DEDBC8]/5 text-[11px] text-gray-400">
        <Users size={12} className="text-[#4F8CFF]" />
        <span>Top {data.coAuthors.length} most frequent collaborators</span>
        {onAuthorClick && (
          <span className="text-[#DEDBC8]/30 ml-auto text-[10px]">Click to explore →</span>
        )}
      </div>

      {/* Co-author list */}
      <div className="space-y-1.5">
        {data.coAuthors.map((author, i) => {
          const widthPct = maxCollab > 0 ? ((author.collaborationCount || 0) / maxCollab) * 100 : 0;

          return (
            <motion.button
              key={author.openAlexId || i}
              type="button"
              onClick={() => onAuthorClick?.(author.name)}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.04, duration: 0.3 }}
              whileHover={onAuthorClick ? { y: -2, borderColor: 'rgba(79,140,255,0.25)' } : {}}
              whileTap={onAuthorClick ? { scale: 0.98 } : {}}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#DEDBC8]/5 bg-[#101010] group hover:border-[#DEDBC8]/10 transition-all text-left cursor-pointer"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-[#E1E0CC] bg-[#DEDBC8]/10 shrink-0 group-hover:bg-[#4F8CFF]/15 group-hover:text-[#4F8CFF] transition-colors">
                {author.name
                  ? author.name
                      .split(' ')
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : '??'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-[#E1E0CC] truncate group-hover:text-[#4F8CFF] transition-colors">
                    {author.name}
                  </span>
                  {onAuthorClick && (
                    <ArrowRight size={11} className="shrink-0 text-gray-600 group-hover:text-[#4F8CFF] transition-colors opacity-0 group-hover:opacity-100" />
                  )}
                  {author.openAlexId && (
                    <a
                      href={author.openAlexId}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 text-gray-500 hover:text-[#4F8CFF] transition-colors"
                      title="Open in OpenAlex"
                    >
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
                {author.lastInstitution && (
                  <div className="text-[10px] text-gray-500 truncate mt-0.5">
                    {author.lastInstitution}
                  </div>
                )}
              </div>

              {/* Collaboration bar */}
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <div className="w-20 h-5 bg-[#DEDBC8]/3 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPct}%` }}
                    transition={{ delay: 0.2 + i * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full group-hover:opacity-80"
                    style={{
                      background: `linear-gradient(90deg, #4F8CFF40, #4F8CFF)`,
                    }}
                  />
                </div>
                <span className="w-8 text-right text-[11px] font-mono font-semibold text-[#E1E0CC]">
                  {author.collaborationCount}
                </span>
              </div>

              {/* Mobile: just the count */}
              <span className="sm:hidden text-[11px] font-mono font-semibold text-[#E1E0CC] shrink-0">
                {author.collaborationCount}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
