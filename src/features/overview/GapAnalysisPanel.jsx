import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2, Database, Gauge, Wrench, Users, Lightbulb } from 'lucide-react';
import useGapExplorerStore from '../../store/useGapExplorerStore';

function DimSection({ icon: Icon, title, items, emptyText }) {
  return (
    <div className="p-3 rounded-lg bg-[#101010] border border-[#DEDBC8]/5">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={12} className="text-[#DEDBC8]" />
        <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{title}</h4>
      </div>
      {items && items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {items.slice(0, 8).map((item, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#DEDBC8]/5 text-[#E1E0CC]"
              title={item.count ? `${item.count} papers` : ''}
            >
              {item.name}
              {item.count && <span className="ml-1 text-gray-500">({item.count})</span>}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-gray-600 italic">{emptyText || 'No data extracted yet'}</p>
      )}
    </div>
  );
}

export default function GapAnalysisPanel() {
  const { stage, selectedPair, gapAnalysis, gapAnalysisLoading, loadGapAnalysis } =
    useGapExplorerStore();

  useEffect(() => {
    if (stage === 'focused' && selectedPair && !gapAnalysis && !gapAnalysisLoading) {
      loadGapAnalysis(selectedPair.keywordA, selectedPair.keywordB);
    }
  }, [stage, selectedPair, gapAnalysis, gapAnalysisLoading, loadGapAnalysis]);

  if (stage !== 'focused' || !selectedPair) return null;

  if (gapAnalysisLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center bg-[#0B1020] border-l border-[#DEDBC8]/5 p-5 gap-3 shrink-0">
        <Loader2 size={24} className="animate-spin text-[#DEDBC8]" />
        <p className="text-xs text-gray-400">Analyzing gap dimensions...</p>
      </div>
    );
  }

  const a = gapAnalysis || {};

  return (
    <div className="w-full flex flex-col bg-[#0B1020] border-l border-[#DEDBC8]/5 p-5 gap-4 overflow-y-auto">
      {/* Header */}
      <div>
        <h3 className="text-sm font-bold text-[#E1E0CC]">📊 Gap Analysis</h3>
        <p className="text-xs text-gray-400 mt-1">
          {selectedPair.keywordA} ↔ {selectedPair.keywordB}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatBadge label={selectedPair.keywordA} count={a.kwACount} color="blue" />
        <StatBadge label="Overlap" count={a.overlapCount} color="cream" />
        <StatBadge label={selectedPair.keywordB} count={a.kwBCount} color="red" />
      </div>

      {/* Dimensions */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
        {/* Datasets */}
        <div className="grid grid-cols-2 gap-2">
          <DimSection
            icon={Database}
            title={`Datasets (${selectedPair.keywordA})`}
            items={a.kwADatasets}
            emptyText="No datasets found"
          />
          <DimSection
            icon={Database}
            title={`Datasets (${selectedPair.keywordB})`}
            items={a.kwBDatasets}
            emptyText="No datasets found"
          />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <DimSection
            icon={Gauge}
            title={`Metrics (${selectedPair.keywordA})`}
            items={a.kwAMetrics}
            emptyText="No metrics found"
          />
          <DimSection
            icon={Gauge}
            title={`Metrics (${selectedPair.keywordB})`}
            items={a.kwBMetrics}
            emptyText="No metrics found"
          />
        </div>

        {/* Methods */}
        <div className="grid grid-cols-2 gap-2">
          <DimSection
            icon={Wrench}
            title={`Methods (${selectedPair.keywordA})`}
            items={a.kwAMethods}
            emptyText="No methods found"
          />
          <DimSection
            icon={Wrench}
            title={`Methods (${selectedPair.keywordB})`}
            items={a.kwBMethods}
            emptyText="No methods found"
          />
        </div>

        {/* Authors */}
        <DimSection
          icon={Users}
          title="Top Authors"
          items={a.topAuthors?.map((au) => ({ name: au.name, count: au.paperCount }))}
          emptyText="No author data"
        />

        {/* AI Insight placeholder */}
        <div className="p-3 rounded-lg bg-[#00D1B2]/5 border border-[#00D1B2]/10">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb size={12} className="text-[#00D1B2]" />
            <h4 className="text-[11px] font-semibold text-[#00D1B2] uppercase tracking-wide">
              Research Opportunity
            </h4>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed">
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
    blue: 'bg-[#4F8CFF]/10 text-[#4F8CFF] border-[#4F8CFF]/20',
    red: 'bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/20',
    cream: 'bg-[#DEDBC8]/10 text-[#DEDBC8] border-[#DEDBC8]/20',
  };

  return (
    <div className={`p-2 rounded-lg border text-center ${colors[color] || colors.cream}`}>
      <div className="text-lg font-bold">{count ?? '—'}</div>
      <div className="text-[9px] truncate mt-0.5">{label}</div>
    </div>
  );
}
