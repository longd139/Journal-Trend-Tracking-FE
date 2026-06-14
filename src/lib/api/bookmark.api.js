import axiosClient from '../http/axiosClient';

export const bookmarkAPI = {
  /**
   * Lấy danh sách bookmarks của người dùng hiện tại.
   * GET /api/v1/bookmarks
   * Response: { status, message, data: [{ bookmarkId, paperId, paperTitle, keywordId, keywordText, notes, createdAt }], timestamp }
   */
  async getBookmarks() {
    const { data } = await axiosClient.get('/api/v1/bookmarks');
    return data.data || data;
  },

  /**
   * Tạo bookmark mới.
   * POST /api/v1/bookmarks
   * Body: { paperId, keywordId, notes, exactlyOneTarget: true }
   * Response: { status, message, data: { bookmarkId, paperId, paperTitle, keywordId, keywordText, notes, createdAt }, timestamp }
   */
  async createBookmark(body = {}) {
    const { data } = await axiosClient.post('/api/v1/bookmarks', {
      paperId: body.paperId,
      keywordId: body.keywordId,
      notes: body.notes || '',
      exactlyOneTarget: true,
    });
    return data;
  },

  /**
   * Xoá bookmark theo ID.
   * DELETE /api/v1/bookmarks/{bookmarkId}
   */
  async deleteBookmark(bookmarkId) {
    const { data } = await axiosClient.delete(`/api/v1/bookmarks/${bookmarkId}`);
    return data;
  },
};
