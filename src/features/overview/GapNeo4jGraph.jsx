import { useEffect, useRef, useCallback, useState } from 'react';
import { Loader2, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Graph from 'graphology';
import Sigma from 'sigma';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import EdgeCurveProgram from '@sigma/edge-curve';
import { NodeBorderProgram } from '@sigma/node-border';
import useGapExplorerStore from '../../store/useGapExplorerStore';

// ═══════════════════════════════════════════════════
// Node group colors
// ═══════════════════════════════════════════════════
const EDGE_LIGHT = 'rgba(0,0,0,0.12)';
const EDGE_DARK = 'rgba(160,152,120,0.15)';
const GROUP_COLORS = {
  YEAR: '#A09878',
  FIELD: '#4F8CFF',
  TOPIC: '#00D1B2',
  KEYWORD: '#A09878',
  PAPER_A: '#4F8CFF',
  PAPER_B: '#FF6B6B',
  PAPER_SHARED: '#DEDBC8',
  DATASET: '#FF6B6B',
  METRIC: '#FFD93D',
  METHOD: '#6BCB77',
  AUTHOR: '#4F8CFF',
};

const DEFAULT_COLOR = '#DEDBC8';

function getGroupColor(group) {
  const lookup = group.startsWith('PAPER_') ? group : group;
  return GROUP_COLORS[lookup] || DEFAULT_COLOR;
}

// ═══════════════════════════════════════════════════
// Node legend
// ═══════════════════════════════════════════════════
const NODE_LEGEND = [
  { group: 'YEAR', label: 'Year', description: 'Publication year' },
  { group: 'FIELD', label: 'Research Field', description: 'CS, AI, etc.' },
  { group: 'TOPIC', label: 'Topic', description: 'Deep Learning, NLP, CV...' },
  { group: 'KEYWORD', label: 'Keyword', description: 'Key concepts from papers' },
  { group: 'PAPER', label: 'Paper', description: 'Research paper' },
  { group: 'DATASET', label: 'Dataset', description: 'Dataset used in experiments' },
  { group: 'METRIC', label: 'Metric', description: 'Evaluation metric' },
  { group: 'METHOD', label: 'Method', description: 'Algorithm or technique' },
  { group: 'AUTHOR', label: 'Author', description: 'Paper author' },
];

// ═══════════════════════════════════════════════════
// Transform backend data → graphology Graph
// ═══════════════════════════════════════════════════
function buildGraphology(data) {
  const graph = new Graph({ multi: false, type: 'undirected' });
  const { nodes = [], links = [] } = data;

  // Filter out YEAR nodes — they act as super-hubs and cause clustering
  const filteredNodes = nodes.filter((n) => n.group !== 'YEAR');
  const yearIds = new Set(nodes.filter((n) => n.group === 'YEAR').map((n) => n.id));

  const maxSize = Math.max(...filteredNodes.map((n) => n.size || 1), 1);

  for (const node of filteredNodes) {
    const size = node.size || 1;
    const scaledSize = 4 + (size / maxSize) * 16;
    const color = getGroupColor(node.group);

    graph.addNode(node.id, {
      label: truncate(node.label, 35),
      fullLabel: node.label,
      group: node.group,
      size: scaledSize,
      color,
      originalColor: color,
    });
  }

  for (const link of links) {
    // Skip edges that connect to filtered-out YEAR nodes
    if (yearIds.has(link.source) || yearIds.has(link.target)) continue;
    if (graph.hasNode(link.source) && graph.hasNode(link.target)) {
      graph.addEdge(link.source, link.target, {
        color: 'rgba(160,152,120,0.2)',
        size: 0.5,
      });
    }
  }

  // Assign initial random positions then run force layout
  graph.forEachNode((node) => {
    graph.setNodeAttribute(node, 'x', (Math.random() - 0.5) * 500);
    graph.setNodeAttribute(node, 'y', (Math.random() - 0.5) * 500);
  });
  forceAtlas2.assign(graph, {
    iterations: 150,
    settings: {
      gravity: 0.05,
      scalingRatio: 50,
      strongGravityMode: false,
      barnesHutOptimize: true,
    },
  });

  return graph;
}

function truncate(text, max) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

// ═══════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════
export default function GapNeo4jGraph() {
  const containerRef = useRef(null);
  const sigmaRef = useRef(null);
  const graphRef = useRef(null);
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

  // ── Destroy & rebuild ──
  const destroySigma = useCallback(() => {
    if (sigmaRef.current) {
      sigmaRef.current.kill();
      sigmaRef.current = null;
    }
    graphRef.current = null;
  }, []);

  const buildGraph = useCallback(
    (graphData) => {
      destroySigma();
      if (!containerRef.current || !graphData) return;

      const graph = buildGraphology(graphData);
      graphRef.current = graph;

      const isDark = document.documentElement.classList.contains('dark');

      sigmaRef.current = new Sigma(graph, containerRef.current, {
        allowInvalidContainer: true,
        stagePadding: 50,
        renderLabels: true,
        renderEdgeLabels: false,
        labelRenderedSizeThreshold: 8,
        labelDensity: 0.1,
        labelFont: '"Be Vietnam Pro", Inter, sans-serif',
        labelColor: { color: isDark ? '#E2E8F0' : '#0F172A' },
        labelSize: 12,
        defaultEdgeColor: isDark ? EDGE_DARK : EDGE_LIGHT,
        defaultEdgeType: 'curved',
        itemSizesReference: 'screen',
        inertiaDuration: 300,
        edgeProgramClasses: { curved: EdgeCurveProgram },
        nodeHoverProgramClasses: { circle: NodeBorderProgram },
        nodeReducer: (nodeId, data) => ({
          ...data,
          type: 'circle',
          size: data.size,
          color: data.color,
          label: data.label,
        }),
        edgeReducer: (edgeId, data) => ({
          ...data,
          type: 'curved',
          color: isDark ? EDGE_DARK : EDGE_LIGHT,
          size: 0.5,
        }),
      });

      // ── Hover → show label + NodeBorderProgram handles ring ──
      sigmaRef.current.on('enterNode', ({ node }) => {
        graph.setNodeAttribute(node, 'forceLabel', true);
      });
      sigmaRef.current.on('leaveNode', ({ node }) => {
        graph.setNodeAttribute(node, 'forceLabel', false);
      });

      // ── Click → highlight neighbors ──
      sigmaRef.current.on('clickNode', ({ node }) => {
        setHighlightedNode(node);
        const neighbors = graph.neighbors(node);
        const neighborSet = new Set(neighbors);
        neighborSet.add(node);

        graph.forEachNode((id, attrs) => {
          if (!neighborSet.has(id)) {
            graph.setNodeAttribute(id, 'color', isDark ? 'rgba(148,163,184,0.08)' : 'rgba(0,0,0,0.05)');
          }
        });
      });

      // Click empty → reset
      sigmaRef.current.on('clickStage', () => {
        clearHighlight();
        graph.forEachNode((id, attrs) => {
          graph.setNodeAttribute(id, 'color', attrs.originalColor);
          graph.setNodeAttribute(id, 'forceLabel', false);
        });
      });

      // Double-click → zoom to node
      sigmaRef.current.on('doubleClickNode', ({ node }) => {
        const pos = sigmaRef.current.getNodeDisplayData(node);
        if (pos) {
          sigmaRef.current.getCamera().animate(
            { x: pos.x, y: pos.y, ratio: 0.25 },
            { duration: 400 }
          );
        }
      });

      // Fit camera
      sigmaRef.current.getCamera().animatedReset({ duration: 600 });
    },
    [destroySigma, setHighlightedNode, clearHighlight]
  );

  // ── Stage 1: Hierarchy ──
  useEffect(() => {
    if (stage === 'overview' && hierarchyGraph) {
      buildGraph(hierarchyGraph);
    }
  }, [stage, hierarchyGraph, buildGraph]);

  // ── Stage 3: Focused ──
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
    return () => destroySigma();
  }, [destroySigma]);

  // Watch theme changes → update edge & label colors
  useEffect(() => {
    const html = document.documentElement;
    const observer = new MutationObserver(() => {
      if (!sigmaRef.current || !graphRef.current) return;
      const isDark = html.classList.contains('dark');
      const ec = isDark ? EDGE_DARK : EDGE_LIGHT;
      const lc = isDark ? '#E2E8F0' : '#0F172A';

      graphRef.current.forEachEdge((edge) => graphRef.current.setEdgeAttribute(edge, 'color', ec));
      sigmaRef.current.setSetting('labelColor', { color: lc });
      sigmaRef.current.setSetting('defaultEdgeColor', ec);
      sigmaRef.current.refresh();
    });
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const isLoading = hierarchyLoading || focusedGraphLoading;
  const hasData = graphRef.current !== null;

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
      {!isLoading && !hasData && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <p className="text-sm text-muted-foreground">Describe your research idea to begin</p>
        </div>
      )}

      {/* Sigma container */}
      <div ref={containerRef} className="size-full" />

      {/* Node Legend */}
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
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: getGroupColor(item.group) }}
                    />
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
