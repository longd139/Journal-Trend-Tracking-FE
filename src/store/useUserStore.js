import { create } from 'zustand';
import { adminAPI } from '../lib/api/admin.api';

export const useUserStore = create((set, get) => ({
  // ── State ──
  users: [],
  isLoading: false,
  error: null,

  // ── Fetch from API ──
  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminAPI.getAllUsers();
      // API returns { status, message, data: [...], timestamp }
      const users = (response.data || []).map((u) => ({
        userId: u.userId,
        fullName: u.fullName || 'Unknown',
        email: u.email || '',
        institution: u.institution || '',
        avatarUrl: u.avatarUrl || '',
        roleName: u.roleName || 'ACADEMIC',
        isActive: u.isActive ?? true,
        remainingSearches: u.remainingSearches ?? 0,
        remainingViews: u.remainingViews ?? 0,
        createdAt: u.createdAt || '',
      }));
      set({ users, isLoading: false });
    } catch (err) {
      console.error('Failed to fetch users:', err);
      set({ error: err.response?.data?.message || 'Failed to load users', isLoading: false });
    }
  },

  // ── CRUD (calls API then updates local state) ──
  addUser: async (formData) => {
    // Note: API endpoint for creating users may differ (/api/users POST)
    // For now, optimistically add to local state; backend integration TBD
    const tempUser = {
      userId: `temp-${Date.now()}`,
      fullName: formData.fullName,
      email: formData.email,
      institution: formData.institution || '',
      avatarUrl: '',
      roleName: formData.role,
      isActive: formData.isActive ?? true,
      remainingSearches: 0,
      remainingViews: 0,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ users: [tempUser, ...state.users] }));
  },

  updateUser: async (userId, updates) => {
    try {
      await adminAPI.updateUser(userId, updates);
      set((state) => ({
        users: state.users.map((u) => (u.userId === userId ? { ...u, ...updates } : u)),
      }));
    } catch (err) {
      console.error('Failed to update user:', err);
      // Still update locally for demo
      set((state) => ({
        users: state.users.map((u) => (u.userId === userId ? { ...u, ...updates } : u)),
      }));
    }
  },

  deleteUser: async (userId) => {
    try {
      await adminAPI.deleteUser(userId);
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
    set((state) => ({ users: state.users.filter((u) => u.userId !== userId) }));
  },

  deleteUsers: async (userIds) => {
    for (const id of userIds) {
      try { await adminAPI.deleteUser(id); } catch {}
    }
    set((state) => ({ users: state.users.filter((u) => !userIds.has(u.userId)) }));
  },

  bulkUpdate: async (userIds, updates) => {
    for (const id of userIds) {
      try { await adminAPI.updateUser(id, updates); } catch {}
    }
    set((state) => ({
      users: state.users.map((u) => (userIds.has(u.userId) ? { ...u, ...updates } : u)),
    }));
  },

  // ── Helpers ──
  getFilteredUsers: (search, roleFilter, statusFilter) => {
    const { users } = get();
    return users.filter((u) => {
      const matchSearch = !search ||
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.institution?.toLowerCase().includes(search.toLowerCase());
      const matchRole = !roleFilter || roleFilter === 'all' || u.roleName === roleFilter;
      const activeStatus = u.isActive ? 'active' : 'inactive';
      const matchStatus = !statusFilter || statusFilter === 'all' || activeStatus === statusFilter.toLowerCase();
      return matchSearch && matchRole && matchStatus;
    });
  },
}));
