import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, FileText, History, Trash2, RefreshCw, Clock, Loader2, Search, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { reportAPI } from './api';
import REPORT_TYPES from './config';
import KeywordTrendResult from './components/KeywordTrendResult';

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */
export default function ReportsViewPage() {
  const { t } = useTranslation('reports');
  const location = useLocation();
  const [loading, setLoading] = useState(null);
  const [loadingKeyword, setLoadingKeyword] = useState('');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const autoGenDoneRef = useRef(new Set());

  // ── Keyword Trend History (from new BE endpoint) ──
  const [kwHistory, setKwHistory] = useState([]);
  const [kwHistoryLoading, setKwHistoryLoading] = useState(true);

  const loadKeywordHistory = useCallback(async () => {
    setKwHistoryLoading(true);
    try {
      const res = await reportAPI.getKeywordTrendHistory();
      // API returns: { status, message, data: [...] }
      // axiosClient interceptor passes through the axios response
      let list = res?.data || res;
      // Double-unwrap if data is still nested
      if (!Array.isArray(list) && list?.data) {
        list = list.data;
      }
      if (!Array.isArray(list) && list?.keyword) {
        list = [list];
      }
      console.log('[KeywordHistory] raw res:', res, '→ parsed list:', list);
      setKwHistory(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('[KeywordHistory] fetch failed:', err);
      setKwHistory([]);
    } finally {
      setKwHistoryLoading(false);
    }
  }, []);

  /* ── Load keyword history on mount ── */
  useEffect(() => {
    loadKeywordHistory();
  }, [loadKeywordHistory]);

  /* ── Generate report (keyword trend) ── */
  const generateReport = useCallback(async (type, query, apiFn, yearParams = {}) => {
    setLoading(type);
    setLoadingKeyword(query);
    setError(null);
    setResult(null);
    try {
      const data = type === 'keyword-trend'
        ? await apiFn(query, yearParams)
        : await apiFn(query);
      console.log('[generateReport] raw API response:', data, 'yearParams:', yearParams);
      const reportData = data?.data || data;
      console.log('[generateReport] unwrapped reportData:', reportData);
      console.log('[generateReport] has charts?', {
        publicationTrend: reportData?.publicationTrend?.length || 0,
        citationTrend: reportData?.citationTrend?.length || 0,
        coOccurringKeywords: reportData?.coOccurringKeywords?.length || 0,
        topJournals: reportData?.topJournals?.length || 0,
      });
      const entry = {
        type,
        query,
        timestamp: Date.now(),
        status: 'ready',
        data: reportData,
      };
      setResult(entry);

      // Refresh keyword history — add locally first for instant UI,
      // then sync from BE in background
      if (type === 'keyword-trend') {
        setKwHistory((prev) => {
          const exists = prev.some((item) => item.keyword === query);
          if (!exists) {
            return [
              { keyword: query, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              ...prev,
            ];
          }
          return prev;
        });
        // Background sync to get accurate timestamps & other keywords
        loadKeywordHistory();
      }

      toast.success(t('toast.success') || 'Report generated successfully');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to generate report';
      setError(msg);
      toast.error(t('toast.error') || msg);
    } finally {
      setLoading(null);
      setLoadingKeyword('');
    }
  }, [t, loadKeywordHistory]);

  /* ── Quick load from keyword history (try cache first, fallback to generate) ── */
  const loadFromKeywordHistory = useCallback(async (keyword) => {
    setLoading('keyword-trend');
    setError(null);
    setResult(null);
    try {
      // Try cache first
      let res;
      try {
        res = await reportAPI.getKeywordTrendCached(keyword);
      } catch {
        // Cache miss — generate fresh
        res = await reportAPI.getKeywordTrend(keyword);
      }

      const reportData = res?.data || res;
      setResult({
        type: 'keyword-trend',
        query: keyword,
        timestamp: Date.now(),
        status: 'ready',
        data: reportData,
      });
      toast.success(`Loaded report for "${keyword}"`);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load report';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(null);
    }
  }, []);

  /* ── Delete keyword from cache/history ── */
  const deleteKeywordFromCache = useCallback(async (keyword, e) => {
    e.stopPropagation();
    try {
      await reportAPI.deleteKeywordTrendCache(keyword);
      setKwHistory((prev) => prev.filter((item) => {
        const kw = item.keyword || '';
        return kw !== keyword;
      }));
      toast.success(`Removed "${keyword}" from history`);
    } catch {
      toast.error('Failed to remove keyword');
    }
  }, []);

  /* ── Auto-generate from query params ── */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    const q = params.get('q');
    const startYear = params.get('startYear');
    const endYear = params.get('endYear');

    if (type && q && REPORT_TYPES[type]) {
      const key = `${type}:${q}:${startYear || ''}:${endYear || ''}`;
      if (autoGenDoneRef.current.has(key)) return;
      autoGenDoneRef.current.add(key);

      const apiFn = reportAPI[REPORT_TYPES[type].apiFn];
      if (apiFn) {
        const yearParams = {};
        if (startYear) yearParams.startYear = Number(startYear);
        if (endYear) yearParams.endYear = Number(endYear);
        const timer = setTimeout(() => {
          generateReport(type, q, apiFn, yearParams);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [location.search, generateReport]);

  /* ── Save report (local toast only — BE has no persistence endpoint) ── */
  const handleSave = useCallback(async (_reportData) => {
    toast.success('Report saved locally');
  }, []);

  /* ── Error Banner ── */
  const ErrorBanner = error && (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/10 text-[11px] text-red-600/80 dark:text-red-400/80"
    >
      <AlertCircle size={13} className="shrink-0" />
      <span>{error}</span>
      <button onClick={() => setError(null)} className="ml-auto text-red-400/50 dark:text-red-400/50 hover:text-red-600 dark:hover:text-red-400">✕</button>
    </motion.div>
  );

  return (
    <div className="w-full h-full min-h-screen p-8 space-y-6 overflow-y-auto bg-transparent">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/8">
          <FileText size={13} className="text-primary" />
          <span className="text-xs font-bold text-primary">Keyword Trend Report</span>
        </div>
        <span className="text-[11px] text-muted-foreground">Search a keyword and generate a trend analysis report</span>
      </motion.div>

      {/* Error Banner */}
      {ErrorBanner}

      {/* Info — how to generate a report */}
      {!loading && !result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-primary/10 bg-card p-8"
        >
          <div className="flex flex-col items-center text-center max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-accent-blue/10 flex items-center justify-center mb-5">
              <Search size={24} className="text-accent-blue" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Generate a Keyword Trend Report
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Go to the <span className="text-foreground font-medium">Search Papers</span> page,
              search for a keyword, and click{' '}
              <span className="text-accent-blue font-medium">Generate Report</span> in the
              Quick Stats section. Your trend analysis will appear right here.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/8">
                Search Papers
              </span>
              <ArrowRight size={12} />
              <span className="px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/8">
                Quick Stats
              </span>
              <ArrowRight size={12} />
              <span className="px-3 py-1.5 rounded-lg bg-accent-blue/10 border border-accent-blue/20 text-accent-blue font-medium">
                Generate Report
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Generating indicator */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-primary/10 bg-card p-8"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent-blue/10 flex items-center justify-center mb-5">
              <Loader2 size={24} className="text-accent-blue animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Generating Report
            </h3>
            <p className="text-sm text-muted-foreground">
              Analyzing trends for{' '}
              <span className="text-accent-blue font-semibold">"{loadingKeyword}"</span>
              — fetching publication data, citation metrics, and co-occurring keywords...
            </p>
          </div>
        </motion.div>
      )}

      {/* RESULT PANEL */}
      <AnimatePresence mode="wait">
        {result && result.type === 'keyword-trend' && (
          <KeywordTrendResult
            key={`kw-${result.timestamp}`}
            data={result.data}
            generatedAt={result.timestamp}
            onClose={() => setResult(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      {/* ═════════════════════════════════════════════════════════════
          REPORT HISTORY — Quick access to recent keyword reports
          ═════════════════════════════════════════════════════════════ */}
      {kwHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-primary/8 bg-card p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <History size={13} className="text-accent-blue" />
            <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Report History
            </span>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {kwHistory.length} keyword{kwHistory.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="overflow-hidden rounded-lg border border-primary/10">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-primary/10 text-muted-foreground">
                  <th className="text-left py-2.5 px-4 font-medium uppercase tracking-wider text-[10px]">Keyword</th>
                  <th className="text-left py-2.5 px-4 font-medium uppercase tracking-wider text-[10px]">Created Date</th>
                  <th className="text-right py-2.5 px-4 font-medium uppercase tracking-wider text-[10px] w-16">Action</th>
                </tr>
              </thead>
              <tbody>
                {kwHistory.map((item) => (
                  <tr
                    key={item.keyword}
                    onClick={() => loadFromKeywordHistory(item.keyword)}
                    className="border-b border-border last:border-0
                      hover:bg-accent-blue/5 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-4 text-foreground font-medium">
                      <div className="flex items-center gap-2">
                        <Clock size={11} className="text-muted-foreground" />
                        {item.keyword}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString('en-US')}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={(e) => deleteKeywordFromCache(item.keyword, e)}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Remove from history"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted-foreground">
              {kwHistory.length} keyword{kwHistory.length > 1 ? 's' : ''}
            </span>
            <button
              onClick={loadKeywordHistory}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground/80 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={12} className={kwHistoryLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
}
