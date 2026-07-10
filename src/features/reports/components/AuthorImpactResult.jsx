import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User, Hash, MapPin, Users, Lightbulb, Trophy,
} from 'lucide-react';
import ExportButtons from './ExportButtons';

/**
 * Author Impact Report — formatted result panel.
 *
 * Displays: activity status badge, stat cards (h-index, papers, top field),
 * top collaborators list, and insight text.
 *
 * @param {object}   props
 * @param {object}   props.data       - AuthorImpactReportResponse from BE
 * @param {function} props.onClose    - Called to dismiss the result
 * @param {function} props.onSave     - Called to save report to history
 * @param {boolean}  props.saving     - Whether save is in progress
 */
export default function AuthorImpactResult({ data, onClose, onSave, saving }) {
  const resultRef = useRef(null);

  if (!data) return null;

  const {
    reportTitle,
    authorName,
    affiliation,
    totalPapers,
    hIndex,
    status,
    insight,
    topField,
    topCollaborators = [],
  } = data;

  // ── Status color mapping ──
  const statusColors = {
    'Đang sung sức': '#34D399',
    'Đã dừng nghiên cứu': '#F59E0B',
    'Không có dữ liệu': '#6B7280',
  };
  const statusColor = statusColors[status] || '#6B7280';

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
            Author Impact Report
          </p>
          <h3 className="text-base font-bold text-[#E1E0CC]">
            {reportTitle || `Hồ sơ năng lực học thuật: ${authorName}`}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-[#A09878] font-mono">
              {authorName}
            </p>
            {affiliation && (
              <>
                <span className="text-gray-600">—</span>
                <span className="text-xs text-gray-400">{affiliation}</span>
              </>
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
        {/* ── Status Badge ── */}
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: `${statusColor}1A`,
              color: statusColor,
              border: `1px solid ${statusColor}44`,
            }}
          >
            {status || 'Unknown'}
          </span>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl p-4 border border-[#DEDBC8]/5 bg-[#0A0A0A]">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={13} className="text-[#F59E0B]" />
              <span className="text-[10px] uppercase tracking-wider text-gray-500">
                h-Index
              </span>
            </div>
            <p className="text-xl font-bold text-[#F59E0B] font-mono tabular-nums">
              {hIndex != null ? hIndex : '—'}
            </p>
          </div>
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
              <MapPin size={13} className="text-[#A78BFA]" />
              <span className="text-[10px] uppercase tracking-wider text-gray-500">
                Top Field
              </span>
            </div>
            <p className="text-xl font-bold text-[#E1E0CC] font-mono tabular-nums truncate">
              {topField || '—'}
            </p>
          </div>
        </div>

        {/* ── Top Collaborators ── */}
        {topCollaborators.length > 0 && (
          <div className="rounded-xl p-5 border border-[#DEDBC8]/5 bg-[#0A0A0A]">
            <h4 className="text-xs font-semibold text-[#E1E0CC] mb-3 flex items-center gap-2">
              <Users size={13} className="text-[#DEDBC8]" />
              Top Collaborators
            </h4>
            <div className="space-y-2.5">
              {topCollaborators.map((collab, i) => (
                <div
                  key={collab.name || i}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#DEDBC8]/[0.03]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: '#DEDBC8' + '1A',
                        color: '#DEDBC8',
                      }}
                    >
                      {(collab.name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#E1E0CC]">
                        {collab.name}
                      </p>
                      {collab.affiliation && (
                        <p className="text-[10px] text-gray-500">
                          {collab.affiliation}
                        </p>
                      )}
                    </div>
                  </div>
                  {collab.collaborationCount != null && (
                    <span className="text-xs font-mono text-gray-400">
                      {collab.collaborationCount} paper{collab.collaborationCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
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
          filename={`author_impact_${authorName || 'report'}`}
          accentColor="#A09878"
          onSave={onSave}
          saving={saving}
        />
      </div>
    </motion.div>
  );
}
