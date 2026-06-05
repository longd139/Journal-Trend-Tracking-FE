import axiosClient from '../http/axiosClient';

export const authAPI = {
  async login({ email, password }) {
    const { data } = await axiosClient.post('/api/auth/login', {
      email,
      password,
    });
    // console.log(data);
    return {
      accessToken: data.accessToken,
      role: data.user.roleName,
    };
  },
  async register(userData) {
    const { data } = await axiosClient.post('/api/auth/register', userData);

    // backend trả: {message, result:{access_token, refresh_token}}
    // fe nhận : {accessToken,refreshToken}
    return {
      accessToken: data.accessToken,
    };
  },
  async forgotPassword({ email }) {
    const { data } = await axiosClient.post('api/auth/forgot-password', {
      email,
    });
    // response: { status, message, errors, timestamp }
    return data;
  },
  async resetPassword({ token, newPassword }) {
    const { data } = await axiosClient.post('api/auth/reset-password', {
      token,
      newPassword,
    });
    // response: { status, message, timestamp }
    return data;
  },
};
