import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BellPlus, BellDot, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { followAPI } from './api';
import FollowDialog from './FollowDialog';

/**
 * FollowButton — Nút "Follow" dùng chung
 *
 * Props:
 *  - journalId, topicId, keywordId: string | null
 *  - journalName, topicName, keywordText: string | null
 *  - onFollowed: () => void
 */
export default function FollowButton({
  journalId = null,
  topicId = null,
  keywordId = null,
  journalName = null,
  topicName = null,
  keywordText = null,
  onFollowed,
}) {
  const { t } = useTranslation('follow');
  const [status, setStatus] = React.useState('default'); // default | loading | followed
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Build the list of available follow targets
  const options = React.useMemo(() => {
    const list = [];
    if (journalId) {
      list.push({ type: 'journal', id: journalId, name: journalName || journalId });
    }
    if (topicId) {
      list.push({ type: 'topic', id: topicId, name: topicName || topicId });
    }
    if (keywordId) {
      list.push({ type: 'keyword', id: keywordId, name: keywordText || keywordId });
    }
    return list;
  }, [journalId, topicId, keywordId, journalName, topicName, keywordText]);

  // Hide button if no targets available
  if (options.length === 0) return null;

  // On mount, check if user is already following this target
  React.useEffect(() => {
    let cancelled = false;

    const checkExisting = async () => {
      try {
        const response = await followAPI.getMyFollows();
        const follows = response?.data ?? response ?? [];
        const list = Array.isArray(follows) ? follows : follows?.data ?? [];

        const isFollowing = list.some((f) => {
          if (journalId && f.journalId === journalId) return true;
          if (topicId && f.topicId === topicId) return true;
          if (keywordId && f.keywordId === keywordId) return true;
          return false;
        });

        if (!cancelled && isFollowing) setStatus('followed');
      } catch {
        // Silently fail — keep default state
      }
    };

    checkExisting();
    return () => { cancelled = true; };
  }, [journalId, topicId, keywordId]);

  const doFollow = async (target, notifyEnabled = true) => {
    setStatus('loading');
    setDialogOpen(false);

    const body = {
      journalId: target.type === 'journal' ? target.id : null,
      topicId: target.type === 'topic' ? target.id : null,
      keywordId: target.type === 'keyword' ? target.id : null,
      notifyEnabled,
    };

    try {
      await followAPI.addFollow(body);
      setStatus('followed');
      toast.success(t('toast.followSuccess'));
      onFollowed?.();
    } catch (error) {
      const httpStatus = error?.response?.status;
      const errorCode = error?.apiStatus || error?.response?.data?.code;

      if (httpStatus === 409 || errorCode === 'FOLLOW_ALREADY_EXISTS') {
        // Already following — show followed state
        setStatus('followed');
        toast.error(t('toast.alreadyExists'));
      } else if (httpStatus === 403 || errorCode === 'FOLLOW_LIMIT_EXCEEDED') {
        setStatus('default');
        toast.error(t('toast.limitExceeded'), {
          description: t('toast.limitExceeded'),
          action: {
            label: t('button.follow'),
            onClick: () => {
              const role = sessionStorage.getItem('userRole') || 'academic';
              window.location.href = `/${role}/settings`;
            },
          },
        });
      } else {
        setStatus('default');
        const msg = error?.response?.data?.message || error?.message || t('toast.genericError');
        toast.error(msg);
      }
    }
  };

  const handleClick = () => {
    if (status === 'followed') return; // already followed, do nothing
    if (options.length === 1) {
      // Only one target — follow directly
      doFollow(options[0], true);
    } else {
      // Multiple targets — show dialog to choose
      setDialogOpen(true);
    }
  };

  const handleDialogSelect = (option) => {
    doFollow(option, option.notifyEnabled);
  };

  return (
    <>
      <Button
        variant={status === 'followed' ? 'ghost' : 'outline'}
        size="sm"
        onClick={handleClick}
        disabled={status === 'loading'}
        className={
          status === 'followed'
            ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
            : 'border-[#DEDBC8]/10 text-gray-400 hover:text-[#E1E0CC] hover:bg-[#DEDBC8]/10'
        }
      >
        {status === 'loading' ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            {t('button.following')}
          </>
        ) : status === 'followed' ? (
          <>
            <BellDot size={14} />
            {t('button.following')}
          </>
        ) : (
          <>
            <BellPlus size={14} />
            {t('button.follow')}
          </>
        )}
      </Button>

      <FollowDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        options={options}
        onSelect={handleDialogSelect}
      />
    </>
  );
}
