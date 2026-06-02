import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';

export const useAuthStore = create(
  devtools(
    persist(
      (set) => ({
        // Initial state (2 prop muốn lưu)
        accessToken: null,
        refreshToken: null,

        // Actions
        setTokens: (access) => set({ accessToken: access }),

        clearTokens: () => set({ accessToken: null }),
      }),
      {
        // Tên key sẽ lưu dưới localStorage.
        // Gợi ý: Bạn nên đổi "shopping-card-auth" thành "scitrack-auth" cho đúng với project hiện tại
        name: 'Journal-Tracking-System',
        storage: createJSONStorage(() => localStorage),
      },
    ),
  ),
);
