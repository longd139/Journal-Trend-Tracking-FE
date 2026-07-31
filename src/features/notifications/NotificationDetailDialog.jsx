import { useTranslation } from 'react-i18next';
import { Search, Clock, FileText, TrendingUp, MessageSquare, ShieldAlert, RefreshCw, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

/* ═══════════════════════════════════════════════════════════════════════════
   Type → icon + color mapping (shared between bell & page)
   ═══════════════════════════════════════════════════════════════════════════ */

const ICON_MAP = {
  new_paper: FileText,
  citations: MessageSquare,
  trend: TrendingUp,
  system: FileText,
  security: ShieldAlert,
  sync: RefreshCw,
  upgrade_prompt: UserCheck,
};

const COLOR_MAP = {
  new_paper: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  citations: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  trend: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  system: { bg: 'bg-violet-500/10', text: 'text-violet-400' },
  security: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  sync: { bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  upgrade_prompt: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
};

/* ═══════════════════════════════════════════════════════════════════════════
   Time formatting
   ═══════════════════════════════════════════════════════════════════════════ */

function formatRelativeTime(notif) {
  if (notif.rawCreatedAt) {
    try {
      const d = new Date(notif.rawCreatedAt);
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch { /* fall through */ }
  }
  if (notif.timestamp) {
    const diff = Date.now() - notif.timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(notif.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return '';
}

function extractKeywordFromText(text) {
  if (!text || typeof text !== 'string') return '';
  // Try to extract quoted keyword: "keyword" or «keyword»
  const quoted = text.match(/["«]([^"»]{2,50})["»]/);
  if (quoted) return quoted[1].trim();
  // Try common patterns like "keyword usage", "keyword increased"
  const pattern = text.match(/([A-Za-z0-9\s\-+#.]{3,40}) (?:usage|increased|decreased|trend|trending|grew|growth|surge)/i);
  if (pattern) return pattern[1].trim();
  return '';
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function NotificationDetailDialog({ notif, open, onClose, onClosePanel, onSearchKeyword }) {
  const { t } = useTranslation('common');

  if (!notif) return null;

  const colors = COLOR_MAP[notif.type] || COLOR_MAP.system;
  const Icon = ICON_MAP[notif.type] || FileText;
  // Extract keyword: use relatedKeywordText first, fallback to extracting from title/message
  const keyword = notif.relatedKeywordText?.trim()
    || extractKeywordFromText(notif.title)
    || extractKeywordFromText(notif.detail)
    || extractKeywordFromText(notif.desc)
    || '';
  const hasKeyword = !!keyword;

  const handleSearchKeyword = () => {
    if (!keyword || !onSearchKeyword) return;
    onSearchKeyword(keyword);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 bg-card border-border rounded-2xl shadow-2xl shadow-black/40">
        {/* Header with icon + title */}
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${colors.bg}`}
            >
              <Icon size={22} className={colors.text} />
            </motion.div>
            <div className="flex-1 min-w-0 pt-0.5">
              <DialogTitle className="text-base font-bold text-foreground leading-snug">
                {notif.title}
              </DialogTitle>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mt-1">
                <Clock size={11} />
                {formatRelativeTime(notif)}
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Body — message */}
        <div className="px-6 pb-6">
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {notif.detail || notif.desc}
          </p>
        </div>

        {/* Footer — action buttons */}
        <div className="px-6 pb-6 pt-2 border-t border-border space-y-2.5">
          {hasKeyword ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSearchKeyword}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:shadow-[0_0_24px_var(--primary)] flex items-center justify-center gap-2"
            >
              <Search size={15} />
              {t('notifications.searchKeyword', { keyword })}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:shadow-[0_0_24px_var(--primary)]"
            >
              {t('notifications.gotIt')}
            </motion.button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
