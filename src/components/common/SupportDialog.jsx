import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HelpCircle,
  Home,
  Search,
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

export default function SupportDialog({ open, onClose, role }) {
  const { t } = useTranslation('support');

  const isAdmin = role === 'admin';
  const sections = isAdmin ? ADMIN_SECTIONS : USER_SECTIONS;
  const ns = isAdmin ? 'admin' : 'user';
  const firstSection = sections[0].id;

  const [activeSection, setActiveSection] = useState(firstSection);

  // Reset to first section when dialog opens
  const handleOpenChange = (isOpen) => {
    if (isOpen) setActiveSection(firstSection);
    onClose(isOpen);
  };

  const currentSection = sections.find((s) => s.id === activeSection) || sections[0];
  const SectionIcon = currentSection.icon;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] bg-[#101010] border border-[#DEDBC8]/10 text-[#E1E0CC] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-5 py-4 border-b border-[#DEDBC8]/10 shrink-0">
          <DialogTitle className="flex items-center gap-2.5 text-base">
            <HelpCircle size={18} className="text-[#DEDBC8]" />
            {t('title')}
            <span className="text-[10px] font-normal text-gray-500 ml-1">
              — {isAdmin ? t('roleAdmin') : t('roleUser')}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Left sidebar — section list */}
          <div className="w-44 shrink-0 border-r border-[#DEDBC8]/10 p-2 space-y-0.5 overflow-y-auto">
            {sections.map(({ id, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                  activeSection === id
                    ? 'bg-[#DEDBC8]/10 text-[#DEDBC8]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-[#E1E0CC]'
                }`}
              >
                <Icon size={14} style={{ color: activeSection === id ? color : undefined }} />
                {t(`${ns}.sections.${id}`)}
              </button>
            ))}
          </div>

          {/* Right content area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Section header */}
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#DEDBC8]/5">
              <div
                className="p-1.5 rounded-lg"
                style={{ backgroundColor: `${currentSection.color}15` }}
              >
                <SectionIcon size={16} style={{ color: currentSection.color }} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#E1E0CC]">
                  {t(`${ns}.sections.${activeSection}`)}
                </h3>
                <p className="text-[10px] text-gray-500">
                  {t(`${ns}.descriptions.${activeSection}`)}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Heading + Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {t(`${ns}.content.${activeSection}.heading`)}
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {t(`${ns}.content.${activeSection}.description`)}
                </p>
              </div>

              {/* Steps */}
              {t(`${ns}.content.${activeSection}.steps`, { defaultValue: '' }) && (
                <ul className="space-y-1.5">
                  {t(`${ns}.content.${activeSection}.steps`, { defaultValue: '' })
                    .split('|')
                    .filter(Boolean)
                    .map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                        <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#DEDBC8]/10 text-[#DEDBC8] text-[9px] font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        {step.trim()}
                      </li>
                    ))}
                </ul>
              )}
            </div>

            {/* Tips box */}
            <div className="p-3 rounded-lg bg-[#DEDBC8]/[0.03] border border-[#DEDBC8]/5">
              <p className="text-[11px] text-gray-400">
                <strong className="text-[#E1E0CC]">{t('tip')}:</strong>{' '}
                {t(`${ns}.tips.${activeSection}`, t(`${ns}.tips.default`))}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
