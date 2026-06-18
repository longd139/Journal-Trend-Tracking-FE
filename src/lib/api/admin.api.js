import axiosClient from '../http/axiosClient';

export const adminAPI = {
  async getAllUsers() {
    const { data } = await axiosClient.get('/api/users');
    return data; // { status, message, data: [...users], timestamp }
  },

  async updateUser(userId, payload) {
    const { data } = await axiosClient.put(`/api/users/${userId}`, payload);
    return data;
  },

  async deleteUser(userId) {
    const { data } = await axiosClient.delete(`/api/users/${userId}`);
    return data;
  },
};
