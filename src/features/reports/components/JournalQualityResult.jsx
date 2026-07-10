import { useRef } from 'react';
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
  const qColor = quartileColors[quartile] || '#6B7280';

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
      className="rounded-2xl border border-[#DEDBC8]/10 bg-[#101010] overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between p-5 border-b border-[#DEDBC8]/5">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
            Journal Quality Report
          </p>
          <h3 className="text-base font-bold text-[#E1E0CC]">
            {reportTitle || `Đánh giá chất lượng tạp chí: ${journalName}`}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
            <p className="text-sm text-[#DEDBC8] font-mono">{journalName}</p>
            {publisher && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Building2 size={10} />
                {publisher}
              </span>
            )}
            {issn && (
              <span className="text-xs text-gray-600 font-mono">
                ISSN: {issn}
              </span>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1"
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
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: '#DEDBC81A',
                color: '#DEDBC8',
                border: '1px solid rgba(222,219,200,0.27)',
              }}
            >
              <TrendingUp size={12} />
              IF: {impactFactor}
            </span>
          )}
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl p-4 border border-[#DEDBC8]/5 bg-[#0A0A0A]">
            <div className="flex items-center gap-2 mb-2">
              <Hash size={13} className="text-[#4F8CFF]" />
              <span className="text-[10px] uppercase tracking-wider text-gray-500">
                Total Papers
              </span>
            </div>
            <p className="text-xl font-bold text-[#E1E0CC] font-mono tabular-nums">
              {totalPapers != null ? totalPapers.toLocaleString() : '—'}
            </p>
          </div>
          <div className="rounded-xl p-4 border border-[#DEDBC8]/5 bg-[#0A0A0A]">
            <div className="flex items-center gap-2 mb-2">
              <Quote size={13} className="text-[#00D1B2]" />
              <span className="text-[10px] uppercase tracking-wider text-gray-500">
                Citations
              </span>
            </div>
            <p className="text-xl font-bold text-[#E1E0CC] font-mono tabular-nums">
              {totalCitations != null ? totalCitations.toLocaleString() : '—'}
            </p>
          </div>
          <div className="rounded-xl p-4 border border-[#DEDBC8]/5 bg-[#0A0A0A]">
            <div className="flex items-center gap-2 mb-2">
              <Award size={13} className="text-[#F59E0B]" />
              <span className="text-[10px] uppercase tracking-wider text-gray-500">
                Score
              </span>
            </div>
            <p className="text-xl font-bold text-[#E1E0CC] font-mono tabular-nums">
              {formattedScore}
            </p>
          </div>
        </div>

        {/* ── Editorial Taste ── */}
        {taste && (
          <div className="rounded-xl p-4 border border-[#DEDBC8]/5 bg-[#0A0A0A]">
            <h4 className="text-xs font-semibold text-[#E1E0CC] mb-2 flex items-center gap-2">
              <BookOpen size={13} className="text-[#DEDBC8]" />
              Editorial Focus
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed">{taste}</p>
          </div>
        )}

        {/* ── Top Keywords ── */}
        {topKeywords.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-[#E1E0CC] mb-2.5 flex items-center gap-2">
              <Tag size={13} className="text-[#DEDBC8]" />
              Recent Keywords
            </h4>
            <div className="flex flex-wrap gap-2">
              {topKeywords.map((kw) => (
                <span
                  key={kw}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border
                    bg-[#DEDBC8]/5 border-[#DEDBC8]/10 text-[#DEDBC8]"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Insight ── */}
        {insight && (
          <div className="rounded-xl p-4 border border-[#DEDBC8]/5 bg-[#0A0A0A]">
            <h4 className="text-xs font-semibold text-[#E1E0CC] mb-2 flex items-center gap-2">
              <Lightbulb size={13} className="text-[#F59E0B]" />
              Insight
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed">{insight}</p>
          </div>
        )}

        {/* ── Actions ── */}
        <ExportButtons
          contentRef={resultRef}
          jsonData={data}
          filename={`journal_quality_${journalName || 'report'}`}
          accentColor="#DEDBC8"
          onSave={onSave}
          saving={saving}
        />
      </div>
    </motion.div>
  );
}
