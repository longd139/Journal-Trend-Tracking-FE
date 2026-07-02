import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart2, BookOpen, User, Loader2, AlertCircle,
  CheckCircle2, Clock, Download, TrendingUp, FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { reportAPI } from './api';
import { Skeleton } from '../../components/ui/skeleton';

/* ═══════════════════════════════════════════════════════════════════════════
   Report Generator Card
   ═══════════════════════════════════════════════════════════════════════════ */
function GeneratorCard({ icon: Icon, iconColor, title, description, placeholder, onGenerate, loading }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onGenerate(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit(e);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="p-5 rounded-xl border bg-[#101010] border-[#DEDBC8]/10 flex flex-col"
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
        style={{ background: `${iconColor}1A`, color: iconColor }}
      >
        <Icon size={20} />
      </div>

      {/* Title + Description */}
      <h3 className="text-sm font-bold text-[#E1E0CC] mb-1">{title}</h3>
      <p className="text-xs text-gray-400 mb-4 line-clamp-2">{description}</p>

      {/* Input + Button */}
      <form onSubmit={handleSubmit} className="mt-auto space-y-2.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={loading}
          className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-[#0A0A0A] border border-[#DEDBC8]/10 text-[#E1E0CC] placeholder:text-gray-500 focus:outline-none focus:border-[#DEDBC8]/30 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-full px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 bg-[#DEDBC8] text-black hover:opacity-90"
        >
          {loading ? (
            <><Loader2 size={14} className="animate-spin" /> Generating...</>
          ) : (
            'Generate Report'
          )}
        </button>
      </form>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Report Type Config
   ═══════════════════════════════════════════════════════════════════════════ */
const REPORT_TYPES = {
  'keyword-trend': { icon: BarChart2, color: '#3B82F6', label: 'Keyword Trend' },
  'journal-quality': { icon: BookOpen, color: '#DEDBC8', label: 'Journal Quality' },
  'author-impact': { icon: User, color: '#A09878', label: 'Author Impact' },
};

/* ═══════════════════════════════════════════════════════════════════════════
   Result Panel
   ═══════════════════════════════════════════════════════════════════════════ */
function ResultPanel({ result, onClose }) {
  const { t } = useTranslation('reports');

  if (!result) return null;

  const typeConfig = REPORT_TYPES[result.type] || {};
  const TypeIcon = typeConfig.icon || FileText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl border border-[#DEDBC8]/10 bg-[#101010] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[#DEDBC8]/5">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: `${typeConfig.color || '#DEDBC8'}1A`, color: typeConfig.color || '#DEDBC8' }}
          >
            <TypeIcon size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#E1E0CC]">
              {typeConfig.label} Report
            </h3>
            <p className="text-[11px] text-gray-500">
              &quot;{result.query}&quot; — {new Date(result.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-5 max-h-[500px] overflow-y-auto">
        <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-words bg-[#0A0A0A] rounded-xl p-4 border border-[#DEDBC8]/5">
          {JSON.stringify(result.data, null, 2)}
        </pre>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 p-4 border-t border-[#DEDBC8]/5 bg-[#0A0A0A]/50">
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${result.type}_${result.query.replace(/\s+/g, '_')}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#DEDBC8]/10 text-[#DEDBC8] border border-[#DEDBC8]/20 hover:bg-[#DEDBC8]/20 transition-all"
        >
          <Download size={14} />
          Download JSON
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */
export default function ReportsViewPage() {
  const { t } = useTranslation('reports');
  const [loading, setLoading] = useState(null); // string: report type đang load, hoặc null
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const generateReport = useCallback(async (type, query, apiFn) => {
    setLoading(type);
    setError(null);
    setResult(null);
    try {
      const data = await apiFn(query);
      const entry = {
        type,
        query,
        timestamp: Date.now(),
        status: 'ready',
        data: data?.data || data,
      };
      setResult(entry);
      setHistory((prev) => [entry, ...prev].slice(0, 20)); // keep last 20
      toast.success(t('toast.success') || 'Report generated successfully');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to generate report';
      setError(msg);
      toast.error(t('toast.error') || msg);
    } finally {
      setLoading(null);
    }
  }, [t]);

  /* ── Error Banner ── */
  const ErrorBanner = error && (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/10 text-[11px] text-red-400/80"
    >
      <AlertCircle size={13} className="shrink-0" />
      <span>{error}</span>
      <button onClick={() => setError(null)} className="ml-auto text-red-400/50 hover:text-red-400">✕</button>
    </motion.div>
  );

  return (
    <div className="w-full h-full min-h-screen p-8 space-y-6 overflow-y-auto bg-transparent">
      {/* HEADER — compact stats strip, title is in TopBar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#DEDBC8]/5 border border-[#DEDBC8]/8">
          <FileText size={13} className="text-[#DEDBC8]" />
          <span className="text-xs font-bold text-[#DEDBC8]">3 Report Types</span>
        </div>
        <span className="text-[11px] text-gray-500">Generate analytics reports for journals, authors, or topics</span>
      </motion.div>

      {/* Error Banner */}
      {ErrorBanner}

      {/* 3 REPORT GENERATOR CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <GeneratorCard
          icon={BarChart2}
          iconColor="#3B82F6"
          title={t('templates.trendAnalysis.name')}
          description={t('templates.trendAnalysis.description')}
          placeholder={t('input.placeholder.keyword') || 'Enter keyword...'}
          loading={loading === 'keyword-trend'}
          onGenerate={(keyword) =>
            generateReport('keyword-trend', keyword, reportAPI.getKeywordTrend)
          }
        />
        <GeneratorCard
          icon={BookOpen}
          iconColor="#DEDBC8"
          title={t('templates.readingList.name')}
          description={t('templates.readingList.description')}
          placeholder={t('input.placeholder.journal') || 'Enter journal name...'}
          loading={loading === 'journal-quality'}
          onGenerate={(journalName) =>
            generateReport('journal-quality', journalName, reportAPI.getJournalQuality)
          }
        />
        <GeneratorCard
          icon={User}
          iconColor="#A09878"
          title={t('templates.authorImpact.name')}
          description={t('templates.authorImpact.description')}
          placeholder={t('input.placeholder.author') || 'Enter author name...'}
          loading={loading === 'author-impact'}
          onGenerate={(authorName) =>
            generateReport('author-impact', authorName, reportAPI.getAuthorImpact)
          }
        />
      </div>

      {/* RESULT PANEL */}
      <AnimatePresence mode="wait">
        {result && (
          <ResultPanel
            result={result}
            onClose={() => setResult(null)}
          />
        )}
      </AnimatePresence>

      {/* REPORT HISTORY */}
      {history.length > 0 && (
        <div className="rounded-xl border overflow-hidden bg-[#101010] border-[#DEDBC8]/5">
          <div className="flex items-center justify-between p-5 border-b border-[#DEDBC8]/5">
            <h3 className="text-sm font-bold text-[#E1E0CC]">{t('history.title')}</h3>
            <span className="text-xs text-gray-400">
              {history.length} report{history.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#DEDBC8]/5">
                  {['Type', 'Query', 'Generated', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((entry, i) => {
                  const typeConfig = REPORT_TYPES[entry.type] || {};
                  const TypeIcon = typeConfig.icon || FileText;
                  const typeColor = typeConfig.color || '#DEDBC8';

                  return (
                    <tr
                      key={`${entry.type}-${entry.timestamp}-${i}`}
                      className="border-b border-[#DEDBC8]/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <TypeIcon size={15} style={{ color: typeColor }} />
                          <span className="text-xs font-semibold text-[#E1E0CC]">
                            {typeConfig.label || entry.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-gray-400 font-mono">&quot;{entry.query}&quot;</span>
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
                        <button
                          onClick={() => setResult(entry)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#DEDBC8] hover:text-white transition-colors"
                        >
                          <TrendingUp size={13} />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
