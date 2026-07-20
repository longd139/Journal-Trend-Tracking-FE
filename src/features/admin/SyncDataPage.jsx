import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 RefreshCw, Search, Database, CheckCircle2, AlertCircle, Clock,
 ChevronDown, ChevronUp, Layers, AlertTriangle,
 Info, ExternalLink, Upload, FileText, X,
} from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useSyncStore } from '../../store/useSyncStore';
import GapCrawlSection from './GapCrawlSection';
import { adminAPI } from './api';
import { trendAPI } from '../search/trend.api';
import { toast } from 'sonner';
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from '../../components/ui/dialog';

const card = 'bg-card border border-primary/5 rounded-xl';

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => 1900 + i).reverse();


const BULK_TABS = [
 { key: 'openalex', label: 'OpenAlex', color: '#4F8CFF', defaultPapers: 100, defaultKeywords: 20 },
 { key: 'semanticScholar', label: 'Semantic Scholar', color: '#10B981', defaultPapers: 200, defaultKeywords: 20 },
 { key: 'arxiv', label: 'arXiv', color: '#F59E0B', defaultPapers: 100, defaultKeywords: 20 },
 { key: 'core', label: 'CORE', color: '#A78BFA', defaultPapers: 500, defaultKeywords: 30 },
];

function ResultCard({ result }) {
 const [rawOpen, setRawOpen] = useState(false);
 const isError = result.error;
 const isRunning = result.status === 'running';

 return (
 <motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  className={`${card} p-5 space-y-3 border-l-[3px]`}
  style={{ borderLeftColor: isRunning ? '#10B981' : isError ? '#EF4444' : '#10B981' }}
 >
  <div className="flex items-center justify-between">
  <div className="flex items-center gap-2.5">
   <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
   {result.source}
   </span>
   {isRunning ? (
   <RefreshCw size={16} className="animate-spin text-emerald-500" />
   ) : isError ? (
   <AlertCircle size={16} className="text-red-500" />
   ) : (
   <CheckCircle2 size={16} className="text-emerald-500" />
   )}
  </div>
  {result.timestamp && (
   <span className="text-[10px] text-gray-500 dark:text-slate-400 flex items-center gap-1">
   <Clock size={10} />
   {new Date(result.timestamp).toLocaleString()}
   </span>
  )}
  </div>

  {isRunning ? (
  <p className="text-xs text-emerald-600 dark:text-emerald-400 animate-pulse">Syncing...</p>
  ) : isError ? (
  <p className="text-xs text-red-600 dark:text-red-400">{result.error}</p>
  ) : (
  <p className="text-xs text-gray-700 dark:text-slate-300">
   {result.message || 'Sync completed'}
  </p>
  )}

  {result.data && Object.keys(result.data).length > 0 && (
  <div className="space-y-1.5">
   <div className="bg-transparent/50 border border-gray-200 border-primary/5 rounded-lg p-3">
   <table className="w-full text-xs">
    <tbody>
    {Object.entries(result.data).map(([key, value]) => (
     <tr
     key={key}
     className="border-b border-gray-100 dark:border-white/[0.03] last:border-b-0"
     >
     <td className="py-1.5 pr-3 font-semibold text-gray-700 dark:text-slate-300 whitespace-nowrap capitalize">
      {key.replace(/([A-Z])/g, ' $1').trim()}
     </td>
     <td className="py-1.5 text-gray-600 dark:text-slate-400 break-all font-mono text-[11px]">
      {String(value ?? '—')}
     </td>
     </tr>
    ))}
    </tbody>
   </table>
   </div>
  </div>
  )}

  <button
  type="button"
  onClick={() => setRawOpen(!rawOpen)}
  className="text-[10px] text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
  >
  {rawOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
  Raw response
  </button>
  {rawOpen && (
  <pre className="p-3 rounded-lg bg-transparent/50 border border-gray-200 border-primary/5 text-gray-700 dark:text-slate-300 text-[11px] overflow-x-auto font-mono max-h-40 overflow-y-auto">
   {JSON.stringify(result, null, 2)}
  </pre>
  )}
 </motion.div>
 );
}

export default function SyncDataPage() {
 const [query, setQuery] = useState('');
 const [limit, setLimit] = useState(10);
 const [yearFrom, setYearFrom] = useState('');
 const [yearTo, setYearTo] = useState(String(currentYear));
 const tasks = useSyncStore((s) => s.tasks);
 const bulkTask = useSyncStore((s) => s.bulkTask);
 const startTasks = useSyncStore((s) => s.startTasks);
 const startBulkSync = useSyncStore((s) => s.startBulkSync);
 const startCoreBulkSync = useSyncStore((s) => s.startCoreBulkSync);
 const startSemanticScholarBulkSync = useSyncStore((s) => s.startSemanticScholarBulkSync);
 const startArxivBulkSync = useSyncStore((s) => s.startArxivBulkSync);
 const clearCompleted = useSyncStore((s) => s.clearCompleted);

 // Only show tasks from the current query context (latest batch)
 const runningTasks = tasks.filter((t) => t.status === 'running');
 const doneTasks = tasks.filter((t) => t.status === 'done');
 const errorTasks = tasks.filter((t) => t.status === 'error');
 const allTasks = [...doneTasks, ...errorTasks, ...runningTasks];
 const isRunning = runningTasks.length > 0;
 const hasResults = allTasks.length > 0;

 const [isClearing, setIsClearing] = useState(false);
 const [showClearDialog, setShowClearDialog] = useState(false);
 const [clearResult, setClearResult] = useState(null);
 const [clearError, setClearError] = useState(null);

	// SCImago journal enrichment
	const [scimagoFile, setScimagoFile] = useState(null);
	const [scimagoUploading, setScimagoUploading] = useState(false);
	const [scimagoResult, setScimagoResult] = useState(null);
	const [scimagoError, setScimagoError] = useState(null);
		const SCIMAGO_LAST_UPLOAD_KEY = 'scitrack_scimago_last_upload';
	const [scimagoLastUploadTime, setScimagoLastUploadTime] = useState(
	  () => localStorage.getItem(SCIMAGO_LAST_UPLOAD_KEY) || null,
	);
	const scimagoInputRef = useRef(null);

 const [autoSyncEnabled, setAutoSyncEnabled] = useState(null); // null = loading
 const [autoSyncStats, setAutoSyncStats] = useState(null);
 const [isToggling, setIsToggling] = useState(false);
 const [isLoadingAutoSync, setIsLoadingAutoSync] = useState(true);

 const fetchAutoSyncStatus = useCallback(async () => {
 try {
  const response = await adminAPI.getAutoSyncStatus();
  const status = response.data || response;
  setAutoSyncStats(status);
  setAutoSyncEnabled(status?.enabled ?? false);
 } catch {
  // silently fail — keep null to show error state
  setAutoSyncEnabled(null);
 } finally {
  setIsLoadingAutoSync(false);
 }
 }, []);

 useEffect(() => {
 fetchAutoSyncStatus();
 }, [fetchAutoSyncStatus]);

 const handleToggleAutoSync = async () => {
 setIsToggling(true);
 try {
  const newState = !autoSyncEnabled;
  const response = await adminAPI.toggleAutoSync(newState);
  const enabled = response?.data?.autoSyncEnabled ?? newState;
  setAutoSyncEnabled(enabled);
  toast.success(enabled ? 'Auto-sync enabled' : 'Auto-sync disabled', {
  position: 'top-right',
  duration: 3000,
  });
  // Refresh status after toggling
  await fetchAutoSyncStatus();
 } catch (err) {
  toast.error(err.response?.data?.message || 'Failed to toggle auto-sync', {
  position: 'top-right',
  duration: 4000,
  });
 } finally {
  setIsToggling(false);
 }
 };

 // -- Bulk Sync --
 const [bulkSource, setBulkSource] = useState('openalex');
 const [bulkPapersPerKeyword, setBulkPapersPerKeyword] = useState(500);
 const [bulkYearFrom, setBulkYearFrom] = useState('');
 const [bulkYearTo, setBulkYearTo] = useState(String(currentYear));
 // Keyword input mode: 'trending' = chip selector, 'manual' = textarea
 const [keywordInputMode, setKeywordInputMode] = useState('trending');
 const [bulkKeywords, setBulkKeywords] = useState('');
 // Trending keyword selector
 const [trendingKeywords, setTrendingKeywords] = useState([]);
 const [selectedKeywords, setSelectedKeywords] = useState([]);
 const [isLoadingTrending, setIsLoadingTrending] = useState(true);
 const CORE_API_KEY_STORAGE = 'scitrack_core_api_key';
 const [coreApiKey, setCoreApiKey] = useState(() => localStorage.getItem(CORE_API_KEY_STORAGE) || '');
 const OPENALEX_API_KEY_STORAGE = 'scitrack_openalex_api_key';
 const [openAlexApiKey, setOpenAlexApiKey] = useState(() => localStorage.getItem(OPENALEX_API_KEY_STORAGE) || '');
 const SEMANTIC_SCHOLAR_KEY_STORAGE = 'scitrack_semantic_scholar_api_key';
 const [semanticScholarApiKey, setSemanticScholarApiKey] = useState(() => localStorage.getItem(SEMANTIC_SCHOLAR_KEY_STORAGE) || '');
 const [bulkMailto, setBulkMailto] = useState('');

 // Persist CORE API key to localStorage
 useEffect(() => {
  if (coreApiKey) {
   localStorage.setItem(CORE_API_KEY_STORAGE, coreApiKey);
  } else {
   localStorage.removeItem(CORE_API_KEY_STORAGE);
  }
 }, [coreApiKey]);

 // Persist OpenAlex API key to localStorage
 useEffect(() => {
  if (openAlexApiKey) {
   localStorage.setItem(OPENALEX_API_KEY_STORAGE, openAlexApiKey);
  } else {
   localStorage.removeItem(OPENALEX_API_KEY_STORAGE);
  }
 }, [openAlexApiKey]);

 // Persist Semantic Scholar API key to localStorage
 useEffect(() => {
  if (semanticScholarApiKey) {
   localStorage.setItem(SEMANTIC_SCHOLAR_KEY_STORAGE, semanticScholarApiKey);
  } else {
   localStorage.removeItem(SEMANTIC_SCHOLAR_KEY_STORAGE);
  }
 }, [semanticScholarApiKey]);

 // Fetch trending keywords for selector
 useEffect(() => {
  let cancelled = false;
  async function load() {
   setIsLoadingTrending(true);
   try {
    const data = await trendAPI.getTrendingKeywords(30);
    if (!cancelled) {
     setTrendingKeywords(Array.isArray(data) ? data : []);
     // Pre-select all by default
     if (Array.isArray(data)) {
      setSelectedKeywords(data.map((k) => k.keywordText));
     }
    }
   } catch {
    if (!cancelled) setTrendingKeywords([]);
   } finally {
    if (!cancelled) setIsLoadingTrending(false);
   }
  }
  load();
  return () => { cancelled = true; };
 }, [bulkSource]);

 // Derived from store — survives tab navigation
 const isBulkSyncing = bulkTask?.status === 'running';
 const bulkResult = bulkTask?.status === 'done' ? (bulkTask.result || bulkTask) : null;
 const bulkError = bulkTask?.status === 'error' ? bulkTask.error : null;
 const bulkProgress = bulkTask?.status === 'running' ? bulkTask : null;

 const activeTab = BULK_TABS.find((t) => t.key === bulkSource) || BULK_TABS[0];

 const handleBulkSync = () => {
  let body;

  if (keywordInputMode === 'trending') {
   if (selectedKeywords.length === 0) {
    body = {};
   } else {
    body = { keywords: selectedKeywords, papersPerKeyword: bulkPapersPerKeyword };
    if (bulkYearFrom) body.yearFrom = parseInt(bulkYearFrom, 10);
    if (bulkYearTo) body.yearTo = parseInt(bulkYearTo, 10);
   }
  } else {
   const keywords = bulkKeywords
    .split(/[\n,]+/)
    .map((k) => k.trim())
    .filter(Boolean);
   if (keywords.length === 0) {
    setBulkError('Please enter at least one keyword.');
    return;
   }
   body = { keywords, papersPerKeyword: bulkPapersPerKeyword };
   if (bulkYearFrom) body.yearFrom = parseInt(bulkYearFrom, 10);
   if (bulkYearTo) body.yearTo = parseInt(bulkYearTo, 10);
  }

  // Route to correct store method based on selected tab
  if (bulkSource === 'core') {
   if (coreApiKey.trim()) body.apiKey = coreApiKey.trim();
   startCoreBulkSync(body);
  } else if (bulkSource === 'semanticScholar') {
   if (semanticScholarApiKey.trim()) body.apiKey = semanticScholarApiKey.trim();
   startSemanticScholarBulkSync(body);
  } else if (bulkSource === 'arxiv') {
   startArxivBulkSync(body);
  } else {
   if (openAlexApiKey.trim()) body.apiKey = openAlexApiKey.trim();
   if (bulkMailto.trim()) body.mailto = bulkMailto.trim();
   startBulkSync(body);
  }
 };

 const setBulkError = (msg) => {
  toast.error(msg, { position: 'top-right', duration: 5000 });
 };


 const handleClearAll = async () => {
 setIsClearing(true);
 setClearError(null);
 setClearResult(null);
 try {
  const response = await adminAPI.clearAllData();
  setClearResult(response);
  setShowClearDialog(false);
  toast.success(response.message || 'All synced data has been cleared.', {
  position: 'top-right',
  duration: 4000,
  });
 } catch (err) {
  const msg = err.response?.data?.message || err.message || 'Clear failed';
  setClearError(msg);
  toast.error(msg, { position: 'top-right', duration: 5000 });
 } finally {
  setIsClearing(false);
 }
 };

  // SCImago CSV upload handlers
  const handleScimagoFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Only CSV files are accepted');
      return;
    }
    setScimagoFile(file);
    setScimagoResult(null);
    setScimagoError(null);
  };

  const handleScimagoDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Only CSV files are accepted');
      return;
    }
    setScimagoFile(file);
    setScimagoResult(null);
    setScimagoError(null);
  };

  const handleScimagoUpload = async () => {
    if (!scimagoFile) return;
    setScimagoUploading(true);
    setScimagoResult(null);
    setScimagoError(null);
    try {
      const res = await adminAPI.enrichJournalsUpload(scimagoFile);
      setScimagoResult(res?.message || res?.data || 'Enrichment complete');
      const now = new Date().toISOString();
      setScimagoLastUploadTime(now);
      localStorage.setItem(SCIMAGO_LAST_UPLOAD_KEY, now);
      toast.success('SCImago enrichment complete');
      setScimagoFile(null);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Upload failed';
      setScimagoError(msg);
      toast.error(msg);
    } finally {
      setScimagoUploading(false);
    }
  };

 const handleSync = () => {
 if (!query.trim()) return;
 if (!query.trim() || selectedSources.length === 0) return;

 const params = {
  query: query.trim(),
  limit,
  yearFrom: yearFrom ? parseInt(yearFrom, 10) : undefined,
  yearTo: yearTo ? parseInt(yearTo, 10) : undefined,
 };

 startTasks(['openalex'], params);
 };

 const canSync = query.trim() && !isRunning && !isBulkSyncing && !isClearing;

 return (
 <div className="p-6 space-y-6 max-w-3xl mx-auto">
  {/* Header banner */}
  <motion.div
   initial={{ opacity: 0, y: -8 }}
   animate={{ opacity: 1, y: 0 }}
   className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-[#101010] via-[#141414] to-[#101010] border-primary/10"
  >
   <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
   <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">
    <div className="flex items-center gap-3">
     <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
      <RefreshCw size={15} />
     </div>
     <div>
      <h2 className="text-sm font-bold text-foreground font-display">Sync Data OpenAlex</h2>
      <p className="text-[11px] text-gray-500">Fetch and import academic papers from OpenAlex</p>
     </div>
    </div>
   </div>
  </motion.div>

  {/* -- Normal Sync -- */}
  <motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  className={`${card} p-5 space-y-4 ${isBulkSyncing || isClearing ? 'opacity-50 pointer-events-none' : ''}`}
  >
  {/* Query + Limit row */}
  <div className="flex flex-col sm:flex-row gap-3">
   <div className="flex-1 space-y-1.5">
   <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
    Search Query
   </label>
   <div className="relative">
    <Search
    size={14}
    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
    />
    <Input
    type="text"
    placeholder="e.g. machine learning, CRISPR, climate change..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    onKeyDown={(e) => e.key === 'Enter' && canSync && handleSync()}
    className="pl-9 pr-4 py-2.5 rounded-lg text-sm bg-[#1a1a1a] border-primary/10 text-slate-200"
    />
   </div>
   </div>

   <div className="w-full sm:w-28 space-y-1.5">
   <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
    Limit
   </label>
   <Input
    type="number"
    min={1}
    max={100}
    value={limit}
    onChange={(e) => setLimit(parseInt(e.target.value, 10) || 10)}
    className="py-2.5 rounded-lg text-sm text-center bg-[#1a1a1a] border-primary/10 text-slate-200"
   />
   </div>
  </div>

  {/* Year range */}
  <div className="flex items-center gap-3">
   <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 shrink-0">
   Year
   </span>
   <select
   value={yearFrom}
   onChange={(e) => setYearFrom(e.target.value)}
   className="w-24 py-2 rounded-lg text-sm text-center bg-[#1a1a1a] border border-primary/10 text-slate-200 outline-none focus:border-emerald-500/50 transition-colors cursor-pointer"
   style={{ colorScheme: 'dark' }}
   >
   <option value="">From</option>
   {YEAR_OPTIONS.map((y) => (
    <option key={y} value={y}>{y}</option>
   ))}
   </select>
   <span className="text-xs text-gray-400 dark:text-slate-500">–</span>
   <select
   value={yearTo}
   onChange={(e) => setYearTo(e.target.value)}
   className="w-24 py-2 rounded-lg text-sm text-center bg-[#1a1a1a] border border-primary/10 text-slate-200 outline-none focus:border-emerald-500/50 transition-colors cursor-pointer"
   style={{ colorScheme: 'dark' }}
   >
   <option value="">To</option>
   {YEAR_OPTIONS.map((y) => (
    <option key={y} value={y}>{y}</option>
   ))}
   </select>
  </div>


  <Button
   type="button"
   disabled={!canSync}
   onClick={handleSync}
   className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-lg active:scale-[0.97] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
  >
   <RefreshCw size={15} className={isRunning ? 'animate-spin' : ''} />
   {isRunning ? 'Syncing...' : 'Sync from OpenAlex'}
  </Button>
  </motion.div>

  {/* -- Loading -- */}
  {isRunning && (
  <div className="text-center py-8">
   <RefreshCw size={24} className="animate-spin mx-auto text-emerald-500 mb-2" />
   <p className="text-xs text-gray-500 dark:text-slate-400">
   Syncing {runningTasks.length}/{allTasks.length} source(s) for{' '}
   <strong className="text-foreground">"{query}"</strong>...
   </p>
   <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
   You can navigate to other pages — sync continues in the background.
   </p>
  </div>
  )}

  {/* -- Results -- */}
  <AnimatePresence>
  {hasResults && (
   <div className="space-y-3">
   <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
    <Database size={14} className="text-gray-500 dark:text-slate-400" />
    <h4 className="text-sm font-bold text-foreground">
     Results ({doneTasks.length} done{errorTasks.length > 0 ? `, ${errorTasks.length} failed` : ''})
    </h4>
    </div>
    {!isRunning && doneTasks.length + errorTasks.length > 0 && (
    <button
     type="button"
     onClick={clearCompleted}
     className="text-[10px] text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white active:scale-[0.97] transition-all duration-150"
    >
     Clear all
    </button>
    )}
   </div>
   {allTasks.map((task) => (
    <ResultCard
    key={task.id}
    result={{
     source: task.source,
     message: task.result?.message,
     data: task.result?.data,
     timestamp: task.result?.timestamp,
     error: task.error,
     status: task.status,
    }}
    />
   ))}
   </div>
  )}
  </AnimatePresence>

  {/* -- Auto Sync -- */}
  <div className={`border-t border-gray-200 border-primary/5 pt-6 mt-2 ${isRunning || isBulkSyncing || isClearing ? 'opacity-50 pointer-events-none' : ''}`}>
  <motion.div
   initial={{ opacity: 0 }}
   animate={{ opacity: 1 }}
   className={`${card} p-5`}
  >
   <div className="flex items-center justify-between gap-4">
   <div className="flex items-center gap-3">
    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 shrink-0">
    <RefreshCw size={18} />
    </div>
    <div>
    <h4 className="text-sm font-bold text-foreground">Auto Sync</h4>
    <p className="text-xs text-gray-500 dark:text-slate-400">
     Automatically sync new papers from all sources on a schedule.
    </p>
    </div>
   </div>

   {/* Toggle */}
   <button
    type="button"
    onClick={handleToggleAutoSync}
    disabled={isToggling || isRunning || isBulkSyncing || isClearing}
    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors cursor-pointer border-2 ${
    autoSyncEnabled
     ? 'bg-emerald-500 border-emerald-500'
     : 'bg-gray-300 dark:bg-gray-600 border-gray-300 dark:border-gray-500'
    } ${isToggling ? 'opacity-60' : ''}`}
   >
    <span
    className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
     autoSyncEnabled ? 'translate-x-6' : 'translate-x-1'
    }`}
    />
   </button>
   </div>

   {/* Status indicator */}
   {!isLoadingAutoSync && autoSyncEnabled !== null && (
   <div className="mt-4 pt-4 border-t border-primary/5">
    <div className="flex items-center gap-2 mb-3">
     <div className={`w-1.5 h-1.5 rounded-full ${autoSyncEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`} />
     <span className={`text-[11px] font-semibold ${autoSyncEnabled ? 'text-emerald-400' : 'text-gray-400'}`}>
     {autoSyncEnabled ? 'Active — running on schedule' : 'Paused'}
     </span>
    </div>

    {autoSyncStats && (
     <div className="grid grid-cols-2 gap-3">
     <div className="p-3 rounded-xl bg-primary/[0.02] border border-primary/5 text-center">
      <div className="text-lg font-bold text-foreground font-display">
      {(autoSyncStats.lastPapersCount ?? 0).toLocaleString()}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5 font-semibold">
      Papers Last Sync
      </div>
     </div>
     <div className="p-3 rounded-xl bg-primary/[0.02] border border-primary/5 text-center">
      <div className="text-sm font-bold text-primary/80 font-mono tabular-nums">
      {autoSyncStats.lastSyncTime
       ? new Date(autoSyncStats.lastSyncTime).toLocaleString()
       : 'Never'}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5 font-semibold">
      Last Sync Time
      </div>
     </div>
     </div>
    )}
   </div>
   )}

   {/* Loading state for auto-sync */}
   {isLoadingAutoSync && (
   <div className="mt-4 pt-4 border-t border-primary/5 animate-pulse">
    <div className="flex items-center gap-2 mb-3">
     <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
     <div className="h-3 w-28 bg-primary/8 rounded" />
    </div>
    <div className="grid grid-cols-2 gap-3">
     <div className="h-16 bg-primary/5 rounded-xl" />
     <div className="h-16 bg-primary/5 rounded-xl" />
    </div>
   </div>
   )}
  </motion.div>
  </div>

{/* -- Clear All Data -- */}
  <div className={`border-t border-gray-200 border-primary/5 pt-6 mt-2 ${isRunning || isBulkSyncing ? 'opacity-50 pointer-events-none' : ''}`}>
  <motion.div
   initial={{ opacity: 0 }}
   animate={{ opacity: 1 }}
   className={`${card} p-5 border-red-200 dark:border-red-500/20`}
  >
   <div className="flex items-start gap-3">
   <div className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 shrink-0">
    <AlertTriangle size={18} />
   </div>
   <div className="flex-1 space-y-3">
    <div>
    <h4 className="text-sm font-bold text-red-700 dark:text-red-400">Clear All Synced Data</h4>
    <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">
     This will permanently delete all synced papers, authors, keywords, journals, and related data from the database.
    </p>
    </div>

    <Button
     type="button"
     onClick={() => setShowClearDialog(true)}
     disabled={isClearing || isRunning || isBulkSyncing}
     className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg active:scale-[0.97] transition-all duration-150"
    >
     <AlertTriangle size={14} />
     Clear All Data
    </Button>

    {clearResult && (
    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/10">
     <CheckCircle2 size={14} className="text-emerald-500" />
     <span className="text-xs text-emerald-700 dark:text-emerald-400">
     {clearResult.message || 'All data cleared successfully'}
     </span>
    </div>
    )}
    {clearError && (
    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/10">
     <AlertCircle size={14} className="text-red-500" />
     <span className="text-xs text-red-600 dark:text-red-400">{clearError}</span>
    </div>
    )}
   </div>
   </div>
  </motion.div>
  </div>

	{/* -- SCImago Journal Quartile Enrichment -- */}
	<div className="border-t border-gray-200 border-primary/5 pt-6 mt-2">
	<motion.div
	 initial={{ opacity: 0 }}
	 animate={{ opacity: 1 }}
	 className={`${card} p-5 border-primary/20`}
	 style={{ borderLeft: "3px solid #10B981" }}
	>
	 <div className="flex items-start gap-3 mb-4">
	  <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: "#10B98115", color: "#10B981" }}>
	   <Layers size={18} />
	  </div>
	  <div>
	   <div className="flex items-center justify-between">
       <h4 className="text-sm font-bold text-foreground">SCImago Journal Quartile Enrichment</h4>
       {scimagoLastUploadTime && (
        <span className="text-[10px] text-gray-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
         <Clock size={10} />
         Last upload: {new Date(scimagoLastUploadTime).toLocaleString()}
        </span>
       )}
      </div>
	   <p className="text-xs text-gray-500 mt-0.5">
	    Upload the SCImago Journal Rank CSV to populate journal quartile rankings (Q1–Q4).
	   </p>
	  </div>
	 </div>

	 {/* Help text */}
	 <div className="mb-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
	  <div className="flex items-start gap-2">
	   <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
	   <div className="text-xs text-gray-400">
	    <p>
	     <a
	      href="https://www.scimagojr.com/journalrank.php?out=csv"
	      target="_blank"
	      rel="noopener noreferrer"
	      className="inline-flex items-center gap-1 text-blue-400 hover:underline font-medium"
	     >
	      Download scimagojr.csv <ExternalLink size={10} />
	     </a>
	     <span> — open the link in your browser to auto-download the CSV, then upload it here.</span>
	    </p>
	    <p className="mt-1">The system matches journals by ISSN and name, then updates the <strong className="text-foreground">Quartile</strong> column in the database.</p>
	   </div>
	  </div>
	 </div>

	 {/* Drop zone / File preview */}
	 {scimagoFile ? (
	  <>
	   <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
	    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
	     <FileText size={18} />
	    </div>
	    <div className="flex-1 min-w-0">
	     <p className="text-xs text-foreground font-medium truncate">{scimagoFile.name}</p>
	     <p className="text-[10px] text-gray-500">{(scimagoFile.size / 1024).toFixed(1)} KB</p>
	    </div>
	    <button
	     onClick={() => { setScimagoFile(null); if (scimagoInputRef.current) scimagoInputRef.current.value = ""; }}
	     className="p-1 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
	    >
	     <X size={14} />
	    </button>
	   </div>
	   <button
	    onClick={handleScimagoUpload}
	    disabled={scimagoUploading}
	    className="mt-3 w-full py-2.5 rounded-xl text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
	   >
	    {scimagoUploading ? (
	     <>
	      <RefreshCw size={14} className="animate-spin" />
	      "Enriching journals..."
	     </>
	    ) : (
	     <>
	      <Upload size={14} />
	      "Upload & Enrich"
	     </>
	    )}
	   </button>
	  </>
	 ) : (
	  <div
	   onDrop={handleScimagoDrop}
	   onDragOver={(e) => e.preventDefault()}
	   onClick={() => scimagoInputRef.current?.click()}
	   className="relative flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-primary/20 bg-black/20 cursor-pointer hover:border-primary/40 hover:bg-black/30 transition-all group"
	  >
	   <div className="p-2.5 rounded-xl bg-white/[0.04] text-gray-500 group-hover:text-primary transition-colors">
	    <Upload size={22} />
	   </div>
	   <div className="text-center">
	    <p className="text-xs text-gray-400 group-hover:text-primary transition-colors">
	     <span className="text-primary font-medium">Click to browse</span> or drag & drop
	    </p>
	    <p className="text-[10px] text-gray-600 mt-0.5">CSV only · scimagojr.csv</p>
	   </div>
	   <input
	    ref={scimagoInputRef}
	    type="file"
	    accept=".csv,text/csv"
	    onChange={handleScimagoFileSelect}
	    className="hidden"
	   />
	  </div>
	 )}

	 {/* Result */}
	 {scimagoResult && (
	  <div className="mt-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
	   <div className="flex items-center gap-2">
	    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
	    <span className="text-xs text-emerald-400">{scimagoResult}</span>
	   </div>
	  </div>
	 )}

	 {/* Error */}
	 {scimagoError && (
	  <div className="mt-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
	   <div className="flex items-center gap-2">
	    <AlertCircle size={14} className="text-red-500 shrink-0" />
	    <span className="text-xs text-red-400">{scimagoError}</span>
	   </div>
	  </div>
	 )}
	</motion.div>
	</div>


	{/* -- Clear Confirmation Dialog -- */}
  <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
  <DialogContent className="sm:max-w-md bg-card border border-primary/10 text-foreground">
   <DialogHeader>
   <DialogTitle className="flex items-center gap-2 text-base">
    <AlertTriangle size={18} className="text-red-500" />
    Clear All Synced Data
   </DialogTitle>
   <DialogDescription className="text-xs text-gray-500 dark:text-slate-400">
    This action cannot be undone. All synced papers, authors, keywords, journals, and related data will be permanently deleted from the database.
   </DialogDescription>
   </DialogHeader>
   <DialogFooter className="gap-2">
   <Button
    type="button"
    variant="outline"
    onClick={() => setShowClearDialog(false)}
    disabled={isClearing || isRunning || isBulkSyncing}
    className="text-xs bg-white dark:bg-white/[0.02] border-primary/10 text-gray-700 dark:text-slate-300"
   >
    Cancel
   </Button>
   <Button
    type="button"
    onClick={handleClearAll}
    disabled={isClearing || isRunning || isBulkSyncing}
    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg active:scale-[0.97] transition-all duration-150"
   >
    <RefreshCw size={13} className={isClearing ? 'animate-spin' : ''} />
    {isClearing ? 'Deleting...' : 'Yes, Delete Everything'}
   </Button>
   </DialogFooter>
  </DialogContent>
  </Dialog>

  {/* Research Gap Crawl */}
  <GapCrawlSection />
 </div>
 );
}
