import axiosClient from '../../lib/apiClient.js';

export const upgradeAPI = {
  /**
   * POST /api/users/me/upgrade-request
   * Submit a new upgrade request (academic_user only).
   */
  async submitRequest(payload) {
    const { data } = await axiosClient.post('/api/users/me/upgrade-request', payload);
    return data.data || data;
  },

  /**
   * GET /api/users/me/upgrade-requests?page=0&size=20
   * Get current user's upgrade request history.
   */
  async getMyRequests({ page = 0, size = 20 } = {}) {
    const { data } = await axiosClient.get('/api/users/me/upgrade-requests', {
      params: { page, size },
    });
    return data.data || data;
  },

  /**
   * GET /api/users/me/upgrade-requests/{id}
   * Get detail of one of the user's upgrade requests.
   */
  async getMyRequestDetail(id) {
    const { data } = await axiosClient.get(`/api/users/me/upgrade-requests/${id}`);
    return data.data || data;
  },

  /**
   * GET /api/admin/upgrade-requests?status=PENDING&page=0&size=20
   * Admin: get all upgrade requests, filtered by status.
   */
  async getAdminRequests({ status, page = 0, size = 20 } = {}) {
    const params = { page, size };
    if (status) params.status = status;
    const { data } = await axiosClient.get('/api/admin/upgrade-requests', { params });
    return data.data || data;
  },

  /**
   * GET /api/admin/upgrade-requests/{id}
   * Admin: get detail of a specific upgrade request.
   */
  async getAdminRequestDetail(id) {
    const { data } = await axiosClient.get(`/api/admin/upgrade-requests/${id}`);
    return data.data || data;
  },

  /**
   * POST /api/admin/upgrade-requests/{id}/approve
   * Admin: approve an upgrade request (optional adminNote).
   */
  async approveRequest(id, { adminNote } = {}) {
    const body = adminNote ? { adminNote } : {};
    const { data } = await axiosClient.post(`/api/admin/upgrade-requests/${id}/approve`, body);
    return data.data || data;
  },

  /**
   * POST /api/admin/upgrade-requests/{id}/reject
   * Admin: reject an upgrade request (optional adminNote).
   */
  async rejectRequest(id, { adminNote } = {}) {
    const body = adminNote ? { adminNote } : {};
    const { data } = await axiosClient.post(`/api/admin/upgrade-requests/${id}/reject`, body);
    return data.data || data;
  },
};
