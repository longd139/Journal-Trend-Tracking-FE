import axiosClient from '../../lib/apiClient.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Admin API — matches backend controllers at /api/admin/*
   ═══════════════════════════════════════════════════════════════════════════ */

export const adminAPI = {
  /* ──────────── Users (/api/admin/users) ──────────── */
  async getUsers({ page = 0, size = 20, search } = {}) {
    const { data } = await axiosClient.get('/api/admin/users', {
      params: { page, size, search },
    });
    return data; // AppResponse<Page<AdminUserResponse>>
  },

  async updateUserStatus(userId, active) {
    const { data } = await axiosClient.patch(`/api/admin/users/${userId}/status`, { active });
    return data;
  },

  async updateUserRole(userId, roleName) {
    const { data } = await axiosClient.patch(`/api/admin/users/${userId}/role`, { roleName });
    return data;
  },

  /* ──────────── Sync (/api/admin/sync) ──────────── */
  async triggerManualSync({ source, keywords, papersPerKeyword, yearFrom, yearTo } = {}) {
    const { data } = await axiosClient.post('/api/admin/sync/trigger', {
      source, keywords, papersPerKeyword, yearFrom, yearTo,
    });
    return data;
  },

  /**
   * Get system-wide database statistics across all entities
   * (papers, authors, keywords, journals, Neo4j, sync logs).
   * GET /api/v1/admin/sync/stats
   */
  async getSyncStats() {
    const { data } = await axiosClient.get('/api/v1/admin/sync/stats');
    return data; // AppResponse<DatabaseStatsResponse>
  },

  async getSyncHistory({ page = 0, size = 20, status, manual } = {}) {
    const { data } = await axiosClient.get('/api/admin/sync/history', {
      params: { page, size, status, manual },
    });
    return data; // AppResponse<Page<SyncHistoryResponse>>
  },

  /* ──────────── Configs (/api/admin/configs) ──────────── */
  async getConfigs() {
    const { data } = await axiosClient.get('/api/admin/configs');
    return data; // AppResponse<List<SystemConfigResponse>>
  },

  async updateConfigs(payload) {
    const { data } = await axiosClient.put('/api/admin/configs', payload);
    return data;
  },

  /* ──────────── Data Sources (/api/admin/data-sources) ──────────── */
  async getDataSources() {
    const { data } = await axiosClient.get('/api/admin/data-sources');
    return data; // AppResponse<List<DataSourceResponse>>
  },

  async createDataSource(payload) {
    const { data } = await axiosClient.post('/api/admin/data-sources', payload);
    return data;
  },

  async updateDataSource(sourceId, payload) {
    const { data } = await axiosClient.put(`/api/admin/data-sources/${sourceId}`, payload);
    return data;
  },

  async deleteDataSource(sourceId) {
    const { data } = await axiosClient.delete(`/api/admin/data-sources/${sourceId}`);
    return data;
  },

  /* ──────────── Audit Logs (/api/admin/audit-logs) ──────────── */
  async getAuditLogs({ page = 0, size = 20, action, adminId } = {}) {
    const { data } = await axiosClient.get('/api/admin/audit-logs', {
      params: { page, size, action, adminId },
    });
    return data; // AppResponse<Page<AuditLogResponse>>
  },

  /* ──────────── Keep legacy sync helpers for notification ──────────── */
  async getSyncNotifications() {
    const { data } = await axiosClient.get('/api/admin/sync/history', {
      params: { page: 0, size: 1 },
    });
    // Extract latest sync as notification
    const pageData = data?.data;
    if (pageData?.content?.length > 0) {
      return { message: `Latest sync: ${pageData.content[0].status}`, timestamp: pageData.content[0].completedAt };
    }
    return { message: 'No sync history available' };
  },

  /* ──────────── Auto Sync (/auto) ──────────── */

  /**
   * Check whether auto-sync is enabled and get last sync info.
   * GET /api/v1/admin/sync/auto/status
   * Response: { enabled, lastPapersCount, lastSyncTime }
   */
  async getAutoSyncStatus() {
    const { data } = await axiosClient.get('/api/v1/admin/sync/auto/status');
    return data; // { enabled, lastPapersCount, lastSyncTime }
  },

  /**
   * Enable or disable the scheduled auto-sync.
   * PUT /api/v1/admin/sync/auto/toggle?enabled=true
   * Response: { status, message, data: { autoSyncEnabled } }
   */
  async toggleAutoSync(enabled) {
    const { data } = await axiosClient.put('/api/v1/admin/sync/auto/toggle', null, {
      params: { enabled },
    });
    return data;
  },

  /**
   * Get the latest sync notification for the admin notification bell.
   * GET /api/v1/admin/sync/notification
   * Response: { status, message, data: Record<string, string>, timestamp }
   */
  async getSyncNotification() {
    const { data } = await axiosClient.get('/api/v1/admin/sync/notification');
    return data;
  },

  /* ──────────── Deep Sync OpenAlex (/api/v1/admin/sync/openalex/deep) ──────────── */

  /**
   * Trigger a deep sync from OpenAlex for one or more keywords.
   * POST /api/v1/admin/sync/openalex/deep
   * Content-Type: application/x-www-form-urlencoded
   *
   * @param {{ query: string, limit?: number, yearFrom?: number, yearTo?: number, mailto?: string, apiKey?: string }} params
   * @returns { status, message, data: { totalKeywords, totalFetched, totalInserted, yearRange, keywordStats }, timestamp }
   */
  async syncOpenAlexDeep({ query, limit, yearFrom, yearTo, mailto, apiKey }) {
    const formParams = new URLSearchParams();
    formParams.append('query', query);
    if (limit != null) formParams.append('limit', String(limit));
    if (yearFrom != null) formParams.append('yearFrom', String(yearFrom));
    if (yearTo != null) formParams.append('yearTo', String(yearTo));
    if (mailto) formParams.append('mailto', mailto);
    if (apiKey) formParams.append('apiKey', apiKey);

    const { data } = await axiosClient.post('/api/v1/admin/sync/openalex/deep', formParams, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return data;
  },

  /* ──────────── Deep Sync CORE (/api/v1/admin/sync/core/deep) ──────────── */

  /**
   * Trigger a deep sync from CORE for one or more keywords.
   * POST /api/v1/admin/sync/core/deep
   * Content-Type: application/x-www-form-urlencoded
   *
   * @param {{ query: string, limit?: number, yearFrom?: number, yearTo?: number, apiKey?: string }} params
   * @returns { code, message, data: { totalKeywords, totalFetched, totalInserted, yearRange, keywordStats }, timestamp }
   */
  async syncCoreDeep({ query, limit, yearFrom, yearTo, apiKey }) {
    const formParams = new URLSearchParams();
    formParams.append('query', query);
    if (limit != null) formParams.append('limit', String(limit));
    if (yearFrom != null) formParams.append('yearFrom', String(yearFrom));
    if (yearTo != null) formParams.append('yearTo', String(yearTo));
    if (apiKey) formParams.append('apiKey', apiKey);

    const { data } = await axiosClient.post('/api/v1/admin/sync/core/deep', formParams, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return data;
  },

  /* ──────────── Single-source Sync (/api/v1/admin/sync) ──────────── */

  async syncOpenAlex({ query, limit, yearFrom, yearTo } = {}) {
    const formParams = new URLSearchParams();
    formParams.append('query', query);
    if (limit != null) formParams.append('limit', String(limit));
    if (yearFrom != null) formParams.append('yearFrom', String(yearFrom));
    if (yearTo != null) formParams.append('yearTo', String(yearTo));
    const { data } = await axiosClient.post('/api/v1/admin/sync/openalex', formParams, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return data;
  },

  async syncSemanticScholar({ query, limit, yearFrom, yearTo } = {}) {
    const formParams = new URLSearchParams();
    formParams.append('query', query);
    if (limit != null) formParams.append('limit', String(limit));
    if (yearFrom != null) formParams.append('yearFrom', String(yearFrom));
    if (yearTo != null) formParams.append('yearTo', String(yearTo));
    const { data } = await axiosClient.post('/api/v1/admin/sync/semantic-scholar', formParams, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return data;
  },

  async syncArxiv({ query, limit, yearFrom, yearTo } = {}) {
    const formParams = new URLSearchParams();
    formParams.append('query', query);
    if (limit != null) formParams.append('limit', String(limit));
    if (yearFrom != null) formParams.append('yearFrom', String(yearFrom));
    if (yearTo != null) formParams.append('yearTo', String(yearTo));
    const { data } = await axiosClient.post('/api/v1/admin/sync/arxiv', formParams, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return data;
  },

  async syncCore({ query, limit, yearFrom, yearTo } = {}) {
    const formParams = new URLSearchParams();
    formParams.append('query', query);
    if (limit != null) formParams.append('limit', String(limit));
    if (yearFrom != null) formParams.append('yearFrom', String(yearFrom));
    if (yearTo != null) formParams.append('yearTo', String(yearTo));
    const { data } = await axiosClient.post('/api/v1/admin/sync/core', formParams, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return data;
  },

  /* ──────────── Bulk Sync (/api/v1/admin/sync/bulk) ──────────── */

  /**
   * Start an async bulk sync from OpenAlex for multiple keywords.
   * POST /api/v1/admin/sync/bulk
   * Content-Type: application/json
   *
   * @param {{ keywords?: string[], papersPerKeyword?: number, yearFrom?: number, yearTo?: number }} body
   * @returns {{ status, message, data: { taskId, totalKeywords } }}
   */
  async bulkSync(body) {
    const { data } = await axiosClient.post('/api/v1/admin/sync/bulk', body);
    return data;
  },

  /**
   * Start an async bulk sync from CORE for multiple keywords.
   * POST /api/v1/admin/sync/core/bulk
   * Content-Type: application/json
   *
   * @param {{ keywords?: string[], papersPerKeyword?: number, yearFrom?: number, yearTo?: number, apiKey?: string }} body
   * @returns {{ status, message, data: { taskId, totalKeywords, papersPerKeyword, estimatedMaxPapers } }}
   */
  async syncCoreBulk(body) {
    const { data } = await axiosClient.post('/api/v1/admin/sync/core/bulk', body);
    return data;
  },

  /**
   * Start an async bulk sync from Semantic Scholar for multiple keywords.
   * POST /api/v1/admin/sync/semantic-scholar/bulk
   * Content-Type: application/json
   */
  async syncSemanticScholarBulk(body) {
    const { data } = await axiosClient.post('/api/v1/admin/sync/semantic-scholar/bulk', body);
    return data;
  },

  /**
   * Start an async bulk sync from arXiv for multiple keywords.
   * POST /api/v1/admin/sync/arxiv/bulk
   * Content-Type: application/json
   */
  async syncArxivBulk(body) {
    const { data } = await axiosClient.post('/api/v1/admin/sync/arxiv/bulk', body);
    return data;
  },

  /**
   * Poll bulk sync progress.
   * GET /api/v1/admin/sync/bulk/{taskId}/progress
   *
   * @param {string} taskId
   * @returns {{ status, message, data: BulkProgressResponse }}
   */
  async getBulkSyncProgress(taskId) {
    const { data } = await axiosClient.get(`/api/v1/admin/sync/bulk/${taskId}/progress`);
    return data;
  },

  /**
   * Get list of all bulk sync tasks (running + recent completed/failed).
   * GET /api/v1/admin/sync/bulk/tasks
   *
   * @returns {{ status, message, data: { total, running, tasks: BulkTask[] } }}
   */
  async getBulkSyncTasks() {
    const { data } = await axiosClient.get('/api/v1/admin/sync/bulk/tasks');
    return data;
  },
};
