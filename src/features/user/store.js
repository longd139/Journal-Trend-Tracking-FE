import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';

export const useAuthStore = create(
  devtools(
    persist(
      (set) => ({
        // Initial state
        accessToken: null,
        refreshToken: null,
        preferredLanguage: null,
        user: null,
        backgroundUrl: null,
        backgroundColor: null,

        // Actions
        setTokens: (access) => set({ accessToken: access }),

        setPreferredLanguage: (lang) => set({ preferredLanguage: lang }),

        setUser: (user) => set({ user }),

        updateUser: (partial) =>
          set((state) => ({ user: { ...state.user, ...partial } })),

        setBackground: (url) => set({ backgroundUrl: url }),

        setBackgroundColor: (color) => set({ backgroundColor: color }),

        clearTokens: () => set({ accessToken: null }),
      }),
      {
        // Tên key sẽ lưu dưới localStorage.
        // Gợi ý: Bạn nên đổi "shopping-card-auth" thành "scitrack-auth" cho đúng với project hiện tại
        name: 'Journal-Tracking-System',
        storage: createJSONStorage(() => localStorage),
        // Chỉ persist tokens & language, không persist user (user được fetch mới mỗi session)
        partialize: (state) => ({
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          preferredLanguage: state.preferredLanguage,
          backgroundUrl: state.backgroundUrl,
          backgroundColor: state.backgroundColor,
        }),
      },
    ),
  ),
);
