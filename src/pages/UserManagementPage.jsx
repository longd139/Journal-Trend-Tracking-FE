import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search, Edit2, Trash2, X, RefreshCw, Building2,
  Users, UserCheck, UserX, Eye, Mail, Shield,
  ChevronLeft, ChevronRight, ArrowUpDown, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../store/useUserStore';

// ══════════════════════════════════════════════════════════════════════════════
// BADGES (light + dark)
// ══════════════════════════════════════════════════════════════════════════════
const statusBadgeCls = (isActive) =>
  isActive
    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';

function StatusBadge({ isActive }) {
  return (
    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${statusBadgeCls(isActive)}`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

const roleBadgeCls = (role) => {
  const m = {
    ADMIN: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    RESEARCHER: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    ACADEMIC: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  };
  return m[role] || m.ACADEMIC;
};

function RoleBadge({ roleName }) {
  return (
    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${roleBadgeCls(roleName)}`}>
      {roleName}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CONFIRM MODAL
// ══════════════════════════════════════════════════════════════════════════════
function ConfirmModal({ title, message, confirmLabel, confirmColor, onConfirm, onCancel, loading }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="rounded-2xl border p-6 w-full max-w-sm mx-4 shadow-2xl bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/[0.08]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${confirmColor}18` }}>
            <AlertTriangle size={18} style={{ color: confirmColor }} />
          </div>
          <div><h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3><p className="text-xs text-gray-500 dark:text-[#A0AEC0] mt-0.5">{message}</p></div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-500 dark:text-[#A0AEC0] hover:bg-gray-100 dark:hover:bg-white/5">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-1.5" style={{ background: confirmColor, opacity: loading ? 0.7 : 1 }}>
            {loading && <RefreshCw size={12} className="animate-spin" />}{confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VIEW USER MODAL
// ══════════════════════════════════════════════════════════════════════════════
const FIELD_COLORS = ['#4F8CFF', '#8B5CF6', '#00D1B2', '#F59E0B'];

function ViewUserModal({ user, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="rounded-2xl border p-6 w-full max-w-md mx-4 shadow-2xl bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/[0.08]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2"><Eye size={15} className="text-blue-500" /> User Details</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 dark:text-[#A0AEC0]"><X size={16} /></button>
        </div>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black text-white shrink-0 bg-gradient-to-br from-blue-500 to-purple-600">
            {user.fullName?.split(' ').pop()?.[0] || '?'}
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-900 dark:text-white">{user.fullName}</h4>
            <p className="text-xs text-gray-500 dark:text-[#A0AEC0]">{user.email}</p>
            <div className="mt-1 flex items-center gap-2">
              <RoleBadge roleName={user.roleName} />
              <StatusBadge isActive={user.isActive} />
            </div>
          </div>
        </div>
        <div className="space-y-2.5">
          {[
            { label: 'Institution', value: user.institution || 'N/A', icon: Building2, color: '#00D1B2' },
            { label: 'Remaining Searches', value: user.remainingSearches ?? 'N/A', icon: Search, color: '#4F8CFF' },
            { label: 'Remaining Views', value: user.remainingViews ?? 'N/A', icon: Eye, color: '#8B5CF6' },
            { label: 'Created', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A', icon: CheckCircle2, color: '#F59E0B' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-white/[0.02]">
              <item.icon size={14} style={{ color: item.color }} />
              <span className="text-[10px] text-gray-400 dark:text-[#6B7280] uppercase w-32">{item.label}</span>
              <span className="text-xs text-gray-900 dark:text-white font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
const PAGE_SIZE = 8;

export default function UserManagement() {
  const { t } = useTranslation('dashboard');
  const { users, isLoading, fetchUsers, updateUser, deleteUser } = useUserStore();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('fullName');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [formData, setFormData] = useState({ fullName: '', email: '', institution: '', roleName: 'ACADEMIC', isActive: true });

  useEffect(() => { fetchUsers(); }, []);

  // ── Stats ──
  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
  }), [users]);

  // ── Filtered & Sorted ──
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

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(col); setSortDir('asc'); }
  };

  // ── Actions ──
  const openEdit = (user) => {
    setSelectedUser(user);
    setFormData({ fullName: user.fullName, email: user.email, institution: user.institution || '', roleName: user.roleName, isActive: user.isActive });
    setModalMode('edit');
  };

  const openView = (user) => { setSelectedUser(user); setModalMode('view'); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionLoading(true);
    await updateUser(selectedUser.userId, formData);
    setActionLoading(false);
    setModalMode(null);
  };

  const handleDelete = (user) => {
    setConfirmModal({
      title: 'Delete User',
      message: `Permanently delete "${user.fullName}"?`,
      confirmLabel: 'Delete',
      confirmColor: '#EF4444',
      onConfirm: async () => { setActionLoading(true); await deleteUser(user.userId); setActionLoading(false); setConfirmModal(null); },
    });
  };

  const handleToggleActive = async (user) => {
    setActionLoading(true);
    await updateUser(user.userId, { isActive: !user.isActive });
    setActionLoading(false);
  };

  const SortIcon = ({ col }) => (
    <ArrowUpDown size={10} className={`transition-colors ${sortBy === col ? 'text-blue-500' : 'text-gray-400 dark:text-[#6B7280]'}`} />
  );

  // ── Shared style classes ──
  const cardCls = 'bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/[0.07]';
  const inputCls = 'bg-gray-50 dark:bg-[#131A2A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#6B7280] focus:border-blue-500 dark:focus:border-[#4F8CFF]/50';
  const selectCls = 'bg-gray-50 dark:bg-[#131A2A] border-gray-200 dark:border-white/10 text-gray-600 dark:text-[#A0AEC0] focus:border-blue-500 dark:focus:border-[#4F8CFF]/50';
  const mutedCls = 'text-gray-500 dark:text-[#A0AEC0]';
  const subtleCls = 'text-gray-400 dark:text-[#6B7280]';

  return (
    <div className="p-6 space-y-5">
      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: '#4F8CFF' },
          { label: 'Active', value: stats.active, icon: UserCheck, color: '#00D1B2' },
          { label: 'Inactive', value: stats.inactive, icon: UserX, color: '#EF4444' },
        ].map((s) => (
          <motion.div key={s.label} whileHover={{ y: -2 }} className={`p-4 rounded-xl border ${cardCls} group`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-[#A0AEC0]">{s.label}</span>
              <div className="p-1.5 rounded-lg card-icon-accent" style={{ '--icon-accent': s.color, color: s.color }}>
                <s.icon size={15} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* ─── Search & Actions ─── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#6B7280]" />
          <input type="text" placeholder={t('userManagement.searchPlaceholder')} value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs outline-none transition-colors ${inputCls}`} />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={`px-3 py-2.5 rounded-xl border text-xs outline-none ${selectCls}`}>
          <option value="all">All Roles</option><option value="ADMIN">Admin</option><option value="RESEARCHER">Researcher</option><option value="ACADEMIC">Academic</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`px-3 py-2.5 rounded-xl border text-xs outline-none ${selectCls}`}>
          <option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option>
        </select>
        <button onClick={fetchUsers}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 shadow-lg shadow-blue-500/20">
          <RefreshCw size={13} /> Refresh
        </button>
        {actionLoading && <RefreshCw size={14} className="animate-spin text-blue-500" />}
      </div>

      {/* ─── Table ─── */}
      <div className={`rounded-xl border overflow-hidden ${cardCls}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01]">
                {[
                  { col: 'fullName', label: 'User' }, { col: 'email', label: 'Email' },
                  { col: 'roleName', label: 'Role' }, { col: 'institution', label: 'Institution' },
                  { col: 'isActive', label: 'Status' },
                ].map((h) => (
                  <th key={h.col} onClick={() => toggleSort(h.col)}
                    className="text-left px-5 py-3.5 text-[10px] font-semibold text-gray-400 dark:text-[#6B7280] uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-white transition-colors select-none">
                    <span className="flex items-center gap-1.5">{h.label}<SortIcon col={h.col} /></span>
                  </th>
                ))}
                <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-gray-400 dark:text-[#6B7280] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-16">
                  <RefreshCw size={24} className="animate-spin mx-auto text-blue-500 mb-2" />
                  <p className={`text-xs ${mutedCls}`}>Loading users...</p>
                </td></tr>
              ) : paged.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-xs text-gray-500">No users found.</td></tr>
              ) : (
                paged.map((u, i) => (
                  <motion.tr key={u.userId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="border-b border-gray-100 dark:border-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => openView(u)}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: `linear-gradient(135deg, ${FIELD_COLORS[i % 4]}, #8B5CF6)` }}>
                          {u.fullName?.split(' ').pop()?.[0] || '?'}
                        </div>
                        <span className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors truncate max-w-[130px]">{u.fullName}</span>
                      </div>
                    </td>
                    <td className={`px-5 py-3.5 text-xs ${mutedCls}`}>{u.email}</td>
                    <td className="px-5 py-3.5"><RoleBadge roleName={u.roleName} /></td>
                    <td className={`px-5 py-3.5 text-xs ${mutedCls}`}>{u.institution}</td>
                    <td className="px-5 py-3.5"><StatusBadge isActive={u.isActive} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {[
                          { icon: Eye, color: '#4F8CFF', onClick: () => openView(u), title: 'View' },
                          { icon: Edit2, color: '#F59E0B', onClick: () => openEdit(u), title: 'Edit' },
                          { icon: u.isActive ? UserX : UserCheck, color: u.isActive ? '#EF4444' : '#00D1B2', onClick: () => handleToggleActive(u), title: u.isActive ? 'Deactivate' : 'Activate' },
                          { icon: Trash2, color: '#EF4444', onClick: () => handleDelete(u), title: 'Delete' },
                        ].map((btn, j) => (
                          <button key={j} onClick={btn.onClick} title={btn.title}
                            className="p-1.5 rounded-lg text-gray-400 dark:text-[#A0AEC0] btn-icon-glow transition-all duration-200"
                            style={{ '--icon-accent': btn.color, color: btn.color === '#4F8CFF' ? undefined : undefined }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = btn.color + '20'; e.currentTarget.style.color = btn.color; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; }}
                          >
                            <btn.icon size={13} />
                          </button>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-gray-200 dark:border-white/5 flex items-center justify-between text-xs">
            <span className={subtleCls}>Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 disabled:opacity-30"><ChevronLeft size={14} /></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const pn = start + i;
                if (pn > totalPages) return null;
                return <button key={pn} onClick={() => setPage(pn)} className={`w-7 h-7 rounded-lg text-[11px] font-semibold ${pn === page ? 'bg-blue-500 text-white' : 'text-gray-500 dark:text-[#A0AEC0] hover:bg-gray-100 dark:hover:bg-white/5'}`}>{pn}</button>;
              })}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 disabled:opacity-30"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Edit Modal ─── */}
      <AnimatePresence>
        {modalMode === 'edit' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setModalMode(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="rounded-2xl border p-6 w-full max-w-md shadow-2xl bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/[0.08]" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 text-gray-900 dark:text-white"><Shield size={18} className="text-blue-500" /><h3 className="text-base font-bold font-display">Edit User</h3></div>
                <button onClick={() => setModalMode(null)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 dark:text-[#A0AEC0]"><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { key: 'fullName', label: 'Full Name', type: 'text', icon: Users },
                  { key: 'email', label: 'Email', type: 'email', icon: Mail },
                  { key: 'institution', label: 'Institution', type: 'text', icon: Building2 },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-[10px] font-semibold text-gray-500 dark:text-[#A0AEC0] uppercase tracking-wider block mb-1.5">{f.label}</label>
                    <div className="relative">
                      <f.icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#6B7280]" />
                      <input required type={f.type} value={formData[f.key]} onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                        className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs outline-none transition-colors ${inputCls}`} />
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 dark:text-[#A0AEC0] uppercase tracking-wider block mb-1.5">Role</label>
                    <select value={formData.roleName} onChange={(e) => setFormData({ ...formData, roleName: e.target.value })} className={`w-full px-3 py-2.5 rounded-xl border text-xs outline-none ${selectCls}`}>
                      <option value="ACADEMIC">Academic</option><option value="RESEARCHER">Researcher</option><option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 dark:text-[#A0AEC0] uppercase tracking-wider block mb-1.5">Status</label>
                    <select value={formData.isActive ? 'active' : 'inactive'} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })} className={`w-full px-3 py-2.5 rounded-xl border text-xs outline-none ${selectCls}`}>
                      <option value="active">Active</option><option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="pt-3 flex gap-3">
                  <button type="button" onClick={() => setModalMode(null)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 dark:border-white/10 text-gray-500 dark:text-[#A0AEC0] hover:bg-gray-50 dark:hover:bg-white/5">Cancel</button>
                  <button type="submit" disabled={actionLoading} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 flex items-center justify-center gap-2" style={{ opacity: actionLoading ? 0.7 : 1 }}>
                    {actionLoading && <RefreshCw size={13} className="animate-spin" />}Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── View Modal ─── */}
      <AnimatePresence>
        {modalMode === 'view' && selectedUser && <ViewUserModal user={selectedUser} onClose={() => setModalMode(null)} />}
      </AnimatePresence>

      {/* ─── Confirm Modal ─── */}
      <AnimatePresence>
        {confirmModal && <ConfirmModal {...confirmModal} onCancel={() => setConfirmModal(null)} loading={actionLoading} />}
      </AnimatePresence>
    </div>
  );
}
