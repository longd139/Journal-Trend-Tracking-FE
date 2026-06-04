import { useState, useEffect } from 'react';
import { User, Mail, Building, Shield, Save, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

// NHỚ CHỈNH LẠI ĐƯỜNG DẪN IMPORT NÀY NẾU BỊ LỖI NHÉ
import axiosClient from '../lib/http/axiosClient'; 

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [role, setRole] = useState('academic');

  // Khởi tạo state cho form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    bio: ''
  });

  // 1. GỌI API LẤY DATA KHI VỪA VÀO TRANG
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const currentRole = sessionStorage.getItem('userRole') || 'academic';
        setRole(currentRole);
        
        // Gọi API lấy thông tin user (Hỏi Backend xem url đúng là /api/auth/me chưa nhé)
        const response = await axiosClient.get('/api/auth/login');
        console.log(" Data API trả về:", response);

        // Lưới bắt cạn: Bất chấp Backend bọc data trong cái gì, mình cũng lấy được
        const userData = response?.data || response?.result || response;

        // Đổ data thật lên form
        setFormData({
          name: userData.fullName || userData.name || '',
          email: userData.email || '',
          institution: userData.institution || userData.university || '',
          bio: userData.bio || 'Chưa có thông tin giới thiệu.'
        });

      } catch (error) {
        console.error(" Lỗi lấy thông tin:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. GỌI API ĐỂ LƯU THÔNG TIN MỚI
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Gọi API update (Hỏi Backend url đúng là gì, ở đây tui ví dụ là /api/users/profile)
      await axiosClient.put('/api/auth/login', {
        fullName: formData.name,      // Nếu Backend dùng chữ 'name' thì sửa lại thành: name: formData.name
        institution: formData.institution, 
        bio: formData.bio
      });

      // (Tùy chọn) Lưu tạm tên mới vào Session để cái Sidebar bên trái nó cũng tự đổi tên theo
      sessionStorage.setItem('userName', formData.name);

      setSuccess(true);
      
      // Tắt thông báo thành công sau 3 giây
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      alert("Cập nhật thất bại, vui lòng kiểm tra Console (F12)!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Account Settings</h2>
        <p className="text-sm" style={{ color: '#A0AEC0' }}>Manage your personal information and preferences.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border p-6" style={{ background: '#1B2235', borderColor: 'rgba(255,255,255,0.07)' }}>
        
        {/* Banner Avatar */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white shrink-0" style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)' }}>
            {/* Cắt 2 chữ cái đầu của tên thật */}
            {formData.name ? formData.name.substring(0, 2).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{formData.name || 'Đang tải...'}</h3>
            <div className="flex items-center gap-2 mt-1 text-xs font-medium px-2.5 py-1 rounded-md w-fit" style={{ background: 'rgba(79, 140, 255, 0.1)', color: '#4F8CFF' }}>
              <Shield size={12} /> {role.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Form Chỉnh Sửa */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            {/* Cột 1 */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white block mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-[#4F8CFF]" style={{ background: '#131A2A', borderColor: 'rgba(255,255,255,0.09)', color: '#E2E8F0' }} />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-white block mb-1.5">Institution / University</label>
                <div className="relative">
                  <Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="text" name="institution" value={formData.institution} onChange={handleChange} className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-[#4F8CFF]" style={{ background: '#131A2A', borderColor: 'rgba(255,255,255,0.09)', color: '#E2E8F0' }} />
                </div>
              </div>
            </div>

            {/* Cột 2 */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  {/* Tui thêm disabled ở đây vì thường email không cho sửa, nếu BE của ông cho sửa thì bỏ disabled đi nhé */}
                  <input type="email" name="email" value={formData.email} disabled className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors opacity-70 cursor-not-allowed" style={{ background: '#131A2A', borderColor: 'rgba(255,255,255,0.09)', color: '#E2E8F0' }} />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white block mb-1.5">Bio / Research Focus</label>
                <div className="relative">
                  <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-[#4F8CFF] resize-none" style={{ background: '#131A2A', borderColor: 'rgba(255,255,255,0.09)', color: '#E2E8F0' }}></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="text-xs text-green-400 flex items-center gap-1 opacity-0 transition-opacity" style={{ opacity: success ? 1 : 0 }}>
              <CheckCircle2 size={14} /> Profile updated successfully!
            </div>
            
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 hover:scale-105 transition-all" style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Saving...' : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </form>

      </motion.div>
    </div>
  );
}