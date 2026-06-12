import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Microscope, Lock, RefreshCw, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { PARTICLES } from '../constants/mockData';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('auth');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
    apiError: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    const newErrors = { password: '', confirmPassword: '', apiError: '' };

    if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      hasError = true;
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = t('register.validation.mismatch');
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({ ...newErrors, apiError: '' });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSuccess(true);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        apiError: error.response?.data?.message || 'Reset link has expired or is invalid!',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
    if (errors.apiError) setErrors((e) => ({ ...e, apiError: '' }));
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300 bg-gray-50 dark:bg-[#0B1020]">
        <div className="text-center space-y-4">
          <AlertCircle size={48} className="text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invalid Reset Link</h2>
          <p className="text-sm text-gray-500 dark:text-[#A0AEC0]">The link is invalid or missing a confirmation token.</p>
          <button onClick={() => navigate('/login')} className="text-blue-600 dark:text-[#4F8CFF] text-sm font-semibold hover:text-gray-900 dark:hover:text-white transition-colors">
            {t('resetPassword.backToLogin')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-300 bg-gray-50 dark:bg-[#0B1020]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-5 dark:opacity-[0.14] bg-blue-500" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full blur-3xl opacity-5 dark:opacity-10 bg-purple-600" />
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

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md mx-6">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-teal-400">
            <Microscope size={18} className="text-white" />
          </div>
          <span className="text-lg font-black text-gray-900 dark:text-white tracking-widest font-outfit">SCITRACK</span>
        </div>

        <div className="rounded-2xl border p-8 bg-white/90 dark:bg-[#1B2235]/85 border-gray-200 dark:border-white/10 backdrop-blur-2xl shadow-xl dark:shadow-none transition-colors duration-300">
          {isSuccess ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-500/20">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-display">{t('resetPassword.success')}</h2>
              <p className="text-sm mb-6 text-gray-500 dark:text-[#A0AEC0]">Your password has been successfully changed. Please log in again.</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-500 to-purple-600"
              >
                {t('resetPassword.backToLogin')}
              </button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1 font-display">{t('resetPassword.title')}</h2>
              <p className="text-sm mb-6 text-gray-500 dark:text-[#A0AEC0]">Enter a new password for your account.</p>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-white block mb-1.5">{t('resetPassword.newPasswordLabel')}</label>
                  <div className="relative">
                    <Lock size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.password ? 'text-red-500' : 'text-gray-400 dark:text-[#A0AEC0]'}`} />
                    <input
                      type="password"
                      placeholder="At least 6 characters"
                      value={form.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                        errors.password ? 'border-red-500 bg-red-50 dark:bg-red-500/5 focus:border-red-400' : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#131A2A] focus:border-blue-500 dark:focus:border-[#4F8CFF]'
                      } text-gray-900 dark:text-[#E2E8F0]`}
                    />
                  </div>
                  {errors.password && (
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-500"><AlertCircle size={10} /> {errors.password}</div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-white block mb-1.5">{t('resetPassword.confirmLabel')}</label>
                  <div className="relative">
                    <Lock size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.confirmPassword ? 'text-red-500' : 'text-gray-400 dark:text-[#A0AEC0]'}`} />
                    <input
                      type="password"
                      placeholder="Confirm your new password"
                      value={form.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                        errors.confirmPassword ? 'border-red-500 bg-red-50 dark:bg-red-500/5 focus:border-red-400' : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#131A2A] focus:border-blue-500 dark:focus:border-[#4F8CFF]'
                      } text-gray-900 dark:text-[#E2E8F0]`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-500"><AlertCircle size={10} /> {errors.confirmPassword}</div>
                  )}
                </div>

                {errors.apiError && (
                  <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-xs font-medium text-red-600 dark:text-red-500 flex items-center gap-2">
                    <AlertCircle size={14} /> {errors.apiError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-500/20 transition-opacity bg-gradient-to-r from-blue-500 to-purple-600"
                  style={{ opacity: loading ? 0.8 : 1 }}
                >
                  {loading ? <><RefreshCw size={14} className="animate-spin" /> {t('resetPassword.submitting')}</> : t('resetPassword.submitButton')}
                </button>
              </form>
            </motion.div>
          )}
        </div>

        {!isSuccess && (
          <button onClick={() => navigate('/login')} className="mt-5 w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-[#6B7280] transition-colors hover:text-gray-900 dark:hover:text-white">
            <ArrowLeft size={12} /> {t('resetPassword.backToLogin')}
          </button>
        )}
      </motion.div>
    </div>
  );
}
