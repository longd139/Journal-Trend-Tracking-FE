import { create } from 'zustand';

/**
 * Tracks monthly activity counters client-side so they update instantly
 * without waiting for a full overview re-fetch.
 */
const useActivityStore = create((set, get) => ({
  papersViewed: 0,
  bookmarksThisMonth: 0,
  searchesThisMonth: 0,

  /** Seed counters from API response on initial load */
  initFromApi: ({ papersViewed, bookmarksThisMonth, searchesThisMonth }) => {
    set({
      papersViewed: papersViewed ?? 0,
      bookmarksThisMonth: bookmarksThisMonth ?? 0,
      searchesThisMonth: searchesThisMonth ?? 0,
    });
  },

  incrementPapersViewed: () => set((s) => ({ papersViewed: s.papersViewed + 1 })),
  incrementBookmarks: () => set((s) => ({ bookmarksThisMonth: s.bookmarksThisMonth + 1 })),
  incrementSearches: () => set((s) => ({ searchesThisMonth: s.searchesThisMonth + 1 })),
}));

export default useActivityStore;
