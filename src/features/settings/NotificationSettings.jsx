import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, Smartphone, Bell, FileText, Quote, TrendingUp, Newspaper } from 'lucide-react';
import { Switch } from '../../components/ui/switch';

/* ═══════════════════════════════════════════════════════════════════════════
   NotificationSettings — toggle switches for notification preferences
   Persisted to localStorage. No backend API needed for MVP.
   ═══════════════════════════════════════════════════════════════════════════ */

const PREFS_KEY = 'scitrack_notification_prefs';

const DEFAULT_PREFS = {
  enabled: true,
  channels: { email: true, push: true, inApp: true },
  categories: { citations: true, trends: true, journals: true, system: false, digest: false },
};

function loadPrefs() {
  try {
    const saved = localStorage.getItem(PREFS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        enabled: parsed.enabled ?? DEFAULT_PREFS.enabled,
        channels: { ...DEFAULT_PREFS.channels, ...parsed.channels },
        categories: { ...DEFAULT_PREFS.categories, ...parsed.categories },
      };
    }
  } catch {
    // Fall through
  }
  return { ...DEFAULT_PREFS, channels: { ...DEFAULT_PREFS.channels }, categories: { ...DEFAULT_PREFS.categories } };
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Silently fail
  }
}

function ToggleRow({ icon: Icon, label, description, checked, onToggle, disabled }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${checked && !disabled ? 'bg-primary/10' : 'bg-white/[0.03]'}`}>
          <Icon size={14} className={checked && !disabled ? 'text-primary' : 'text-gray-500'} />
        </div>
        <div className="min-w-0">
          <p className={`text-xs font-semibold truncate ${disabled ? 'text-gray-500' : 'text-foreground'}`}>
            {label}
          </p>
          {description && (
            <p className="text-[10px] text-gray-500 truncate">{description}</p>
          )}
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onToggle}
        disabled={disabled}
        className="shrink-0"
      />
    </div>
  );
}

export default function NotificationSettings() {
  const { t } = useTranslation('settings');
  const [prefs, setPrefs] = useState(loadPrefs);

  const updatePrefs = useCallback((updater) => {
    setPrefs((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      savePrefs(next);
      return next;
    });
  }, []);

  const toggleEnabled = () => updatePrefs((p) => ({ ...p, enabled: !p.enabled }));

  const toggleChannel = (key) => () =>
    updatePrefs((p) => ({
      ...p,
      channels: { ...p.channels, [key]: !p.channels[key] },
    }));

  const toggleCategory = (key) => () =>
    updatePrefs((p) => ({
      ...p,
      categories: { ...p.categories, [key]: !p.categories[key] },
    }));

  const channels = [
    { key: 'email', icon: Mail, label: t('notifications.emailNotifications'), desc: 'Receive notifications via email' },
    { key: 'push', icon: Smartphone, label: t('notifications.pushNotifications'), desc: 'Browser push notifications' },
    { key: 'inApp', icon: Bell, label: 'In-App Notifications', desc: 'Show within the platform' },
  ];

  const categories = [
    { key: 'citations', icon: Quote, label: t('notifications.categories.citations'), desc: 'When your papers get cited' },
    { key: 'trends', icon: TrendingUp, label: t('notifications.categories.journalUpdates'), desc: 'Trending topics in your field' },
    { key: 'journals', icon: FileText, label: 'Journal Updates', desc: 'New issues from followed journals' },
    { key: 'digest', icon: Newspaper, label: t('notifications.categories.followActivity'), desc: 'Weekly research summary' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Master toggle */}
      <div className="flex items-center justify-between gap-4 pb-5 border-b border-primary/6">
        <div>
          <h4 className="text-sm font-bold text-foreground">{t('notifications.title')}</h4>
          <p className="text-[11px] text-gray-400 mt-0.5">{t('notifications.description')}</p>
        </div>
        <Switch checked={prefs.enabled} onCheckedChange={toggleEnabled} className="shrink-0" />
      </div>

      {/* Channel toggles */}
      <div>
        <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider mb-2">
          Delivery Channels
        </p>
        <div className="space-y-0.5">
          {channels.map((ch) => (
            <ToggleRow
              key={ch.key}
              icon={ch.icon}
              label={ch.label}
              description={ch.desc}
              checked={prefs.channels[ch.key]}
              onToggle={toggleChannel(ch.key)}
              disabled={!prefs.enabled}
            />
          ))}
        </div>
      </div>

      {/* Category toggles */}
      <div className="pt-2 border-t border-primary/6">
        <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider mb-2">
          Alert Types
        </p>
        <div className="space-y-0.5">
          {categories.map((cat) => (
            <ToggleRow
              key={cat.key}
              icon={cat.icon}
              label={cat.label}
              description={cat.desc}
              checked={prefs.categories[cat.key]}
              onToggle={toggleCategory(cat.key)}
              disabled={!prefs.enabled}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
