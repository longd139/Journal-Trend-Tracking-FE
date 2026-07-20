import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { RefreshCw, CheckCircle2, XCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { useSyncStore } from '../../store/useSyncStore';

export default function SyncFloatingPanel() {
 const { t } = useTranslation('admin');
 const tasks = useSyncStore((s) => s.tasks);
 const bulkTask = useSyncStore((s) => s.bulkTask);
 const dismissTask = useSyncStore((s) => s.dismissTask);
 const dismissBulkTask = useSyncStore((s) => s.dismissBulkTask);
 const clearCompleted = useSyncStore((s) => s.clearCompleted);
 const [expanded, setExpanded] = useState(false);

 const hasAnyTask = tasks.length > 0 || bulkTask;
 if (!hasAnyTask) return null;

 const running = tasks.filter((t) => t.status === 'running');
 const done = tasks.filter((t) => t.status === 'done');
 const errors = tasks.filter((t) => t.status === 'error');
 const isAllDone = running.length === 0 && bulkTask?.status !== 'running';

 const totalDone = done.length + (bulkTask?.status === 'done' ? 1 : 0);
 const totalErrors = errors.length + (bulkTask?.status === 'error' ? 1 : 0);
 const totalRunning = running.length + (bulkTask?.status === 'running' ? 1 : 0);
 const totalTasks = tasks.length + (bulkTask ? 1 : 0);

 return (
 <motion.div
  initial={{ opacity: 0, y: 40, scale: 0.95 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={{ opacity: 0, y: 40, scale: 0.95 }}
  className="fixed bottom-6 right-6 z-50"
 >
  {!expanded ? (
  /* ── Collapsed pill ── */
  <button
   type="button"
   onClick={() => setExpanded(true)}
   className="flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-lg border text-xs font-semibold transition-all cursor-pointer active:scale-[0.97]
   bg-card border-primary/10 text-foreground hover:shadow-xl"
  >
   {!isAllDone ? (
   <RefreshCw size={14} className="animate-spin text-emerald-500" />
   ) : errors.length > 0 ? (
   <XCircle size={14} className="text-red-500" />
   ) : (
   <CheckCircle2 size={14} className="text-emerald-500" />
   )}
   <span>
   {!isAllDone
    ? t('sync.syncingProgress', { current: totalDone + totalErrors + 1, total: totalTasks })
    : `${t('sync.doneCount', { count: totalDone })}${totalErrors > 0 ? `, ${t('sync.failedCount', { count: totalErrors })}` : ''}`}
   </span>
   <Maximize2 size={12} className="text-muted-foreground dark:text-slate-500" />
  </button>
  ) : (
  /* ── Expanded card ── */
  <div className="w-72 rounded-xl shadow-xl border overflow-hidden bg-card border-primary/10">
   {/* Header */}
   <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 border-border bg-gray-50 dark:bg-muted/15">
   <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground flex items-center gap-2">
    {!isAllDone ? (
    <RefreshCw size={12} className="animate-spin text-emerald-500" />
    ) : (
    <CheckCircle2 size={12} className="text-emerald-500" />
    )}
    {t('sync.progress')}
   </h4>
   <div className="flex items-center gap-1">
    {isAllDone && (
    <button
     type="button"
     onClick={() => {
     clearCompleted();
     setExpanded(false);
     }}
     className="p-1 rounded text-[10px] text-muted-foreground hover:text-muted-foreground dark:text-slate-500 dark:hover:text-foreground transition-colors"
     title={t('sync.clearAll')}
    >
     <X size={12} />
    </button>
    )}
    <button
    type="button"
    onClick={() => setExpanded(false)}
    className="p-1 rounded text-muted-foreground hover:text-muted-foreground dark:text-slate-500 dark:hover:text-foreground active:scale-[0.90] transition-all duration-150"
    title={t('sync.minimize')}
    >
    <Minimize2 size={12} />
    </button>
   </div>
   </div>

   {/* Task list */}
   <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-white/5">
   <AnimatePresence>
    {tasks.map((task) => (
    <motion.div
     key={task.id}
     initial={{ opacity: 0, height: 0 }}
     animate={{ opacity: 1, height: 'auto' }}
     exit={{ opacity: 0, height: 0 }}
     className="px-4 py-2.5 flex items-center justify-between gap-2"
    >
     <div className="flex items-center gap-2 min-w-0">
     {task.status === 'running' && (
      <RefreshCw size={12} className="animate-spin text-emerald-500 shrink-0" />
     )}
     {task.status === 'done' && (
      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
     )}
     {task.status === 'error' && (
      <XCircle size={12} className="text-red-500 shrink-0" />
     )}
     <span className="text-[11px] font-medium text-foreground/80 dark:text-foreground truncate capitalize">
      {task.source}
     </span>
     </div>

     <div className="flex items-center gap-1 shrink-0">
     {task.status === 'done' && task.result?.message && (
      <span className="text-[9px] text-muted-foreground dark:text-slate-500 truncate max-w-[80px]">
      {task.result.message}
      </span>
     )}
     {task.status === 'error' && (
      <span className="text-[9px] text-red-500 dark:text-red-400 truncate max-w-[80px]">
      {task.error}
      </span>
     )}
     {task.status !== 'running' && (
      <button
      type="button"
      onClick={() => dismissTask(task.id)}
      className="p-0.5 rounded text-muted-foreground hover:text-muted-foreground dark:text-slate-500 dark:hover:text-foreground transition-colors"
      title={t('sync.dismiss')}
      >
      <X size={10} />
      </button>
     )}
     </div>
    </motion.div>
    ))}
   </AnimatePresence>

   {/* Bulk sync task */}
   <AnimatePresence>
    {bulkTask && (
    <motion.div
     key="bulk-task"
     initial={{ opacity: 0, height: 0 }}
     animate={{ opacity: 1, height: 'auto' }}
     exit={{ opacity: 0, height: 0 }}
     className="px-4 py-2.5 space-y-2"
    >
     <div className="flex items-center justify-between gap-2">
     <div className="flex items-center gap-2 min-w-0">
      {bulkTask.status === 'running' && (
      <RefreshCw size={12} className="animate-spin text-amber-500 shrink-0" />
      )}
      {bulkTask.status === 'done' && (
      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
      )}
      {bulkTask.status === 'error' && (
      <XCircle size={12} className="text-red-500 shrink-0" />
      )}
      <span className="text-[11px] font-medium text-foreground/80 dark:text-foreground truncate">
      {t('sync.bulkSync')}
      </span>
     </div>

     <div className="flex items-center gap-1 shrink-0">
      {bulkTask.status === 'running' && (
      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
       {bulkTask.percent ?? 0}%
      </span>
      )}
      {bulkTask.status === 'done' && bulkTask.result?.totalInserted != null && (
      <span className="text-[9px] text-muted-foreground dark:text-slate-500 truncate max-w-[80px]">
       {t('sync.insertedCount', { count: bulkTask.result.totalInserted })}
      </span>
      )}
      {bulkTask.status === 'error' && (
      <span className="text-[9px] text-red-500 dark:text-red-400 truncate max-w-[80px]">
       {bulkTask.error}
      </span>
      )}
      {bulkTask.status !== 'running' && (
      <button
       type="button"
       onClick={() => dismissBulkTask()}
       className="p-0.5 rounded text-muted-foreground hover:text-muted-foreground dark:text-slate-500 dark:hover:text-foreground transition-colors"
       title={t('sync.dismiss')}
      >
       <X size={10} />
      </button>
      )}
     </div>
     </div>

     {/* Mini progress bar for bulk task */}
     {bulkTask.status === 'running' && (
     <div className="w-full h-1 rounded-full bg-gray-200 dark:bg-muted/30 overflow-hidden">
      <motion.div
      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500"
      initial={{ width: 0 }}
      animate={{ width: `${bulkTask.percent ?? 0}%` }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      />
     </div>
     )}
    </motion.div>
    )}
   </AnimatePresence>
   </div>
  </div>
  )}
 </motion.div>
 );
}
