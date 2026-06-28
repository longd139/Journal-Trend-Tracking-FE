import axios from 'axios';
import { useAuthStore } from '../features/user/store.js';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    // 'ngrok-skip-browser-warning': 'true', // Thêm dòng này vào!
  },
  // withCredentials: true,
});
// Thêm Request Interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // 1. Attach auth token
    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 2. Attach preferred language header
    const preferredLanguage = localStorage.getItem('preferredLanguage');
    if (preferredLanguage) {
      config.headers['Accept-Language'] = preferredLanguage;
    }

    return config;
  },
  (error) => {
    // Xử lý nếu có lỗi xảy ra trước khi request được gửi đi
    return Promise.reject(error);
  },
);

// Thêm Response Interceptor để kiểm tra API-level errors (status field trong response body)
// Backend convention: AppResponse.success() → status: 200; ErrorResponse → HTTP error status
axiosClient.interceptors.response.use(
  (response) => {
    const body = response.data;
    // Nếu body có field "status" và không phải 200 → business error (ném ra để caller catch)
    if (body && typeof body.status === 'number' && body.status !== 200) {
      const err = new Error(body.message || 'API error');
      err.response = response;
      err.apiStatus = body.status;
      return Promise.reject(err);
    }
    return response;
  },
  (error) => {
    // Trả về message từ ErrorResponse body nếu có
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
