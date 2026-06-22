import axiosClient from '../http/axiosClient';

export const adminAPI = {
  async getAllUsers() {
    const { data } = await axiosClient.get('/api/users');
    return data; // { status, message, data: [...users], timestamp }
  },

  async updateUser(userId, payload) {
    const { data } = await axiosClient.put(`/api/users/${userId}`, payload);
    return data;
  },

  async deleteUser(userId) {
    const { data } = await axiosClient.delete(`/api/users/${userId}`);
    return data;
  },

  /**
   * Đồng bộ dữ liệu từ các nguồn học thuật.
   * POST /api/v1/admin/sync/{source}
   * @param {{ source: string, query: string, limit: number, yearFrom?: number, yearTo?: number }} params
   * @returns {{ status, message, data, timestamp }}
   */
  async sync({ source, query, limit, yearFrom, yearTo }) {
    const { data } = await axiosClient.post(`/api/v1/admin/sync/${source}`, null, {
      params: { query, limit, yearFrom, yearTo },
    });
    return { source, ...data };
  },

  async syncOpenAlex(params) {
    return this.sync({ source: 'openalex', ...params });
  },

  async syncSemanticScholar(params) {
    return this.sync({ source: 'semantic-scholar', ...params });
  },

  async syncArxiv(params) {
    return this.sync({ source: 'arxiv', ...params });
  },

  async syncCore(params) {
    return this.sync({ source: 'core', ...params });
  },

  /**
   * Lấy thống kê hệ thống.
   * GET /api/v1/admin/sync/stats
   * @returns {{ status, message, data: { papers, authors, keywords, journals, researchFields, researchTopics, neo4j, syncLogs }, timestamp }}
   */
  async getSyncStats() {
    const { data } = await axiosClient.get('/api/v1/admin/sync/stats');
    return data;
  },

  /**
   * Xóa toàn bộ dữ liệu đã đồng bộ.
   * DELETE /api/v1/admin/sync/clear-all
   * @returns {{ status, message, data, timestamp }}
   */
  async clearAllData() {
    const { data } = await axiosClient.delete('/api/v1/admin/sync/clear-all');
    return data;
  },

  /**
   * Lấy trạng thái auto-sync.
   * GET /api/v1/admin/sync/auto/status
   */
  async getAutoSyncStatus() {
    const { data } = await axiosClient.get('/api/v1/admin/sync/auto/status');
    return data;
  },

  /**
   * Bật/tắt auto-sync.
   * PUT /api/v1/admin/sync/auto/toggle?enabled=boolean
   */
  async toggleAutoSync(enabled) {
    const { data } = await axiosClient.put('/api/v1/admin/sync/auto/toggle', null, {
      params: { enabled },
    });
    return data;
  },

  /**
   * Lấy thông báo sync cho admin.
   * GET /api/v1/admin/sync/notification
   */
  async getSyncNotifications() {
    const { data } = await axiosClient.get('/api/v1/admin/sync/notification');
    return data;
  },

  /**
   * Bulk sync với danh sách keywords hoặc mặc định trending.
   * POST /api/v1/admin/sync/bulk
   * @param {{ keywords?: string[], papersPerKeyword?: number, yearFrom?: number, yearTo?: number }} body
   * @returns {{ taskId, totalKeywords, message }}
   */
  async bulkSync(body) {
    const { data } = await axiosClient.post('/api/v1/admin/sync/bulk', body || {});
    return data;
  },

  /**
   * Lấy tiến độ bulk sync.
   * GET /api/v1/admin/sync/bulk/{taskId}/progress
   * @returns {{ taskId, status, totalKeywords, completedKeywords, currentKeyword, totalFetched, totalInserted, percent, keywordStats, completedAt, result }}
   */
  async getBulkSyncProgress(taskId) {
    const { data } = await axiosClient.get(`/api/v1/admin/sync/bulk/${taskId}/progress`);
    return data;
  },
};
