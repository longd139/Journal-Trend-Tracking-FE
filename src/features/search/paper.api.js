import axiosClient from '../../lib/apiClient.js';

export const paperAPI = {
  /**
   * Get reading history for current user.
   * GET /api/v1/reading-history?limit=20
   */
  async getReadingHistory(limit = 20) {
    const { data } = await axiosClient.get('/api/v1/reading-history', {
      params: { limit },
    });
    return data; // AppResponse<List<ReadingHistoryResponse>>
  },

  /**
   * Lấy danh sách bài báo có sẵn (chỉ dùng để hiển thị dữ liệu ban đầu).
   * Chỉ yêu cầu 2 param: page, size.
   * GET /api/v1/papers?page=0&size=5
   */
  async search(params = {}) {
    const { data } = await axiosClient.get('/api/v1/papers', {
      params: {
        page: params.page,
        size: params.size,
        sortBy: params.sortBy || 'date',
        sortDirection: params.sortDirection || 'desc',
      },
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
        size: body.size ?? 10,
        sortBy: body.sortBy || 'relevance',
        sortDirection: body.sortDirection || 'desc',
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

  /**
   * Lấy chi tiết một paper theo ID.
   * GET /api/v1/papers/{paperId}
   */
  async getPaperById(paperId) {
    const { data } = await axiosClient.get(`/api/v1/papers/${paperId}`);
    return data.data || data;
  },

  // ─── Journal APIs ─────────────────────────────────────────────────────────

  /**
   * Quick statistics for a journal — name, ISSN, publisher, impact factor,
   * quartile, total papers, total citations, avg citations, top keywords.
   * GET /api/search/journal/quick-stats?keyword={keyword}
   */
  async getJournalQuickStats(keyword) {
    const { data } = await axiosClient.get('/api/search/journal/quick-stats', {
      params: { keyword },
    });
    return data.data || data;
  },

  /**
   * Timeline data for a journal — yearly paper counts, citation counts,
   * and avg citations per paper (last 10 years).
   * GET /api/search/journal/quick-stats/timeline?keyword={keyword}
   */
  async getJournalTimeline(keyword) {
    const { data } = await axiosClient.get('/api/search/journal/quick-stats/timeline', {
      params: { keyword },
    });
    return data.data || data;
  },

  /**
   * Top 5 most-cited papers in a journal.
   * GET /api/search/journal/top-papers?keyword={keyword}
   */
  async getJournalTopPapers(keyword) {
    const { data } = await axiosClient.get('/api/search/journal/top-papers', {
      params: { keyword },
    });
    return data.data || data;
  },

  /**
   * Top authors in a journal by citation count.
   * GET /api/search/journal/top-authors?keyword={keyword}
   */
  async getJournalTopAuthors(keyword) {
    const { data } = await axiosClient.get('/api/search/journal/top-authors', {
      params: { keyword },
    });
    return data.data || data;
  },

  // ─── Advanced Search APIs ──────────────────────────────────────────────────

  /**
   * Advanced filtering — by year range, research field, min citations, open access.
   * GET /api/v1/papers/filter/advanced
   */
  async searchPapersAdvanced(params = {}) {
    const { data } = await axiosClient.get('/api/v1/papers/filter/advanced', {
      params: {
        query: params.query || '',
        startYear: params.startYear || '',
        endYear: params.endYear || '',
        fields: params.fields?.join(',') || '',
        minCitations: params.minCitations || '',
        openAccess: params.openAccess || false,
        page: params.page ?? 0,
        size: params.size ?? 20,
        sortBy: params.sortBy || 'relevance',
        sortDirection: params.sortDirection || 'desc',
      },
    });
    return data; // AppResponse<Page<Paper>>
  },

  /**
   * Search papers published in a specific journal.
   * GET /api/v1/papers/search/journal
   */
  async searchPapersByJournal(params = {}) {
    const { data } = await axiosClient.get('/api/v1/papers/search/journal', {
      params: {
        journalName: params.journalName || '',
        page: params.page ?? 0,
        size: params.size ?? 20,
        sortBy: params.sortBy || 'relevance',
        sortDirection: params.sortDirection || 'desc',
      },
    });
    return data; // AppResponse<Page<Paper>>
  },

  /**
   * Search papers written by a specific author.
   * GET /api/v1/papers/search/author
   */
  async searchPapersByAuthor(params = {}) {
    const { data } = await axiosClient.get('/api/v1/papers/search/author', {
      params: {
        authorName: params.authorName || '',
        page: params.page ?? 0,
        size: params.size ?? 20,
        sortBy: params.sortBy || 'relevance',
        sortDirection: params.sortDirection || 'desc',
      },
    });
    return data; // AppResponse<Page<Paper>>
  },

  // ─── PDF Request ───────────────────────────────────────────────────────────

  /**
   * Request full-text PDF access for a paper.
   * POST /api/v1/papers/{paperId}/pdf-requests
   */
  async requestPdf(paperId) {
    const { data } = await axiosClient.post(`/api/v1/papers/${paperId}/pdf-requests`);
    return data; // AppResponse<{ status, message }>
  },
  // ─── Citation Export APIs ──────────────────────────────────────────────────

  /**
   * Export citation for a single paper (server-generated).
   * GET /api/v1/papers/{paperId}/citation?format=bibtex
   * Returns text/plain blob — caller reads as text or downloads as file.
   * Supported formats: bibtex, ris, apa, mla
   */
  async getCitation(paperId, format = 'bibtex') {
    const response = await axiosClient.get(`/api/v1/papers/${paperId}/citation`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data; // Blob
  },

  /**
   * Bulk export citations for multiple papers.
   * POST /api/v1/papers/citations/export?format=bibtex
   * Body: JSON array of paper UUID strings
   * Returns text/plain blob with concatenated citations.
   */
  async exportCitations(paperIds, format = 'bibtex') {
    const response = await axiosClient.post('/api/v1/papers/citations/export', paperIds, {
      params: { format },
      responseType: 'blob',
    });
    return response.data; // Blob
  },
};
