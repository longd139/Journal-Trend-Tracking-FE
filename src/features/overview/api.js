import axiosClient from '../../lib/apiClient.js';

export const overviewAPI = {
  /** GET /api/public/dashboard/overview — 4 stat cards (public, no auth)
   *  Không có authorId → system-wide: papersTracked, totalCitations, paperGrowth, totalAuthors
   *  Có authorId → author-specific: authorTotalPapers, authorTotalCitations, authorHIndex, authorCoAuthors
   */
  async getPublicOverview(authorId) {
    const params = authorId ? { authorId } : {};
    const { data } = await axiosClient.get('/api/public/dashboard/overview', { params });
    return data.data || data;
  },

  /** GET /api/v1/overview/user — Personal stats + author detail (auth required)
   *  Không có authorId → totalPapers, papersViewed, searchesRemaining, totalKeywords
   *  Có authorId → thêm hIndex, citationHistory[], researchFields[], recentPublications[]
   */
  async getUserOverview(authorId) {
    const params = authorId ? { authorId } : {};
    const { data } = await axiosClient.get('/api/v1/overview/user', { params });
    return data.data || data;
  },

  /** GET /api/v1/overview/followed-authors — Danh sách author đang follow */
  async getFollowedAuthors() {
    const { data } = await axiosClient.get('/api/v1/overview/followed-authors');
    return data.data || data;
  },
};
