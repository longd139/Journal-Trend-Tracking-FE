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
   * Convenience: sync wrapper that polls async endpoint until COMPLETED.
   * Returns { nodes, links } directly.
   */
  async searchGraph(keyword, depth = 3) {
    const startRes = await this.startGraphSearch(keyword, depth);
    const taskId = startRes.taskId;
    if (!taskId) throw new Error('No taskId returned from graph search');

    for (let i = 0; i < 30; i++) {
      const statusRes = await this.getGraphStatus(taskId);
      if (statusRes.status === 'COMPLETED') {
        return statusRes.result || { nodes: [], links: [] };
      }
      if (statusRes.status === 'FAILED') {
        throw new Error(statusRes.message || 'Graph search failed');
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    throw new Error('Graph search timed out');
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
