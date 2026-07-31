import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Bookmark,
  Hash,
  Loader2,
  Trash2,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
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
} from '../../components/ui/alert-dialog';

const typeIcons = {
  journal: Building2,
  topic: Bookmark,
  keyword: Hash,
  author: User,
};

const typeColors = {
  journal: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/20' },
  topic: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20' },
  keyword: { bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-500/20' },
  author: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20' },
};

function getFollowType(follow) {
  if (follow.journalId) return 'journal';
  if (follow.topicId) return 'topic';
  if (follow.keywordId) return 'keyword';
  if (follow.authorId) return 'author';
  return 'keyword';
}

function getFollowName(follow) {
  if (follow.journalId) return follow.journalName || follow.journalId;
  if (follow.topicId) return follow.topicName || follow.topicId;
  if (follow.keywordId) return follow.keywordText || follow.keywordId;
  if (follow.authorId) return follow.authorName || follow.authorId;
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
export default function FollowCard({ follow, onUnfollow }) {
  const { t } = useTranslation('follow');
  const navigate = useNavigate();
  const [deleting, setDeleting] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const type = getFollowType(follow);
  const name = getFollowName(follow);
  const Icon = typeIcons[type] || Hash;
  const colors = typeColors[type] || typeColors.keyword;

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

  const handleCardClick = () => {
    const role = sessionStorage.getItem('userRole') || 'researcher';
    const name = getFollowName(follow);
    if (!name) return;
    // Author → direct profile page (no search)
    if (type === 'author') {
      navigate(`/${role}/author-profile?name=${encodeURIComponent(name)}`);
      return;
    }
    // Journal / Topic / Keyword → search page
    const tab = type === 'journal' ? 'journals' : 'papers';
    navigate(`/${role}/search?q=${encodeURIComponent(name)}&tab=${tab}&auto=1`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={deleting ? { opacity: 0, y: -20, height: 0 } : { opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border p-4 sm:p-5 bg-card border-primary/10 hover:border-primary/20 transition-colors cursor-pointer group"
      onClick={handleCardClick}
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
            <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{name}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(follow.createdAt, t)}
            </p>
          </div>
        </div>

        {/* Right: unfollow */}
        <div className="flex items-center gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>

          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={deleting}
                className="text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                {deleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-primary/10 text-foreground">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">
                  {t('button.unfollow')} "{name}"?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  {t('toast.unfollowSuccess')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-primary/10 text-muted-foreground hover:text-foreground hover:bg-primary/10">
                  {t('button.cancel')}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleUnfollow}
                  className="bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600"
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
