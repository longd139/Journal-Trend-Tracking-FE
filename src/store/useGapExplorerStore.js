import { create } from 'zustand';
import axiosClient from '../lib/apiClient.js';

/**
 * Shared state for the Research Gap Explorer.
 * Synchronizes the Neo4j graph, MCP chatbot, and gap analysis panel.
 */
const useGapExplorerStore = create((set, get) => ({
  // ── Stage ──
  stage: 'overview', // overview | filtered | focused
  setStage: (stage) => set({ stage }),

  // ── Hierarchy graph data (Stage 1) ──
  hierarchyGraph: null, // { nodes, links }
  hierarchyLoading: false,
  hierarchyError: null,

  loadHierarchyGraph: async (years = '2024,2025,2026') => {
    set({ hierarchyLoading: true, hierarchyError: null });
    try {
      const { data } = await axiosClient.get('/api/v1/gap/hierarchy', { params: { years } });
      set({ hierarchyGraph: data.data, hierarchyLoading: false });
    } catch (err) {
      set({ hierarchyError: err.message, hierarchyLoading: false });
    }
  },

  // ── MCP Chatbot (Stage 1 → 2) ──
  ideaText: '',
  setIdeaText: (text) => set({ ideaText: text }),
  suggestions: [],
  suggestionsLoading: false,
  suggestionsError: null,

  // ── Match feedback (4-layer fallback) ──
  matchLevel: null,              // 'FULL' | 'PARTIAL' | 'FUZZY_ONLY' | 'NONE'
  fuzzyCandidates: [],           // [{ originalTerm, candidates: [{ keywordText, similarity, paperCount }] }]
  unmatchedTerms: [],            // ["blockchain", "healthcare"]
  availableLandscape: [],        // [{ fieldName, topicName, topKeywords: [{ text, paperCount }] }]
  guidanceMessage: '',

  submitIdea: async (idea) => {
    if (!idea.trim()) return;
    set({ suggestionsLoading: true, suggestionsError: null, ideaText: idea });
    try {
      const { data } = await axiosClient.post('/api/v1/gap/suggest', { idea });
      const payload = data.data || {};

      set({
        suggestions: payload.suggestions || [],
        matchLevel: payload.matchLevel || 'FULL',
        fuzzyCandidates: payload.fuzzyCandidates || [],
        unmatchedTerms: payload.unmatchedTerms || [],
        availableLandscape: payload.availableLandscape || [],
        guidanceMessage: payload.message || payload.rawText || '',
        suggestionsLoading: false,
        stage: 'filtered',
      });
    } catch (err) {
      set({ suggestionsError: err.message, suggestionsLoading: false });
    }
  },

  /**
   * Confirm a fuzzy candidate and re-submit with the corrected keyword.
   * Replaces the original term with the selected keyword and re-runs matching.
   */
  selectFuzzyCandidate: async (originalTerm, selectedKeyword) => {
    set({ suggestionsLoading: true });
    try {
      // Build a revised idea text replacing the fuzzy term
      const revisedIdea = get().ideaText
        ? get().ideaText.replace(new RegExp(originalTerm, 'gi'), selectedKeyword)
        : selectedKeyword;
      const { data } = await axiosClient.post('/api/v1/gap/suggest', { idea: revisedIdea });
      const payload = data.data || {};
      set({
        suggestions: payload.suggestions || [],
        matchLevel: payload.matchLevel || 'FULL',
        fuzzyCandidates: [],
        guidanceMessage: payload.message || '',
        suggestionsLoading: false,
        stage: 'filtered',
      });
    } catch (err) {
      set({ suggestionsError: err.message, suggestionsLoading: false });
    }
  },

  // ── On-demand Crawl (Layer 5) ──
  crawlTaskId: null,
  crawlProgress: null,
  isCrawling: false,
  crawlError: null,

  startCrawl: async (keywords) => {
    set({ isCrawling: true, crawlError: null });
    try {
      const { data } = await axiosClient.post('/api/v1/gap/crawl', { keywords });
      const taskId = data.data?.taskId;
      set({ crawlTaskId: taskId });
      // Start polling
      get().pollCrawlProgress(taskId, keywords);
    } catch (err) {
      set({ crawlError: err.message, isCrawling: false });
    }
  },

  pollCrawlProgress: (taskId, keywords) => {
    const poll = () => {
      if (!get().isCrawling) return; // cancelled

      axiosClient.get(`/api/v1/gap/crawl/progress/${taskId}`)
        .then(({ data }) => {
          const progress = data.data;
          set({ crawlProgress: progress });

          if (progress?.status === 'DONE') {
            // Crawl complete → auto suggest again with new data
            set({ isCrawling: false });
            const idea = get().ideaText;
            if (idea) get().submitIdea(idea);
            return;
          }
          if (progress?.status === 'FAILED') {
            set({ crawlError: progress.error || 'Crawl failed', isCrawling: false });
            return;
          }
          // Continue polling
          setTimeout(() => {
            if (get().isCrawling && get().crawlTaskId === taskId) poll();
          }, 2000);
        })
        .catch((err) => {
          set({ crawlError: err.message, isCrawling: false });
        });
    };
    poll();
  },

  cancelCrawl: () => {
    set({
      crawlTaskId: null,
      crawlProgress: null,
      isCrawling: false,
      crawlError: null,
    });
  },

  // ── Selected pair (Stage 2 → 3) ──
  selectedPair: null,
  relevantKeywords: [],

  selectPair: (pair) => {
    set({
      selectedPair: pair,
      relevantKeywords: [pair.keywordA, pair.keywordB],
      stage: 'focused',
    });
  },

  /** Go back from Stage 3 (focused) to Stage 2 (filtered/suggestions) */
  backToSuggestions: () => {
    set({
      stage: 'filtered',
      selectedPair: null,
      focusedGraph: null,
      gapAnalysis: null,
      relevantKeywords: [],
    });
  },

  // ── Focused graph (Stage 3) ──
  focusedGraph: null,
  focusedGraphLoading: false,

  loadFocusedGraph: async (kw1, kw2, years = '2024,2025,2026') => {
    set({ focusedGraphLoading: true });
    try {
      const { data } = await axiosClient.get('/api/v1/gap/focused', {
        params: { kw1, kw2, years },
      });
      set({ focusedGraph: data.data, focusedGraphLoading: false });
    } catch (err) {
      set({ focusedGraphLoading: false });
    }
  },

  // ── Gap Analysis ──
  gapAnalysis: null,
  gapAnalysisLoading: false,

  loadGapAnalysis: async (kw1, kw2, years = '2024,2025,2026') => {
    set({ gapAnalysisLoading: true });
    try {
      const { data } = await axiosClient.get('/api/v1/gap/analysis', {
        params: { kw1, kw2, years },
      });
      set({ gapAnalysis: data.data, gapAnalysisLoading: false });
    } catch (err) {
      set({ gapAnalysisLoading: false });
    }
  },

  // ── Highlighted node (click interaction) ──
  highlightedNode: null,
  setHighlightedNode: (nodeId) => set({ highlightedNode: nodeId }),
  clearHighlight: () => set({ highlightedNode: null }),

  // ── Reset ──
  reset: () =>
    set({
      stage: 'overview',
      ideaText: '',
      suggestions: [],
      selectedPair: null,
      focusedGraph: null,
      gapAnalysis: null,
      highlightedNode: null,
      matchLevel: null,
      fuzzyCandidates: [],
      unmatchedTerms: [],
      availableLandscape: [],
      guidanceMessage: '',
      crawlTaskId: null,
      crawlProgress: null,
      isCrawling: false,
      crawlError: null,
    }),
}));

export default useGapExplorerStore;
