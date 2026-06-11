import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Microscope,
  Mail,
  Lock,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { PARTICLES, MOCK_ACCOUNTS } from '../../constants/mockData';
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

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        const response = await authAPI.forgotPassword({ email: form.email });
        setErrors((prev) => ({
          ...prev,
          successMsg: response.message || t('login.resetDescription'),
        }));
      } else {
        const response = await authAPI.login({
          email: form.email,
          password: form.password,
        });

        console.log(response);
        setToken(response.accessToken);

        const userRole = response.role;
        sessionStorage.setItem('userRole', userRole);
        navigate(`/${userRole}/overview`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
        (isForgotMode
          ? 'Email does not exist in the system.'
          : 'Incorrect email or password. Please try again!');

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
    setErrors({
      email: false,
      emailFormat: false,
      password: false,
      apiError: '',
      successMsg: '',
    });
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-300 bg-gray-50 dark:bg-[#0B1020]">
      {/* Background Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-5 dark:opacity-[0.14] bg-blue-500" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full blur-3xl opacity-5 dark:opacity-10 bg-purple-600" />
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
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
            <Microscope size={18} className="text-white" />
          </div>
          <span
            className="text-lg font-black text-gray-900 dark:text-white tracking-widest font-outfit"
          >
            SCITRACK
          </span>
        </div>

        {/* Form Box */}
        <div className="rounded-2xl border p-8 bg-white/90 dark:bg-[#1B2235]/85 border-gray-200 dark:border-white/10 backdrop-blur-2xl shadow-xl dark:shadow-none transition-colors duration-300">
          <motion.div layout>
            <h2
              className="text-2xl font-black text-gray-900 dark:text-white mb-1 font-display"
            >
              {isForgotMode ? t('login.resetPassword') : t('login.welcomeBack')}
            </h2>
            <p className="text-sm mb-6 text-gray-500 dark:text-[#A0AEC0]">
              {isForgotMode
                ? t('login.resetDescription')
                : t('login.signIn')}
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email Input */}
            <motion.div layout>
              <label className="text-xs font-semibold text-gray-700 dark:text-white block mb-1.5">
                {t('login.emailLabel')}
              </label>
              <div className="relative">
                <Mail
                  size={13}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    errors.email ? 'text-red-500' : 'text-gray-400 dark:text-[#A0AEC0]'
                  }`}
                />
                <input
                  type="email"
                  placeholder={t('login.emailPlaceholder')}
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                    errors.email || errors.emailFormat
                      ? 'border-red-500 bg-red-50 dark:bg-red-500/5 focus:border-red-400'
                      : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#131A2A] focus:border-blue-500 dark:focus:border-[#4F8CFF]'
                  } text-gray-900 dark:text-[#E2E8F0]`}
                />
              </div>
              {errors.email && (
                <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-500">
                  <AlertCircle size={10} /> {t('login.validation.emailRequired')}
                </div>
              )}
              {errors.emailFormat && (
                <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-500">
                  <AlertCircle size={10} /> {t('login.validation.emailInvalid')}
                </div>
              )}
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
                    <label className="text-xs font-semibold text-gray-700 dark:text-white block mb-1.5">
                      {t('login.passwordLabel')}
                    </label>
                    <div className="relative">
                      <Lock
                        size={13}
                        className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                          errors.password ? 'text-red-500' : 'text-gray-400 dark:text-[#A0AEC0]'
                        }`}
                      />

                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('login.passwordPlaceholder')}
                        value={form.password}
                        onChange={(e) =>
                          handleChange('password', e.target.value)
                        }
                        className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                          errors.password
                            ? 'border-red-500 bg-red-50 dark:bg-red-500/5 focus:border-red-400'
                            : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#131A2A] focus:border-blue-500 dark:focus:border-[#4F8CFF]'
                        } text-gray-900 dark:text-[#E2E8F0]`}
                      />

                      {/* Show/Hide password */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors text-gray-400 dark:text-[#A0AEC0] hover:bg-gray-200 dark:hover:bg-white/10"
                      >
                        {showPassword ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-500">
                        <AlertCircle size={10} /> {t('login.validation.passwordRequired')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-500 dark:text-[#A0AEC0]">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-[#131A2A] accent-blue-500"
                      />{' '}
                      {t('login.rememberMe')}
                    </label>
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="font-semibold transition-colors text-blue-600 dark:text-[#4F8CFF] hover:text-blue-800 dark:hover:text-white"
                    >
                      {t('login.forgotPassword')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* API Error */}
            {errors.apiError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-xs font-medium text-red-600 dark:text-red-500 flex items-center gap-2"
              >
                <AlertCircle size={14} /> {errors.apiError}
              </motion.div>
            )}

            {/* Success Message */}
            {errors.successMsg && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-xs font-medium text-emerald-600 dark:text-emerald-500 flex items-center gap-2"
              >
                <CheckCircle2 size={14} /> {errors.successMsg}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              layout
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-4 bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20 transition-opacity"
              style={{ opacity: loading ? 0.8 : 1 }}
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />{' '}
                  {isForgotMode ? t('login.sending') : t('login.signingIn')}
                </>
              ) : isForgotMode ? (
                t('login.sendResetLink')
              ) : (
                t('login.signInButton')
              )}
            </motion.button>
          </form>

          {/* Footer Card */}
          <motion.div
            layout
            className="mt-6 pt-5 border-t border-gray-200 dark:border-white/5 text-center text-xs flex flex-col gap-3 text-gray-500 dark:text-[#A0AEC0]"
          >
            {isForgotMode ? (
              <button
                onClick={toggleMode}
                className="font-semibold flex items-center justify-center gap-1.5 transition-colors text-gray-500 dark:text-[#A0AEC0] hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft size={12} /> {t('login.backToLogin')}
              </button>
            ) : (
              <span>
                {t('login.noAccount')}{' '}
                <Link
                  to="/register"
                  className="font-semibold transition-colors text-blue-600 dark:text-[#4F8CFF] hover:text-blue-800 dark:hover:text-white"
                >
                  {t('login.register')}
                </Link>
              </span>
            )}
          </motion.div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="mt-5 w-full text-center text-xs transition-colors text-gray-500 dark:text-[#6B7280] hover:text-gray-900 dark:hover:text-white"
        >
          {t('login.backToLanding')}
        </button>
      </motion.div>
    </div>
  );
}
