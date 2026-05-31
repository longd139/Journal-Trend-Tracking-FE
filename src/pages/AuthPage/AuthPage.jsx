import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Microscope,
  Mail,
  Lock,
  RefreshCw,
  Building2,
  AlertCircle,
  GraduationCap,
  FlaskConical,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';
import { PARTICLES } from '../../constants/mockData';

// Data cấu hình cho 2 Role
const ROLES_DATA = [
  {
    id: 'student',
    title: 'Student',
    description: 'Dành cho sinh viên, học viên',
    icon: GraduationCap,
    color: '#4F8CFF',
    features: [
      'Truy cập tài liệu học tập',
      'Theo dõi tiến độ đồ án',
      'Tham gia nhóm nghiên cứu',
    ],
  },
  {
    id: 'researcher',
    title: 'Researcher',
    description: 'Dành cho giảng viên, nhà nghiên cứu',
    icon: FlaskConical,
    color: '#8B5CF6',
    features: [
      'Quản lý dự án khoa học',
      'Xuất bản & chia sẻ bài báo',
      'Cấp quyền cho sinh viên',
    ],
  },
];

export default function AuthPage({ mode = 'login' }) {
  const navigate = useNavigate();
  // Quản lý bước hiện tại: 1 (Chọn Role), 2 (Nhập Form)
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);

  const [form, setForm] = useState({
    name: '',
    institution: '',
    email: localStorage.getItem('savedEmail') || '', 
    password: '',
    confirmPassword: '',
    role: 'user',
    remember: false,
  });
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    name: false,
    institution: false,
    email: false,
    emailFormat: false,
    password: false,
    confirmPassword: false,
    mismatch: false,
  });
  // THÊM 2 STATE NÀY
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  // 1. THÊM 3 STATE NÀY VÀO ĐỂ QUẢN LÝ GỢI Ý ĐẠI HỌC
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingUnis, setLoadingUnis] = useState(false);

  // 2. THÊM USE-EFFECT NÀY ĐỂ GỌI API
