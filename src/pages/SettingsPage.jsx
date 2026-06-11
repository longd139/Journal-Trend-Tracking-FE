import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Building, Shield, Save, CheckCircle2, AlertTriangle, ArrowRight, Moon, Sun, Monitor, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authAPI } from '../lib/api/auth.api';
import { userAPI } from '../lib/api/user.api';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { getLocalePreview } from '../utils/localization';
import { useTheme } from '../hooks/useTheme';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('settings');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [role, setRole] = useState('');

  // Theme — managed by useTheme hook (supports 'dark' | 'light' | 'system')
  const { theme, setTheme } = useTheme();

  // Language preview state
  const [langPreview, setLangPreview] = useState(getLocalePreview(i18n.language));

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    institution: '',
    bio: '',
    isVerified: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const currentRole = sessionStorage.getItem('userRole');
        setRole(currentRole || 'user');

        const response = await userAPI.profile();
        const userData = response;

        setFormData({
          fullName: userData.fullName || '',
          email: userData.email || '',
          institution: userData.institution || '',
          bio: '',
          isVerified: userData.isVerified || false,
        });
      } catch (err) {
        console.error('Error fetching user info:', err);
        setError(t('errors.loadFailed', { ns: 'common' }));
      }
    };

    fetchProfile();
  }, []);

  // Update language preview when language changes
  useEffect(() => {
    setLangPreview(getLocalePreview(i18n.language));
  }, [i18n.language]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        fullName: formData.fullName,
        institution: formData.institution,
        avatarUrl: formData.avatarUrl || "string"
      };
      await userAPI.updateProfile(payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err.response?.data?.message || t('errors.updateFailed', { ns: 'common' });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = () => {
    navigate('/verify-email');
  };

  const handleSaveLanguagePreference = async () => {
    try {
      localStorage.setItem('preferredLanguage', i18n.language);
      // Try to sync with backend if authenticated
      try {
        await userAPI.updateLanguagePreference(i18n.language);
      } catch {
        // Backend sync is best-effort
      }
      toast.success(t('language.saved'), {
        duration: 2000,
      });
    } catch {
      // Silently fail
    }
  };

  const handleResetLanguage = () => {
    i18n.changeLanguage('en');
    localStorage.setItem('preferredLanguage', 'en');
    toast.success(t('language.saved'), {
      duration: 2000,
    });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white font-display">
          {t('heading.title')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-[#A0AEC0]">
          {t('heading.subtitle')}
        </p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border p-6 shadow-xl bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/5 transition-colors duration-300"
      >
        {/* Avatar Banner */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-white/5 transition-colors">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white shrink-0 uppercase shadow-lg"
            style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)' }}
          >
            {formData.fullName ? formData.fullName.substring(0, 2) : 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{formData.fullName || 'Loading...'}</h3>
            <div className="flex items-center gap-2 mt-1.5 text-xs font-medium px-2.5 py-1 rounded-md w-fit bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-[#4F8CFF]">
              <Shield size={12} /> {role.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-white block mb-1.5">
                  {t('profile.fullName')}
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-[#4F8CFF] bg-gray-50 dark:bg-[#131A2A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-[#E2E8F0]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-white block mb-1.5">
                  {t('profile.institution')}
                </label>
                <div className="relative">
                  <Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-[#4F8CFF] bg-gray-50 dark:bg-[#131A2A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-[#E2E8F0]"
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="p-5 rounded-xl border flex flex-col h-full bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 transition-colors">
                <label className="text-xs font-semibold text-gray-700 dark:text-white flex items-center justify-between mb-3">
                  <span>{t('profile.email')}</span>
                  {formData.isVerified ? (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md">
                      <CheckCircle2 size={12} /> {t('status.verified', { ns: 'common' })}
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-bold bg-amber-100 dark:bg-amber-500/10 px-2.5 py-1 rounded-md">
                      <AlertTriangle size={12} /> {t('status.unverified', { ns: 'common' })}
                    </span>
                  )}
                </label>

                <div className="relative mb-2">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm outline-none opacity-60 cursor-not-allowed bg-gray-100 dark:bg-[#131A2A] border-gray-200 dark:border-white/10 text-gray-500 dark:text-[#94A3B8]"
                  />
                </div>
                {!formData.isVerified && (
                  <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-between">
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed pr-4">
                      {t('profile.verifyEmail')}
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyEmail}
                      className="shrink-0 px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 group shadow-sm text-amber-700 dark:text-white bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 hover:bg-amber-200 dark:hover:bg-amber-500 hover:border-amber-300 dark:hover:border-amber-500"
                    >
                      {t('profile.verifyNow')}
                      <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-white block mb-1.5">
              {t('profile.bio')}
            </label>
            <div className="relative">
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                placeholder={t('profile.bioPlaceholder')}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-[#4F8CFF] resize-none bg-gray-50 dark:bg-[#131A2A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-[#E2E8F0]"
              ></textarea>
            </div>
          </div>

          {/* Save Profile */}
          <div className="pt-6 border-t border-gray-200 dark:border-white/5 flex items-center justify-between">
            <div
              className="text-xs flex items-center gap-1.5 font-medium opacity-0 transition-opacity text-emerald-600 dark:text-green-400"
              style={{ opacity: success ? 1 : 0 }}
            >
              <CheckCircle2 size={16} /> {t('saveChanges.success')}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 hover:scale-105 transition-all shadow-lg hover:shadow-[#4F8CFF]/20"
              style={{
                background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? t('saveChanges.saving') : <><Save size={16} /> {t('saveChanges.button')}</>}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Language & Region Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border p-6 shadow-xl bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/5 transition-colors duration-300"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-500/10">
            <Globe size={18} className="text-blue-500 dark:text-[#4F8CFF]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t('language.title')}</h3>
            <p className="text-xs text-gray-500 dark:text-[#A0AEC0]">{t('language.description')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Language Selector */}
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-white block mb-2">
              {t('language.title')}
            </label>
            <div className="max-w-[220px]">
              <LanguageSwitcher variant="inline" />
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-xl border bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5">
            <label className="text-xs font-semibold text-gray-700 dark:text-white block mb-3">
              {t('language.preview')}
            </label>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 dark:text-[#A0AEC0]">{t('language.dateSample')}</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">
                  {langPreview.date}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 dark:text-[#A0AEC0]">{t('language.numberSample')}</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">
                  {langPreview.number}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-200 dark:border-white/5">
          <button
            onClick={handleSaveLanguagePreference}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-opacity shadow-md"
          >
            {t('language.savePreference')}
          </button>
          <button
            onClick={handleResetLanguage}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            {t('language.resetDefault')}
          </button>
        </div>
      </motion.div>

      {/* Theme Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border p-6 shadow-xl bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/5 transition-colors duration-300"
      >
        <div className="pt-0">
          <label className="text-xs font-semibold text-gray-700 dark:text-white block mb-3">
            {t('theme.label')}
          </label>
          <div className="flex items-center gap-3">
            {/* Light */}
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${theme === 'light'
                  ? 'bg-amber-100 border-amber-400 text-amber-700 shadow-sm'
                  : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <Sun size={16} /> {t('theme.light')}
            </button>
            {/* System (Auto) */}
            <button
              type="button"
              onClick={() => handleThemeChange('system')}
              className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${theme === 'system'
                  ? 'bg-purple-100 dark:bg-purple-500/20 border-purple-400 dark:border-purple-500 text-purple-700 dark:text-purple-400 shadow-sm'
                  : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <Monitor size={16} /> {t('theme.system')}
            </button>
            {/* Dark */}
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${theme === 'dark'
                  ? 'bg-blue-900/40 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/10'
                  : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <Moon size={16} /> {t('theme.dark')}
            </button>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl text-xs font-medium flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500"
        >
          <AlertTriangle size={14} /> {error}
        </motion.div>
      )}
    </div>
  );
}
