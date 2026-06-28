import * as React from 'react';
import { BookOpen, ExternalLink, FileText, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import FollowButton from '../follows/FollowButton';

/**
 * Normalize paper data from API response.
 * Same logic as PaperItemCard — kept self-contained for clarity.
 */
function normalizePaper(paper) {
  if (!paper) return null;

  const field = paper.fieldName || paper.field || '';
  const year = paper.pubYear || paper.year || '';
  const citations = paper.citationCount ?? paper.citations ?? 0;
  const journal = paper.journalName || paper.journal || '';
  const abstract = paper.abstractText || paper.abstract || '';

  let authors = '';
  if (Array.isArray(paper.authors) && paper.authors.length > 0) {
    authors = paper.authors
      .map((a) => {
        if (typeof a === 'string') return a;
        return a.fullName || a.name || '';
      })
      .filter(Boolean)
      .join(', ');
  } else if (typeof paper.authors === 'string') {
    authors = paper.authors;
  }
  if (!authors.trim()) authors = 'Unknown Author';

  let keywordsArray = [];
  if (Array.isArray(paper.keywords)) {
    keywordsArray = paper.keywords.map((k) =>
      typeof k === 'string' ? k : (k?.keywordText || '')
    ).filter(Boolean);
  } else if (typeof paper.keywords === 'string' && paper.keywords.trim()) {
    keywordsArray = paper.keywords.split(',').map((k) => k.trim());
  } else if (field) {
    keywordsArray = [field];
  }

  return {
    ...paper,
    field,
    year,
    citations,
    journal,
    abstract,
    authors,
    keywordsArray,
  };
}

export function PaperDetailDialog({ paper, open, onOpenChange }) {
  const p = normalizePaper(paper);

  const handleScholarSearch = () => {
    if (!p?.title) return;
    window.open(
      `https://scholar.google.com/scholar?q=${encodeURIComponent(p.title)}`,
      '_blank',
    );
  };

  const handleDownloadPdf = () => {
    if (p?.pdfUrl) {
      window.open(p.pdfUrl, '_blank');
    }
  };

  if (!p) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-[#101010] border-[#DEDBC8]/10 text-[#E1E0CC]">
        {/* ── Header ── */}
        <DialogHeader>
          <DialogTitle className="text-base font-bold leading-snug pr-6">
            {p.title || 'Untitled Paper'}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500 dark:text-slate-400 mt-1.5">
            {p.authors}
            {p.year && <span className="ml-2">({p.year})</span>}
          </DialogDescription>
        </DialogHeader>

        {/* ── Meta badges row ── */}
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {p.field && (
            <Badge
              variant="outline"
              className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-blue-500/10 text-[#DEDBC8] border-blue-500/25"
            >
              {p.field}
            </Badge>
          )}
          <span className="text-xs text-gray-500 dark:text-slate-400">
            {p.citations.toLocaleString()} citations
          </span>
          {p.pdfAvailable && p.pdfUrl && (
            <Badge className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <FileText size={11} className="mr-1" />
              PDF Available
            </Badge>
          )}
        </div>

        {/* ── Follow ── */}
        <div className="flex items-center gap-2 border-t border-gray-100 border-[#DEDBC8]/5 pt-4">
          <FollowButton
            journalId={p.journalId || null}
            journalName={p.journalName || p.journal || null}
            topicId={p.topicId || null}
            topicName={p.topicName || p.field || null}
            keywordId={p.keywords?.[0]?.keywordId || null}
            keywordText={
              typeof p.keywords?.[0] === 'string'
                ? p.keywords[0]
                : p.keywords?.[0]?.keywordText || null
            }
          />
        </div>

        {/* ── Journal & DOI ── */}
        {(p.journal || p.doi) && (
          <div className="space-y-1.5 border-t border-gray-100 border-[#DEDBC8]/5 pt-4">
            {p.journal && (
              <p className="text-xs text-gray-600 dark:text-slate-400 flex items-center gap-1.5">
                <BookOpen size={13} className="text-gray-400 dark:text-slate-500 flex-shrink-0" />
                <span className="italic">{p.journal}</span>
              </p>
            )}
            {p.doi && (
              <Button
                type="button"
                variant="outline"
                onClick={() => window.open(`https://doi.org/${p.doi}`, '_blank')}
                className="flex items-center gap-2 text-xs bg-white dark:bg-white/[0.02] border-[#DEDBC8]/10 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <ExternalLink size={13} />
                View Source
              </Button>
            )}
          </div>
        )}

        {/* ── Abstract ── */}
        {p.abstract && (
          <div className="border-t border-gray-100 border-[#DEDBC8]/5 pt-4">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2">
              Abstract
            </h5>
            <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">
              {p.abstract}
            </p>
          </div>
        )}

        {/* ── Keywords ── */}
        {p.keywordsArray.length > 0 && (
          <div className="border-t border-gray-100 border-[#DEDBC8]/5 pt-4">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2">
              Keywords
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {p.keywordsArray.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2.5 py-1 rounded-md font-bold tracking-wide bg-blue-50/60 text-blue-600 border border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400"
                >
                  #{tag.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer actions ── */}
        <DialogFooter className="border-t border-gray-100 border-[#DEDBC8]/5 pt-4 mt-2 gap-2">
          {p.pdfAvailable && p.pdfUrl && (
            <Button
              type="button"
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Download size={14} />
              Download PDF
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={handleScholarSearch}
            className="flex items-center gap-2 text-xs bg-white dark:bg-white/[0.02] border-[#DEDBC8]/10 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5"
          >
            <ExternalLink size={14} />
            Search on Google Scholar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
