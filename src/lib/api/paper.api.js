import axiosClient from '../http/axiosClient';

export const paperAPI = {
  /**
   * Lấy danh sách bài báo và tìm kiếm nâng cao từ Swagger
   * @param {Object} params - Các tham số lọc truyền lên URL
   * @param {string} params.search - Từ khóa tìm kiếm chính (title, abstract, author...)
   * @param {number} params.startYear - Năm bắt đầu
   * @param {number} params.endYear - Năm kết thúc
   * @param {string} params.field - Lĩnh vực nghiên cứu
   * @param {number} params.minCitations - Số trích dẫn tối thiểu
   * @param {boolean} params.openAccess - Trạng thái Open Access (true/false)
   */
  async search(params = {}) {
    // Gọi phương thức GET đến endpoint /api/papers (hoặc /papers tùy cấu hình BaseURL của Swagger)
    // params sẽ tự động chuyển hóa thành dạng: /api/papers?search=abc&startYear=2017
    const { data } = await axiosClient.get('/api/v1/papers', { params });
    
    // Trả về dữ liệu bài báo thu được từ backend
    return data.data || data; 
  },
};