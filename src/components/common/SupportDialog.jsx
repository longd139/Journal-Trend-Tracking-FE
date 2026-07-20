import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  Search,
  Lightbulb,
  Home,
  BookOpen,
  UserSearch,
  BarChart3,
  Bookmark,
  Bell,
  BellRing,
  FileText,
  Settings,
  Users,
  Globe,
  Database,
  RefreshCw,
  ShieldCheck,
  Sliders,
  Cloud,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

/* ═══════════════════════════════════════════════════════════════════════════
   Role config — each role has distinct accent color
   ═══════════════════════════════════════════════════════════════════════════ */

const ROLE_CONFIG = {
  admin: {
    accent: '#F59E0B',
    accentBg: 'bg-amber-500/10',
    accentText: 'text-amber-400',
    accentBorder: 'border-amber-500/20',
    labelKey: 'roleAdmin',
  },
  researcher: {
    accent: '#4F8CFF',
    accentBg: 'bg-blue-500/10',
    accentText: 'text-blue-400',
    accentBorder: 'border-blue-500/20',
    labelKey: 'roleUser',
  },
  academic_user: {
    accent: '#00D1B2',
    accentBg: 'bg-emerald-500/10',
    accentText: 'text-emerald-400',
    accentBorder: 'border-emerald-500/20',
    labelKey: 'roleUser',
  },
  academic: {
    accent: '#00D1B2',
    accentBg: 'bg-emerald-500/10',
    accentText: 'text-emerald-400',
    accentBorder: 'border-emerald-500/20',
    labelKey: 'roleUser',
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   Section definitions per role
   ═══════════════════════════════════════════════════════════════════════════ */

const USER_SECTIONS = [
  { id: 'overview',      icon: Home,         color: '#DEDBC8' },
  { id: 'search',        icon: Search,       color: '#4F8CFF' },
  { id: 'journal-search',icon: BookOpen,     color: '#00D1B2' },
  { id: 'search-author', icon: UserSearch,   color: '#A78BFA' },
  { id: 'analytics',     icon: BarChart3,    color: '#F59E0B' },
  { id: 'bookmarks',     icon: Bookmark,     color: '#EC4899' },
  { id: 'follows',       icon: Bell,         color: '#10B981' },
  { id: 'notifications', icon: BellRing,     color: '#F97316' },
  { id: 'reports',       icon: FileText,     color: '#6366F1' },
  { id: 'settings',      icon: Settings,     color: '#94A3B8' },
];

const ADMIN_SECTIONS = [
  { id: 'overview',      icon: Home,         color: '#DEDBC8' },
  { id: 'users',         icon: Users,        color: '#4F8CFF' },
  { id: 'system-api',    icon: Globe,        color: '#00D1B2' },
  { id: 'database',      icon: Database,     color: '#A78BFA' },
  { id: 'sync-data',     icon: RefreshCw,    color: '#F59E0B' },
  { id: 'audit-logs',    icon: ShieldCheck,  color: '#EC4899' },
  { id: 'configs',       icon: Sliders,      color: '#10B981' },
  { id: 'data-sources',  icon: Cloud,        color: '#F97316' },
  { id: 'settings',      icon: Settings,     color: '#94A3B8' },
];

const spring = { type: 'spring', stiffness: 400, damping: 30 };

/* ═══════════════════════════════════════════════════════════════════════════
   Support Dialog
   ═══════════════════════════════════════════════════════════════════════════ */

export default function SupportDialog({ open, onClose, role }) {
  const { t } = useTranslation('support');

  const isAdmin = role === 'admin';
  const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG.academic;
  const sections = isAdmin ? ADMIN_SECTIONS : USER_SECTIONS;
  const ns = isAdmin ? 'admin' : 'user';
  const firstSection = sections[0].id;

  const [activeSection, setActiveSection] = useState(firstSection);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter sections by search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter((s) => {
      const label = t(`${ns}.sections.${s.id}`).toLowerCase();
      return label.includes(q) || s.id.toLowerCase().includes(q);
    });
  }, [sections, searchQuery, t, ns]);

  // Reset state when dialog opens
  const handleOpenChange = (isOpen) => {
    if (isOpen) {
      setActiveSection(firstSection);
      setSearchQuery('');
    }
    onClose(isOpen);
  };

  const currentSection = sections.find((s) => s.id === activeSection) || sections[0];
  const SectionIcon = currentSection.icon;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] bg-[#0A0A0A] border border-primary/10 text-foreground p-0 overflow-hidden flex flex-col gap-0">
        {/* ─── Header ─── */}
        <div className="relative shrink-0">
          {/* Accent gradient bar */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent to-transparent"
            style={{ '--tw-gradient-via-color': roleConfig.accent, backgroundImage: `linear-gradient(to right, transparent, ${roleConfig.accent}99, transparent)` }}
          />
          <DialogHeader className="px-6 py-4 border-b border-primary/8">
            <DialogTitle className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${roleConfig.accentBg}`}>
                <HelpCircle size={18} style={{ color: roleConfig.accent }} />
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-base font-bold text-foreground">{t('title')}</span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md border"
                  style={{
                    color: roleConfig.accent,
                    borderColor: `${roleConfig.accent}30`,
                    backgroundColor: `${roleConfig.accent}10`,
                  }}
                >
                  {t(roleConfig.labelKey)}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* ─── Body ─── */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left sidebar */}
          <div className="w-44 shrink-0 border-r border-primary/8 flex flex-col bg-[#0D0D0D]">
            {/* Search */}
            <div className="p-2.5 border-b border-primary/5">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder', 'Filter...')}
                  className="w-full pl-7 pr-2.5 py-1.5 rounded-lg text-[10px] border bg-card border-primary/8 text-foreground placeholder:text-gray-600 focus:outline-none focus:border-primary/20 transition-colors"
                />
              </div>
            </div>

            {/* Section list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {filteredSections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-3 text-center gap-2">
                  <Search size={16} className="text-gray-700" />
                  <p className="text-[10px] text-gray-600">No matching sections</p>
                </div>
              ) : (
                filteredSections.map(({ id, icon: Icon, color }) => {
                  const isActive = activeSection === id;
                  return (
                    <motion.button
                      key={id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveSection(id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                        isActive
                          ? 'bg-primary/8 text-primary border-l-2'
                          : 'text-gray-400 hover:bg-white/[0.03] hover:text-foreground border-l-2 border-transparent'
                      }`}
                      style={{ borderLeftColor: isActive ? color : 'transparent' }}
                    >
                      <Icon size={14} style={{ color }} />
                      <span className="truncate">{t(`${ns}.sections.${id}`)}</span>
                    </motion.button>
                  );
                })
              )}
            </div>

            {/* Section count */}
            <div className="px-3 py-2 border-t border-primary/5">
              <p className="text-[9px] text-gray-600">
                {filteredSections.length} {filteredSections.length === 1 ? 'section' : 'sections'}
              </p>
            </div>
          </div>

          {/* Right content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="p-6 space-y-5"
              >
                {/* Section header */}
                <div className="flex items-center gap-3 pb-4 border-b border-primary/8">
                  <div
                    className="p-2.5 rounded-xl"
                    style={{ backgroundColor: `${currentSection.color}18` }}
                  >
                    <SectionIcon size={18} style={{ color: currentSection.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {t(`${ns}.sections.${activeSection}`)}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {t(`${ns}.descriptions.${activeSection}`)}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4
                    className="text-[11px] font-bold uppercase tracking-wider mb-2"
                    style={{ color: roleConfig.accent }}
                  >
                    {t(`${ns}.content.${activeSection}.heading`)}
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {t(`${ns}.content.${activeSection}.description`)}
                  </p>
                </div>

                {/* Steps */}
                {t(`${ns}.content.${activeSection}.steps`, { defaultValue: '' }) && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      How to
                    </p>
                    {t(`${ns}.content.${activeSection}.steps`, { defaultValue: '' })
                      .split('|')
                      .filter(Boolean)
                      .map((step, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.08 + i * 0.04 }}
                          className="flex items-start gap-3 p-3 rounded-xl border transition-all duration-200"
                          style={{
                            backgroundColor: `${roleConfig.accent}05`,
                            borderColor: `${roleConfig.accent}20`,
                          }}
                        >
                          <span
                            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                            style={{
                              backgroundColor: `${roleConfig.accent}18`,
                              color: roleConfig.accent,
                            }}
                          >
                            {i + 1}
                          </span>
                          <span className="text-xs text-gray-300 leading-relaxed pt-0.5">
                            {step.trim()}
                          </span>
                        </motion.div>
                      ))}
                  </div>
                )}

                {/* Tip box */}
                <div
                  className="flex items-start gap-3 p-4 rounded-xl border-l-2"
                  style={{
                    borderLeftColor: roleConfig.accent,
                    backgroundColor: `${roleConfig.accent}06`,
                  }}
                >
                  <Lightbulb size={16} className="shrink-0 mt-0.5" style={{ color: roleConfig.accent }} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: roleConfig.accent }}>
                      {t('tip')}
                    </p>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      {t(`${ns}.tips.${activeSection}`, t(`${ns}.tips.default`))}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div className="shrink-0 px-6 py-3 border-t border-primary/8 flex items-center justify-between">
          <span className="text-[9px] text-gray-600">SciTrack — Research Platform</span>
          <span className="text-[9px] text-gray-700">Press Esc to close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
