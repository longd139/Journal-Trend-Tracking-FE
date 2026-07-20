import { motion } from 'motion/react';
import { Hash } from 'lucide-react';
import RelatedTrends from './RelatedTrends';

/* ═══════════════════════════════════════════════════════════════════════════
   KeywordGraphExplorer — always renders card-based RelatedTrends
   (Neo4j graph removed — kept card UI from REST API)
   ═══════════════════════════════════════════════════════════════════════════ */

export default function KeywordGraphExplorer({ keyword, onKeywordClick, filters }) {
  if (!keyword?.trim()) {
    return (
      <div className="rounded-2xl border border-primary/5 bg-card-recessed p-8 flex flex-col items-center justify-center text-center min-h-[200px]">
        <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-3">
          <Hash size={20} className="text-gray-500" />
        </div>
        <p className="text-sm text-gray-500">Enter a keyword to discover related trends</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <RelatedTrends keyword={keyword} onKeywordClick={onKeywordClick} filters={filters} />
    </motion.div>
  );
}
