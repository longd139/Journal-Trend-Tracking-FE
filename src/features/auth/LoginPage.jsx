import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
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
import { authAPI } from './api';
import { useAuthStore } from '../user/store';
import ScitrackSLogo from '../../components/prisma/ScitrackSLogo';

/* ═══════════════════════════════════════════════════════════════════════════
   Right panel — rotated stats
   ═══════════════════════════════════════════════════════════════════════════ */

const STATS = [
  { value: '52.3M+', label: 'Papers indexed across 200+ databases' },
  { value: '99.2%', label: 'Data uptime with real-time synchronization' },
  { value: '13.4K+', label: 'Active researchers worldwide' },
  { value: '5 endpoints', label: 'REST, GraphQL, gRPC, WebSocket, OData' },
];

function AtmospherePanel({ isForgotMode, t }) {
  const [currentStat, setCurrentStat] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % STATS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden lg:flex w-[45%] relative flex-col justify-center p-10 xl:p-14 overflow-hidden">
      {/* Light gradient — keep right side brighter to see the library bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 space-y-6 pb-6">
        {/* Large SCITRACK Logo */}
        <div className="flex flex-col items-start gap-1.5">
          <div className="flex items-center">
            <ScitrackSLogo className="text-[#DEDBC8] -mr-2 w-14 h-20 xl:w-[4rem] xl:h-[5.7rem]" />
            <span className="text-5xl xl:text-6xl font-black text-white font-outfit tracking-[0.05em] leading-none drop-shadow-lg">
              CITRACK
            </span>
          </div>
          <p className="text-sm text-gray-300 max-w-xs leading-relaxed">
            {t('login.platformDesc')}
          </p>
        </div>

        {/* Animated stat */}
        <div className="relative h-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStat}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -24, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <div className="text-3xl font-black text-white font-outfit drop-shadow-md">
                {STATS[currentStat].value}
              </div>
              <p className="text-sm text-gray-300 mt-1.5 max-w-xs leading-relaxed">
                {STATS[currentStat].label}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot indicators */}
        <div className="flex gap-2">
          {STATS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStat(i)}
              className={`rounded-full transition-all duration-500 active:scale-[0.92] ${
                i === currentStat
                  ? 'w-8 h-1.5 bg-[#DEDBC8]'
                  : 'w-1.5 h-1.5 bg-[#DEDBC8]/25 hover:bg-[#DEDBC8]/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Left panel — form
   ═══════════════════════════════════════════════════════════════════════════ */

const formItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

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
        setToken(response.accessToken);
        const userRole = response.role;
        sessionStorage.setItem('userRole', userRole);
        toast.success(t('login.welcomeBack') + '!', { duration: 3000 });
        navigate(`/${userRole}/overview`);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        (isForgotMode
          ? t('login.errorEmailNotFound')
          : t('login.errorInvalidCredentials'));
      setErrors((prev) => ({ ...prev, apiError: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  const toggleForgotMode = () => {
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

  // Google OAuth — custom button with useGoogleLogin hook
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setErrors((prev) => ({ ...prev, apiError: '', successMsg: '' }));
      try {
        // id_token may be present alongside access_token (implicit flow + openid scope)
        const credential = tokenResponse.id_token || tokenResponse.access_token;
        const response = await authAPI.googleLogin(credential);
        setToken(response.accessToken);
        const userRole = response.role;
        sessionStorage.setItem('userRole', userRole);
        toast.success(t('login.welcomeBack') + '!', { duration: 3000 });
        navigate(`/${userRole}/overview`);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || t('login.errorInvalidCredentials');
        setErrors((prev) => ({ ...prev, apiError: errorMessage }));
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setErrors((prev) => ({
        ...prev,
        apiError: t('login.errorInvalidCredentials'),
      }));
    },
    flow: 'implicit',
  });

  /* ── Shared input class ──────────────────────────────────────────────── */
  const inputBase =
    'w-full pl-11 pr-4 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 text-[#E1E0CC] placeholder:text-gray-400 shadow-[0_0_0_1px_rgba(222,219,200,0.05)]';
  const inputDefault =
    'border-[#DEDBC8]/35 bg-[#151922] focus:border-[#DEDBC8] focus:bg-[#1C2130] focus:shadow-[0_0_18px_rgba(222,219,200,0.10)] focus:ring-1 focus:ring-[#DEDBC8]/20';
  const inputError = 'border-red-500/50 bg-red-500/[0.08]';

  return (
    <div className="min-h-[100dvh] flex bg-black relative overflow-hidden">
      {/* ─── Full-page library background (like AuthLayout) ──────────────── */}
      <img
        className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none"
        src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1400&h=900&fit=crop"
        alt=""
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/5 to-transparent pointer-events-none" />

      {/* Global noise overlay */}
      <div className="noise-overlay opacity-[0.04]" style={{ mixBlendMode: 'overlay' }} />

      {/* ─── Left panel dark overlay — form side deeper black ──────────── */}
      <div className="absolute left-0 top-0 bottom-0 w-[55%] lg:w-[55%] bg-black/50 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent pointer-events-none" />

      {/* ═════════════════════════════════════════════════════════════════
         LEFT — Form
         ═════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">

        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile logo */}
          <motion.div
            {...formItem}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="flex items-center gap-1 mb-8 lg:hidden"
          >
            <ScitrackSLogo className="text-[#DEDBC8] -mr-1 w-7 h-10" />
            <span className="text-lg font-black text-[#E1E0CC] tracking-[0.05em] font-outfit">
              CITRACK
            </span>
          </motion.div>

          {/* Badge */}
          <motion.div {...formItem} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold mb-6 border border-[#DEDBC8]/20 bg-[#DEDBC8]/10 text-[#DEDBC8]">
              <Zap size={10} />
              {isForgotMode ? t('login.passwordRecovery') : t('login.secureAccess')}
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div {...formItem} transition={{ duration: 0.5, delay: 0.15 }}>
            <h2 className="text-3xl lg:text-4xl font-black text-[#E1E0CC] mb-2 font-display tracking-tight leading-tight">
              {isForgotMode ? t('login.resetPassword') : t('login.welcomeBack')}
            </h2>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
              {isForgotMode
                ? t('login.resetDescription')
                : t('login.signIn')}
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* ── Email ──────────────────────────────────────────────── */}
            <motion.div {...formItem} transition={{ duration: 0.5, delay: 0.2 }}>
              <label className="text-xs font-semibold text-[#DEDBC8]/80 block mb-1.5 ml-1">
                {t('login.emailLabel')}
              </label>
              <div className="relative group">
                <Mail
                  size={14}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300 ${
                    errors.email || errors.emailFormat
                      ? 'text-red-400'
                      : 'text-[#DEDBC8]/80 group-focus-within:text-[#DEDBC8]'
                  }`}
                />
                <input
                  type="email"
                  placeholder={t('login.emailPlaceholder')}
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`${inputBase} ${
                    errors.email || errors.emailFormat ? inputError : inputDefault
                  }`}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-1 mt-1.5 ml-1 text-[11px] font-medium text-red-400"
                  >
                    <AlertCircle size={10} /> {t('login.validation.emailRequired')}
                  </motion.div>
                )}
                {errors.emailFormat && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-1 mt-1.5 ml-1 text-[11px] font-medium text-red-400"
                  >
                    <AlertCircle size={10} /> {t('login.validation.emailInvalid')}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── Password ────────────────────────────────────────────── */}
            <AnimatePresence>
              {!isForgotMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <motion.div
                    {...formItem}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    className="space-y-1.5"
                  >
                    <label className="text-xs font-semibold text-[#DEDBC8]/80 block mb-1.5 ml-1">
                      {t('login.passwordLabel')}
                    </label>
                    <div className="relative group">
                      <Lock
                        size={14}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300 ${
                          errors.password
                            ? 'text-red-400'
                            : 'text-[#DEDBC8]/80 group-focus-within:text-[#DEDBC8]'
                        }`}
                      />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('login.passwordPlaceholder')}
                        value={form.password}
                        onChange={(e) => handleChange('password', e.target.value.trim())}
                        className={`${inputBase} pr-12 ${
                          errors.password ? inputError : inputDefault
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-lg transition-colors text-[#DEDBC8]/80 hover:text-[#DEDBC8] hover:bg-white/5 active:scale-[0.95]"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {errors.password && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="flex items-center gap-1 mt-1.5 ml-1 text-[11px] font-medium text-red-400"
                        >
                          <AlertCircle size={10} /> {t('login.validation.passwordRequired')}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Remember + Forgot */}
                  <motion.div
                    {...formItem}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex items-center justify-between text-xs pt-2 px-1"
                  >
                    <label className="flex items-center gap-2.5 cursor-pointer text-gray-300 hover:text-[#E1E0CC] transition-colors select-none active:scale-[0.98]">
                      <span className="relative flex items-center justify-center w-4 h-4">
                        <input type="checkbox" className="sr-only peer" />
                        <span className="absolute inset-0 rounded border border-[#DEDBC8]/50 bg-white/[0.04] peer-checked:bg-[#DEDBC8] peer-checked:border-[#DEDBC8] transition-all duration-200" />
                        <svg className="relative w-2.5 h-2.5 text-transparent peer-checked:text-black transition-colors pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </span>
                      {t('login.rememberMe')}
                    </label>
                    <button
                      type="button"
                      onClick={toggleForgotMode}
                      className="font-semibold transition-colors text-[#DEDBC8] hover:text-[#E1E0CC] active:scale-[0.97] inline-block"
                    >
                      {t('login.forgotPassword')}
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Messages ────────────────────────────────────────────── */}
            <AnimatePresence>
              {errors.apiError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs font-medium text-red-400 flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                    <AlertCircle size={14} className="text-red-400" />
                  </div>
                  {errors.apiError}
                </motion.div>
              )}
              {errors.successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs font-medium text-emerald-400 flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                  </div>
                  {errors.successMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Submit ───────────────────────────────────────────────── */}
            <motion.button
              {...formItem}
              transition={{ duration: 0.5, delay: 0.35 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="relative w-full py-3.5 rounded-full text-sm font-bold text-[#DEDBC8] flex items-center justify-center gap-2 transition-all duration-300 border border-[#DEDBC8]/60 bg-transparent hover:bg-[#DEDBC8] hover:text-black hover:border-[#DEDBC8]"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
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
            </motion.button>

            {/* ── Google OAuth ─────────────────────────────────────────── */}
            {!isForgotMode && (
              <motion.div
                {...formItem}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="pt-2 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#DEDBC8]/15 to-transparent" />
                  <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {t('login.orContinueWith')}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#DEDBC8]/15 to-transparent" />
                </div>
                <div className="flex justify-center w-full">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => googleLogin()}
                    disabled={loading}
                    className="w-full py-3.5 rounded-full text-sm font-bold text-black flex items-center justify-center gap-2.5 transition-all duration-300 bg-[#DEDBC8] hover:bg-[#E1E0CC]"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" className="shrink-0">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </motion.button>
                </div>
              </motion.div>
            )}
          </form>

          {/* ── Footer ─────────────────────────────────────────────────── */}
          <motion.div
            {...formItem}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="mt-7 pt-6 border-t border-[#DEDBC8]/10 text-center text-xs"
          >
            {isForgotMode ? (
              <button
                onClick={toggleForgotMode}
                className="font-semibold flex items-center justify-center gap-1.5 mx-auto transition-colors text-gray-400 hover:text-[#E1E0CC] active:scale-[0.97]"
              >
                <ArrowLeft size={13} /> {t('login.backToLogin')}
              </button>
            ) : (
              <span className="text-gray-400">
                {t('login.noAccount')}{' '}
                <Link
                  to="/register"
                  className="font-bold transition-colors text-[#DEDBC8] hover:text-[#E1E0CC] active:scale-[0.97] inline-block"
                >
                  {t('login.register')}
                </Link>
              </span>
            )}
          </motion.div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════
         RIGHT — Atmosphere (video, typography, stats)
         ═════════════════════════════════════════════════════════════════ */}
      <AtmospherePanel isForgotMode={isForgotMode} t={t} />

      {/* Back to landing */}
      <button
        onClick={() => navigate('/')}
        className="absolute bottom-6 left-6 z-20 text-xs text-gray-500 hover:text-[#DEDBC8] transition-colors flex items-center gap-1.5 active:scale-[0.97]"
      >
        <ArrowLeft size={11} /> Back to home
      </button>
    </div>
  );
}
