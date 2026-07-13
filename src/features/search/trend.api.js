import axiosClient from '../../lib/apiClient.js';

export const trendAPI = {
  /**
   * Fetch the top 5 weekly breakout research topics with 6-month
   * citation sparkline data, growth classification labels, total
   * paper counts, and growth rates.
   *
   * GET /api/public/trends/weekly-breakout
   *
   * Response shape (5 items):
   * {
   *   keywordText: string,     // e.g. "Artificial Intelligence"
   *   sparkline: number[],     // 6 monthly citation counts (oldest → current)
   *   growthLabel: string,     // e.g. "Leading", "Surging", "Newcomer"
   *   totalPapers: number,     // total paper count for this topic
   *   growthRate: number       // growth percentage (nullable)
   * }
   */
  async getWeeklyBreakout() {
    const { data } = await axiosClient.get('/api/public/trends/weekly-breakout');
    return data.data || data;
  },

  /**
   * Fetch trending keywords curated from the database (refreshed
   * every 12 hours via OpenAlex sync). Falls back to a curated
   * default list when the DB is empty.
   *
   * GET /api/public/keywords/trending?limit=10
   *
   * Response shape (up to 10 items):
   * {
   *   keywordText: string,     // e.g. "Artificial Intelligence"
   *   paperCount: number,      // recent paper count from OpenAlex
   *   source: string,          // data source ("openalex" or "default")
   *   displayOrder: number     // 1-based display ordering
   * }
   */
  async getTrendingKeywords(limit = 10) {
    const { data } = await axiosClient.get('/api/public/keywords/trending', {
      params: { limit },
    });
    return data.data || data;
  },

  /**
   * Keyword autocomplete — returns keyword suggestions matching the
   * given prefix (min 2 chars), ordered by paper count.
   *
   * GET /api/public/keywords/suggest?q=mach&limit=8
   *
   * Response shape: string[] of keyword texts, e.g.
   * ["machine learning", "machine", "mach number", ...]
   */
  async suggestKeywords(q, limit = 8) {
    const { data } = await axiosClient.get('/api/public/keywords/suggest', {
      params: { q, limit },
    });
    return data.data || data;
  },
};
