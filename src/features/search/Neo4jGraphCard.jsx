import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, Loader2, AlertCircle, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import Graph from 'graphology';
import Sigma from 'sigma';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import EdgeCurveProgram from '@sigma/edge-curve';
import { NodeBorderProgram } from '@sigma/node-border';
import { graphAPI } from './graph.api';

// ─── Color palette ────────────────────────────────────────────────────────────
const PAPER_COLOR = '#4F8CFF';
const KEYWORD_COLOR = '#00D1B2';
const PAPER_HIGHLIGHT = '#6BA0FF';
const KEYWORD_HIGHLIGHT = '#33DDC5';
const EDGE_COLOR_LIGHT = 'rgba(0,0,0,0.15)';
const EDGE_COLOR_DARK = 'rgba(255,255,255,0.12)';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function truncate(text, max) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

function normalizeGroup(rawGroup) {
  const g = (rawGroup || '').toLowerCase();
  return g === 'keyword' ? 'keyword' : 'paper';
}

/**
 * Transform graph data from API → graphology Graph
 * Response: { nodes: [{id, label, group, size}], links: [{source, target}] }
 */
function buildGraphology(data) {
  const graph = new Graph({ multi: false, type: 'undirected' });

  const { nodes = [], links = [] } = data;

  // Build a lookup for quick size info during edge creation
  const paperCount = nodes.filter((n) => normalizeGroup(n.group) === 'paper').length;
  const keywordCount = nodes.length - paperCount;

  const maxSize = Math.max(...nodes.map((n) => n.size || 1), 1);

  for (const node of nodes) {
    const group = normalizeGroup(node.group);
    const rawSize = node.size || 1;
    // Scale size between 4–20
    const scaledSize = 4 + (rawSize / maxSize) * 16;

    graph.addNode(node.id, {
      label: truncate(node.label, 40),
      fullLabel: node.label,
      group,
      size: scaledSize,
      color: group === 'keyword' ? KEYWORD_COLOR : PAPER_COLOR,
      originalColor: group === 'keyword' ? KEYWORD_COLOR : PAPER_COLOR,
      highlightColor: group === 'keyword' ? KEYWORD_HIGHLIGHT : PAPER_HIGHLIGHT,
    });
  }

  for (const link of links) {
    if (graph.hasNode(link.source) && graph.hasNode(link.target)) {
      graph.addEdge(link.source, link.target, {
        color: EDGE_COLOR_LIGHT,
        size: 0.5,
      });
    }
  }

  // Assign initial random positions then run force layout
  graph.forEachNode((node) => {
    graph.setNodeAttribute(node, 'x', (Math.random() - 0.5) * 100);
    graph.setNodeAttribute(node, 'y', (Math.random() - 0.5) * 100);
  });
  forceAtlas2.assign(graph, { iterations: 80, settings: { gravity: 1, scalingRatio: 10 } });

  return { graph, paperCount, keywordCount };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Neo4jGraphCard({ keyword: externalKeyword }) {
  const { t } = useTranslation('graph');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [paperCount, setPaperCount] = useState(null);
  const [depth, setDepth] = useState(1);

  const containerRef = useRef(null);
  const sigmaRef = useRef(null);
  const graphRef = useRef(null);
  const [nodeLabels, setNodeLabels] = useState([]);

  const updateLabels = useCallback(() => {
    if (!sigmaRef.current || !graphRef.current) return;
    const labels = [];
    graphRef.current.forEachNode((id, attrs) => {
      if (attrs.group === 'keyword' && attrs.label) {
        const pos = sigmaRef.current.getNodeDisplayData(id);
        if (pos) {
          const vp = sigmaRef.current.graphToViewport(pos);
          labels.push({ id, x: vp.x, y: vp.y, label: attrs.label });
        }
      }
    });
    console.log('[Neo4jGraph] keyword labels:', labels.length, labels.map(l => l.label));
    setNodeLabels(labels);
  }, []);

  const destroySigma = useCallback(() => {
    if (sigmaRef.current) {
      sigmaRef.current.kill();
      sigmaRef.current = null;
    }
  }, []);

  const renderGraph = useCallback((graphData) => {
    console.log('[Neo4jGraph] renderGraph called, data:', graphData?.nodes?.length, 'nodes');
    destroySigma();
    if (!containerRef.current) {
      console.log('[Neo4jGraph] no container ref');
      return;
    }

    const { graph, paperCount: pc } = buildGraphology(graphData);
    graphRef.current = graph;
    setPaperCount(pc);

    let kwCount = 0;
    graph.forEachNode((id, attrs) => { if (attrs.group === 'keyword') kwCount++; });
    console.log('[Neo4jGraph] total nodes:', graph.order, 'keywords:', kwCount, 'papers:', pc);


    const isDark = document.documentElement.classList.contains('dark');

    sigmaRef.current = new Sigma(graph, containerRef.current, {
      allowInvalidContainer: true,
      stagePadding: 40,
      renderLabels: false,
      renderEdgeLabels: false,
      defaultNodeColor: PAPER_COLOR,
      defaultEdgeColor: isDark ? EDGE_COLOR_DARK : EDGE_COLOR_LIGHT,
      defaultEdgeType: 'curved',
      edgeProgramClasses: { curved: EdgeCurveProgram },
      nodeHoverProgramClasses: { circle: NodeBorderProgram },
      nodeReducer: (nodeId, data) => ({
        ...data,
        type: 'circle',
        size: data.size,
        color: data.color,
      }),
      edgeReducer: (edgeId, data) => ({
        ...data,
        type: 'curved',
        color: isDark ? EDGE_COLOR_DARK : EDGE_COLOR_LIGHT,
        size: 0.8,
      }),
    });

    // Double-click → zoom to node
    sigmaRef.current.on('doubleClickNode', ({ node }) => {
      const positions = sigmaRef.current.getNodeDisplayData(node);
      if (positions) {
        sigmaRef.current.getCamera().animate(
          { x: positions.x, y: positions.y, ratio: 0.3 },
          { duration: 400 }
        );
      }
    });

    // Hover → dim non-neighbors (NodeBorderProgram handles visual highlight)
    sigmaRef.current.on('enterNode', ({ node }) => {
      const neighbors = graph.neighbors(node);
      const neighborSet = new Set(neighbors);
      neighborSet.add(node);
      graph.forEachNode((id, attrs) => {
        if (!neighborSet.has(id)) {
          graph.setNodeAttribute(id, 'color', isDark ? 'rgba(148,163,184,0.15)' : 'rgba(0,0,0,0.06)');
        }
      });
    });

    sigmaRef.current.on('leaveNode', () => {
      graph.forEachNode((id, attrs) => {
        graph.setNodeAttribute(id, 'color', attrs.originalColor);
      });
    });

    // Click empty → reset
    sigmaRef.current.on('clickStage', () => {
      sigmaRef.current.getCamera().animate(
        { x: 0, y: 0, ratio: 1 },
        { duration: 400 }
      );
      graph.forEachNode((id, attrs) => {
        graph.setNodeAttribute(id, 'color', attrs.originalColor);
      });
    });

    // Force labels on keyword nodes after sigma is fully initialized
    setTimeout(() => {
      if (!sigmaRef.current || !graphRef.current) return;
      sigmaRef.current.setSetting('renderLabels', true);
      sigmaRef.current.setSetting('labelRenderedSizeThreshold', 0);
      sigmaRef.current.setSetting('labelDensity', 1);
      graph.forEachNode((id, attrs) => {
        if (attrs.group === 'keyword') {
          graph.setNodeAttribute(id, 'forceLabel', true);
        }
      });
      sigmaRef.current.refresh();
    }, 800);

    // Fit camera + update HTML labels
    sigmaRef.current.getCamera().animatedReset({ duration: 600 });
    setTimeout(updateLabels, 700);

    // Update labels on camera move
    sigmaRef.current.on('afterRender', updateLabels);
  }, [destroySigma, updateLabels]);

  // ── External keyword mode ──────────────────────────────────────────────────
  useEffect(() => {
    const trimmed = externalKeyword?.trim();
    console.log('[Neo4jGraph] externalKeyword changed:', trimmed);
    if (!trimmed) return;

    let cancelled = false;

    const fetchEnhanced = async () => {
      setLoading(true);
      setError('');

      try {
        const graphData = await graphAPI.searchGraph(trimmed, 3);
        if (cancelled) return;

        if (!graphData?.nodes?.length) {
          console.log('[Neo4jGraph] no nodes in data, setting error');
          setError(t('graphNotReady'));
          destroySigma();
          return;
        }

        renderGraph(graphData);
      } catch (err) {
        if (cancelled) return;
        console.error('Enhanced graph fetch error:', err);
        const msg = err?.response?.data?.message ?? err?.message ?? t('fetchError');
        setError(msg);
        destroySigma();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEnhanced();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalKeyword]);

  // Cleanup on unmount
  useEffect(() => {
    return () => destroySigma();
  }, [destroySigma]);

  // Watch theme changes → update edge & label colors
  useEffect(() => {
    const html = document.documentElement;
    const observer = new MutationObserver(() => {
      if (!sigmaRef.current || !graphRef.current) return;
      const isDark = html.classList.contains('dark');
      const graph = graphRef.current;
      const ec = isDark ? EDGE_COLOR_DARK : EDGE_COLOR_LIGHT;
      const lc = isDark ? '#E2E8F0' : '#0F172A';

      // Update all edges
      graph.forEachEdge((edge) => graph.setEdgeAttribute(edge, 'color', ec));
      // Update all node labels
      sigmaRef.current.setSetting('labelColor', { color: lc });
      sigmaRef.current.setSetting('defaultEdgeColor', ec);
      sigmaRef.current.refresh();
    });
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Handle expand toggle → refit
  useEffect(() => {
    if (sigmaRef.current) {
      const timer = setTimeout(() => {
        sigmaRef.current?.getCamera().animatedReset({ duration: 400 });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [expanded]);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');

    try {
      const graphData = await graphAPI.searchGraph(trimmed, depth);

      const totalPapers = graphData?.nodes
        ? graphData.nodes.filter((node) => normalizeGroup(node.group) === 'paper').length
        : 0;
      setPaperCount(totalPapers);

      if (!graphData?.nodes?.length) {
        setError(t('noResults'));
        destroySigma();
        return;
      }

      renderGraph(graphData);
    } catch (err) {
      console.error('Graph fetch error:', err);
      const msg = err?.response?.data?.message ?? err?.message ?? t('fetchError');
      setError(msg);
      destroySigma();
    } finally {
      setLoading(false);
    }
  };

  const hasData = graphRef.current !== null;

  const cardHeight = expanded ? 'h-[620px]' : 'h-[420px]';

  return (
    <div
      className={`rounded-xl border flex flex-col ${cardHeight} transition-all duration-300 bg-card border-border`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-foreground">{t('title')}</h3>
          <p className="text-xs mt-0.5 text-muted-foreground">
            {paperCount !== null
              ? t('subtitleWithCount', { count: paperCount })
              : t('subtitle')}
          </p>
        </div>
        <button
          onClick={() => setExpanded((p) => !p)}
          className="p-1.5 rounded-lg transition-colors hover:bg-muted/40 text-muted-foreground"
          title={expanded ? t('collapse') : t('expand')}
        >
          {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
      </div>

      {/* Search bar */}
      {!externalKeyword && (
        <form onSubmit={handleSubmit} className="px-5 pb-3 shrink-0 flex gap-2">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              disabled={loading}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg text-xs outline-none border transition-colors disabled:opacity-50 bg-transparent border-primary/10 text-gray-900 dark:text-foreground focus:border-blue-500 dark:focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-1">
            <label className="text-[10px] text-muted-foreground whitespace-nowrap">{t('depth')}</label>
            <select
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              disabled={loading}
              className="w-12 py-2.5 rounded-lg text-xs outline-none border transition-colors disabled:opacity-50 bg-transparent border-primary/10 text-gray-900 dark:text-foreground focus:border-blue-500 dark:focus:border-primary cursor-pointer"
            >
              {[1, 2, 3].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading || !keyword.trim()}
            className="px-4 py-2.5 rounded-lg text-xs font-bold text-primary-foreground transition-opacity disabled:opacity-40 bg-primary"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : t('explore')}
          </motion.button>
        </form>
      )}

      {/* Graph area */}
      <div className="flex-1 min-h-0 mx-5 mb-5 rounded-lg relative bg-transparent border border-gray-200 border-border">
        {/* Sigma container */}
        <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: 300 }} />{/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-muted/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={28} className="animate-spin text-primary" />
              <span className="text-xs font-medium text-muted-foreground">{t('loading')}</span>
            </div>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-muted/90">
            <div className="flex flex-col items-center gap-3 px-6 text-center">
              <AlertCircle size={28} className="text-amber-500" />
              <span className="text-sm font-medium text-muted-foreground">{error}</span>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors hover:opacity-90 bg-primary text-primary-foreground shadow-md"
              >
                <RefreshCw size={12} /> {t('retry')}
              </button>
            </div>
          </div>
        )}

        {/* Idle state */}
        {!loading && !error && !hasData && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <p className="text-xs text-muted-foreground">{t('idleHint')}</p>
          </div>
        )}

        {/* Sigma container */}
        <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: 300 }} />
      </div>

      {/* Legend */}
      <div className="px-5 pb-4 shrink-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium">
        <span className="text-muted-foreground">{t('legend.title')}</span>
        <LegendItem color={PAPER_COLOR} label={t('legend.paper')} shape="●" />
        <LegendItem color={KEYWORD_COLOR} label={t('legend.keyword')} shape="◆" />
        <span className="ml-auto text-muted-foreground">{t('tip')}</span>
      </div>
    </div>
  );
}

function LegendItem({ color, label, shape }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span style={{ color, fontSize: 11 }}>{shape}</span>
      {label}
    </span>
  );
}
