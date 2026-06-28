import axiosClient from '../http/axiosClient';

export const followAPI = {
  /** POST /api/v1/follows — Follow journal/topic/keyword */
  async addFollow(body) {
    const { data } = await axiosClient.post('/api/v1/follows', body);
    return data; // AppResponse<FollowResponse>
  },

  /** GET /api/v1/follows — Lấy danh sách follow */
  async getMyFollows() {
    const { data } = await axiosClient.get('/api/v1/follows');
    return data; // AppResponse<FollowResponse[]>
  },

  /** PUT /api/v1/follows/{followId}?notifyEnabled= — Toggle notification */
  async toggleNotify(followId, notifyEnabled) {
    const { data } = await axiosClient.put(`/api/v1/follows/${followId}`, null, {
      params: { notifyEnabled },
    });
    return data; // AppResponse<FollowResponse>
  },

  /** DELETE /api/v1/follows/{followId} — Unfollow */
  async unfollow(followId) {
    const { data } = await axiosClient.delete(`/api/v1/follows/${followId}`);
    return data; // AppResponse<void>
  },
};
