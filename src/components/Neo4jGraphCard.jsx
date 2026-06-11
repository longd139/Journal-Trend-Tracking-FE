import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, Loader2, AlertCircle, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { graphAPI } from '../lib/api/graph.api';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function truncate(text, max) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

function transformToGraph(papers) {
  const nodesMap = new Map();
  const edges = [];

  for (const paper of papers) {
    const paperId = `paper_${paper.paperId}`;
    if (!nodesMap.has(paperId)) {
      nodesMap.set(paperId, {
        id: paperId,
        label: truncate(paper.title, 45),
        group: 'paper',
        value: Math.max(paper.citationCount || 1, 1),
        title: `<b>${paper.title}</b><br/>Citations: ${paper.citationCount ?? '—'}<br/>Year: ${paper.pubYear ?? '—'}<br/>DOI: ${paper.doi || '—'}`,
      });
    }

    // Field node
    if (paper.fieldId && paper.fieldName) {
      const fId = `field_${paper.fieldId}`;
      if (!nodesMap.has(fId)) {
        nodesMap.set(fId, { id: fId, label: paper.fieldName, group: 'field', title: `Field: ${paper.fieldName}` });
      }
      edges.push({ from: paperId, to: fId, dashes: true, width: 0.8 });
    }

    // Journal node
    if (paper.journalId && paper.journalName) {
      const jId = `journal_${paper.journalId}`;
      if (!nodesMap.has(jId)) {
        nodesMap.set(jId, { id: jId, label: truncate(paper.journalName, 30), group: 'journal', title: `Journal: ${paper.journalName}` });
      }
      edges.push({ from: paperId, to: jId, width: 0.8 });
    }

    // Author nodes
    for (const author of paper.authors || []) {
      if (!author.fullName) continue;
      const aId = `author_${author.fullName}`;
      if (!nodesMap.has(aId)) {
        nodesMap.set(aId, {
          id: aId,
          label: author.fullName,
          group: 'author',
          value: Math.max(author.hindex || 1, 1),
          title: `<b>${author.fullName}</b><br/>Affiliation: ${author.affiliation || '—'}<br/>H-index: ${author.hindex ?? '—'}<br/>Citations: ${author.totalCitations ?? '—'}${author.isCorresponding ? '<br/>📧 Corresponding Author' : ''}`,
        });
      }
      edges.push({ from: paperId, to: aId, color: { color: '#8B5CF660' }, width: 1 });
    }

    // Keyword nodes
    for (const kw of paper.keywords || []) {
      if (!kw.keywordText) continue;
      const kwId = `keyword_${kw.keywordText.toLowerCase()}`;
      if (!nodesMap.has(kwId)) {
        nodesMap.set(kwId, {
          id: kwId,
          label: kw.keywordText,
          group: 'keyword',
          value: Math.max((kw.relevanceScore || 0.5) * 10, 1),
          title: `Keyword: <b>${kw.keywordText}</b><br/>Relevance: ${kw.relevanceScore?.toFixed(3) ?? '—'}`,
        });
      }
      edges.push({ from: paperId, to: kwId, color: { color: '#00D1B260' }, width: 0.6 });
    }
  }

  return { nodes: new DataSet([...nodesMap.values()]), edges: new DataSet(edges) };
}

// ─── Vis-network config động theo Theme ──────────────────────────────────────
const getGraphOptions = (isDark) => ({
  nodes: {
    font: { color: isDark ? '#E2E8F0' : '#1F2937', size: 12, face: '"Be Vietnam Pro", Inter, "Noto Sans", system-ui, sans-serif', strokeWidth: 0 },
    borderWidth: 2,
    shadow: { enabled: true, color: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)', size: 6 },
    scaling: { min: 8, max: 50, label: { enabled: true, min: 10, max: 18 } },
  },
  edges: {
    width: 1,
    smooth: { type: 'continuous' },
    color: { color: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)' },
    arrows: { to: { enabled: false } },
  },
  groups: {
    paper: {
      shape: 'dot',
      color: { background: '#4F8CFF', border: '#4F8CFF', highlight: { background: '#6BA0FF', border: '#6BA0FF' } },
      font: { size: 13, color: '#FFFFFF' },
    },
    author: {
      shape: 'triangle',
      color: { background: '#8B5CF6', border: '#8B5CF6', highlight: { background: '#A87DFF', border: '#A87DFF' } },
      font: { size: 11, color: '#FFFFFF' },
    },
    keyword: {
      shape: 'diamond',
      color: { background: '#00D1B2', border: '#00D1B2', highlight: { background: '#33DDC5', border: '#33DDC5' } },
      font: { size: 10, color: '#FFFFFF' },
    },
    journal: {
      shape: 'square',
      color: { background: '#F59E0B', border: '#F59E0B', highlight: { background: '#F7B32B', border: '#F7B32B' } },
      font: { size: 11, color: '#FFFFFF' },
    },
    field: {
      shape: 'square',
      color: { background: '#EF4444', border: '#EF4444', highlight: { background: '#F26363', border: '#F26363' } },
      font: { size: 11, color: '#FFFFFF' },
    },
  },
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
  interaction: { hover: true, tooltipDelay: 150, zoomView: true, dragView: true, navigationButtons: false },
  layout: { improvedLayout: true },
});

