import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import {
  Mail,
  Lock,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { authAPI } from '../../lib/api/auth.api';
import { useAuthStore } from '../../store/useAuthStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setTokens);
  const { t } = useTranslation('auth');

  const [isForgotMode, setIsForgotMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: false,
    emailFormat: false,
    password: false,
    apiError: '',
    successMsg: '',
  });

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: false }));
    if (field === 'email' && errors.emailFormat)
      setErrors((e) => ({ ...e, emailFormat: false }));
    if (errors.apiError || errors.successMsg)
      setErrors((e) => ({ ...e, apiError: '', successMsg: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEmailEmpty = form.email.trim() === '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailFormatInvalid = !isEmailEmpty && !emailRegex.test(form.email);
    const isPasswordEmpty = !isForgotMode && form.password.trim() === '';

    if (isEmailEmpty || isEmailFormatInvalid || isPasswordEmpty) {
      setErrors((prev) => ({ ...prev, email: isEmailEmpty, emailFormat: isEmailFormatInvalid, password: isPasswordEmpty }));
      return;
    }

    setLoading(true);
    setErrors((prev) => ({ ...prev, apiError: '', successMsg: '' }));

    try {
      if (isForgotMode) {
        const response = await authAPI.forgotPassword({ email: form.email });
        setErrors((prev) => ({ ...prev, successMsg: response.message || t('login.resetDescription') }));
      } else {
        const response = await authAPI.login({ email: form.email, password: form.password });
        setToken(response.accessToken);
        const userRole = response.role;
        sessionStorage.setItem('userRole', userRole);
        navigate(`/${userRole}/overview`);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        (isForgotMode ? t('login.errorEmailNotFound') : t('login.errorInvalidCredentials'));
      setErrors((prev) => ({ ...prev, apiError: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  const toggleForgotMode = () => {
    setIsForgotMode(!isForgotMode);
    setErrors({ email: false, emailFormat: false, password: false, apiError: '', successMsg: '' });
    setShowPassword(false);
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setLoading(true);
    setErrors((prev) => ({ ...prev, apiError: '', successMsg: '' }));

    try {
      const response = await authAPI.googleLogin(credentialResponse.credential);
      setToken(response.accessToken);
      const userRole = response.role;
      sessionStorage.setItem('userRole', userRole);
      navigate(`/${userRole}/overview`);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || t('login.errorInvalidCredentials');
      setErrors((prev) => ({ ...prev, apiError: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-gray-200/60 dark:border-white/[0.08] p-8 lg:p-10 bg-white/70 dark:bg-[#1B2235]/70 backdrop-blur-2xl shadow-2xl shadow-gray-200/50 dark:shadow-black/20 transition-colors duration-500">
      <motion.div layout>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold mb-6 border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Zap size={10} /> {isForgotMode ? t('login.passwordRecovery') : t('login.secureAccess')}
        </div>
        <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-1 font-display tracking-tight">
          {isForgotMode ? t('login.resetPassword') : t('login.welcomeBack')}
        </h2>
        <p className="text-sm mb-8 text-gray-500 dark:text-[#A0AEC0]">
          {isForgotMode ? t('login.resetDescription') : t('login.signIn')}
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Email */}
        <motion.div layout>
          <label className="text-xs font-semibold text-gray-700 dark:text-white/90 block mb-1.5 ml-1">
            {t('login.emailLabel')}
          </label>
          <div className="relative group">
            <Mail
              size={14}
              className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors ${
                errors.email || errors.emailFormat
                  ? 'text-red-400'
                  : 'text-gray-400 dark:text-[#A0AEC0] group-focus-within:text-blue-500'
              }`}
            />
            <input
              type="email"
              placeholder={t('login.emailPlaceholder')}
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`relative w-full pl-11 pr-4 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 ${
                errors.email || errors.emailFormat
                  ? 'border-red-300 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/[0.04]'
                  : 'border-gray-200 dark:border-white/[0.08] bg-gray-50/50 dark:bg-white/[0.03] focus:border-blue-400 dark:focus:border-blue-500/50 focus:bg-white dark:focus:bg-white/[0.06]'
              } text-gray-900 dark:text-[#E2E8F0] placeholder:text-gray-400 dark:placeholder:text-gray-500`}
            />
          </div>
          {errors.email && (
            <div className="flex items-center gap-1 mt-1.5 ml-1 text-[11px] font-medium text-red-500">
              <AlertCircle size={10} /> {t('login.validation.emailRequired')}
            </div>
          )}
          {errors.emailFormat && (
            <div className="flex items-center gap-1 mt-1.5 ml-1 text-[11px] font-medium text-red-500">
              <AlertCircle size={10} /> {t('login.validation.emailInvalid')}
            </div>
          )}
        </motion.div>

        {/* Password */}
        <AnimatePresence>
          {!isForgotMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-white/90 block mb-1.5 ml-1">
                  {t('login.passwordLabel')}
                </label>
                <div className="relative group">
                  <Lock
                    size={14}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors ${
                      errors.password ? 'text-red-400' : 'text-gray-400 dark:text-[#A0AEC0] group-focus-within:text-blue-500'
                    }`}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('login.passwordPlaceholder')}
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`relative w-full pl-11 pr-12 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 ${
                      errors.password
                        ? 'border-red-300 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/[0.04]'
                        : 'border-gray-200 dark:border-white/[0.08] bg-gray-50/50 dark:bg-white/[0.03] focus:border-blue-400 dark:focus:border-blue-500/50 focus:bg-white dark:focus:bg-white/[0.06]'
                    } text-gray-900 dark:text-[#E2E8F0] placeholder:text-gray-400 dark:placeholder:text-gray-500`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-lg transition-colors text-gray-400 dark:text-[#A0AEC0] hover:bg-gray-200 dark:hover:bg-white/10"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center gap-1 mt-1.5 ml-1 text-[11px] font-medium text-red-500">
                    <AlertCircle size={10} /> {t('login.validation.passwordRequired')}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <label className="flex items-center gap-2.5 cursor-pointer text-gray-500 dark:text-[#A0AEC0] hover:text-gray-700 dark:hover:text-white/80 transition-colors">
                  <input type="checkbox" className="rounded-md border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-[#131A2A] accent-blue-500 w-4 h-4" />
                  {t('login.rememberMe')}
                </label>
                <button
                  type="button"
                  onClick={toggleForgotMode}
                  className="font-semibold transition-colors text-blue-600 dark:text-[#4F8CFF] hover:text-blue-700 dark:hover:text-blue-300"
                >
                  {t('login.forgotPassword')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        {errors.apiError && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
              <AlertCircle size={14} className="text-red-500" />
            </div>
            {errors.apiError}
          </motion.div>
        )}
        {errors.successMsg && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 size={14} className="text-emerald-500" />
            </div>
            {errors.successMsg}
          </motion.div>
        )}

        {/* Submit */}
        <motion.button
          layout
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="relative w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 overflow-hidden transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 shadow-lg shadow-blue-500/20"
          style={{ opacity: loading ? 0.85 : 1 }}
        >
          <span className="relative z-10 flex items-center gap-2">
            {loading ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                {isForgotMode ? t('login.sending') : t('login.signingIn')}
              </>
            ) : isForgotMode ? (
              t('login.sendResetLink')
            ) : (
              t('login.signInButton')
            )}
          </span>
        </motion.button>

        {/* Google Sign-In */}
        {!isForgotMode && (
          <motion.div layout className="pt-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-white/[0.12] to-transparent" />
              <span className="text-[11px] font-medium text-gray-400 dark:text-[#6B7280] uppercase tracking-wider whitespace-nowrap">
                {t('login.orContinueWith')}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-white/[0.12] to-transparent" />
            </div>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                  setErrors((prev) => ({
                    ...prev,
                    apiError: t('login.errorInvalidCredentials'),
                  }));
                }}
                theme="filled_black"
                size="large"
                text="signin_with"
                shape="pill"
                width="100%"
              />
            </div>
          </motion.div>
        )}
      </form>

      {/* Footer */}
      <motion.div layout className="mt-7 pt-6 border-t border-gray-200 dark:border-white/[0.06] text-center text-xs">
        {isForgotMode ? (
          <button onClick={toggleForgotMode} className="font-semibold flex items-center justify-center gap-1.5 mx-auto transition-colors text-gray-500 dark:text-[#A0AEC0] hover:text-gray-900 dark:hover:text-white">
            <ArrowLeft size={13} /> {t('login.backToLogin')}
          </button>
        ) : (
          <span className="text-gray-500 dark:text-[#A0AEC0]">
            {t('login.noAccount')}{' '}
            <Link to="/register" className="font-bold transition-colors text-blue-600 dark:text-[#4F8CFF] hover:text-blue-700 dark:hover:text-blue-300">
              {t('login.register')}
            </Link>
          </span>
        )}
      </motion.div>
    </div>
  );
}
