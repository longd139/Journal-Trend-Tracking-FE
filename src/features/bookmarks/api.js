import axiosClient from '../../lib/apiClient.js';

export const bookmarkAPI = {
  /** GET /api/v1/bookmarks — Lấy danh sách bookmarks của user hiện tại */
  async getMyBookmarks() {
    const { data } = await axiosClient.get('/api/v1/bookmarks');
    return data; // AppResponse<BookmarkResponse[]>
  },

  /** POST /api/v1/bookmarks — Lưu một paper */
  async addBookmark(paperId) {
    const { data } = await axiosClient.post('/api/v1/bookmarks', { paperId });
    return data; // AppResponse<BookmarkResponse>
  },

  /** DELETE /api/v1/bookmarks/{bookmarkId} — Xóa bookmark theo ID */
  async removeBookmark(bookmarkId) {
    const { data } = await axiosClient.delete(`/api/v1/bookmarks/${bookmarkId}`);
    return data; // AppResponse<void>
  },

  /** DELETE /api/v1/bookmarks/paper/{paperId} — Xóa bookmark theo paper ID */
  async removeBookmarkByPaper(paperId) {
    const { data } = await axiosClient.delete(`/api/v1/bookmarks/paper/${paperId}`);
    return data; // AppResponse<void>
  },

  /** DELETE /api/v1/bookmarks/keyword/{keywordId} — Xóa bookmark theo keyword ID */
  async removeBookmarkByKeyword(keywordId) {
    const { data } = await axiosClient.delete(`/api/v1/bookmarks/keyword/${keywordId}`);
    return data; // AppResponse<void>
  },
};
