import axiosClient from '../../lib/apiClient.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Graph API — async keyword graph search with polling
   ═══════════════════════════════════════════════════════════════════════════ */

export const graphAPI = {
  /**
   * Step 1: Start an async keyword graph search.
   * POST /api/graphs/keyword/search?keyword={keyword}&depth={depth}
   * Response: { taskId, status: "PROCESSING", message }
   */
  async startGraphSearch(keyword, depth = 3) {
    const { data } = await axiosClient.post('/api/graphs/keyword/search', null, {
      params: { keyword, depth },
    });
    return data.data || data;
  },

  /**
   * Step 2: Poll for graph search result.
   * GET /api/graphs/keyword/status/{taskId}
   * Response: { taskId, status: "PROCESSING"|"COMPLETED"|"FAILED", progress, result? }
   */
  async getGraphStatus(taskId) {
    const { data } = await axiosClient.get(`/api/graphs/keyword/status/${taskId}`);
    return data.data || data;
  },

  /**
   * Get hot keywords (public endpoint, no auth needed).
   * GET /api/public/keywords/hot?limit=10
   */
  async getHotKeywords(limit = 10) {
    const { data } = await axiosClient.get('/api/public/keywords/hot', {
      params: { limit },
    });
    return data.data || data;
  },
};
