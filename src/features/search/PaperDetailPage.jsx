import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ArrowLeft, BookOpen, ExternalLink, FileText, Download,
  Quote, Star, Eye, Users, Calendar, Globe, Hash,
  ShieldCheck, AlertCircle, Bookmark, Loader2, CheckCircle2,
  BrainCircuit, Cpu, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { paperAPI } from './paper.api';
import { bookmarkAPI } from '../bookmarks/api';
import { prependToCache, removeFromCache } from '../../hooks/useStaleWhileRevalidate.js';
import { aiAPI } from '../../lib/api/ai.api.js';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import CitationExport from './CitationExport';
import SimilarPapers from './SimilarPapers';
import FollowButton from '../follows/FollowButton';

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

/* ═══════════════════════════════════════════════════════════════════════════
   Stat Chip
   ═══════════════════════════════════════════════════════════════════════════ */
function StatChip({ icon: Icon, label, value, color = '#DEDBC8' }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-3 rounded-xl border"
      style={{ background: `${color}08`, borderColor: `${color}15` }}
    >
      <Icon size={16} style={{ color }} />
      <div>
        <div className="text-lg font-bold text-[#E1E0CC]">{value}</div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Loading Skeleton
   ═══════════════════════════════════════════════════════════════════════════ */
function DetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
      <Skeleton className="h-5 w-24 rounded bg-white/5" />
      <div className="space-y-3">
        <Skeleton className="h-8 w-3/4 rounded bg-white/5" />
        <Skeleton className="h-4 w-1/2 rounded bg-white/5" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl bg-white/5" />
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-24 rounded bg-white/5" />
        <Skeleton className="h-32 rounded-xl bg-white/5" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Request PDF Button
   ═══════════════════════════════════════════════════════════════════════════ */

function RequestPdfButton({ paperId, paperTitle }) {
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  const handleRequest = async () => {
    if (!paperId) return;
    setRequesting(true);
    try {
      await paperAPI.requestPdf(paperId);
      setRequested(true);
      toast.success('PDF requested! You will be notified when available.');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to request PDF';
      toast.error(msg);
    } finally {
      setRequesting(false);
    }
  };

  if (requested) {
    return (
      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-900 bg-white px-3 py-2 rounded-lg border border-white shadow-md shadow-white/10">
        <CheckCircle2 size={13} /> PDF Requested
      </span>
    );
  }

  return (
    <button
      onClick={handleRequest}
      disabled={requesting}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all border-white/20 text-white/70 hover:bg-white hover:text-gray-900 hover:border-white disabled:opacity-60 active:scale-[0.97]"
    >
      <FileText size={14} />
      {requesting ? 'Requesting...' : 'Request PDF'}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   AI Summary Section (self-contained, pattern: SimilarPapers)
   ═══════════════════════════════════════════════════════════════════════════ */

function AISummarySection({ paperId }) {
  const { t } = useTranslation('search');
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAI = useCallback(async () => {
    if (!paperId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await aiAPI.summarize(paperId);
      setAiData(data);
    } catch (err) {
      setError(err?.message || 'Failed to load AI summary');
    } finally {
      setLoading(false);
    }
  }, [paperId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await aiAPI.summarize(paperId);
        if (!cancelled) setAiData(data);
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Failed to load AI summary');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (paperId) load();
    return () => { cancelled = true; };
  }, [paperId]);

  // ── Resolve sections: prefer structured, fallback to sentence-split ──
  const resolveSections = () => {
    if (aiData?.aiSummarySections?.length > 0) {
      return aiData.aiSummarySections;
    }
    // Fallback: split plain text into sentences
    const text = aiData?.aiSummary;
    if (!text) return [];
    return text
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim().length > 0)
      .map((s, i) => ({ heading: null, content: s }));
  };

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="rounded-xl border border-[#DEDBC8]/10 bg-[#101010] p-5 animate-pulse">
        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-6 h-6 rounded-lg bg-[#4F8CFF]/20" />
          <div className="h-3 w-20 rounded bg-[#DEDBC8]/8" />
          <div className="h-4 w-16 rounded-md bg-[#4F8CFF]/10 ml-auto" />
        </div>
        {/* Section cards */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg bg-[#DEDBC8]/[0.02] border border-[#DEDBC8]/5 p-4">
              <div className="h-3 w-24 rounded bg-[#4F8CFF]/10 mb-2.5" />
              <div className="space-y-1.5">
                <div className="h-3 w-full rounded bg-[#DEDBC8]/5" />
                <div className="h-3 w-5/6 rounded bg-[#DEDBC8]/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
        <div className="flex items-center gap-2">
          <AlertCircle size={13} className="text-amber-400/70 shrink-0" />
          <span className="text-[11px] text-amber-400/70">{t('aiSummary.error')}</span>
        </div>
        <button
          type="button"
          onClick={fetchAI}
          className="flex items-center gap-1 text-[11px] font-semibold text-amber-400/80 hover:text-amber-300 transition-colors"
        >
          <RefreshCw size={11} />
          {t('aiSummary.retry')}
        </button>
      </div>
    );
  }

  // ── Fallback: AI unavailable (response received but fields absent) ──
  const sections = resolveSections();
  const hasContent = sections.length > 0;
  const hasMethodology = aiData?.methodology;
  const isStructured = aiData?.aiSummarySections?.length > 0;

  if (!hasContent && !hasMethodology) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#4F8CFF]/[0.03] border border-[#4F8CFF]/10">
        <BrainCircuit size={13} className="text-[#4F8CFF]/50 shrink-0" />
        <span className="text-[11px] text-[#4F8CFF]/50">{t('aiSummary.unavailable')}</span>
      </div>
    );
  }

  // ── Section accent colors ──
  const SECTION_COLORS = [
    { bg: 'bg-[#4F8CFF]/8', text: 'text-[#4F8CFF]', border: 'border-[#4F8CFF]/15', dot: 'bg-[#4F8CFF]' },
    { bg: 'bg-[#8B5CF6]/8', text: 'text-[#8B5CF6]', border: 'border-[#8B5CF6]/15', dot: 'bg-[#8B5CF6]' },
    { bg: 'bg-[#00D1B2]/8', text: 'text-[#00D1B2]', border: 'border-[#00D1B2]/15', dot: 'bg-[#00D1B2]' },
    { bg: 'bg-[#F59E0B]/8', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/15', dot: 'bg-[#F59E0B]' },
  ];

  // ── Success ──
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-[#DEDBC8]/10 bg-gradient-to-br from-[#101010] via-[#101010] to-[#4F8CFF]/[0.02] p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-6 h-6 rounded-lg bg-[#4F8CFF]/10 flex items-center justify-center">
          <BrainCircuit size={14} className="text-[#4F8CFF]" />
        </div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4F8CFF]">
          {t('aiSummary.title')}
        </h3>
        <span className="ml-auto text-[9px] font-bold text-[#4F8CFF]/60 bg-[#4F8CFF]/8 px-2 py-0.5 rounded-md border border-[#4F8CFF]/15">
          {t('aiSummary.aiLabel')}
        </span>
      </div>

      {/* Section cards */}
      <div className={`space-y-3 ${isStructured ? '' : 'pl-5 border-l-2 border-[#4F8CFF]/20'}`}>
        {sections.map((section, i) => {
          const color = SECTION_COLORS[i % SECTION_COLORS.length];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 + i * 0.07, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={isStructured
                ? `rounded-lg ${color.bg} border ${color.border} p-4`
                : 'flex gap-3 group'
              }
            >
              {isStructured ? (
                <>
                  {/* Heading badge */}
                  {section.heading && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${color.dot} shrink-0`} />
                      <span className={`text-[11px] font-bold ${color.text} uppercase tracking-wide`}>
                        {section.heading}
                      </span>
                    </div>
                  )}
                  <p className="text-[13px] text-gray-300 leading-relaxed">
                    {section.content}
                  </p>
                </>
              ) : (
                <>
                  {/* Fallback: numbered sentence style */}
                  <span className="text-[10px] font-bold text-[#4F8CFF]/30 bg-[#4F8CFF]/5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 group-hover:text-[#4F8CFF]/60 group-hover:bg-[#4F8CFF]/10 transition-colors">
                    {i + 1}
                  </span>
                  <p className="text-[13px] text-gray-300 leading-relaxed">
                    {section.content}
                  </p>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Methodology chip */}
      {hasMethodology && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 + sections.length * 0.07 + 0.05, duration: 0.3 }}
          className="mt-5 ml-5 pl-5 border-l-2 border-[#DEDBC8]/5"
        >
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00D1B2]/[0.06] border border-[#00D1B2]/15">
            <Cpu size={13} className="text-[#00D1B2] shrink-0" />
            <span className="text-[11px] font-semibold text-[#00D1B2]/70 mr-1">
              {t('aiSummary.methodologyTitle')}
            </span>
            <span className="text-[11px] font-bold text-[#00D1B2]">
              {aiData.methodology}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */
export default function PaperDetailPage() {
  const { paperId } = useParams();
  const navigate = useNavigate();

  const goBack = () => {
    // Prefer saved referrer (set when navigating TO this page)
    const referrer = sessionStorage.getItem('scitrack_referrer');
    if (referrer) {
      sessionStorage.removeItem('scitrack_referrer'); // one-time use
      navigate(referrer);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      const role = sessionStorage.getItem('userRole') || 'researcher';
      navigate(`/${role}/search`);
    }
  };

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);

  // Fetch paper detail
  const fetchPaper = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await paperAPI.getPaperById(paperId);
      if (data) {
        setPaper(data);
      } else {
        setError('Paper not found');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load paper';
      setError(err?.response?.status === 404 ? 'Paper not found' : msg);
    } finally {
      setLoading(false);
    }
  }, [paperId]);

  // Check bookmark status — lightweight check first, fallback to full list
  const checkBookmark = useCallback(async () => {
    let found = null;
    let checked = false; // true when fast path completes (even if not bookmarked)

    // Fast path: try single-paper endpoint
    try {
      const single = await bookmarkAPI.isPaperBookmarked(paperId);
      checked = true;
      if (single) found = single;
      // null = 404 = definitely not bookmarked
    } catch {
      // Endpoint doesn't exist — need fallback
    }

    // Slow fallback: scan full bookmark list
    if (!checked) {
      try {
        const response = await bookmarkAPI.getMyBookmarks();
        let items = null;
        if (Array.isArray(response)) {
          items = response;
        } else if (response && Array.isArray(response.data)) {
          items = response.data;
        } else if (response?.data && Array.isArray(response.data.data)) {
          items = response.data.data;
        } else if (response && typeof response === 'object') {
          for (const val of Object.values(response)) {
            if (Array.isArray(val)) { items = val; break; }
          }
        }
        if (Array.isArray(items)) {
          found = items.find(
            (b) => (b.paperId || b.paper?.paperId) === paperId,
          );
        }
      } catch (err) {
        console.error('[PaperDetail] Failed to check bookmark:', err);
      }
    }

    if (found) {
      setIsBookmarked(true);
      setBookmarkId(found.bookmarkId);
    }
  }, [paperId]);

  useEffect(() => {
    // Run both fetches in parallel — no need to wait sequentially
    Promise.all([fetchPaper(), checkBookmark()]);
  }, [fetchPaper, checkBookmark]);

  // Bookmark toggle
  const handleToggleBookmark = async () => {
    const wasBookmarked = isBookmarked;

    // Optimistic update — toggle instantly
    setIsBookmarked(!wasBookmarked);

    try {
      if (wasBookmarked) {
        if (bookmarkId) {
          await bookmarkAPI.removeBookmark(bookmarkId);
        } else {
          await bookmarkAPI.removeBookmarkByPaper(paperId);
        }
        removeFromCache('bookmarks-list', (item) => item.paperId === paperId);
        toast.success('Removed from bookmarks');
      } else {
        const res = await bookmarkAPI.addBookmark(paperId);
        const bm = res?.data?.data || res?.data || res;
        if (bm?.bookmarkId) setBookmarkId(bm.bookmarkId);
        // Optimistic: add to cached list so bookmarks page shows it instantly
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
      // 409 = already bookmarked → state correct, ignore
      if (err?.response?.status !== 409) {
        // Revert on real error
        setIsBookmarked(wasBookmarked);
        toast.error(err?.response?.data?.message || err?.message || 'Failed');
      }
    }
  };

  // ── Loading ──
  if (loading) return <DetailSkeleton />;

  // ── Error ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-4 p-8">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#E1E0CC] mb-1">{error}</h3>
          <p className="text-sm text-gray-400">The paper could not be loaded.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#DEDBC8]/10 text-[#DEDBC8] border border-[#DEDBC8]/20 hover:bg-[#DEDBC8]/20 transition-all"
          >
            Go Back
          </button>
          <button
            onClick={fetchPaper}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#DEDBC8] text-black hover:opacity-90 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (!paper) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-4 p-8">
        <div className="w-16 h-16 rounded-2xl bg-[#101010] border border-[#DEDBC8]/10 flex items-center justify-center">
          <FileText size={28} className="text-gray-500" />
        </div>
        <h3 className="text-lg font-bold text-[#E1E0CC]">Paper not found</h3>
        <button
          onClick={goBack}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#DEDBC8]/10 text-[#DEDBC8] border border-[#DEDBC8]/20 hover:bg-[#DEDBC8]/20 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  // ── Normalize ──
  const title = paper.title || 'Untitled Paper';
  const field = paper.fieldName || '';
  const year = paper.pubYear || '';
  const citations = paper.citationCount ?? 0;
  const downloads = paper.downloadCount ?? 0;
  const rating = paper.rating ?? 0;
  const isOpenAccess = paper.isOpenAccess;
  const journal = paper.journalName || '';
  const doi = paper.doi || '';
  const abstract = paper.abstractText || '';
  const authors = Array.isArray(paper.authors) ? paper.authors : [];
  const keywords = Array.isArray(paper.keywords) ? paper.keywords : [];
  const fieldColor = hashFieldColor(field);

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* ── Back button ── */}
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#E1E0CC] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to results
        </button>

        {/* ── Title + Meta ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 flex-wrap">
            {field && (
              <Badge
                variant="outline"
                className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5"
                style={{
                  background: `${fieldColor}15`,
                  color: fieldColor,
                  borderColor: `${fieldColor}30`,
                }}
              >
                {field}
              </Badge>
            )}
            {year && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar size={12} />
                {year}
              </span>
            )}
            {isOpenAccess && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
                <ShieldCheck size={11} />
                Open Access
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-[#E1E0CC] leading-snug">
            {title}
          </h1>
        </motion.div>

        {/* ── Stats Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <StatChip icon={Quote} label="Citations" value={citations.toLocaleString()} color="#4F8CFF" />
          <StatChip icon={Download} label="Downloads" value={downloads.toLocaleString()} color="#00D1B2" />
          <StatChip icon={Star} label="Rating" value={rating > 0 ? rating.toFixed(1) : '—'} color="#F59E0B" />
          <StatChip icon={Eye} label="Views" value={paper.viewCount?.toLocaleString() || '—'} color="#A78BFA" />
        </motion.div>

        {/* ── Actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="flex flex-wrap items-center gap-2"
        >
          {paper.pdfAvailable && (paper.pdfUrl || paper.downloadUrl) && (
            <>
              <button
                onClick={() => window.open(paper.pdfUrl || paper.downloadUrl, '_blank')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border border-white/20 text-white/70 hover:bg-white hover:text-gray-900 hover:border-white hover:shadow-md hover:shadow-white/10 active:scale-[0.97] transition-all"
              >
                <Download size={14} />
                Download PDF
              </button>
              <button
                onClick={() => window.open(paper.pdfUrl || paper.downloadUrl, '_blank')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border border-white/20 text-white/70 hover:bg-white hover:text-gray-900 hover:border-white hover:shadow-md hover:shadow-white/10 active:scale-[0.97] transition-all"
              >
                <Eye size={14} />
                Preview PDF
              </button>
            </>
          )}

          {/* Request PDF — shown when paper has no direct PDF access */}
          {!(paper.pdfAvailable && (paper.pdfUrl || paper.downloadUrl)) && (
            <RequestPdfButton paperId={paper.paperId} paperTitle={paper.title} />
          )}
          {doi && (
            <button
              onClick={() => window.open(`https://doi.org/${doi}`, '_blank')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border border-white/20 text-white/70 hover:bg-white hover:text-gray-900 hover:border-white hover:shadow-md hover:shadow-white/10 active:scale-[0.97] transition-all"
            >
              <ExternalLink size={14} />
              View Source (DOI)
            </button>
          )}
          <button
            onClick={() => window.open(`https://scholar.google.com/scholar?q=${encodeURIComponent(title)}`, '_blank')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border border-white/20 text-white/70 hover:bg-white hover:text-gray-900 hover:border-white hover:shadow-md hover:shadow-white/10 active:scale-[0.97] transition-all"
          >
            <Globe size={14} />
            Google Scholar
          </button>
          <button
            onClick={handleToggleBookmark}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all active:scale-[0.97] ${
              isBookmarked
                ? 'bg-white border-white text-gray-900 shadow-md shadow-white/10'
                : 'border-white/20 text-white/70 hover:bg-white hover:text-gray-900 hover:border-white'
            }`}
          >
            <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
            {isBookmarked ? 'Saved' : 'Bookmark'}
          </button>
          <CitationExport paper={paper} variant="compact" />
          <FollowButton
            journalId={paper.journalId || null}
            journalName={paper.journalName || null}
            topicId={paper.topicId || null}
            topicName={paper.topicName || paper.fieldName || null}
            keywordId={
              Array.isArray(paper.keywords) && paper.keywords[0]?.keywordId
                ? paper.keywords[0].keywordId
                : null
            }
            keywordText={
              Array.isArray(paper.keywords)
                ? typeof paper.keywords[0] === 'string'
                  ? paper.keywords[0]
                  : paper.keywords[0]?.keywordText || null
                : null
            }
          />
        </motion.div>

        {/* ── Journal ── */}
        {(journal || doi) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-[#DEDBC8]/10 bg-[#101010] p-5 space-y-2"
          >
            {journal && (
              <div className="flex items-center gap-2 text-sm">
                <BookOpen size={16} className="text-gray-500" />
                <span className="text-[#E1E0CC] font-semibold">{journal}</span>
              </div>
            )}
            {doi && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Hash size={13} />
                <span className="font-mono">DOI: {doi}</span>
              </div>
            )}
            {paper.pubDate && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={13} />
                <span>Published: {new Date(paper.pubDate).toLocaleDateString()}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Abstract ── */}
        {abstract && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-xl border border-[#DEDBC8]/10 bg-[#101010] p-5 space-y-3"
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Abstract</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{abstract}</p>
          </motion.div>
        )}

        {/* ── AI Summary ── */}
        <AISummarySection paperId={paperId} />

        {/* ── Authors ── */}
        {authors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="rounded-xl border border-[#DEDBC8]/10 bg-[#101010] p-5 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Users size={15} className="text-gray-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Authors ({authors.length})
              </h3>
            </div>

            <div className="space-y-2">
              {authors.map((author, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    const role = sessionStorage.getItem('userRole') || 'researcher';
                    const authorName = author.fullName || '';
                    navigate(`/${role}/search-author`);
                    // Store author name for the search page to pick up
                    if (authorName) {
                      sessionStorage.setItem('scitrack_author_query', authorName);
                      // Small delay to let the page mount first
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('scitrack:authorSearch', { detail: authorName }));
                      }, 300);
                    }
                  }}
                  className="w-full text-left flex items-start justify-between gap-4 px-4 py-3 rounded-xl bg-[#DEDBC8]/[0.02] border border-[#DEDBC8]/5 hover:border-[#DEDBC8]/15 hover:bg-[#DEDBC8]/[0.04] transition-all group cursor-pointer"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#E1E0CC] group-hover:text-[#DEDBC8] transition-colors">
                        {author.fullName}
                      </span>
                      {author.isCorresponding && (
                        <span className="text-[9px] font-bold text-[#DEDBC8] bg-[#DEDBC8]/10 px-1.5 py-0.5 rounded border border-[#DEDBC8]/20">
                          ✉ Corresponding
                        </span>
                      )}
                      <span className="text-[10px] text-gray-600">#{author.authorOrder}</span>
                    </div>
                    {author.affiliation && (
                      <p className="text-xs text-gray-500 truncate">{author.affiliation}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#E1E0CC]">
                        {author.totalCitations?.toLocaleString() || 0}
                      </div>
                      <div className="text-[10px] text-gray-500">Citations</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#00D1B2]">
                        h-{author.hindex || 0}
                      </div>
                      <div className="text-[10px] text-gray-500">H-Index</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Keywords ── */}
        {keywords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="rounded-xl border border-[#DEDBC8]/10 bg-[#101010] p-5 space-y-3"
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw, i) => {
                const text = typeof kw === 'string' ? kw : kw.keywordText;
                const score = typeof kw === 'object' ? kw.relevanceScore : null;
                return (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg font-bold bg-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/20"
                  >
                    #{text}
                    {score != null && (
                      <span className="text-[9px] opacity-60">{Math.round(score * 100)}%</span>
                    )}
                  </span>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Similar Papers ── */}
        <SimilarPapers paper={paper} />

        {/* ── Meta footer ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22 }}
          className="text-center pt-4 pb-8"
        >
          <p className="text-[11px] text-gray-600">
            Paper ID: {paperId}
            {paper.createdAt && (
              <> · Added {new Date(paper.createdAt).toLocaleDateString()}</>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
