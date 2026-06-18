import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Mail,
  Lock,
  RefreshCw,
  Building2,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
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
    <div className="rounded-3xl border border-gray-200/60 dark:border-white/[0.08] p-8 lg:p-10 bg-white/70 dark:bg-[#1B2235]/70 backdrop-blur-2xl shadow-2xl shadow-gray-200/50 dark:shadow-black/20 transition-colors duration-500">
      <motion.div layout>
        <Link
          to="/auth"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-[#A0AEC0] hover:text-gray-700 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={13} /> {t('roleSelect.heading')}
        </Link>
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
          <motion.div layout>
            <label className="text-xs font-semibold text-gray-700 dark:text-white/90 block mb-1.5 ml-1">
              {t('register.passwordLabel')}
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

          <motion.div layout>
            <label className="text-xs font-semibold text-gray-700 dark:text-white/90 block mb-1.5 ml-1">
              {t('register.confirmPasswordLabel')}
            </label>
            <div className="relative group">
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
          className="relative w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 overflow-hidden transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 shadow-lg shadow-blue-500/20"
          style={{ opacity: loading ? 0.85 : 1 }}
        >
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
  );
}
