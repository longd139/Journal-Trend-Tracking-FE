import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Bookmark,
  Hash,
  Loader2,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';

const typeIcons = {
  journal: Building2,
  topic: Bookmark,
  keyword: Hash,
};

const typeColors = {
  journal: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  topic: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  keyword: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
};

function getFollowType(follow) {
  if (follow.journalId) return 'journal';
  if (follow.topicId) return 'topic';
  if (follow.keywordId) return 'keyword';
  return 'keyword';
}

function getFollowName(follow) {
  if (follow.journalId) return follow.journalName || follow.journalId;
  if (follow.topicId) return follow.topicName || follow.topicId;
  if (follow.keywordId) return follow.keywordText || follow.keywordId;
  return 'Unknown';
}

function formatDate(dateStr, t) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return t('label.followedOn', { date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) });
  } catch {
    return dateStr;
  }
}

/**
 * FollowCard — Hiển thị 1 follow trong danh sách
 *
 * Props:
 *  - follow: FollowResponse
 *  - onToggleNotify: (followId, enabled) => Promise<void>
 *  - onUnfollow: (followId) => Promise<void>
 */
export default function FollowCard({ follow, onToggleNotify, onUnfollow }) {
  const { t } = useTranslation('follow');
  const [toggling, setToggling] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [localNotify, setLocalNotify] = React.useState(follow.notifyEnabled);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  // Sync local state when prop changes
  React.useEffect(() => {
    setLocalNotify(follow.notifyEnabled);
  }, [follow.notifyEnabled]);

  const type = getFollowType(follow);
  const name = getFollowName(follow);
  const Icon = typeIcons[type] || Hash;
  const colors = typeColors[type] || typeColors.keyword;

  const handleToggle = async (checked) => {
    setToggling(true);
    // Optimistic update
    setLocalNotify(checked);
    try {
      await onToggleNotify(follow.followId, checked);
      toast.success(
        t('toast.toggleSuccess', {
          status: checked ? t('dialog.enableNotification') : 'disabled',
        }),
      );
    } catch (error) {
      // Revert on error
      setLocalNotify(!checked);
      const msg = error?.response?.data?.message || error?.message || t('toast.genericError');
      toast.error(msg);
    } finally {
      setToggling(false);
    }
  };

  const handleUnfollow = async () => {
    setDeleting(true);
    setConfirmOpen(false);
    try {
      await onUnfollow(follow.followId);
      toast.success(t('toast.unfollowSuccess'));
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || t('toast.genericError');
      toast.error(msg);
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={deleting ? { opacity: 0, y: -20, height: 0 } : { opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border p-4 sm:p-5 bg-[#101010] border-[#DEDBC8]/10 hover:border-[#DEDBC8]/20 transition-colors"
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
        {/* Left: icon + info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colors.bg} ${colors.text}`}
          >
            <Icon size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${colors.bg} ${colors.text} ${colors.border}`}
              >
                {t(`label.${type}`)}
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#E1E0CC] truncate">{name}</h4>
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(follow.createdAt, t)}
            </p>
          </div>
        </div>

        {/* Right: toggle + unfollow */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{t('label.notification')}</span>
            {toggling ? (
              <Loader2 size={14} className="animate-spin text-gray-400" />
            ) : (
              <Switch
                checked={localNotify}
                onCheckedChange={handleToggle}
                disabled={toggling}
              />
            )}
          </div>

          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={deleting}
                className="text-gray-500 hover:text-red-400 hover:bg-red-500/10"
              >
                {deleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#101010] border-[#DEDBC8]/10 text-[#E1E0CC]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[#E1E0CC]">
                  {t('button.unfollow')} "{name}"?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  {t('toast.unfollowSuccess')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-[#DEDBC8]/10 text-gray-400 hover:text-[#E1E0CC] hover:bg-[#DEDBC8]/10">
                  {t('button.cancel')}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleUnfollow}
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  {t('button.unfollow')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </motion.div>
  );
}
