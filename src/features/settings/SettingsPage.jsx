import { useState, useEffect, useRef, useCallback } from 'react';
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
  Camera,
  X,
  RotateCcw,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { userAPI } from '../user/api';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { getLocalePreview } from '../../utils/localization';
import { useAuthStore } from '../user/store';
import ChangePasswordForm from './ChangePasswordForm';
import NotificationSettings from './NotificationSettings';
import { useTheme } from '../../hooks/useTheme';

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
        className="text-[11px] font-bold text-primary/80 uppercase tracking-[0.05em] ml-1"
      >
        {label}
      </label>
      <div className="relative group">
        {Icon && (
          <Icon
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 text-muted-foreground group-focus-within:text-primary transition-colors duration-300"
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
                ? 'bg-card-recessed/50 border-border text-muted-foreground cursor-not-allowed'
                : 'bg-card-recessed border-primary/10 text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:bg-card focus:shadow-primary/5 focus:ring-1 focus:ring-primary/15'
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
        <p className="text-[10px] text-muted-foreground ml-1">{hint}</p>
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
      className="rounded-2xl border border-primary/8 bg-card-recessed/80 backdrop-blur-xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-primary/6 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
          <Icon size={19} className="text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground font-display tracking-tight">
            {title}
          </h3>
          {description && (
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
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
  const { theme, setTheme } = useTheme();
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
        // Restore solid color from Zustand if set
        const savedBgColor = useAuthStore.getState().backgroundColor;
        if (savedBgColor) {
          setSelectedColor(savedBgColor);
          setSolidColorSaved(savedBgColor);
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

  const handleResetBackground = async () => {
    try {
      setBackgroundPreview(null);
      setBackgroundFile(null);
      setBackgroundChanged(false);
      setSolidColorSaved(null);
      setSolidColorDirty(false);
      useAuthStore.getState().setBackground(null);
      useAuthStore.getState().setBackgroundColor(null);
      const payload = {
        fullName: formData.fullName,
        institution: formData.institution,
        email: formData.email,
        backgroundUrl: null,
      };
      await userAPI.updateProfile(payload);
      setFormData((prev) => ({ ...prev, backgroundUrl: null }));
      toast.success('Background reset to default');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reset background');
    }
  };

  const [selectedColor, setSelectedColor] = useState('#1B2235');
  // Refs for instant DOM updates — bypass React render for 60fps color tracking
  const previewBgRef = useRef(null);
  const swatchRef = useRef(null);
  const pickerLabelRef = useRef(null);
  const [solidColorSaved, setSolidColorSaved] = useState(null);
  const [solidColorDirty, setSolidColorDirty] = useState(false);
  const [solidColorSaving, setSolidColorSaving] = useState(false);

  const handleSelectSolidColor = useCallback((color) => {
    // ⚡ Direct DOM update — instant, zero React render overhead
    if (previewBgRef.current) previewBgRef.current.style.background = color;
    if (swatchRef.current) swatchRef.current.style.background = color;
    if (pickerLabelRef.current) pickerLabelRef.current.style.background = color;

    setSelectedColor(color);
    setSolidColorDirty(true);
    setBackgroundFile(null);
    setBackgroundChanged(false);
  }, []);

  const handleDiscardSolidColor = () => {
    if (solidColorSaved) {
      setSelectedColor(solidColorSaved);
    } else {
      setSelectedColor('#1B2235');
    }
    setSolidColorDirty(false);
  };

  const handlePresetColor = async (color) => {
    setSelectedColor(color);
    setSolidColorSaving(true);

    // ⚡ Apply instantly via Zustand (no network wait)
    useAuthStore.getState().setBackgroundColor(color);
    setSolidColorSaved(color);
    setSolidColorDirty(false);
    toast.success('Background updated');

    // Upload to Cloudinary in background (non-blocking)
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1440;
      canvas.height = 320;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1440, 320);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], `bg-${color.replace('#', '')}.png`, { type: 'image/png' });

      const result = await userAPI.uploadBackground(file);
      // Also set backgroundUrl for backward compatibility
      useAuthStore.getState().setBackground(result.url);
      setBackgroundPreview(result.url);
      setFormData((prev) => ({ ...prev, backgroundUrl: result.url }));
    } catch {
      // Silent — color already applied via backgroundColor in store
    } finally {
      setSolidColorSaving(false);
    }
  };

  const PRESET_COLORS = [
    { color: '#F7F6F1', label: 'Warm Ivory' },
    { color: '#FFFFFF', label: 'Pure White' },
    { color: '#E8E4D4', label: 'Cream' },
    { color: '#D4E6F1', label: 'Sky Blue' },
    { color: '#E8F0E3', label: 'Sage Green' },
    { color: '#F5E6E0', label: 'Rose' },
    { color: '#E0E8F0', label: 'Steel' },
    { color: '#F0E8F0', label: 'Lavender' },
    { color: '#1B2235', label: 'Deep Navy' },
    { color: '#0B1020', label: 'Midnight' },
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
      // Clear solid color when image takes over
      useAuthStore.getState().setBackgroundColor(null);
      setSolidColorSaved(null);
      setSolidColorDirty(false);
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
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/8">
          <User size={13} className="text-primary" />
          <span className="text-xs font-bold text-primary">Profile</span>
        </div>
        <span className="text-[11px] text-muted-foreground">Manage your personal information, preferences, and appearance</span>
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
        <div className="flex items-center gap-5 mb-8 pb-8 border-b border-primary/6">
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
                className="w-[72px] h-[72px] rounded-full object-cover shadow-primary/10 ring-2 ring-primary/20"
              />
            ) : (
              <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-primary to-[#B8B48A] flex items-center justify-center text-2xl font-black text-black uppercase shadow-primary/10 ring-2 ring-primary/20">
                {getInitials(formData.fullName)}
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-white" />
            </div>
            {/* Online dot */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card-recessed border-2 border-primary/20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            </div>
          </button>

          {/* Remove avatar button (only when avatar is set) */}
          {avatarPreview && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="text-[10px] font-semibold text-muted-foreground hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <X size={12} />
              Remove
            </button>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-foreground truncate font-display">
              {formData.fullName || '—'}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/15 uppercase tracking-wider">
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
                    className="absolute right-3 top-[34px] z-10 animate-spin text-muted-foreground"
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
                      className="absolute z-50 w-full mt-1.5 rounded-xl border border-primary/15 bg-card shadow-2xl shadow-black/40 overflow-hidden"
                    >
                      {uniSuggestions.map((uni, idx) => (
                        <li
                          key={idx}
                          onMouseDown={() => {
                            setEditForm((prev) => ({ ...prev, institution: uni.name }));
                            setShowUniSuggestions(false);
                          }}
                          className="px-4 py-2.5 text-xs text-foreground hover:bg-primary/8 cursor-pointer border-b border-border last:border-b-0 transition-colors flex items-center gap-2.5"
                        >
                          <Building size={12} className="text-muted-foreground" />
                          {uni.name}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right column — Email card */}
            <div className="p-5 rounded-2xl border border-primary/6 bg-card-recessed/50 flex flex-col">
              <FormField
                icon={Mail}
                label={t('profile.email')}
                name="email"
                value={formData.email}
                readOnly
              />

              <div className="mt-4 pt-4 border-t border-border flex-1 flex flex-col justify-end">
                {!formData.isVerified ? (
                  <>
                    <p className="text-[11px] text-foreground/70 font-medium leading-relaxed mb-3">
                      {t('profile.verifyEmail')}
                    </p>
                    <button
                      type="button"
                      onClick={handleVerifyEmail}
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-50 bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 hover:border-amber-500/50 transition-all flex items-center justify-center gap-2 group"
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
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all duration-300 resize-none bg-card-recessed border-primary/10 text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:bg-card focus:shadow-primary/5 focus:ring-1 focus:ring-primary/15"
            />
          </FormField>

          {/* ── Save bar ──────────────────────────────────────────── */}
          <div className="pt-6 border-t border-primary/6 flex items-center justify-between gap-4">
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
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/25 transition-all border border-transparent hover:border-primary/10"
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
                  ? 'bg-primary text-primary-foreground shadow-primary/20 hover:shadow-primary/30 hover:bg-[#E8E4D4]'
                  : 'bg-primary/10 text-muted-foreground cursor-not-allowed border border-primary/10'
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

        {/* Background preview — show solid color directly if dirty, else show current background */}
        <div className="relative rounded-xl overflow-hidden border border-primary/10 mb-5">
          {solidColorDirty ? (
            <div
              ref={previewBgRef}
              className="w-full h-40"
              style={{ background: selectedColor }}
            />
          ) : backgroundPreview ? (
            <img
              src={backgroundPreview}
              alt="Background"
              className="w-full h-40 object-cover"
            />
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-card via-card-recessed to-card flex items-center justify-center">
              <span className="text-xs text-muted-foreground">No background set</span>
            </div>
          )}
          {/* Dirty indicator */}
          {solidColorDirty && (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-bold text-amber-400">
              Unsaved
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
              bg-primary/8 border border-primary/15 text-foreground
              hover:bg-primary/15 transition-all"
          >
            <Camera size={13} /> Choose Image
          </button>
          {backgroundPreview && (
            <button
              type="button"
              onClick={handleRemoveBackground}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
                text-muted-foreground hover:text-red-400 transition-colors"
            >
              <X size={13} /> Remove
            </button>
          )}
          <button
            type="button"
            onClick={handleResetBackground}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
              text-muted-foreground hover:text-foreground hover:bg-primary/8 transition-all"
            title="Reset to default video background"
          >
            <RotateCcw size={13} /> Reset to default
          </button>
          {backgroundChanged && backgroundFile && (
            <button
              type="button"
              onClick={handleSaveBackground}
              disabled={backgroundUploading}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold
                bg-accent-blue text-white hover:bg-accent-blue/80 disabled:opacity-50 transition-all"
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
        <p className="text-[10px] text-muted-foreground mt-3">
          Recommended size: 1440×320px. JPG, PNG or WebP. Max 5MB.
        </p>

        {/* Custom color picker + slider */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Or pick a solid color</p>

          {/* Color preview + hex input + picker */}
          <div className="flex items-center gap-3 mb-4">
            <div ref={swatchRef} className="relative w-12 h-12 rounded-xl border-2 border-border shadow-sm shrink-0 overflow-hidden"
              style={{ background: selectedColor }}
            >
              {solidColorSaving && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <RefreshCw size={16} className="animate-spin text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={selectedColor}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                      setSelectedColor(val);
                      if (val.length === 7) handleSelectSolidColor(val);
                    }
                  }}
                  placeholder="#1B2235"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm font-mono bg-card border border-input text-foreground placeholder:text-muted-foreground/50 focus:border-primary/30 focus:ring-1 focus:ring-primary/10 outline-none transition-all"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">#</span>
              </div>
              <label ref={pickerLabelRef} className="w-10 h-10 rounded-lg border-2 border-input hover:border-primary/30 cursor-pointer transition-all flex items-center justify-center overflow-hidden shrink-0"
                style={{ background: selectedColor }}
                title="Open color picker"
              >
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => {
                    handleSelectSolidColor(e.target.value);
                  }}
                  className="opacity-0 absolute w-0 h-0"
                />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </label>
            </div>
          </div>

          {/* Save / Discard buttons for solid color */}
          {solidColorDirty && (
            <div className="flex items-center gap-3 mb-4">
              <button
                type="button"
                onClick={() => handlePresetColor(selectedColor)}
                disabled={solidColorSaving}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold
                  bg-accent-blue text-white hover:bg-accent-blue/80 disabled:opacity-50 transition-all"
              >
                {solidColorSaving ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <Save size={13} />
                )}
                {solidColorSaving ? 'Saving...' : 'Save Color'}
              </button>
              <button
                type="button"
                onClick={handleDiscardSolidColor}
                disabled={solidColorSaving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
                  text-muted-foreground hover:text-foreground hover:bg-primary/8 transition-all border border-transparent hover:border-primary/10 disabled:opacity-50"
              >
                <RotateCcw size={13} /> Discard
              </button>
            </div>
          )}

          {/* Preset color chips */}
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map(({ color, label }) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  handleSelectSolidColor(color);
                }}
                title={label}
                className={`w-9 h-9 rounded-lg border-2 transition-all hover:scale-110 shadow-sm ${
                  selectedColor === color ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-border hover:border-primary/40'
                }`}
                style={{ background: color }}
              />
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ═════════════════════════════════════════════════════════════════
         SECTION 1.8 — Appearance / Theme
         ═════════════════════════════════════════════════════════════════ */}
      <SectionCard
        icon={Sun}
        title="Appearance"
        description="Choose between light, dark, or follow your system preference."
        delay={0.12}
      >
        <div className="flex flex-wrap gap-3">
          {/* Light */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center gap-3 px-5 py-4 rounded-xl border-2 transition-all duration-200 ${
              theme === 'light'
                ? 'border-[#3A5BA0] bg-[#3A5BA0]/5 shadow-[0_0_0_1px_rgba(58,91,160,0.3)]'
                : 'border-primary/10 bg-transparent hover:border-primary/25 dark:border-primary/10 dark:hover:border-primary/25'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              theme === 'light'
                ? 'bg-[#3A5BA0] text-white shadow-lg shadow-[#3A5BA0]/25'
                : 'bg-muted/30 text-muted-foreground dark:bg-muted/30'
            }`}>
              <Sun size={20} />
            </div>
            <div className="text-left">
              <div className={`text-sm font-bold transition-colors ${
                theme === 'light' ? 'text-[#3A5BA0]' : 'text-foreground'
              }`}>Light</div>
              <div className="text-[10px] text-muted-foreground">Warm ivory tone</div>
            </div>
          </button>

          {/* Dark */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-3 px-5 py-4 rounded-xl border-2 transition-all duration-200 ${
              theme === 'dark'
                ? 'border-primary bg-primary/5 shadow-[0_0_0_1px_var(--shadow-color)]'
                : 'border-primary/10 bg-transparent hover:border-primary/25 dark:border-primary/10 dark:hover:border-primary/25'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              theme === 'dark'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'bg-muted/30 text-muted-foreground dark:bg-muted/30'
            }`}>
              <Moon size={20} />
            </div>
            <div className="text-left">
              <div className={`text-sm font-bold transition-colors ${
                theme === 'dark' ? 'text-primary' : 'text-foreground'
              }`}>Dark</div>
              <div className="text-[10px] text-muted-foreground">Deep observatory</div>
            </div>
          </button>

          {/* System */}
          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`flex items-center gap-3 px-5 py-4 rounded-xl border-2 transition-all duration-200 ${
              theme === 'system'
                ? 'border-[#9CA3AF] bg-muted/25 shadow-[0_0_0_1px_rgba(156,163,175,0.3)]'
                : 'border-primary/10 bg-transparent hover:border-primary/25 dark:border-primary/10 dark:hover:border-primary/25'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              theme === 'system'
                ? 'bg-muted-foreground text-white shadow-lg shadow-[#9CA3AF]/20'
                : 'bg-muted/30 text-muted-foreground dark:bg-muted/30'
            }`}>
              <Monitor size={20} />
            </div>
            <div className="text-left">
              <div className={`text-sm font-bold transition-colors ${
                theme === 'system' ? 'text-muted-foreground' : 'text-foreground'
              }`}>System</div>
              <div className="text-[10px] text-muted-foreground">Follow OS setting</div>
            </div>
          </button>
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
            <label className="text-[11px] font-bold text-primary/80 uppercase tracking-[0.05em]">
              {t('language.title')}
            </label>
            <div className="max-w-[260px]">
              <LanguageSwitcher variant="inline" />
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {t('language.description')}
            </p>
          </div>

          {/* Preview card */}
          <div className="md:col-span-2 p-4 rounded-2xl border border-primary/6 bg-card-recessed/50 space-y-3">
            <label className="text-[11px] font-bold text-primary/80 uppercase tracking-[0.05em]">
              {t('language.preview')}
            </label>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs py-2 px-3 rounded-lg bg-card border border-border">
                <span className="text-muted-foreground">{t('language.dateSample')}</span>
                <span className="font-bold text-foreground font-mono text-[11px]">
                  {langPreview.date}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-2 px-3 rounded-lg bg-card border border-border">
                <span className="text-muted-foreground">{t('language.numberSample')}</span>
                <span className="font-bold text-foreground font-mono text-[11px]">
                  {langPreview.number}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Language actions */}
        <div className="flex items-center gap-3 mt-5 pt-5 border-t border-primary/6">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSaveLanguagePreference}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-primary/15 hover:shadow-primary/25 transition-all flex items-center gap-2"
          >
            <Save size={13} /> {t('language.savePreference')}
          </motion.button>
          <button
            onClick={() => {
              i18n.changeLanguage('en');
              localStorage.setItem('preferredLanguage', 'en');
              toast.success(t('language.saved'), { duration: 2000 });
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/25 transition-all border border-transparent hover:border-primary/10"
          >
            {t('language.resetDefault')}
          </button>
        </div>
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
              <h4 className="text-sm font-bold text-foreground">Change your password</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
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
          <div className="border-t border-primary/6" />

          {/* Sign Out */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h4 className="text-sm font-bold text-foreground">Sign out of your account</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
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
        className="text-center text-[10px] text-muted-foreground pt-2"
      >
        SCITRACK Settings · Changes are saved per session
      </motion.p>
    </div>
  );
}
