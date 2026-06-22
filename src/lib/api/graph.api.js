import axiosClient from '../http/axiosClient';
import axios from 'axios';

// URL gốc cho API public (không cần JWT)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';

export const graphAPI = {
  /**
   * API 1: Tìm kiếm graph visualization cho keyword.
   * Auth required → dùng axiosClient (có JWT).
   * Gọi GET /api/graphs/keyword → backend trả về AppResponse<GraphResponse>
   * GraphResponse: { nodes: [{id, label, group, size, paperCount, searchCount, tier}], links: [{source, target, label}] }
   */
  async searchGraph(keyword, depth = 1) {
    const { data } = await axiosClient.get('/api/graphs/keyword', {
      params: { keyword, depth },
    });
    // data = { status: 200, message: "...", data: { nodes: [...], links: [...] } }
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
   * API 3: Lấy graph visualization từ Neo4j với tham số depth mở rộng.
   * Public endpoint → dùng axios thường (không cần JWT).
   * Gọi GET /api/graphs/keyword (cùng endpoint với getKeywordGraph).
   * Trả về: { nodes: [{id, label, group, size}], links: [{source, target, label}] }
   */
  async getKeywordGraphEnhanced(keyword, depth = 3) {
    const { data } = await axios.get(
      `${BASE_URL}/api/graphs/keyword`,
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