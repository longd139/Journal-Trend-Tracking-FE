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

  /**
   * Quick statistics for a keyword — total papers, citations,
   * YoY growth rate, avg citations per paper, and top journals.
   * GET /api/search/keyword/quick-stats?keyword={keyword}
   */
  async getKeywordQuickStats(keyword) {
    const { data } = await axiosClient.get('/api/search/keyword/quick-stats', {
      params: { keyword },
    });
    return data.data || data;
  },

  /**
   * Get co-occurring keywords (satellite trends) for a searched keyword.
   * Uses Neo4j graph traversal to find keywords that frequently appear
   * together in recent papers (last 2 years), with YoY growth rates.
   * GET /api/search/keyword/related-trends?keyword={keyword}
   */
  async getRelatedTrends(keyword) {
    const { data } = await axiosClient.get('/api/search/keyword/related-trends', {
      params: { keyword },
    });
    return data.data || data;
  },

  /**
   * Get top 5 most-cited papers for a keyword (DB-only, no external API).
   * GET /api/search/keyword/top-papers?keyword={keyword}
   */
  async getTopPapers(keyword) {
    const { data } = await axiosClient.get('/api/search/keyword/top-papers', {
      params: { keyword },
    });
    return data.data || data;
  },

  // ─── Journal APIs ─────────────────────────────────────────────────────────

  /**
   * Quick statistics for a journal — name, ISSN, publisher, impact factor,
   * quartile, total papers, total citations, avg citations, top keywords.
   * GET /api/search/journal/quick-stats?journalId={journalId}
   */
  async getJournalQuickStats(journalId) {
    const { data } = await axiosClient.get('/api/search/journal/quick-stats', {
      params: { journalId },
    });
    return data.data || data;
  },

  /**
   * Timeline data for a journal — yearly paper counts, citation counts,
   * and avg citations per paper (last 10 years).
   * GET /api/search/journal/quick-stats/timeline?journalId={journalId}
   */
  async getJournalTimeline(journalId) {
    const { data } = await axiosClient.get('/api/search/journal/quick-stats/timeline', {
      params: { journalId },
    });
    return data.data || data;
  },

  /**
   * Top 5 most-cited papers in a journal.
   * GET /api/search/journal/top-papers?journalId={journalId}
   */
  async getJournalTopPapers(journalId) {
    const { data } = await axiosClient.get('/api/search/journal/top-papers', {
      params: { journalId },
    });
    return data.data || data;
  },

  /**
   * Top authors in a journal by citation count.
   * GET /api/search/journal/top-authors?journalId={journalId}
   */
  async getJournalTopAuthors(journalId) {
    const { data } = await axiosClient.get('/api/search/journal/top-authors', {
      params: { journalId },
    });
    return data.data || data;
  },
};
