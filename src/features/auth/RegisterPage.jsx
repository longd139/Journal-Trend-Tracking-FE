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
 ArrowLeft,
 CheckCircle2,
} from 'lucide-react';
import { authAPI } from './api';
import { useAuthStore } from '../user/store';

const LOCAL_UNIS = [
 'Van Lang University',
 'FPT University',
 'B�ch khoa University',
 'Khoa h?c T? nhi�n University',
 'C�ng ngh? Th�ng tin (UIT) University',
 'Qu?c t? TP.HCM University',
 'RMIT University',
 'T�n �?c Th?ng University',
 'Kinh t? TP.HCM University',
 'Ngo?i thuong University',
 'Y Du?c University',
 'Su ph?m K? thu?t University',
 'C�ng nghi?p University',
];

export default function RegisterPage() {
 const location = useLocation();
 const navigate = useNavigate();
 const { t } = useTranslation('auth');
 const { t: tv } = useTranslation('verify');

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
 const [registrationComplete, setRegistrationComplete] = useState(false);

 const [errors, setErrors] = useState({
 fullName: false,
 fullNameInvalid: false,
 institution: false,
 email: false,
 emailFormat: false,
 password: false,
 passwordWeak: false,
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

 // Full name: no digits or special chars (allow spaces, letters, Vietnamese chars)
 const nameRegex = /^[\p{L}\s]+$/u;
 const isNameInvalid = !isNameEmpty && !nameRegex.test(form.fullName.trim());

 // Password: min 8 chars + at least 1 special char
 const isPasswordTooShort = !isPasswordEmpty && form.password.length < 8;
 const passwordSpecialRegex = /[@#$%^&*!?_~\-]/;
 const isPasswordWeak = !isPasswordEmpty && !passwordSpecialRegex.test(form.password);

 const isMismatch =
  !isPasswordEmpty &&
  !isConfirmEmpty &&
  form.password !== form.confirmPassword;

 if (
  isNameEmpty ||
  isNameInvalid ||
  isInstitutionEmpty ||
  isEmailEmpty ||
  isEmailFormatInvalid ||
  isPasswordEmpty ||
  isPasswordTooShort ||
  isPasswordWeak ||
  isConfirmEmpty ||
  isMismatch
 ) {
  setErrors({
  fullName: isNameEmpty,
  fullNameInvalid: isNameInvalid,
  institution: isInstitutionEmpty,
  email: isEmailEmpty,
  emailFormat: isEmailFormatInvalid,
  password: isPasswordEmpty,
  passwordWeak: isPasswordTooShort || isPasswordWeak,
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
  setRegistrationComplete(true);
  toast.success(tv('register.checkEmail'));
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
 <div>
  {registrationComplete ? (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6 py-8"
    >
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 size={28} className="text-emerald-500" />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          {tv('register.verifyTitle')}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
          {tv('register.verifyDescription', { email: form.email })}
        </p>
      </div>
      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-left">
        <p className="text-[11px] text-amber-400 font-medium mb-2">{tv('register.didntReceive')}</p>
        <ul className="text-[11px] text-muted-foreground space-y-1">
          <li>� {tv('register.tipSpam')}</li>
          <li>� {tv('register.tipCorrect')}</li>
          <li>� {tv('register.tipResend')}</li>
        </ul>
      </div>
      <Link
        to="/login"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
      >
        {tv('register.goToLogin')}
      </Link>
    </motion.div>
  ) : (
    <>
  <motion.div layout>
  <Link
   to="/auth"
   className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors active:scale-[0.97]"
  >
   <ArrowLeft size={13} /> {t('roleSelect.heading')}
  </Link>
  <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-1 font-display tracking-tight">
   {t('register.createAccount')}
  </h2>
  <p className="text-sm mb-8 text-foreground/80">
   {t('register.createFor')}{' '}
   <span className="font-bold text-primary uppercase tracking-wider">
   {incomingRole}
   </span>
  </p>
  </motion.div>

  <form onSubmit={handleSubmit} noValidate className="space-y-5">
  {/* Full Name */}
  <motion.div layout>
   <label className="text-xs font-semibold text-primary/80 block mb-1.5 ml-1">
   {t('register.fullNameLabel')}
   </label>
   <div className="relative group">
   <User
    size={14}
    className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors ${
    errors.fullName ? 'text-red-400' : 'text-primary/80 group-focus-within:text-primary'
    }`}
   />
   <input
    type="text"
    placeholder={t('register.fullNamePlaceholder')}
    value={form.fullName}
    onChange={(e) => handleChange('fullName', e.target.value)}
    className={`relative w-full pl-11 pr-4 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 ${
    errors.fullName
     ? 'border-red-500/50 bg-red-500/[0.08]'
     : 'border-border0 bg-card focus:border-primary focus:bg-card focus:shadow-primary/10 focus:ring-1 focus:ring-primary/20'
    } text-foreground placeholder:text-muted-foreground/50`}
   />
   </div>
   {errors.fullName && (
   <div className="flex items-center gap-1 mt-1.5 ml-1 text-[11px] font-medium text-red-400">
    <AlertCircle size={10} /> {t('register.validation.nameRequired')}
   </div>
   )}
   {errors.fullNameInvalid && (
   <div className="flex items-center gap-1 mt-1.5 ml-1 text-[11px] font-medium text-red-400">
    <AlertCircle size={10} /> {t('register.validation.nameInvalid')}
   </div>
   )}
  </motion.div>

  {/* Institution */}
  <motion.div layout className="relative">
   <label className="text-xs font-semibold text-primary/80 block mb-1.5 ml-1">
   {t('register.institutionLabel')}
   </label>
   <div className="relative group">
   <Building2
    size={14}
    className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors ${
    errors.institution ? 'text-red-400' : 'text-primary/80 group-focus-within:text-primary'
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
     ? 'border-red-500/50 bg-red-500/[0.08]'
     : 'border-border0 bg-card focus:border-primary focus:bg-card focus:shadow-primary/10 focus:ring-1 focus:ring-primary/20'
    } text-foreground placeholder:text-muted-foreground/50`}
   />
   {loadingUnis && (
    <RefreshCw
    size={12}
    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 animate-spin text-primary/50"
    />
   )}
   </div>
   {errors.institution && (
   <div className="flex items-center gap-1 mt-1.5 ml-1 text-[11px] font-medium text-red-400">
    <AlertCircle size={10} /> {t('register.validation.institutionRequired')}
   </div>
   )}

   {showSuggestions && suggestions.length > 0 && (
   <ul className="absolute z-50 w-full mt-1.5 rounded-2xl border border-border0 bg-card overflow-hidden shadow-2xl">
    {suggestions.map((uni, idx) => (
    <li
     key={idx}
     onClick={() => {
     handleChange('institution', uni.name);
     setShowSuggestions(false);
     }}
     className="px-4 py-2.5 text-xs text-foreground hover:bg-primary/10 cursor-pointer border-b border-primary/15 last:border-b-0 transition-colors active:scale-[0.98] active:bg-primary/15"
    >
     {uni.name}
    </li>
    ))}
   </ul>
   )}
  </motion.div>

  {/* Email */}
  <motion.div layout>
   <label className="text-xs font-semibold text-primary/80 block mb-1.5 ml-1">
   {t('register.emailLabel')}
   </label>
   <div className="relative group">
   <Mail
    size={14}
    className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors ${
    errors.email || errors.emailFormat ? 'text-red-400' : 'text-primary/80 group-focus-within:text-primary'
    }`}
   />
   <input
    type="email"
    placeholder={t('register.emailPlaceholder')}
    value={form.email}
    onChange={(e) => handleChange('email', e.target.value)}
    className={`relative w-full pl-11 pr-4 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 ${
    errors.email || errors.emailFormat
     ? 'border-red-500/50 bg-red-500/[0.08]'
     : 'border-border0 bg-card focus:border-primary focus:bg-card focus:shadow-primary/10 focus:ring-1 focus:ring-primary/20'
    } text-foreground placeholder:text-muted-foreground/50`}
   />
   </div>
   {errors.email && (
   <div className="flex items-center gap-1 mt-1.5 ml-1 text-[11px] font-medium text-red-400">
    <AlertCircle size={10} /> {t('register.validation.emailRequired')}
   </div>
   )}
   {errors.emailFormat && (
   <div className="flex items-center gap-1 mt-1.5 ml-1 text-[11px] font-medium text-red-400">
    <AlertCircle size={10} /> {t('register.validation.emailInvalid')}
   </div>
   )}
  </motion.div>

  {/* Password & Confirm Password */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
   <motion.div layout>
   <label className="text-xs font-semibold text-primary/80 block mb-1.5 ml-1">
    {t('register.passwordLabel')}
   </label>
   <div className="relative group">
    <Lock
    size={14}
    className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors ${
     errors.password ? 'text-red-400' : 'text-primary/80 group-focus-within:text-primary'
    }`}
    />
    <input
    type={showPassword ? 'text' : 'password'}
    placeholder={t('register.passwordPlaceholder')}
    value={form.password}
    onChange={(e) => handleChange('password', e.target.value.trim())}
    className={`relative w-full pl-11 pr-10 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 ${
     errors.password
     ? 'border-red-500/50 bg-red-500/[0.08]'
     : 'border-border0 bg-card focus:border-primary focus:bg-card focus:shadow-primary/10 focus:ring-1 focus:ring-primary/20'
    } text-foreground placeholder:text-muted-foreground/50`}
    />
    <button
    type="button"
    onClick={() => setShowPassword((v) => !v)}
    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-lg transition-colors text-primary/80 hover:text-primary hover:bg-muted/40 active:scale-[0.95]"
    >
    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
   </div>
   {errors.password && (
    <div className="flex items-center gap-1 mt-1.5 ml-1 text-[11px] font-medium text-red-400">
    <AlertCircle size={10} /> {t('register.validation.passwordRequired')}
    </div>
   )}
   {errors.passwordWeak && (
    <div className="flex items-center gap-1 mt-1.5 ml-1 text-[11px] font-medium text-red-400">
    <AlertCircle size={10} /> {t('register.validation.passwordWeak')}
    </div>
   )}
   </motion.div>

   <motion.div layout>
   <label className="text-xs font-semibold text-primary/80 block mb-1.5 ml-1">
    {t('register.confirmPasswordLabel')}
   </label>
   <div className="relative group">
    <Lock
    size={14}
    className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors ${
     errors.confirmPassword ? 'text-red-400' : 'text-primary/80 group-focus-within:text-primary'
    }`}
    />
    <input
    type={showConfirmPassword ? 'text' : 'password'}
    placeholder={t('register.confirmPasswordPlaceholder')}
    value={form.confirmPassword}
    onChange={(e) => handleChange('confirmPassword', e.target.value.trim())}
    className={`relative w-full pl-11 pr-10 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 ${
     errors.confirmPassword
     ? 'border-red-500/50 bg-red-500/[0.08]'
     : 'border-border0 bg-card focus:border-primary focus:bg-card focus:shadow-primary/10 focus:ring-1 focus:ring-primary/20'
    } text-foreground placeholder:text-muted-foreground/50`}
    />
    <button
    type="button"
    onClick={() => setShowConfirmPassword((v) => !v)}
    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-lg transition-colors text-primary/80 hover:text-primary hover:bg-muted/40 active:scale-[0.95]"
    >
    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
   </div>
   {errors.confirmPassword && !errors.mismatch && (
    <div className="flex items-center gap-1 mt-1.5 ml-1 text-[11px] font-medium text-red-400">
    <AlertCircle size={10} /> {t('register.validation.confirmRequired')}
    </div>
   )}
   </motion.div>
  </div>

  {errors.mismatch && (
   <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-red-400">
   <AlertCircle size={10} /> {t('register.validation.mismatch')}
   </div>
  )}

  {/* API Error */}
  {errors.apiError && (
   <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs font-medium text-red-400 flex items-center gap-2.5">
   <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
    <AlertCircle size={14} className="text-red-400" />
   </div>
   {errors.apiError}
   </motion.div>
  )}

  {/* Submit */}
  <motion.button
   layout
   whileHover={{ scale: 1.02 }}
   whileTap={{ scale: 0.98 }}
   type="submit"
   disabled={loading}
   className="relative w-full py-3.5 rounded-full text-sm font-bold text-primary flex items-center justify-center gap-2 transition-all duration-300 border border-primary/60 bg-transparent hover:bg-primary hover:text-primary-foreground hover:border-primary"
   style={{ opacity: loading ? 0.7 : 1 }}
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
  <motion.div layout className="mt-7 pt-6 border-t border-primary/25 text-center text-xs">
  <span className="text-muted-foreground">
   {t('register.haveAccount')}{' '}
   <Link to="/login" className="font-bold transition-colors text-primary hover:text-foreground active:scale-[0.97] inline-block">
   {t('register.signIn')}
   </Link>
  </span>
  </motion.div>
    </>
  )}
 </div>
 );
}
