import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Moon, Sun, Monitor, Check } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

/* ═══════════════════════════════════════════════════════════════════════════
   AppearanceSettings — theme, font size, layout density
   Persisted to localStorage. Uses existing useTheme hook for theme.
   Font size: sets base font-size on <html> so rem-based sizing responds.
   Density: sets data-density attribute on <html> for optional CSS usage.
   ═══════════════════════════════════════════════════════════════════════════ */

const FONT_SIZE_KEY = 'scitrack_fontSize';
const DENSITY_KEY = 'scitrack_density';

const FONT_SIZES = [
  { key: 'small', basePx: 14 },
  { key: 'medium', basePx: 16 },
  { key: 'large', basePx: 18 },
];

const DENSITIES = [
  { key: 'compact' },
  { key: 'comfortable' },
];

function loadPref(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function savePref(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Silently fail
  }
}

export default function AppearanceSettings() {
  const { t } = useTranslation('settings');
  const { theme, setTheme } = useTheme();

  const [fontSize, setFontSize] = useState(() => loadPref(FONT_SIZE_KEY, 'medium'));
  const [density, setDensity] = useState(() => loadPref(DENSITY_KEY, 'comfortable'));
  const [saved, setSaved] = useState(false);

  // Apply font size to <html> — changes rem base for entire app
  useEffect(() => {
    const cfg = FONT_SIZES.find((f) => f.key === fontSize) || FONT_SIZES[1];
    document.documentElement.style.fontSize = `${cfg.basePx}px`;
    savePref(FONT_SIZE_KEY, fontSize);
  }, [fontSize]);

  // Apply density as data attribute on <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
    savePref(DENSITY_KEY, density);
  }, [density]);

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const themes = [
    { key: 'dark', icon: Moon, label: t('appearance.themeDark') },
    { key: 'light', icon: Sun, label: t('appearance.themeLight') },
    { key: 'system', icon: Monitor, label: t('appearance.themeSystem') },
  ];

  return (
    <div className="space-y-6">
      {/* Saved indicator */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400"
        >
          <Check size={11} /> Saved
        </motion.div>
      )}

      {/* Theme selector */}
      <div>
        <label className="text-[11px] font-bold text-[#DEDBC8]/80 uppercase tracking-[0.05em] block mb-3">
          {t('appearance.theme')}
        </label>
        <div className="flex gap-2">
          {themes.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => { setTheme(key); flashSaved(); }}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                theme === key
                  ? 'bg-[#DEDBC8]/10 text-[#DEDBC8] border-[#DEDBC8]/30'
                  : 'text-gray-500 border-[#DEDBC8]/8 hover:text-[#E1E0CC] hover:border-[#DEDBC8]/20'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <label className="text-[11px] font-bold text-[#DEDBC8]/80 uppercase tracking-[0.05em] block mb-3">
          {t('appearance.fontSize')}
        </label>
        <div className="flex gap-2">
          {FONT_SIZES.map(({ key, basePx }) => (
            <button
              key={key}
              onClick={() => { setFontSize(key); flashSaved(); }}
              className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                fontSize === key
                  ? 'bg-[#DEDBC8]/10 text-[#DEDBC8] border-[#DEDBC8]/30'
                  : 'text-gray-500 border-[#DEDBC8]/8 hover:text-[#E1E0CC] hover:border-[#DEDBC8]/20'
              }`}
            >
              <span className="flex flex-col items-center gap-0.5">
                <span>{t(`appearance.font${key.charAt(0).toUpperCase() + key.slice(1)}`)}</span>
                <span className="text-[9px] opacity-50">{basePx}px</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Layout Density */}
      <div>
        <label className="text-[11px] font-bold text-[#DEDBC8]/80 uppercase tracking-[0.05em] block mb-3">
          {t('appearance.density')}
        </label>
        <div className="flex gap-2">
          {DENSITIES.map(({ key }) => (
            <button
              key={key}
              onClick={() => { setDensity(key); flashSaved(); }}
              className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                density === key
                  ? 'bg-[#DEDBC8]/10 text-[#DEDBC8] border-[#DEDBC8]/30'
                  : 'text-gray-500 border-[#DEDBC8]/8 hover:text-[#E1E0CC] hover:border-[#DEDBC8]/20'
              }`}
            >
              <span className="flex flex-col items-center gap-0.5">
                <span>{t(`appearance.density${key.charAt(0).toUpperCase() + key.slice(1)}`)}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
