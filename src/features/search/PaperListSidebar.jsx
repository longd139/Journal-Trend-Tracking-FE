import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, FileText, Quote, User, ChevronLeft, ChevronRight, Library } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { paperAPI } from './paper.api';

const PAGE_SIZE = 20;
const YEAR_FILTER_PAGE_SIZE = 200;

/**
 * Slide-out sidebar showing ALL papers with pagination.
 *
 * Modes:
 * - Keyword:  pass `keyword` → searches papers matching the keyword
 * - Author:   pass `authorName` (+ optional `year`) → papers by that author
 * - Journal:  pass `journalName` → papers from that journal
 *
 * Pagination: {PAGE_SIZE} papers/page, prev/next buttons, page indicator.
 */
export default function PaperListSidebar({ keyword, authorName, journalName, year, totalOverride, open, onClose }) {
  const { t } = useTranslation('search');
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [apiTotal, setApiTotal] = useState(0);

  const requestIdRef = useRef(0);
  const keywordRef = useRef(keyword);
  const authorRef = useRef(authorName);
  const journalRef = useRef(journalName);
  const yearRef = useRef(year);
  keywordRef.current = keyword;
  authorRef.current = authorName;
  journalRef.current = journalName;
  yearRef.current = year;

  const isAuthorMode = !!authorName;
  const isJournalMode = !!journalName;
  const hasYearFilter = year != null;

  const OPENALEX_PAGE_LIMIT = 500;
  const effectivePageSize = hasYearFilter ? YEAR_FILTER_PAGE_SIZE : PAGE_SIZE;
  const totalElements = (hasYearFilter && totalOverride != null && totalOverride > 0)
    ? totalOverride
    : apiTotal;
  const navigate = useNavigate();
  const role = sessionStorage.getItem('userRole') || 'researcher';

  const totalPages = Math.max(1, Math.ceil(totalElements / effectivePageSize));
  const displayPages = isAuthorMode ? totalPages : Math.min(totalPages, OPENALEX_PAGE_LIMIT);
  const startItem = totalElements > 0 ? page * effectivePageSize + 1 : 0;
  const endItem = Math.min((page + 1) * effectivePageSize, totalElements);

  /* ─── Fetch a page (reads from refs, no stale closure) ─── */
  async function doFetch(pageNum) {
    const rid = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const kw = keywordRef.current;
      const an = authorRef.current;
      const jn = journalRef.current;
      const yr = yearRef.current;

      let result;

      if (an) {
        result = await paperAPI.searchPapersByAuthor({
          authorName: an,
          page: pageNum,
          size: effectivePageSize,
          sortBy: 'date',
          sortDirection: 'desc',
          pubYearFrom: yr ?? undefined,
          pubYearTo: yr ?? undefined,
        });
      } else {
        const query = kw || jn || '';
        if (!query.trim()) {
          setPapers([]);
          setApiTotal(0);
          setLoading(false);
          return;
        }
        result = await paperAPI.searchOpenAlex({ query, page: pageNum, size: PAGE_SIZE });
      }

      if (rid !== requestIdRef.current) return;

      const list = result?.papers || result?.data?.papers || result?.data?.content || result?.content || [];
      const currentYear = new Date().getFullYear();
      const filtered = list.filter(p => {
        const y = p.pubYear || p.year;
        if (!y || y < 1900 || y > currentYear) return false;
        if (yr != null && Number(y) !== Number(yr)) return false;
        return true;
      });
      setPapers(filtered);
      setApiTotal(result?.totalElements || result?.data?.totalElements || filtered.length);
      setPage(pageNum);
    } catch (err) {
      if (rid !== requestIdRef.current) return;
      setError(err?.message || t('author.error', 'Failed to load papers'));
    } finally {
      if (rid === requestIdRef.current) setLoading(false);
    }
  }

  // Reset & fetch when opening or keyword/author changes
  useEffect(() => {
    if (!open) return;
    setPapers([]);
    setApiTotal(0);
    setError(null);
    doFetch(0);
  }, [open, keyword, authorName, journalName, year]);

  /* ─── Navigation ─── */
  const goToPage = (p) => {
    if (p < 0 || p >= displayPages || loading) return;
    doFetch(p);
  };

  /* ─── Header ─── */
  const headerTitle = isAuthorMode
    ? t('author.papersBy', { author: authorName })
    : isJournalMode
      ? `Papers in ${journalName}`
      : `Papers for "${keyword}"`;

  const headerSubtitle = isAuthorMode && hasYearFilter
    ? t('author.papersIn', { count: totalElements, year })
    : t('author.papersTotal', { count: totalElements });

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-[460px] max-w-[92vw] bg-background border-l border-primary/10 flex flex-col shadow-2xl"
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  {isAuthorMode ? (
                    <User size={14} className="text-primary" />
                  ) : isJournalMode ? (
                    <Library size={14} className="text-accent-teal" />
                  ) : (
                    <FileText size={14} className="text-accent-blue" />
                  )}
                  {headerTitle}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {headerSubtitle}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
              {/* Loading spinner */}
              {loading && (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={24} className="animate-spin text-primary" />
                </div>
              )}

              {/* Error */}
              {!loading && error && (
                <div className="px-4 py-3 rounded-lg bg-red-500/5 border border-red-500/10 text-xs text-red-400">
                  {t("author.error")}: {error}
                </div>
              )}

              {/* Empty */}
              {!loading && !error && papers.length === 0 && (
                <div className="text-center py-16 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {totalElements > 0
                      ? t('author.allShown', { count: totalElements })
                      : t('author.noPapersFound')}
                  </p>
                </div>
              )}

              {/* OpenAlex limit notice */}
              {!loading && papers.length > 0 && !isAuthorMode && page >= OPENALEX_PAGE_LIMIT - 2 && (
                <div className="px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-400/80 text-center">
                  OpenAlex free tier limit: showing first ~10,000 of {totalElements.toLocaleString()} papers
                </div>
              )}

              {/* Paper list */}
              {!loading && papers.map((paper, i) => (
                <motion.div
                  key={paper.paperId || i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.5) }}
                  className="p-3 rounded-lg bg-card border border-border hover:border-primary/15 transition-colors group cursor-pointer"
                  onClick={() => {
                    const url = paper.sourceUrl
                      ? `/${role}/papers/${paper.paperId}?sourceUrl=${encodeURIComponent(paper.sourceUrl)}`
                      : `/${role}/papers/${paper.paperId}`;
                    navigate(url);
                    onClose();
                  }}
                >
                  {/* Number + Title */}
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground/50 shrink-0 mt-0.5">
                      {startItem + i}
                    </span>
                    <p className="text-xs font-medium text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {paper.title}
                    </p>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 mt-1.5 ml-5 text-[10px] text-muted-foreground">
                    {paper.authors && paper.authors.length > 0 && (
                      <span className="truncate max-w-[160px]">
                        {paper.authors.slice(0, 3).map((a) => a.fullName || a.name).join(', ')}
                        {paper.authors.length > 3 && ' et al.'}
                      </span>
                    )}
                    {(paper.pubYear || paper.year) && (
                      <span className="shrink-0">{paper.pubYear || paper.year}</span>
                    )}
                    {paper.citationCount != null && (
                      <span className="flex items-center gap-0.5 shrink-0">
                        <Quote size={9} />
                        {paper.citationCount.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Journal name */}
                  {paper.journalName && (
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5 ml-5 truncate">
                      {paper.journalName}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>

            {/* ── Pagination Footer ── */}
            {totalElements > 0 && (
              <div className="px-5 py-3 border-t border-border shrink-0 bg-card-recessed">
                {/* Page info */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-foreground">
                    {t("author.showingRange", { start: startItem, end: endItem, total: totalElements })}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {t("author.pageOf", { page: page + 1, total: displayPages })}
                  </span>
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => goToPage(0)}
                    disabled={page === 0 || loading}
                    className="px-2 py-1.5 rounded-md text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    First
                  </button>
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 0 || loading}
                    className="p-1.5 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(displayPages, 7) }, (_, i) => {
                      let pageNum;
                      if (displayPages <= 7) {
                        pageNum = i;
                      } else if (page <= 3) {
                        pageNum = i < 5 ? i : displayPages - (7 - i);
                      } else if (page >= displayPages - 4) {
                        pageNum = i < 2 ? i : displayPages - (7 - i);
                      } else {
                        pageNum = i < 2 ? i : i === 6 ? displayPages - 1 : page - 3 + i;
                      }

                      if (i === 2 && pageNum > 2 && page > 3) {
                        return <span key="e1" className="text-[10px] text-muted-foreground px-1">…</span>;
                      }
                      if (i === 5 && pageNum < displayPages - 1 && page < displayPages - 4) {
                        return <span key="e2" className="text-[10px] text-muted-foreground px-1">…</span>;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          disabled={loading}
                          className={`w-7 h-7 rounded-md text-[10px] font-semibold transition-all ${
                            pageNum === page
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= displayPages - 1 || loading}
                    className="p-1.5 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => goToPage(displayPages - 1)}
                    disabled={page >= displayPages - 1 || loading}
                    className="px-2 py-1.5 rounded-md text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
