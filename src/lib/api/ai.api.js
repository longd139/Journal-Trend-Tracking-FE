import axiosClient from '../apiClient.js';

export const aiAPI = {
  /**
   * Summarize paper abstract (2-3 sentences) and extract methodology.
   * GET /api/v1/ai/summarize/{paperId}
   * Response: paper details + aiSummary (optional) + methodology (optional)
   * Graceful fallback: AI fields absent when provider unavailable (no error thrown)
   */
  async summarize(paperId) {
    const { data } = await axiosClient.get(`/api/v1/ai/summarize/${paperId}`);
    return data.data || data;
  },

  /**
   * Extract research methodology from paper abstract.
   * GET /api/v1/ai/methodology/{paperId}
   * Response: { paperId, title, methodology? }
   */
  async methodology(paperId) {
    const { data } = await axiosClient.get(`/api/v1/ai/methodology/${paperId}`);
    return data.data || data;
  },

  /**
   * Batch analyze multiple papers — summarize each + cross-paper comparative insight.
   * POST /api/v1/ai/batch-analyze
   * Body: paperIds[] (max 10, duplicates auto-removed)
   * Response: { paperSummaries[], comparativeInsight?, papersAnalyzed }
   */
  async batchAnalyze(paperIds) {
    const { data } = await axiosClient.post('/api/v1/ai/batch-analyze', paperIds);
    return data.data || data;
  },
};
