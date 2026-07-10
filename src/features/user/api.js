import axiosClient from '../../lib/apiClient.js';

export const userAPI = {
  async profile() {
    const { data } = await axiosClient.get('/api/users/me');
    // console.log(data.data);
    // return {
    //   // username: data.username,
    //   // institution: data.institution,
    //   // email: data.email,
    // };
    return data.data;
  },
  async updateProfile(formData) {
    // Sử dụng axiosClient đã có interceptor
    const { data } = await axiosClient.put('/api/users/me', formData);
    return data; // Bạn có thể return data.data nếu API của bạn bọc dữ liệu trong trường data
  },

  async updateLanguagePreference(language) {
    const { data } = await axiosClient.put('/api/users/me/language', { language });
    return data;
  },

  async changePassword({ currentPassword, newPassword }) {
    const { data } = await axiosClient.put('/api/users/me/password', {
      currentPassword,
      newPassword,
    });
    return data;
  },

  /** POST /api/v1/users/me/background — Upload background image (max 5MB, image/*) */
  async uploadBackground(file) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await axiosClient.post('/api/v1/users/me/background', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data || data;
  },
};
