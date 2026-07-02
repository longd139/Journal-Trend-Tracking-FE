import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/* ═══════════════════════════════════════════════════════════════════════════
   BulkActionBar — floating bottom bar for batch operations
   ═══════════════════════════════════════════════════════════════════════════ */

export default function BulkActionBar({
  selectedCount,
  onDeselectAll,
  onRemoveSelected,
  onExport,
  removing,
}) {
  const { t } = useTranslation('dashboard');

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[#1A1A1A] border border-[#DEDBC8]/15 shadow-2xl shadow-black/60 backdrop-blur-xl flex items-center gap-4"
        >
          {/* Count */}
          <span className="text-xs font-bold text-[#E1E0CC] whitespace-nowrap">
            {t('bulk.selected', { count: selectedCount })}
          </span>

          {/* Divider */}
          <div className="w-px h-5 bg-[#DEDBC8]/10" />

          {/* Deselect All */}
          <button
            onClick={onDeselectAll}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-gray-400 hover:text-[#E1E0CC] hover:bg-white/[0.04] transition-all"
          >
            <X size={12} />
            {t('bulk.deselectAll')}
          </button>

          {/* Export */}
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-[#DEDBC8]/10 text-[#DEDBC8] border border-[#DEDBC8]/15 hover:bg-[#DEDBC8]/20 hover:border-[#DEDBC8]/30 transition-all"
          >
            <Download size={12} />
            {t('bulk.exportSelected')}
          </button>

          {/* Remove */}
          <button
            onClick={onRemoveSelected}
            disabled={removing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/35 transition-all disabled:opacity-50"
          >
            <Trash2 size={12} />
            {removing ? '...' : t('bulk.removeSelected')}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
