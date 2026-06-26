import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 RefreshCw, Search, Database, CheckCircle2, AlertCircle, Clock,
 ChevronDown, ChevronUp, Globe, Brain, Archive, Layers, AlertTriangle,
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useSyncStore } from '../store/useSyncStore';
import { adminAPI } from '../lib/api/admin.api';
import { toast } from 'sonner';
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from '../components/ui/dialog';

const card = 'bg-[#101010] border border-[#DEDBC8]/5 rounded-xl';

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => 1900 + i).reverse();

const SOURCES = [
 { key: 'openalex', label: 'OpenAlex', Icon: Globe },
 { key: 'semanticScholar', label: 'Semantic Scholar', Icon: Brain },
 { key: 'arxiv', label: 'arXiv', Icon: Archive },
 { key: 'core', label: 'CORE', Icon: Layers },
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
   <span className="text-[10px] font-bold uppercase tracking-wider text-[#E1E0CC]">
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
   <div className="bg-transparent/50 border border-gray-200 border-[#DEDBC8]/5 rounded-lg p-3">
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
  <pre className="p-3 rounded-lg bg-transparent/50 border border-gray-200 border-[#DEDBC8]/5 text-gray-700 dark:text-slate-300 text-[11px] overflow-x-auto font-mono max-h-40 overflow-y-auto">
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
 const [selectedSources, setSelectedSources] = useState(
 SOURCES.map((s) => s.key),
 );

 const tasks = useSyncStore((s) => s.tasks);
 const bulkTask = useSyncStore((s) => s.bulkTask);
 const startTasks = useSyncStore((s) => s.startTasks);
 const startBulkSync = useSyncStore((s) => s.startBulkSync);
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

 const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
 const [autoSyncStats, setAutoSyncStats] = useState(null);
 const [isToggling, setIsToggling] = useState(false);
 const [isLoadingAutoSync, setIsLoadingAutoSync] = useState(true);

 const fetchAutoSyncStatus = useCallback(async () => {
 try {
  const response = await adminAPI.getAutoSyncStatus();
  setAutoSyncStats(response.data || response);
 } catch {
  // silently fail
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
  await adminAPI.toggleAutoSync(newState);
  setAutoSyncEnabled(newState);
  toast.success(newState ? 'Auto-sync enabled' : 'Auto-sync disabled', {
  position: 'top-right',
  duration: 3000,
  });
  // Refresh stats after toggling
  fetchAutoSyncStatus();
 } catch (err) {
  toast.error(err.response?.data?.message || 'Failed to toggle auto-sync', {
  position: 'top-right',
  duration: 4000,
  });
 } finally {
  setIsToggling(false);
 }
 };

 // ── Bulk Sync ──
 const [bulkKeywords, setBulkKeywords] = useState('');
 const [bulkPapersPerKeyword, setBulkPapersPerKeyword] = useState(100);
 const [bulkYearFrom, setBulkYearFrom] = useState('');
 const [bulkYearTo, setBulkYearTo] = useState(String(currentYear));
 const [useDefaultBulk, setUseDefaultBulk] = useState(false);

 // Derived from store — survives tab navigation
 const isBulkSyncing = bulkTask?.status === 'running';
 const bulkResult = bulkTask?.status === 'done' ? (bulkTask.result || bulkTask) : null;
 const bulkError = bulkTask?.status === 'error' ? bulkTask.error : null;
 // bulkProgress = the live task object from store (has percent, keywordStats, etc.)
 const bulkProgress = bulkTask?.status === 'running' ? bulkTask : null;

 const handleBulkSync = async () => {
 let body;
 if (useDefaultBulk) {
  body = {};
 } else {
  const keywords = bulkKeywords
  .split(/[\n,]+/)
  .map((k) => k.trim())
  .filter(Boolean);
  if (keywords.length === 0) {
  setBulkError('Please enter at least one keyword.');
  return;
  }
  body = {
  keywords,
  papersPerKeyword: bulkPapersPerKeyword,
  };
  if (bulkYearFrom) body.yearFrom = parseInt(bulkYearFrom, 10);
  if (bulkYearTo) body.yearTo = parseInt(bulkYearTo, 10);
 }

 // Delegate to store — polling lives there and survives tab switches
 startBulkSync(body);
 };

 const setBulkError = (msg) => {
 // still used for validation errors (not API errors — those are in the store)
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

 const allSelected = selectedSources.length === SOURCES.length;

 const toggleAll = () => {
 setSelectedSources(allSelected ? [] : SOURCES.map((s) => s.key));
 };

 const toggleSource = (key) => {
 setSelectedSources((prev) =>
  prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
 );
 };

 const handleSync = () => {
 if (!query.trim() || selectedSources.length === 0) return;

 const params = {
  query: query.trim(),
  limit,
  yearFrom: yearFrom ? parseInt(yearFrom, 10) : undefined,
  yearTo: yearTo ? parseInt(yearTo, 10) : undefined,
 };

 startTasks(selectedSources, params);
 };

 const canSync = query.trim() && selectedSources.length > 0 && !isRunning && !isBulkSyncing && !isClearing;

 return (
 <div className="p-6 space-y-6 max-w-3xl mx-auto">
  {/* ── Header ── */}
  <div>
  <h2 className="text-lg font-black text-[#E1E0CC] font-display flex items-center gap-2">
   <RefreshCw size={18} className="text-emerald-500" />
   Sync Data
  </h2>
  <p className="text-xs mt-0.5 text-gray-400">
   Fetch and import academic papers from multiple sources into the system database.
  </p>
  </div>

  {/* ── Sync Form ── */}
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
    className="pl-9 pr-4 py-2.5 rounded-lg text-sm bg-[#1a1a1a] border-[#DEDBC8]/10 text-slate-200"
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
    className="py-2.5 rounded-lg text-sm text-center bg-[#1a1a1a] border-[#DEDBC8]/10 text-slate-200"
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
   className="w-24 py-2 rounded-lg text-sm text-center bg-[#1a1a1a] border border-[#DEDBC8]/10 text-slate-200 outline-none focus:border-emerald-500/50 transition-colors cursor-pointer"
   style={{ colorScheme: 'dark' }}
   >
   <option value="">From</option>
   {YEAR_OPTIONS.map((y) => (
    <option key={y} value={y}>{y}</option>
   ))}
   </select>
   <span className="text-xs text-gray-400 dark:text-slate-500">—</span>
   <select
   value={yearTo}
   onChange={(e) => setYearTo(e.target.value)}
   className="w-24 py-2 rounded-lg text-sm text-center bg-[#1a1a1a] border border-[#DEDBC8]/10 text-slate-200 outline-none focus:border-emerald-500/50 transition-colors cursor-pointer"
   style={{ colorScheme: 'dark' }}
   >
   <option value="">To</option>
   {YEAR_OPTIONS.map((y) => (
    <option key={y} value={y}>{y}</option>
   ))}
   </select>
  </div>

  {/* Source selection — icon buttons */}
  <div className="space-y-2">
   <div className="flex items-center justify-between">
   <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
    Data Sources
   </label>
   <button
    type="button"
    onClick={toggleAll}
    className="text-[10px] font-medium text-gray-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
   >
    {allSelected ? 'Deselect All' : 'Select All'}
   </button>
   </div>

   <div className="flex flex-wrap gap-2">
   {SOURCES.map(({ key, label, Icon }) => {
    const isSelected = selectedSources.includes(key);
    return (
    <button
     key={key}
     type="button"
     onClick={() => toggleSource(key)}
     className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-xs font-semibold transition-all ${
     isSelected
      ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 shadow-sm shadow-emerald-500/10'
      : 'bg-gray-50 dark:bg-white/[0.03] border-[#DEDBC8]/10 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-white/20'
     }`}
    >
     <Icon size={16} />
     {label}
    </button>
    );
   })}
   </div>
  </div>

  <Button
   type="button"
   disabled={!canSync}
   onClick={handleSync}
   className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  >
   <RefreshCw size={15} className={isRunning ? 'animate-spin' : ''} />
   {isRunning
   ? `Syncing ${runningTasks.length} source(s)...`
   : `Sync ${selectedSources.length} source(s)`}
  </Button>
  </motion.div>

  {/* ── Loading ── */}
  {isRunning && (
  <div className="text-center py-8">
   <RefreshCw size={24} className="animate-spin mx-auto text-emerald-500 mb-2" />
   <p className="text-xs text-gray-500 dark:text-slate-400">
   Syncing {runningTasks.length}/{allTasks.length} source(s) for{' '}
   <strong className="text-[#E1E0CC]">"{query}"</strong>...
   </p>
   <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
   You can navigate to other pages — sync continues in the background.
   </p>
  </div>
  )}

  {/* ── Results ── */}
  <AnimatePresence>
  {hasResults && (
   <div className="space-y-3">
   <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
    <Database size={14} className="text-gray-500 dark:text-slate-400" />
    <h4 className="text-sm font-bold text-[#E1E0CC]">
     Results ({doneTasks.length} done{errorTasks.length > 0 ? `, ${errorTasks.length} failed` : ''})
    </h4>
    </div>
    {!isRunning && doneTasks.length + errorTasks.length > 0 && (
    <button
     type="button"
     onClick={clearCompleted}
     className="text-[10px] text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
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

  {/* ── Auto Sync ── */}
  <div className={`border-t border-gray-200 border-[#DEDBC8]/5 pt-6 mt-2 ${isRunning || isBulkSyncing || isClearing ? 'opacity-50 pointer-events-none' : ''}`}>
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
    <h4 className="text-sm font-bold text-[#E1E0CC]">Auto Sync</h4>
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

   {/* Stats summary */}
   {!isLoadingAutoSync && autoSyncStats && (
   <div className="mt-4 pt-4 border-t border-gray-100 border-[#DEDBC8]/5">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
    <div className="p-2 rounded-lg bg-gray-50 dark:bg-white/[0.02] text-center">
     <div className="text-sm font-bold text-[#E1E0CC] font-mono">
     {autoSyncStats.papers?.total?.toLocaleString() ?? '—'}
     </div>
     <div className="text-[9px] uppercase tracking-wider text-gray-500 dark:text-slate-400">Papers</div>
    </div>
    <div className="p-2 rounded-lg bg-gray-50 dark:bg-white/[0.02] text-center">
     <div className="text-sm font-bold text-[#E1E0CC] font-mono">
     {autoSyncStats.authors?.total?.toLocaleString() ?? '—'}
     </div>
     <div className="text-[9px] uppercase tracking-wider text-gray-500 dark:text-slate-400">Authors</div>
    </div>
    <div className="p-2 rounded-lg bg-gray-50 dark:bg-white/[0.02] text-center">
     <div className="text-sm font-bold text-[#E1E0CC] font-mono">
     {autoSyncStats.syncLogs?.total?.toLocaleString() ?? '—'}
     </div>
     <div className="text-[9px] uppercase tracking-wider text-gray-500 dark:text-slate-400">Syncs</div>
    </div>
    <div className="p-2 rounded-lg bg-gray-50 dark:bg-white/[0.02] text-center">
     <div className="text-xs font-bold text-[#E1E0CC] font-mono">
     {autoSyncStats.syncLogs?.lastSync
      ? new Date(autoSyncStats.syncLogs.lastSync).toLocaleDateString()
      : '—'}
     </div>
     <div className="text-[9px] uppercase tracking-wider text-gray-500 dark:text-slate-400">Last Sync</div>
    </div>
    </div>
   </div>
   )}
  </motion.div>
  </div>

  {/* ── Bulk Sync ── */}
  <div className={`border-t border-gray-200 border-[#DEDBC8]/5 pt-6 mt-2 ${isRunning || isClearing ? 'opacity-50 pointer-events-none' : ''}`}>
  <motion.div
   initial={{ opacity: 0 }}
   animate={{ opacity: 1 }}
   className={`${card} p-5`}
  >
   <div className="flex items-start gap-3 mb-4">
   <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-500 shrink-0">
    <Layers size={18} />
   </div>
   <div>
    <h4 className="text-sm font-bold text-[#E1E0CC]">Bulk Sync</h4>
    <p className="text-xs text-gray-500 dark:text-slate-400">
    Sync multiple keywords at once or use default trending keywords.
    </p>
   </div>
   </div>

   {/* Default toggle */}
   <label className="flex items-center gap-3 mb-4 cursor-pointer">
   <button
    type="button"
    onClick={() => setUseDefaultBulk(!useDefaultBulk)}
    className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors border-2 ${
    useDefaultBulk
     ? 'bg-amber-500 border-amber-500'
     : 'bg-gray-300 dark:bg-gray-600 border-gray-300 dark:border-gray-500'
    }`}
   >
    <span
    className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
     useDefaultBulk ? 'translate-x-[18px]' : 'translate-x-[2px]'
    }`}
    />
   </button>
   <span className="text-xs text-gray-700 dark:text-slate-300">
    Use default trending keywords (20 keywords × 100 papers)
   </span>
   </label>

   {!useDefaultBulk && (
   <div className="space-y-3 mb-4">
    <div className="space-y-1.5">
    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
     Keywords
    </label>
    <textarea
     placeholder="Enter keywords, one per line or comma-separated&#10;e.g.&#10;machine learning&#10;deep learning&#10;computer vision"
     value={bulkKeywords}
     onChange={(e) => setBulkKeywords(e.target.value)}
     rows={4}
     className="w-full p-3 rounded-lg text-xs bg-[#1a1a1a] border border-[#DEDBC8]/10 text-slate-200 outline-none focus:border-amber-500/50 transition-colors resize-none"
    />
    </div>

    <div className="flex flex-col sm:flex-row gap-3">
    <div className="w-full sm:w-40 space-y-1.5">
     <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
     Papers per keyword
     </label>
     <Input
     type="number"
     min={1}
     max={500}
     value={bulkPapersPerKeyword}
     onChange={(e) => setBulkPapersPerKeyword(parseInt(e.target.value, 10) || 100)}
     className="py-2.5 rounded-lg text-sm text-center bg-[#1a1a1a] border-[#DEDBC8]/10 text-slate-200"
     />
    </div>
    <div className="flex items-end gap-2">
     <div className="space-y-1.5">
     <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
      Year From
     </label>
     <select
      value={bulkYearFrom}
      onChange={(e) => setBulkYearFrom(e.target.value)}
      className="w-24 py-2 rounded-lg text-sm text-center bg-[#1a1a1a] border border-[#DEDBC8]/10 text-slate-200 outline-none focus:border-amber-500/50 transition-colors cursor-pointer"
      style={{ colorScheme: 'dark' }}
     >
      <option value="">Any</option>
      {YEAR_OPTIONS.map((y) => (
      <option key={y} value={y}>{y}</option>
      ))}
     </select>
     </div>
     <span className="text-xs text-gray-400 dark:text-slate-500 pb-2">—</span>
     <div className="space-y-1.5">
     <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
      Year To
     </label>
     <select
      value={bulkYearTo}
      onChange={(e) => setBulkYearTo(e.target.value)}
      className="w-24 py-2 rounded-lg text-sm text-center bg-[#1a1a1a] border border-[#DEDBC8]/10 text-slate-200 outline-none focus:border-amber-500/50 transition-colors cursor-pointer"
      style={{ colorScheme: 'dark' }}
     >
      <option value="">Any</option>
      {YEAR_OPTIONS.map((y) => (
      <option key={y} value={y}>{y}</option>
      ))}
     </select>
     </div>
    </div>
    </div>
   </div>
   )}

   <Button
   type="button"
   disabled={isBulkSyncing || isRunning || isClearing}
   onClick={handleBulkSync}
   className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
   >
   <RefreshCw size={15} className={isBulkSyncing ? 'animate-spin' : ''} />
   {isBulkSyncing && bulkProgress
    ? `Syncing... ${bulkProgress.percent ?? 0}%`
    : isBulkSyncing
    ? 'Starting bulk sync...'
    : 'Start Bulk Sync'}
   </Button>

   {/* ── Bulk progress bar ── */}
   {isBulkSyncing && bulkProgress && (
   <motion.div
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-4 space-y-3 border-t border-gray-100 border-[#DEDBC8]/5 pt-4"
   >
    {/* Percent + status */}
    <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
     <RefreshCw size={14} className="animate-spin text-amber-500" />
     <span className="text-xs font-bold text-[#E1E0CC]">
     {bulkProgress.percent ?? 0}% complete
     </span>
     <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400">
     {bulkProgress.status || 'RUNNING'}
     </span>
    </div>
    <span className="text-[10px] text-gray-500 dark:text-slate-400">
     {bulkProgress.completedKeywords ?? 0}/{bulkProgress.totalKeywords ?? '?'} keywords
    </span>
    </div>

    {/* Progress bar */}
    <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-white/[0.06] overflow-hidden">
    <motion.div
     className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500"
     initial={{ width: 0 }}
     animate={{ width: `${bulkProgress.percent ?? 0}%` }}
     transition={{ duration: 0.4, ease: 'easeOut' }}
    />
    </div>

    {/* Detail stats */}
    <div className="grid grid-cols-3 gap-2 text-center">
    <div className="p-2 rounded-lg bg-gray-50 dark:bg-white/[0.02]">
     <div className="text-sm font-bold text-[#E1E0CC] font-mono">
     {bulkProgress.currentKeyword || '—'}
     </div>
     <div className="text-[9px] uppercase tracking-wider text-gray-500 dark:text-slate-400">Current</div>
    </div>
    <div className="p-2 rounded-lg bg-gray-50 dark:bg-white/[0.02]">
     <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
     {bulkProgress.totalFetched ?? 0}
     </div>
     <div className="text-[9px] uppercase tracking-wider text-gray-500 dark:text-slate-400">Fetched</div>
    </div>
    <div className="p-2 rounded-lg bg-gray-50 dark:bg-white/[0.02]">
     <div className="text-sm font-bold text-[#DEDBC8] font-mono">
     {bulkProgress.totalInserted ?? 0}
     </div>
     <div className="text-[9px] uppercase tracking-wider text-gray-500 dark:text-slate-400">Inserted</div>
    </div>
    </div>

    {/* Per-keyword stats (if available) */}
    {bulkProgress.keywordStats && Object.keys(bulkProgress.keywordStats).length > 0 && (
    <div className="bg-transparent/50 border border-gray-200 border-[#DEDBC8]/5 rounded-lg p-3 max-h-48 overflow-y-auto">
     <table className="w-full text-xs">
     <thead>
      <tr className="border-b border-gray-200 border-[#DEDBC8]/5">
      <th className="text-left py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Keyword</th>
      <th className="text-right py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Fetched</th>
      <th className="text-right py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Inserted</th>
      </tr>
     </thead>
     <tbody>
      {Object.entries(bulkProgress.keywordStats).map(([kw, stats]) => (
      <tr key={kw} className="border-b border-gray-100 dark:border-white/[0.03] last:border-b-0">
       <td className="py-1.5 font-medium text-gray-700 dark:text-slate-300">
       {kw}
       {bulkProgress.currentKeyword === kw && (
        <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse align-middle" />
       )}
       </td>
       <td className="py-1.5 text-right font-mono text-emerald-600 dark:text-emerald-400">{stats.fetched}</td>
       <td className="py-1.5 text-right font-mono text-[#DEDBC8]">{stats.inserted}</td>
      </tr>
      ))}
     </tbody>
     </table>
    </div>
    )}
   </motion.div>
   )}

   {/* Bulk error */}
   {bulkError && (
   <div className="mt-4 flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/10">
    <AlertCircle size={14} className="text-red-500" />
    <span className="text-xs text-red-600 dark:text-red-400">{bulkError}</span>
   </div>
   )}

   {/* Bulk result (on completion) */}
   {bulkResult && !isBulkSyncing && (
   <div className="mt-4 space-y-3 border-t border-gray-100 border-[#DEDBC8]/5 pt-4">
    <div className="flex items-center gap-2">
    <CheckCircle2 size={14} className="text-emerald-500" />
    <span className="text-xs font-bold text-[#E1E0CC]">
     {bulkResult.totalKeywords != null && `${bulkResult.totalKeywords} keywords · `}
     {bulkResult.totalFetched != null && `${bulkResult.totalFetched} fetched · `}
     {(bulkResult.totalInserted ?? bulkResult.result?.totalInserted) != null
     && `${bulkResult.totalInserted ?? bulkResult.result?.totalInserted} inserted`}
    </span>
    {bulkResult.completedAt && (
     <span className="text-[10px] text-gray-500 dark:text-slate-400 ml-auto">
     {new Date(bulkResult.completedAt).toLocaleString()}
     </span>
    )}
    {bulkResult.yearRange && (
     <span className="text-[10px] text-gray-500 dark:text-slate-400 ml-auto">
     {bulkResult.yearRange}
     </span>
    )}
    </div>

    {(bulkResult.keywordStats || bulkProgress?.keywordStats) && (
    <div className="bg-transparent/50 border border-gray-200 border-[#DEDBC8]/5 rounded-lg p-3 max-h-48 overflow-y-auto">
     <table className="w-full text-xs">
     <thead>
      <tr className="border-b border-gray-200 border-[#DEDBC8]/5">
      <th className="text-left py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Keyword</th>
      <th className="text-right py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Fetched</th>
      <th className="text-right py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Inserted</th>
      </tr>
     </thead>
     <tbody>
      {Object.entries(bulkResult.keywordStats || bulkProgress?.keywordStats || {}).map(([kw, stats]) => (
      <tr key={kw} className="border-b border-gray-100 dark:border-white/[0.03] last:border-b-0">
       <td className="py-1.5 font-medium text-gray-700 dark:text-slate-300">{kw}</td>
       <td className="py-1.5 text-right font-mono text-emerald-600 dark:text-emerald-400">{stats.fetched}</td>
       <td className="py-1.5 text-right font-mono text-[#DEDBC8]">{stats.inserted}</td>
      </tr>
      ))}
     </tbody>
     </table>
    </div>
    )}
   </div>
   )}
  </motion.div>
  </div>

  {/* ── Clear All Data ── */}
  <div className={`border-t border-gray-200 border-[#DEDBC8]/5 pt-6 mt-2 ${isRunning || isBulkSyncing ? 'opacity-50 pointer-events-none' : ''}`}>
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
     className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
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

  {/* ── Clear Confirmation Dialog ── */}
  <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
  <DialogContent className="sm:max-w-md bg-[#101010] border border-[#DEDBC8]/10 text-[#E1E0CC]">
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
    className="text-xs bg-white dark:bg-white/[0.02] border-[#DEDBC8]/10 text-gray-700 dark:text-slate-300"
   >
    Cancel
   </Button>
   <Button
    type="button"
    onClick={handleClearAll}
    disabled={isClearing || isRunning || isBulkSyncing}
    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
   >
    <RefreshCw size={13} className={isClearing ? 'animate-spin' : ''} />
    {isClearing ? 'Deleting...' : 'Yes, Delete Everything'}
   </Button>
   </DialogFooter>
  </DialogContent>
  </Dialog>
 </div>
 );
}
