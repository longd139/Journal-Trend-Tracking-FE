import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; 
// ĐÃ IMPORT THÊM EYE VÀ EYEOFF Ở ĐÂY NÈ BR:
import { Microscope, Mail, Lock, RefreshCw, AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { PARTICLES, MOCK_ACCOUNTS } from '../../constants/mockData';
import { authAPI } from '../../lib/api/auth.api'; 
import { useAuthStore } from '../../store/useAuthStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setTokens);
  
  // States điều khiển giao diện
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // STATE MỚI ĐỂ HIỆN/ẨN MẬT KHẨU
  
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: false,
    emailFormat: false,
    password: false,
    apiError: '',
    successMsg: '', 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation cơ bản
    const isEmailEmpty = form.email.trim() === '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailFormatInvalid = !isEmailEmpty && !emailRegex.test(form.email);
    const isPasswordEmpty = !isForgotMode && form.password.trim() === ''; 

    if (isEmailEmpty || isEmailFormatInvalid || isPasswordEmpty) {
      setErrors((prev) => ({
        ...prev,
        email: isEmailEmpty,
        emailFormat: isEmailFormatInvalid,
        password: isPasswordEmpty,
      }));
      return;
    }

    setLoading(true);
    setErrors((prev) => ({ ...prev, apiError: '', successMsg: '' }));

    try {
      if (isForgotMode) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setErrors((prev) => ({
          ...prev,
          successMsg: 'Reset link has been sent to your email!',
        }));
      } else {
        const response = await authAPI.login({
          email: form.email,
          password: form.password,
        });

        setToken(response.accessToken);
        const userRole = response.role || 'user'; 
        sessionStorage.setItem('userRole', userRole);
        navigate(`/${userRole}/overview`);
      }
    } catch (error) {
      const errorMessage = isForgotMode 
        ? 'Email does not exist in the system.' 
        : 'Incorrect email or password. Please try again!';

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
    if (errors.apiError || errors.successMsg) 
      setErrors((e) => ({ ...e, apiError: '', successMsg: '' }));
  };

  const toggleMode = () => {
    setIsForgotMode(!isForgotMode);
    setErrors({ email: false, emailFormat: false, password: false, apiError: '', successMsg: '' });
    setShowPassword(false); // Reset con mắt khi đổi tab 
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#0B1020' }}
    >
      {/* Background Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-[0.14]" style={{ background: '#4F8CFF' }} />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full blur-3xl opacity-10" style={{ background: '#8B5CF6' }} />
        {PARTICLES.slice(0, 18).map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{ width: p.size, height: p.size, left: `${p.left}%`, top: `${p.top}%`, background: p.color, opacity: 0.18 }}
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="relative z-10 w-full max-w-md mx-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)' }}>
            <Microscope size={18} className="text-white" />
          </div>
          <span className="text-lg font-black text-white tracking-widest" style={{ fontFamily: "'Outfit', sans-serif" }}>SCITRACK</span>
        </div>

        {/* Form Box */}
        <div className="rounded-2xl border p-8" style={{ background: 'rgba(27,34,53,0.85)', borderColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(24px)' }}>
          <motion.div layout>
            <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {isForgotMode ? 'Reset Password' : 'Welcome back'}
            </h2>
            <p className="text-sm mb-6" style={{ color: '#A0AEC0' }}>
              {isForgotMode ? "Enter your email to receive a reset link" : "Sign in to your research dashboard"}
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Input Email */}
            <motion.div layout>
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
              {errors.email && <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-500"><AlertCircle size={10} /> Please enter your email</div>}
              {errors.emailFormat && <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-500"><AlertCircle size={10} /> Invalid email format</div>}
            </motion.div>

            {/* Password & Remember me */}
            <AnimatePresence>
              {!isForgotMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div>
                    <label className="text-xs font-semibold text-white block mb-1.5">Password</label>
                    <div className="relative">
                      <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: errors.password ? '#EF4444' : '#A0AEC0' }} />
                      
                      {/* CÁI Ô INPUT MẬT KHẨU NÀY ĐÃ ĐƯỢC CHỈNH TYPE */}
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        // LƯU Ý: Tui đã tăng padding right lên pr-10 để chữ không đè lên con mắt
                        className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                          errors.password ? 'border-red-500 bg-red-500/5 focus:border-red-400' : 'border-white/10 bg-[#131A2A] focus:border-[#4F8CFF]'
                        }`}
                        style={{ color: '#E2E8F0' }}
                      />

                      {/* NÚT CON MẮT */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors hover:bg-white/10"
                        style={{ color: '#A0AEC0' }}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {errors.password && <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-500"><AlertCircle size={10} /> Please enter your password</div>}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer" style={{ color: '#A0AEC0' }}>
                      <input type="checkbox" className="rounded bg-[#131A2A] border-white/10" /> Remember me
                    </label>
                    <button type="button" onClick={toggleMode} className="font-semibold transition-colors hover:text-white" style={{ color: '#4F8CFF' }}>
                      Forgot password?
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lỗi API */}
            {errors.apiError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-medium text-red-500 flex items-center gap-2">
                <AlertCircle size={14} /> {errors.apiError}
              </motion.div>
            )}

            {/* Thông báo thành công */}
            {errors.successMsg && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-medium text-emerald-500 flex items-center gap-2">
                <CheckCircle2 size={14} /> {errors.successMsg}
              </motion.div>
            )}

            {/* Nút Submit */}
            <motion.button
              layout
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-4"
              style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)', opacity: loading ? 0.8 : 1 }}
            >
              {loading ? (
                <><RefreshCw size={14} className="animate-spin" /> {isForgotMode ? 'Sending…' : 'Signing in…'}</>
              ) : (
                isForgotMode ? 'Send Reset Link' : 'Sign In'
              )}
            </motion.button>
          </form>

          {/* Footer Card */}
          <motion.div layout className="mt-6 pt-5 border-t text-center text-xs flex flex-col gap-3" style={{ borderColor: 'rgba(255,255,255,0.07)', color: '#A0AEC0' }}>
            {isForgotMode ? (
              <button onClick={toggleMode} className="font-semibold flex items-center justify-center gap-1.5 transition-colors hover:text-white" style={{ color: '#A0AEC0' }}>
                <ArrowLeft size={12} /> Back to login
              </button>
            ) : (
              <span>
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold hover:text-white transition-colors" style={{ color: '#4F8CFF' }}>Register</Link>
              </span>
            )}
          </motion.div>
        </div>

        <button onClick={() => navigate('/')} className="mt-5 w-full text-center text-xs transition-colors hover:text-white" style={{ color: '#6B7280' }}>
          ← Back to landing page
        </button>
      </motion.div>
    </div>
  );
}