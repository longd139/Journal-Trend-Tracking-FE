import axiosClient from '../http/axiosClient';

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
};
