import { useState, useEffect, useRef, useCallback } from 'react';
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

// ─── Vis-network config ──────────────────────────────────────────────────────
const GRAPH_OPTIONS = {
  nodes: {
    font: { color: '#E2E8F0', size: 12, face: 'Inter, system-ui, sans-serif', strokeWidth: 0 },
    borderWidth: 2,
    shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', size: 6 },
    scaling: { min: 8, max: 50, label: { enabled: true, min: 10, max: 18 } },
  },
  edges: {
    width: 1,
    smooth: { type: 'continuous' },
    color: { color: 'rgba(255,255,255,0.12)' },
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
      font: { size: 11, color: '#D4C4FF' },
    },
    keyword: {
      shape: 'diamond',
      color: { background: '#00D1B2', border: '#00D1B2', highlight: { background: '#33DDC5', border: '#33DDC5' } },
      font: { size: 10, color: '#CCFBF1' },
    },
    journal: {
      shape: 'square',
      color: { background: '#F59E0B', border: '#F59E0B', highlight: { background: '#F7B32B', border: '#F7B32B' } },
      font: { size: 11, color: '#FEF3C7' },
    },
    field: {
      shape: 'square',
      color: { background: '#EF4444', border: '#EF4444', highlight: { background: '#F26363', border: '#F26363' } },
      font: { size: 11, color: '#FEE2E2' },
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
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function Neo4jGraphCard() {
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

    networkRef.current = new Network(containerRef.current, { nodes, edges }, GRAPH_OPTIONS);

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
        setError('No results found for this keyword.');
        destroyNetwork();
        return;
      }

      buildGraph(papers);
    } catch (err) {
      console.error('Graph fetch error:', err);
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to load graph data.';
      setError(msg);
      destroyNetwork();
    } finally {
      setLoading(false);
    }
  };

  const cardHeight = expanded ? 'h-[620px]' : 'h-[420px]';

  return (
    <div
      className={`rounded-xl border flex flex-col ${cardHeight} transition-all duration-300`}
      style={{ background: '#1B2235', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-white">Knowledge Graph Explorer</h3>
          <p className="text-xs mt-0.5" style={{ color: '#A0AEC0' }}>
            Visualize paper, author & keyword relationships
          </p>
        </div>
        <button
          onClick={() => setExpanded((p) => !p)}
          className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
          style={{ color: '#A0AEC0' }}
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="px-5 pb-3 shrink-0 flex gap-2">
        <div className="relative flex-1">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: '#A0AEC0' }}
          />
          <input
            type="text"
            placeholder="Enter keyword (e.g., machine learning, CRISPR)…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            disabled={loading}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg text-xs outline-none border transition-colors disabled:opacity-50"
            style={{
              background: '#131A2A',
              borderColor: 'rgba(255,255,255,0.08)',
              color: '#E2E8F0',
            }}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading || !keyword.trim()}
          className="px-4 py-2.5 rounded-lg text-xs font-bold text-white transition-opacity disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)' }}
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            'Explore'
          )}
        </motion.button>
      </form>

      {/* Graph area */}
      <div className="flex-1 min-h-0 mx-5 mb-5 rounded-lg overflow-hidden relative" style={{ background: '#0B1020' }}>
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0B1020]/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={28} className="animate-spin" style={{ color: '#4F8CFF' }} />
              <span className="text-xs font-medium" style={{ color: '#A0AEC0' }}>
                Building knowledge graph…
              </span>
            </div>
          </div>
        )}

        {/* Error / empty state */}
        {!loading && error && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0B1020]/90">
            <div className="flex flex-col items-center gap-3 px-6 text-center">
              <AlertCircle size={28} style={{ color: '#F59E0B' }} />
              <span className="text-sm font-medium" style={{ color: '#A0AEC0' }}>
                {error}
              </span>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)' }}
              >
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          </div>
        )}

        {/* Idle state (no data yet) */}
        {!loading && !error && !dataRef.current && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <p className="text-xs" style={{ color: '#6B7280' }}>
              Enter a keyword above to explore the knowledge graph
            </p>
          </div>
        )}

        {/* vis-network container */}
        <div ref={containerRef} className="size-full" />
      </div>

      {/* Legend */}
      <div className="px-5 pb-4 shrink-0 flex flex-wrap gap-3 text-[10px] font-medium">
        <LegendItem color="#4F8CFF" label="Paper" shape="●" />
        <LegendItem color="#8B5CF6" label="Author" shape="▲" />
        <LegendItem color="#00D1B2" label="Keyword" shape="◆" />
        <LegendItem color="#F59E0B" label="Journal" shape="■" />
        <LegendItem color="#EF4444" label="Field" shape="■" />
        <span className="ml-auto" style={{ color: '#6B7280' }}>
          Double-click node to focus · Scroll to zoom
        </span>
      </div>
    </div>
  );
}

function LegendItem({ color, label, shape }) {
  return (
    <span className="inline-flex items-center gap-1.5" style={{ color: '#A0AEC0' }}>
      <span style={{ color, fontSize: 11 }}>{shape}</span>
      {label}
    </span>
  );
}
