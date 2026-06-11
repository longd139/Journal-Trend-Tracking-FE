import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';

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
export default axiosClient;
