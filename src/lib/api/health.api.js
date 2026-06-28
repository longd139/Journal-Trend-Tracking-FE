import axiosClient from '../http/axiosClient';

export const healthAPI = {
  /**
   * Kiểm tra trạng thái hệ thống backend.
   * GET /api/public/health
   * Response: { status, message, data: { status: "READY"|"DEGRADED", databaseConnected, neo4jConnected, ... }, timestamp }
   */
  async check() {
    const { data } = await axiosClient.get('/api/public/health');
    return data;
  },
};
