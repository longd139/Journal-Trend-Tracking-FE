import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Clock, Search, Network } from 'lucide-react';
import { Network as VisNetwork } from 'vis-network';
import { DataSet } from 'vis-data';
import { useGraphSearch } from '../hooks/useGraphSearch';
import { paperAPI } from '../lib/api/paper.api';
import RelatedTrends from './RelatedTrends';

/* ═══════════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════════ */

const ROOT_COLOR = '#F59E0B';
const ROOT_HIGHLIGHT = '#FBBF24';
const KEYWORD_COLOR = '#4F8CFF';
const KEYWORD_HIGHLIGHT = '#6BA0FF';

function truncate(text, max = 40) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Transform API data → vis-network format
   ═══════════════════════════════════════════════════════════════════════════ */

function transformGraphData(nodes, links) {
  const visNodes = (nodes || []).map((node) => {
    const isRoot = (node.group || '').toUpperCase() === 'ROOT';
    return {
      id: node.id,
      label: truncate(node.label, 40),
      group: isRoot ? 'root' : 'keyword',
      value: node.size || 1,
      title: `<b>${node.label}</b><br/>Type: ${node.group}`,
      color: {
        background: isRoot ? ROOT_COLOR : KEYWORD_COLOR,
        border: isRoot ? ROOT_COLOR : KEYWORD_COLOR,
        highlight: {
          background: isRoot ? ROOT_HIGHLIGHT : KEYWORD_HIGHLIGHT,
          border: isRoot ? ROOT_HIGHLIGHT : KEYWORD_HIGHLIGHT,
        },
      },
    };
  });

  const visEdges = (links || []).map((link) => ({
    from: link.source,
    to: link.target,
    dashes: true,
    color: { color: '#6B728060' },
    width: 0.8,
    title: link.label || 'RELATED_TO',
  }));

  return { nodes: new DataSet(visNodes), edges: new DataSet(visEdges) };
}

/* ═══════════════════════════════════════════════════════════════════════════
   vis-network options
   ═══════════════════════════════════════════════════════════════════════════ */

