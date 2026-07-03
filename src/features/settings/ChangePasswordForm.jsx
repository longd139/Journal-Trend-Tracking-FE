import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { userAPI } from '../user/api';
import { toast } from 'sonner';

/* ═══════════════════════════════════════════════════════════════════════════
   ChangePasswordForm — inline expandable form
   ═══════════════════════════════════════════════════════════════════════════ */

export default function ChangePasswordForm({ visible, onClose }) {
  const { t } = useTranslation('settings');

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    apiError: '',
  });

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
    if (errors.apiError) setErrors((e) => ({ ...e, apiError: '' }));
    if (isSuccess) setIsSuccess(false);
  };

  const toggleShow = (field) => {
    setShow((s) => ({ ...s, [field]: !s[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    const newErrors = { currentPassword: '', newPassword: '', confirmPassword: '', apiError: '' };

    if (!form.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
      hasError = true;
    }
    if (form.newPassword.length < 6) {
      newErrors.newPassword = t('password.error.tooShort');
      hasError = true;
    }
    if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = t('password.error.mismatch');
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({ ...newErrors, apiError: '' });

    try {
      await userAPI.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setIsSuccess(true);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success(t('password.success'));

      // Auto-close after 2.5s
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2500);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        t('password.error.wrongCurrent');
      setErrors((prev) => ({ ...prev, apiError: msg }));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (fieldErr) =>
    `w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition-all duration-300 ${
      fieldErr
        ? 'border-red-500/30 bg-red-500/[0.04] text-red-300'
        : 'border-[#DEDBC8]/10 bg-[#0A0D14] text-[#E1E0CC] placeholder:text-gray-500 focus:border-[#DEDBC8]/40 focus:bg-[#0F1219] focus:shadow-[0_0_18px_rgba(222,219,200,0.06)] focus:ring-1 focus:ring-[#DEDBC8]/15'
    }`;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="pt-6 mt-6 border-t border-[#DEDBC8]/6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Lock size={16} className="text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#E1E0CC] font-display">
                  {t('password.title')}
                </h4>
                <p className="text-[11px] text-gray-400">{t('password.description')}</p>
              </div>
            </div>

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
              >
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span className="text-sm font-medium text-emerald-400">
                  {t('password.success')}
                </span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="text-[11px] font-bold text-[#DEDBC8]/80 uppercase tracking-[0.05em] block mb-1.5 ml-1">
                    {t('password.currentPassword')}
                  </label>
                  <div className="relative">
                    <Lock
                      size={13}
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 z-10 ${
                        errors.currentPassword ? 'text-red-400' : 'text-gray-500'
                      }`}
                    />
                    <input
                      type={show.current ? 'text' : 'password'}
                      value={form.currentPassword}
                      onChange={(e) => handleChange('currentPassword', e.target.value)}
                      placeholder="••••••••"
                      className={inputClass(errors.currentPassword)}
                    />
                    <button
                      type="button"
                      onClick={() => toggleShow('current')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#DEDBC8] transition-colors"
                    >
                      {show.current ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-[10px] font-medium text-red-400 flex items-center gap-1 mt-1 ml-1">
                      <AlertCircle size={10} /> {errors.currentPassword}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="text-[11px] font-bold text-[#DEDBC8]/80 uppercase tracking-[0.05em] block mb-1.5 ml-1">
                    {t('password.newPassword')}
                  </label>
                  <div className="relative">
                    <Lock
                      size={13}
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 z-10 ${
                        errors.newPassword ? 'text-red-400' : 'text-gray-500'
                      }`}
                    />
                    <input
                      type={show.new ? 'text' : 'password'}
                      value={form.newPassword}
                      onChange={(e) => handleChange('newPassword', e.target.value)}
                      placeholder={t('password.error.tooShort')}
                      className={inputClass(errors.newPassword)}
                    />
                    <button
                      type="button"
                      onClick={() => toggleShow('new')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#DEDBC8] transition-colors"
                    >
                      {show.new ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-[10px] font-medium text-red-400 flex items-center gap-1 mt-1 ml-1">
                      <AlertCircle size={10} /> {errors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-[11px] font-bold text-[#DEDBC8]/80 uppercase tracking-[0.05em] block mb-1.5 ml-1">
                    {t('password.confirmPassword')}
                  </label>
                  <div className="relative">
                    <Lock
                      size={13}
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 z-10 ${
                        errors.confirmPassword ? 'text-red-400' : 'text-gray-500'
                      }`}
                    />
                    <input
                      type={show.confirm ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="••••••••"
                      className={inputClass(errors.confirmPassword)}
                    />
                    <button
                      type="button"
                      onClick={() => toggleShow('confirm')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#DEDBC8] transition-colors"
                    >
                      {show.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[10px] font-medium text-red-400 flex items-center gap-1 mt-1 ml-1">
                      <AlertCircle size={10} /> {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* API Error */}
                <AnimatePresence>
                  {errors.apiError && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-medium text-red-400 flex items-center gap-2"
                    >
                      <AlertCircle size={14} /> {errors.apiError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit + Cancel */}
                <div className="flex items-center gap-3 pt-2">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/25 hover:bg-amber-500/25 hover:border-amber-500/40 transition-all flex items-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        {t('password.submitting')}
                      </>
                    ) : (
                      <>
                        <Lock size={13} />
                        {t('password.submit')}
                      </>
                    )}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setErrors({ currentPassword: '', newPassword: '', confirmPassword: '', apiError: '' });
                      setIsSuccess(false);
                      onClose();
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-[#E1E0CC] hover:bg-white/[0.04] transition-all border border-transparent hover:border-[#DEDBC8]/10"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
