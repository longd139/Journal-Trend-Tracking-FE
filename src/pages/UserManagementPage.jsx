import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, ShieldAlert, RefreshCw, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios'; // Bật cái này lên nếu ông xài axios gọi API

// ==========================================
// 1. COMPONENTS DÙNG CHUNG
// ==========================================
const GlowBadge = ({ color, children }) => (
  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border" style={{ background: `${color}10`, color: color, borderColor: `${color}25`, textShadow: `0 0 10px ${color}40` }}>
    {children}
  </span>
);

const StatusPill = ({ status }) => {
  const c = status === 'Active' 
    ? { bg: '#00D1B21A', text: '#00D1B2' }
    : { bg: '#EF44441A', text: '#EF4444' };
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" style={{ background: c.bg, color: c.text }}>
      {status || 'Active'}
    </span>
  );
};

const FIELD_DATA = ['#4F8CFF', '#8B5CF6', '#00D1B2', '#F59E0B'];

// ==========================================
// 2. GIAO DIỆN CHÍNH
// ==========================================
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  
  // Loading States
  const [isLoading, setIsLoading] = useState(true); 
  const [isSubmitting, setIsSubmitting] = useState(false); 

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Khớp chính xác với data API của ông
  const defaultForm = { username: '', email: '', organization: '', roleName: 'Academic' };
  const [formData, setFormData] = useState(defaultForm);

  // ==========================================
  // [1] LẤY DANH SÁCH TỪ API
  // ==========================================
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // ⚠️ ĐỔI LINK Ở ĐÂY: Dùng /api/users thay vì /api/users/me nếu muốn lấy danh sách
      // Lấy token từ storage để đính kèm vào header
      // const token = sessionStorage.getItem('accessToken'); 
      // const res = await axios.get('http://localhost:8080/api/users', {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setUsers(res.data);
      
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

  // Lọc dữ liệu theo search
  const filtered = users.filter(
    (u) =>
      !search ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.organization?.toLowerCase().includes(search.toLowerCase())
  );

  // Mở form
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

  // ==========================================
  // [2] XÓA USER
  // ==========================================
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // await axios.delete(`http://localhost:5000/api/users/${id}`, { headers: ... });
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        alert("Failed to delete user!");
      }
    }
  };

  // ==========================================
  // [3] THÊM / SỬA USER
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingUser) {
        // CẬP NHẬT GỌI API PUT/PATCH
        // await axios.put(`http://localhost:5000/api/users/${editingUser.id}`, formData, { headers: ... });
        setUsers(users.map(u => (u.id === editingUser.id ? { ...u, ...formData } : u)));
      } else {
        // TẠO MỚI GỌI API POST
        // const res = await axios.post('http://localhost:5000/api/users', formData, { headers: ... });
        // setUsers([res.data, ...users]); // Thay res.data vào đây
        
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
    <div className="space-y-5 p-8 relative">
      {/* Search & Add */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A0AEC0' }} />
          <input
            type="text"
            placeholder="Search by username, email, or organization…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2.5 rounded-xl border text-xs outline-none transition-colors focus:border-[#4F8CFF]"
            style={{ background: '#1B2235', borderColor: 'rgba(255,255,255,0.09)', color: '#E2E8F0' }}
          />
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)' }}
        >
          <Plus size={13} /> Add User
        </button>
      </div>

      {/* Bảng Dữ liệu */}
      <div className="rounded-xl border overflow-hidden shadow-2xl" style={{ background: '#1B2235', borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b bg-white/[0.01]" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                {/* CẬP NHẬT HEADER CHO KHỚP VỚI API */}
                {['User', 'Role', 'Organization', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-4 text-xs font-semibold tracking-wide uppercase" style={{ color: '#6B7280' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="text-center py-16">
                    <RefreshCw size={24} className="animate-spin mx-auto text-[#4F8CFF] mb-2" />
                    <p className="text-xs text-[#A0AEC0]">Loading users from API...</p>
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
                        className="border-b hover:bg-white/[0.03] transition-colors group" 
                        style={{ borderColor: 'rgba(255,255,255,0.02)' }}
                      >
                        {/* Cột User (Username + Email) */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg uppercase"
                              style={{ background: `linear-gradient(135deg, ${FIELD_DATA[i % FIELD_DATA.length]}, #1B2235)` }}
                            >
                              {u.username ? u.username[0] : 'U'}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white group-hover:text-[#4F8CFF] transition-colors">
                                @{u.username}
                              </div>
                              <div className="text-[11px]" style={{ color: '#A0AEC0' }}>{u.email}</div>
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
                          <div className="flex items-center gap-1.5 text-xs text-white">
                            <Building2 size={13} style={{ color: '#A0AEC0' }} />
                            {u.organization || 'Not Specified'}
                          </div>
                        </td>

                        {/* Cột Status (Tạm thời hardcode nếu API không có) */}
                        <td className="px-5 py-4">
                          <StatusPill status="Active" />
                        </td>

                        {/* Cột Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenEdit(u)} className="p-1.5 hover:bg-[#4F8CFF20] hover:text-[#4F8CFF] rounded-lg transition-colors text-gray-400">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(u.id)} className="p-1.5 hover:bg-[#EF444420] hover:text-[#EF4444] rounded-lg transition-colors text-gray-400">
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-2xl border p-6 shadow-2xl"
              style={{ background: 'rgba(27,34,53,0.95)', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-white">
                  <ShieldAlert size={18} className="text-[#4F8CFF]" />
                  <h3 className="text-lg font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {editingUser ? 'Edit User Details' : 'Add New User'}
                  </h3>
                </div>
                <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="text-xs font-semibold text-white block mb-1.5">Username</label>
                  <input
                    required
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-[#4F8CFF] disabled:opacity-50"
                    style={{ background: '#131A2A', borderColor: 'rgba(255,255,255,0.1)', color: '#E2E8F0' }}
                  />
                </div>
                
                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-white block mb-1.5">Email Address</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-[#4F8CFF] disabled:opacity-50"
                    style={{ background: '#131A2A', borderColor: 'rgba(255,255,255,0.1)', color: '#E2E8F0' }}
                  />
                </div>

                {/* Organization */}
                <div>
                  <label className="text-xs font-semibold text-white block mb-1.5">Organization</label>
                  <input
                    required
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-[#4F8CFF] disabled:opacity-50"
                    style={{ background: '#131A2A', borderColor: 'rgba(255,255,255,0.1)', color: '#E2E8F0' }}
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="text-xs font-semibold text-white block mb-1.5">Role</label>
                  <select
                    value={formData.roleName}
                    onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-[#4F8CFF] appearance-none disabled:opacity-50"
                    style={{ background: '#131A2A', borderColor: 'rgba(255,255,255,0.1)', color: '#E2E8F0' }}
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
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-white/5 disabled:opacity-50"
                    style={{ color: '#A0AEC0', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)', opacity: isSubmitting ? 0.7 : 1 }}
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