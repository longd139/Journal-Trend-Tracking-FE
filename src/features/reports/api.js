import axiosClient from '../../lib/apiClient.js';

export const reportAPI = {
  /** GET /api/public/reports/keyword-trend?keyword= — Báo cáo xu hướng keyword */
  async getKeywordTrend(keyword) {
    const { data } = await axiosClient.get('/api/public/reports/keyword-trend', {
      params: { keyword },
    });
    return data;
  },

  /** GET /api/public/reports/journal-quality?journalName= — Báo cáo chất lượng journal */
  async getJournalQuality(journalName) {
    const { data } = await axiosClient.get('/api/public/reports/journal-quality', {
      params: { journalName },
    });
    return data;
  },

  /** GET /api/public/reports/author-impact?authorName= — Báo cáo tác động tác giả */
  async getAuthorImpact(authorName) {
    const { data } = await axiosClient.get('/api/public/reports/author-impact', {
      params: { authorName },
    });
    return data;
  },
};