// ─── Component ───────────────────────────────────────────────────────────────
export default function Neo4jGraphCard() {
  const { t } = useTranslation('graph');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);

  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const dataRef = useRef(null); // track current graph data for resize

  const destroyNetwork = useCallback(() => {
    if (networkRef.current) {
      networkRef.current.destroy();
      networkRef.current = null;
    }
  }, []);

  const buildGraph = useCallback((papers) => {
    destroyNetwork();
    if (!containerRef.current) return;

    const { nodes, edges } = transformToGraph(papers);
    dataRef.current = { nodes, edges };

    // Kiểm tra xem web đang ở chế độ Dark hay Light để set màu đồ thị
    const isDark = document.documentElement.classList.contains('dark');
    const options = getGraphOptions(isDark);

    networkRef.current = new Network(containerRef.current, { nodes, edges }, options);

    // Fit to container after stabilization
    networkRef.current.once('stabilizationIterationsDone', () => {
      networkRef.current?.fit({ animation: { duration: 600, easingFunction: 'easeInOutQuad' } });
    });

    // Double-click to focus
    networkRef.current.on('doubleClick', (params) => {
      if (params.nodes.length > 0) {
        networkRef.current?.focus(params.nodes[0], {
          scale: 1.8,
          animation: { duration: 400, easingFunction: 'easeInOutQuad' },
        });
      }
    });
  }, [destroyNetwork]);

  // Cleanup on unmount
  useEffect(() => {
    return () => destroyNetwork();
  }, [destroyNetwork]);

  // Handle expand toggle → redraw after DOM resize
  useEffect(() => {
    if (networkRef.current && dataRef.current) {
      const timer = setTimeout(() => {
        networkRef.current?.fit({ animation: { duration: 400, easingFunction: 'easeInOutQuad' } });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [expanded]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');

    try {
      const data = await graphAPI.searchGraph(trimmed);
      const papers = data?.papers ?? [];

      if (papers.length === 0) {
        setError(t('noResults'));
        destroyNetwork();
        return;
      }

      buildGraph(papers);
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
    <div className={`rounded-xl border flex flex-col ${cardHeight} transition-all duration-300 bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t('title')}</h3>
          <p className="text-xs mt-0.5 text-gray-500 dark:text-[#A0AEC0]">
            {t('subtitle')}
          </p>
        </div>
        <button
          onClick={() => setExpanded((p) => !p)}
          className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-[#A0AEC0]"
          title={expanded ? t('collapse') : t('expand')}
        >
          {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="px-5 pb-3 shrink-0 flex gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#A0AEC0]" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            disabled={loading}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg text-xs outline-none border transition-colors disabled:opacity-50 bg-gray-50 dark:bg-[#131A2A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-[#E2E8F0] focus:border-blue-500 dark:focus:border-[#4F8CFF]"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading || !keyword.trim()}
          className="px-4 py-2.5 rounded-lg text-xs font-bold text-white transition-opacity disabled:opacity-40 bg-gradient-to-r from-blue-500 to-purple-600 shadow-md shadow-blue-500/20"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : t('explore')}
        </motion.button>
      </form>

      {/* Graph area */}
      <div className="flex-1 min-h-0 mx-5 mb-5 rounded-lg overflow-hidden relative bg-gray-50 dark:bg-[#0B1020] border border-gray-200 dark:border-transparent">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={28} className="animate-spin text-blue-500 dark:text-[#4F8CFF]" />
              <span className="text-xs font-medium text-gray-600 dark:text-[#A0AEC0]">
                {t('loading')}
              </span>
            </div>
          </div>
        )}

        {/* Error / empty state */}
        {!loading && error && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 dark:bg-[#0B1020]/90">
            <div className="flex flex-col items-center gap-3 px-6 text-center">
              <AlertCircle size={28} className="text-amber-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-[#A0AEC0]">
                {error}
              </span>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors hover:opacity-90 bg-gradient-to-r from-blue-500 to-purple-600 shadow-md"
              >
                <RefreshCw size={12} /> {t('retry')}
              </button>
            </div>
          </div>
        )}

        {/* Idle state (no data yet) */}
        {!loading && !error && !dataRef.current && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <p className="text-xs text-gray-500 dark:text-[#6B7280]">
              {t('idleHint')}
            </p>
          </div>
        )}

        {/* vis-network container */}
        <div ref={containerRef} className="size-full" />
      </div>

      {/* Legend */}
      <div className="px-5 pb-4 shrink-0 flex flex-wrap gap-3 text-[10px] font-medium">
        <LegendItem color="#4F8CFF" label={t('legend.paper')} shape="●" />
        <LegendItem color="#8B5CF6" label={t('legend.author')} shape="▲" />
        <LegendItem color="#00D1B2" label={t('legend.keyword')} shape="◆" />
        <LegendItem color="#F59E0B" label={t('legend.journal')} shape="■" />
        <LegendItem color="#EF4444" label={t('legend.field')} shape="■" />
        <span className="ml-auto text-gray-500 dark:text-[#6B7280]">
          {t('tip')}
        </span>
      </div>
    </div>
  );
}

function LegendItem({ color, label, shape }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-gray-600 dark:text-[#A0AEC0]">
      <span style={{ color, fontSize: 11 }}>{shape}</span>
      {label}
    </span>
  );
}