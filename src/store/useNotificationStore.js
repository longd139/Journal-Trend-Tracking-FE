import { create } from 'zustand';
import { notificationAPI } from '../features/notifications/api';
import { adminAPI } from '../features/admin/api';

export const useNotificationStore = create((set) => ({
  unreadCount: 0,
  pdfPendingCount: 0,

  fetchUnreadCount: async () => {
    try {
      const count = await notificationAPI.getUnreadCount();
      // API may return a number directly or an object with count field
      const num =
        typeof count === 'number'
          ? count
          : count?.count ?? count?.unreadCount ?? 0;
      set({ unreadCount: num });
    } catch {
      // Silently ignore — don't break the UI if this endpoint fails
    }
  },

  setUnreadCount: (count) => set({ unreadCount: count }),

  fetchPdfPendingCount: async () => {
    try {
      const res = await adminAPI.getPdfRequests({ status: 'pending', size: 1 });
      // Spring Page: { totalElements } or AppResponse wrapping it
      const payload = res?.data || res;
      const total = payload?.totalElements ?? (Array.isArray(payload) ? payload.length : 0);
      set({ pdfPendingCount: typeof total === 'number' ? total : 0 });
    } catch {
      // Silently ignore
    }
  },

  setPdfPendingCount: (count) => set({ pdfPendingCount: count }),
}));
