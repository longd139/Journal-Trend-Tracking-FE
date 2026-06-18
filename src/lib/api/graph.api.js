import axiosClient from '../http/axiosClient';
import axios from 'axios';

// URL gốc cho API public (không cần JWT)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';

export const graphAPI = {
  /**
   * API 1: Search papers + pipeline populate Neo4j.
   * Auth required → dùng axiosClient (có JWT).
   * Trả về: { nodes: [{id, label, group, size, paperCount, searchCount, tier}], links: [{source, target, label}] }
   * Field `tier` dùng để phân tầng đồ thị (0 = core, 1 = layer 1, …).
   */
  async searchGraph(keyword, depth = 1) {
    const { data } = await axiosClient.get('/api/v1/papers/search/graph', {
      params: { keyword, depth },
    });
    return data.data;
  },

  /**
   * API 2: Lấy graph visualization trực tiếp từ Neo4j.
   * Public endpoint → dùng axios thường (không cần JWT).
   * Trả về: { nodes: [{id, label, group, size}], links: [{source, target, label}] }
   */
  async getKeywordGraph(keyword) {
    const { data } = await axios.get(`${BASE_URL}/api/graphs/keyword`, {
      params: { keyword },
    });
    return data.data; // { nodes: [...], links: [...] }
  },

  /**
   * API 3: Lấy graph visualization từ Neo4j với enhanced endpoint.
   * Public endpoint → dùng axios thường (không cần JWT).
   * Trả về: { nodes: [{id, label, group, size}], links: [{source, target, label}] }
   */
  async getKeywordGraphEnhanced(keyword, depth = 3) {
    const { data } = await axios.get(
      `${BASE_URL}/api/graphs/keyword/enhanced`,
      {
        params: { keyword, depth },
      },
    );
    return data.data; // { nodes: [...], links: [...] }
  },
  /**
   * API 4: Lấy danh sách từ khóa hot (public endpoint).
   * GET /api/public/keywords/hot?limit=10
   * Trả về: { status, message, data: [{ keywordText, searchCount }], timestamp }
   */
  async getHotKeywords(limit = 10) {
    const { data } = await axios.get(`${BASE_URL}/api/public/keywords/hot`, {
      params: { limit },
    });
    return data.data; // [{ keywordText, searchCount }]
  },
};