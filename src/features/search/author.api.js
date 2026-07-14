import axiosClient from '../../lib/apiClient.js';

export const authorAPI = {
  /**
   * Author name autocomplete — OpenAlex-powered suggestions with pagination.
   * GET /api/search/author/suggest?query={partial_name}&page=1&size=20
   * Auth: Bearer Token required
   * Response: { data: { data: [...], total, page, hasMore } }
   */
  async getSuggest(query, { page = 1, size = 20 } = {}) {
    const { data } = await axiosClient.get('/api/search/author/suggest', {
      params: { query, page, size },
    });
    return data.data || data;
  },

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

  /**
   * Top 5 bài báo được trích dẫn nhiều nhất của tác giả.
   * GET /api/search/author/top-papers?keyword={authorName}
   * Auth: Public (không cần auth)
   */
  async topPapers(keyword) {
    const { data } = await axiosClient.get('/api/search/author/top-papers', {
      params: { keyword },
    });
    return data.data || data;
  },
};
