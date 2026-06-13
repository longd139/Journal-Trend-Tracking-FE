import axiosClient from '../http/axiosClient';
import axios from 'axios';

// URL gốc cho API public (không cần JWT)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const graphAPI = {
  /**
   * API 1: Search papers + pipeline populate Neo4j.
   * Auth required → dùng axiosClient (có JWT).
   * Trả về: { papers, totalElements, currentPage, ... }
   */
  async searchGraph(keyword) {
    const { data } = await axiosClient.get('/api/v1/papers/search/graph', {
      params: { keyword },
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
};