function getOptions() {
  return {
    nodes: {
      font: { color: '#E2E8F0', size: 13, face: '"Be Vietnam Pro", system-ui, sans-serif', strokeWidth: 0 },
      borderWidth: 2,
      shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', size: 6 },
      scaling: { min: 10, max: 60, label: { enabled: true, min: 11, max: 18 } },
    },
    edges: {
      width: 1,
      smooth: { type: 'continuous' },
      color: { color: 'rgba(255,255,255,0.10)' },
      arrows: { to: { enabled: false } },
    },
    groups: {
      root: {
        shape: 'star',
        color: { background: ROOT_COLOR, border: ROOT_COLOR, highlight: { background: ROOT_HIGHLIGHT, border: ROOT_HIGHLIGHT } },
        font: { size: 15, color: '#FFFFFF', face: '"Be Vietnam Pro", system-ui, sans-serif' },
      },
      keyword: {
        shape: 'dot',
        color: { background: KEYWORD_COLOR, border: KEYWORD_COLOR, highlight: { background: KEYWORD_HIGHLIGHT, border: KEYWORD_HIGHLIGHT } },
        font: { size: 12, color: '#FFFFFF', face: '"Be Vietnam Pro", system-ui, sans-serif' },
      },
    },
    physics: {
      solver: 'forceAtlas2Based',
      forceAtlas2Based: { gravitationalConstant: -50, centralGravity: 0.015, springLength: 150, springConstant: 0.06, damping: 0.4 },
      stabilization: { iterations: 200, updateInterval: 25 },
    },
    interaction: { hover: true, tooltipDelay: 150, zoomView: true, dragView: true, navigationButtons: false },
    layout: { improvedLayout: true },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Fallback wrapper with fade-in animation
   ═══════════════════════════════════════════════════════════════════════════ */

function FallbackTrends({ keyword, onKeywordClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <RelatedTrends keyword={keyword} onKeywordClick={onKeywordClick} />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function KeywordGraphExplorer({ keyword, depth = 1, onKeywordClick }) {
  const { status, progress, nodes, links, error, elapsed, search } = useGraphSearch();
  const [showFallback, setShowFallback] = useState(false);
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  // Reset + search on keyword change
  useEffect(() => {
    if (keyword?.trim()) {
      setShowFallback(false);
      search(keyword, depth);
    }
  }, [keyword, depth]); // eslint-disable-line react-hooks/exhaustive-deps

  // Compare graph nodes vs related-trends — pick the richer data source
  useEffect(() => {
    if (status !== 'completed' || !nodes.length || !keyword?.trim() || showFallback) return;
    let cancelled = false;
    async function compare() {
      try {
        const trends = await paperAPI.getRelatedTrends(keyword.trim());
        if (cancelled) return;
        if (Array.isArray(trends) && trends.length > nodes.length) {
          setShowFallback(true);
        }
      } catch { /* keep graph on error */ }
    }
    compare();
    return () => { cancelled = true; };
  }, [status, nodes.length, keyword]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build graph
  useEffect(() => {
    if (status !== 'completed' || !containerRef.current || !nodes.length || showFallback) return;
    if (networkRef.current) { networkRef.current.destroy(); networkRef.current = null; }
    const { nodes: dsNodes, edges: dsEdges } = transformGraphData(nodes, links);
    const network = new VisNetwork(containerRef.current, { nodes: dsNodes, edges: dsEdges }, getOptions());
    networkRef.current = network;
    network.once('stabilizationIterationsDone', () => {
      network.fit({ animation: { duration: 600, easingFunction: 'easeInOutQuad' } });
    });
    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeData = dsNodes.get(params.nodes[0]);
        if (nodeData?.label && onKeywordClick) onKeywordClick(nodeData.label);
      }
    });
  }, [status, nodes, links, showFallback]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup
  useEffect(() => () => {
    if (networkRef.current) { networkRef.current.destroy(); networkRef.current = null; }
  }, []);

  /* ─── User chose fallback ─── */
  if (showFallback) return <FallbackTrends keyword={keyword} onKeywordClick={onKeywordClick} />;

  /* ─── Idle ─── */
  if (status === 'idle') {
    return (
      <div className="rounded-2xl border border-[#DEDBC8]/5 bg-[#101010] p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="w-14 h-14 rounded-2xl bg-[#DEDBC8]/5 flex items-center justify-center mb-4">
          <Search size={24} className="text-gray-500" />
        </div>
        <p className="text-sm text-gray-500 max-w-xs">Enter a keyword to explore research connections</p>
      </div>
    );
  }

  /* ─── Processing ─── */
  if (status === 'processing') {
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

    return (
      <div className="rounded-2xl border border-[#DEDBC8]/5 bg-[#101010] p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="mb-5">
          <Loader2 size={32} className="text-[#4F8CFF]" />
        </motion.div>
        <p className="text-sm font-semibold text-[#E1E0CC] mb-2">Building Knowledge Graph</p>
        <p className="text-xs text-gray-400 max-w-xs mb-4">{progress || 'Expanding keyword connections...'}</p>
        <div className="w-48 h-1.5 bg-[#DEDBC8]/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#4F8CFF] to-[#F59E0B]"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: '60%' }}
          />
        </div>
        <p className="text-[10px] text-gray-500 mt-3 flex items-center gap-1">
          <Clock size={10} /> Elapsed: {timeStr}
        </p>
        {elapsed >= 30 && (
          <div className="mt-4 pt-4 border-t border-[#DEDBC8]/5 w-full max-w-xs">
            <p className="text-[11px] text-gray-400 mb-3">
              This is taking a while. Would you like to browse related keywords instead?
            </p>
            <button
              type="button"
              onClick={() => setShowFallback(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#DEDBC8]/10 text-[#DEDBC8] border border-[#DEDBC8]/20 hover:bg-[#DEDBC8]/20 transition-all"
            >
              View Related Keywords
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ─── Failed ─── */
  if (status === 'failed') {
    return (
      <div className="rounded-2xl border border-[#DEDBC8]/5 bg-[#101010] p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
          <AlertCircle size={24} className="text-amber-400" />
        </div>
        <p className="text-sm font-semibold text-[#E1E0CC] mb-2">Graph Search Failed</p>
        <p className="text-xs text-gray-400 max-w-xs mb-5">{error || 'An unexpected error occurred.'}</p>
        <button
          type="button" onClick={() => search(keyword, depth)}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#DEDBC8] hover:bg-[#E1E0CC] transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  /* ─── Timeout → fallback ─── */
  if (status === 'timeout') return <FallbackTrends keyword={keyword} onKeywordClick={onKeywordClick} />;

  /* ─── Completed — Render Graph ─── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-[#DEDBC8]/5 bg-[#101010] overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#DEDBC8]/5">
        <div className="flex items-center gap-2.5">
          <Network size={15} className="text-[#4F8CFF]" />
          <h3 className="text-sm font-bold text-[#E1E0CC]">Knowledge Graph</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="w-2 h-2 rounded-sm inline-block" style={{ background: ROOT_COLOR }} /> Root
          </span>
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: KEYWORD_COLOR }} /> Keywords
          </span>
          <span className="text-gray-500">{nodes.length} nodes</span>
        </div>
      </div>
      <div ref={containerRef} className="h-[420px] w-full" />
    </motion.div>
  );
}
