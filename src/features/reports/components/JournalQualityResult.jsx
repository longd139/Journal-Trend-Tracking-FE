import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  BookOpen, Hash, TrendingUp, Award, Tag, Lightbulb, Building2, Quote,
} from 'lucide-react';
import ExportButtons from './ExportButtons';

/**
 * Journal Quality Report — formatted result panel.
 *
 * Displays: quartile badge, impact factor, stat cards (papers, citations, score),
 * editorial taste text, top keywords, and insight text.
 *
 * @param {object}   props
 * @param {object}   props.data       - JournalQualityReportResponse from BE
 * @param {function} props.onClose    - Called to dismiss the result
 * @param {function} props.onSave     - Called to save report to history
 * @param {boolean}  props.saving     - Whether save is in progress
 */
export default function JournalQualityResult({ data, onClose, onSave, saving }) {
  const { t } = useTranslation('reports');
  const resultRef = useRef(null);

  if (!data) return null;

  const {
    reportTitle,
    journalName,
    issn,
    publisher,
    quartile,
    impactFactor,
    score,
    taste,
    insight,
    totalPapers,
    totalCitations,
    topKeywords = [],
  } = data;

  // ── Quartile color mapping ──
  const quartileColors = {
    Q1: '#34D399',
    Q2: '#4F8CFF',
    Q3: '#F59E0B',
    Q4: '#EF4444',
  };
  const qColor = quartileColors[quartile] || 'var(--muted-foreground)';

  // ── Format score ──
  const formattedScore = score != null
    ? (Number.isInteger(score) ? score : score.toFixed(1))
    : '—';

  return (
    <motion.div
      ref={resultRef}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl border border-primary/10 bg-card overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            {t('journalQuality.headerBadge')}
          </p>
          <h3 className="text-base font-bold text-foreground">
            {reportTitle || t('journalQuality.reportTitle', { name: journalName })}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
            <p className="text-sm text-primary font-mono">{journalName}</p>
            {publisher && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Building2 size={10} />
                {publisher}
              </span>
            )}
            {issn && (
              <span className="text-xs text-muted-foreground font-mono">
                {t('journalQuality.issnPrefix')}{issn}
              </span>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground/80 transition-colors px-2 py-1"
          >
            ✕
          </button>
        )}
      </div>

      <div className="p-6 space-y-5">
        {/* ── Quartile + Impact Factor badges ── */}
        <div className="flex flex-wrap items-center gap-3">
          {quartile && (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: `${qColor}1A`,
                color: qColor,
                border: `1px solid ${qColor}44`,
              }}
            >
              <Award size={12} />
              {quartile}
            </span>
          )}
          {impactFactor != null && (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
            >
              <TrendingUp size={12} />
              {t('journalQuality.ifPrefix')}{impactFactor}
            </span>
          )}
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl p-4 border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Hash size={13} className="text-accent-blue" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {t('stats.totalPapers')}
              </span>
            </div>
            <p className="text-xl font-bold text-foreground font-mono tabular-nums">
              {totalPapers != null ? totalPapers.toLocaleString() : '—'}
            </p>
          </div>
          <div className="rounded-xl p-4 border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Quote size={13} className="text-accent-teal" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {t('stats.citations')}
              </span>
            </div>
            <p className="text-xl font-bold text-foreground font-mono tabular-nums">
              {totalCitations != null ? totalCitations.toLocaleString() : '—'}
            </p>
          </div>
          <div className="rounded-xl p-4 border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Award size={13} className="text-amber-600 dark:text-amber-500" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {t('stats.score')}
              </span>
            </div>
            <p className="text-xl font-bold text-foreground font-mono tabular-nums">
              {formattedScore}
            </p>
          </div>
        </div>

        {/* ── Editorial Taste ── */}
        {taste && (
          <div className="rounded-xl p-4 border border-border bg-card">
            <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
              <BookOpen size={13} className="text-primary" />
              {t('journalQuality.editorialFocus')}
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed">{taste}</p>
          </div>
        )}

        {/* ── Top Keywords ── */}
        {topKeywords.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-2.5 flex items-center gap-2">
              <Tag size={13} className="text-primary" />
              {t('journalQuality.recentKeywords')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {topKeywords.map((kw) => (
                <span
                  key={kw}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border
                    bg-primary/5 border-primary/10 text-primary"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Insight ── */}
        {insight && (
          <div className="rounded-xl p-4 border border-border bg-card">
            <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
              <Lightbulb size={13} className="text-amber-600 dark:text-amber-500" />
              {t('journalQuality.insight')}
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed">{insight}</p>
          </div>
        )}

        {/* ── Actions ── */}
        <ExportButtons
          contentRef={resultRef}
          jsonData={data}
          filename={`journal_quality_${journalName || 'report'}`}
          accentColor="var(--primary)"
          onSave={onSave}
          saving={saving}
        />
      </div>
    </motion.div>
  );
}
