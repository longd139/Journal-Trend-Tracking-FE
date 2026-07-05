import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search, X, RefreshCw, Building2, Users, UserCheck, UserX,
  Shield, Eye, AlertTriangle, ChevronLeft, ChevronRight, ChevronDown,
  ArrowUpDown, CheckCircle2, SlidersHorizontal, Mail,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from './userStore';

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
  const { t: tc } = useTranslation('common');
  const s = size === 'lg' ? 'px-2.5 py-1 text-[11px]' : 'px-2 py-0.5 text-[9px]';
  const cls = isActive
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    : 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  return (
    <span className={`${s} rounded-md font-bold uppercase tracking-wider border ${cls} transition-colors`}>
      {isActive ? tc('status.active') : tc('status.inactive')}
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

/* ═══════════════════════════════════════════════════════════════════════════
   Filter Dropdown — replaces native <select>
   ═══════════════════════════════════════════════════════════════════════════ */
function FilterDropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeLabel = options.find((o) => o.value === value)?.label || value;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-3.5 pr-2.5 py-2.5 rounded-2xl bg-[#101010] border border-[#DEDBC8]/10 text-[13px] outline-none hover:border-[#DEDBC8]/20 focus:border-indigo-500/40 transition-all"
      >
        <span className="text-[13px] text-slate-200">{activeLabel}</span>
        <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 top-full mt-1.5 z-50 min-w-full rounded-2xl border border-[#DEDBC8]/10 bg-[#151515] shadow-2xl backdrop-blur-xl p-1.5"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-[13px] transition-all flex items-center justify-between gap-3 whitespace-nowrap
                  ${opt.value === value
                    ? 'text-white bg-[#DEDBC8]/8 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-[#DEDBC8]/5'}`}
              >
                {opt.label}
                {opt.value === value && <CheckCircle2 size={12} className="text-indigo-400 shrink-0" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, isActive, onClick }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border bg-[#101010] p-5 group text-left w-full transition-all duration-300
        ${isActive
          ? 'border-[#DEDBC8]/30 shadow-lg shadow-[#DEDBC8]/5 ring-1 ring-[#DEDBC8]/10'
          : 'border-[#DEDBC8]/5 hover:border-[#DEDBC8]/15 cursor-pointer'}`}
    >
      {/* hover gradient reveal */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at top right, ${color}, transparent 70%)` }}
      />
      {/* active indicator dot */}
      {isActive && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full" style={{ background: color }} />
      )}
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className={`p-2 rounded-xl transition-all ${isActive ? 'bg-[#DEDBC8]/10' : 'group-hover:bg-[#DEDBC8]/5'}`}
              style={{ color, opacity: isActive ? 1 : 0.6 }}
            >
              <Icon size={18} />
            </div>
            <p className={`text-[12px] font-medium truncate transition-colors ${isActive ? 'text-[#E1E0CC]' : 'text-slate-400'}`}>{label}</p>
          </div>
          <div className="flex items-baseline gap-3">
            <motion.p
              key={value}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[28px] font-bold leading-none text-white tracking-tight font-mono tabular-nums"
            >
              {value}
            </motion.p>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   View User Modal
   ═══════════════════════════════════════════════════════════════════════════ */
function ViewUserModal({ user, onClose }) {
  const { t } = useTranslation('admin');
  const { t: tc } = useTranslation('common');
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
        className="w-full max-w-md rounded-2xl border border-[#DEDBC8]/5 bg-[#0d0d0d] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="relative px-6 pt-6 pb-5 border-b border-[#DEDBC8]/5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2.5">
              <span className="w-1.5 h-5 rounded-full bg-indigo-400" />
              {t('userManagement.userDetails')}
            </h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#DEDBC8]/5 text-slate-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black text-white shrink-0"
              style={{ background: `linear-gradient(135deg, ${avatarGradient(0)[0]}, ${avatarGradient(0)[1]})` }}
            >
              {user.fullName?.split(' ').pop()?.[0] || tc('actions.unknown')}
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
            <div key={r.label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#DEDBC8]/5 transition-colors group">
              <div className="p-1.5 rounded-lg bg-[#DEDBC8]/5 group-hover:bg-[#DEDBC8]/10 transition-colors" style={{ color: r.color }}>
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
  const { t } = useTranslation('admin');
  const { t: tc } = useTranslation('common');
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
              <h3 className="text-[15px] font-bold text-white">{t('userManagement.promoteToAdmin')}</h3>
              <p className="text-[13px] text-slate-400 mt-2 leading-relaxed">
                {t('userManagement.promoteConfirmText')}
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-2.5 justify-end">
          <button onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-400 hover:bg-[#DEDBC8]/5 hover:text-white transition-colors">
            {tc('actions.cancel')}
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-rose-500 hover:bg-rose-600 flex items-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading && <RefreshCw size={13} className="animate-spin" />}
            {t('userManagement.confirmPromote')}
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
  const { t } = useTranslation('admin');
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
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2.5 pt-1 pb-2">{t('userManagement.changeRole')}</p>
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
                : 'text-slate-400 hover:bg-[#DEDBC8]/5 hover:text-white'}`}
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
  const { t } = useTranslation('admin');
  const { t: tc } = useTranslation('common');
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
  const handleStatusFilter = (filter) => {
    // Toggle: clicking the already-active filter resets to 'all'
    setStatusFilter((prev) => (prev === filter ? 'all' : filter));
  };

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
        <StatCard
          label={t('userManagement.totalUsers')}
          value={stats.total}
          icon={Users}
          color="#818cf8"
          isActive={statusFilter === 'all'}
          onClick={() => handleStatusFilter('all')}
        />
        <StatCard
          label={tc('status.active')}
          value={stats.active}
          icon={UserCheck}
          color="#34d399"
          isActive={statusFilter === 'active'}
          onClick={() => handleStatusFilter('active')}
        />
        <StatCard
          label={tc('status.inactive')}
          value={stats.inactive}
          icon={UserX}
          color="#f87171"
          isActive={statusFilter === 'inactive'}
          onClick={() => handleStatusFilter('inactive')}
        />
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
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#101010] border border-[#DEDBC8]/10 text-[13px] text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/40 transition-all"
          />
        </div>
        {/* Filters */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={13} className="text-slate-400" />
          <FilterDropdown
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              { value: 'all', label: t('userManagement.filter.allRoles') },
              { value: 'admin', label: t('userManagement.filter.admin') },
              { value: 'researcher', label: t('userManagement.filter.researcher') },
              { value: 'academic_user', label: t('userManagement.filter.academic') },
            ]}
          />
          <FilterDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: t('userManagement.filter.allStatus') },
              { value: 'active', label: t('userManagement.filter.active') },
              { value: 'inactive', label: t('userManagement.filter.inactive') },
            ]}
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {actionLoading && <RefreshCw size={15} className="animate-spin text-indigo-400" />}
          <button onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[13px] font-semibold text-white bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/20 transition-all active:scale-[0.97]"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            {tc('actions.refresh')}
          </button>
        </div>
      </div>

      {/* ─── Table ─── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="rounded-2xl border border-[#DEDBC8]/5 bg-[#101010] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#DEDBC8]/5 bg-[#0d0d0d]">
                {[
                  { col: 'fullName', label: t('userManagement.table.user') },
                  { col: 'email', label: t('userManagement.table.email') },
                  { col: 'roleName', label: t('userManagement.table.role') },
                  { col: 'institution', label: t('userManagement.table.institution') },
                  { col: 'isActive', label: t('userManagement.table.status') },
                ].map((h) => (
                  <th key={h.col} onClick={() => toggleSort(h.col)} className={`${thCls} cursor-pointer hover:text-slate-300 transition-colors`}>
                    <span className="inline-flex items-center gap-1.5">
                      {h.label}
                      <ArrowUpDown size={10} className={sortBy === h.col ? 'text-indigo-400' : 'text-slate-500'} />
                    </span>
                  </th>
                ))}
                <th className={thCls}>{t('userManagement.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <RefreshCw size={28} className="animate-spin mx-auto text-indigo-400 mb-3" />
                    <p className="text-[13px] text-slate-500">{t('userManagement.loadingUsers')}</p>
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <Users size={28} className="mx-auto text-slate-700 mb-3" />
                    <p className="text-[13px] text-slate-500">{t('userManagement.noUsersFound')}</p>
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
                      className="border-b border-[#DEDBC8]/5 hover:bg-[#DEDBC8]/[0.02] transition-colors group"
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
                            {u.fullName?.split(' ').pop()?.[0]?.toUpperCase() || tc('actions.unknown')}
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
                              title={t('userManagement.changeRole')}
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
                            title={u.isActive ? t('userManagement.deactivate') : t('userManagement.activate')}
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
          <div className="px-5 py-3 border-t border-[#DEDBC8]/5 flex items-center justify-between text-[13px]">
            <span className="text-slate-500 font-mono tabular-nums">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl text-slate-500 hover:bg-[#DEDBC8]/5 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
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
                        : 'text-slate-500 hover:bg-[#DEDBC8]/5 hover:text-white'}`}
                  >
                    {pn}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl text-slate-500 hover:bg-[#DEDBC8]/5 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
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
