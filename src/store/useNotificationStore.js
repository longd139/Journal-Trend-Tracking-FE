import { create } from 'zustand';
import { notificationAPI } from '../features/notifications/api';
import { adminAPI } from '../features/admin/api';
import { upgradeAPI } from '../features/upgrade/api';

export const useNotificationStore = create((set) => ({
  unreadCount: 0,
  pdfPendingCount: 0,
  upgradePendingCount: 0,

  fetchUnreadCount: async () => {
    try {
      const count = await notificationAPI.getUnreadCount();
      const num =
        typeof count === 'number'
          ? count
          : count?.count ?? count?.unreadCount ?? 0;
      set({ unreadCount: num });
    } catch {
      // Silently ignore
    }
  },

  setUnreadCount: (count) => set({ unreadCount: count }),

  fetchPdfPendingCount: async () => {
    try {
      const res = await adminAPI.getPdfRequests({ status: 'pending', size: 1 });
      const payload = res?.data || res;
      const total = payload?.totalElements ?? (Array.isArray(payload) ? payload.length : 0);
      set({ pdfPendingCount: typeof total === 'number' ? total : 0 });
    } catch {
      // Silently ignore
    }
  },

  setPdfPendingCount: (count) => set({ pdfPendingCount: count }),

  fetchUpgradePendingCount: async () => {
    try {
      const res = await upgradeAPI.getAdminRequests({ status: 'PENDING', size: 1 });
      const payload = res?.data || res;
      const total = payload?.totalElements ?? (Array.isArray(payload) ? payload.length : 0);
      set({ upgradePendingCount: typeof total === 'number' ? total : 0 });
    } catch {
      // Silently ignore
    }
  },

  setUpgradePendingCount: (count) => set({ upgradePendingCount: count }),
}));
