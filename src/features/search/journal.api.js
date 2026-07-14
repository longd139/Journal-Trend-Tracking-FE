import axiosClient from '../../lib/apiClient.js';

export const journalAPI = {
  /**
   * Journal name autocomplete — OpenAlex-powered suggestions.
   * GET /api/search/journal/suggest?query={partial_name}
   * Auth: Bearer Token required
   * Response: { status, message, data: [{ id, name, issn, publisher, totalWorks, totalCitations, quartile }] }
   */
  async getSuggest(query) {
    const { data } = await axiosClient.get('/api/search/journal/suggest', {
      params: { query },
    });
    return data.data || data;
  },

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

  /**
   * Search journals by name (fuzzy, case-insensitive LIKE).
   * GET /api/v1/journals/search?q={name}&size=10
   * Returns journals with quartile, impactFactor, issn, publisher.
   */
  async searchJournals(q, size = 10) {
    const { data } = await axiosClient.get('/api/v1/journals/search', {
      params: { q, size },
    });
    return data.data || data;
  },
};
