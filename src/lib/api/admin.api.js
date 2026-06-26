import axiosClient from '../http/axiosClient';

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
};
