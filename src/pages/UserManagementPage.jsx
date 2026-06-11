import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Edit2, Trash2, X, ShieldAlert, RefreshCw, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios'; // Bật cái này lên nếu ông xài axios gọi API

// ==========================================
// 1. COMPONENTS DÙNG CHUNG
// ==========================================
const GlowBadge = ({ color, children }) => (
  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm dark:shadow-none" style={{ background: `${color}15`, color: color, borderColor: `${color}30` }}>
    {children}
  </span>
);

const StatusPill = ({ status }) => {
  const isOk = status === 'Active';
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isOk ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
      {status || 'Active'}
    </span>
  );
};

const FIELD_DATA = ['#4F8CFF', '#8B5CF6', '#00D1B2', '#F59E0B'];

// ==========================================
// 2. GIAO DIỆN CHÍNH
// ==========================================
export default function UserManagement() {
  const { t } = useTranslation('dashboard');
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  
  // Loading States
  const [isLoading, setIsLoading] = useState(true); 
  const [isSubmitting, setIsSubmitting] = useState(false); 

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const defaultForm = { username: '', email: '', organization: '', roleName: 'Academic' };
  const [formData, setFormData] = useState(defaultForm);

  // ==========================================
  // [1] LẤY DANH SÁCH TỪ API
  // ==========================================
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // TẠM THỜI MOCK DATA ĐỂ ÔNG THẤY GIAO DIỆN KHI CHƯA NỐI API
      setTimeout(() => {
        setUsers([
          { id: 1, username: 'admin_master', email: 'admin@scitrack.com', organization: 'SciTrack HQ', roleName: 'Admin' },
          { id: 2, username: 'dr_sarah', email: 'sarah@mit.edu', organization: 'MIT Data Lab', roleName: 'Professor' },
        ]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Lỗi lấy danh sách:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      !search ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.organization?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      organization: user.organization,
      roleName: user.roleName
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        alert("Failed to delete user!");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingUser) {
        setUsers(users.map(u => (u.id === editingUser.id ? { ...u, ...formData } : u)));
      } else {
        const newUser = { ...formData, id: Date.now() };
        setUsers([newUser, ...users]);
      }
      setIsModalOpen(false);
    } catch (error) {
      alert("Error saving user data!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 p-8 relative min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0B1020]">
      {/* Search & Add */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#A0AEC0]" />
          <input
            type="text"
            placeholder={t('userManagement.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1B2235] text-sm text-gray-900 dark:text-[#E2E8F0] outline-none transition-colors focus:border-blue-500 dark:focus:border-[#4F8CFF] shadow-sm dark:shadow-none"
          />
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 hover:opacity-90 transition-opacity shadow-md shadow-blue-500/20 bg-gradient-to-r from-blue-500 to-purple-600"
        >
          <Plus size={13} /> {t('userManagement.addUser')}
        </button>
      </div>

      {/* Bảng Dữ liệu */}
      <div className="rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-sm dark:shadow-2xl bg-white dark:bg-[#1B2235] transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01] transition-colors">
                {[t('userManagement.columns.user'), t('userManagement.columns.role'), t('userManagement.columns.organization'), t('userManagement.columns.status'), t('userManagement.columns.actions')].map((h) => (
                  <th key={h} className="text-left px-5 py-4 text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-[#6B7280]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="text-center py-16">
                    <RefreshCw size={24} className="animate-spin mx-auto text-blue-500 dark:text-[#4F8CFF] mb-2" />
                    <p className="text-xs text-gray-500 dark:text-[#A0AEC0]">{t('userManagement.loading')}</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-xs text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u, i) => (
                      <motion.tr 
                        key={u.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors group" 
                      >
                        {/* Cột User */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-md uppercase"
                              style={{ background: `linear-gradient(135deg, ${FIELD_DATA[i % FIELD_DATA.length]}, #1B2235)` }}
                            >
                              {u.username ? u.username[0] : 'U'}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-[#4F8CFF] transition-colors">
                                @{u.username}
                              </div>
                              <div className="text-[11px] text-gray-500 dark:text-[#A0AEC0]">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        
                        {/* Cột Role */}
                        <td className="px-5 py-4">
                          <GlowBadge color={u.roleName === 'Admin' ? '#EF4444' : u.roleName === 'Professor' ? '#F59E0B' : '#8B5CF6'}>
                            {u.roleName || 'User'}
                          </GlowBadge>
                        </td>

                        {/* Cột Organization */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-white">
                            <Building2 size={13} className="text-gray-400 dark:text-[#A0AEC0]" />
                            {u.organization || 'Not Specified'}
                          </div>
                        </td>

                        {/* Cột Status */}
                        <td className="px-5 py-4">
                          <StatusPill status="Active" />
                        </td>

                        {/* Cột Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenEdit(u)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-[#4F8CFF20] hover:text-blue-600 dark:hover:text-[#4F8CFF] rounded-lg transition-colors text-gray-400">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(u.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-[#EF444420] hover:text-red-600 dark:hover:text-[#EF4444] rounded-lg transition-colors text-gray-400">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================
          MODAL FORM THÊM / SỬA USER 
          ========================================== */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-2xl bg-white dark:bg-[#1B2235] transition-colors"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <ShieldAlert size={18} className="text-blue-500 dark:text-[#4F8CFF]" />
                  <h3 className="text-lg font-bold font-display">
                    {editingUser ? t('userManagement.editUser') : t('userManagement.addUser')}
                  </h3>
                </div>
                <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {['username', 'email', 'organization'].map((field) => (
                  <div key={field}>
                    <label className="text-xs font-semibold text-gray-900 dark:text-white block mb-1.5 normal-case">{field}</label>
                    <input
                      required
                      type={field === 'email' ? 'email' : 'text'}
                      value={formData[field]}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      disabled={isSubmitting}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#131A2A] text-sm text-gray-900 dark:text-[#E2E8F0] outline-none transition-colors focus:border-blue-500 dark:focus:border-[#4F8CFF] disabled:opacity-50"
                    />
                  </div>
                ))}

                {/* Role */}
                <div>
                  <label className="text-xs font-semibold text-gray-900 dark:text-white block mb-1.5">Role</label>
                  <select
                    value={formData.roleName}
                    onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#131A2A] text-sm text-gray-900 dark:text-[#E2E8F0] outline-none transition-colors focus:border-blue-500 dark:focus:border-[#4F8CFF] appearance-none disabled:opacity-50"
                  >
                    <option value="Researcher">Researcher</option>
                    <option value="Academic">Academic</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors border border-gray-200 dark:border-white/10 text-gray-600 dark:text-[#A0AEC0] hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 shadow-md shadow-blue-500/20"
                    style={{ opacity: isSubmitting ? 0.7 : 1 }}
                  >
                    {isSubmitting ? <><RefreshCw size={14} className="animate-spin" /> Saving...</> : (editingUser ? 'Save Changes' : 'Create User')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}