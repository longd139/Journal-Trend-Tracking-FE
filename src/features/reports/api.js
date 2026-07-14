import axiosClient from '../../lib/apiClient.js';

export const reportAPI = {
  // ═══════════════════════════════════════════════════════════════════
  // Keyword Trend Report (V2 — public endpoints)
  // ═══════════════════════════════════════════════════════════════════

  /**
   * GET /api/public/reports/keyword-trend?keyword= — Generate mới
   * @returns {Promise<{status, message, data: KeywordTrendReport}>}
   */
  async getKeywordTrend(keyword) {
    const { data } = await axiosClient.get('/api/public/reports/keyword-trend', {
      params: { keyword },
    });
    return data;
  },

  /**
   * GET /api/public/reports/keyword-trend/cached?keyword= — Lấy từ cache
   * @returns {Promise<{status, message, data: KeywordTrendReport}>}
   */
  async getKeywordTrendCached(keyword) {
    const { data } = await axiosClient.get('/api/public/reports/keyword-trend/cached', {
      params: { keyword },
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

  // ═══════════════════════════════════════════════════════════════════
  // Report History (requires BE: ReportHistoryController — Step 3)
  // These endpoints use auth-protected /api/v1/reports
  // Gracefully fall back to local-only if BE is not yet available
  // ═══════════════════════════════════════════════════════════════════

  /**
   * POST /api/v1/reports — Lưu report vào history
   * @param {{ reportType: string, queryText: string, reportName: string }} body
   * @returns {Promise<object>} ReportHistoryResponse
   */
  async saveReport(body) {
    const { data } = await axiosClient.post('/api/v1/reports', body);
    return data.data || data;
  },

  /**
   * GET /api/v1/reports — Lấy danh sách report history (phân trang)
   * @param {number} [page=0]
   * @param {number} [size=10]
   * @returns {Promise<{ content: object[], totalPages: number, totalElements: number }>}
   */
  async getHistory(page = 0, size = 20) {
    const { data } = await axiosClient.get('/api/v1/reports', {
      params: { page, size },
    });
    return data.data || data;
  },

  /**
   * DELETE /api/v1/reports/{reportId} — Xóa report khỏi history
   * @param {string} reportId
   */
  async deleteReport(reportId) {
    await axiosClient.delete(`/api/v1/reports/${reportId}`);
  },

  /**
   * GET /api/v1/reports/{reportId}/regenerate — Xem lại report đã lưu
   * @param {string} reportId
   * @returns {Promise<object>} Full report data (type-dependent)
   */
  async regenerateReport(reportId) {
    const { data } = await axiosClient.get(`/api/v1/reports/${reportId}/regenerate`);
    return data.data || data;
  },
};
