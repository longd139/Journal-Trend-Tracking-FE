import { useState, useEffect, useRef } from 'react';
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
  Palette,
  Camera,
  Film,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { userAPI } from '../user/api';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { getLocalePreview } from '../../utils/localization';
import { useAuthStore } from '../user/store';
import ChangePasswordForm from './ChangePasswordForm';
import AppearanceSettings from './AppearanceSettings';
import NotificationSettings from './NotificationSettings';

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
  const clearTokens = useAuthStore((s) => s.clearTokens);
  const useVideoBackground = useAuthStore((s) => s.useVideoBackground);
  const setUseVideoBackground = useAuthStore((s) => s.setUseVideoBackground);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

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

  /* ── Avatar state ────────────────────────────────────────────────── */
  const [avatarPreview, setAvatarPreview] = useState(null); // base64 data URL
  const [avatarChanged, setAvatarChanged] = useState(false);
  const fileInputRef = useRef(null);

  /* ── Dirty tracking ───────────────────────────────────────────────── */
  const isDirty =
    editForm.fullName !== formData.fullName ||
    editForm.institution !== formData.institution ||
    editForm.bio !== formData.bio ||
    avatarChanged;

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
          avatarUrl: userData.avatarUrl || '',
        });
        setEditForm({
          fullName: userData.fullName || '',
          institution: userData.institution || '',
          bio: userData.bio || '',
        });
        if (userData.avatarUrl) {
          setAvatarPreview(userData.avatarUrl);
        }
        if (userData.backgroundUrl) {
          setBackgroundPreview(userData.backgroundUrl);
          // Sync to store on initial load
          if (!useAuthStore.getState().backgroundUrl) {
            useAuthStore.getState().setBackground(userData.backgroundUrl);
          }
        }
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

  /* ── Avatar handlers ──────────────────────────────────────────────── */
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
      setAvatarChanged(true);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarChanged(true);
  };

  /* ── Background handlers ──────────────────────────────────────────── */
  const [backgroundPreview, setBackgroundPreview] = useState(null);
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [backgroundChanged, setBackgroundChanged] = useState(false);
  const [backgroundUploading, setBackgroundUploading] = useState(false);
  const bgFileInputRef = useRef(null);

  const handleBackgroundClick = () => {
    bgFileInputRef.current?.click();
  };

  const handleBackgroundFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setBackgroundPreview(reader.result);
      setBackgroundFile(file);
      setBackgroundChanged(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveBackground = () => {
    setBackgroundPreview(null);
    setBackgroundFile(null);
    setBackgroundChanged(true);
  };

  const handlePresetColor = async (color) => {
    // Generate a solid-color PNG blob via canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1440;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1440, 320);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    const file = new File([blob], `bg-${color.replace('#', '')}.png`, { type: 'image/png' });
    const reader = new FileReader();
    reader.onload = () => {
      setBackgroundPreview(reader.result);
      setBackgroundFile(file);
      setBackgroundChanged(true);
    };
    reader.readAsDataURL(file);
  };

  const PRESET_COLORS = [
    { color: '#0B1020', label: 'Deep Navy' },
    { color: '#1a1a2e', label: 'Midnight' },
    { color: '#0f2027', label: 'Dark Teal' },
    { color: '#1a1124', label: 'Aubergine' },
    { color: '#1B2235', label: 'Steel Blue' },
    { color: '#0d1117', label: 'GitHub Dark' },
    { color: '#1c1c1c', label: 'Charcoal' },
    { color: '#2d1b2e', label: 'Plum' },
    { color: '#0a1628', label: 'Ocean' },
    { color: '#1a0a0a', label: 'Deep Red' },
  ];

  const handleSaveBackground = async () => {
    if (!backgroundFile) return;
    setBackgroundUploading(true);
    try {
      const result = await userAPI.uploadBackground(backgroundFile);
      setBackgroundPreview(result.url);
      setFormData((prev) => ({ ...prev, backgroundUrl: result.url }));
      setBackgroundFile(null);
      setBackgroundChanged(false);
      // Sync to Zustand so MainLayout picks it up immediately
      useAuthStore.getState().setBackground(result.url);
      toast.success('Background updated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload background');
    } finally {
      setBackgroundUploading(false);
    }
  };

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
        avatarUrl: avatarChanged ? (avatarPreview || '') : (formData.avatarUrl || ''),
      };
      await userAPI.updateProfile(payload);

      setFormData((prev) => ({
        ...prev,
        fullName: editForm.fullName,
        institution: editForm.institution,
        bio: editForm.bio,
        avatarUrl: avatarChanged ? (avatarPreview || '') : prev.avatarUrl,
      }));

      setAvatarChanged(false);

      updateStoreUser({
        fullName: editForm.fullName,
        institution: editForm.institution,
        avatarUrl: avatarChanged ? (avatarPreview || '') : formData.avatarUrl,
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
      {/* ─── Page heading — compact, title is in TopBar ──────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#DEDBC8]/5 border border-[#DEDBC8]/8">
          <User size={13} className="text-[#DEDBC8]" />
          <span className="text-xs font-bold text-[#DEDBC8]">Profile</span>
        </div>
        <span className="text-[11px] text-gray-500">Manage your personal information, preferences, and appearance</span>
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
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarFileChange}
          />

          {/* Clickable avatar */}
          <button
            type="button"
            onClick={handleAvatarClick}
            className="relative group shrink-0"
            title="Click to change avatar"
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-[72px] h-[72px] rounded-full object-cover shadow-[0_8px_32px_rgba(222,219,200,0.15)] ring-2 ring-[#DEDBC8]/20"
              />
            ) : (
              <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#DEDBC8] to-[#B8B48A] flex items-center justify-center text-2xl font-black text-black uppercase shadow-[0_8px_32px_rgba(222,219,200,0.15)] ring-2 ring-[#DEDBC8]/20">
                {getInitials(formData.fullName)}
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-white" />
            </div>
            {/* Online dot */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0A0D14] border-2 border-[#DEDBC8]/20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            </div>
          </button>

          {/* Remove avatar button (only when avatar is set) */}
          {avatarPreview && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="text-[10px] font-semibold text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <X size={12} />
              Remove
            </button>
          )}

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
                    setAvatarPreview(formData.avatarUrl || null);
                    setAvatarChanged(false);
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
         SECTION 1.5 — Background
         ═════════════════════════════════════════════════════════════════ */}
      <SectionCard
        icon={Sparkles}
        title="App Background"
        description="Customize the background of your dashboard"
        delay={0.1}
      >
        <input
          ref={bgFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBackgroundFileChange}
        />

        {/* Background preview */}
        <div className="relative rounded-xl overflow-hidden border border-[#DEDBC8]/10 mb-5">
          {backgroundPreview ? (
            <img
              src={backgroundPreview}
              alt="Background"
              className="w-full h-40 object-cover"
            />
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-[#1B2235] via-[#0F1219] to-[#1B2235] flex items-center justify-center">
              <span className="text-xs text-gray-600">No background set</span>
            </div>
          )}
          {/* Click overlay */}
          <button
            type="button"
            onClick={handleBackgroundClick}
            className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center group"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 text-white text-xs font-medium">
              <Camera size={14} /> Change Background
            </span>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBackgroundClick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
              bg-[#DEDBC8]/8 border border-[#DEDBC8]/15 text-[#E1E0CC]
              hover:bg-[#DEDBC8]/15 transition-all"
          >
            <Camera size={13} /> Choose Image
          </button>
          {backgroundPreview && (
            <button
              type="button"
              onClick={handleRemoveBackground}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
                text-gray-500 hover:text-red-400 transition-colors"
            >
              <X size={13} /> Remove
            </button>
          )}
          {backgroundChanged && backgroundFile && (
            <button
              type="button"
              onClick={handleSaveBackground}
              disabled={backgroundUploading}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold
                bg-[#4F8CFF] text-white hover:bg-[#3B6FDB] disabled:opacity-50 transition-all"
            >
              {backgroundUploading ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              {backgroundUploading ? 'Uploading...' : 'Save Background'}
            </button>
          )}
        </div>
        <p className="text-[10px] text-gray-500 mt-3">
          Recommended size: 1440×320px. JPG, PNG or WebP. Max 5MB.
        </p>

        {/* Preset colors */}
        <div className="mt-4 pt-4 border-t border-[#DEDBC8]/6">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Or pick a solid color</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map(({ color, label }) => (
              <button
                key={color}
                type="button"
                onClick={() => handlePresetColor(color)}
                title={label}
                className="w-8 h-8 rounded-lg border-2 border-[#DEDBC8]/10 hover:border-[#DEDBC8]/40 hover:scale-110 transition-all shadow-sm"
                style={{ background: color }}
              />
            ))}
          </div>
        </div>

        {/* Video background toggle */}
        <div className="mt-4 pt-4 border-t border-[#DEDBC8]/6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#DEDBC8]/8 flex items-center justify-center shrink-0">
                <Film size={16} className="text-[#DEDBC8]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#E1E0CC]">{t('background.videoLabel')}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                  {t('background.videoDescription')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setUseVideoBackground(!useVideoBackground);
                toast.success(
                  useVideoBackground
                    ? t('background.switchedToCustom')
                    : t('background.switchedToVideo'),
                  { duration: 2000 }
                );
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 shrink-0 ${
                useVideoBackground
                  ? 'bg-[#4F8CFF]'
                  : 'bg-[#DEDBC8]/15'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                  useVideoBackground ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
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
         SECTION 3 — Appearance
         ═════════════════════════════════════════════════════════════════ */}
      <SectionCard
        icon={Palette}
        title={t('appearance.title')}
        description={t('appearance.description')}
        delay={0.15}
      >
        <AppearanceSettings />
      </SectionCard>

      {/* ═════════════════════════════════════════════════════════════════
         SECTION 4 — Notification Preferences
         ═════════════════════════════════════════════════════════════════ */}
      <SectionCard
        icon={Bell}
        title={t('notifications.title')}
        description={t('notifications.description')}
        delay={0.18}
      >
        <NotificationSettings />
      </SectionCard>

      {/* ═════════════════════════════════════════════════════════════════
         SECTION 5 — Account Actions
         ═════════════════════════════════════════════════════════════════ */}
      <SectionCard
        icon={LogOut}
        title="Account Actions"
        description="Sign out or manage your account status."
        delay={0.2}
      >
        <div className="space-y-4">
          {/* Change Password */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h4 className="text-sm font-bold text-[#E1E0CC]">Change your password</h4>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                Use a strong password that you haven't used before.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowPasswordForm((v) => !v)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                showPasswordForm
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/35'
              }`}
            >
              <Lock size={14} />
              {t('password.showForm')}
            </motion.button>
          </div>

          <ChangePasswordForm
            visible={showPasswordForm}
            onClose={() => setShowPasswordForm(false)}
          />

          {/* Divider */}
          <div className="border-t border-[#DEDBC8]/6" />

          {/* Sign Out */}
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
                clearTokens();
                toast.success('Signed out successfully', { duration: 3000 });
                navigate('/login');
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/35 transition-all flex items-center gap-2"
            >
              <LogOut size={14} />
              Sign Out
            </motion.button>
          </div>
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
