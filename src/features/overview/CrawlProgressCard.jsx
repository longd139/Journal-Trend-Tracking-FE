import { motion, AnimatePresence } from 'motion/react';
import {
  Loader2,
  Search,
  Filter,
  Database,
  Brain,
  GitGraph,
  CheckCircle2,
  XCircle,
  Clock,
  X,
} from 'lucide-react';

/**
 * Stages of the crawl pipeline, shown in order.
 */
const STAGES = [
  { key: 'FETCHING', icon: Search, label: 'Searching OpenAlex', detailKey: 'fetchedPapers' },
  { key: 'FILTERING', icon: Filter, label: 'Quality filtering', detailKey: 'filteredPapers' },
  { key: 'SAVING', icon: Database, label: 'Saving to database', detailKey: 'savedPapers' },
  { key: 'ENRICHING', icon: Brain, label: 'AI Enrichment', detailKey: 'enrichedPapers' },
  { key: 'MIGRATING', icon: GitGraph, label: 'Building knowledge graph', detailKey: null },
];

/**
 * Real-time crawl progress card shown in the chatbot while
 * the system fetches papers for unmatched keywords from OpenAlex.
 */
export default function CrawlProgressCard({ progress, keywords, onCancel }) {
  if (!progress) {
    return (
      <div className="flex flex-col items-center justify-center p-6 gap-3">
        <Loader2 size={24} className="animate-spin text-accent-blue" />
        <p className="text-xs text-muted-foreground">Starting crawl...</p>
      </div>
    );
  }

  const isDone = progress.status === 'DONE';
  const isFailed = progress.status === 'FAILED';
  const currentStage = progress.currentStage || progress.status;
  const stageOrder = STAGES.map((s) => s.key);

  // Find the index of the current stage
  const currentIdx = stageOrder.indexOf(currentStage);

  /**
   * Determine the visual state of a stage based on its position
   * relative to the current stage.
   */
  function getStageState(stageKey) {
    const idx = stageOrder.indexOf(stageKey);
    if (isFailed) return idx <= currentIdx ? 'done' : 'pending';
    if (isDone) return 'done';
    if (idx < currentIdx) return 'done';
    if (idx === currentIdx) return 'running';
    return 'pending';
  }

  /**
   * Get the detail number for a stage from the progress object.
   */
  function getStageDetail(stage) {
    if (!stage.detailKey || !progress) return null;
    const val = progress[stage.detailKey];
    if (val === undefined || val === null) return null;
    return val;
  }

  /**
   * Get a human-readable description of what's happening in the current stage.
   */
  function getStageDescription(stage) {
    const detail = getStageDetail(stage);
    switch (stage.key) {
      case 'FETCHING':
        return progress.currentKeyword
          ? `"${progress.currentKeyword}" → ${progress.fetchedPapers || 0} papers so far`
          : `Found ${progress.fetchedPapers || 0} papers`;
      case 'FILTERING':
        return progress.rejectedPapers > 0
          ? `${progress.qualityPapers || 0} passed, ${progress.rejectedPapers} rejected (score < 40)`
          : `${progress.qualityPapers || 0} papers passed quality check`;
      case 'SAVING':
        return `${progress.savedPapers || 0}/${progress.qualityPapers || progress.totalPapers || '?'} papers saved`;
      case 'ENRICHING':
        return `${progress.enrichedPapers || 0}/${progress.qualityPapers || progress.totalPapers || '?'} papers enriched`;
      case 'MIGRATING':
        return progress.newKeywords > 0
          ? `Linking ${progress.newKeywords} new keywords to graph`
          : 'Updating hierarchy and topic links';
      default:
        return null;
    }
  }

  // ── Done state ──
  if (isDone) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col gap-3 p-4 rounded-xl border border-accent-teal/20 bg-accent-teal/5"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 size={18} className="text-accent-teal" />
          <h4 className="text-sm font-bold text-foreground">Crawl Complete!</h4>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <Stat label="Papers found" value={progress.totalPapers} />
          <Stat label="Passed quality" value={progress.qualityPapers} />
          <Stat label="Saved" value={progress.savedPapers} />
          <Stat label="Enriched" value={progress.enrichedPapers} />
          <Stat label="New keywords" value={progress.newKeywords} />
          <Stat label="Duration" value={formatSeconds(progress.getElapsedSeconds?.() || 0)} />
        </div>

        <p className="text-xs text-accent-teal flex items-center gap-1.5">
          <Loader2 size={12} className="animate-spin" />
          Analyzing gaps with new data...
        </p>
      </motion.div>
    );
  }

  // ── Failed state ──
  if (isFailed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5"
      >
        <div className="flex items-center gap-2">
          <XCircle size={18} className="text-red-400" />
          <h4 className="text-sm font-bold text-red-300">Crawl Failed</h4>
        </div>
        {progress.error && (
          <p className="text-xs text-red-400 bg-red-500/10 rounded-lg p-2">{progress.error}</p>
        )}
        <p className="text-xs text-muted-foreground">You can try again or explore available topics.</p>
      </motion.div>
    );
  }

  // ── In progress ──
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-3 p-4 rounded-xl border border-accent-blue/20 bg-accent-blue/5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Loader2 size={14} className="animate-spin text-accent-blue" />
          <h4 className="text-sm font-bold text-foreground">Crawling your idea...</h4>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="p-1 rounded hover:bg-muted/40 text-muted-foreground" title="Cancel crawl">
            <X size={14} />
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Crawling keywords:{' '}
        <span className="text-accent-blue font-medium">
          {keywords.join(', ')}
        </span>
      </p>

      {/* Stage list */}
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {STAGES.map((stage, i) => {
            const state = getStageState(stage.key);
            const detail = getStageDetail(stage);
            const desc = state === 'running' ? getStageDescription(stage) : null;
            const Icon = stage.icon;

            return (
              <motion.div
                key={stage.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                  state === 'running'
                    ? 'bg-accent-blue/10 border border-accent-blue/20'
                    : state === 'done'
                    ? 'bg-transparent'
                    : 'bg-transparent opacity-40'
                }`}
              >
                {/* Stage icon */}
                {state === 'done' ? (
                  <CheckCircle2 size={14} className="text-accent-teal shrink-0" />
                ) : state === 'running' ? (
                  <Icon size={14} className="text-accent-blue shrink-0" />
                ) : (
                  <Icon size={14} className="text-muted-foreground shrink-0" />
                )}

                {/* Stage label + detail */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs ${
                      state === 'running'
                        ? 'text-foreground font-medium'
                        : state === 'done'
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {stage.label}
                  </p>
                  {desc && (
                    <p className="text-[10px] text-accent-blue/80 mt-0.5">{desc}</p>
                  )}
                </div>

                {/* Count badge */}
                {detail !== null && state === 'done' && (
                  <span className="text-[10px] text-accent-teal font-medium shrink-0">
                    {detail}
                  </span>
                )}
                {state === 'running' && detail !== null && (
                  <span className="text-[10px] text-accent-blue font-medium shrink-0 animate-pulse">
                    {detail}
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Time estimate */}
      {progress.estimatedSeconds > 0 && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Clock size={10} />
          <span>~{formatSeconds(progress.estimatedSeconds)} remaining</span>
        </div>
      )}
    </motion.div>
  );
}

// ── Helpers ──

function Stat({ label, value }) {
  return (
    <div className="flex items-center justify-between px-2 py-1 rounded bg-card">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-semibold">{value ?? '–'}</span>
    </div>
  );
}

function formatSeconds(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return '–';
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}
