import axiosClient from '../../lib/apiClient.js';

export const authAPI = {
  async login({ email, password }) {
    const { data } = await axiosClient.post('/api/auth/login', {
      email,
      password,
    });
    // console.log(data);
    return {
      accessToken: data.data.accessToken,
      role: data.data.user.roleName,
    };
  },
  
  async register(userData) {
    const { data } = await axiosClient.post('/api/auth/register', userData);

    // backend trả: {message, result:{access_token, refresh_token}}
    // fe nhận : {accessToken,refreshToken}
    return {
      accessToken: data.data.accessToken,
    };
  },

  // ==========================================
  // MỚI THÊM: Quên mật khẩu & Đặt lại mật khẩu
  // ==========================================
  
  async forgotPassword({ email }) {
    // Truyền đúng payload { email } như BE yêu cầu
    const { data } = await axiosClient.post('/api/auth/forgot-password', {
      email,
    });
    // Trả về toàn bộ response { status, message, data, timestamp }
    return data;
  },

  async resetPassword({ token, newPassword }) {
    // Hàm này sẽ dùng bên file ResetPasswordPage.jsx
    const { data } = await axiosClient.post('/api/auth/reset-password', {
      token,
      newPassword, // Br chú ý check lại Swagger của BE xem trường này là 'newPassword' hay 'password' nhé
    });
    return data;
  },

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================
  async googleLogin(credential) {
    const { data } = await axiosClient.post('/api/auth/google-v2', {
      credential,
    });
    return {
      accessToken: data.data.accessToken,
      role: data.data.user.roleName,
    };
  },

  // ==========================================
  // EMAIL VERIFICATION
  // ==========================================
  async verifyEmail(token) {
    const { data } = await axiosClient.get('/api/auth/verify-email', {
      params: { token },
    });
    return data;
  },

  async resendVerification(email) {
    const { data } = await axiosClient.post('/api/auth/resend-verification', {
      email,
    });
    return data;
  },
};