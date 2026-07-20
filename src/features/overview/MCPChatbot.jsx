import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Loader2, Sparkles, Zap, ArrowRight, RefreshCw, Clock, X } from 'lucide-react';
import useGapExplorerStore from '../../store/useGapExplorerStore';
import axiosClient from '../../lib/apiClient.js';
import KeywordMatchFeedback from './KeywordMatchFeedback';
import CrawlProgressCard from './CrawlProgressCard';

const MAX_HISTORY = 10;

export default function MCPChatbot() {
  const { t } = useTranslation('common');
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);

  // Load history from BE on mount
  useEffect(() => {
    axiosClient.get('/api/v1/gap/idea-history', { params: { limit: MAX_HISTORY } })
      .then(({ data }) => {
        if (data?.data) setHistory(data.data.map((h) => h.searchText));
      })
      .catch(() => {});
  }, []);

  const {
    stage,
    ideaText,
    suggestions,
    suggestionsLoading,
    suggestionsError,
    matchLevel,
    submitIdea,
    selectPair,
    selectedPair,
    backToSuggestions,
    isCrawling,
    crawlProgress,
    crawlTaskId,
    unmatchedTerms,
    cancelCrawl,
    reset,
  } = useGapExplorerStore();

  const addToHistory = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...filtered].slice(0, MAX_HISTORY);
    });
    axiosClient.post('/api/v1/gap/idea-history', { ideaText: trimmed }).catch(() => {});
  };

  const removeFromHistory = async (text) => {
    setHistory((prev) => prev.filter((item) => item !== text));
    axiosClient.delete('/api/v1/gap/idea-history', { data: { ideaText: text } }).catch(() => {});
  };

  const clearHistory = async () => {
    setHistory([]);
    axiosClient.delete('/api/v1/gap/idea-history', { data: {} }).catch(() => {});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    addToHistory(text);
    submitIdea(text);
  };

  const handleHistoryClick = (text) => {
    setInput(text);
    addToHistory(text);
    submitIdea(text);
  };

  const handleSelectPair = (pair) => {
    selectPair(pair);
  };

  // ── Stage 1: Idea input ──
  if (stage === 'overview') {
    return (
      <div className="w-full flex flex-col bg-[#0B1020] border-l border-[#DEDBC8]/5 p-5 gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#DEDBC8]" />
          <h3 className="text-sm font-bold text-[#E1E0CC]">Research Advisor</h3>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          Describe your research interest in natural language. The AI will explore available data and suggest keyword pairs with the most interesting research gaps.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Example: "I want to explore AI applications in wearable devices for healthcare monitoring"'
            rows={4}
            disabled={suggestionsLoading}
            className="w-full px-4 py-3 rounded-lg text-sm outline-none border transition-colors disabled:opacity-50 bg-transparent border-[#DEDBC8]/10 text-[#E2E8F0] focus:border-[#DEDBC8]/30 resize-none placeholder:text-gray-500"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={suggestionsLoading || !input.trim()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-black transition-opacity disabled:opacity-40 bg-[#DEDBC8]"
          >
            {suggestionsLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <Send size={14} />
                Explore Gaps
              </>
            )}
          </motion.button>
        </form>

        {suggestionsError && (
          <p className="text-xs text-red-400">Error: {suggestionsError}</p>
        )}

        {/* ── Idea History ── */}
        {history.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Clock size={10} />
                Recent Ideas
              </span>
              <button
                onClick={clearHistory}
                className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
              >
                Clear all
              </button>
            </div>
            {history.map((item, i) => (
              <div key={i} className="flex items-center gap-1 group">
                <button
                  onClick={() => handleHistoryClick(item)}
                  className="flex-1 text-left px-2.5 py-1.5 rounded-md text-xs text-gray-400 hover:text-[#E1E0CC] hover:bg-white/[0.04] transition-colors truncate"
                >
                  {item}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFromHistory(item); }}
                  className="p-0.5 rounded opacity-0 group-hover:opacity-100 text-gray-600 hover:text-gray-400 transition-all"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Stage 2: Suggestions (with match feedback for non-FULL levels) ──
  if (stage === 'filtered') {
    // Show crawl progress when crawling is in progress
    if (isCrawling && crawlTaskId) {
      return (
        <div className="w-full flex flex-col bg-[#0B1020] border-l border-[#DEDBC8]/5 p-5 gap-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#E1E0CC]">Live Crawl</h3>
            <button onClick={cancelCrawl} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400" title="Cancel">
              <RefreshCw size={14} />
            </button>
          </div>
          <CrawlProgressCard
            progress={crawlProgress}
            keywords={unmatchedTerms}
            onCancel={cancelCrawl}
          />
        </div>
      );
    }

    return (
      <div className="w-full flex flex-col bg-[#0B1020] border-l border-[#DEDBC8]/5 p-5 gap-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#00D1B2]" />
            <h3 className="text-sm font-bold text-[#E1E0CC]">
              {matchLevel === 'NONE' ? 'Knowledge Map' : matchLevel === 'FUZZY_ONLY' ? 'Keyword Match' : 'Suggested Pairs'}
            </h3>
          </div>
          <button onClick={reset} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400" title="Start over">
            <RefreshCw size={14} />
          </button>
        </div>

        {ideaText && (
          <p className="text-xs text-gray-400">
            Based on: <span className="text-[#DEDBC8] italic">"{ideaText.length > 80 ? ideaText.slice(0, 80) + '…' : ideaText}"</span>
          </p>
        )}

        {/* Multi-layer fallback feedback */}
        <KeywordMatchFeedback />

        {/* Normal suggestions (FULL or PARTIAL) */}
        {matchLevel !== 'NONE' && matchLevel !== 'FUZZY_ONLY' && suggestions.length > 0 && (
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {suggestions.map((suggestion, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectPair(suggestion)}
                  className="text-left p-4 rounded-xl border transition-colors bg-[#101010] border-[#DEDBC8]/5 hover:border-[#DEDBC8]/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#E1E0CC]">
                        {suggestion.keywordA}{' '}
                        <span className="text-[#00D1B2]">+</span>{' '}
                        {suggestion.keywordB}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{suggestion.reason}</p>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-[#00D1B2]/10 text-[#00D1B2]">
                      {suggestion.gapScore}/100
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500">
                    <Zap size={10} />
                    Gap score: {suggestion.gapScore >= 70 ? 'High opportunity' : suggestion.gapScore >= 50 ? 'Moderate' : 'Explore'}
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty suggestions — feedback already shown above */}
        {matchLevel !== 'NONE' && matchLevel !== 'FUZZY_ONLY' && suggestions.length === 0 && matchLevel === 'FULL' && (
          <p className="text-xs text-gray-500 text-center py-4">
            No keyword pairs found. Try a different idea.
          </p>
        )}
      </div>
    );
  }

  // ── Stage 3: Selected pair ──
  if (stage === 'focused' && selectedPair) {
    return (
      <div className="w-full flex flex-col bg-[#0B1020] border-l border-[#DEDBC8]/5 p-5 gap-3 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#E1E0CC]">
            {selectedPair.keywordA} <span className="text-[#00D1B2]">↔</span> {selectedPair.keywordB}
          </h3>
          <button onClick={reset} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400" title="Start over">
            <RefreshCw size={14} />
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Gap analysis is ready. View the graph and analysis panel for details.
        </p>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={backToSuggestions}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-[#DEDBC8] border border-[#DEDBC8]/20 hover:bg-[#DEDBC8]/5 transition-colors"
          >
            <ArrowRight size={12} className="rotate-180" />
            Back to Suggestions
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-black bg-[#DEDBC8] hover:opacity-90"
          >
            <ArrowRight size={12} />
            Explore Another Gap
          </motion.button>
        </div>
      </div>
    );
  }

  // ── Loading ──
  if (suggestionsLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center bg-[#0B1020] border-l border-[#DEDBC8]/5 p-5 gap-3 shrink-0">
        <Loader2 size={24} className="animate-spin text-[#DEDBC8]" />
        <p className="text-xs text-gray-400 text-center">
          Exploring available data...
          <br />
          AI is analyzing keywords, co-occurrences, and gap scores.
        </p>
      </div>
    );
  }

  return null;
}
