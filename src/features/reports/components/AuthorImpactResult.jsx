import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('reports');
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
  // API returns Vietnamese status strings; map to colors + i18n keys
  const statusColorMap = {
    'Đang sung sức': '#34D399',
    'Đã dừng nghiên cứu': '#F59E0B',
    'Không có dữ liệu': 'var(--muted-foreground)',
  };
  const statusI18nMap = {
    'Đang sung sức': 'trendStatus.active',
    'Đã dừng nghiên cứu': 'trendStatus.inactive',
    'Không có dữ liệu': 'trendStatus.noData',
  };
  const statusColor = statusColorMap[status] || 'var(--muted-foreground)';
  const statusLabel = statusI18nMap[status] ? t(statusI18nMap[status]) : (status || t('authorImpact.unknown'));

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
            {t('authorImpact.headerBadge')}
          </p>
          <h3 className="text-base font-bold text-foreground">
            {reportTitle || t('authorImpact.reportTitle', { name: authorName })}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-muted-foreground font-mono">
              {authorName}
            </p>
            {affiliation && (
              <>
                <span className="text-muted-foreground">—</span>
                <span className="text-xs text-muted-foreground">{affiliation}</span>
              </>
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
            {statusLabel}
          </span>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl p-4 border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={13} className="text-amber-600 dark:text-amber-500" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {t('stats.hIndex')}
              </span>
            </div>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-500 font-mono tabular-nums">
              {hIndex != null ? hIndex : '—'}
            </p>
          </div>
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
              <MapPin size={13} className="text-violet-600 dark:text-violet-500" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {t('stats.topField')}
              </span>
            </div>
            <p className="text-xl font-bold text-foreground font-mono tabular-nums truncate">
              {topField || '—'}
            </p>
          </div>
        </div>

        {/* ── Top Collaborators ── */}
        {topCollaborators.length > 0 && (
          <div className="rounded-xl p-5 border border-border bg-card">
            <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
              <Users size={13} className="text-primary" />
              {t('stats.topCollaborators')}
            </h4>
            <div className="space-y-2.5">
              {topCollaborators.map((collab, i) => (
                <div
                  key={collab.name || i}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-primary/[0.03]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-primary/10 text-primary"
                    >
                      {(collab.name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {collab.name}
                      </p>
                      {collab.affiliation && (
                        <p className="text-[10px] text-muted-foreground">
                          {collab.affiliation}
                        </p>
                      )}
                    </div>
                  </div>
                  {collab.collaborationCount != null && (
                    <span className="text-xs font-mono text-muted-foreground">
                      {collab.collaborationCount} {t('authorImpact.papersCount', { count: collab.collaborationCount })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Insight ── */}
        {insight && (
          <div className="rounded-xl p-4 border border-border bg-card">
            <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
              <Lightbulb size={13} className="text-amber-600 dark:text-amber-500" />
              {t('insight.title')}
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed">{insight}</p>
          </div>
        )}

        {/* ── Actions ── */}
        <ExportButtons
          contentRef={resultRef}
          jsonData={data}
          filename={`author_impact_${authorName || 'report'}`}
          accentColor="var(--muted-foreground)"
          onSave={onSave}
          saving={saving}
        />
      </div>
    </motion.div>
  );
}
