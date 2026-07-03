import axiosClient from '../../lib/apiClient.js';

/**
 * Bookmark Collections API — CRUD for organizing bookmarks into folders.
 * Endpoints: /api/v1/bookmark-collections
 */
export const collectionsAPI = {
  /** POST /api/v1/bookmark-collections — Create a new collection */
  async createCollection(body) {
    const { data } = await axiosClient.post('/api/v1/bookmark-collections', body);
    return data; // AppResponse<BookmarkCollection>
  },

  /** GET /api/v1/bookmark-collections — List all collections for current user */
  async getCollections() {
    const { data } = await axiosClient.get('/api/v1/bookmark-collections');
    return data; // AppResponse<BookmarkCollection[]>
  },

  /** GET /api/v1/bookmark-collections/{collectionId} — Get detail + papers inside */
  async getCollection(collectionId) {
    const { data } = await axiosClient.get(`/api/v1/bookmark-collections/${collectionId}`);
    return data; // AppResponse<BookmarkCollection>
  },

  /** PUT /api/v1/bookmark-collections/{collectionId} — Update collection (rename, etc.) */
  async updateCollection(collectionId, body) {
    const { data } = await axiosClient.put(`/api/v1/bookmark-collections/${collectionId}`, body);
    return data; // AppResponse<BookmarkCollection>
  },

  /** DELETE /api/v1/bookmark-collections/{collectionId} — Delete a collection */
  async deleteCollection(collectionId) {
    const { data } = await axiosClient.delete(`/api/v1/bookmark-collections/${collectionId}`);
    return data; // AppResponse<void>
  },
};
