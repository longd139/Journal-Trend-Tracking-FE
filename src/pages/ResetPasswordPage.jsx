import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Lock, RefreshCw, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import ScitrackSLogo from '../components/prisma/ScitrackSLogo';

/* ─── Local cream particles ────────────────────────────────────────────── */
const RESET_PARTICLES = Array.from({ length: 12 }, (_, i) => ({
 id: i,
 size: ((i * 13) % 5) + 2,
 left: (i * 37 + 7) % 100,
 top: (i * 29 + 11) % 100,
 delay: (i * 0.35) % 6,
 dur: ((i * 0.71) % 8) + 12,
}));

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
  <div className="min-h-screen flex items-center justify-center bg-black">
  <div className="noise-overlay opacity-[0.04]" style={{ mixBlendMode: 'overlay' }} />
  <div className="text-center space-y-4 relative z-10">
   <AlertCircle size={48} className="text-red-400 mx-auto" />
   <h2 className="text-xl font-bold text-[#E1E0CC]">Invalid Reset Link</h2>
   <p className="text-sm text-gray-400">The link is invalid or missing a confirmation token.</p>
   <button onClick={() => navigate('/login')} className="text-[#DEDBC8] text-sm font-semibold hover:text-[#E1E0CC] transition-colors">
   {t('resetPassword.backToLogin')}
   </button>
  </div>
  </div>
 );
 }

 return (
 <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
  {/* Noise overlay */}
  <div className="noise-overlay opacity-[0.04]" style={{ mixBlendMode: 'overlay' }} />

  {/* Subtle cream ambient glow */}
  <div className="absolute inset-0 pointer-events-none">
  <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-[0.04] bg-[#DEDBC8]" />
  </div>

  {/* Floating cream particles */}
  <div className="absolute inset-0 pointer-events-none">
  {RESET_PARTICLES.map((p) => (
   <motion.div
   key={p.id}
   className="absolute rounded-full"
   style={{
    width: p.size,
    height: p.size,
    left: `${p.left}%`,
    top: `${p.top}%`,
    background: '#DEDBC8',
    opacity: 0.08,
   }}
   animate={{ y: [0, -20, 0] }}
   transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
   />
  ))}
  </div>

  <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md mx-6">
  <div className="flex items-center justify-center gap-1 mb-8">
   <ScitrackSLogo className="text-[#DEDBC8] -mr-1 w-7 h-10" />
   <span className="text-lg font-black text-[#E1E0CC] tracking-[0.05em] font-outfit">CITRACK</span>
  </div>

  <div className="rounded-2xl border border-[#DEDBC8]/5 p-8 bg-[#101010]">
   {isSuccess ? (
   <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
    <CheckCircle2 size={32} className="text-emerald-400" />
    </div>
    <h2 className="text-xl font-bold text-[#E1E0CC] mb-2 font-display">{t('resetPassword.success')}</h2>
    <p className="text-sm mb-6 text-gray-400">Your password has been successfully changed. Please log in again.</p>
    <button
    onClick={() => navigate('/login')}
    className="w-full py-3 rounded-full text-sm font-bold text-black transition-colors bg-[#DEDBC8] hover:bg-[#E1E0CC]"
    >
    {t('resetPassword.backToLogin')}
    </button>
   </motion.div>
   ) : (
   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <h2 className="text-2xl font-black text-[#E1E0CC] mb-1 font-display">{t('resetPassword.title')}</h2>
    <p className="text-sm mb-6 text-gray-400">Enter a new password for your account.</p>

    <form onSubmit={handleSubmit} noValidate className="space-y-4">
    <div>
     <label className="text-xs font-semibold text-[#DEDBC8]/80 block mb-1.5">{t('resetPassword.newPasswordLabel')}</label>
     <div className="relative">
     <Lock size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.password ? 'text-red-400' : 'text-[#DEDBC8]/40'}`} />
     <input
      type="password"
      placeholder="At least 6 characters"
      value={form.password}
      onChange={(e) => handleChange('password', e.target.value)}
      className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
      errors.password
       ? 'border-red-500/30 bg-red-500/[0.04]'
       : 'border-[#DEDBC8]/10 bg-white/[0.03] focus:border-[#DEDBC8]/50'
      } text-[#E1E0CC]`}
     />
     </div>
     {errors.password && (
     <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-400"><AlertCircle size={10} /> {errors.password}</div>
     )}
    </div>

    <div>
     <label className="text-xs font-semibold text-[#DEDBC8]/80 block mb-1.5">{t('resetPassword.confirmLabel')}</label>
     <div className="relative">
     <Lock size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.confirmPassword ? 'text-red-400' : 'text-[#DEDBC8]/40'}`} />
     <input
      type="password"
      placeholder="Confirm your new password"
      value={form.confirmPassword}
      onChange={(e) => handleChange('confirmPassword', e.target.value)}
      className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
      errors.confirmPassword
       ? 'border-red-500/30 bg-red-500/[0.04]'
       : 'border-[#DEDBC8]/10 bg-white/[0.03] focus:border-[#DEDBC8]/50'
      } text-[#E1E0CC]`}
     />
     </div>
     {errors.confirmPassword && (
     <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-red-400"><AlertCircle size={10} /> {errors.confirmPassword}</div>
     )}
    </div>

    {errors.apiError && (
     <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-medium text-red-400 flex items-center gap-2">
     <AlertCircle size={14} /> {errors.apiError}
     </div>
    )}

    <button
     type="submit"
     disabled={loading}
     className="w-full py-3 rounded-full text-sm font-bold text-black flex items-center justify-center gap-2 mt-4 transition-colors bg-[#DEDBC8] hover:bg-[#E1E0CC]"
     style={{ opacity: loading ? 0.7 : 1 }}
    >
     {loading ? <><RefreshCw size={14} className="animate-spin" /> {t('resetPassword.submitting')}</> : t('resetPassword.submitButton')}
    </button>
    </form>
   </motion.div>
   )}
  </div>

  {!isSuccess && (
   <button onClick={() => navigate('/login')} className="mt-5 w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-[#DEDBC8]">
   <ArrowLeft size={12} /> {t('resetPassword.backToLogin')}
   </button>
  )}
  </motion.div>
 </div>
 );
}
