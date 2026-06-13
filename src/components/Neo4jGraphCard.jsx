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

/**
 * Chuyển đổi dữ liệu từ API 2 (/api/graphs/keyword) sang định dạng vis-network.
 * API 2 trả về: { nodes: [{id, label, group: "PAPER"|"KEYWORD", size}], links: [{source, target, label}] }
 */
function transformGraphData(graphData) {
  const { nodes = [], links = [] } = graphData;

  const visNodes = nodes.map((node) => {
    const size = node.size || 1;
    return {
      id: node.id,
      label: truncate(node.label, 45),
      group: node.group?.toLowerCase() || 'paper',
      value: Math.max(size, 1),
      title: `<b>${node.label}</b><br/>Group: ${node.group}<br/>Weight: ${size}`,
    };
  });

  const visEdges = links.map((link) => ({
    from: link.source,
    to: link.target,
    label: link.label,
    color: { color: '#00D1B260' },
    width: 0.6,
  }));

  return {
    nodes: new DataSet(visNodes),
    edges: new DataSet(visEdges),
  };
}

// ─── Vis-network config ──────────────────────────────────────────────────────
const getGraphOptions = (isDark) => ({
  nodes: {
    font: {
      color: isDark ? '#E2E8F0' : '#1F2937',
      size: 12,
      face: '"Be Vietnam Pro", Inter, "Noto Sans", system-ui, sans-serif',
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
  },
  groups: {
    paper: {
      shape: 'dot',
      color: {
        background: '#4F8CFF',
        border: '#4F8CFF',
        highlight: { background: '#6BA0FF', border: '#6BA0FF' },
      },
      font: { size: 13, color: '#FFFFFF' },
    },
    keyword: {
      shape: 'diamond',
      color: {
        background: '#00D1B2',
        border: '#00D1B2',
        highlight: { background: '#33DDC5', border: '#33DDC5' },
      },
      font: { size: 10, color: '#FFFFFF' },
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
  interaction: {
    hover: true,
    tooltipDelay: 150,
    zoomView: true,
    dragView: true,
    navigationButtons: false,
  },
  layout: { improvedLayout: true },
});

// ─── Component ───────────────────────────────────────────────────────────────
export default function Neo4jGraphCard() {
  const { t } = useTranslation('graph');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [paperCount, setPaperCount] = useState(null); // số papers tìm thấy từ API 1

  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const dataRef = useRef(null);

  const destroyNetwork = useCallback(() => {
    if (networkRef.current) {
      networkRef.current.destroy();
      networkRef.current = null;
    }
  }, []);

  const buildGraph = useCallback((graphData) => {
    destroyNetwork();
    if (!containerRef.current) return;

    const { nodes, edges } = transformGraphData(graphData);
    dataRef.current = { nodes, edges };

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
  }, [destroyNetwork]);

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

  // ── Submit: 2-step flow ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');
    setPaperCount(null);

    try {
      // Bước 1: Gọi search API để trigger pipeline (Neo4j → OpenAlex → lưu SQL + Neo4j)
      const searchResult = await graphAPI.searchGraph(trimmed);
      const totalPapers = searchResult?.totalElements ?? 0;
      setPaperCount(totalPapers);

      if (totalPapers === 0) {
        setError(t('noResults'));
        destroyNetwork();
        return;
      }

      // Bước 2: Gọi graph API để lấy dữ liệu visualization từ Neo4j
      // Lúc này Neo4j đã có data (từ pipeline hoặc từ cache)
      const graphData = await graphAPI.getKeywordGraph(trimmed);

      if (!graphData?.nodes?.length) {
        // Neo4j chưa có data (AuraDB paused, v.v.) → fallback: hiển thị thông báo
        setError(t('graphNotReady'));
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
      className={`rounded-xl border flex flex-col ${cardHeight} transition-all duration-300 bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            {t('title')}
          </h3>
          <p className="text-xs mt-0.5 text-gray-500 dark:text-[#A0AEC0]">
            {paperCount !== null
              ? t('subtitleWithCount', { count: paperCount })
              : t('subtitle')}
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
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#A0AEC0]"
          />
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
              <Loader2
                size={28}
                className="animate-spin text-blue-500 dark:text-[#4F8CFF]"
              />
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
        <LegendItem color="#00D1B2" label={t('legend.keyword')} shape="◆" />
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
