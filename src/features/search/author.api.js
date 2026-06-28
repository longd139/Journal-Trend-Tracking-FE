import axiosClient from '../../lib/apiClient.js';

export const authorAPI = {
  /**
   * Tra cứu nhanh hồ sơ học thuật của tác giả từ OpenAlex.
   * GET /api/search/author/quick-stats?keyword={keyword}
   */
  async quickStats(keyword) {
    const { data } = await axiosClient.get('/api/search/author/quick-stats', {
      params: { keyword },
    });
    return data.data || data;
  },

  /**
   * Biểu đồ năng suất & tác động theo từng năm (Bar + Line chart).
   * GET /api/search/author/quick-stats/timeline?keyword={keyword}
   */
  async timeline(keyword) {
    const { data } = await axiosClient.get('/api/search/author/quick-stats/timeline', {
      params: { keyword },
    });
    return data.data || data;
  },

  /**
   * Phân phối chủ đề nghiên cứu (Pie Chart / Treemap).
   * GET /api/search/author/quick-stats/research-focus?keyword={keyword}
   */
  async researchFocus(keyword) {
    const { data } = await axiosClient.get('/api/search/author/quick-stats/research-focus', {
      params: { keyword },
    });
    return data.data || data;
  },

  /**
   * Mạng lưới cộng tác — top 10 đồng tác giả thường xuyên nhất.
   * GET /api/search/author/quick-stats/co-authors?keyword={keyword}
   */
  async coAuthors(keyword) {
    const { data } = await axiosClient.get('/api/search/author/quick-stats/co-authors', {
      params: { keyword },
    });
    return data.data || data;
  },

  /**
   * Danh sách tác giả được đề xuất (zero-state).
   * GET /api/search/author/suggested
   * Auth: JWT required
   */
  async getSuggested() {
    const { data } = await axiosClient.get('/api/search/author/suggested');
    return data.data || data;
  },
};
