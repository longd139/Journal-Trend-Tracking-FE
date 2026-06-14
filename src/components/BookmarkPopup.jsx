import * as React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bookmark, Loader2, ChevronDown } from 'lucide-react';
import { keywordAPI } from '../lib/api/keyword.api';

export function BookmarkPopup({ paper, isOpen, onClose, onSave, isSaving, searchQuery = '' }) {
  const { t } = useTranslation('search');
  const [keywords, setKeywords] = useState([]);
  const [selectedKeywordId, setSelectedKeywordId] = useState('');
  const [keywordText, setKeywordText] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Pre-fill keyword from the current search query
    setKeywordText(searchQuery || '');
    setSelectedKeywordId('');
    setNotes('');
    setShowDropdown(false);

    // Try to fetch keywords silently in background
    const loadKeywords = async () => {
      setIsLoadingKeywords(true);
      try {
        const data = await keywordAPI.getKeywords();
        const list = Array.isArray(data) ? data : data?.keywords || data?.list || [];
        setKeywords(list);
      } catch {
        setKeywords([]);
      } finally {
        setIsLoadingKeywords(false);
      }
    };
    loadKeywords();
  }, [isOpen]);

  const handleSelectKeyword = (kw) => {
    const id = kw.keywordId || kw.id;
    const text = kw.keywordText || kw.text || kw.name || '';
    setSelectedKeywordId(id);
    setKeywordText(text);
    setShowDropdown(false);
  };

  const handleSave = () => {
    onSave({
      keywordId: selectedKeywordId || '',
      keywordText: keywordText.trim(),
      notes: notes.trim(),
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  const paperTitle = paper?.title || paper?.paperTitle || 'Untitled Paper';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleOverlayClick}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Dialog */}
          <motion.div
            className="relative w-full max-w-md rounded-2xl border bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center">
                  <Bookmark size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t('bookmark.title')}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-4">
              {/* Paper Title (read-only) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  {t('bookmark.paper')}
                </label>
                <p className="text-sm text-gray-900 dark:text-white font-medium leading-snug line-clamp-2">
                  {paperTitle}
                </p>
              </div>

              {/* Keyword — always show text input as primary */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  {t('bookmark.keyword')}
                </label>

                {/* Keyword text input (always visible, pre-filled with search query) */}
                <div className="relative">
                  <input
                    type="text"
                    value={keywordText}
                    onChange={(e) => {
                      setKeywordText(e.target.value);
                      // Clear the selected ID when user types manually
                      if (selectedKeywordId) {
                        setSelectedKeywordId('');
                      }
                    }}
                    placeholder={t('bookmark.keywordPlaceholder')}
                    className="w-full px-3 py-2 pr-8 rounded-lg text-sm border bg-white dark:bg-[#0B1020] border-gray-200 dark:border-white/10 text-gray-900 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
                  />

                  {/* Dropdown toggle — only show if keywords loaded from API */}
                  {keywords.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white transition-colors"
                      title="Choose from existing keywords"
                    >
                      {isLoadingKeywords ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <ChevronDown
                          size={14}
                          className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                        />
                      )}
                    </button>
                  )}
                </div>

                {/* Dropdown list of existing keywords */}
                {showDropdown && keywords.length > 0 && (
                  <div className="max-h-36 overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1020] shadow-lg mt-1">
                    {keywords.map((kw) => {
                      const id = kw.keywordId || kw.id;
                      const text = kw.keywordText || kw.text || kw.name || '';
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => handleSelectKeyword(kw)}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-blue-50 dark:hover:bg-blue-500/10 ${
                            selectedKeywordId === id
                              ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium'
                              : 'text-gray-700 dark:text-slate-300'
                          }`}
                        >
                          {text}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  {t('bookmark.notes')}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('bookmark.notesPlaceholder')}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg text-sm border bg-white dark:bg-[#0B1020] border-gray-200 dark:border-white/10 text-gray-900 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0F1525]">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/5 transition-colors disabled:opacity-40"
              >
                {t('bookmark.cancel')}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all flex items-center gap-2 shadow-sm shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    {t('bookmark.saving')}
                  </>
                ) : (
                  <>
                    <Bookmark size={14} />
                    {t('bookmark.save')}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default BookmarkPopup;
