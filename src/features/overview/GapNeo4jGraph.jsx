import { useEffect, useRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { Loader2, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import useGapExplorerStore from '../../store/useGapExplorerStore';

// ═══════════════════════════════════════════════════
// Node group styling — 6 groups with distinct shapes & colors
// ═══════════════════════════════════════════════════
const GROUP_STYLE = {
  YEAR: { shape: 'square', color: { background: '#A09878', border: '#8A8468' } },
  FIELD: { shape: 'hexagon', color: { background: '#4F8CFF', border: '#3B6FD4' } },
  TOPIC: { shape: 'triangle', color: { background: '#00D1B2', border: '#00A890' } },
  KEYWORD: { shape: 'diamond', color: { background: '#A09878', border: '#8A8468' } },
  PAPER_A: { shape: 'dot', color: { background: '#4F8CFF', border: '#3B6FD4' } },
  PAPER_B: { shape: 'dot', color: { background: '#FF6B6B', border: '#E05555' } },
  PAPER_SHARED: { shape: 'dot', color: { background: '#DEDBC8', border: '#C5BFA0' } },
  DATASET: { shape: 'square', color: { background: '#FF6B6B', border: '#E05555' } },
  METRIC: { shape: 'triangle', color: { background: '#FFD93D', border: '#E0C030' } },
  METHOD: { shape: 'diamond', color: { background: '#6BCB77', border: '#4DA85A' } },
  AUTHOR: { shape: 'star', color: { background: '#4F8CFF', border: '#3B6FD4' } },
};

// ═══════════════════════════════════════════════════
// Node legend — what each shape means
// ═══════════════════════════════════════════════════
const NODE_LEGEND = [
  { group: 'YEAR', shape: '■', label: 'Year', description: 'Publication year (2024, 2025, 2026)' },
  { group: 'FIELD', shape: '⬡', label: 'Research Field', description: 'CS, AI, etc.' },
  { group: 'TOPIC', shape: '▲', label: 'Topic', description: 'Deep Learning, NLP, Computer Vision...' },
  { group: 'KEYWORD', shape: '◆', label: 'Keyword', description: 'Key concepts extracted from papers' },
  { group: 'PAPER', shape: '●', label: 'Paper', description: 'Research paper (color = side/source)' },
  { group: 'DATASET', shape: '□', label: 'Dataset', description: 'Dataset used in experiments' },
  { group: 'METRIC', shape: '△', label: 'Metric', description: 'Evaluation metric (Accuracy, F1...)' },
  { group: 'METHOD', shape: '◇', label: 'Method', description: 'Algorithm or technique used' },
  { group: 'AUTHOR', shape: '★', label: 'Author', description: 'Paper author' },
];

function getGroupStyle(group) {
  // Strip PAPER_ prefix to handle PAPER_A, PAPER_B, PAPER_SHARED
  const lookup = group.startsWith('PAPER_') ? group : group;
  return (
    GROUP_STYLE[lookup] || {
      shape: 'dot',
      color: { background: '#DEDBC8', border: '#C5BFA0' },
    }
  );
}

// ═══════════════════════════════════════════════════
// Transform backend GraphResponse → vis-network DataSet
// ═══════════════════════════════════════════════════
function transformGraphData(graphData) {
  const { nodes = [], links = [] } = graphData;

  const visNodes = nodes.map((node) => {
    const style = getGroupStyle(node.group);
    return {
      id: node.id,
      label: truncate(node.label, 40),
      group: node.group,
      value: Math.max(node.size || 1, 1),
      title: `<b>${node.label}</b><br/>${node.group}`,
      shape: style.shape,
      color: {
        background: style.color.background,
        border: style.color.border,
        highlight: {
          background: style.color.background,
          border: '#FFFFFF',
        },
      },
    };
  });

  const visEdges = links.map((link) => ({
    from: link.source,
    to: link.target,
    color: { color: 'rgba(160,152,120,0.25)' },
    width: 0.5,
    smooth: { type: 'continuous' },
    arrows: { to: { enabled: false } },
  }));

  return {
    nodes: new DataSet(visNodes),
    edges: new DataSet(visEdges),
  };
}

function truncate(text, max) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

// ═══════════════════════════════════════════════════
// vis-network options
// ═══════════════════════════════════════════════════
function getGraphOptions(nodeCount) {
  return {
    nodes: {
      font: { color: '#E2E8F0', size: 11, face: '"Be Vietnam Pro", Inter, sans-serif', strokeWidth: 0 },
      borderWidth: 2,
      shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', size: 4 },
      scaling: { min: 8, max: 50, label: { enabled: true, min: 10, max: 16 } },
    },
    edges: {
      width: 1,
      smooth: { type: 'continuous' },
      color: { color: 'rgba(255,255,255,0.10)' },
      arrows: { to: { enabled: false } },
    },
    physics: {
      solver: 'forceAtlas2Based',
      forceAtlas2Based: {
        gravitationalConstant: -40,
        centralGravity: 0.01,
        springLength: nodeCount > 100 ? 100 : 150,
        springConstant: 0.08,
        damping: 0.4,
      },
      stabilization: { iterations: 80, updateInterval: 25 },
    },
    interaction: { hover: true, tooltipDelay: 100, zoomView: true, dragView: true },
  };
}

// ═══════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════
export default function GapNeo4jGraph() {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const dataRef = useRef(null);
  const [legendOpen, setLegendOpen] = useState(false);

  const {
    stage,
    hierarchyGraph,
    hierarchyLoading,
    focusedGraph,
    focusedGraphLoading,
    loadHierarchyGraph,
    loadFocusedGraph,
    selectedPair,
    highlightedNode,
    setHighlightedNode,
    clearHighlight,
  } = useGapExplorerStore();

  // ── Load hierarchy on mount ──
  useEffect(() => {
    if (!hierarchyGraph && stage === 'overview') {
      loadHierarchyGraph();
    }
  }, []);

  // ── Build/rebuild graph when data changes ──
  const buildGraph = useCallback((graphData) => {
    if (networkRef.current) {
      networkRef.current.destroy();
      networkRef.current = null;
    }
    if (!containerRef.current || !graphData) return;

    const { nodes, edges } = transformGraphData(graphData);
    dataRef.current = { nodes, edges };

    const options = getGraphOptions(nodes.length);
    networkRef.current = new Network(containerRef.current, { nodes, edges }, options);

    // ── Click interaction ──
    networkRef.current.on('click', (params) => {
      if (params.nodes.length === 1) {
        const clickedNode = params.nodes[0];
        setHighlightedNode(clickedNode);
        const neighbors = networkRef.current.getConnectedNodes(clickedNode);
        const allNodes = nodes.getIds();
        allNodes.forEach((id) => {
          const isRelevant = id === clickedNode || neighbors.includes(id);
          nodes.update({ id, opacity: isRelevant ? 1.0 : 0.15 });
        });
      } else {
        clearHighlight();
        const allNodes = nodes.getIds();
        allNodes.forEach((id) => nodes.update({ id, opacity: 1.0 }));
      }
    });

    // Fit after stabilization
    networkRef.current.once('stabilizationIterationsDone', () => {
      networkRef.current?.fit({ animation: { duration: 600, easingFunction: 'easeInOutQuad' } });
    });
  }, [setHighlightedNode, clearHighlight]);

  // ── Stage 1: Hierarchy graph ──
  useEffect(() => {
    if (stage === 'overview' && hierarchyGraph) {
      buildGraph(hierarchyGraph);
    }
  }, [stage, hierarchyGraph, buildGraph]);

  // ── Stage 3: Focused graph ──
  useEffect(() => {
    if (stage === 'focused' && selectedPair && !focusedGraph) {
      loadFocusedGraph(selectedPair.keywordA, selectedPair.keywordB);
    }
    if (stage === 'focused' && focusedGraph) {
      buildGraph(focusedGraph);
    }
  }, [stage, selectedPair, focusedGraph, loadFocusedGraph, buildGraph]);

  // ── Cleanup ──
  useEffect(() => {
    return () => {
      if (networkRef.current) networkRef.current.destroy();
    };
  }, []);

  const isLoading = hierarchyLoading || focusedGraphLoading;

  return (
    <div className="flex-1 min-h-0 rounded-xl overflow-hidden relative bg-background border border-border">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="animate-spin text-foreground" />
            <span className="text-xs text-muted-foreground">
              {stage === 'overview' ? 'Loading knowledge graph...' : 'Loading gap analysis...'}
            </span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !hierarchyGraph && !focusedGraph && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <p className="text-sm text-muted-foreground">Describe your research idea in the chatbot to begin</p>
        </div>
      )}

      <div ref={containerRef} className="size-full" />

      {/* ── Node Legend (toggle) ── */}
      <div className="absolute bottom-3 left-3 z-10">
        <button
          onClick={() => setLegendOpen(!legendOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card/90 border border-primary/10 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Info size={12} />
          {legendOpen ? <ChevronDown size={10} /> : <ChevronUp size={10} />}
        </button>

        <AnimatePresence>
          {legendOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 8, height: 0 }}
              className="mt-1.5 rounded-lg bg-card/95 border border-primary/10 p-3 min-w-[220px] backdrop-blur-sm"
            >
              <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">Node Legend</p>
              <div className="flex flex-col gap-1">
                {NODE_LEGEND.map((item) => (
                  <div key={item.group} className="flex items-center gap-2 text-xs group">
                    <span className="text-sm w-5 text-center shrink-0 text-foreground">{item.shape}</span>
                    <span className="text-foreground font-medium w-24 shrink-0">{item.label}</span>
                    <span className="text-muted-foreground truncate hidden sm:inline">{item.description}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
