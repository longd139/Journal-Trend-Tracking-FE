import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { authorAPI } from './author.api';

/* ═══════════════════════════════════════════════════════════════════════════
   Field color palette
   ═══════════════════════════════════════════════════════════════════════════ */

const FIELD_COLORS = {
  'Computer Science': '#4F8CFF',
  'AI': '#4F8CFF',
  'Engineering': '#34D399',
  'Medicine': '#F472B6',
  'Biology': '#34D399',
  'Physics': '#A78BFA',
  'Chemistry': '#FB923C',
  'Mathematics': '#60A5FA',
  'Economics': '#F59E0B',
  'Psychology': '#C084FC',
  'Environmental': '#60A5FA',
  'Biochemistry': '#F472B6',
  'Genetics': '#F472B6',
  'Materials': '#FB923C',
  'default': '#DEDBC8',
};

function getFieldColor(field) {
  if (!field) return FIELD_COLORS.default;
  for (const [key, color] of Object.entries(FIELD_COLORS)) {
    if (field.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return FIELD_COLORS.default;
}

function formatNumber(n) {
  if (n == null) return '—';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/* ═══════════════════════════════════════════════════════════════════════════
   Loading Skeleton
   ═══════════════════════════════════════════════════════════════════════════ */

function Skeleton() {
  return (
    <div className="flex flex-wrap gap-2 animate-pulse">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="px-4 py-3 rounded-xl bg-[#DEDBC8]/5 border border-[#DEDBC8]/5 w-44 h-16"
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function AuthorSuggestions({ onAuthorClick }) {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSuggested() {
      setLoading(true);
      setError(null);
      try {
        const data = await authorAPI.getSuggested();
        if (!cancelled && Array.isArray(data)) {
          setAuthors(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load suggested authors:', err);
          setError(err?.message || 'Failed to load suggestions');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSuggested();
    return () => { cancelled = true; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <Sparkles size={14} className="text-[#DEDBC8]/50" />
        <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500">
          Suggested Authors
        </span>
      </div>

      {/* Subtitle */}
      <p className="text-[12px] text-gray-500 leading-relaxed">
        Click a name below to instantly explore an author's academic profile, publication timeline,
        research focus, and collaboration network.
      </p>

      {/* Loading */}
      {loading && <Skeleton />}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/10 text-[11px] text-red-400/70">
          <AlertCircle size={13} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Author cards */}
      {!loading && !error && authors.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="flex flex-wrap gap-2.5"
        >
          {authors.map((author, i) => {
            const fieldColor = getFieldColor(author.topField);
            return (
              <motion.button
                key={author.authorId || i}
                type="button"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 + i * 0.03 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAuthorClick?.(author.fullName)}
                className="group relative px-4 py-3 rounded-xl text-left transition-all
                           bg-[#101010] border border-[#DEDBC8]/5
                           hover:border-[#DEDBC8]/15 hover:bg-[#1A1F2E]"
              >
                {/* Field color dot + name */}
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: fieldColor }}
                  />
                  <div>
                    <div className="text-[12px] font-semibold text-[#E1E0CC] group-hover:text-[#DEDBC8] transition-colors leading-tight">
                      {author.fullName}
                    </div>
                    {author.topField && (
                      <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                        {author.topField}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-600">
                  {author.hIndex != null && (
                    <span title="h-index">h-index {author.hIndex}</span>
                  )}
                  {author.totalCitations != null && (
                    <span title="Total citations">{formatNumber(author.totalCitations)} cites</span>
                  )}
                  {author.paperCount != null && (
                    <span title="Paper count">{author.paperCount} papers</span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {/* Empty state (API returned no authors) */}
      {!loading && !error && authors.length === 0 && (
        <p className="text-xs text-gray-500">No suggested authors available right now.</p>
      )}

      {/* Footer hint */}
      <div className="flex items-center gap-2 text-[11px] text-gray-500">
        <Users size={12} className="text-[#DEDBC8]/30" />
        <span>Data sourced from OpenAlex — click any author to view their full academic profile.</span>
      </div>
    </motion.div>
  );
}
