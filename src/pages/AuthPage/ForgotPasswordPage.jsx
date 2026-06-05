import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Microscope, Mail, RefreshCw, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { PARTICLES } from '../../constants/mockData';
import { authAPI } from '../../lib/api/auth.api';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: false,
    emailFormat: false,
    apiError: '',
    successMsg: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const isEmailEmpty = email.trim() === '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailFormatInvalid = !isEmailEmpty && !emailRegex.test(email);

    if (isEmailEmpty || isEmailFormatInvalid) {
      setErrors((prev) => ({
        ...prev,
        email: isEmailEmpty,
        emailFormat: isEmailFormatInvalid,
      }));
      return;
    }

    setLoading(true);
    setErrors((prev) => ({ ...prev, apiError: '', successMsg: '' }));

    try {
      const response = await authAPI.forgotPassword({ email });

      setErrors((prev) => ({
        ...prev,
        successMsg: response.message || 'Reset link has been sent to your email!',
      }));
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.errors ||
        'Failed to send reset link. Please try again.';

      setErrors((prev) => ({
        ...prev,
        apiError: errorMessage,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value) => {
    setEmail(value);
    if (errors.email) setErrors((e) => ({ ...e, email: false }));
    if (errors.emailFormat) setErrors((e) => ({ ...e, emailFormat: false }));
    if (errors.apiError || errors.successMsg)
      setErrors((e) => ({ ...e, apiError: '', successMsg: '' }));
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
          <div>
            <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Reset Password
            </h2>
            <p className="text-sm mb-6" style={{ color: '#A0AEC0' }}>
              Enter your email to receive a reset link
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Input Email */}
            <div>
              <label className="text-xs font-semibold text-white block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: errors.email ? '#EF4444' : '#A0AEC0' }} />
                <input
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => handleChange(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                    errors.email || errors.emailFormat ? 'border-red-500 bg-red-500/5 focus:border-red-400' : 'border-white/10 bg-[#131A2A] focus:border-[#4F8CFF]'
                  }`}
                  style={{ color: '#E2E8F0' }}
                />
              </div>
              {errors.email && <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-500"><AlertCircle size={10} /> Please enter your email</div>}
              {errors.emailFormat && <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-500"><AlertCircle size={10} /> Invalid email format</div>}
            </div>

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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-4"
              style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)', opacity: loading ? 0.8 : 1 }}
            >
              {loading ? (
                <><RefreshCw size={14} className="animate-spin" /> Sending…</>
              ) : (
                'Send Reset Link'
              )}
            </motion.button>
          </form>

          {/* Footer Card */}
          <div className="mt-6 pt-5 border-t text-center text-xs" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <button onClick={() => navigate('/login')} className="font-semibold flex items-center justify-center gap-1.5 transition-colors hover:text-white" style={{ color: '#A0AEC0' }}>
              <ArrowLeft size={12} /> Back to login
            </button>
          </div>
        </div>

        <button onClick={() => navigate('/')} className="mt-5 w-full text-center text-xs transition-colors hover:text-white" style={{ color: '#6B7280' }}>
          ← Back to landing page
        </button>
      </motion.div>
    </div>
  );
}
