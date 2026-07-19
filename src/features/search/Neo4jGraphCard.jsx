import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, Loader2, AlertCircle, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { graphAPI } from './graph.api';

// ─── Tier color palette ────────────────────────────────────────────────────────
const PAPER_COLORS = ['#DEDBC8', '#3B6FD4', '#2A5299', '#1E3E73'];
const KEYWORD_COLORS = ['#A09878', '#00A890', '#007F6E', '#005A4E'];
const PAPER_HIGHLIGHT = ['#6BA0FF', '#5789E0', '#4670C0', '#365A9E'];
const KEYWORD_HIGHLIGHT = ['#33DDC5', '#26BFA6', '#1A9E88', '#0D7D6A'];

function tierColor(group, tier) {
 const palette = group === 'keyword' ? KEYWORD_COLORS : PAPER_COLORS;
 return palette[tier] ?? palette[palette.length - 1];
}

function tierHighlight(group, tier) {
 const palette = group === 'keyword' ? KEYWORD_HIGHLIGHT : PAPER_HIGHLIGHT;
 return palette[tier] ?? palette[palette.length - 1];
}

function tierLabel(group, t) {
 return group === 'keyword' ? t('legend.keyword') : t('legend.paper');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function truncate(text, max) {
 if (!text) return '';
 return text.length > max ? text.slice(0, max) + '…' : text;
}

function normalizeGroup(rawGroup) {
 // Chuẩn hóa group về 'paper' hoặc 'keyword', bỏ qua các group như 'suggested'
 const g = (rawGroup || '').toLowerCase();
 return g === 'keyword' ? 'keyword' : 'paper';
}

/**
 * Transform graph data from POST /api/graphs/keyword/search
 * Response: { nodes: [{id, label, group, size}], links: [{source, target}] }
 */
function transformGraphData(graphData, t) {
 const { nodes = [], links = [] } = graphData;

 const visNodes = nodes.map((node) => {
 const size = node.size || 1;
 const normalizedGroup = normalizeGroup(node.group);
 return {
  id: node.id,
  label: truncate(node.label, 45),
  group: normalizedGroup,
  value: Math.max(size, 1),
  title: `<b>${node.label}</b><br/>Group: ${normalizedGroup}`,
  color: {
  background: normalizedGroup === 'keyword' ? '#A09878' : '#DEDBC8',
  border: normalizedGroup === 'keyword' ? '#A09878' : '#DEDBC8',
  highlight: {
   background: normalizedGroup === 'keyword' ? '#33DDC5' : '#6BA0FF',
   border: normalizedGroup === 'keyword' ? '#33DDC5' : '#6BA0FF',
  },
  },
 };
 });

 const visEdges = links.map((link) => ({
 from: link.source,
 to: link.target,
 color: { color: '#A0987860' },
 width: 0.6,
 }));

 return {
 nodes: new DataSet(visNodes),
 edges: new DataSet(visEdges),
 tierGroups: ['paper', 'keyword'],
 };
}

// ─── Vis-network config ──────────────────────────────────────────────────────
const getGraphOptions = (isDark) => {
 const groups = {
  paper: {
   shape: 'dot',
   color: { background: '#DEDBC8', border: '#DEDBC8', highlight: { background: '#6BA0FF', border: '#6BA0FF' } },
   font: { size: 13, color: '#FFFFFF' },
  },
  keyword: {
   shape: 'diamond',
   color: { background: '#A09878', border: '#A09878', highlight: { background: '#33DDC5', border: '#33DDC5' } },
   font: { size: 10, color: '#FFFFFF' },
  },
 };

 return {
 nodes: {
 font: {
  color: isDark ? '#E2E8F0' : '#1F2937',
  size: 12,
  face: '"Be Vietnam Pro", system-ui, -apple-system, "Inter", "Noto Sans", sans-serif',
  strokeWidth: 0,
 },
 borderWidth: 2,
 shadow: {
  enabled: true,
  color: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)',
  size: 6,
 },
 scaling: {
  min: 8,
  max: 50,
  label: { enabled: true, min: 10, max: 18 },
 },
 },
 edges: {
 width: 1,
 smooth: { type: 'continuous' },
 color: { color: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)' },
 arrows: { to: { enabled: false } },
 font: { size: 0, color: 'transparent', strokeWidth: 0 }, // Ẩn nhãn trên cạnh
 },
 groups,
 physics: {
 solver: 'forceAtlas2Based',
 forceAtlas2Based: {
  gravitationalConstant: -40,
  centralGravity: 0.01,
  springLength: 130,
  springConstant: 0.08,
  damping: 0.4,
 },
 stabilization: { iterations: 200, updateInterval: 25 },
 },
 interaction: {
 hover: true,
 tooltipDelay: 150,
 zoomView: true,
 dragView: true,
 navigationButtons: false,
 },
 layout: { improvedLayout: true },
 };
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function Neo4jGraphCard({ keyword: externalKeyword }) {
 const { t } = useTranslation('graph');
 const [keyword, setKeyword] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [expanded, setExpanded] = useState(false);
 const [paperCount, setPaperCount] = useState(null); // số papers tìm thấy từ API 1
 const [depth, setDepth] = useState(1);

 const containerRef = useRef(null);
 const networkRef = useRef(null);
 const dataRef = useRef(null);

 // ── External keyword mode: auto-fetch from enhanced API ──────────────────
 useEffect(() => {
 const trimmed = externalKeyword?.trim();
 if (!trimmed) return;

 let cancelled = false;

 const fetchEnhanced = async () => {
  setLoading(true);
  setError('');
  setPaperCount(null);

  try {
  const graphData = await graphAPI.searchGraph(trimmed, 3);

  if (cancelled) return;

  if (!graphData?.nodes?.length) {
   setError(t('graphNotReady'));
   destroyNetwork();
   return;
  }

  buildGraph(graphData);
  } catch (err) {
  if (cancelled) return;
  console.error('Enhanced graph fetch error:', err);
  const msg = err?.response?.data?.message ?? err?.message ?? t('fetchError');
  setError(msg);
  destroyNetwork();
  } finally {
  if (!cancelled) setLoading(false);
  }
 };

 fetchEnhanced();
 return () => { cancelled = true; };
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [externalKeyword]);

 const destroyNetwork = useCallback(() => {
 if (networkRef.current) {
  networkRef.current.destroy();
  networkRef.current = null;
 }
 }, []);

 const buildGraph = useCallback((graphData) => {
 destroyNetwork();
 if (!containerRef.current) return;

 const { nodes, edges, tierGroups } = transformGraphData(graphData, t);
 dataRef.current = { nodes, edges, tierGroups };

 const isDark = document.documentElement.classList.contains('dark');
 const options = getGraphOptions(isDark);

 networkRef.current = new Network(containerRef.current, { nodes, edges }, options);

 networkRef.current.once('stabilizationIterationsDone', () => {
  networkRef.current?.fit({
  animation: { duration: 600, easingFunction: 'easeInOutQuad' },
  });
 });

 networkRef.current.on('doubleClick', (params) => {
  if (params.nodes.length > 0) {
  networkRef.current?.focus(params.nodes[0], {
   scale: 1.8,
   animation: { duration: 400, easingFunction: 'easeInOutQuad' },
  });
  }
 });
 }, [destroyNetwork, t]);

 // Cleanup on unmount
 useEffect(() => {
 return () => destroyNetwork();
 }, [destroyNetwork]);

 // Handle expand toggle → redraw
 useEffect(() => {
 if (networkRef.current && dataRef.current) {
  const timer = setTimeout(() => {
  networkRef.current?.fit({
   animation: { duration: 400, easingFunction: 'easeInOutQuad' },
  });
  }, 350);
  return () => clearTimeout(timer);
 }
 }, [expanded]);

 // ── Submit: single-step via searchGraph (trả về { nodes, links } trực tiếp) ──
 const handleSubmit = async (e) => {
 e.preventDefault();
 const trimmed = keyword.trim();
 if (!trimmed) return;

 setLoading(true);
 setError('');
 setPaperCount(null);

 try {
  // Gọi searchGraph → backend trả về { nodes: [...], links: [...] }
  const graphData = await graphAPI.searchGraph(trimmed, depth);

  // Đếm số paper nodes từ graph data (backend GraphNode không có field paperCount)
  const totalPapers = graphData?.nodes
  ? graphData.nodes.filter((node) => normalizeGroup(node.group) === 'paper').length
  : 0;
  setPaperCount(totalPapers);

  if (!graphData?.nodes?.length) {
  setError(t('noResults'));
  destroyNetwork();
  return;
  }

  buildGraph(graphData);
 } catch (err) {
  console.error('Graph fetch error:', err);
  const msg = err?.response?.data?.message ?? err?.message ?? t('fetchError');
  setError(msg);
  destroyNetwork();
 } finally {
  setLoading(false);
 }
 };

 const cardHeight = expanded ? 'h-[620px]' : 'h-[420px]';

 return (
 <div
  className={`rounded-xl border flex flex-col ${cardHeight} transition-all duration-300 bg-card border-border `}
 >
  {/* Header */}
  <div className="flex items-center justify-between px-5 pt-5 pb-2 shrink-0">
  <div>
   <h3 className="text-sm font-bold text-foreground">
   {t('title')}
   </h3>
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

  {/* Search bar — hidden when driven by parent */}
  {!externalKeyword && (
  <form onSubmit={handleSubmit} className="px-5 pb-3 shrink-0 flex gap-2">
  <div className="relative flex-1">
   <Search
   size={13}
   className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
   />
   <input
   type="text"
   placeholder={t('searchPlaceholder')}
   value={keyword}
   onChange={(e) => setKeyword(e.target.value)}
   disabled={loading}
   className="w-full pl-9 pr-3 py-2.5 rounded-lg text-xs outline-none border transition-colors disabled:opacity-50 bg-transparent border-primary/10 text-gray-900 dark:text-foreground focus:border-blue-500 dark:focus:border-primary"
   />
  </div>
  {/* Depth selector */}
  <div className="flex items-center gap-1">
   <label className="text-[10px] text-muted-foreground whitespace-nowrap">
   {t('depth')}
   </label>
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
   className="px-4 py-2.5 rounded-lg text-xs font-bold text-primary-foreground transition-opacity disabled:opacity-40 bg-primary "
  >
   {loading ? <Loader2 size={14} className="animate-spin" /> : t('explore')}
  </motion.button>
  </form>
  )}

  {/* Graph area */}
  <div className="flex-1 min-h-0 mx-5 mb-5 rounded-lg overflow-hidden relative bg-transparent border border-gray-200 border-border">
  {/* Loading overlay */}
  {loading && (
   <div className="absolute inset-0 z-20 flex items-center justify-center bg-muted/80 backdrop-blur-sm">
   <div className="flex flex-col items-center gap-3">
    <Loader2
    size={28}
    className="animate-spin text-primary dark:text-primary"
    />
    <span className="text-xs font-medium text-muted-foreground">
    {t('loading')}
    </span>
   </div>
   </div>
  )}

  {/* Error / empty state */}
  {!loading && error && (
   <div className="absolute inset-0 z-20 flex items-center justify-center bg-muted/90">
   <div className="flex flex-col items-center gap-3 px-6 text-center">
    <AlertCircle size={28} className="text-amber-500" />
    <span className="text-sm font-medium text-muted-foreground">
    {error}
    </span>
    <button
    onClick={handleSubmit}
    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors hover:opacity-90 bg-primary text-primary-foreground shadow-md"
    >
    <RefreshCw size={12} /> {t('retry')}
    </button>
   </div>
   </div>
  )}

  {/* Idle state (no data yet) */}
  {!loading && !error && !dataRef.current && (
   <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
   <p className="text-xs text-muted-foreground">
    {t('idleHint')}
   </p>
   </div>
  )}

  {/* vis-network container */}
  <div ref={containerRef} className="size-full" />
  </div>

  {/* Legend */}
  <div className="px-5 pb-4 shrink-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium">
  <span className="text-muted-foreground">{t('legend.title')}</span>
  <LegendItem color="#DEDBC8" label={t('legend.paper')} shape="●" />
  <LegendItem color="#A09878" label={t('legend.keyword')} shape="◆" />
  <span className="ml-auto text-muted-foreground">
   {t('tip')}
  </span>
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
