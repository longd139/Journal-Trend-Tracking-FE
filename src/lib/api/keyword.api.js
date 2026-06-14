import axiosClient from '../http/axiosClient';

export const keywordAPI = {
  /**
   * Lấy danh sách keyword từ hệ thống.
   * GET /api/v1/keywords
   * Response: { status, message, data: [{ keywordId, keywordText, ... }], timestamp }
   */
  async getKeywords() {
    const { data } = await axiosClient.get('/api/v1/keywords');
    return data.data || data;
  },
};
