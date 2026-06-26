import { create } from 'zustand';
import { adminAPI } from '../lib/api/admin.api';

export const useUserStore = create((set, get) => ({
  // ── State ──
  users: [],
  isLoading: false,
  error: null,
  totalPages: 0,
  currentPage: 0,

  // ── Fetch from API ──
  fetchUsers: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminAPI.getUsers(params);
      const pageData = response?.data;
      const users = (pageData?.content || []).map((u) => ({
        userId: u.userId,
        fullName: u.fullName || 'Unknown',
        email: u.email || '',
        institution: u.institution || '',
        roleName: u.roleName || 'academic_user',
        isActive: u.isActive ?? true,
        createdAt: u.createdAt || '',
        lastLoginAt: u.lastLoginAt || '',
        usage: u.usage || {},
      }));
      set({
        users,
        isLoading: false,
        totalPages: pageData?.totalPages || 0,
        currentPage: pageData?.number || 0,
      });
    } catch (err) {
      console.error('Failed to fetch users:', err);
      set({ error: err.response?.data?.message || 'Failed to load users', isLoading: false });
    }
  },

  // ── Update user status (active/inactive) ──
  updateUserStatus: async (userId, active) => {
    try {
      await adminAPI.updateUserStatus(userId, active);
      set((state) => ({
        users: state.users.map((u) => (u.userId === userId ? { ...u, isActive: active } : u)),
      }));
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  },

  // ── Update user role ──
  updateUserRole: async (userId, roleName) => {
    try {
      await adminAPI.updateUserRole(userId, roleName);
      set((state) => ({
        users: state.users.map((u) => (u.userId === userId ? { ...u, roleName } : u)),
      }));
    } catch (err) {
      console.error('Failed to update user role:', err);
    }
  },

  // ── Combined update (status + role) — calls separate BE APIs ──
  updateUser: async (userId, updates) => {
    const errors = [];
    if (updates.isActive !== undefined) {
      try {
        await adminAPI.updateUserStatus(userId, updates.isActive);
        set((state) => ({
          users: state.users.map((u) => (u.userId === userId ? { ...u, isActive: updates.isActive } : u)),
        }));
      } catch (err) { errors.push('status'); }
    }
    if (updates.roleName !== undefined) {
      try {
        await adminAPI.updateUserRole(userId, updates.roleName);
        set((state) => ({
          users: state.users.map((u) => (u.userId === userId ? { ...u, roleName: updates.roleName } : u)),
        }));
      } catch (err) { errors.push('role'); }
    }
    if (errors.length) {
      throw new Error(`Failed to update: ${errors.join(', ')}`);
    }
  },

  // ── Delete (deactivate) user ──
  deleteUser: async (userId) => {
    try {
      await adminAPI.updateUserStatus(userId, false);
      set((state) => ({
        users: state.users.map((u) => (u.userId === userId ? { ...u, isActive: false } : u)),
      }));
    } catch (err) {
      console.error('Failed to deactivate user:', err);
    }
  },

  deleteUsers: async (userIds) => {
    for (const id of userIds) {
      try { await adminAPI.updateUserStatus(id, false); } catch {}
    }
    set((state) => ({
      users: state.users.map((u) => (userIds.has(u.userId) ? { ...u, isActive: false } : u)),
    }));
  },

  // ── Local-only helpers (for optimistic updates) ──
  addUser: async (formData) => {
    const tempUser = {
      userId: `temp-${Date.now()}`,
      fullName: formData.fullName,
      email: formData.email,
      institution: formData.institution || '',
      roleName: formData.role,
      isActive: formData.isActive ?? true,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ users: [tempUser, ...state.users] }));
  },

  bulkUpdate: async (userIds, updates) => {
    for (const id of userIds) {
      try {
        if (updates.roleName) await adminAPI.updateUserRole(id, updates.roleName);
        if (updates.isActive !== undefined) await adminAPI.updateUserStatus(id, updates.isActive);
      } catch {}
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
