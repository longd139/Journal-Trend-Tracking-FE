import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User,
  Mail,
  Building,
  Shield,
  Save,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Globe,
  RefreshCw,
  BookOpen,
  Sparkles,
  ChevronRight,
  Bell,
  Lock,
  LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { userAPI } from '../user/api';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { getLocalePreview } from '../../utils/localization';
import { useAuthStore } from '../user/store';

/* ═══════════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════════════════
   Reusable input
   ═══════════════════════════════════════════════════════════════════════════ */

function FormField({ icon: Icon, label, name, value, onChange, type = 'text', placeholder, readOnly, disabled, error, hint, children, ...rest }) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={`field-${name}`}
        className="text-[11px] font-bold text-[#DEDBC8]/80 uppercase tracking-[0.05em] ml-1"
      >
        {label}
      </label>
      <div className="relative group">
        {Icon && (
          <Icon
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 text-gray-500 group-focus-within:text-[#DEDBC8] transition-colors duration-300"
          />
        )}
        {children || (
          <input
            id={`field-${name}`}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            readOnly={readOnly}
            disabled={disabled}
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all duration-300
              ${readOnly || disabled
                ? 'bg-[#0A0D14]/50 border-[#DEDBC8]/5 text-gray-500 cursor-not-allowed'
                : 'bg-[#0A0D14] border-[#DEDBC8]/10 text-[#E1E0CC] placeholder:text-gray-500 focus:border-[#DEDBC8]/40 focus:bg-[#0F1219] focus:shadow-[0_0_18px_rgba(222,219,200,0.06)] focus:ring-1 focus:ring-[#DEDBC8]/15'
              }`}
            {...rest}
          />
        )}
      </div>
      {error && (
        <p className="text-[10px] font-medium text-red-400 flex items-center gap-1 ml-1">
          <AlertTriangle size={10} /> {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[10px] text-gray-500 ml-1">{hint}</p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Settings section card
   ═══════════════════════════════════════════════════════════════════════════ */

function SectionCard({ icon: Icon, title, description, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-[#DEDBC8]/8 bg-[#0A0D14]/80 backdrop-blur-xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#DEDBC8]/6 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#DEDBC8]/8 flex items-center justify-center shrink-0">
          <Icon size={19} className="text-[#DEDBC8]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#E1E0CC] font-display tracking-tight">
            {title}
          </h3>
          {description && (
            <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Settings Page
   ═══════════════════════════════════════════════════════════════════════════ */

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('settings');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [role, setRole] = useState('');
  const updateStoreUser = useAuthStore((s) => s.updateUser);
  const user = useAuthStore((s) => s.user);

  /* ── Language preview ────────────────────────────────────────────── */
  const [langPreview, setLangPreview] = useState(getLocalePreview(i18n.language));

  /* ── University autocomplete ──────────────────────────────────────── */
  const [uniSuggestions, setUniSuggestions] = useState([]);
  const [showUniSuggestions, setShowUniSuggestions] = useState(false);
  const [loadingUnis, setLoadingUnis] = useState(false);

  /* ── Form state ──────────────────────────────────────────────────── */
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    institution: '',
    bio: '',
    isVerified: false,
  });

  const [editForm, setEditForm] = useState({
    fullName: '',
    institution: '',
    bio: '',
  });

  /* ── Dirty tracking ───────────────────────────────────────────────── */
  const isDirty =
    editForm.fullName !== formData.fullName ||
    editForm.institution !== formData.institution ||
    editForm.bio !== formData.bio;

  /* ── Fetch profile ────────────────────────────────────────────────── */
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
          bio: userData.bio || '',
          isVerified: userData.isVerified || false,
        });
        setEditForm({
          fullName: userData.fullName || '',
          institution: userData.institution || '',
          bio: userData.bio || '',
        });
      } catch (err) {
        console.error('Error fetching user info:', err);
        setError(t('errors.loadFailed', { ns: 'common' }));
      }
    };
    fetchProfile();
  }, []);

  /* ── Language change effect ───────────────────────────────────────── */
  useEffect(() => {
    setLangPreview(getLocalePreview(i18n.language));
  }, [i18n.language]);

  /* ── University autocomplete ──────────────────────────────────────── */
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
      } catch {
        // Silently fail
      } finally {
        setLoadingUnis(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [editForm.institution]);

  /* ── Handlers ─────────────────────────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDirty) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        fullName: editForm.fullName,
        institution: editForm.institution,
        avatarUrl: formData.avatarUrl || 'string',
      };
      await userAPI.updateProfile(payload);

      setFormData((prev) => ({
        ...prev,
        fullName: editForm.fullName,
        institution: editForm.institution,
        bio: editForm.bio,
      }));

      updateStoreUser({
        fullName: editForm.fullName,
        institution: editForm.institution,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage =
        err.response?.data?.message || t('errors.updateFailed', { ns: 'common' });
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
      try {
        await userAPI.updateLanguagePreference(i18n.language);
      } catch {
        // Best-effort
      }
      toast.success(t('language.saved'), { duration: 2000 });
    } catch {
      // Silently fail
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  /* ═══════════════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════════════ */

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6 pb-16">
      {/* ─── Page heading ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl font-black text-[#E1E0CC] font-display tracking-tight">
            {t('heading.title')}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {t('heading.subtitle')}
          </p>
        </div>

        {/* Quick save (sticky alternative) — visible on scroll? simplified for now */}
      </motion.div>

      {/* ═════════════════════════════════════════════════════════════════
         SECTION 1 — Profile
         ═════════════════════════════════════════════════════════════════ */}
      <SectionCard
        icon={User}
        title={t('heading.title')}
        description={t('heading.subtitle')}
        delay={0.05}
      >
        {/* Avatar + identity banner */}
        <div className="flex items-center gap-5 mb-8 pb-8 border-b border-[#DEDBC8]/6">
          <div className="relative">
            <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#DEDBC8] to-[#B8B48A] flex items-center justify-center text-2xl font-black text-black uppercase shadow-[0_8px_32px_rgba(222,219,200,0.15)] ring-2 ring-[#DEDBC8]/20">
              {getInitials(formData.fullName)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0A0D14] border-2 border-[#DEDBC8]/20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-[#E1E0CC] truncate font-display">
              {formData.fullName || '—'}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#DEDBC8]/10 text-[#DEDBC8] border border-[#DEDBC8]/15 uppercase tracking-wider">
                <Shield size={10} /> {role}
              </span>
              {formData.isVerified ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                  <CheckCircle2 size={10} /> {t('status.verified', { ns: 'common' })}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/15">
                  <AlertTriangle size={10} /> {t('status.unverified', { ns: 'common' })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-5">
              <FormField
                icon={User}
                label={t('profile.fullName')}
                name="fullName"
                value={editForm.fullName}
                onChange={handleChange}
                placeholder="Dr. Sarah Chen"
              />

              <div className="relative">
                <FormField
                  icon={Building}
                  label={t('profile.institution')}
                  name="institution"
                  value={editForm.institution}
                  onChange={(e) => {
                    handleChange(e);
                    setShowUniSuggestions(true);
                  }}
                  onFocus={() => setShowUniSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowUniSuggestions(false), 200)}
                  placeholder="FPT University"
                />
                {loadingUnis && (
                  <RefreshCw
                    size={12}
                    className="absolute right-3 top-[34px] z-10 animate-spin text-gray-500"
                  />
                )}

                {/* Autocomplete dropdown */}
                <AnimatePresence>
                  {showUniSuggestions && uniSuggestions.length > 0 && (
                    <motion.ul
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 w-full mt-1.5 rounded-xl border border-[#DEDBC8]/15 bg-[#0F1219] shadow-2xl shadow-black/40 overflow-hidden"
                    >
                      {uniSuggestions.map((uni, idx) => (
                        <li
                          key={idx}
                          onMouseDown={() => {
                            setEditForm((prev) => ({ ...prev, institution: uni.name }));
                            setShowUniSuggestions(false);
                          }}
                          className="px-4 py-2.5 text-xs text-[#E1E0CC] hover:bg-[#DEDBC8]/8 cursor-pointer border-b border-[#DEDBC8]/5 last:border-b-0 transition-colors flex items-center gap-2.5"
                        >
                          <Building size={12} className="text-gray-500" />
                          {uni.name}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right column — Email card */}
            <div className="p-5 rounded-2xl border border-[#DEDBC8]/6 bg-[#0A0D14]/50 flex flex-col">
              <FormField
                icon={Mail}
                label={t('profile.email')}
                name="email"
                value={formData.email}
                readOnly
              />

              <div className="mt-4 pt-4 border-t border-[#DEDBC8]/6 flex-1 flex flex-col justify-end">
                {!formData.isVerified ? (
                  <>
                    <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
                      {t('profile.verifyEmail')}
                    </p>
                    <button
                      type="button"
                      onClick={handleVerifyEmail}
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-amber-50 bg-amber-500/15 border border-amber-500/25 hover:bg-amber-500/25 hover:border-amber-500/40 transition-all flex items-center justify-center gap-2 group"
                    >
                      {t('profile.verifyNow')}
                      <ArrowRight
                        size={12}
                        className="group-hover:translate-x-0.5 transition-transform"
                      />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-400 bg-emerald-500/5 rounded-xl px-3 py-2.5 border border-emerald-500/10">
                    <CheckCircle2 size={13} />
                    Your email is verified
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <FormField label={t('profile.bio')} name="bio">
            <textarea
              id="field-bio"
              name="bio"
              value={editForm.bio}
              onChange={handleChange}
              rows={3}
              placeholder={t('profile.bioPlaceholder')}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all duration-300 resize-none bg-[#0A0D14] border-[#DEDBC8]/10 text-[#E1E0CC] placeholder:text-gray-500 focus:border-[#DEDBC8]/40 focus:bg-[#0F1219] focus:shadow-[0_0_18px_rgba(222,219,200,0.06)] focus:ring-1 focus:ring-[#DEDBC8]/15"
            />
          </FormField>

          {/* ── Save bar ──────────────────────────────────────────── */}
          <div className="pt-6 border-t border-[#DEDBC8]/6 flex items-center justify-between gap-4">
            {/* Success indicator */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2 text-xs font-bold text-emerald-400"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center"
                  >
                    <CheckCircle2 size={14} />
                  </motion.span>
                  {t('saveChanges.success')}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error indicator */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2 text-xs font-medium text-red-400"
                >
                  <AlertTriangle size={14} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1" />

            {/* Reset button */}
            <AnimatePresence>
              {isDirty && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => {
                    setEditForm({
                      fullName: formData.fullName,
                      institution: formData.institution,
                      bio: formData.bio,
                    });
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-[#E1E0CC] hover:bg-white/[0.04] transition-all border border-transparent hover:border-[#DEDBC8]/10"
                >
                  Discard
                </motion.button>
              )}
            </AnimatePresence>

            {/* Save button */}
            <motion.button
              type="submit"
              disabled={loading || !isDirty}
              whileHover={isDirty && !loading ? { scale: 1.03 } : {}}
              whileTap={isDirty && !loading ? { scale: 0.97 } : {}}
              className={`relative px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 overflow-hidden
                ${isDirty && !loading
                  ? 'bg-[#DEDBC8] text-black shadow-[0_4px_20px_rgba(222,219,200,0.25)] hover:shadow-[0_6px_28px_rgba(222,219,200,0.35)] hover:bg-[#E8E4D4]'
                  : 'bg-[#DEDBC8]/10 text-gray-500 cursor-not-allowed border border-[#DEDBC8]/10'
                }`}
            >
              {loading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  {t('saveChanges.saving')}
                </>
              ) : (
                <>
                  <Save size={15} />
                  {t('saveChanges.button')}
                </>
              )}

              {/* Shimmer effect when dirty */}
              {isDirty && !loading && (
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                />
              )}
            </motion.button>
          </div>
        </form>
      </SectionCard>

      {/* ═════════════════════════════════════════════════════════════════
         SECTION 2 — Language & Region
         ═════════════════════════════════════════════════════════════════ */}
      <SectionCard
        icon={Globe}
        title={t('language.title')}
        description={t('language.description')}
        delay={0.1}
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Language selector */}
          <div className="md:col-span-3 space-y-4">
            <label className="text-[11px] font-bold text-[#DEDBC8]/80 uppercase tracking-[0.05em]">
              {t('language.title')}
            </label>
            <div className="max-w-[260px]">
              <LanguageSwitcher variant="inline" />
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              {t('language.description')}
            </p>
          </div>

          {/* Preview card */}
          <div className="md:col-span-2 p-4 rounded-2xl border border-[#DEDBC8]/6 bg-[#0A0D14]/50 space-y-3">
            <label className="text-[11px] font-bold text-[#DEDBC8]/80 uppercase tracking-[0.05em]">
              {t('language.preview')}
            </label>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs py-2 px-3 rounded-lg bg-[#0F1219] border border-[#DEDBC8]/5">
                <span className="text-gray-400">{t('language.dateSample')}</span>
                <span className="font-bold text-[#E1E0CC] font-mono text-[11px]">
                  {langPreview.date}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-2 px-3 rounded-lg bg-[#0F1219] border border-[#DEDBC8]/5">
                <span className="text-gray-400">{t('language.numberSample')}</span>
                <span className="font-bold text-[#E1E0CC] font-mono text-[11px]">
                  {langPreview.number}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Language actions */}
        <div className="flex items-center gap-3 mt-5 pt-5 border-t border-[#DEDBC8]/6">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSaveLanguagePreference}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#DEDBC8] text-black shadow-[0_4px_16px_rgba(222,219,200,0.2)] hover:shadow-[0_6px_24px_rgba(222,219,200,0.3)] transition-all flex items-center gap-2"
          >
            <Save size={13} /> {t('language.savePreference')}
          </motion.button>
          <button
            onClick={() => {
              i18n.changeLanguage('en');
              localStorage.setItem('preferredLanguage', 'en');
              toast.success(t('language.saved'), { duration: 2000 });
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-[#E1E0CC] hover:bg-white/[0.04] transition-all border border-transparent hover:border-[#DEDBC8]/10"
          >
            {t('language.resetDefault')}
          </button>
        </div>
      </SectionCard>

      {/* ═════════════════════════════════════════════════════════════════
         SECTION 3 — Preferences (placeholder for future)
         ═════════════════════════════════════════════════════════════════ */}
      <SectionCard
        icon={Bell}
        title="Preferences"
        description="Notification and display preferences for your account."
        delay={0.15}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Bell, label: 'Notifications', desc: 'Manage alerts', active: true, coming: false },
            { icon: BookOpen, label: 'Appearance', desc: 'Theme & layout', active: false, coming: true },
            { icon: Lock, label: 'Privacy', desc: 'Data & visibility', active: false, coming: true },
          ].map((item, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl border transition-all ${
                item.active
                  ? 'border-[#DEDBC8]/15 bg-[#DEDBC8]/[0.03] cursor-pointer hover:bg-[#DEDBC8]/[0.06] hover:border-[#DEDBC8]/25'
                  : 'border-[#DEDBC8]/5 bg-transparent opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.active ? 'bg-[#DEDBC8]/10' : 'bg-white/[0.03]'}`}>
                  <item.icon size={16} className={item.active ? 'text-[#DEDBC8]' : 'text-gray-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-bold truncate ${item.active ? 'text-[#E1E0CC]' : 'text-gray-500'}`}>
                    {item.label}
                  </h4>
                  <p className="text-[10px] text-gray-500 truncate">{item.desc}</p>
                </div>
                {item.coming && (
                  <span className="text-[9px] font-bold text-gray-600 bg-white/[0.03] px-1.5 py-0.5 rounded-md">SOON</span>
                )}
                {item.active && (
                  <ChevronRight size={14} className="text-gray-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ═════════════════════════════════════════════════════════════════
         SECTION 4 — Danger Zone
         ═════════════════════════════════════════════════════════════════ */}
      <SectionCard
        icon={LogOut}
        title="Account Actions"
        description="Sign out or manage your account status."
        delay={0.2}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h4 className="text-sm font-bold text-[#E1E0CC]">Sign out of your account</h4>
            <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
              You will be redirected to the login page.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              sessionStorage.removeItem('userRole');
              navigate('/login');
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/35 transition-all flex items-center gap-2"
          >
            <LogOut size={14} />
            Sign Out
          </motion.button>
        </div>
      </SectionCard>

      {/* ─── Footer credit ────────────────────────────────────────────── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-[10px] text-gray-600 pt-2"
      >
        SCITRACK Settings · Changes are saved per session
      </motion.p>
    </div>
  );
}
