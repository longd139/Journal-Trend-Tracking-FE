import { motion } from 'motion/react';
import { Database, Gauge } from 'lucide-react';
import useGapExplorerStore from '../../store/useGapExplorerStore';

/**
 * Venn-style overlap visualization for Stage 3.
 * Shows the paper overlap between two keywords as two circles
 * with the intersection highlighted.
 */
export default function GapVennDiagram() {
  const { selectedPair, gapAnalysis, gapAnalysisLoading, loadGapAnalysis, stage } =
    useGapExplorerStore();

  if (stage !== 'focused' || !selectedPair) return null;

  const a = gapAnalysis || {};
  const kwACount = a.kwACount || 0;
  const kwBCount = a.kwBCount || 0;
  const overlapCount = a.overlapCount || 0;
  const total = kwACount + kwBCount - overlapCount;
  const max = Math.max(kwACount, kwBCount, 1);
  const gapScore = selectedPair.gapScore != null ? Math.round(selectedPair.gapScore) : null;

  // Circle size proportional to paper count, with min constraint
  const scaleA = 0.4 + (kwACount / max) * 0.5;
  const scaleB = 0.4 + (kwBCount / max) * 0.5;

  // Overlap ratio
  const overlapPct = total > 0 ? Math.round((overlapCount / total) * 100) : 0;
  const overlapWidth = Math.max(8, Math.min(60, overlapPct * 0.6));

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 bg-background">
      {/* Venn diagram */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-[300px] h-[220px] flex-shrink-0"
      >
        {/* Circle A */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 0.75, x: 0 }}
          transition={{ delay: 0.1 }}
          className="absolute rounded-full flex items-center justify-center border-2"
          style={{
            width: `${180 * scaleA}px`,
            height: `${180 * scaleA}px`,
            left: `${50 - (overlapWidth / 2)}px`,
            top: '50%',
            transform: `translate(-50%, -50%)`,
            background: 'rgba(59,130,246,0.12)',
            borderColor: 'rgba(59,130,246,0.35)',
          }}
        >
          <div
            className="flex flex-col items-center"
            style={{ marginLeft: `${overlapWidth / 2}px` }}
          >
            <span className="text-2xl font-bold text-blue-400">{kwACount.toLocaleString()}</span>
            <span className="text-[9px] text-blue-300/90 font-medium uppercase tracking-wider text-center max-w-[90px] leading-tight">
              {selectedPair.keywordA}
            </span>
          </div>
        </motion.div>

        {/* Circle B */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 0.75, x: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute rounded-full flex items-center justify-center border-2"
          style={{
            width: `${180 * scaleB}px`,
            height: `${180 * scaleB}px`,
            right: `${50 - (overlapWidth / 2)}px`,
            top: '50%',
            transform: `translate(50%, -50%)`,
            background: 'rgba(239,68,68,0.12)',
            borderColor: 'rgba(239,68,68,0.35)',
          }}
        >
          <div
            className="flex flex-col items-center"
            style={{ marginRight: `${overlapWidth / 2}px` }}
          >
            <span className="text-2xl font-bold text-red-400">{kwBCount.toLocaleString()}</span>
            <span className="text-[9px] text-red-300/90 font-medium uppercase tracking-wider text-center max-w-[90px] leading-tight">
              {selectedPair.keywordB}
            </span>
          </div>
        </motion.div>

        {/* Overlap label */}
        {overlapCount > 0 && (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
          >
            <span className="text-lg font-bold text-amber-400">{overlapCount.toLocaleString()}</span>
            <span className="text-[8px] text-amber-300/80 uppercase tracking-wider">overlap</span>
          </div>
        )}
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 gap-3 w-full max-w-sm"
      >
        <StatItem
          icon={Database}
          label="Total papers"
          value={total.toLocaleString()}
          color="var(--chart-1)"
        />
        <StatItem
          icon={Gauge}
          label="Overlap"
          value={`${overlapPct}%`}
          color="#F59E0B"
        />
        {gapScore != null && (
          <StatItem
            label="Gap Score"
            value={gapScore}
            color={gapScore > 60 ? '#34D399' : gapScore > 30 ? '#F59E0B' : '#EF4444'}
          />
        )}
      </motion.div>

      {/* Research insight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm p-4 rounded-xl bg-accent-teal/5 border border-accent-teal/10"
      >
        <p className="text-xs text-muted-foreground leading-relaxed text-center">
          {overlapPct <= 20
            ? `"${selectedPair.keywordA}" and "${selectedPair.keywordB}" have very little overlap (${overlapPct}%) — a strong interdisciplinary research opportunity.`
            : overlapPct <= 50
            ? `"${selectedPair.keywordA}" and "${selectedPair.keywordB}" share ${overlapPct}% overlap — there may be untapped cross-pollination opportunities.`
            : `"${selectedPair.keywordA}" and "${selectedPair.keywordB}" overlap significantly (${overlapPct}%) — the gap may lie in sub-niches or emerging subproblems.`}
        </p>
      </motion.div>
    </div>
  );
}

function StatItem({ icon: Icon, label, value, color }) {
  return (
    <div
      className="flex flex-col items-center gap-1 p-3 rounded-xl border"
      style={{ background: `${color}08`, borderColor: `${color}15` }}
    >
      {Icon && <Icon size={14} style={{ color }} />}
      <span className="text-lg font-bold text-foreground">{value}</span>
      <span className="text-[9px] text-muted-foreground uppercase tracking-wider text-center">{label}</span>
    </div>
  );
}
