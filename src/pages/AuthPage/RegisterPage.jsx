import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
  Microscope,
  Mail,
  Lock,
  RefreshCw,
  Building2,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react';
import { PARTICLES } from '../../constants/mockData';
import { authAPI } from '../../lib/api/auth.api';
import { useAuthStore } from '../../store/useAuthStore';

const LOCAL_UNIS = [
  'Văn Lang University',
  'FPT University',
  'Bách khoa University',
  'Khoa học Tự nhiên University',
  'Công nghệ Thông tin (UIT) University',
  'Quốc tế TP.HCM University',
  'RMIT University',
  'Tôn Đức Thắng University',
  'Kinh tế TP.HCM University',
  'Ngoại thương University',
  'Y Dược University',
  'Sư phạm Kỹ thuật University',
  'Công nghiệp University',
];

export default function RegisterPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const incomingRole = location.state?.role || '';

  const [form, setForm] = useState({
    fullName: '',
    institution: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: incomingRole,
  });

  // --- THÊM STATE QUẢN LÝ GỢI Ý TRƯỜNG ĐẠI HỌC ---
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingUnis, setLoadingUnis] = useState(false);

  const setTokens = useAuthStore((state) => state.setTokens);

  // --- USE-EFFECT BẢO MẬT LUỒNG ---
  useEffect(() => {
    if (!incomingRole) {
      navigate('/auth');
    }
  }, [incomingRole, navigate]);

  // --- USE-EFFECT TÌM KIẾM TRƯỜNG ĐẠI HỌC ---
  useEffect(() => {
    // Bỏ điều kiện currentMode vì ở trang này luôn là register
    if (form.institution.trim().length < 1) {
      setSuggestions([]);
      return;
    }

    const searchTerm = form.institution.toLowerCase();

    // 1. Tìm ngay lập tức trong danh sách Local VN
    const localMatches = LOCAL_UNIS.filter((uni) =>
      uni.toLowerCase().includes(searchTerm),
    ).map((name) => ({ name }));

    setSuggestions(localMatches.slice(0, 5));

    // 2. Gọi API để tìm thêm trường quốc tế
    const timer = setTimeout(async () => {
      setLoadingUnis(true);
      try {
        const res = await fetch(
          `http://universities.hipolabs.com/search?name=${form.institution}`,
        );
        const data = await res.json();
        const apiMatches = data.map((u) => ({ name: u.name }));

        // 3. Trộn và lọc kết quả trùng lặp
        const combined = [...localMatches, ...apiMatches];
        const uniqueSuggestions = Array.from(
          new Set(combined.map((a) => a.name)),
        )
          .map((name) => ({ name }))
          .slice(0, 5);

        setSuggestions(uniqueSuggestions);
      } catch (error) {
        console.error('Lỗi khi tải danh sách trường:', error);
      } finally {
        setLoadingUnis(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [form.institution]);

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    fullName: false,
    institution: false,
    email: false,
    emailFormat: false,
    password: false,
    confirmPassword: false,
    mismatch: false,
    apiError: '', // 2. Thêm field quản lý lỗi từ API
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isNameEmpty = form.fullName.trim() === '';
    const isInstitutionEmpty = form.institution.trim() === '';
    const isEmailEmpty = form.email.trim() === '';
    const isPasswordEmpty = form.password.trim() === '';
    const isConfirmEmpty = form.confirmPassword.trim() === '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailFormatInvalid = !isEmailEmpty && !emailRegex.test(form.email);

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
        fullName: isNameEmpty,
        institution: isInstitutionEmpty,
        email: isEmailEmpty,
        emailFormat: isEmailFormatInvalid,
        password: isPasswordEmpty,
        confirmPassword: isConfirmEmpty || isMismatch,
        mismatch: isMismatch,
        apiError: '', // Reset API error nếu có lỗi validate local
      });
      return;
    }

    setLoading(true);
    setErrors((prev) => ({ ...prev, apiError: '' }));
    // 4. Logic gọi API bằng Axios
    try {
      // Bỏ confirmPassword ra khỏi payload gửi lên server vì không cần thiết
      const payload = {
        fullName: form.fullName,
        institution: form.institution,
        email: form.email,
        password: form.password,
        role: form.role,
      };

      // Đổi endpoint '/register' thành endpoint đúng của backend bạn
      const response = await authAPI.register(payload);
      const { accessToken, user } = response;
      if (accessToken) {
        setTokens(accessToken);
      }
      toast.success('Registration successful!', {
        description:
          'Welcome aboard. Your account has been created successfully.',
      });

      // Delay khoảng 1.5s để user kịp đọc thông báo rồi mới chuyển trang
      setTimeout(() => {
        navigate('/login');
      }, 1000);
      // navigate('/login');
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      // Lấy câu thông báo lỗi từ backend trả về (nếu có), nếu không có thì dùng câu mặc định

      // Lấy chính xác trường "message" từ JSON bạn vừa cung cấp
      const errorMessage =
        error.response?.data?.message ||
        'Registration failed. Please try again later.';

      // 1. Hiển thị qua Sonner Toast
      toast.error('Registration Failed', {
        description: errorMessage,
      });

      // 2. Hiển thị dòng text màu đỏ ngay trên nút Create Account
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

    if (errors[field]) {
      setErrors((e) => ({ ...e, [field]: false }));
    }
    if (field === 'email' && errors.emailFormat) {
      setErrors((e) => ({ ...e, emailFormat: false }));
    }
    if (
      (field === 'password' || field === 'confirmPassword') &&
      errors.mismatch
    ) {
      setErrors((e) => ({ ...e, mismatch: false, confirmPassword: false }));
    }
    // Xóa thông báo lỗi API khi user bắt đầu gõ lại để sửa
    if (errors.apiError) {
      setErrors((e) => ({ ...e, apiError: '' }));
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#0B1020' }}
    >
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
          <div className="flex items-center mb-6">
            <button
              onClick={() => {
                navigate('/auth');
              }}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors mr-3"
              style={{ color: '#A0AEC0' }}
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <p className="text-xs mt-1" style={{ color: '#4F8CFF' }}>
                Create account for{' '}
                <span className="font-bold uppercase tracking-wider">
                  {incomingRole}
                </span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            <div>
              <label className="text-xs font-semibold text-white block mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Dr. Sarah Chen"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                  errors.fullName // FIX Ở ĐÂY NÈ BR
                    ? 'border-red-500 bg-red-500/5 focus:border-red-400'
                    : 'border-white/10 bg-[#131A2A] focus:border-[#4F8CFF]'
                }`}
                style={{ color: '#E2E8F0' }}
              />
              {errors.fullName && (
                <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-500">
                  <AlertCircle size={10} /> Please enter your full name
                </div>
              )}
            </div>

            {/* --- KHỐI INSTITUTION ĐƯỢC CẬP NHẬT --- */}
            <div className="relative">
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
                  placeholder="FPT University"
                  value={form.institution}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  onChange={(e) => {
                    handleChange('institution', e.target.value);
                    setShowSuggestions(true);
                  }}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                    errors.institution
                      ? 'border-red-500 bg-red-500/5 focus:border-red-400'
                      : 'border-white/10 bg-[#131A2A] focus:border-[#4F8CFF]'
                  }`}
                  style={{ color: '#E2E8F0' }}
                />
                {loadingUnis && (
                  <RefreshCw
                    size={12}
                    className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-white/50"
                  />
                )}
              </div>
              
              {/* THÊM DÒNG BÁO LỖI CHO INSTITUTION LUÔN CHO ĐỒNG BỘ */}
              {errors.institution && (
                <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-500">
                  <AlertCircle size={10} /> Please select your institution
                </div>
              )}

              {/* Menu thả xuống gợi ý */}
              {showSuggestions && suggestions.length > 0 && (
                <ul
                  className="absolute z-50 w-full mt-1.5 rounded-xl border overflow-hidden shadow-2xl"
                  style={{
                    background: '#131A2A',
                    borderColor: 'rgba(255,255,255,0.1)',
                  }}
                >
                  {suggestions.map((uni, idx) => (
                    <li
                      key={idx}
                      onClick={() => {
                        handleChange('institution', uni.name);
                        setShowSuggestions(false);
                      }}
                      className="px-4 py-2.5 text-xs text-white hover:bg-[#4F8CFF1A] cursor-pointer border-b last:border-b-0 transition-colors"
                      style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                    >
                      {uni.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

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
                  <AlertCircle size={10} /> Please enter your email
                </div>
              )}
              {errors.emailFormat && (
                <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-500">
                  <AlertCircle size={10} /> Invalid email format (e.g., name@domain.com)
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <AlertCircle size={10} /> Please enter a password
                  </div>
                )}
              </div>

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
                {/* Check lỗi rỗng trước, nếu không rỗng mà sai thì báo mismatch */}
                {errors.confirmPassword && !errors.mismatch && (
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-500">
                    <AlertCircle size={10} /> Please confirm your password
                  </div>
                )}
              </div>
            </div>

            {errors.mismatch && (
              <div className="flex items-center gap-1 mt-1 text-[10px] font-medium text-red-500">
                <AlertCircle size={10} /> Passwords do not match
              </div>
            )}
            
            {/* 5. Hiển thị thông báo lỗi từ API ngay trên nút Submit */}
            {errors.apiError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-medium text-red-500 flex items-center gap-2 mt-2">
                <AlertCircle size={14} />
                {errors.apiError}
              </div>
            )}
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