import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Microscope,
  Mail,
  Lock,
  BookOpen,
  Shield,
  RefreshCw,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { PARTICLES } from '../../constants/mockData';

export default function RegisterPage() {
  const navigate = useNavigate();
  // Khác biệt: Thêm trường name vào state
  const [form, setForm] = useState({
    name: '',
    institution: '',
    email: '',

    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);

  // 2. State quản lý lỗi cho tất cả các field
  const [errors, setErrors] = useState({
    name: false,
    institution: false,
    email: false,
    emailFormat: false,
    password: false,
    confirmPassword: false,
    mismatch: false, // Lỗi mật khẩu không khớp
  });
  const handleSubmit = (e) => {
    e.preventDefault();

    // Kiểm tra rỗng
    const isNameEmpty = form.name.trim() === '';
    const isInstitutionEmpty = form.institution.trim() === '';
    const isEmailEmpty = form.email.trim() === '';
    const isPasswordEmpty = form.password.trim() === '';
    const isConfirmEmpty = form.confirmPassword.trim() === '';

    // 2. Kiểm tra định dạng Email (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailFormatInvalid = !isEmailEmpty && !emailRegex.test(form.email);

    // Kiểm tra mật khẩu khớp
    const isMismatch =
      !isPasswordEmpty &&
      !isConfirmEmpty &&
      form.password !== form.confirmPassword;

    if (
      isNameEmpty ||
      isInstitutionEmpty ||
      isEmailEmpty ||
      isEmailFormatInvalid ||
      isPasswordEmpty ||
      isConfirmEmpty ||
      isMismatch
    ) {
      setErrors({
        name: isNameEmpty,
        institution: isInstitutionEmpty,
        email: isEmailEmpty,
        emailFormat: isEmailFormatInvalid,
        password: isPasswordEmpty,
        confirmPassword: isConfirmEmpty || isMismatch,
        mismatch: isMismatch,
      });
      return; // Chặn lại nếu có lỗi
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(form.role === 'admin' ? '/adminDash' : '/userDash');
    }, 1100);
  };

  // Hàm handle change thông minh để tự tắt lỗi khi user gõ
  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));

    // Tắt lỗi rỗng nếu user đang gõ
    if (errors[field]) {
      setErrors((e) => ({ ...e, [field]: false }));
    }
    // Tắt lỗi format email khi user gõ lại
    if (field === 'email' && errors.emailFormat) {
      setErrors((e) => ({ ...e, emailFormat: false }));
    }
    // Nếu đang sửa 1 trong 2 ô password, tự động tắt lỗi mismatch để user gõ lại
    if (
      (field === 'password' || field === 'confirmPassword') &&
      errors.mismatch
    ) {
      setErrors((e) => ({ ...e, mismatch: false, confirmPassword: false }));
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#0B1020' }}
    >
      {/* Background Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-[0.14]"
          style={{ background: '#4F8CFF' }}
        />
        <div
          className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full blur-3xl opacity-10"
          style={{ background: '#8B5CF6' }}
        />
        {PARTICLES.slice(0, 18).map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              top: `${p.top}%`,
              background: p.color,
              opacity: 0.18,
            }}
            animate={{ y: [0, -20, 0] }}
            transition={{
              duration: p.dur,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-md mx-6"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)' }}
          >
            <Microscope size={18} className="text-white" />
          </div>
          <span
            className="text-lg font-black text-white tracking-widest"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            SCITRACK
          </span>
        </div>

        <div
          className="rounded-2xl border p-8"
          style={{
            background: 'rgba(27,34,53,0.85)',
            borderColor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <h2
            className="text-2xl font-black text-white mb-1"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Create account
          </h2>
          <p className="text-sm mb-6" style={{ color: '#A0AEC0' }}>
            Start your academic intelligence journey
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold text-white block mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Dr. Sarah Chen"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                  errors.name
                    ? 'border-red-500 bg-red-500/5 focus:border-red-400'
                    : 'border-white/10 bg-[#131A2A] focus:border-[#4F8CFF]'
                }`}
                style={{ color: '#E2E8F0' }}
              />
            </div>

            {/* Institution */}
            <div>
              <label className="text-xs font-semibold text-white block mb-1.5">
                Institution / University
              </label>
              <div className="relative">
                <Building2
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: errors.institution ? '#EF4444' : '#A0AEC0' }}
                />
                <input
                  type="text"
                  placeholder="Massachusetts Institute of Technology"
                  value={form.institution}
                  onChange={(e) => handleChange('institution', e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                    errors.institution
                      ? 'border-red-500 bg-red-500/5 focus:border-red-400'
                      : 'border-white/10 bg-[#131A2A] focus:border-[#4F8CFF]'
                  }`}
                  style={{ color: '#E2E8F0' }}
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="text-xs font-semibold text-white block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: errors.email ? '#EF4444' : '#A0AEC0' }}
                />
                <input
                  type="email"
                  placeholder="you@university.edu"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                    errors.email
                      ? 'border-red-500 bg-red-500/5 focus:border-red-400'
                      : 'border-white/10 bg-[#131A2A] focus:border-[#4F8CFF]'
                  }`}
                  style={{ color: '#E2E8F0' }}
                />
              </div>
              {/* Hiển thị lỗi rỗng */}
              {errors.email && (
                <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-500">
                  <AlertCircle size={10} /> Vui lòng nhập email
                </div>
              )}
              {/* Hiển thị lỗi sai định dạng */}
              {errors.emailFormat && (
                <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-500">
                  <AlertCircle size={10} /> Email không đúng định dạng (vd:
                  name@domain.com)
                </div>
              )}
            </div>
            {/* Khối Grid chứa Password và Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-white block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: errors.password ? '#EF4444' : '#A0AEC0' }}
                  />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                      errors.password
                        ? 'border-red-500 bg-red-500/5 focus:border-red-400'
                        : 'border-white/10 bg-[#131A2A] focus:border-[#4F8CFF]'
                    }`}
                    style={{ color: '#E2E8F0' }}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-semibold text-white block mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{
                      color: errors.confirmPassword ? '#EF4444' : '#A0AEC0',
                    }}
                  />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      handleChange('confirmPassword', e.target.value)
                    }
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                      errors.confirmPassword
                        ? 'border-red-500 bg-red-500/5 focus:border-red-400'
                        : 'border-white/10 bg-[#131A2A] focus:border-[#4F8CFF]'
                    }`}
                    style={{ color: '#E2E8F0' }}
                  />
                </div>
              </div>
            </div>

            {/* Thông báo lỗi nếu mật khẩu không khớp */}
            {errors.mismatch && (
              <div className="flex items-center gap-1 mt-1 text-[10px] font-medium text-red-500">
                <AlertCircle size={10} /> Passwords do not match
              </div>
            )}

            {/* 3. Chuyển class border-t và padding lên đây bao quanh nút bấm */}
            <div
              className="mt-8 pt-5 border-t"
              style={{ borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)',
                  opacity: loading ? 0.8 : 1,
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Creating
                    account…
                  </>
                ) : (
                  'Create Account'
                )}
              </motion.button>
            </div>
          </form>
          <div
            className="mt-5 text-center text-xs"
            style={{ color: '#A0AEC0' }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold"
              style={{ color: '#4F8CFF' }}
            >
              Sign In
            </Link>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="mt-5 w-full text-center text-xs transition-colors hover:text-white"
          style={{ color: '#6B7280' }}
        >
          ← Back to landing page
        </button>
      </motion.div>
    </div>
  );
}
