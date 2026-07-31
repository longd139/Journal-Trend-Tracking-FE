import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2, Database, Gauge, Wrench, Lightbulb, ArrowLeft } from 'lucide-react';
import useGapExplorerStore from '../../store/useGapExplorerStore';

function DimSection({ icon: Icon, title, items, emptyText }) {
  return (
    <div className="p-3 rounded-lg bg-card border border-border">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={12} className="text-primary" />
        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{title}</h4>
      </div>
      {items && items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {items.slice(0, 8).map((item, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded text-[10px] font-medium bg-primary/5 text-foreground"
              title={item.count ? `${item.count} papers` : ''}
            >
              {item.name}
              {item.count && <span className="ml-1 text-muted-foreground">({item.count})</span>}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-muted-foreground italic">{emptyText || 'No data extracted yet'}</p>
      )}
    </div>
  );
}

/**
 * Smart dimension pair: if both sides have data → show 2 separate cards.
 * If both are empty → show 1 merged card spanning full width.
 * If only one has data → show that one card at full width + a small "not found" note.
 */
function DimPair({ icon: Icon, label, itemsA, itemsB, kwA, kwB }) {
  const hasA = itemsA && itemsA.length > 0;
  const hasB = itemsB && itemsB.length > 0;

  // Both empty → single merged card
  if (!hasA && !hasB) {
    return (
      <div className="p-3 rounded-lg bg-card border border-border">
        <div className="flex items-center gap-2 mb-2">
          <Icon size={12} className="text-primary" />
          <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</h4>
        </div>
        <p className="text-[10px] text-muted-foreground italic">No {label.toLowerCase()} found for either keyword</p>
      </div>
    );
  }

  // Only one side has data → show it full-width
  if (hasA && !hasB) {
    return (
      <DimSection icon={Icon} title={`${label} (${kwA})`} items={itemsA} />
    );
  }
  if (!hasA && hasB) {
    return (
      <DimSection icon={Icon} title={`${label} (${kwB})`} items={itemsB} />
    );
  }

  // Both have data → 2-column layout
  return (
    <div className="grid grid-cols-2 gap-2">
      <DimSection icon={Icon} title={`${label} (${kwA})`} items={itemsA} />
      <DimSection icon={Icon} title={`${label} (${kwB})`} items={itemsB} />
    </div>
  );
}

export default function GapAnalysisPanel() {
  const { stage, selectedPair, gapAnalysis, gapAnalysisLoading, loadGapAnalysis, backToSuggestions } =
    useGapExplorerStore();

  useEffect(() => {
    if (stage === 'focused' && selectedPair && !gapAnalysis && !gapAnalysisLoading) {
      loadGapAnalysis(selectedPair.keywordA, selectedPair.keywordB);
    }
  }, [stage, selectedPair, gapAnalysis, gapAnalysisLoading, loadGapAnalysis]);

  if (stage !== 'focused' || !selectedPair) return null;

  if (gapAnalysisLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center bg-background border-l border-border p-5 gap-3 shrink-0">
        <Loader2 size={24} className="animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Analyzing gap dimensions...</p>
      </div>
    );
  }

  const a = gapAnalysis || {};

  return (
    <div className="w-full flex flex-col bg-background border-l border-border p-5 gap-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Gap Analysis</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={backToSuggestions}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors bg-card/60 border-primary/10 text-muted-foreground hover:text-foreground hover:border-primary/20"
        >
          <ArrowLeft size={12} />
          Back
        </motion.button>
      </div>
      <p className="text-xs text-muted-foreground">
        {selectedPair.keywordA} ↔ {selectedPair.keywordB}
      </p>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatBadge label={selectedPair.keywordA} count={a.kwACount} color="blue" />
        <StatBadge label="Overlap" count={a.overlapCount} color="cream" />
        <StatBadge label={selectedPair.keywordB} count={a.kwBCount} color="red" />
      </div>

      {/* Dimensions */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
        {/* Datasets */}
        <DimPair
          icon={Database} label="Datasets"
          itemsA={a.kwADatasets} itemsB={a.kwBDatasets}
          kwA={selectedPair.keywordA} kwB={selectedPair.keywordB}
        />

        {/* Metrics */}
        <DimPair
          icon={Gauge} label="Metrics"
          itemsA={a.kwAMetrics} itemsB={a.kwBMetrics}
          kwA={selectedPair.keywordA} kwB={selectedPair.keywordB}
        />

        {/* Methods */}
        <DimPair
          icon={Wrench} label="Methods"
          itemsA={a.kwAMethods} itemsB={a.kwBMethods}
          kwA={selectedPair.keywordA} kwB={selectedPair.keywordB}
        />

        {/* AI Insight placeholder */}
        <div className="p-3 rounded-lg bg-accent-teal/5 border border-accent-teal/10">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb size={12} className="text-accent-teal" />
            <h4 className="text-[11px] font-semibold text-accent-teal uppercase tracking-wide">
              Research Opportunity
            </h4>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {a.overlapCount > 0
              ? `${a.overlapCount} papers connect these keywords. Look for datasets and methods that are used on one side but not the other — these represent concrete research gaps.`
              : 'No overlapping papers found. This intersection is completely unexplored — a significant greenfield opportunity.'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function StatBadge({ label, count, color }) {
  const colors = {
    blue: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20',
    cream: 'bg-primary/10 text-primary border-primary/20',
  };

  return (
    <div className={`p-2 rounded-lg border text-center ${colors[color] || colors.cream}`}>
      <div className="text-lg font-bold">{count ?? '—'}</div>
      <div className="text-[9px] truncate mt-0.5">{label}</div>
    </div>
  );
}
