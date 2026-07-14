import axiosClient from '../../lib/apiClient.js';

export const reportAPI = {
  // ═══════════════════════════════════════════════════════════════════
  // Keyword Trend Report (V2 — public endpoints)
  // ═══════════════════════════════════════════════════════════════════

  /**
   * GET /api/public/reports/keyword-trend?keyword=&startYear=&endYear= — Generate mới
   * @returns {Promise<{status, message, data: KeywordTrendReport}>}
   */
  async getKeywordTrend(keyword, { startYear, endYear } = {}) {
    const { data } = await axiosClient.get('/api/public/reports/keyword-trend', {
      params: {
        keyword,
        ...(startYear && { startYear }),
        ...(endYear && { endYear }),
      },
    });
    return data;
  },

  /**
   * GET /api/public/reports/keyword-trend/cached?keyword=&startYear=&endYear= — Lấy từ cache
   * @returns {Promise<{status, message, data: KeywordTrendReport}>}
   */
  async getKeywordTrendCached(keyword, { startYear, endYear } = {}) {
    const { data } = await axiosClient.get('/api/public/reports/keyword-trend/cached', {
      params: {
        keyword,
        ...(startYear && { startYear }),
        ...(endYear && { endYear }),
      },
    });
    return data;
  },

  /**
   * DELETE /api/public/reports/keyword-trend/cached?keyword= — Xóa khỏi cache
   * @returns {Promise<{status, message}>}
   */
  async deleteKeywordTrendCache(keyword) {
    const { data } = await axiosClient.delete('/api/public/reports/keyword-trend/cached', {
      params: { keyword },
    });
    return data;
  },

  /**
   * GET /api/public/reports/keyword-trend/history — Danh sách keyword đã report
   * @returns {Promise<{status, message, data: KeywordTrendHistoryItem[]}>}
   */
  async getKeywordTrendHistory() {
    const { data } = await axiosClient.get('/api/public/reports/keyword-trend/history');
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
