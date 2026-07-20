import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Network, Plus, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import axiosClient from '../../lib/apiClient.js';

const AI_KEYWORDS = [
  'deep learning', 'neural network', 'transformer', 'computer vision',
  'natural language processing', 'reinforcement learning',
  'generative adversarial network', 'federated learning',
  'large language model', 'transfer learning', 'attention mechanism',
  'representation learning', 'self-supervised learning', 'graph neural network',
  'diffusion model', 'edge computing', 'internet of things', 'smart home',
  'wearable computing', 'health monitoring',
];

export default function GapCrawlSection() {
  const [keywords, setKeywords] = useState(['']);
  const [taskId, setTaskId] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Poll progress
  useEffect(() => {
    if (!taskId || progress?.status === 'DONE' || progress?.status === 'FAILED') return;
    const interval = setInterval(async () => {
      try {
        const { data } = await axiosClient.get(`/api/v1/gap/crawl/progress/${taskId}`);
        setProgress(data.data);
      } catch (e) { /* ignore */ }
    }, 2000);
    return () => clearInterval(interval);
  }, [taskId, progress?.status]);

  const addKeyword = () => setKeywords([...keywords, '']);
  const removeKeyword = (i) => {
    if (keywords.length <= 1) return;
    setKeywords(keywords.filter((_, idx) => idx !== i));
  };
  const updateKeyword = (i, val) => {
    const next = [...keywords];
    next[i] = val;
    setKeywords(next);
  };

  const startCrawl = async () => {
    const filtered = keywords.map((k) => k.trim()).filter(Boolean);
    if (filtered.length === 0) return;
    setLoading(true);
    setError(null);
    setProgress(null);
    try {
      const { data } = await axiosClient.post('/api/v1/gap/crawl', { keywords: filtered });
      setTaskId(data.data.taskId);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
      setLoading(false);
    }
  };

  const statusColor = {
    STARTED: 'text-blue-400', FETCHING: 'text-blue-400', FILTERING: 'text-yellow-400',
    SAVING: 'text-yellow-400', MIGRATING: 'text-purple-400', DONE: 'text-emerald-400',
    FAILED: 'text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#101010] border border-[#DEDBC8]/5 rounded-xl p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <Network size={16} className="text-[#00D1B2]" />
        <h3 className="text-sm font-bold text-[#E1E0CC]">Research Gap Crawl</h3>
        <span className="text-[10px] text-gray-500 ml-auto">
          Crawls papers with quality filtering + AI enrichment for the Graph Explorer
        </span>
      </div>

      {/* Keyword inputs */}
      <div className="space-y-2">
        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
          Keywords to crawl (OpenAlex → quality filter ≥ 40 → AI enrich → Neo4j)
        </label>
        {keywords.map((kw, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={kw}
              onChange={(e) => updateKeyword(i, e.target.value)}
              placeholder={`Keyword ${i + 1}...`}
              disabled={loading}
              list="ai-keywords-list"
              className="flex-1 px-3 py-2 rounded-lg text-xs outline-none border transition-colors disabled:opacity-50 bg-transparent border-[#DEDBC8]/10 text-[#E2E8F0] focus:border-[#DEDBC8]/30"
            />
            {keywords.length > 1 && (
              <button onClick={() => removeKeyword(i)} disabled={loading}
                className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400">
                <X size={12} />
              </button>
            )}
          </div>
        ))}
        <datalist id="ai-keywords-list">
          {AI_KEYWORDS.map((k) => <option key={k} value={k} />)}
        </datalist>
        <button onClick={addKeyword} disabled={loading}
          className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-[#DEDBC8] transition-colors">
          <Plus size={10} /> Add keyword
        </button>
      </div>

      {/* Start button */}
      <button
        onClick={startCrawl}
        disabled={loading || keywords.every((k) => !k.trim())}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-black transition-opacity disabled:opacity-40 bg-[#DEDBC8] hover:opacity-90"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Network size={14} />}
        Start Gap Crawl
      </button>

      {/* Progress */}
      {progress && (
        <div className="p-3 rounded-lg bg-[#0A0A0A] border border-[#DEDBC8]/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${statusColor[progress.status] || 'text-gray-400'}`}>
              {progress.status}
            </span>
            {progress.status === 'DONE' && <CheckCircle2 size={14} className="text-emerald-400" />}
            {progress.status === 'FAILED' && <AlertCircle size={14} className="text-red-400" />}
          </div>
          {progress.currentKeyword && (
            <p className="text-[10px] text-gray-500">Keyword: {progress.currentKeyword}</p>
          )}
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <span className="text-gray-500">Total: <b className="text-[#E1E0CC]">{progress.totalPapers || 0}</b></span>
            <span className="text-gray-500">Quality: <b className="text-[#E1E0CC]">{progress.qualityPapers || 0}</b></span>
            <span className="text-gray-500">Enriched: <b className="text-[#00D1B2]">{progress.enrichedPapers || 0}</b></span>
          </div>
          {progress.error && <p className="text-[10px] text-red-400">{progress.error}</p>}
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </motion.div>
  );
}
