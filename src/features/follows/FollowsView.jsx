import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { followAPI } from './api';
import FollowCard from './FollowCard';
import FollowCardSkeleton from './FollowCardSkeleton';
import { Skeleton } from '../../components/ui/skeleton';

/* ═══════════════════════════════════════════════════════════════════════════
   Tabs
   ═══════════════════════════════════════════════════════════════════════════ */
function FilterTabs({ activeTab, onTabChange, counts, t }) {
  const tabs = [
    { key: 'all', label: t('tabs.all'), countKey: 'all' },
    { key: 'journal', label: t('tabs.journals'), countKey: 'journals' },
    { key: 'topic', label: t('tabs.topics'), countKey: 'topics' },
    { key: 'keyword', label: t('tabs.keywords'), countKey: 'keywords' },
    { key: 'author', label: t('tabs.authors'), countKey: 'authors' },
  ];

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            activeTab === tab.key
              ? 'bg-primary/10 text-primary border-primary/30'
              : 'text-muted-foreground border-transparent hover:bg-muted/40 hover:text-foreground'
          }`}
        >
          {tab.label}
          {counts[tab.countKey] !== undefined && (
            <span
              className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                activeTab === tab.key
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted/20 text-muted-foreground'
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

  // Fetch follows — force fresh data on mount
  const fetchFollows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await followAPI.getMyFollows(true);
      // Backend returns AppResponse<List<FollowResponse>>:
      // { status: 200, message: "...", data: [...] }
      const list = response?.data;
      setFollows(Array.isArray(list) ? list : []);
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

  // Re-fetch when follow/unfollow happens from other pages (e.g. SearchPapers)
  useEffect(() => {
    const handler = () => fetchFollows();
    window.addEventListener('follow-changed', handler);
    return () => window.removeEventListener('follow-changed', handler);
  }, [fetchFollows]);

  // Toggle notification
  const handleToggleNotify = useCallback(
    async (followId, enabled) => {
      const response = await followAPI.toggleNotify(followId, enabled);
      // Backend returns AppResponse<FollowResponse>:
      // { status: 200, message: "...", data: { followId, notifyEnabled, ... } }
      const updatedFollow = response?.data;
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
    const authors = follows.filter((f) => f.authorId);

    const counts = {
      all: follows.length,
      journals: journals.length,
      topics: topics.length,
      keywords: keywords.length,
      authors: authors.length,
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
      case 'author':
        filtered = authors;
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
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center">
          <AlertCircle size={28} className="text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">{error}</h3>
          <p className="text-sm text-muted-foreground">{t('toast.loadError')}</p>
        </div>
        <button
          onClick={fetchFollows}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
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
          <Skeleton className="h-7 w-40 rounded bg-muted/20" />
          <Skeleton className="h-4 w-64 rounded bg-muted/20" />
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-lg bg-muted/20" />
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
        <div className="w-16 h-16 rounded-2xl bg-card border border-primary/10 flex items-center justify-center">
          <BellOff size={28} className="text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            {t('page.empty.title')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('page.empty.description')}
          </p>
        </div>
      </div>
    );
  }

  /* ── Data State ── */
  return (
    <div className="p-8 space-y-6 min-h-screen bg-transparent">
      {/* Header — compact stats, title is in TopBar */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/5 border border-primary/8">
          <Bell size={13} className="text-primary" />
          <span className="text-xs font-bold text-primary">{follows.length}</span>
          <span className="text-[11px] text-muted-foreground">{follows.length === 1 ? 'follow' : 'follows'}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Journals', count: counts.journals, color: '#4F8CFF' },
          { label: 'Topics', count: counts.topics, color: '#F59E0B' },
          { label: 'Keywords', count: counts.keywords, color: '#A78BFA' },
          { label: 'Authors', count: counts.authors, color: '#34D399' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -2 }}
            className="p-3 rounded-xl border bg-card border-primary/10 text-center"
          >
            <div className="text-xl font-bold text-foreground">{stat.count}</div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
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
