import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Building, Shield, Save, CheckCircle2, AlertTriangle, ArrowRight, Globe, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authAPI } from '../lib/api/auth.api';
import { userAPI } from '../lib/api/user.api';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { getLocalePreview } from '../utils/localization';
import { useAuthStore } from '../store/useAuthStore';

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

export default function SettingsPage() {
 const navigate = useNavigate();
 const { t, i18n } = useTranslation('settings');
 const [loading, setLoading] = useState(false);
 const [success, setSuccess] = useState(false);
 const [error, setError] = useState(null);
 const [role, setRole] = useState('');
 const updateStoreUser = useAuthStore((s) => s.updateUser);

 // Language preview state
 const [langPreview, setLangPreview] = useState(getLocalePreview(i18n.language));

 // University autocomplete
 const [uniSuggestions, setUniSuggestions] = useState([]);
 const [showUniSuggestions, setShowUniSuggestions] = useState(false);
 const [loadingUnis, setLoadingUnis] = useState(false);

 const [formData, setFormData] = useState({
 fullName: '',
 email: '',
 institution: '',
 bio: '',
 isVerified: false,
 });

 // Separate edit state so display name only updates after save
 const [editForm, setEditForm] = useState({
 fullName: '',
 institution: '',
 bio: '',
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
  setEditForm({
   fullName: userData.fullName || '',
   institution: userData.institution || '',
   bio: '',
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

 // University autocomplete search
 useEffect(() => {
 if (!editForm.institution || editForm.institution.trim().length < 1) {
  setUniSuggestions([]);
  return;
 }

 const searchTerm = editForm.institution.toLowerCase();

 const localMatches = LOCAL_UNIS.filter((uni) =>
  uni.toLowerCase().includes(searchTerm),
 ).map((name) => ({ name }));

 setUniSuggestions(localMatches.slice(0, 5));

 const timer = setTimeout(async () => {
  setLoadingUnis(true);
  try {
  const res = await fetch(
   `http://universities.hipolabs.com/search?name=${editForm.institution}`,
  );
  const data = await res.json();
  const apiMatches = data.map((u) => ({ name: u.name }));

  const combined = [...localMatches, ...apiMatches];
  const uniqueSuggestions = Array.from(
   new Set(combined.map((a) => a.name)),
  )
   .map((name) => ({ name }))
   .slice(0, 5);

  setUniSuggestions(uniqueSuggestions);
  } catch (error) {
  console.error('Error loading universities:', error);
  } finally {
  setLoadingUnis(false);
  }
 }, 300);

 return () => clearTimeout(timer);
 }, [editForm.institution]);

 const handleChange = (e) => {
 const { name, value } = e.target;
 setEditForm((prev) => ({
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
  fullName: editForm.fullName,
  institution: editForm.institution,
  avatarUrl: formData.avatarUrl || "string"
  };
  await userAPI.updateProfile(payload);
  // Only sync display state after successful save
  setFormData((prev) => ({
  ...prev,
  fullName: editForm.fullName,
  institution: editForm.institution,
  bio: editForm.bio,
  }));
  // Also update the global Zustand store so the sidebar updates immediately
  updateStoreUser({
  fullName: editForm.fullName,
  institution: editForm.institution,
  });
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
  <h2 className="text-xl font-black text-[#E1E0CC] font-display">
   {t('heading.title')}
  </h2>
  <p className="text-sm text-gray-400">
   {t('heading.subtitle')}
  </p>
  </div>

  {/* Profile Card */}
  <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  className="rounded-2xl border p-6 shadow-xl bg-[#101010] border-[#DEDBC8]/5 "
  >
  {/* Avatar Banner */}
  <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200 border-[#DEDBC8]/5 transition-colors">
   <div
   className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-black shrink-0 uppercase bg-[#DEDBC8]"
   >
   {formData.fullName ? formData.fullName.substring(0, 2) : 'U'}
   </div>
   <div>
   <h3 className="text-lg font-bold text-[#E1E0CC]">{formData.fullName || 'Loading...'}</h3>
   <div className="flex items-center gap-2 mt-1.5 text-xs font-medium px-2.5 py-1 rounded-md w-fit bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-[#DEDBC8]">
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
     <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-gray-500" />
     <input
     type="text"
     name="fullName"
     value={editForm.fullName}
     onChange={handleChange}
     className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-[#DEDBC8] bg-transparent border-[#DEDBC8]/10 text-gray-900 dark:text-[#E2E8F0]"
     />
    </div>
    </div>

    <div className="relative">
    <label className="text-xs font-semibold text-gray-700 dark:text-white block mb-1.5">
     {t('profile.institution')}
    </label>
    <div className="relative">
     <Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-gray-500" />
     <input
     type="text"
     name="institution"
     value={editForm.institution}
     onChange={(e) => {
      handleChange(e);
      setShowUniSuggestions(true);
     }}
     onFocus={() => setShowUniSuggestions(true)}
     onBlur={() => setTimeout(() => setShowUniSuggestions(false), 200)}
     className="w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-[#DEDBC8] bg-transparent border-[#DEDBC8]/10 text-gray-900 dark:text-[#E2E8F0]"
     />
     {loadingUnis && (
     <RefreshCw
      size={12}
      className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400 dark:text-white/50"
     />
     )}
    </div>

    {showUniSuggestions && uniSuggestions.length > 0 && (
     <ul className="absolute z-50 w-full mt-1.5 rounded-xl border border-[#DEDBC8]/10 bg-white bg-[#0A0A0A] overflow-hidden shadow-2xl">
     {uniSuggestions.map((uni, idx) => (
      <li
      key={idx}
      onMouseDown={() => {
       setEditForm((prev) => ({ ...prev, institution: uni.name }));
       setShowUniSuggestions(false);
      }}
      className="px-4 py-2.5 text-xs text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#DEDBC81A] cursor-pointer border-b border-gray-100 border-[#DEDBC8]/5 last:border-b-0 transition-colors"
      >
      {uni.name}
      </li>
     ))}
     </ul>
    )}
    </div>
   </div>
   <div>
    <div className="p-5 rounded-xl border flex flex-col h-full bg-gray-50 dark:bg-white/[0.02] border-gray-200 border-[#DEDBC8]/5 transition-colors">
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
     <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-gray-500" />
     <input
     type="email"
     name="email"
     value={formData.email}
     readOnly
     className="w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm outline-none opacity-60 cursor-not-allowed bg-[#0A0A0A] border-[#DEDBC8]/10 text-gray-500 dark:text-[#94A3B8]"
     />
    </div>
    {!formData.isVerified && (
     <div className="mt-auto pt-4 border-t border-gray-200 border-[#DEDBC8]/5 flex items-center justify-between">
     <div className="text-[11px] text-gray-500 text-gray-400 leading-relaxed pr-4">
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
    value={editForm.bio}
    onChange={handleChange}
    rows="4"
    placeholder={t('profile.bioPlaceholder')}
    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-[#DEDBC8] resize-none bg-transparent border-[#DEDBC8]/10 text-gray-900 dark:text-[#E2E8F0]"
    ></textarea>
   </div>
   </div>

   {/* Save Profile */}
   <div className="pt-6 border-t border-gray-200 border-[#DEDBC8]/5 flex items-center justify-between">
   <div
    className="text-xs flex items-center gap-1.5 font-medium opacity-0 transition-opacity text-emerald-600 dark:text-green-400"
    style={{ opacity: success ? 1 : 0 }}
   >
    <CheckCircle2 size={16} /> {t('saveChanges.success')}
   </div>

   <button
    type="submit"
    disabled={loading}
    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 hover:scale-105 transition-all shadow-lg hover:shadow-[#DEDBC8]/20"
    style={{
    background: 'linear-gradient(135deg, #3B82F6, #DEDBC8, #14B8A6)',
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
  className="rounded-2xl border p-6 shadow-xl bg-[#101010] border-[#DEDBC8]/5 "
  >
  <div className="flex items-center gap-3 mb-6">
   <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-500/10">
   <Globe size={18} className="text-[#DEDBC8] dark:text-[#DEDBC8]" />
   </div>
   <div>
   <h3 className="text-sm font-bold text-[#E1E0CC]">{t('language.title')}</h3>
   <p className="text-xs text-gray-400">{t('language.description')}</p>
   </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
   {/* Language Selector */}
   <div className="p-4 rounded-xl border bg-gray-50 dark:bg-white/[0.02] border-gray-200 border-[#DEDBC8]/5 flex flex-col">
   <label className="text-xs font-semibold text-gray-700 dark:text-white block mb-3">
    {t('language.title')}
   </label>
   <div className="flex-1 flex flex-col justify-center">
    <LanguageSwitcher variant="inline" />
   </div>
   <p className="text-[10px] text-gray-400 text-gray-500 mt-3 leading-relaxed">
    {t('language.description')}
   </p>
   </div>

   {/* Preview */}
   <div className="p-4 rounded-xl border bg-gray-50 dark:bg-white/[0.02] border-gray-200 border-[#DEDBC8]/5 flex flex-col">
   <label className="text-xs font-semibold text-gray-700 dark:text-white block mb-3">
    {t('language.preview')}
   </label>
   <div className="flex-1 flex flex-col justify-center space-y-3">
    <div className="flex justify-between items-center text-xs">
    <span className="text-gray-400">{t('language.dateSample')}</span>
    <span className="font-semibold text-[#E1E0CC]">
     {langPreview.date}
    </span>
    </div>
    <div className="flex justify-between items-center text-xs">
    <span className="text-gray-400">{t('language.numberSample')}</span>
    <span className="font-semibold text-[#E1E0CC]">
     {langPreview.number}
    </span>
    </div>
   </div>
   </div>
  </div>

  <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-200 border-[#DEDBC8]/5">
   <button
   onClick={handleSaveLanguagePreference}
   className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#DEDBC8] text-black hover:opacity-90 transition-all flex items-center gap-2"
   >
   <Save size={13} /> {t('language.savePreference')}
   </button>
   <button
   onClick={handleResetLanguage}
   className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 bg-white/[0.04] hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
   >
   {t('language.resetDefault')}
   </button>
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
