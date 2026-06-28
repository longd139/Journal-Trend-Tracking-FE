import axiosClient from '../http/axiosClient';

export const notificationAPI = {
  /**
   * GET /api/v1/notifications?page=0&size=20&filter=unread
   * Lấy danh sách notification (có phân trang + filter).
   */
  async getNotifications({ page = 0, size = 20, filter } = {}) {
    const params = { page, size };
    if (filter) params.filter = filter;
    const { data } = await axiosClient.get('/api/v1/notifications', { params });
    return data.data || data;
  },

  /**
   * GET /api/v1/notifications/unread-count
   * Lấy số lượng notification chưa đọc.
   */
  async getUnreadCount() {
    const { data } = await axiosClient.get('/api/v1/notifications/unread-count');
    return data.data || data;
  },

  /**
   * PUT /api/v1/notifications/{notifId}/read
   * Đánh dấu 1 notification đã đọc.
   */
  async markAsRead(notifId) {
    const { data } = await axiosClient.put(`/api/v1/notifications/${notifId}/read`);
    return data;
  },

  /**
   * PUT /api/v1/notifications/read-all
   * Đánh dấu tất cả notification đã đọc.
   */
  async markAllAsRead() {
    const { data } = await axiosClient.put('/api/v1/notifications/read-all');
    return data;
  },

  /**
   * DELETE /api/v1/notifications/{notifId}
   * Xóa 1 notification.
   */
  async deleteNotification(notifId) {
    const { data } = await axiosClient.delete(`/api/v1/notifications/${notifId}`);
    return data;
  },
};