// Danh sách Local các trường ở VN (Có thể thêm bao nhiêu tuỳ thích vào đây)
  const LOCAL_UNIS = [
    " Văn Lang University",
    " FPT University",
    " Bách khoa  University",
    " Khoa học Tự nhiên  University",
    " Công nghệ Thông tin (UIT) University",
    " Quốc tế TP.HCM University",
    " RMIT University",
    " Tôn Đức Thắng University",
    " Kinh tế TP.HCM University",
    " Ngoại thương University",
    " Y Dược University",
    " Sư phạm Kỹ thuật University",
    " Công nghiệp University"
  ];

  useEffect(() => {
    if (form.institution.trim().length < 1 || mode !== 'register') {
      setSuggestions([]);
      return;
    }

    const searchTerm = form.institution.toLowerCase();

    // 1. Tìm ngay lập tức trong danh sách Local VN (Không cần đợi API)
    const localMatches = LOCAL_UNIS
      .filter(uni => uni.toLowerCase().includes(searchTerm))
      .map(name => ({ name }));

    // Cho hiển thị kết quả Local liền tay luôn cho mượt
    setSuggestions(localMatches.slice(0, 5));

    // 2. Vẫn gọi API để tìm thêm trường quốc tế
    const timer = setTimeout(async () => {
      setLoadingUnis(true);
      try {
        const res = await fetch(
          `http://universities.hipolabs.com/search?name=${form.institution}`
        );
        const data = await res.json();
        
        const apiMatches = data.map(u => ({ name: u.name }));
        
        // 3. Trộn kết quả Local và API lại
        const combined = [...localMatches, ...apiMatches];
        
        // 4. Lọc bỏ các trường bị trùng tên và chỉ lấy 5 cái đầu tiên
        const uniqueSuggestions = Array.from(new Set(combined.map(a => a.name)))
          .map(name => ({ name }))
          .slice(0, 5);

        setSuggestions(uniqueSuggestions);
      } catch (error) {
        console.error("Lỗi khi tải danh sách trường:", error);
      } finally {
        setLoadingUnis(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [form.institution, mode]);
  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: false }));
    if (field === 'email' && errors.emailFormat)
      setErrors((e) => ({ ...e, emailFormat: false }));
    if (
      (field === 'password' || field === 'confirmPassword') &&
      errors.mismatch
    ) {
      setErrors((e) => ({ ...e, mismatch: false, confirmPassword: false }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isEmailEmpty = form.email.trim() === '';
    const isPasswordEmpty = form.password.trim() === '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailFormatInvalid = !isEmailEmpty && !emailRegex.test(form.email);

    let hasError = false;
    let currentErrors = {
      ...errors,
      email: isEmailEmpty,
      emailFormat: isEmailFormatInvalid,
      password: isPasswordEmpty,
    };

    if (mode === 'register') {
      const isNameEmpty = form.name.trim() === '';
      const isInstitutionEmpty = form.institution.trim() === '';
      const isConfirmEmpty = form.confirmPassword.trim() === '';
      const isMismatch =
        !isPasswordEmpty && !isConfirmEmpty && form.password !== form.confirmPassword;

      currentErrors = {
        ...currentErrors,
        name: isNameEmpty,
        institution: isInstitutionEmpty,
        confirmPassword: isConfirmEmpty || isMismatch,
        mismatch: isMismatch,
      };

      if (
        isNameEmpty ||
        isInstitutionEmpty ||
        isEmailEmpty ||
        isEmailFormatInvalid ||
        isPasswordEmpty ||
        isConfirmEmpty ||
        isMismatch
      ) {
        hasError = true;
      }
    } else {
      if (isEmailEmpty || isPasswordEmpty || isEmailFormatInvalid) hasError = true;
    }

    if (hasError) {
      setErrors(currentErrors);
      return;
    }

    // Pass hết lỗi thì gom data đẩy đi
    const finalData = { ...form, role: selectedRole };
    console.log('Dữ liệu gửi lên server:', finalData);

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Giả lập chuyển trang theo role
      navigate('/overview');
    }, 1100);
  };

  // --- GIAO DIỆN BƯỚC 1: CHỌN ROLE ---
  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-full"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Choose your path
        </h2>
        <p className="text-sm" style={{ color: '#A0AEC0' }}>
          Select how you want to use SCITRACK
        </p>
      </div>

      <div className="space-y-4">
        {ROLES_DATA.map((role) => {
          const isSelected = selectedRole === role.id;
          return (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className="relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 group overflow-hidden"
              style={{
                background: isSelected ? `${role.color}15` : '#131A2A',
                borderColor: isSelected ? role.color : 'rgba(255,255,255,0.08)',
              }}
            >
              {/* Vệt sáng chạy ngang khi được chọn */}
              {isSelected && (
                <div
                  className="absolute top-0 left-0 h-1 w-full"
                  style={{ background: role.color }}
                />
              )}

              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    background: isSelected ? role.color : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <role.icon size={24} style={{ color: isSelected ? '#fff' : role.color }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white mb-1">{role.title}</h3>
                  <p className="text-xs mb-3" style={{ color: '#A0AEC0' }}>{role.description}</p>

                  {/* Danh sách tính năng */}
                  <ul className="space-y-2">
                    {role.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs" style={{ color: '#CBD5E1' }}>
                        <CheckCircle2 size={12} style={{ color: role.color }} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <motion.button
        whileHover={selectedRole ? { scale: 1.02 } : {}}
        whileTap={selectedRole ? { scale: 0.97 } : {}}
        disabled={!selectedRole}
        onClick={() => setStep(2)}
        className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-8 transition-all"
        style={{
          background: selectedRole ? 'linear-gradient(135deg, #4F8CFF, #8B5CF6)' : 'rgba(255,255,255,0.1)',
          opacity: selectedRole ? 1 : 0.5,
          cursor: selectedRole ? 'pointer' : 'not-allowed',
        }}
      >
        Continue <ArrowRight size={16} />
      </motion.button>
    </motion.div>
  );

  // --- GIAO DIỆN BƯỚC 2: FORM AUTH ---

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full"
    >
      <div className="flex items-center mb-6">
        <button
          onClick={() => setStep(1)}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors mr-3"
          style={{ color: '#A0AEC0' }}
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2
            className="text-2xl font-black text-white"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-xs mt-1" style={{ color: '#4F8CFF' }}>
            Logging in as <span className="font-bold uppercase tracking-wider">{selectedRole}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        
        {/* CHỈ HIỂN THỊ 2 Ô NÀY NẾU LÀ ĐĂNG KÝ */}
        {mode === 'register' && (
          <>
            <div>
              <label className="text-xs font-semibold text-white block mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Nguyễn Phương Nguyên"
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
            
            {/* Ô INSTITUTION CÓ GỌI API GỢI Ý */}
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
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
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

              {/* Bảng Dropdown gợi ý */}
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
          </>
        )}

        {/* CÁC TRƯỜNG BÊN DƯỚI DÙNG CHUNG HOẶC CÓ ĐIỀU KIỆN */}
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
              <AlertCircle size={10} /> Email không hợp lệ
            </div>
          )}
        </div>

        <div className={mode === 'register' ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : ""}>
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
            {mode === 'login' && errors.password && (
              <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-500">
                <AlertCircle size={10} /> Vui lòng nhập mật khẩu
              </div>
            )}
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-white block mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: errors.confirmPassword ? '#EF4444' : '#A0AEC0' }}
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                    errors.confirmPassword
                      ? 'border-red-500 bg-red-500/5 focus:border-red-400'
                      : 'border-white/10 bg-[#131A2A] focus:border-[#4F8CFF]'
                  }`}
                  style={{ color: '#E2E8F0' }}
                />
              </div>
            </div>
          )}
        </div>

        {mode === 'register' && errors.mismatch && (
          <div className="flex items-center gap-1 mt-1 text-[10px] font-medium text-red-500">
            <AlertCircle size={10} /> Passwords do not match
          </div>
        )}

        {mode === 'login' && (
          <div className="flex items-center justify-between text-xs mt-2">
            <label className="flex items-center gap-2 cursor-pointer" style={{ color: '#A0AEC0' }}>
              <input 
                type="checkbox" 
                checked={form.remember} // Đọc trạng thái
                onChange={(e) => setForm(f => ({ ...f, remember: e.target.checked }))} // Cập nhật trạng thái
                className="rounded bg-[#131A2A] border-white/10" 
              /> 
              Remember me
            </label>
            <button 
              type="button" 
              onClick={() => setShowForgotPassword(true)} 
              className="font-semibold transition-colors hover:text-white" 
              style={{ color: '#4F8CFF' }}
            >
              Forgot password?
            </button>
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
                <RefreshCw size={14} className="animate-spin" />{' '}
                {mode === 'login' ? 'Signing in…' : 'Creating account…'}
              </>
            ) : mode === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </motion.button>
        </div>
      </form>

      <div className="mt-5 text-center text-xs" style={{ color: '#A0AEC0' }}>
        {mode === 'login' ? (
          <>
            Don't have an account?{' '}
            <button
              onClick={() => {
                setStep(1);
                navigate('/register');
              }}
              className="font-semibold"
              style={{ color: '#4F8CFF' }}
            >
              Register
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              onClick={() => {
                setStep(1);
                navigate('/login');
              }}
              className="font-semibold"
              style={{ color: '#4F8CFF' }}
            >
              Sign In
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
// --- GIAO DIỆN BƯỚC: QUÊN MẬT KHẨU ---
  const renderForgotPassword = () => {
    // Hàm xử lý gửi yêu cầu reset pass
    const handleForgotSubmit = (e) => {
      e.preventDefault();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmailEmpty = form.email.trim() === '';
      const isEmailFormatInvalid = !isEmailEmpty && !emailRegex.test(form.email);

      if (isEmailEmpty || isEmailFormatInvalid) {
        setErrors((prev) => ({ ...prev, email: isEmailEmpty, emailFormat: isEmailFormatInvalid }));
        return;
      }

      setLoading(true);
      setTimeout(() => {
      setLoading(false);
      
      if (mode === 'login' && form.remember) {
        localStorage.setItem('savedEmail', form.email);
      } else if (mode === 'login' && !form.remember) {
        localStorage.removeItem('savedEmail');
      }

      // THÊM DÒNG NÀY: Lưu cái Role mà ông vừa chọn vào localStorage để trang Overview biết ai đang vào
      localStorage.setItem('userRole', selectedRole);
      
      // SỬA DÒNG NÀY: Gom chung tất cả về 1 đường dẫn là /overview
      navigate('/overview'); 
    }, 1100);
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="w-full"
      >
        <div className="flex items-center mb-6">
          <button
            onClick={() => {
              setShowForgotPassword(false);
              setResetSent(false); // Reset lại trạng thái nếu user quay lại
            }}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors mr-3"
            style={{ color: '#A0AEC0' }}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Reset Password
            </h2>
            <p className="text-xs mt-1" style={{ color: '#A0AEC0' }}>
              We'll send a reset link to your email
            </p>
          </div>
        </div>

        {resetSent ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#00D1B21A' }}>
              <CheckCircle2 size={24} style={{ color: '#00D1B2' }} />
            </div>
            <h3 className="text-white font-bold mb-2">Check your inbox</h3>
            <p className="text-xs text-[#A0AEC0] mb-6 leading-relaxed">
              We've sent password reset instructions to <br />
              <span className="text-white font-semibold">{form.email}</span>
            </p>
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setResetSent(false);
              }}
              className="text-sm font-semibold transition-colors hover:text-white"
              style={{ color: '#4F8CFF' }}
            >
              Back to Login
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleForgotSubmit} noValidate className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-white block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: errors.email ? '#EF4444' : '#A0AEC0' }} />
                <input
                  type="email"
                  placeholder="you@university.edu"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                    errors.email || errors.emailFormat ? 'border-red-500 bg-red-500/5 focus:border-red-400' : 'border-white/10 bg-[#131A2A] focus:border-[#4F8CFF]'
                  }`}
                  style={{ color: '#E2E8F0' }}
                />
              </div>
              {errors.email && <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-500"><AlertCircle size={10} /> Vui lòng nhập email</div>}
              {errors.emailFormat && <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-500"><AlertCircle size={10} /> Email không hợp lệ</div>}
            </div>

            <div className="mt-8 pt-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)', opacity: loading ? 0.8 : 1 }}
              >
                {loading ? <><RefreshCw size={14} className="animate-spin" /> Sending link…</> : 'Send Reset Link'}
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
    );
  };
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#0B1020' }}
    >
      {/* Background Particles (Giữ nguyên) */}
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
        {/* Header Logo (Giữ nguyên cho cả 2 màn hình) */}
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

        {/* Khối chứa Form động, dùng AnimatePresence để làm mượt hiệu ứng chuyển Step */}
        <div
          className="rounded-2xl border p-8 overflow-hidden"
          style={{
            background: 'rgba(27,34,53,0.85)',
            borderColor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <div key="step1">{renderStep1()}</div>
            ) : showForgotPassword ? (
              // NẾU ĐANG BẤM QUÊN MẬT KHẨU THÌ HIỆN CÁI NÀY
              <div key="forgot">{renderForgotPassword()}</div> 
            ) : (
              // CÒN KHÔNG THÌ HIỆN FORM BÌNH THƯỜNG
              <div key="step2">{renderStep2()}</div>
            )}
          </AnimatePresence>
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