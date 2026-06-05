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
    // 1. Lấy token từ nơi bạn lưu trữ (ví dụ: localStorage, sessionStorage, hoặc state)
    const token = useAuthStore.getState().accessToken;

    // 2. Nếu có token, đính kèm vào header 'Authorization'
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Xử lý nếu có lỗi xảy ra trước khi request được gửi đi
    return Promise.reject(error);
  },
);
export default axiosClient;
