import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, AlertCircle } from 'lucide-react';
import { PaperItemCard } from '../pages/PaperItemCard';
import { PaperDetailDialog } from '../pages/PaperDetailDialog';
import { paperAPI } from '../lib/api/paper.api';

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

export default function TopPapers({ keyword }) {
  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);

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
        {papers.map((paper, i) => (
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
              onClick={(p) => setSelectedPaper(p)}
            />
          </motion.div>
        ))}
      </div>

      {/* Paper Detail Dialog */}
      <PaperDetailDialog
        paper={selectedPaper}
        open={!!selectedPaper}
        onOpenChange={(open) => { if (!open) setSelectedPaper(null); }}
      />
    </motion.div>
  );
}
