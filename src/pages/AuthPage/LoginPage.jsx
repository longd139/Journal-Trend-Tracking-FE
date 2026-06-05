import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Microscope, Mail, Lock, RefreshCw, AlertCircle } from 'lucide-react';
import { PARTICLES, MOCK_ACCOUNTS } from '../../constants/mockData';
import { authAPI } from '../../lib/api/auth.api'; // ĐÃ TẮT API THẬT
import { useAuthStore } from '../../store/useAuthStore';
// import { useAuthStore } from '../../store/useAuthStore'; // Tạm tắt Zustand vì đang xài localStorage

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const setToken = useAuthStore((state) => state.setTokens);
  const [errors, setErrors] = useState({
    email: false,
    emailFormat: false,
    password: false,
    apiError: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation cơ bản
    const isEmailEmpty = form.email.trim() === '';
    const isPasswordEmpty = form.password.trim() === '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailFormatInvalid = !isEmailEmpty && !emailRegex.test(form.email);

    if (isEmailEmpty || isPasswordEmpty || isEmailFormatInvalid) {
      setErrors((prev) => ({
        ...prev,
        email: isEmailEmpty,
        password: isPasswordEmpty,
        emailFormat: isEmailFormatInvalid,
      }));
      return;
    }

    setLoading(true);
    setErrors((prev) => ({ ...prev, apiError: '' }));

    // không dùng mockdata giả để login tránh lỗi
    try {
      const response = await authAPI.login({
        email: form.email,
        password: form.password,
      });

      // console.log(response);
      // 1. Lưu token để sử dụng cho các request sau
      // (Tùy dự án mà bạn dùng localStorage hoặc sessionStorage)
      setToken(response.accessToken);
      // sessionStorage.setItem('accessToken', response.accessToken);

      // 2. Lấy role để điều hướng
      // GIẢ ĐỊNH: Bạn đã sửa authAPI để return thêm role (xem gợi ý sửa authAPI bên dưới)
      // Nếu backend không trả role trực tiếp, bạn sẽ cần dùng thư viện jwt-decode để giải mã accessToken ở đây.
      const userRole = response.role; // Mặc định là 'user' nếu chưa có

      // Lưu role vào localStorage/sessionStorage giống logic cũ
      sessionStorage.setItem('userRole', userRole);

      // 3. Điều hướng qua Overview Controller
      navigate(`/${userRole}/overview`);
    } catch (error) {
      // Axios sẽ ném lỗi vào catch nếu status code từ 400 trở lên
      // Lấy message lỗi từ backend (thường nằm ở error.response.data.message)
      const errorMessage =
        error.response?.data?.message ||
        'Sai email hoặc mật khẩu. Vui lòng thử lại!';

      setErrors((prev) => ({
        ...prev,
        apiError: errorMessage,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: false }));
    if (field === 'email' && errors.emailFormat)
      setErrors((e) => ({ ...e, emailFormat: false }));
    if (errors.apiError) setErrors((e) => ({ ...e, apiError: '' }));
  };

  // Hàm điền nhanh tài khoản giả (Vẫn giữ để test UI cho nhanh)
  const autoFill = (role) => {
    handleChange('email', `${role}@scitrack.com`);
    handleChange('password', '123');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#0B1020' }}
    >
      {/* Background Effect (Giữ nguyên của ông) */}
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

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-md mx-6"
      >
        {/* Logo */}
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

        {/* Form Box */}
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
            Welcome back
          </h2>
          <p className="text-sm mb-6" style={{ color: '#A0AEC0' }}>
            Sign in to your research dashboard
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Input Email */}
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
                    errors.email || errors.emailFormat
                      ? 'border-red-500 bg-red-500/5 focus:border-red-400'
                      : 'border-white/10 bg-[#131A2A] focus:border-[#4F8CFF]'
                  }`}
                  style={{ color: '#E2E8F0' }}
                />
              </div>
              {errors.email && (
                <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-500">
                  <AlertCircle size={10} /> Vui lòng nhập email
                </div>
              )}
              {errors.emailFormat && (
                <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-500">
                  <AlertCircle size={10} /> Email không hợp lệ (vd:
                  name@domain.com)
                </div>
              )}
            </div>

            {/* Input Password */}
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
              {errors.password && (
                <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-500">
                  <AlertCircle size={10} /> Vui lòng nhập mật khẩu
                </div>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs">
              <label
                className="flex items-center gap-2 cursor-pointer"
                style={{ color: '#A0AEC0' }}
              >
                <input
                  type="checkbox"
                  className="rounded bg-[#131A2A] border-white/10"
                />{' '}
                Remember me
              </label>
              <button
                type="button"
                className="font-semibold"
                style={{ color: '#4F8CFF' }}
              >
                Forgot password?
              </button>
            </div>

            {/* Lỗi API */}
            {errors.apiError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-medium text-red-500 flex items-center gap-2">
                <AlertCircle size={14} /> {errors.apiError}
              </div>
            )}

            {/* Nút Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-2"
              style={{
                background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)',
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* KHU VỰC TEST (Dành cho ông điền nhanh) */}
          <div
            className="mt-8 pt-6 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <p
              className="text-[11px] font-semibold text-center mb-3 tracking-widest uppercase"
              style={{ color: '#6B7280' }}
            >
              Test Accounts (Auto-fill)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => autoFill('admin')}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold border text-red-400 border-red-400/20 hover:bg-red-400/10 transition-colors"
              >
                Admin
              </button>
              <button
                onClick={() => autoFill('researcher')}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold border text-blue-400 border-blue-400/20 hover:bg-blue-400/10 transition-colors"
              >
                Researcher
              </button>
              <button
                onClick={() => autoFill('academic')}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold border text-emerald-400 border-emerald-400/20 hover:bg-emerald-400/10 transition-colors"
              >
                Academic
              </button>
            </div>
          </div>

          <div
            className="mt-6 pt-5 border-t text-center text-xs"
            style={{ borderColor: 'rgba(255,255,255,0.07)', color: '#A0AEC0' }}
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold"
              style={{ color: '#4F8CFF' }}
            >
              Register
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
