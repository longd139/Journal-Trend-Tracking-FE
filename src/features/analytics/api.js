import axiosClient from '../../lib/apiClient.js';

export const analyticsAPI = {
  /** GET /api/v1/analytics/overview — Tổng quan phân tích cá nhân */
  async getOverview() {
    const { data } = await axiosClient.get('/api/v1/analytics/overview');
    return data.data || data;
  },

  /** GET /api/v1/analytics/trends?period= — Xu hướng theo thời gian */
  async getTrends(period = 'yearly') {
    const { data } = await axiosClient.get('/api/v1/analytics/trends', {
      params: { period },
    });
    return data.data || data;
  },

  /** GET /api/v1/analytics/keywords — Phân tích từ khóa */
  async getKeywordAnalytics() {
    const { data } = await axiosClient.get('/api/v1/analytics/keywords');
    return data.data || data;
  },

  /** GET /api/v1/analytics/compare-keywords?keywords= — So sánh nhiều từ khóa */
  async compareKeywords(keywords) {
    const { data } = await axiosClient.get('/api/v1/analytics/compare-keywords', {
      params: { keywords: keywords.join(',') },
    });
    return data.data || data;
  },
};
