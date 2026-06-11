import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
  Microscope,
  Mail,
  Lock,
  RefreshCw,
  Building2,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  User,
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
  const { t } = useTranslation('auth');

  const incomingRole = location.state?.role || '';

  const [form, setForm] = useState({
    fullName: '',
    institution: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: incomingRole,
  });

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingUnis, setLoadingUnis] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const setTokens = useAuthStore((state) => state.setTokens);

  useEffect(() => {
    if (!incomingRole) {
      navigate('/auth');
    }
  }, [incomingRole, navigate]);

  useEffect(() => {
    if (form.institution.trim().length < 1) {
      setSuggestions([]);
      return;
    }

    const searchTerm = form.institution.toLowerCase();

    const localMatches = LOCAL_UNIS.filter((uni) =>
      uni.toLowerCase().includes(searchTerm),
    ).map((name) => ({ name }));

    setSuggestions(localMatches.slice(0, 5));

    const timer = setTimeout(async () => {
      setLoadingUnis(true);
      try {
        const res = await fetch(
          `http://universities.hipolabs.com/search?name=${form.institution}`,
        );
        const data = await res.json();
        const apiMatches = data.map((u) => ({ name: u.name }));

        const combined = [...localMatches, ...apiMatches];
        const uniqueSuggestions = Array.from(
          new Set(combined.map((a) => a.name)),
        )
          .map((name) => ({ name }))
          .slice(0, 5);

        setSuggestions(uniqueSuggestions);
      } catch (error) {
        console.error('Error loading universities:', error);
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
    apiError: '',
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
        apiError: '',
      });
      return;
    }

    setLoading(true);
    setErrors((prev) => ({ ...prev, apiError: '' }));

    try {
      const payload = {
        fullName: form.fullName,
        institution: form.institution,
        email: form.email,
        password: form.password,
        role: form.role,
      };

      const response = await authAPI.register(payload);
      const { accessToken } = response;
      if (accessToken) {
        setTokens(accessToken);
      }
      toast.success(t('register.successTitle'), {
        description: t('register.successDescription'),
      });

      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage =
        error.response?.data?.message ||
        t('register.failedDefault');

      toast.error(t('register.failedTitle'), {
        description: errorMessage,
      });

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
    if (errors.apiError) {
      setErrors((e) => ({ ...e, apiError: '' }));
    }
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

      {/* ═══════════════════════════════════════════════════════════════
         LEFT PANEL — Academic Branding
         ═══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex w-[45%] xl:w-[42%] relative flex-col justify-center items-center bg-white/40 dark:bg-[#0B1020]/60 backdrop-blur-sm border-r border-gray-200/50 dark:border-white/[0.06] transition-colors duration-500">
        {/* Decorative circles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[20%] w-3 h-3 rounded-full bg-blue-400/30" />
          <div className="absolute top-[25%] right-[25%] w-2 h-2 rounded-full bg-purple-400/30" />
          <div className="absolute bottom-[30%] left-[30%] w-4 h-4 rounded-full bg-teal-400/20" />
          <div className="absolute top-[55%] right-[20%] w-2.5 h-2.5 rounded-full bg-blue-400/25" />
          <div className="absolute bottom-[20%] right-[35%] w-3 h-3 rounded-full bg-purple-400/20" />
        </div>

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

          {/* Welcome message */}
          <div className="rounded-2xl border border-gray-200/60 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04] backdrop-blur-md p-6">
            <div className="text-sm font-bold text-gray-900 dark:text-white mb-1 font-display">
              {t('register.createFor')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 uppercase tracking-wider">
                {incomingRole}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-[#A0AEC0]">
              {incomingRole === 'researcher'
                ? t('register.roleDescResearcher')
                : t('register.roleDescAcademic')}
            </div>
          </div>
        </motion.div>

        {/* Bottom accent bar */}
        <div className="absolute bottom-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
         RIGHT PANEL — Register Form
         ═══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-[460px]"
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
              <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-1 font-display tracking-tight">
                {t('register.createAccount')}
              </h2>
              <p className="text-sm mb-8 text-gray-500 dark:text-[#A0AEC0]">
                {t('register.createFor')}{' '}
                <span className="font-bold text-blue-600 dark:text-[#4F8CFF] uppercase tracking-wider">
                  {incomingRole}
                </span>
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Full Name */}
              <motion.div layout>
                <label className="text-xs font-semibold text-gray-700 dark:text-white/90 block mb-1.5 ml-1">
                  {t('register.fullNameLabel')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500/20 to-purple-500/20" />
                  <User
                    size={14}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors ${
                      errors.fullName ? 'text-red-400' : 'text-gray-400 dark:text-[#A0AEC0] group-focus-within:text-blue-500'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('register.fullNamePlaceholder')}
                    value={form.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className={`relative w-full pl-11 pr-4 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 ${
                      errors.fullName
                        ? 'border-red-300 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/[0.04]'
                        : 'border-gray-200 dark:border-white/[0.08] bg-gray-50/50 dark:bg-white/[0.03] focus:border-blue-400 dark:focus:border-blue-500/50 focus:bg-white dark:focus:bg-white/[0.06]'
                    } text-gray-900 dark:text-[#E2E8F0] placeholder:text-gray-400 dark:placeholder:text-gray-500`}
                  />
                </div>
                {errors.fullName && (
                  <div className="flex items-center gap-1 mt-1.5 ml-1 text-[11px] font-medium text-red-500">
                    <AlertCircle size={10} /> {t('register.validation.nameRequired')}
                  </div>
                )}
              </motion.div>

              {/* Institution */}
              <motion.div layout className="relative">
                <label className="text-xs font-semibold text-gray-700 dark:text-white/90 block mb-1.5 ml-1">
                  {t('register.institutionLabel')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500/20 to-purple-500/20" />
                  <Building2
                    size={14}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors ${
                      errors.institution ? 'text-red-400' : 'text-gray-400 dark:text-[#A0AEC0] group-focus-within:text-blue-500'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('register.institutionPlaceholder')}
                    value={form.institution}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onChange={(e) => {
                      handleChange('institution', e.target.value);
                      setShowSuggestions(true);
                    }}
                    className={`relative w-full pl-11 pr-10 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 ${
                      errors.institution
                        ? 'border-red-300 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/[0.04]'
                        : 'border-gray-200 dark:border-white/[0.08] bg-gray-50/50 dark:bg-white/[0.03] focus:border-blue-400 dark:focus:border-blue-500/50 focus:bg-white dark:focus:bg-white/[0.06]'
                    } text-gray-900 dark:text-[#E2E8F0] placeholder:text-gray-400 dark:placeholder:text-gray-500`}
                  />
                  {loadingUnis && (
                    <RefreshCw
                      size={12}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 animate-spin text-gray-400 dark:text-white/50"
                    />
                  )}
                </div>
                {errors.institution && (
                  <div className="flex items-center gap-1 mt-1.5 ml-1 text-[11px] font-medium text-red-500">
                    <AlertCircle size={10} /> {t('register.validation.institutionRequired')}
                  </div>
                )}

                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute z-50 w-full mt-1.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#131A2A] overflow-hidden shadow-2xl">
                    {suggestions.map((uni, idx) => (
                      <li
                        key={idx}
                        onClick={() => {
                          handleChange('institution', uni.name);
                          setShowSuggestions(false);
                        }}
                        className="px-4 py-2.5 text-xs text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4F8CFF1A] cursor-pointer border-b border-gray-100 dark:border-white/5 last:border-b-0 transition-colors"
                      >
                        {uni.name}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>

              {/* Email */}
              <motion.div layout>
                <label className="text-xs font-semibold text-gray-700 dark:text-white/90 block mb-1.5 ml-1">
                  {t('register.emailLabel')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500/20 to-purple-500/20" />
                  <Mail
                    size={14}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors ${
                      errors.email || errors.emailFormat ? 'text-red-400' : 'text-gray-400 dark:text-[#A0AEC0] group-focus-within:text-blue-500'
                    }`}
                  />
                  <input
                    type="email"
                    placeholder={t('register.emailPlaceholder')}
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
                    <AlertCircle size={10} /> {t('register.validation.emailRequired')}
                  </div>
                )}
                {errors.emailFormat && (
                  <div className="flex items-center gap-1 mt-1.5 ml-1 text-[11px] font-medium text-red-500">
                    <AlertCircle size={10} /> {t('register.validation.emailInvalid')}
                  </div>
                )}
              </motion.div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Password */}
                <motion.div layout>
                  <label className="text-xs font-semibold text-gray-700 dark:text-white/90 block mb-1.5 ml-1">
                    {t('register.passwordLabel')}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500/20 to-purple-500/20" />
                    <Lock
                      size={14}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors ${
                        errors.password ? 'text-red-400' : 'text-gray-400 dark:text-[#A0AEC0] group-focus-within:text-blue-500'
                      }`}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('register.passwordPlaceholder')}
                      value={form.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className={`relative w-full pl-11 pr-10 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 ${
                        errors.password
                          ? 'border-red-300 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/[0.04]'
                          : 'border-gray-200 dark:border-white/[0.08] bg-gray-50/50 dark:bg-white/[0.03] focus:border-blue-400 dark:focus:border-blue-500/50 focus:bg-white dark:focus:bg-white/[0.06]'
                      } text-gray-900 dark:text-[#E2E8F0] placeholder:text-gray-400 dark:placeholder:text-gray-500`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-lg transition-colors text-gray-400 dark:text-[#A0AEC0] hover:bg-gray-200 dark:hover:bg-white/10"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="flex items-center gap-1 mt-1.5 ml-1 text-[11px] font-medium text-red-500">
                      <AlertCircle size={10} /> {t('register.validation.passwordRequired')}
                    </div>
                  )}
                </motion.div>

                {/* Confirm Password */}
                <motion.div layout>
                  <label className="text-xs font-semibold text-gray-700 dark:text-white/90 block mb-1.5 ml-1">
                    {t('register.confirmPasswordLabel')}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500/20 to-purple-500/20" />
                    <Lock
                      size={14}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors ${
                        errors.confirmPassword ? 'text-red-400' : 'text-gray-400 dark:text-[#A0AEC0] group-focus-within:text-blue-500'
                      }`}
                    />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t('register.confirmPasswordPlaceholder')}
                      value={form.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      className={`relative w-full pl-11 pr-10 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 ${
                        errors.confirmPassword
                          ? 'border-red-300 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/[0.04]'
                          : 'border-gray-200 dark:border-white/[0.08] bg-gray-50/50 dark:bg-white/[0.03] focus:border-blue-400 dark:focus:border-blue-500/50 focus:bg-white dark:focus:bg-white/[0.06]'
                      } text-gray-900 dark:text-[#E2E8F0] placeholder:text-gray-400 dark:placeholder:text-gray-500`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-lg transition-colors text-gray-400 dark:text-[#A0AEC0] hover:bg-gray-200 dark:hover:bg-white/10"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.confirmPassword && !errors.mismatch && (
                    <div className="flex items-center gap-1 mt-1.5 ml-1 text-[11px] font-medium text-red-500">
                      <AlertCircle size={10} /> {t('register.validation.confirmRequired')}
                    </div>
                  )}
                </motion.div>
              </div>

              {errors.mismatch && (
                <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-red-500">
                  <AlertCircle size={10} /> {t('register.validation.mismatch')}
                </div>
              )}

              {/* API Error */}
              {errors.apiError && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                    <AlertCircle size={14} className="text-red-500" />
                  </div>
                  {errors.apiError}
                </motion.div>
              )}

              {/* Submit */}
              <motion.button
                layout
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="relative w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 overflow-hidden shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
                style={{ opacity: loading ? 0.85 : 1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-400" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      {t('register.creating')}
                    </>
                  ) : (
                    t('register.createButton')
                  )}
                </span>
              </motion.button>
            </form>

            {/* Footer */}
            <motion.div layout className="mt-7 pt-6 border-t border-gray-200 dark:border-white/[0.06] text-center text-xs">
              <span className="text-gray-500 dark:text-[#A0AEC0]">
                {t('register.haveAccount')}{' '}
                <Link to="/login" className="font-bold transition-colors text-blue-600 dark:text-[#4F8CFF] hover:text-blue-700 dark:hover:text-blue-300">
                  {t('register.signIn')}
                </Link>
              </span>
            </motion.div>
          </div>

          {/* Back link */}
          <button
            onClick={() => navigate('/')}
            className="mt-6 w-full text-center text-xs transition-colors text-gray-400 dark:text-[#6B7280] hover:text-gray-700 dark:hover:text-white/70 flex items-center justify-center gap-1.5"
          >
            <ArrowLeft size={11} /> {t('register.backToLanding')}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
