import { useEffect, useRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
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

// Node types to hide in focused (2-keyword comparison) mode
// In focused mode, show ONLY keywords — hide papers and technical metadata
const FOCUSED_HIDDEN_GROUPS = new Set([
  'YEAR', 'FIELD', 'TOPIC', 'DATASET', 'METRIC', 'METHOD', 'AUTHOR',
  'PAPER_A', 'PAPER_B', 'PAPER_SHARED',
]);

// Colors for keyword zones in focused mode
const ZONE_COLORS = {
  left: '#4F8CFF',    // keywords unique to A
  bridge: '#00D1B2',  // keywords bridging both
  right: '#FF6B6B',   // keywords unique to B
};

function getGroupColor(group) {
  const lookup = group.startsWith('PAPER_') ? group : group;
  return GROUP_COLORS[lookup] || DEFAULT_COLOR;
}

// ═══════════════════════════════════════════════════
// Transform backend data → graphology Graph
// ═══════════════════════════════════════════════════
function buildGraphology(data, isFocused) {
  const graph = new Graph({ multi: false, type: 'undirected' });
  const { nodes = [], links = [] } = data;

  // In focused mode, hide paper + technical metadata nodes
  const hiddenIds = new Set();
  if (isFocused) {
    nodes.filter((n) => FOCUSED_HIDDEN_GROUPS.has(n.group)).forEach((n) => hiddenIds.add(n.id));
  } else {
    nodes.filter((n) => n.group === 'YEAR').forEach((n) => hiddenIds.add(n.id));
  }

  const filteredNodes = nodes.filter((n) => !hiddenIds.has(n.id));

  // ── Focused mode: classify keywords by which paper groups they connect to ──
  const keywordZone = new Map(); // nodeId → 'left' | 'bridge' | 'right'
  if (isFocused) {
    // Build adjacency: paper → set of keywords
    const paperKeywords = new Map();
    for (const link of links) {
      if (hiddenIds.has(link.source) || hiddenIds.has(link.target)) continue;
      const srcGroup = nodes.find((n) => n.id === link.source)?.group;
      const tgtGroup = nodes.find((n) => n.id === link.target)?.group;
      // Track which paper groups each keyword connects to
      for (const [paperId, paperGroup] of [[link.source, srcGroup], [link.target, tgtGroup]]) {
        if (paperGroup?.startsWith('PAPER_')) {
          if (!paperKeywords.has(paperId)) paperKeywords.set(paperId, new Set());
        }
      }
      // If one end is PAPER_* and the other is KEYWORD, record the connection
      if (srcGroup?.startsWith('PAPER_') && tgtGroup === 'KEYWORD') {
        if (!paperKeywords.has(link.source)) paperKeywords.set(link.source, new Set());
        paperKeywords.get(link.source).add(link.target);
      }
      if (tgtGroup?.startsWith('PAPER_') && srcGroup === 'KEYWORD') {
        if (!paperKeywords.has(link.target)) paperKeywords.set(link.target, new Set());
        paperKeywords.get(link.target).add(link.source);
      }
    }

    // For each keyword, check which paper groups it connects to
    const kwConnections = new Map(); // keywordId → Set<'A'|'B'>
    for (const [paperId, kwSet] of paperKeywords) {
      const paperGroup = nodes.find((n) => n.id === paperId)?.group;
      const side = paperGroup === 'PAPER_A' ? 'A' : paperGroup === 'PAPER_B' ? 'B' : 'shared';
      const effective = side === 'shared' ? ['A', 'B'] : [side];
      for (const kwId of kwSet) {
        if (!kwConnections.has(kwId)) kwConnections.set(kwId, new Set());
        for (const s of effective) kwConnections.get(kwId).add(s);
      }
    }

    for (const [kwId, sides] of kwConnections) {
      if (sides.has('A') && sides.has('B')) keywordZone.set(kwId, 'bridge');
      else if (sides.has('A')) keywordZone.set(kwId, 'left');
      else if (sides.has('B')) keywordZone.set(kwId, 'right');
    }
  }

  const maxSize = Math.max(...filteredNodes.map((n) => n.size || 1), 1);

  for (const node of filteredNodes) {
    const size = node.size || 1;
    const scaledSize = isFocused ? 6 + (size / maxSize) * 20 : 4 + (size / maxSize) * 16;
    let color = getGroupColor(node.group);

    // In focused mode, color keywords by zone
    if (isFocused && node.group === 'KEYWORD') {
      const zone = keywordZone.get(node.id) || 'bridge';
      color = ZONE_COLORS[zone] || ZONE_COLORS.bridge;
    }

    graph.addNode(node.id, {
      label: isFocused ? node.label : truncate(node.label, 35),
      fullLabel: node.label,
      group: node.group,
      zone: keywordZone.get(node.id) || 'bridge',
      size: scaledSize,
      color,
      originalColor: color,
      paperCount: node.size || 0,
    });
  }

  // ── Edges: in focused mode, only show keyword-keyword edges (via shared papers) ──
  if (isFocused) {
    // Build keyword co-occurrence: which keywords appear on the same paper
    const cooccurPairs = new Set();
    for (const link of links) {
      if (hiddenIds.has(link.source) || hiddenIds.has(link.target)) continue;
      const srcGroup = nodes.find((n) => n.id === link.source)?.group;
      const tgtGroup = nodes.find((n) => n.id === link.target)?.group;
      if (!srcGroup?.startsWith('PAPER_') || tgtGroup !== 'KEYWORD') continue;
      // Collect all keywords on this paper
    }
    // Rebuild: for each paper, collect its keywords, then create edges between them
    const paperToKws = new Map();
    for (const link of links) {
      if (hiddenIds.has(link.source) || hiddenIds.has(link.target)) continue;
      const src = nodes.find((n) => n.id === link.source);
      const tgt = nodes.find((n) => n.id === link.target);
      if (src?.group?.startsWith('PAPER_') && tgt?.group === 'KEYWORD') {
        if (!paperToKws.has(link.source)) paperToKws.set(link.source, []);
        paperToKws.get(link.source).push(link.target);
      }
      if (tgt?.group?.startsWith('PAPER_') && src?.group === 'KEYWORD') {
        if (!paperToKws.has(link.target)) paperToKws.set(link.target, []);
        paperToKws.get(link.target).push(link.source);
      }
    }
    for (const [paperId, kwList] of paperToKws) {
      for (let i = 0; i < kwList.length; i++) {
        for (let j = i + 1; j < kwList.length; j++) {
          const a = kwList[i], b = kwList[j];
          if (graph.hasNode(a) && graph.hasNode(b)) {
            const key = a < b ? a + '||' + b : b + '||' + a;
            if (!cooccurPairs.has(key)) {
              cooccurPairs.add(key);
              graph.addEdge(a, b, {
                color: 'rgba(160,152,120,0.12)',
                size: 0.3,
              });
            }
          }
        }
      }
    }
  } else {
    // Overview mode: all edges as-is
    for (const link of links) {
      if (hiddenIds.has(link.source) || hiddenIds.has(link.target)) continue;
      if (graph.hasNode(link.source) && graph.hasNode(link.target)) {
        const srcGroup = graph.getNodeAttribute(link.source, 'group');
        const tgtGroup = graph.getNodeAttribute(link.target, 'group');
        const srcZone = getZone(srcGroup);
        const tgtZone = getZone(tgtGroup);
        const crossesZones = srcZone !== tgtZone && srcZone !== 'other' && tgtZone !== 'other'
          && srcZone !== 'middle' && tgtZone !== 'middle';

        graph.addEdge(link.source, link.target, {
          color: crossesZones ? 'rgba(160,152,120,0.08)' : 'rgba(160,152,120,0.2)',
          size: crossesZones ? 0.3 : 0.5,
        });
      }
    }
  }

  // Assign initial random positions then run force layout
  if (isFocused) {
    assignGapMapLayout(graph);
  } else {
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
  }

  return graph;
}

/**
 * Gap Map layout: 3 columns for focused (2-keyword) comparison.
 * Left: PAPER_A → blue. Center: PAPER_SHARED → cream. Right: PAPER_B → red.
 * Light repulsion to reduce overlaps, then snap nodes back to their zones.
 */
function assignGapMapLayout(graph) {
  // Zone boundaries
  const ZONE_LEFT_MAX = -150;
  const ZONE_BRIDGE_MIN = -140;
  const ZONE_BRIDGE_MAX = 140;
  const ZONE_RIGHT_MIN = 150;

  graph.forEachNode((node, attrs) => {
    const zone = attrs.zone || 'bridge';
    let x, y;
    y = (Math.random() - 0.5) * 500;

    if (zone === 'left') {
      x = -550 + (Math.random() - 0.5) * 300;
    } else if (zone === 'right') {
      x = 550 + (Math.random() - 0.5) * 300;
    } else {
      x = (Math.random() - 0.5) * 200;
    }

    graph.setNodeAttribute(node, 'x', x);
    graph.setNodeAttribute(node, 'y', y);
  });

  // Light repulsion to reduce overlaps
  forceAtlas2.assign(graph, {
    iterations: 30,
    settings: {
      gravity: 0,
      scalingRatio: 20,
      strongGravityMode: false,
      barnesHutOptimize: true,
    },
  });

  // Snap nodes back to their zones
  graph.forEachNode((node, attrs) => {
    const zone = attrs.zone || 'bridge';
    let x = graph.getNodeAttribute(node, 'x');

    if (zone === 'left') {
      x = Math.min(x, ZONE_LEFT_MAX);
    } else if (zone === 'right') {
      x = Math.max(x, ZONE_RIGHT_MIN);
    } else {
      x = Math.max(ZONE_BRIDGE_MIN, Math.min(x, ZONE_BRIDGE_MAX));
    }

    graph.setNodeAttribute(node, 'x', x);
  });
}

function truncate(text, max) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

/** Map node group to zone for edge styling. KEYWORD nodes are neutral. */
function getZone(group) {
  if (group === 'PAPER_A') return 'left';
  if (group === 'PAPER_B') return 'right';
  if (group === 'PAPER_SHARED') return 'middle';
  return 'other'; // KEYWORD, etc. — don't dim edges to these
}

/**
 * Resolve a group name to its i18n tooltip label.
 * Uses the same keys as the overview legend where applicable.
 */
function getGroupTooltipLabel(group, t) {
  const map = {
    FIELD: t('researchField'),
    TOPIC: t('topic'),
    KEYWORD: t('legend.keyword'),
    PAPER_A: t('legend.paper'),
    PAPER_B: t('legend.paper'),
    PAPER_SHARED: t('sharedPaper'),
    YEAR: 'Year',
    DATASET: 'Dataset',
    METRIC: 'Metric',
    METHOD: 'Method',
    AUTHOR: 'Author',
  };
  return map[group] || group || 'Node';
}

// ═══════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════
export default function GapNeo4jGraph() {
  const { t } = useTranslation('graph');
  const containerRef = useRef(null);
  const sigmaRef = useRef(null);
  const graphRef = useRef(null);

  // Tooltip state
  const [tooltip, setTooltip] = useState(null);
  const tooltipRef = useRef(null);

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

  const isFocused = stage === 'focused';

  // ── Overview legend items (i18n-aware)
  const overviewLegend = [
    { group: 'FIELD', label: t('researchField') },
    { group: 'TOPIC', label: t('topic') },
    { group: 'KEYWORD', label: t('legend.keyword') },
    { group: 'PAPER', label: t('legend.paper'), color: DEFAULT_COLOR },
  ];

  // ── Focused legend items (i18n-aware)
  const focusedLegend = [
    { group: 'left', label: t('conceptsUniqueTo', { kw: selectedPair?.keywordA || 'A' }), color: ZONE_COLORS.left },
    { group: 'bridge', label: t('bridgeConcepts'), color: ZONE_COLORS.bridge },
    { group: 'right', label: t('conceptsUniqueTo', { kw: selectedPair?.keywordB || 'B' }), color: ZONE_COLORS.right },
  ];

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
    setTooltip(null);
  }, []);

  const buildGraph = useCallback(
    (graphData) => {
      destroySigma();
      if (!containerRef.current || !graphData) return;

      const graph = buildGraphology(graphData, isFocused);
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

      // ── Hover → show tooltip + label ──
      sigmaRef.current.on('enterNode', ({ node, event }) => {
        const attrs = graph.getNodeAttributes(node);
        graph.setNodeAttribute(node, 'forceLabel', true);

        // Get mouse position relative to container
        const rect = containerRef.current.getBoundingClientRect();
        const x = event.x - rect.left;
        const y = event.y - rect.top;

        const groupLabel = getGroupTooltipLabel(attrs.group, t);
        const paperInfo = attrs.paperCount > 0 ? ` · ${attrs.paperCount} papers` : '';

        setTooltip({
          label: attrs.fullLabel || attrs.label || node,
          type: groupLabel + paperInfo,
          x,
          y,
        });
      });

      sigmaRef.current.on('leaveNode', ({ node }) => {
        graph.setNodeAttribute(node, 'forceLabel', false);
        setTooltip(null);
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

      // Track mouse for tooltip positioning
      sigmaRef.current.on('moveNode', () => setTooltip(null));

      // Fit camera
      sigmaRef.current.getCamera().animatedReset({ duration: 600 });
    },
    [destroySigma, setHighlightedNode, clearHighlight, isFocused, t]
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

  // Pick legend based on stage
  const legendItems = isFocused ? focusedLegend : overviewLegend;

  // ── Count keywords per zone for focused mode ──
  const zoneCounts = { left: 0, bridge: 0, right: 0 };
  if (isFocused && graphRef.current) {
    graphRef.current.forEachNode((node, attrs) => {
      const z = attrs.zone || 'bridge';
      if (z === 'left') zoneCounts.left++;
      else if (z === 'right') zoneCounts.right++;
      else zoneCounts.bridge++;
    });
  }

  // Gap score — use BE value from selectedPair
  const gapScore = selectedPair?.gapScore ?? 0;
  const gapColor = gapScore >= 70 ? '#00D1B2' : gapScore >= 50 ? '#FFD93D' : '#64748B';
  const gapLabel = gapScore >= 70 ? t('highOpportunity') : gapScore >= 50 ? t('moderate') : t('matureField');

  return (
    <div className="flex-1 min-h-0 rounded-xl overflow-hidden relative bg-background border border-border">
      {/* ── Title bar (top-left) ── */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none">
        <div className="px-3 py-1.5 rounded-lg bg-card/90 border border-primary/10 backdrop-blur-sm">
          <p className="text-[11px] font-semibold text-foreground">
            {isFocused && selectedPair
              ? `${selectedPair.keywordA}  ↔  ${selectedPair.keywordB}`
              : t('knowledgeLandscape')}
          </p>
          <p className="text-[9px] text-muted-foreground">
            {isFocused ? t('researchGapAnalysis') : t('csAiResearch')}
          </p>
        </div>
      </div>

      {/* ── Legend (top-right, always visible) ── */}
      <div className="absolute top-3 right-3 z-10">
        <div className="rounded-lg bg-card/90 border border-primary/10 backdrop-blur-sm p-2.5">
          <p className="text-[9px] text-muted-foreground mb-1.5 uppercase tracking-wider font-semibold">{t('gapLegend')}</p>
          <div className="flex flex-col gap-1">
            {legendItems.map((item) => (
              <div key={item.group} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color || getGroupColor(item.group) }}
                />
                <span className="text-[10px] text-foreground leading-none">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tooltip (follows mouse on node hover) ── */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 pointer-events-none px-3 py-2 rounded-lg bg-card/95 border border-primary/15 shadow-lg backdrop-blur-sm"
            style={{
              left: tooltip.x + 14,
              top: tooltip.y - 12,
              maxWidth: 260,
            }}
          >
            <p className="text-xs font-semibold text-foreground truncate">{tooltip.label}</p>
            <p className="text-[10px] text-muted-foreground">{tooltip.type}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Focused mode: 3-zone Gap Map overlays ── */}
      {isFocused && hasData && (
        <>
          {/* Zone background tint — 3 subtle colored bands */}
          <div
            className="absolute inset-0 z-[3] pointer-events-none"
            style={{
              background: `linear-gradient(to right,
                rgba(79,140,255,0.04) 0%,
                rgba(79,140,255,0.04) 31%,
                transparent 31%, transparent 35%,
                rgba(222,219,200,0.05) 35%,
                rgba(222,219,200,0.05) 65%,
                transparent 65%, transparent 69%,
                rgba(255,107,107,0.04) 69%,
                rgba(255,107,107,0.04) 100%
              )`,
            }}
          />

          {/* Dashed zone dividers */}
          <div className="absolute inset-0 z-[4] pointer-events-none">
            <div
              className="absolute top-0 bottom-0"
              style={{
                left: '33%',
                width: 0,
                borderLeft: '1.5px dashed rgba(160,152,120,0.25)',
              }}
            />
            <div
              className="absolute top-0 bottom-0"
              style={{
                left: '67%',
                width: 0,
                borderLeft: '1.5px dashed rgba(160,152,120,0.25)',
              }}
            />
          </div>

          {/* Top zone labels — concept badges */}
          <div className="absolute top-12 left-0 right-0 z-10 pointer-events-none">
            <div className="flex justify-between px-4">
              <div className="text-center" style={{ width: '31%' }}>
                <span
                  className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold"
                  style={{ background: ZONE_COLORS.left + '18', color: ZONE_COLORS.left }}
                >
                  {t('conceptsUniqueTo', { kw: selectedPair?.keywordA || 'A' })}
                </span>
              </div>
              <div className="text-center" style={{ width: '35%' }}>
                <span
                  className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold"
                  style={{ background: ZONE_COLORS.bridge + '20', color: ZONE_COLORS.bridge }}
                >
                  {t('bridgeConcepts')}
                </span>
              </div>
              <div className="text-center" style={{ width: '31%' }}>
                <span
                  className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold"
                  style={{ background: ZONE_COLORS.right + '18', color: ZONE_COLORS.right }}
                >
                  {t('conceptsUniqueTo', { kw: selectedPair?.keywordB || 'B' })}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom zone stats */}
          <div className="absolute bottom-3 left-0 right-0 z-10 pointer-events-none">
            <div className="flex justify-between px-4">
              <div className="text-center" style={{ width: '31%' }}>
                <p className="text-[11px] font-bold text-foreground font-mono tabular-nums">{zoneCounts.left}</p>
                <p className="text-[9px] text-muted-foreground">{t('concepts')}</p>
              </div>
              <div className="text-center" style={{ width: '35%' }}>
                <p className="text-[11px] font-bold text-foreground font-mono tabular-nums">{zoneCounts.bridge}</p>
                <p className="text-[9px] text-muted-foreground">{t('bridging')}</p>
              </div>
              <div className="text-center" style={{ width: '31%' }}>
                <p className="text-[11px] font-bold text-foreground font-mono tabular-nums">{zoneCounts.right}</p>
                <p className="text-[9px] text-muted-foreground">{t('concepts')}</p>
              </div>
            </div>
          </div>

          {/* Gap Score indicator — center pill */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <div className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl bg-card/95 border shadow-lg backdrop-blur-sm"
              style={{ borderColor: gapColor + '50' }}>
              <p className="text-2xl font-black font-mono tabular-nums" style={{ color: gapColor }}>{gapScore}</p>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{t('gapScore')}</p>
              <p className="text-[10px] font-medium" style={{ color: gapColor }}>{gapLabel}</p>
            </div>
          </div>
        </>
      )}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="animate-spin text-foreground" />
            <span className="text-xs text-muted-foreground">
              {stage === 'overview' ? t('loadingKnowledgeGraph') : t('loadingGapAnalysis')}
            </span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !hasData && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <p className="text-sm text-muted-foreground">{t('describeToBegin')}</p>
        </div>
      )}

      {/* Sigma container */}
      <div ref={containerRef} className="size-full" />
    </div>
  );
}
