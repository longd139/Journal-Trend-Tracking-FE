import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, FileText, AlertCircle, ChevronRight } from 'lucide-react';
import { paperAPI } from './paper.api';

/* ═══════════════════════════════════════════════════════════════════════════
   Skeleton
   ═══════════════════════════════════════════════════════════════════════════ */

function Skeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-primary/5 bg-card p-4 space-y-2.5 animate-pulse"
        >
          <div className="h-4 w-3/4 bg-primary/8 rounded" />
          <div className="h-3 w-1/2 bg-primary/5 rounded" />
          <div className="flex items-center gap-2">
            <div className="h-3 w-16 bg-primary/5 rounded-full" />
            <div className="h-3 w-12 bg-primary/5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function SimilarPapers({ paper }) {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!paper) return;

    let cancelled = false;

    async function fetchSimilar() {
      setLoading(true);
      setError(null);
      try {
        // Use the first keyword or field as search query for similar papers
        let query = '';
        const keywords = Array.isArray(paper.keywords)
          ? paper.keywords
          : [];

        if (keywords.length > 0) {
          const kw = typeof keywords[0] === 'string' ? keywords[0] : keywords[0]?.keywordText || '';
          query = kw || paper.fieldName || paper.field || '';
        } else {
          query = paper.fieldName || paper.field || '';
        }

        if (!query) {
          // Fallback: use paper title words
          const titleWords = (paper.title || '').split(' ').filter((w) => w.length > 4);
          query = titleWords[0] || '';
        }

        let result;
        if (query) {
          result = await paperAPI.searchPapers({ query, page: 0 });
        } else {
          // Fallback to general search
          result = await paperAPI.search({ page: 0, size: 5 });
        }

        if (!cancelled) {
          let items = [];
          if (result?.data?.papers) {
            items = result.data.papers;
          } else if (Array.isArray(result)) {
            items = result;
          }
          // Filter out the current paper
          const filtered = items.filter((p) => p.paperId !== paper.paperId).slice(0, 4);
          setPapers(filtered);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Similar papers fetch error:', err);
          setError(err?.message || 'Failed to load similar papers');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSimilar();
    return () => { cancelled = true; };
  }, [paper?.paperId]);

  if (!paper) return null;
  if (loading) return <Skeleton />;
  if (error) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[11px] text-amber-400/70">
        <AlertCircle size={13} className="shrink-0" />
        <span>Similar papers unavailable.</span>
      </div>
    );
  }
  if (!papers.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <Sparkles size={14} className="text-primary/40" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Similar Papers
        </h3>
      </div>

      <div className="space-y-2">
        {papers.map((p, i) => {
          const field = p.fieldName || p.field || '';
          const year = p.pubYear || p.year || '';
          const citations = p.citationCount ?? p.citations ?? 0;
          let authors = '';
          if (Array.isArray(p.authors)) {
            authors = p.authors
              .map((a) => (typeof a === 'string' ? a : a.fullName || a.name || ''))
              .filter(Boolean)
              .slice(0, 3)
              .join(', ');
          } else if (typeof p.authors === 'string') {
            authors = p.authors;
          }

          return (
            <motion.button
              key={p.paperId || i}
              type="button"
              onClick={() => {
                const role = sessionStorage.getItem('userRole') || 'researcher';
                sessionStorage.setItem('scitrack_referrer', window.location.pathname);
                navigate(`/${role}/papers/${p.paperId}`);
              }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              whileHover={{ x: 3 }}
              className="w-full text-left rounded-xl border border-primary/5 bg-card p-4 hover:border-primary/15 transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-[13px] font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {p.title || 'Untitled'}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 flex-wrap">
                    {authors && <span>{authors}</span>}
                    {year && <span>· {year}</span>}
                    {field && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/5 text-primary/60 border border-primary/10">
                        {field}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-bold text-foreground">{citations.toLocaleString()}</div>
                    <div className="text-[9px] text-gray-500">cites</div>
                  </div>
                  <ChevronRight size={14} className="text-gray-600 group-hover:text-primary transition-colors" />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
