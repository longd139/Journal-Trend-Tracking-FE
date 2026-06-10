import { useState, useEffect } from 'react';
import { User, Mail, Building, Shield, Save, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api/auth.api';
import { userAPI } from '../lib/api/user.api';
import axios from 'axios';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [role, setRole] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    institution: '',
    bio: '',
    isVerified: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const currentRole = sessionStorage.getItem('userRole');
        setRole(currentRole || 'user');

        const response = await userAPI.profile();
        const userData = response;
        
        setFormData({
          fullName: userData.fullName || '',
          email: userData.email || '',
          institution: userData.institution || '',
          bio: '', 
          isVerified: userData.isVerified || false,
        });
      } catch (err) {
        console.error('Error fetching user info:', err);
        setError('Unable to load user information.');
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(false);

  try {
    const payload = {
        fullName: formData.fullName,
        institution: formData.institution,
        avatarUrl: formData.avatarUrl || "string" // Tạm thời để trống hoặc default theo API
      };
    // Gọi API thông qua service
    await userAPI.updateProfile(payload); 
    
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  } catch (err) {
    console.error('Error updating profile:', err);
    // Interceptor thường vẫn ném lỗi ra đây nên việc bắt err.response.data.message vẫn hoạt động bình thường
    const errorMessage = err.response?.data?.message || 'Update failed, please try again!';
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const handleVerifyEmail = () => {
    navigate('/verify-email');
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h2
          className="text-xl font-black text-white"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Account Settings
        </h2>
        <p className="text-sm" style={{ color: '#A0AEC0' }}>
          Manage your personal information and preferences.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border p-6 shadow-2xl"
        style={{ background: '#1B2235', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        {/* Avatar Banner */}
        <div
          className="flex items-center gap-6 mb-8 pb-8 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white shrink-0 uppercase shadow-lg border border-white/5"
            style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)' }}
          >
            {formData.fullName ? formData.fullName.substring(0, 2) : 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{formData.fullName || 'Loading...'}</h3>
            <div
              className="flex items-center gap-2 mt-1.5 text-xs font-medium px-2.5 py-1 rounded-md w-fit"
              style={{
                background: 'rgba(79, 140, 255, 0.1)',
                color: '#4F8CFF',
              }}
            >
              <Shield size={12} /> {role.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* TOP SECTION: 2 COLUMNS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Column 1: Basic Info (Đã chỉnh lại khoảng cách space-y-6 cho ôm sát nhau đẹp mắt) */}
            <div className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-white block mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-[#4F8CFF]"
                    style={{ background: '#131A2A', borderColor: 'rgba(57, 51, 51, 0.09)', color: '#E2E8F0' }}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white block mb-1.5">
                  Institution / University
                </label>
                <div className="relative">
                  <Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-[#4F8CFF]"
                    style={{ background: '#131A2A', borderColor: 'rgba(255,255,255,0.09)', color: '#E2E8F0' }}
                  />
                </div>
              </div>
            </div>

            {/* Column 2: Email & Verification Box */}
            <div>
              <div className="p-5 rounded-xl border bg-white/[0.02] flex flex-col h-full" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <label className="text-xs font-semibold text-white flex items-center justify-between mb-3">
                  <span>Email Address</span>
                  
                  {/* STATUS BADGE */}
                  {formData.isVerified ? (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-md">
                      <CheckCircle2 size={12} /> VERIFIED
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1 font-bold bg-amber-500/10 px-2.5 py-1 rounded-md">
                      <AlertTriangle size={12} /> UNVERIFIED
                    </span>
                  )}
                </label>
                
                <div className="relative mb-2">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm outline-none opacity-60 cursor-not-allowed"
                    style={{ background: '#131A2A', borderColor: 'rgba(255,255,255,0.09)', color: '#94A3B8' }}
                  />
                </div>

                {/* EMAIL VERIFICATION BUTTON AREA */}
                {!formData.isVerified && (
                  <div className="mt-auto pt-4 border-t flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="text-[11px] text-gray-400 leading-relaxed pr-4">
                      Verify your email to unlock all features.
                    </div>
                    <button 
                      type="button" 
                      onClick={handleVerifyEmail}
                      className="shrink-0 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500 hover:border-amber-500 transition-all flex items-center gap-1.5 group shadow-lg"
                    >
                      Verify Now
                      <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* BOTTOM SECTION: FULL WIDTH BIO */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-white block mb-1.5">
              Bio / Research Focus
            </label>
            <div className="relative">
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                placeholder="Tell us about your research background and interests..."
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-[#4F8CFF] resize-none"
                style={{ background: '#131A2A', borderColor: 'rgba(255,255,255,0.09)', color: '#E2E8F0' }}
              ></textarea>
            </div>
          </div>

          {/* DISPLAY ERROR IF ANY */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-medium text-red-500 flex items-center gap-2"
            >
              <AlertTriangle size={14} /> {error}
            </motion.div>
          )}

          {/* FOOTER ACTIONS */}
          <div
            className="pt-6 border-t flex items-center justify-between"
            style={{ borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <div
              className="text-xs text-green-400 flex items-center gap-1.5 font-medium opacity-0 transition-opacity"
              style={{ opacity: success ? 1 : 0 }}
            >
              <CheckCircle2 size={16} /> Profile updated successfully!
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 hover:scale-105 transition-all shadow-lg hover:shadow-[#4F8CFF]/20"
              style={{
                background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <Save size={16} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}