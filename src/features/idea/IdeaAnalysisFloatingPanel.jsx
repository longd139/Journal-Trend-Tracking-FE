import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  X,
  Minimize2,
  Maximize2,
  FileText,
  Clock,
} from 'lucide-react';
import { useIdeaAnalysisStore } from '../../store/useIdeaAnalysisStore';

/**
 * Formats elapsed seconds into a human-readable string.
 */
function formatElapsed(startedAt) {
  const diff = Math.floor((Date.now() - startedAt) / 1000);
  if (diff < 60) return `${diff}s`;
  const mins = Math.floor(diff / 60);
  const secs = diff % 60;
  return `${mins}m ${secs}s`;
}

export default function IdeaAnalysisFloatingPanel() {
  const { t } = useTranslation('idea');
  const navigate = useNavigate();
  const task = useIdeaAnalysisStore((s) => s.task);
  const dismissTask = useIdeaAnalysisStore((s) => s.dismissTask);

  const [expanded, setExpanded] = useState(false);
  const [elapsed, setElapsed] = useState('');
  const elapsedTimer = useRef(null);

  // ── Elapsed time ticker (only when running) ──
  const updateElapsed = useCallback(() => {
    if (task?.startedAt) {
      setElapsed(formatElapsed(task.startedAt));
    }
  }, [task?.startedAt]);

  useEffect(() => {
    if (task?.status === 'running') {
      updateElapsed();
      elapsedTimer.current = setInterval(updateElapsed, 1000);
    } else {
      if (elapsedTimer.current) {
        clearInterval(elapsedTimer.current);
        elapsedTimer.current = null;
      }
      if (task?.completedAt && task?.startedAt) {
        setElapsed(formatElapsed(task.startedAt));
      }
    }
    return () => {
      if (elapsedTimer.current) {
        clearInterval(elapsedTimer.current);
        elapsedTimer.current = null;
      }
    };
  }, [task?.status, task?.startedAt, task?.completedAt, updateElapsed]);

  // ── Reset expanded when task disappears ──
  useEffect(() => {
    if (!task) setExpanded(false);
  }, [task]);

  // ── Collapse when clicking "View Results" ──
  const handleViewResults = () => {
    const role = sessionStorage.getItem('userRole') || 'researcher';
    navigate(`/${role}/ideas`);
    setExpanded(false);
  };

  const handleRetry = () => {
    if (!task) return;
    const store = useIdeaAnalysisStore.getState();
    store.startAnalysis({
      ideaText: task.ideaText,
      selectedKeywords: task.keywords,
    });
    setExpanded(false);
  };

  if (!task) return null;

  const isRunning = task.status === 'running';
  const isDone = task.status === 'done';
  const isError = task.status === 'error';
  const paperCount = task.result?.papers?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.95 }}
      className="fixed bottom-20 right-6 z-50"
    >
      {!expanded ? (
        /* ══════════════════════════════════════════════════════════════════
           Collapsed pill
           ══════════════════════════════════════════════════════════════════ */
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-lg border text-xs font-semibold transition-all cursor-pointer active:scale-[0.97] bg-card hover:shadow-xl ${
            isDone
              ? 'border-emerald-300 dark:border-emerald-500/30 text-foreground'
              : isError
                ? 'border-red-300 dark:border-red-500/30 text-foreground'
                : 'border-primary/10 text-foreground'
          }`}
        >
          {isRunning && (
            <RefreshCw size={14} className="animate-spin text-accent-blue" />
          )}
          {isDone && <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-500" />}
          {isError && <XCircle size={14} className="text-red-600 dark:text-red-500" />}

          <span className="max-w-[160px] truncate">
            {isRunning &&
              (task.primaryKeyword
                ? t('idea:floatingPanel.analyzing', { keyword: task.primaryKeyword })
                : t('idea:floatingPanel.analyzingGeneric'))}
            {isDone && t('idea:floatingPanel.complete')}
            {isError && t('idea:floatingPanel.failed')}
          </span>

          <Maximize2 size={12} className="text-muted-foreground dark:text-slate-500" />
        </button>
      ) : (
        /* ══════════════════════════════════════════════════════════════════
           Expanded card
           ══════════════════════════════════════════════════════════════════ */
        <div className="w-72 rounded-xl shadow-xl border overflow-hidden bg-card border-primary/10">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/25">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground flex items-center gap-2">
              {isRunning && (
                <RefreshCw size={12} className="animate-spin text-accent-blue" />
              )}
              {isDone && (
                <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-500" />
              )}
              {isError && <XCircle size={12} className="text-red-600 dark:text-red-500" />}

              {isRunning && t('idea:floatingPanel.inProgress')}
              {isDone && t('idea:floatingPanel.complete')}
              {isError && t('idea:floatingPanel.failed')}
            </h4>
            <div className="flex items-center gap-1">
              {isDone && (
                <button
                  type="button"
                  onClick={() => {
                    dismissTask();
                    setExpanded(false);
                  }}
                  className="p-1 rounded text-[10px] text-muted-foreground hover:text-foreground/70 dark:text-slate-500 dark:hover:text-foreground transition-colors"
                  title={t('idea:floatingPanel.dismiss')}
                >
                  <X size={12} />
                </button>
              )}
              {isError && (
                <button
                  type="button"
                  onClick={() => {
                    dismissTask();
                    setExpanded(false);
                  }}
                  className="p-1 rounded text-[10px] text-muted-foreground hover:text-foreground/70 dark:text-slate-500 dark:hover:text-foreground transition-colors"
                  title={t('idea:floatingPanel.dismiss')}
                >
                  <X size={12} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="p-1 rounded text-muted-foreground hover:text-foreground/70 dark:text-slate-500 dark:hover:text-foreground active:scale-[0.90] transition-all duration-150"
                title={t('idea:floatingPanel.minimize')}
              >
                <Minimize2 size={12} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-4 py-3 space-y-3">
            {/* Keyword / idea text */}
            <div className="flex items-start gap-2">
              <FileText
                size={14}
                className="text-muted-foreground shrink-0 mt-0.5"
              />
              <span className="text-[11px] text-foreground/80 dark:text-muted-foreground leading-relaxed line-clamp-2">
                {task.keywords?.join(', ') || task.primaryKeyword}
              </span>
            </div>

            {/* Elapsed time */}
            {elapsed && (
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-muted-foreground shrink-0" />
                <span className="text-[10px] text-muted-foreground">
                  {t('idea:floatingPanel.elapsed', { time: elapsed })}
                </span>
              </div>
            )}

            {/* Paper count (done state) */}
            {isDone && paperCount > 0 && (
              <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
                {t('idea:floatingPanel.papersFound', { count: paperCount })}
              </div>
            )}

            {/* Indeterminate progress bar (running state) */}
            {isRunning && (
              <div className="w-full h-1 rounded-full bg-muted/30 overflow-hidden">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-accent-blue/60 to-accent-blue animate-pulse" />
              </div>
            )}

            {/* Background notice (running state) */}
            {isRunning && (
              <p className="text-[10px] text-muted-foreground dark:text-slate-600 italic">
                {t('idea:floatingPanel.backgroundNotice')}
              </p>
            )}

            {/* Error message */}
            {isError && task.error && (
              <p className="text-[11px] text-red-600/80 dark:text-red-400/80 leading-relaxed">
                {task.error}
              </p>
            )}

            {/* Action buttons */}
            {isDone && (
              <button
                type="button"
                onClick={handleViewResults}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-accent-blue text-white hover:bg-accent-blue/90 active:scale-[0.98] transition-all"
              >
                {t('idea:floatingPanel.viewResults')}
              </button>
            )}

            {isError && (
              <button
                type="button"
                onClick={handleRetry}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 active:scale-[0.98] transition-all"
              >
                {t('idea:floatingPanel.retry')}
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
