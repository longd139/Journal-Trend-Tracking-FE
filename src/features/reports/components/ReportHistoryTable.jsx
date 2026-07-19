import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, TrendingUp, FileText, Trash2 } from 'lucide-react';
import { getReportTypeConfig } from '../config';

/**
 * Report history table — displays previously generated reports.
 *
 * Currently uses local state (passed via `history` prop).
 * Architecture ready for API-based persistence (Bước 3).
 *
 * @param {object[]} history   - Array of report entries
 * @param {function} onView    - Called with entry to re-display
 * @param {function} onDelete  - Called with entry index to remove (optional; omit to hide delete)
 */
export default function ReportHistoryTable({ history, onView, onDelete }) {
  const { t } = useTranslation('reports');

  if (!history || history.length === 0) return null;

  return (
    <div className="rounded-xl border overflow-hidden bg-card border-primary/5">
      <div className="flex items-center justify-between p-5 border-b border-primary/5">
        <h3 className="text-sm font-bold text-foreground">
          {t('history.title') || 'Report History'}
        </h3>
        <span className="text-xs text-gray-400">
          {history.length} report{history.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary/5">
              {['Type', 'Query', 'Generated', 'Status', ''].map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-4 text-xs font-semibold text-gray-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((entry, i) => {
              const typeConfig = getReportTypeConfig(entry.type);
              const TypeIcon = typeConfig.icon || FileText;
              const typeColor = typeConfig.color || '#DEDBC8';

              return (
                <tr
                  key={entry._id || `${entry.type}-${entry.timestamp}-${i}`}
                  className="border-b border-primary/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <TypeIcon size={15} style={{ color: typeColor }} />
                      <span className="text-xs font-semibold text-foreground">
                        {typeConfig.label || entry.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-gray-400 font-mono">
                      &quot;{entry.query}&quot;
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock size={11} />
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 w-fit px-2.5 py-1 rounded-md">
                      <CheckCircle2 size={12} />
                      Ready
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onView(entry)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-white transition-colors"
                      >
                        <TrendingUp size={13} />
                        View
                      </button>
                      {onDelete && (
                        <button
                          onClick={() => onDelete(i)}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
