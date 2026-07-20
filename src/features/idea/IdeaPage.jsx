import { useState, useEffect, useCallback, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  Search,
  X,
  Plus,
  RefreshCw,
  Trash2,
  ArrowLeft,
  Copy,
  Download,
  Loader2,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Check,
  AlertTriangle,
  FileText,
  ExternalLink,
  Clock,
  Zap,
  ChevronRight,
  Hash,
} from 'lucide-react';
import { toast } from 'sonner';
import { ideaAPI } from './api.js';
import { useIdeaAnalysisStore } from '../../store/useIdeaAnalysisStore.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════════ */

const MAX_CHARS = 2000;
const CRITERIA_ORDER = ['TOPIC_MATCH', 'METHOD_RELEVANT', 'GAP_ADDRESSED', 'CITE_WORTHY'];

const LOADING_STEPS = [
  'searching',
  'downloading',
  'evaluating',
  'gapAnalysis',
  'literatureReview',
];

/* ═══════════════════════════════════════════════════════════════════════════
   Helper: criterion icon + color
   ═══════════════════════════════════════════════════════════════════════════ */

function CriterionBadge({ value }) {
  return value ? (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40">
      <Check size={15} strokeWidth={2.5} />
    </span>
  ) : (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-500/40">
      <X size={15} strokeWidth={2.5} />
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Step 1: Idea Input
   ═══════════════════════════════════════════════════════════════════════════ */

function Step1IdeaInput({ ideaText, setIdeaText, onSubmit, loading, t }) {
  const charsLeft = MAX_CHARS - ideaText.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-4"
    >
      <div>
        <h3 className="text-lg font-bold text-foreground">
          {t('idea:newAnalysis.step1.title')}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('idea:newAnalysis.step1.description')}
        </p>
      </div>

      <div className="relative">
        <textarea
          value={ideaText}
          onChange={(e) => setIdeaText(e.target.value.slice(0, MAX_CHARS))}
          placeholder={t('idea:newAnalysis.step1.placeholder')}
          rows={10}
          className="w-full bg-card/80 border border-primary/15 rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/30 transition-all"
        />
        <div className="absolute bottom-3 right-3 text-[11px] text-muted-foreground">
          {t('idea:newAnalysis.step1.charCount', {
            current: ideaText.length,
            max: MAX_CHARS,
          })}
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={!ideaText.trim() || loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-blue text-white text-sm font-bold hover:bg-accent-blue/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Sparkles size={16} />
        )}
        {t('idea:newAnalysis.step1.submit')}
      </button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Step 2: Keyword Selection
   ═══════════════════════════════════════════════════════════════════════════ */

function Step2KeywordSelection({
  extractedKeywords,
  suggestedKeywords,
  selectedKeywords,
  setSelectedKeywords,
  onConfirm,
  onRegenerate,
  loading,
  t,
}) {
  const [manualInput, setManualInput] = useState('');

  const toggleKeyword = (kw) => {
    setSelectedKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw],
    );
  };

  const addManualKeyword = () => {
    const trimmed = manualInput.trim();
    if (trimmed && !selectedKeywords.includes(trimmed)) {
      setSelectedKeywords((prev) => [...prev, trimmed]);
      setManualInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addManualKeyword();
    }
  };

  const allSuggested = suggestedKeywords.filter(
    (k) => !extractedKeywords.includes(k),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-5"
    >
      <div>
        <h3 className="text-lg font-bold text-foreground">
          {t('idea:newAnalysis.step2.title')}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('idea:newAnalysis.step2.description')}
        </p>
      </div>

      {/* Extracted keywords */}
      {extractedKeywords.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {t('idea:newAnalysis.step2.extractedLabel')}
          </p>
          <div className="flex flex-wrap gap-2">
            {extractedKeywords.map((kw) => {
              const active = selectedKeywords.includes(kw);
              return (
                <button
                  key={kw}
                  onClick={() => toggleKeyword(kw)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    active
                      ? 'bg-accent-blue/20 text-accent-blue border-accent-blue/40'
                      : 'bg-muted/20 text-muted-foreground border-primary/15 hover:border-primary/20 hover:text-foreground'
                  }`}
                >
                  {kw}
                  {active && <X size={12} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Suggested keywords */}
      {allSuggested.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {t('idea:newAnalysis.step2.suggestedLabel')}
          </p>
          <div className="flex flex-wrap gap-2">
            {allSuggested.map((kw) => {
              const active = selectedKeywords.includes(kw);
              return (
                <button
                  key={kw}
                  onClick={() => toggleKeyword(kw)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    active
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40'
                      : 'bg-muted/20 text-muted-foreground border-dashed border-border hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:text-emerald-600'
                  }`}
                >
                  {active ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <Plus size={12} />
                  )}
                  {kw}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected keywords summary */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {t('idea:newAnalysis.step2.yourKeywordsLabel')}{' '}
          <span className="text-foreground">({selectedKeywords.length})</span>
        </p>
        {selectedKeywords.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            {t('idea:newAnalysis.step2.noKeywords')}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedKeywords.map((kw) => (
              <span
                key={kw}
                onClick={() => toggleKeyword(kw)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-accent-blue/15 text-accent-blue border border-accent-blue/30 cursor-pointer hover:bg-red-50 dark:hover:bg-red-500/15 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/30 transition-all"
              >
                {kw}
                <X size={12} />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Manual add */}
      <div className="flex gap-2">
        <input
          type="text"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('idea:newAnalysis.step2.addPlaceholder')}
          className="flex-1 bg-card/80 border border-primary/15 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent-blue/50 transition-all"
        />
        <button
          onClick={addManualKeyword}
          disabled={!manualInput.trim()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted/10 text-foreground/80 text-sm font-medium hover:bg-muted/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Plus size={14} />
          {t('idea:newAnalysis.step2.addButton')}
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onRegenerate}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-muted/20 text-muted-foreground text-sm font-medium hover:bg-muted/10 hover:text-foreground disabled:opacity-30 transition-all"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          {t('idea:newAnalysis.step2.regenerateKeywords')}
        </button>

        <button
          onClick={onConfirm}
          disabled={selectedKeywords.length === 0 || loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-teal text-black text-sm font-bold hover:bg-accent-teal/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Search size={15} />
          {t('idea:newAnalysis.step2.confirmSearch')}
        </button>
      </div>

      {selectedKeywords.length === 0 && (
        <p className="text-xs text-amber-600/80 dark:text-amber-400/80 flex items-center gap-1.5">
          <AlertCircle size={12} />
          {t('idea:newAnalysis.step2.minKeywordsWarning')}
        </p>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Step 3: Loading / Progress
   ═══════════════════════════════════════════════════════════════════════════ */

function Step3Loading({ t }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timers = LOADING_STEPS.map((_, i) =>
      setTimeout(() => setCurrentStep(i + 1), (i + 1) * 7000),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 space-y-6"
    >
      {/* Animated icon */}
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center">
          <Loader2 size={28} className="text-accent-blue animate-spin" />
        </div>
        <div className="absolute -inset-1 rounded-2xl bg-accent-blue/5 animate-pulse" />
      </div>

      <h3 className="text-lg font-bold text-foreground">
        {t('idea:newAnalysis.step3.title')}
      </h3>

      <div className="space-y-3 w-full max-w-md">
        {LOADING_STEPS.map((step, i) => {
          const isComplete = i < currentStep;
          const isActive = i === currentStep;

          return (
            <div
              key={step}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all ${
                isComplete
                  ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : isActive
                    ? 'bg-accent-blue/5 border-accent-blue/20 text-accent-blue'
                    : 'bg-muted/15 border-border text-muted-foreground'
              }`}
            >
              {isComplete ? (
                <CheckCircle2 size={16} />
              ) : isActive ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-border" />
              )}
              <span className="text-sm font-medium">
                {t(`idea:newAnalysis.step3.${step}`)}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        {t('idea:newAnalysis.step3.estimatedTime')}
      </p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Gap Analysis Panel
   ═══════════════════════════════════════════════════════════════════════════ */

function GapAnalysisPanel({ gapAnalysis, t }) {
  if (!gapAnalysis) return null;

  const {
    solvedAreas = [],
    partiallyAddressed = [],
    researchGaps = [],
    suggestedDirections = [],
    noveltyScore = 0,
    noveltyExplanation = '',
  } = gapAnalysis;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <TrendingUp size={18} className="text-accent-teal" />
        <h3 className="text-base font-bold text-foreground">
          {t('idea:newAnalysis.step4.gapAnalysisTitle')}
        </h3>
      </div>

      {/* Solved Areas */}
      {solvedAreas.length > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/15 rounded-xl p-4">
          <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-3">
            <CheckCircle2 size={14} />
            {t('idea:newAnalysis.step4.solvedAreas')}
          </h4>
          <div className="space-y-2">
            {solvedAreas.map((item, i) => (
              <div key={i} className="text-sm">
                <p className="text-foreground font-medium">• {item.area}</p>
                <p className="text-muted-foreground text-xs mt-0.5 ml-4">
                  <span className="text-muted-foreground">
                    {item.papers?.join(', ')}
                  </span>
                  {' — '}
                  {item.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partially Addressed */}
      {partiallyAddressed.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/15 rounded-xl p-4">
          <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2 mb-3">
            <AlertTriangle size={14} />
            {t('idea:newAnalysis.step4.partiallyAddressed')}
          </h4>
          <div className="space-y-2">
            {partiallyAddressed.map((item, i) => (
              <div key={i} className="text-sm">
                <p className="text-foreground font-medium">• {item.area}</p>
                <p className="text-muted-foreground text-xs mt-0.5 ml-4">
                  <span className="text-muted-foreground">
                    {item.papers?.join(', ')}
                  </span>
                  {' — '}
                  {item.limitation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Research Gaps */}
      {researchGaps.length > 0 && (
        <div className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/15 rounded-xl p-4">
          <h4 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2 mb-3">
            <AlertCircle size={14} />
            {t('idea:newAnalysis.step4.researchGaps')}
          </h4>
          <div className="space-y-3">
            {researchGaps.map((item, i) => (
              <div key={i} className="text-sm">
                <p className="text-foreground font-medium">
                  🔴 {item.gap}
                </p>
                <p className="text-muted-foreground text-xs mt-0.5 ml-5">
                  {item.rationale}
                </p>
                {item.suggestedDirection && (
                  <p className="text-accent-blue text-xs mt-0.5 ml-5">
                    💡 {item.suggestedDirection}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Directions */}
      {suggestedDirections.length > 0 && (
        <div className="bg-accent-blue/5 border border-accent-blue/15 rounded-xl p-4">
          <h4 className="text-sm font-bold text-accent-blue flex items-center gap-2 mb-3">
            <Lightbulb size={14} />
            {t('idea:newAnalysis.step4.suggestedDirections')}
          </h4>
          <ol className="space-y-1.5 list-decimal list-inside">
            {suggestedDirections.map((dir, i) => (
              <li key={i} className="text-sm text-foreground">
                {dir}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Novelty Score */}
      <div className="bg-muted/20 border border-primary/15 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-foreground">
            {t('idea:newAnalysis.step4.noveltyScore')}
          </span>
          <span className="text-lg font-black text-accent-teal">
            {noveltyScore}%
          </span>
        </div>
        <div className="w-full h-2 bg-muted/10 rounded-full overflow-hidden mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${noveltyScore}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-teal"
          />
        </div>
        <p className="text-xs text-muted-foreground">{noveltyExplanation}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Literature Review Panel
   ═══════════════════════════════════════════════════════════════════════════ */

function LiteratureReviewPanel({ literatureReview, t }) {
  if (!literatureReview) return null;

  const { text = '', references = [] } = literatureReview;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('idea:newAnalysis.step4.textCopied'));
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleExportBibtex = () => {
    const bibtex = references
      .map((ref) => {
        const authorKey = ref.authors
          ?.split(',')[0]
          ?.trim()
          ?.split(' ')[0]
          ?.toLowerCase() || 'unknown';
        const year = ref.year || 'n.d.';
        return `@article{${authorKey}${year},
  title = {${ref.paperTitle || ''}},
  author = {${ref.authors || ''}},
  journal = {${ref.journal || ''}},
  year = {${ref.year || ''}},
  doi = {${ref.doi || ''}}
}`;
      })
      .join('\n\n');

    const blob = new Blob([bibtex], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'references.bib';
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('idea:newAnalysis.step4.bibtexExported'));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText size={18} className="text-accent-blue" />
        <h3 className="text-base font-bold text-foreground">
          {t('idea:newAnalysis.step4.literatureReviewTitle')}
        </h3>
      </div>

      {/* Review text */}
      <div className="bg-muted/20 border border-primary/15 rounded-xl p-5 max-h-80 overflow-y-auto">
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
          {text}
        </p>
      </div>

      {/* References */}
      {references.length > 0 && (
        <div className="bg-muted/15 border border-primary/15 rounded-xl p-4">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            {t('idea:newAnalysis.step4.references')}
          </h4>
          <div className="space-y-1.5">
            {references.map((ref) => (
              <p key={ref.number} className="text-xs text-muted-foreground">
                [{ref.number}] {ref.authors} ({ref.year}). "{ref.paperTitle}
                ." <span className="italic">{ref.journal}</span>.
                {ref.doi && (
                  <a
                    href={`https://doi.org/${ref.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-blue hover:underline ml-1"
                  >
                    {ref.doi}
                  </a>
                )}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/10 text-foreground/80 text-xs font-medium hover:bg-muted/15 transition-all"
        >
          <Copy size={13} />
          {t('idea:newAnalysis.step4.copyText')}
        </button>
        <button
          onClick={handleExportBibtex}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/10 text-foreground/80 text-xs font-medium hover:bg-muted/15 transition-all"
        >
          <Download size={13} />
          {t('idea:newAnalysis.step4.exportBibtex')}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Paper Evaluation Table
   ═══════════════════════════════════════════════════════════════════════════ */

function PaperEvaluationTable({ papers, gapAnalysis, literatureReview, t }) {
  const [expandedCell, setExpandedCell] = useState(null); // { paperId, criterion } or null

  const toggleExpand = (paperId, criterion) => {
    setExpandedCell((prev) =>
      prev?.paperId === paperId && prev?.criterion === criterion
        ? null
        : { paperId, criterion },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Hash size={18} className="text-foreground" />
        <h3 className="text-base font-bold text-foreground">
          {t('idea:newAnalysis.step4.paperEvaluationTitle')}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Paper Title
              </th>
              {CRITERIA_ORDER.map((c) => (
                <th
                  key={c}
                  className="text-center py-3 px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                >
                  {t(`idea:newAnalysis.criteria.${c}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {papers.map((paper, i) => {
              const paperId = paper.paperId || i;
              const isExpanded = expandedCell?.paperId === paperId;
              const expandedCriterion = isExpanded ? expandedCell.criterion : null;

              return (
                <Fragment key={paperId}>
                  {/* Main paper row */}
                  <tr className="border-b border-border hover:bg-muted/15 transition-colors">
                    {/* Title */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground font-mono">
                          #{i + 1}
                        </span>
                        <div>
                          <a
                            href={paper.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-foreground hover:text-accent-blue transition-colors inline-flex items-center gap-1"
                          >
                            {paper.title}
                            <ExternalLink size={11} />
                          </a>
                          {paper.abstractText && (
                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                              {paper.abstractText}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Criteria cells */}
                    {CRITERIA_ORDER.map((criterion) => {
                      const crit = paper.criteria?.find(
                        (c) => c.criterionName === criterion,
                      );
                      const value = crit?.value;

                      return (
                        <td key={criterion} className="py-3 px-2 text-center align-top">
                          <button
                            onClick={() => toggleExpand(paperId, criterion)}
                            className="cursor-pointer hover:scale-110 transition-transform"
                            title={t('idea:newAnalysis.step4.evidenceFromPaper')}
                          >
                            <CriterionBadge value={value} />
                          </button>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Expanded evidence row — smooth dropdown, no layout shift */}
                  <tr>
                    <td colSpan={5} className="p-0 border-0">
                      <motion.div
                        initial={false}
                        animate={{
                          height: isExpanded ? 'auto' : 0,
                          opacity: isExpanded ? 1 : 0,
                        }}
                        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                        className="overflow-hidden"
                      >
                        {expandedCriterion && (() => {
                          const crit = paper.criteria?.find((c) => c.criterionName === expandedCriterion);
                          const isTrue = crit?.value === true;
                          return (
                            <div
                              className={`rounded-lg p-3 mb-2 ml-8 border ${
                                isTrue
                                  ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/40'
                                  : 'bg-red-50 dark:bg-red-500/15 border-red-300 dark:border-red-500/40'
                              }`}
                            >
                              <EvidenceContent
                                paper={paper}
                                criterion={expandedCriterion}
                                t={t}
                                onClose={() => setExpandedCell(null)}
                              />
                            </div>
                          );
                        })()}
                      </motion.div>
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Renders evidence quote for a specific criterion of a paper */
function EvidenceContent({ paper, criterion, t, onClose }) {
  const crit = paper.criteria?.find((c) => c.criterionName === criterion);
  const value = crit?.value;
  const evidence = crit?.evidenceQuote || '';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t(`idea:newAnalysis.criteria.${criterion}`)}
          </span>
          <CriterionBadge value={value} />
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground/80 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      <p className="text-xs text-muted-foreground italic mb-1.5">
        {paper.title}
      </p>
      {evidence ? (
        <blockquote className="text-sm text-foreground leading-relaxed border-l-2 border-accent-blue/40 pl-3 py-1">
          "{evidence}"
        </blockquote>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t('idea:newAnalysis.step4.noEvidence')}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   History Tab
   ═══════════════════════════════════════════════════════════════════════════ */

function HistoryTab({
  historyItems,
  loading,
  totalItems,
  page,
  setPage,
  totalPages,
  onView,
  onContinue,
  onDelete,
  t,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!historyItems || historyItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-muted/20 border border-primary/15 flex items-center justify-center mb-4">
          <Clock size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-base font-bold text-foreground mb-1">
          {t('idea:history.empty.title')}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {t('idea:history.empty.description')}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {historyItems.map((item) => (
        <motion.div
          key={item.analysisId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onView(item)}
          className="bg-card border border-primary/20 rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Idea text preview */}
              <p className="text-sm font-medium text-foreground line-clamp-2 mb-2">
                "{item.ideaText}"
              </p>

              {/* Keywords */}
              {item.keywords && item.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {item.keywords.slice(0, 5).map((kw) => (
                    <span
                      key={kw}
                      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent-blue/10 text-accent-blue border border-accent-blue/20"
                    >
                      {kw}
                    </span>
                  ))}
                  {item.keywords.length > 5 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{item.keywords.length - 5}
                    </span>
                  )}
                </div>
              )}

              {/* Meta */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText size={11} />
                  {t('idea:history.item.papers', { count: item.paperCount })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                {item.noveltyScore != null && (
                  <span className="flex items-center gap-1 text-accent-teal font-semibold">
                    <Zap size={11} />
                    {t('idea:history.item.noveltyScore', {
                      score: item.noveltyScore,
                    })}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); onContinue(item); }}
                className="p-2 rounded-lg text-muted-foreground hover:text-accent-teal hover:bg-accent-teal/10 transition-all"
                title={t('idea:history.item.continue')}
              >
                <RefreshCw size={15} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                className="p-2 rounded-lg text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                title={t('idea:history.item.delete')}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted/20 text-muted-foreground hover:bg-muted/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <span className="text-xs text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted/20 text-muted-foreground hover:bg-muted/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   History Detail View
   ═══════════════════════════════════════════════════════════════════════════ */

function HistoryDetail({ detail, onBack, t }) {
  if (!detail) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Back button + meta */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={15} />
          {t('idea:history.detail.back')}
        </button>
        <span className="text-xs text-muted-foreground">
          {t('idea:history.detail.performedOn', {
            date: new Date(detail.createdAt).toLocaleDateString(),
          })}
        </span>
        <span className="text-xs text-muted-foreground">
          {t('idea:history.detail.paperCount', {
            count: detail.papers?.length || 0,
          })}
        </span>
      </div>

      {/* Original idea */}
      <div className="bg-muted/20 border border-primary/15 rounded-xl p-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          {t('idea:history.detail.originalIdea')}
        </h4>
        <p className="text-sm text-foreground leading-relaxed">{detail.ideaText}</p>
      </div>

      {/* Keywords */}
      {detail.keywords && detail.keywords.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            {t('idea:history.detail.keywords')}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {detail.keywords.map((kw) => (
              <span
                key={kw}
                className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-accent-blue/10 text-accent-blue border border-accent-blue/20"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Gap Analysis */}
      <GapAnalysisPanel gapAnalysis={detail.gapAnalysis} t={t} />

      {/* Literature Review */}
      <LiteratureReviewPanel
        literatureReview={detail.literatureReview}
        t={t}
      />

      {/* Paper Evaluation Table */}
      <PaperEvaluationTable papers={detail.papers || []} t={t} />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main IdeaPage
   ═══════════════════════════════════════════════════════════════════════════ */

export default function IdeaPage() {
  const { t } = useTranslation('idea');

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'history'

  // ── New Analysis: step wizard ──
  const [step, setStep] = useState(1);
  const [ideaText, setIdeaText] = useState('');
  const [extractedKeywords, setExtractedKeywords] = useState([]);
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);

  // ── Results ──
  const [results, setResults] = useState(null); // { analysisId, keywords, papers, gapAnalysis, literatureReview }

  // ── History ──
  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotalItems, setHistoryTotalItems] = useState(0);

  // ── History detail ──
  const [detailView, setDetailView] = useState(null); // full detail object
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Delete confirm ──
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Loading states ──
  const [extractLoading, setExtractLoading] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);

  // ── Background analysis store ──
  const analysisTask = useIdeaAnalysisStore((s) => s.task);
  const clearAndAcknowledge = useIdeaAnalysisStore((s) => s.clearAndAcknowledge);

  // ── Load history on mount & tab switch ──
  const fetchHistory = useCallback(
    async (page = 0) => {
      setHistoryLoading(true);
      try {
        const res = await ideaAPI.getHistory({ page, size: 10 });
        setHistoryItems(res.items || []);
        setHistoryTotalPages(res.totalPages || 1);
        setHistoryTotalItems(res.totalItems || 0);
      } catch (err) {
        console.error('Failed to load history:', err);
        toast.error(t('idea:history.loadError'));
      } finally {
        setHistoryLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory(historyPage);
    }
  }, [activeTab, historyPage, fetchHistory]);

  // ── Step 1 → Extract keywords ──
  const handleExtractKeywords = async () => {
    if (!ideaText.trim()) return;
    setExtractLoading(true);
    try {
      const res = await ideaAPI.extractKeywords(ideaText);
      const extracted = res.extractedKeywords || [];
      const suggested = res.suggestedKeywords || [];
      setExtractedKeywords(extracted);
      setSuggestedKeywords(suggested);
      // Auto-select all extracted keywords
      setSelectedKeywords([...extracted]);
      setStep(2);
    } catch (err) {
      console.error('Failed to extract keywords:', err);
      toast.error(err.message || 'Failed to extract keywords');
    } finally {
      setExtractLoading(false);
    }
  };

  // ── React to background analysis task completion ──
  useEffect(() => {
    if (!analysisTask) return;
    if (analysisTask.status === 'done' && analysisTask.result && step !== 4) {
      setResults(analysisTask.result);
      setStep(4);
      setAnalyzeLoading(false);
    }
    if (analysisTask.status === 'error' && step === 3) {
      toast.error(analysisTask.error || 'Analysis failed');
      setStep(2);
      setAnalyzeLoading(false);
    }
  }, [analysisTask?.status, analysisTask?.result]);

  // ── Mount-time check: consume completed task when navigating back ──
  useEffect(() => {
    if (activeTab !== 'new') return;
    const task = useIdeaAnalysisStore.getState().task;
    if (!task) return;
    if (task.status === 'done' && task.result) {
      setResults(task.result);
      setStep(4);
      setAnalyzeLoading(false);
      clearAndAcknowledge();
    } else if (task.status === 'running' && step < 3) {
      setStep(3);
      setAnalyzeLoading(true);
    }
  }, [activeTab]);

  // ── Step 2 → Analyze (dispatches to background store) ──
  const handleAnalyze = () => {
    if (selectedKeywords.length === 0) return;
    useIdeaAnalysisStore.getState().startAnalysis({ ideaText, selectedKeywords });
    setAnalyzeLoading(true);
    setStep(3);
  };

  // ── Regenerate keywords (from step 2) ──
  const handleRegenerateKeywords = async () => {
    setExtractLoading(true);
    try {
      const res = await ideaAPI.extractKeywords(ideaText);
      const extracted = res.extractedKeywords || [];
      const suggested = res.suggestedKeywords || [];
      setExtractedKeywords(extracted);
      setSuggestedKeywords(suggested);
      // Keep existing user-added keywords that aren't in extracted
      const userAdded = selectedKeywords.filter(
        (k) => !extractedKeywords.includes(k) && !suggestedKeywords.includes(k),
      );
      setSelectedKeywords([...extracted, ...userAdded]);
      toast.success('Keywords regenerated!');
    } catch (err) {
      toast.error('Failed to regenerate keywords');
    } finally {
      setExtractLoading(false);
    }
  };

  // ── History actions ──
  const handleView = async (item) => {
    setDetailLoading(true);
    try {
      const detail = await ideaAPI.getHistoryDetail(item.analysisId);
      setDetailView(detail);
    } catch (err) {
      toast.error(t('idea:history.detailLoadError'));
    } finally {
      setDetailLoading(false);
    }
  };

  const handleContinue = (item) => {
    useIdeaAnalysisStore.getState().dismissTask();
    setIdeaText(item.ideaText || '');
    setExtractedKeywords(item.keywords || []);
    setSuggestedKeywords([]);
    setSelectedKeywords([...(item.keywords || [])]);
    setResults(null);
    setActiveTab('new');
    setStep(2);
  };

  const handleDelete = async (item) => {
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await ideaAPI.deleteHistory(deleteTarget.analysisId);
      toast.success(t('idea:history.delete.success'));
      setDeleteTarget(null);
      fetchHistory(historyPage);
    } catch (err) {
      toast.error(t('idea:history.delete.error'));
    }
  };

  const handleNewAnalysis = () => {
    useIdeaAnalysisStore.getState().dismissTask();
    setIdeaText('');
    setExtractedKeywords([]);
    setSuggestedKeywords([]);
    setSelectedKeywords([]);
    setResults(null);
    setStep(1);
    setDetailView(null);
    setActiveTab('new');
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* ═══════════ Tab Bar ═══════════ */}
      <div className="flex items-center gap-1 bg-muted/20 border border-primary/15 rounded-xl p-1 w-fit">
        <button
          onClick={handleNewAnalysis}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'new'
              ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/20'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Lightbulb size={15} />
          {t('sidebar.newAnalysis')}
        </button>
        <button
          onClick={() => {
            setActiveTab('history');
            setDetailView(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/20'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock size={15} />
          {t('sidebar.history')}
          {historyTotalItems > 0 && (
            <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
              activeTab === 'history'
                ? 'bg-white/20 text-white'
                : 'bg-primary/15 text-primary font-bold'
            }`}>
              {historyTotalItems > 99 ? '99+' : historyTotalItems}
            </span>
          )}
        </button>
      </div>

      {/* ═══════════ Tab Content ═══════════ */}
      <AnimatePresence mode="wait">
        {activeTab === 'new' && (
          <motion.div
            key="new"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Step indicator */}
            {step < 3 && (
              <div className="flex items-center gap-3">
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                        step >= s
                          ? 'bg-accent-blue text-white border-accent-blue'
                          : 'bg-transparent text-muted-foreground border-primary/15'
                      }`}
                    >
                      {step > s ? <CheckCircle2 size={14} /> : s}
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        step >= s ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {s === 1
                        ? t('idea:newAnalysis.step1.title')
                        : t('idea:newAnalysis.step2.title')}
                    </span>
                    {s < 2 && (
                      <ChevronRight size={14} className="text-muted-foreground mx-1" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Step 1 */}
            {step === 1 && (
              <Step1IdeaInput
                ideaText={ideaText}
                setIdeaText={setIdeaText}
                onSubmit={handleExtractKeywords}
                loading={extractLoading}
                t={t}
              />
            )}

            {/* Step 2 */}
            {step === 2 && (
              <Step2KeywordSelection
                extractedKeywords={extractedKeywords}
                suggestedKeywords={suggestedKeywords}
                selectedKeywords={selectedKeywords}
                setSelectedKeywords={setSelectedKeywords}
                onConfirm={handleAnalyze}
                onRegenerate={handleRegenerateKeywords}
                loading={extractLoading || analyzeLoading}
                t={t}
              />
            )}

            {/* Step 3: Loading */}
            {step === 3 && (
              <div>
                <Step3Loading t={t} />
                <p className="text-center text-xs text-muted-foreground mt-2">
                  {t('idea:newAnalysis.step3.navigateAway')}
                </p>
              </div>
            )}

            {/* Step 4: Results */}
            {step === 4 && results && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <GapAnalysisPanel
                  gapAnalysis={results.gapAnalysis}
                  t={t}
                />
                <LiteratureReviewPanel
                  literatureReview={results.literatureReview}
                  t={t}
                />
                <PaperEvaluationTable
                  papers={results.papers || []}
                  t={t}
                />
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {detailLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-muted-foreground" />
              </div>
            ) : detailView ? (
              <HistoryDetail
                detail={detailView}
                onBack={() => setDetailView(null)}
                t={t}
              />
            ) : (
              <HistoryTab
                historyItems={historyItems}
                loading={historyLoading}
                totalItems={historyTotalItems}
                page={historyPage}
                setPage={setHistoryPage}
                totalPages={historyTotalPages}
                onView={handleView}
                onContinue={handleContinue}
                onDelete={handleDelete}
                t={t}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ Delete Confirmation Dialog ═══════════ */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card border border-primary/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  {t('idea:history.delete.title')}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                {t('idea:history.delete.description')}
              </p>
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/20 hover:bg-muted/10 transition-all"
                >
                  {t('idea:history.delete.cancel')}
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 transition-all"
                >
                  {t('idea:history.delete.confirm')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
