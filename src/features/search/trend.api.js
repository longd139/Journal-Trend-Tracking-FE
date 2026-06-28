import axios from 'axios';

/**
 * Public trend endpoints — no authentication required.
 * Uses a plain axios instance (not axiosClient) to avoid
 * attaching the Authorization header for public endpoints.
 */
const publicAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

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
    const { data } = await publicAxios.get('/api/public/trends/weekly-breakout');
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
    const { data } = await publicAxios.get('/api/public/keywords/trending', {
      params: { limit },
    });
    return data.data || data;
  },
};
