import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { BookmarkMinus, BookOpen, AlertCircle, Download, Trash2, Copy, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { bookmarkAPI } from './api';
import { Skeleton } from '../../components/ui/skeleton';
import { Checkbox } from '../../components/ui/checkbox';
import BulkActionBar from './BulkActionBar';
import CollectionsPanel from './CollectionsPanel';
import {
  FORMATS,
  downloadBlob,
  generateBatchCitations,
} from '../../utils/citationGenerators.js';
import { paperAPI } from '../search/paper.api';
import { useStaleWhileRevalidate } from '../../hooks/useStaleWhileRevalidate.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════════ */
const FIELD_COLORS = [
  '#4F8CFF', '#8B5CF6', '#00D1B2', '#F59E0B',
  '#EF4444', '#EC4899', '#06B6D4', '#84CC16',
];

function hashFieldColor(fieldName) {
  if (!fieldName) return FIELD_COLORS[0];
  let hash = 0;
  for (let i = 0; i < fieldName.length; i++) {
    hash = fieldName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FIELD_COLORS[Math.abs(hash) % FIELD_COLORS.length];
}

function GlowBadge({ color, children }) {
  return (
    <span
      className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border"
      style={{ background: `${color}15`, color: color, borderColor: `${color}30` }}
    >
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Skeleton
   ═══════════════════════════════════════════════════════════════════════════ */
function BookmarkCardSkeleton() {
  return (
    <div className="rounded-xl border p-5 bg-[#101010] border-[#DEDBC8]/10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20 rounded-md bg-white/5" />
            <Skeleton className="h-4 w-12 rounded bg-white/5" />
          </div>
          <Skeleton className="h-5 w-3/4 rounded bg-white/5" />
          <Skeleton className="h-4 w-1/2 rounded bg-white/5" />
        </div>
        <div className="flex items-center gap-6 shrink-0">
          <div className="text-right space-y-2">
            <Skeleton className="h-7 w-16 rounded bg-white/5 ml-auto" />
            <Skeleton className="h-3 w-20 rounded bg-white/5 ml-auto" />
          </div>
          <Skeleton className="h-10 w-10 rounded-lg bg-white/5" />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Batch Export Panel (inline, shown below header when exporting)
   ═══════════════════════════════════════════════════════════════════════════ */
function BatchExportPanel({ papers, onClose }) {
  const [formatKey, setFormatKey] = useState('bibtex');
  const [copied, setCopied] = useState(false);
  const [combined, setCombined] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // ── Fetch from bulk API (or fall back to client-side) ──
  useEffect(() => {
    if (!papers || papers.length === 0) {
      setCombined('');
      return;
    }

    const paperIds = papers
      .map((p) => p.paperId)
      .filter(Boolean);

    if (paperIds.length === 0) {
      // No valid IDs — use client-side fallback
      setCombined(generateBatchCitations(papers, formatKey));
      return;
    }

    let cancelled = false;
    setLoading(true);
    setFetchError(false);

    paperAPI.exportCitations(paperIds, formatKey)
      .then((blob) => {
        if (cancelled) return;
        return blob.text().then((text) => {
          if (cancelled) return;
          // Server may include "% Paper not found" comments — still valid output
          setCombined(text);
          setLoading(false);
        });
      })
      .catch(() => {
        if (cancelled) return;
        // Fall back to client-side generator
        setCombined(generateBatchCitations(papers, formatKey));
        setFetchError(true);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [formatKey, papers]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(combined);
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDownload = () => {
    const fmt = FORMATS.find((f) => f.key === formatKey);
    if (!fmt || !combined) return;
    const blob = new Blob([combined], { type: 'text/plain' });
    downloadBlob(blob, `citations-${papers.length}papers${fmt.ext}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="p-5 rounded-xl border border-[#DEDBC8]/10 bg-[#101010] space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-[#E1E0CC]">
            Batch Export — {papers.length} papers
          </h4>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-[10px] font-semibold text-gray-400 hover:text-[#E1E0CC] hover:bg-white/[0.04] transition-all"
          >
            Close
          </button>
        </div>

        {/* Format tabs */}
        <div className="flex gap-1.5">
          {FORMATS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFormatKey(f.key)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                formatKey === f.key
                  ? 'bg-[#DEDBC8]/10 text-[#DEDBC8] border border-[#DEDBC8]/20'
                  : 'text-gray-500 border border-transparent hover:text-[#E1E0CC] hover:border-[#DEDBC8]/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Preview */}
        <pre className="text-[10px] text-gray-400 bg-[#0A0D14] rounded-xl p-4 max-h-[200px] overflow-auto border border-[#DEDBC8]/5 font-mono leading-relaxed whitespace-pre-wrap">
          {loading ? (
            <span className="flex items-center gap-2 text-gray-500">
              <Loader2 size={11} className="animate-spin" />
              Fetching citations...
            </span>
          ) : (
            combined || 'No citation data available'
          )}
        </pre>

        {/* API fallback indicator */}
        {fetchError && !loading && (
          <p className="text-[9px] text-amber-400/60 italic">
            Generated locally (server unavailable)
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={loading || !combined}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-semibold bg-[#DEDBC8]/10 text-[#DEDBC8] border border-[#DEDBC8]/15 hover:bg-[#DEDBC8]/20 transition-all disabled:opacity-40"
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? 'Copied' : 'Copy All'}
          </button>
          <button
            onClick={handleDownload}
            disabled={loading || !combined}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 hover:bg-emerald-500/20 transition-all disabled:opacity-40"
          >
            {loading ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
            Download All
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BookmarksView
   ═══════════════════════════════════════════════════════════════════════════ */
export default function BookmarksView() {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();
  const currentRole = sessionStorage.getItem('userRole') || 'researcher';

  // Cache-first data fetching — instant display on tab switch
  const { data: bookmarks, loading, error, mutate: setBookmarks, refetch } = useStaleWhileRevalidate(
    'bookmarks-list',
    async () => {
      const response = await bookmarkAPI.getMyBookmarks();
      let items = null;
      if (Array.isArray(response)) {
        items = response;
      } else if (response && Array.isArray(response.data)) {
        items = response.data;
      } else if (response?.data && Array.isArray(response.data.data)) {
        items = response.data.data;
      } else if (response?.data?.data && Array.isArray(response.data.data.data)) {
        items = response.data.data.data;
      }
      return Array.isArray(items) ? items : [];
    },
    { ttl: 5 * 60 * 1000, defaultValue: [] },
  );

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [removing, setRemoving] = useState(false);
  const [showBatchExport, setShowBatchExport] = useState(false);
  const [activeCollection, setActiveCollection] = useState(null);

  // Clear selection when bookmarks change
  useEffect(() => {
    setSelectedIds(new Set());
    setShowBatchExport(false);
  }, [bookmarks.length]);

  // Re-fetch bookmarks when saved/removed from other pages (e.g. SearchPapers)
  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener('bookmark-changed', handler);
    return () => window.removeEventListener('bookmark-changed', handler);
  }, [refetch]);

  const removeBookmark = useCallback(async (bookmark) => {
    try {
      await bookmarkAPI.removeBookmark(bookmark.bookmarkId);
      setBookmarks((prev) => prev.filter((b) => b.bookmarkId !== bookmark.bookmarkId));
      toast.success(t('toast.removed'));
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('toast.removeError'));
    }
  }, [t]);

  // ── Bulk handlers ──

  const toggleSelectAll = () => {
    if (selectedIds.size === bookmarks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(bookmarks.map((b) => b.bookmarkId)));
    }
  };

  const toggleSelect = (bookmarkId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(bookmarkId)) next.delete(bookmarkId);
      else next.add(bookmarkId);
      return next;
    });
  };

  const handleBatchRemove = async () => {
    if (selectedIds.size === 0) return;
    setRemoving(true);
    try {
      const results = await Promise.allSettled(
        [...selectedIds].map((id) => bookmarkAPI.removeBookmark(id)),
      );
      const failed = results.filter((r) => r.status === 'rejected');
      setBookmarks((prev) => prev.filter((b) => !selectedIds.has(b.bookmarkId)));
      setSelectedIds(new Set());

      if (failed.length === 0) {
        toast.success(t('bulk.removeSuccess', { count: selectedIds.size }));
      } else {
        toast.error(t('bulk.removeError'));
      }
    } catch (err) {
      toast.error(t('bulk.removeError'));
    } finally {
      setRemoving(false);
    }
  };

  const handleBatchExport = () => {
    setShowBatchExport(true);
  };

  const getSelectedPapers = () => {
    return bookmarks
      .filter((b) => selectedIds.has(b.bookmarkId))
      .map((b) => {
        const paper = b.paper || b;
        // Ensure paperId is available (from paper object or bookmark itself)
        return { ...paper, paperId: paper.paperId || b.paperId };
      })
      .filter(Boolean);
  };

  // Normalize paper data from bookmark response.
  // API returns flat bookmark with paperTitle/paperId (no nested paper object).
  const getPaper = (bookmark) => {
    const paper = bookmark.paper || bookmark;
    // Map bookmark-level fields to expected paper field names
    return {
      ...paper,
      title: paper.title || bookmark.paperTitle || 'Untitled',
      paperId: paper.paperId || bookmark.paperId,
    };
  };

  // Navigate to paper detail page
  const handlePaperClick = (bookmark) => {
    const paper = getPaper(bookmark);
    const id = paper.paperId || bookmark.paperId;
    if (id) {
      // Save referring page so PaperDetail "Back to results" returns here
      sessionStorage.setItem('scitrack_referrer', window.location.pathname);
      navigate(`/${currentRole}/papers/${id}`);
    }
  };

  const isAllSelected = bookmarks.length > 0 && selectedIds.size === bookmarks.length;

  /* ── Error State ── */
  if (error && !loading && bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center space-y-4 bg-transparent p-8">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#E1E0CC] mb-1">{error}</h3>
          <p className="text-sm text-gray-400">{t('toast.loadError')}</p>
        </div>
        <button
          onClick={fetchBookmarks}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#DEDBC8]/10 text-[#DEDBC8] border border-[#DEDBC8]/20 hover:bg-[#DEDBC8]/20 transition-all"
        >
          {t('button.retry') || 'Retry'}
        </button>
      </div>
    );
  }

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="p-8 space-y-6 min-h-screen bg-transparent">
        <div className="space-y-1">
          <Skeleton className="h-7 w-40 rounded bg-white/5" />
          <Skeleton className="h-4 w-64 rounded bg-white/5" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <BookmarkCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  /* ── Empty State ── */
  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center space-y-4 bg-transparent">
        <div className="w-16 h-16 rounded-2xl bg-[#101010] border border-[#DEDBC8]/10 flex items-center justify-center">
          <BookOpen size={28} className="text-gray-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#E1E0CC] mb-1">{t('headings.bookmarks')}</h3>
          <p className="text-sm text-gray-400">{t('subtitles.bookmarks')}</p>
        </div>
      </div>
    );
  }

  /* ── Data State ── */
  return (
    <div className="p-8 space-y-6 min-h-screen bg-transparent pb-24">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {/* Select All checkbox */}
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={toggleSelectAll}
            className="border-[#DEDBC8]/20 data-[state=checked]:bg-[#DEDBC8] data-[state=checked]:text-black"
          />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#DEDBC8]/5 border border-[#DEDBC8]/8">
              <BookOpen size={13} className="text-[#DEDBC8]" />
              <span className="text-xs font-bold text-[#DEDBC8]">{bookmarks.length}</span>
              <span className="text-[11px] text-gray-400">{bookmarks.length === 1 ? 'paper' : 'papers'}</span>
            </div>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#4F8CFF]/10 border border-[#4F8CFF]/15">
                <Check size={13} className="text-[#4F8CFF]" />
                <span className="text-xs font-bold text-[#4F8CFF]">{selectedIds.size}</span>
                <span className="text-[11px] text-gray-400">selected</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collections Panel */}
      <CollectionsPanel
        activeCollection={activeCollection}
        onSelectCollection={setActiveCollection}
      />

      {/* Batch Export Panel */}
      <AnimatePresence>
        {showBatchExport && (
          <BatchExportPanel
            papers={getSelectedPapers()}
            onClose={() => setShowBatchExport(false)}
          />
        )}
      </AnimatePresence>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {bookmarks.map((bookmark, i) => {
            const p = getPaper(bookmark);
            const field = p.fieldName || p.field || '';
            const year = p.pubYear || p.year || '';
            const citations = p.citationCount ?? p.citations ?? null;
            const hasCitations = citations != null;
            const badgeColor = hashFieldColor(field);
            const isSelected = selectedIds.has(bookmark.bookmarkId);

            let authors = '';
            if (Array.isArray(p.authors)) {
              authors = p.authors
                .map((a) => (typeof a === 'string' ? a : a.fullName || a.name || ''))
                .filter(Boolean)
                .join(', ');
            } else if (typeof p.authors === 'string') {
              authors = p.authors;
            }

            return (
              <motion.div
                key={bookmark.bookmarkId || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handlePaperClick(bookmark)}
                className={`rounded-xl border p-5 transition-colors flex items-start gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-[#DEDBC8]/[0.04] border-[#DEDBC8]/25'
                    : 'bg-[#101010] border-[#DEDBC8]/10 hover:border-gray-300 dark:hover:border-white/20'
                }`}
              >
                {/* Checkbox */}
                <span onClick={(e) => e.stopPropagation()} className="shrink-0">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelect(bookmark.bookmarkId)}
                    className="mt-0.5 border-[#DEDBC8]/20 data-[state=checked]:bg-[#DEDBC8] data-[state=checked]:text-black"
                  />
                </span>

                <div className="flex-1 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {field && <GlowBadge color={badgeColor}>{field}</GlowBadge>}
                      {year && <span className="text-xs text-gray-400">{year}</span>}
                    </div>
                    <h4 className="text-sm font-bold text-[#E1E0CC] mb-1">{p.title || 'Untitled'}</h4>
                    {authors && <p className="text-xs text-gray-400">{authors}</p>}
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <div className="text-xl font-bold text-[#E1E0CC]">
                        {hasCitations ? citations.toLocaleString() : '—'}
                      </div>
                      <div className="text-xs text-gray-400">{t('user.totalCitations')}</div>
                      {p.trend && (
                        <div className="text-xs font-semibold mt-1 text-emerald-600 dark:text-[#A09878]">
                          {p.trend}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBookmark(bookmark);
                      }}
                      className="p-2.5 rounded-lg border bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-all group"
                      title="Remove from bookmarks"
                    >
                      <BookmarkMinus size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        onDeselectAll={() => setSelectedIds(new Set())}
        onRemoveSelected={handleBatchRemove}
        onExport={handleBatchExport}
        removing={removing}
      />
    </div>
  );
}
