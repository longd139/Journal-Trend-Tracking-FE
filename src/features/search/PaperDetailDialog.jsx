import * as React from 'react';
import { BookOpen, ExternalLink, FileText, Download, BrainCircuit, Cpu, RefreshCw, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
import { aiAPI } from '../../lib/api/ai.api.js';

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

  // ── AI Summary ──
  const { t } = useTranslation('search');
  const [aiData, setAiData] = React.useState(null);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiError, setAiError] = React.useState(null);

  React.useEffect(() => {
    if (!p?.paperId || !open) return;
    let cancelled = false;
    async function fetchAI() {
      setAiLoading(true);
      setAiError(null);
      try {
        const data = await aiAPI.summarize(p.paperId);
        if (!cancelled) setAiData(data);
      } catch (err) {
        if (!cancelled) setAiError(err?.message || 'Failed');
      } finally {
        if (!cancelled) setAiLoading(false);
      }
    }
    fetchAI();
    return () => { cancelled = true; };
  }, [p?.paperId, open]);

  if (!p) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-card border-border text-foreground">
        {/* ── Header ── */}
        <DialogHeader>
          <DialogTitle className="text-base font-bold leading-snug pr-6">
            {p.title || 'Untitled Paper'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1.5">
            {p.authors}
            {p.year && <span className="ml-2">({p.year})</span>}
          </DialogDescription>
        </DialogHeader>

        {/* ── Meta badges row ── */}
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {p.field && (
            <Badge
              variant="outline"
              className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-blue-500/10 text-primary border-blue-500/25"
            >
              {p.field}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {p.citations.toLocaleString()} citations
          </span>
          {p.pdfAvailable && p.pdfUrl && (
            <Badge className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <FileText size={11} className="mr-1" />
              PDF Available
            </Badge>
          )}
        </div>

        {/* ── Follow ── */}
        <div className="flex items-center gap-2 border-t border-border pt-4">
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
          <div className="space-y-1.5 border-t border-border pt-4">
            {p.journal && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <BookOpen size={13} className="text-muted-foreground flex-shrink-0" />
                <span className="italic">{p.journal}</span>
              </p>
            )}
            {p.doi && (
              <Button
                type="button"
                variant="outline"
                onClick={() => window.open(`https://doi.org/${p.doi}`, '_blank')}
                className="flex items-center gap-2 text-xs border-input text-muted-foreground hover:bg-foreground hover:text-background hover:border-foreground active:scale-[0.97] transition-all"
              >
                <ExternalLink size={13} />
                View Source
              </Button>
            )}
          </div>
        )}

        {/* ── Abstract ── */}
        {p.abstract && (
          <div className="border-t border-border pt-4">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Abstract
            </h5>
            <p className="text-xs text-foreground/80 leading-relaxed">
              {p.abstract}
            </p>
          </div>
        )}

        {/* ── AI Summary (compact) ── */}
        {aiLoading && (
          <div className="border-t border-border pt-4 animate-pulse">
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-4 h-4 rounded-md bg-accent-blue/20" />
              <div className="h-3 w-16 rounded bg-primary/8" />
            </div>
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-md bg-muted/30 border border-border p-3">
                  <div className="h-2.5 w-16 rounded bg-accent-blue/10 mb-2" />
                  <div className="h-2.5 w-full rounded bg-primary/5" />
                </div>
              ))}
            </div>
          </div>
        )}

        {!aiLoading && aiError && (
          <div className="border-t border-border pt-3">
            <div className="flex items-center gap-2 text-[10px] text-amber-400/70">
              <AlertCircle size={11} className="shrink-0" />
              <span>{t('aiSummary.error')}</span>
            </div>
          </div>
        )}

        {!aiLoading && !aiError && aiData && (
          (() => {
            const sections = aiData.aiSummarySections?.length > 0
              ? aiData.aiSummarySections
              : aiData.aiSummary
                ? aiData.aiSummary
                    .split(/(?<=[.!?])\s+/)
                    .filter((s) => s.trim().length > 0)
                    .map((s) => ({ heading: null, content: s }))
                : [];
            const hasContent = sections.length > 0;
            const hasMethodology = aiData.methodology;
            const isStructured = aiData.aiSummarySections?.length > 0;

            if (!hasContent && !hasMethodology) {
              return (
                <div className="border-t border-border pt-3">
                  <div className="flex items-center gap-2 text-[10px] text-accent-blue/50">
                    <BrainCircuit size={11} className="shrink-0" />
                    <span>{t('aiSummary.unavailable')}</span>
                  </div>
                </div>
              );
            }

            const DIALOG_COLORS = [
              { bg: 'bg-accent-blue/8', text: 'text-accent-blue', border: 'border-accent-blue/12', dot: 'bg-accent-blue' },
              { bg: 'bg-violet-500/8', text: 'text-violet-500', border: 'border-violet-500/12', dot: 'bg-violet-500' },
              { bg: 'bg-accent-teal/8', text: 'text-accent-teal', border: 'border-accent-teal/12', dot: 'bg-accent-teal' },
            ];

            return (
              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <div className="w-5 h-5 rounded-md bg-accent-blue/10 flex items-center justify-center">
                    <BrainCircuit size={11} className="text-accent-blue" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-accent-blue">
                    {t('aiSummary.title')}
                  </span>
                </div>
                <div className={isStructured ? 'space-y-2' : 'pl-4 border-l-2 border-accent-blue/15 space-y-1.5'}>
                  {sections.slice(0, 4).map((section, i) => {
                    const c = DIALOG_COLORS[i % DIALOG_COLORS.length];
                    return isStructured ? (
                      <div key={i} className={`rounded-md ${c.bg} border ${c.border} p-2.5`}>
                        {section.heading && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`w-1 h-1 rounded-full ${c.dot} shrink-0`} />
                            <span className={`text-[9px] font-bold ${c.text} uppercase tracking-wide`}>
                              {section.heading}
                            </span>
                          </div>
                        )}
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    ) : (
                      <div key={i} className="flex gap-2">
                        <span className="text-[9px] font-bold text-accent-blue/30 shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {hasMethodology && (
                  <div className="mt-2 ml-4 pl-4 border-l-2 border-border">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent-teal/[0.06] border border-accent-teal/12">
                      <Cpu size={10} className="text-accent-teal shrink-0" />
                      <span className="text-[10px] font-semibold text-accent-teal">{aiData.methodology}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()
        )}

        {/* ── Keywords ── */}
        {p.keywordsArray.length > 0 && (
          <div className="border-t border-border pt-4">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Keywords
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {p.keywordsArray.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2.5 py-1 rounded-md font-bold tracking-wide bg-blue-500/10 text-blue-600 border border-blue-500/20"
                >
                  #{tag.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer actions ── */}
        <DialogFooter className="border-t border-border pt-4 mt-2 gap-2">
          {p.pdfAvailable && p.pdfUrl && (
            <Button
              type="button"
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 bg-foreground hover:bg-foreground/80 text-background text-xs font-semibold px-4 py-2 rounded-lg shadow-lg active:scale-[0.97] transition-all"
            >
              <Download size={14} />
              Download PDF
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={handleScholarSearch}
            className="flex items-center gap-2 text-xs bg-card border-border text-foreground hover:bg-muted/50"
          >
            <ExternalLink size={14} />
            Search on Google Scholar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
