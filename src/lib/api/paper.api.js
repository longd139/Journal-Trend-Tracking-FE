import axiosClient from '../http/axiosClient';

export const paperAPI = {
  /**
   * Lấy danh sách bài báo có sẵn (chỉ dùng để hiển thị dữ liệu ban đầu).
   * Chỉ yêu cầu 2 param: page, size.
   * GET /api/v1/papers?page=0&size=5
   */
  async search(params = {}) {
    const { data } = await axiosClient.get('/api/v1/papers', {
      params: { page: params.page, size: params.size },
    });
    return data.data || data;
  },

  /**
   * Tìm kiếm bài báo nâng cao (POST).
   * Gửi request body: { query, authorName, journalId, page, size }
   * Nhận response: { status, message, data: { papers, totalElements, totalPages, currentPage, pageSize, hasNext, hasPrev }, timestamp }
   */
  async searchPapers(body = {}) {
    const { data } = await axiosClient.get('/api/v1/papers/search', {
      params: {
        query: body.query || '',
        authorName: body.authorName || '',
        journalId: body.journalId || '',
        page: body.page ?? 0,
      },
    });
    return data; // { status, message, data: { papers, totalElements, ... }, timestamp }
  },
};
