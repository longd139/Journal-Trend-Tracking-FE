import axiosClient from '../../lib/apiClient.js';

export const journalAPI = {
  /**
   * Lấy danh sách tất cả ngành nghiên cứu (field) kèm top journals.
   * GET /api/v1/journals/categories
   * Response: { status, message, data: [{ fieldId, fieldName, description, journalCount, topJournals }], timestamp }
   */
  async getCategories() {
    const { data } = await axiosClient.get('/api/v1/journals/categories');
    return data.data || data;
  },

  /**
   * Lấy danh sách top journals của một ngành cụ thể.
   * GET /api/v1/journals/fields/{fieldId}
   * Response: { status, message, data: { fieldId, fieldName, description, journalCount, topJournals }, timestamp }
   */
  async getByField(fieldId) {
    const { data } = await axiosClient.get(`/api/v1/journals/fields/${fieldId}`);
    return data.data || data;
  },
};
