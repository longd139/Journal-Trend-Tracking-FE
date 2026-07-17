import axiosClient from '../../lib/apiClient.js';

export const analyticsAPI = {
  /** GET /api/v1/analytics/overview — User-personalized stat cards */
  async getOverview() {
    const { data } = await axiosClient.get('/api/v1/analytics/overview');
    return data.data || data;
  },

  /** GET /api/v1/analytics/trends?period= — User publication timeline */
  async getTrends(period = 'yearly') {
    const { data } = await axiosClient.get('/api/v1/analytics/trends', {
      params: { period },
    });
    return data.data || data;
  },

  /** GET /api/v1/analytics/keywords — Top keywords của user */
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

  /** GET /api/v1/analytics/trend-prediction?field= — AI trend prediction (🆕) */
  async getTrendPrediction(field = '') {
    const { data } = await axiosClient.get('/api/v1/analytics/trend-prediction', {
      params: field ? { field } : {},
    });
    return data.data || data;
  },

  /** GET /api/v1/analytics/research-landscape — Research field map (🆕) */
  async getResearchLandscape() {
    const { data } = await axiosClient.get('/api/v1/analytics/research-landscape');
    return data.data || data;
  },

  /** GET /api/v1/analytics/trending-topics — Hot keywords từ OpenAlex */
  async getTrendingTopics() {
    const { data } = await axiosClient.get('/api/v1/analytics/trending-topics');
    return data.data || data;
  },
};
