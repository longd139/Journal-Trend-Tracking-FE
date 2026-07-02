import axiosClient from '../../lib/apiClient.js';

// Module-level cache for getMyFollows to avoid N+1 calls when many
// FollowButton components mount simultaneously (e.g., paper lists).
let _followsCache = null;
let _followsCacheTs = 0;
const CACHE_TTL_MS = 30_000; // 30 seconds

export const followAPI = {
  /** POST /api/v1/follows — Follow journal/topic/keyword */
  async addFollow(body) {
    const { data } = await axiosClient.post('/api/v1/follows', body);
    // Invalidate cache so next getMyFollows fetches fresh data
    _followsCache = null;
    _followsCacheTs = 0;
    return data; // AppResponse<FollowResponse>
  },

  /** GET /api/v1/follows — Lấy danh sách follow (có cache ngắn) */
  async getMyFollows(forceRefresh = false) {
    if (!forceRefresh && _followsCache && Date.now() - _followsCacheTs < CACHE_TTL_MS) {
      return _followsCache;
    }
    const { data } = await axiosClient.get('/api/v1/follows');
    _followsCache = data;
    _followsCacheTs = Date.now();
    return data; // AppResponse<FollowResponse[]>
  },

  /** PUT /api/v1/follows/{followId}?notifyEnabled= — Toggle notification */
  async toggleNotify(followId, notifyEnabled) {
    const { data } = await axiosClient.put(
      `/api/v1/follows/${followId}`,
      {}, // empty body — notifyEnabled is a query param per backend contract
      {
        params: { notifyEnabled },
      },
    );
    // Invalidate cache so next getMyFollows fetches fresh data
    _followsCache = null;
    _followsCacheTs = 0;
    return data; // AppResponse<FollowResponse>
  },

  /** DELETE /api/v1/follows/{followId} — Unfollow */
  async unfollow(followId) {
    const { data } = await axiosClient.delete(`/api/v1/follows/${followId}`);
    // Invalidate cache so next getMyFollows fetches fresh data
    _followsCache = null;
    _followsCacheTs = 0;
    return data; // AppResponse<void>
  },
};
