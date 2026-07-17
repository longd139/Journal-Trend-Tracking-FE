import axiosClient from '../../lib/apiClient.js';

export const ideaAPI = {
  /**
   * POST /api/v1/ideas/extract-keywords
   * Extract keywords from research idea text + AI suggested keywords.
   * @param {string} ideaText
   * @returns {Promise<{extractedKeywords: string[], suggestedKeywords: string[]}>}
   */
  async extractKeywords(ideaText) {
    const { data } = await axiosClient.post('/api/v1/ideas/extract-keywords', {
      ideaText,
    });
    return data.data || data;
  },

  /**
   * POST /api/v1/ideas/analyze
   * Run the full analysis pipeline: search papers, evaluate, gap analysis, literature review.
   * @param {{ideaText: string, selectedKeywords: string[]}} payload
   * @returns {Promise<{
   *   analysisId: string,
   *   keywords: string[],
   *   papers: Array<{
   *     paperId: string,
   *     title: string,
   *     pdfUrl: string,
   *     abstractText: string,
   *     criteria: Array<{criterionName: string, value: boolean, evidenceQuote: string}>
   *   }>,
   *   gapAnalysis: {
   *     solvedAreas: Array<{area: string, papers: string[], summary: string}>,
   *     partiallyAddressed: Array<{area: string, papers: string[], limitation: string}>,
   *     researchGaps: Array<{gap: string, rationale: string, suggestedDirection: string}>,
   *     suggestedDirections: string[],
   *     noveltyScore: number,
   *     noveltyExplanation: string
   *   },
   *   literatureReview: {
   *     text: string,
   *     references: Array<{number: number, paperTitle: string, authors: string, year: number, journal: string, doi: string}>
   *   }
   * }>}
   */
  async analyze(payload) {
    const { data } = await axiosClient.post('/api/v1/ideas/analyze', payload);
    return data.data || data;
  },

  /**
   * GET /api/v1/ideas/history
   * Get paginated list of previous analyses.
   * @param {{page?: number, size?: number}} params
   * @returns {Promise<{
   *   items: Array<{analysisId: string, ideaText: string, keywords: string[], paperCount: number, createdAt: string}>,
   *   totalItems: number,
   *   totalPages: number,
   *   currentPage: number
   * }>}
   */
  async getHistory({ page = 0, size = 10 } = {}) {
    const { data } = await axiosClient.get('/api/v1/ideas/history', {
      params: { page, size },
    });
    return data.data || data;
  },

  /**
   * GET /api/v1/ideas/history/{analysisId}
   * Get full detail of a previous analysis (same shape as /analyze response).
   * @param {string} analysisId
   * @returns {Promise<object>} Full analysis response with gapAnalysis, literatureReview, papers, etc.
   */
  async getHistoryDetail(analysisId) {
    const { data } = await axiosClient.get(`/api/v1/ideas/history/${analysisId}`);
    return data.data || data;
  },

  /**
   * DELETE /api/v1/ideas/history/{analysisId}
   * Delete a previous analysis.
   * @param {string} analysisId
   */
  async deleteHistory(analysisId) {
    await axiosClient.delete(`/api/v1/ideas/history/${analysisId}`);
  },
};
