import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search, X, RefreshCw, Building2, Users, UserCheck, UserX,
  Shield, Eye, AlertTriangle, ChevronLeft, ChevronRight,
  ArrowUpDown, CheckCircle2, SlidersHorizontal, Mail,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../store/useUserStore';

/* ═══════════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════════ */
const ROLE_LABEL = {
  'academic_user': 'Academic',
  'researcher': 'Researcher',
  'admin': 'Admin',
};
const DISPLAY_ROLE = (role) => ROLE_LABEL[role] || role;
const CHANGEABLE_ROLES = ['academic_user', 'researcher', 'admin'];
const PAGE_SIZE = 8;

const avatarGradient = (i) => {
  const g = [
    ['#6366f1', '#8b5cf6'],
    ['#06b6d4', '#3b82f6'],
    ['#f59e0b', '#ef4444'],
    ['#10b981', '#06b6d4'],
  ];
  return g[i % 4];
};

const roleBadgeStyle = (role) => {
  const m = {
    'admin': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'researcher': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'academic_user': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  };
  return m[role] || m['academic_user'];
};

/* ═══════════════════════════════════════════════════════════════════════════
   Shared micro-components
   ═══════════════════════════════════════════════════════════════════════════ */
function StatusBadge({ isActive, size = 'sm' }) {
  const s = size === 'lg' ? 'px-2.5 py-1 text-[11px]' : 'px-2 py-0.5 text-[9px]';
  const cls = isActive
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    : 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  return (
    <span className={`${s} rounded-md font-bold uppercase tracking-wider border ${cls} transition-colors`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

function RoleBadge({ roleName }) {
  return (
    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${roleBadgeStyle(roleName)}`}>
      {DISPLAY_ROLE(roleName)}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color, change }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 group"
    >
      {/* hover gradient reveal */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at top right, ${color}, transparent 70%)` }}
      />
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="p-2 rounded-xl transition-colors group-hover:bg-white/[0.04]"
              style={{ color, opacity: 0.5 }}
            >
              <Icon size={18} />
            </div>
            <p className="text-[12px] font-medium text-slate-400 truncate">{label}</p>
          </div>
          <div className="flex items-baseline gap-3">
            <motion.p
              key={value}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[28px] font-bold leading-none text-white tracking-tight"
            >
              {value}
            </motion.p>
            {change !== undefined && (
              <span className={`text-[12px] font-semibold ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   View User Modal
   ═══════════════════════════════════════════════════════════════════════════ */
function ViewUserModal({ user, onClose }) {
  const rows = [
    { label: 'Email', value: user.email || 'N/A', icon: Mail, color: '#94a3b8' },
    { label: 'Institution', value: user.institution || 'N/A', icon: Building2, color: '#a78bfa' },
    { label: 'Remaining Searches', value: user.remainingSearches ?? 'N/A', icon: Search, color: '#60a5fa' },
    { label: 'Remaining Views', value: user.remainingViews ?? 'N/A', icon: Eye, color: '#34d399' },
    { label: 'Joined', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A', icon: CheckCircle2, color: '#fbbf24' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#0d0d0d] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="relative px-6 pt-6 pb-5 border-b border-white/[0.04]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2.5">
              <span className="w-1.5 h-5 rounded-full bg-indigo-400" />
              User Details
            </h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.04] text-slate-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black text-white shrink-0"
              style={{ background: `linear-gradient(135deg, ${avatarGradient(0)[0]}, ${avatarGradient(0)[1]})` }}
            >
              {user.fullName?.split(' ').pop()?.[0] || '?'}
            </div>
            <div>
              <h4 className="text-[15px] font-bold text-white">{user.fullName}</h4>
              <div className="flex items-center gap-2 mt-1">
                <RoleBadge roleName={user.roleName} />
                <StatusBadge isActive={user.isActive} />
              </div>
            </div>
          </div>
        </div>
        {/* body */}
        <div className="px-6 py-4 space-y-1">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors group">
              <div className="p-1.5 rounded-lg bg-white/[0.02] group-hover:bg-white/[0.04] transition-colors" style={{ color: r.color }}>
                <r.icon size={14} />
              </div>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider w-36 shrink-0">{r.label}</span>
              <span className="text-[13px] text-slate-200 font-medium truncate ml-auto text-right">{r.value}</span>
            </div>
          ))}
        </div>
        <div className="px-6 pb-5 pt-1" />
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Confirm Admin Modal
   ═══════════════════════════════════════════════════════════════════════════ */
function ConfirmAdminModal({ user, loading, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-sm rounded-2xl border border-white/[0.06] bg-[#0d0d0d] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-rose-400" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-white">Promote to Admin</h3>
              <p className="text-[13px] text-slate-400 mt-2 leading-relaxed">
                Grant <span className="text-white font-semibold">{user?.fullName}</span> full administrator access, including user management, system configuration, and data source control.
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-2.5 justify-end">
          <button onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-400 hover:bg-white/[0.04] hover:text-white transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-rose-500 hover:bg-rose-600 flex items-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading && <RefreshCw size={13} className="animate-spin" />}
            Yes, Make Admin
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Role Popover
   ═══════════════════════════════════════════════════════════════════════════ */
function RolePopover({ user, onClose, onPromoteAdmin }) {
  const { updateUserRole } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [changingRole, setChangingRole] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleChange = async (roleName) => {
    if (roleName === 'admin') { onClose(); onPromoteAdmin(user); return; }
    setChangingRole(roleName);
    setLoading(true);
    await updateUserRole(user.userId, roleName);
    setLoading(false);
    setChangingRole(null);
    onClose();
  };

  const options = CHANGEABLE_ROLES.filter((r) => r !== user.roleName);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -4 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="absolute right-0 top-full mt-2 z-40 w-40 rounded-2xl border border-white/[0.06] bg-[#151515] shadow-2xl p-1.5 backdrop-blur-xl"
    >
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2.5 pt-1 pb-2">Change Role</p>
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <RefreshCw size={16} className="animate-spin text-indigo-400" />
        </div>
      ) : (
        options.map((role) => (
          <button key={role} onClick={() => handleChange(role)}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all flex items-center justify-between
              ${role === 'admin'
                ? 'text-rose-400 hover:bg-rose-500/10'
                : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'}`}
          >
            {DISPLAY_ROLE(role)}
            {changingRole === role && <RefreshCw size={12} className="animate-spin text-indigo-400" />}
          </button>
        ))
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════════════════ */
export default function UserManagement() {
  const { t } = useTranslation('dashboard');
  const { users, isLoading, fetchUsers, updateUserStatus, updateUserRole } = useUserStore();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('fullName');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [rolePopoverUserId, setRolePopoverUserId] = useState(null);
  const [promoteAdminUser, setPromoteAdminUser] = useState(null);
  const [promoteLoading, setPromoteLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  /* ── Derived ── */
  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
  }), [users]);

  const filtered = useMemo(() => {
    let result = [...users];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((u) =>
        u.fullName?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.institution?.toLowerCase().includes(s));
    }
    if (roleFilter !== 'all') result = result.filter((u) => u.roleName === roleFilter);
    if (statusFilter === 'active') result = result.filter((u) => u.isActive);
    if (statusFilter === 'inactive') result = result.filter((u) => !u.isActive);
    result.sort((a, b) => {
      const va = (a[sortBy] || '').toString().toLowerCase();
      const vb = (b[sortBy] || '').toString().toLowerCase();
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return result;
  }, [users, search, roleFilter, statusFilter, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [search, roleFilter, statusFilter]);

  /* ── Handlers ── */
  const toggleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(col); setSortDir('asc'); }
  };

  const handleToggleActive = async (user) => {
    setTogglingId(user.userId);
    await updateUserStatus(user.userId, !user.isActive);
    setTogglingId(null);
  };

  const handlePromoteAdmin = (user) => {
    setRolePopoverUserId(null);
    setPromoteAdminUser(user);
  };

  const confirmPromoteAdmin = async () => {
    if (!promoteAdminUser) return;
    setPromoteLoading(true);
    await updateUserRole(promoteAdminUser.userId, 'admin');
    setPromoteLoading(false);
    setPromoteAdminUser(null);
  };

  /* ── Shared styles ── */
  const thCls = 'text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest select-none';
  const tdCls = 'px-5 py-3.5';

  return (
    <div className="space-y-6 p-6 max-w-[1400px] mx-auto">
      {/* ─── Stats ─── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <StatCard label="Total Users" value={stats.total} icon={Users} color="#818cf8" />
        <StatCard label="Active" value={stats.active} icon={UserCheck} color="#34d399" />
        <StatCard label="Inactive" value={stats.inactive} icon={UserX} color="#f87171" />
      </motion.div>

      {/* ─── Toolbar ─── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('userManagement.searchPlaceholder') || 'Search users...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-[13px] text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/40 focus:bg-white/[0.03] transition-all"
          />
        </div>
        {/* Filters */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={13} className="text-slate-400" />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="pl-3 pr-8 py-2.5 rounded-2xl bg-[#1a1a1a] border border-white/[0.06] text-[13px] text-slate-200 outline-none focus:border-indigo-500/40 transition-all appearance-none cursor-pointer"
            style={{ colorScheme: 'dark' }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="researcher">Researcher</option>
            <option value="academic_user">Academic</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-3 pr-8 py-2.5 rounded-2xl bg-[#1a1a1a] border border-white/[0.06] text-[13px] text-slate-200 outline-none focus:border-indigo-500/40 transition-all appearance-none cursor-pointer"
            style={{ colorScheme: 'dark' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {actionLoading && <RefreshCw size={15} className="animate-spin text-indigo-400" />}
          <button onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[13px] font-semibold text-white bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/20 transition-all active:scale-[0.97]"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* ─── Table ─── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="rounded-2xl border border-white/[0.04] bg-white/[0.01] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04] bg-white/[0.01]">
                {[
                  { col: 'fullName', label: 'User' },
                  { col: 'email', label: 'Email' },
                  { col: 'roleName', label: 'Role' },
                  { col: 'institution', label: 'Institution' },
                  { col: 'isActive', label: 'Status' },
                ].map((h) => (
                  <th key={h.col} onClick={() => toggleSort(h.col)} className={`${thCls} cursor-pointer hover:text-slate-300 transition-colors`}>
                    <span className="inline-flex items-center gap-1.5">
                      {h.label}
                      <ArrowUpDown size={10} className={sortBy === h.col ? 'text-indigo-400' : 'text-slate-500'} />
                    </span>
                  </th>
                ))}
                <th className={thCls}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <RefreshCw size={28} className="animate-spin mx-auto text-indigo-400 mb-3" />
                    <p className="text-[13px] text-slate-500">Loading users...</p>
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <Users size={28} className="mx-auto text-slate-700 mb-3" />
                    <p className="text-[13px] text-slate-500">No users found</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {paged.map((u, i) => (
                    <motion.tr
                      key={u.userId}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* User */}
                      <td className={tdCls}>
                        <div
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => setViewUser(u)}
                        >
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black text-white shrink-0 group-hover:scale-105 transition-transform"
                            style={{ background: `linear-gradient(135deg, ${avatarGradient(i)[0]}, ${avatarGradient(i)[1]})` }}
                          >
                            {u.fullName?.split(' ').pop()?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-white group-hover:text-indigo-300 transition-colors truncate max-w-[140px]">
                              {u.fullName}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Email */}
                      <td className={`${tdCls} text-[13px] text-slate-500 truncate max-w-[180px]`}>
                        {u.email}
                      </td>
                      {/* Role */}
                      <td className={tdCls}><RoleBadge roleName={u.roleName} /></td>
                      {/* Institution */}
                      <td className={`${tdCls} text-[13px] text-slate-500 truncate max-w-[140px]`}>
                        {u.institution || '—'}
                      </td>
                      {/* Status */}
                      <td className={tdCls}>
                        <StatusBadge isActive={u.isActive} />
                        {togglingId === u.userId && (
                          <RefreshCw size={11} className="animate-spin inline-block ml-2 text-slate-400" />
                        )}
                      </td>
                      {/* Actions */}
                      <td className={tdCls}>
                        <div className="flex items-center gap-1 transition-all duration-200">
                          {/* Role */}
                          <div className="relative">
                            <button
                              onClick={() => setRolePopoverUserId(rolePopoverUserId === u.userId ? null : u.userId)}
                              className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all active:scale-90"
                              title="Change Role"
                            >
                              <Shield size={14} />
                            </button>
                            <AnimatePresence>
                              {rolePopoverUserId === u.userId && (
                                <RolePopover user={u} onClose={() => setRolePopoverUserId(null)} onPromoteAdmin={handlePromoteAdmin} />
                              )}
                            </AnimatePresence>
                          </div>
                          {/* Toggle status */}
                          <button
                            onClick={() => handleToggleActive(u)}
                            className={`p-2 rounded-xl transition-all active:scale-90 ${u.isActive
                              ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                              : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                              }`}
                            title={u.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination ─── */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between text-[13px]">
            <span className="text-slate-500">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl text-slate-500 hover:bg-white/[0.04] hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const pn = start + i;
                if (pn > totalPages) return null;
                const isActive = pn === page;
                return (
                  <button
                    key={pn}
                    onClick={() => setPage(pn)}
                    className={`w-8 h-8 rounded-xl text-[13px] font-semibold transition-all active:scale-90
                      ${isActive
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20'
                        : 'text-slate-500 hover:bg-white/[0.04] hover:text-white'}`}
                  >
                    {pn}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl text-slate-500 hover:bg-white/[0.04] hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* ─── Modals ─── */}
      <AnimatePresence>
        {viewUser && <ViewUserModal user={viewUser} onClose={() => setViewUser(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {promoteAdminUser && (
          <ConfirmAdminModal
            user={promoteAdminUser}
            loading={promoteLoading}
            onConfirm={confirmPromoteAdmin}
            onCancel={() => setPromoteAdminUser(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
