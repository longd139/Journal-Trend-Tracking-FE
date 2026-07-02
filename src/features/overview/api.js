import axiosClient from '../../lib/apiClient.js';

export const overviewAPI = {
  /** GET /api/public/dashboard/papers — Tổng số papers */
  async getTotalPapers() {
    const { data } = await axiosClient.get('/api/public/dashboard/papers');
    return data.data || data;
  },

  /** GET /api/public/dashboard/overview — Thống kê tổng quan (public) */
  async getPublicOverview() {
    const { data } = await axiosClient.get('/api/public/dashboard/overview');
    return data.data || data;
  },

  /** GET /api/v1/overview/statistics — Thống kê theo role */
  async getRoleStatistics() {
    const { data } = await axiosClient.get('/api/v1/overview/statistics');
    return data.data || data;
  },

  /** GET /api/v1/overview/user — Thống kê cá nhân (researcher) */
  async getUserOverview() {
    const { data } = await axiosClient.get('/api/v1/overview/user');
    return data.data || data;
  },
};
