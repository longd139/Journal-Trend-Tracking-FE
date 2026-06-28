import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { BellOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { followAPI } from '../lib/api/follow.api';
import FollowCard from '../components/follow/FollowCard';
import FollowCardSkeleton from '../components/follow/FollowCardSkeleton';
import { Skeleton } from '../components/ui/skeleton';

/* ═══════════════════════════════════════════════════════════════════════════
   Tabs
   ═══════════════════════════════════════════════════════════════════════════ */
function FilterTabs({ activeTab, onTabChange, counts, t }) {
  const tabs = [
    { key: 'all', label: t('tabs.all'), countKey: 'all' },
    { key: 'journal', label: t('tabs.journals'), countKey: 'journals' },
    { key: 'topic', label: t('tabs.topics'), countKey: 'topics' },
    { key: 'keyword', label: t('tabs.keywords'), countKey: 'keywords' },
  ];

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            activeTab === tab.key
              ? 'bg-[#DEDBC8]/10 text-[#DEDBC8] border-[#DEDBC8]/30'
              : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-[#E1E0CC]'
          }`}
        >
          {tab.label}
          {counts[tab.countKey] !== undefined && (
            <span
              className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                activeTab === tab.key
                  ? 'bg-[#DEDBC8]/20 text-[#DEDBC8]'
                  : 'bg-white/5 text-gray-500'
              }`}
            >
              {counts[tab.countKey]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FollowsView
   ═══════════════════════════════════════════════════════════════════════════ */
export default function FollowsView() {
  const { t } = useTranslation('follow');
  const [follows, setFollows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch follows
  const fetchFollows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await followAPI.getMyFollows();
      // Handle different response shapes: { data: [...] } or { data: { data: [...] } } or direct array
      let items = response?.data;
      if (items && Array.isArray(items.data)) {
        // nested AppResponse -> PaginatedResponse
        items = items.data;
      }
      if (Array.isArray(items)) {
        setFollows(items);
      } else if (Array.isArray(response)) {
        setFollows(response);
      } else {
        setFollows([]);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t('toast.loadError'));
      toast.error(t('toast.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchFollows();
  }, [fetchFollows]);

  // Toggle notification
  const handleToggleNotify = useCallback(
    async (followId, enabled) => {
      const response = await followAPI.toggleNotify(followId, enabled);
      // Optimistic: update local state with the response data or the original toggle
      const updatedFollow =
        response?.data?.data ||
        response?.data ||
        response;
      if (updatedFollow && updatedFollow.followId) {
        setFollows((prev) =>
          prev.map((f) =>
            f.followId === followId
              ? { ...f, notifyEnabled: updatedFollow.notifyEnabled ?? enabled }
              : f,
          ),
        );
      }
    },
    [],
  );

  // Unfollow
  const handleUnfollow = useCallback(async (followId) => {
    await followAPI.unfollow(followId);
    setFollows((prev) => prev.filter((f) => f.followId !== followId));
  }, []);

  // Compute filtered follows and counts
  const { filtered, counts } = useMemo(() => {
    const journals = follows.filter((f) => f.journalId);
    const topics = follows.filter((f) => f.topicId);
    const keywords = follows.filter((f) => f.keywordId);

    const counts = {
      all: follows.length,
      journals: journals.length,
      topics: topics.length,
      keywords: keywords.length,
    };

    let filtered;
    switch (activeTab) {
      case 'journal':
        filtered = journals;
        break;
      case 'topic':
        filtered = topics;
        break;
      case 'keyword':
        filtered = keywords;
        break;
      default:
        filtered = follows;
    }

    return { filtered, counts };
  }, [follows, activeTab]);

  /* ── Error State ── */
  if (error && !loading && follows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center space-y-4 bg-transparent p-8">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#E1E0CC] mb-1">{error}</h3>
          <p className="text-sm text-gray-400">{t('toast.loadError')}</p>
        </div>
        <button
          onClick={fetchFollows}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#DEDBC8]/10 text-[#DEDBC8] border border-[#DEDBC8]/20 hover:bg-[#DEDBC8]/20 transition-all"
        >
          {t('button.retry')}
        </button>
      </div>
    );
  }

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="p-4 sm:p-8 space-y-6 min-h-screen bg-transparent">
        <div className="space-y-1">
          <Skeleton className="h-7 w-40 rounded bg-white/5" />
          <Skeleton className="h-4 w-64 rounded bg-white/5" />
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-lg bg-white/5" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <FollowCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  /* ── Empty State ── */
  if (follows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center space-y-4 bg-transparent p-8">
        <div className="w-16 h-16 rounded-2xl bg-[#101010] border border-[#DEDBC8]/10 flex items-center justify-center">
          <BellOff size={28} className="text-gray-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#E1E0CC] mb-1">
            {t('page.empty.title')}
          </h3>
          <p className="text-sm text-gray-400">
            {t('page.empty.description')}
          </p>
        </div>
      </div>
    );
  }

  /* ── Data State ── */
  return (
    <div className="p-8 space-y-6 min-h-screen bg-transparent">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[#E1E0CC]">{t('page.title')}</h2>
        <p className="text-sm text-gray-400">
          {follows.length} {follows.length === 1 ? 'follow' : 'follows'}
        </p>
      </div>

      {/* Filter Tabs */}
      <FilterTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
        t={t}
      />

      {/* List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((follow, i) => (
            <FollowCard
              key={follow.followId || i}
              follow={follow}
              onToggleNotify={handleToggleNotify}
              onUnfollow={handleUnfollow}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
