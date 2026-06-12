import { useState, useEffect } from 'react';
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
  Zap,
  Sun,
  Moon,
} from 'lucide-react';
import { PARTICLES } from '../../constants/mockData';
import { authAPI } from '../../lib/api/auth.api';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../hooks/useTheme';

// ─── Hex grid nodes ───────────────────────────────────────────────────────
const HEX_NODES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: 15 + (i % 4) * 22,
  y: 12 + Math.floor(i / 4) * 30,
  size: 3 + (i % 3),
  delay: i * 0.25,
  color: ['#4F8CFF', '#8B5CF6', '#00D1B2', '#F59E0B'][i % 4],
}));

export default function LoginPage() {
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setTokens);
  const { t } = useTranslation('auth');
  const { resolvedTheme, setTheme } = useTheme();

  const [isForgotMode, setIsForgotMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);

  const stats = [
    { value: '50M+', label: t('login.statsPapers') },
    { value: '98.7%', label: t('login.statsUptime') },
    { value: '12K+', label: t('login.statsResearchers') },
    { value: '4 APIs', label: t('login.statsApis') },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

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

        setToken(response.accessToken);
        const userRole = response.role;
        sessionStorage.setItem('userRole', userRole);
        navigate(`/${userRole}/overview`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
        (isForgotMode
          ? t('login.errorEmailNotFound')
          : t('login.errorInvalidCredentials'));

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
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-[#0B1020] dark:via-[#0D1528] dark:to-[#0B1020] transition-colors duration-500">
      {/* ─── Background ambient glows ─────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.12] dark:opacity-[0.08] bg-blue-500 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.10] dark:opacity-[0.06] bg-purple-600 animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.06] dark:opacity-[0.04] bg-teal-500 animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* ─── Floating particles ──────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        {PARTICLES.slice(0, 12).map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{ width: p.size, height: p.size, left: `${p.left}%`, top: `${p.top}%`, background: p.color, opacity: 0.12 }}
            animate={{ y: [0, -24, 0], opacity: [0.08, 0.2, 0.08] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* ─── Theme Toggle ────────────────────────────────────────────── */}
      <button
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className="absolute top-5 right-5 z-50 flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:scale-105 bg-white/70 dark:bg-white/10 text-gray-600 dark:text-[#A0AEC0] hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/20 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 shadow-sm"
        title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* ═══════════════════════════════════════════════════════════════
         LEFT PANEL — Academic Branding
         ═══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex w-[45%] xl:w-[42%] relative flex-col justify-center items-center bg-white/40 dark:bg-[#0B1020]/60 backdrop-blur-sm border-r border-gray-200/50 dark:border-white/[0.06] transition-colors duration-500">
        {/* Hex grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] dark:opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hexGrid" width="56" height="98" patternUnits="userSpaceOnUse">
              <path d="M28 0L56 16.2V48.5L28 64.7L0 48.5V16.2Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-900 dark:text-white" />
              <path d="M28 98L56 81.8V49.5L28 33.3L0 49.5V81.8Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-900 dark:text-white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexGrid)" />
        </svg>

        {/* Connecting lines between nodes */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06] dark:opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
          {HEX_NODES.map((node, i) => {
            const next = HEX_NODES[(i + 1) % HEX_NODES.length];
            return (
              <motion.line
                key={`line-${i}`}
                x1={`${node.x}%`} y1={`${node.y}%`}
                x2={`${next.x}%`} y2={`${next.y}%`}
                stroke={node.color}
                strokeWidth="0.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 2, delay: node.delay * 0.5, ease: 'easeInOut' }}
              />
            );
          })}
        </svg>

        {/* Animated nodes */}
        {HEX_NODES.map((node) => (
          <motion.div
            key={node.id}
            className="absolute rounded-full"
            style={{ left: `${node.x}%`, top: `${node.y}%`, width: node.size * 2, height: node.size * 2, background: node.color }}
            animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3 + node.delay, delay: node.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {/* Center content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative z-10 text-center px-12"
        >
          {/* Logo */}
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-8 bg-gradient-to-br from-blue-500 via-purple-500 to-teal-400 shadow-2xl shadow-blue-500/20"
            whileHover={{ scale: 1.05, rotate: -3 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Microscope size={34} className="text-white" />
          </motion.div>

          <h1 className="text-4xl xl:text-5xl font-black text-gray-900 dark:text-white mb-3 font-outfit tracking-tight">
            SCITRACK
          </h1>
          <p className="text-sm text-gray-500 dark:text-[#A0AEC0] mb-10 leading-relaxed max-w-sm mx-auto">
            {t('login.platformDesc')}
          </p>

          {/* Rotating stat card */}
          <div className="relative h-28 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStat}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-gray-200/60 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04] backdrop-blur-md p-6"
              >
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 font-outfit">
                  {stats[currentStat].value}
                </div>
                <div className="text-xs mt-1 text-gray-500 dark:text-[#A0AEC0] font-medium">
                  {stats[currentStat].label}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Stat dots */}
          <div className="flex justify-center gap-2 mt-4">
            {stats.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStat(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentStat
                    ? 'w-6 bg-gradient-to-r from-blue-500 to-purple-600'
                    : 'bg-gray-300 dark:bg-white/20 hover:bg-gray-400 dark:hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Bottom accent bar */}
        <div className="absolute bottom-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
         RIGHT PANEL — Login Form
         ═══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile logo (hidden on desktop) */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
              <Microscope size={18} className="text-white" />
            </div>
            <span className="text-lg font-black text-gray-900 dark:text-white tracking-widest font-outfit">SCITRACK</span>
          </div>

          {/* Form Card */}
          <div className="rounded-3xl border border-gray-200/60 dark:border-white/[0.08] p-8 lg:p-10 bg-white/70 dark:bg-[#1B2235]/70 backdrop-blur-2xl shadow-2xl shadow-gray-200/50 dark:shadow-black/20 transition-colors duration-500">
            <motion.div layout>
              {/* Badge */}
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
                      errors.email || errors.emailFormat ? 'text-red-400' : 'text-gray-400 dark:text-[#A0AEC0] group-focus-within:text-blue-500'
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
                        onClick={toggleMode}
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
            </form>

            {/* Footer */}
            <motion.div layout className="mt-7 pt-6 border-t border-gray-200 dark:border-white/[0.06] text-center text-xs">
              {isForgotMode ? (
                <button onClick={toggleMode} className="font-semibold flex items-center justify-center gap-1.5 mx-auto transition-colors text-gray-500 dark:text-[#A0AEC0] hover:text-gray-900 dark:hover:text-white">
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

          {/* Back link */}
          <button
            onClick={() => navigate('/')}
            className="mt-6 w-full text-center text-xs transition-colors text-gray-400 dark:text-[#6B7280] hover:text-gray-700 dark:hover:text-white/70 flex items-center justify-center gap-1.5"
          >
            <ArrowLeft size={11} /> {t('login.backToLanding')}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
