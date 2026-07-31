import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, FileText, Star, TrendingUp, AlertCircle, Lock } from 'lucide-react';
import { paperAPI } from '../search/paper.api';
import { StatCard } from '../../components/SharedUI';
import { JournalHeader, JournalTimelineChart, JournalTopAuthors, JournalTopKeywords } from '../search/JournalDetailComponents';
import { Skeleton } from '../../components/ui/skeleton';
import PaperListSidebar from '../search/PaperListSidebar';
import { UpgradeRequestDialog } from '../user/UpgradeRequestDialog';

const Q_COLORS = { Q1: '#34D399', Q2: '#F59E0B', Q3: '#FB923C', Q4: '#EF4444' };

/**
 * JournalProfilePage — standalone journal detail page (no search bar).
 * Used when clicking a followed journal from My Follows.
 * URL: /:roleName/journal-profile?name=JournalName
 */
export default function JournalProfilePage() {
  const { t } = useTranslation('search');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const journalName = searchParams.get('name') || '';

  const currentRole = sessionStorage.getItem('userRole') || 'researcher';
  const isAcademic = currentRole === 'academic_user' || currentRole === 'academic';

  const [journalStats, setJournalStats] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [topAuthors, setTopAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchesLeft, setSearchesLeft] = useState(null);
  const quotaExhausted = isAcademic && searchesLeft === 0;
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // ── Paper List Sidebar ──
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTotal, setSidebarTotal] = useState(null);

  useEffect(() => {
    if (!journalName) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchAll() {
      setIsLoading(true);
      setError(null);
      try {
        const [stats, tl, authors] = await Promise.all([
          paperAPI.getJournalQuickStats(journalName),
          paperAPI.getJournalTimeline(journalName),
          paperAPI.getJournalTopAuthors(journalName),
        ]);

        if (!cancelled) {
          setJournalStats(stats);
          setTimeline(Array.isArray(tl?.timeline) ? tl.timeline : Array.isArray(tl) ? tl : []);
          setTopAuthors(Array.isArray(authors) ? authors : []);

          // Check quota for academic users
          if (isAcademic) {
            try {
              const usage = await paperAPI.getUsage();
              if (usage?.remainingSearches != null) setSearchesLeft(usage.remainingSearches);
            } catch { /* silently ignore */ }
          }
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err?.response?.data?.message || err?.message || 'Failed to load journal data';
          setError(msg);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [journalName]);

  if (!journalName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-4 bg-transparent p-8">
        <p className="text-sm text-muted-foreground">No journal specified.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ── Back button ── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        {/* ── Loading ── */}
        {isLoading && (
          <div className="space-y-5 animate-pulse">
            <Skeleton className="h-32 w-full rounded-2xl bg-muted/20" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl bg-muted/20" />
              ))}
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertCircle size={28} className="text-red-400" />
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Journal Detail ── */}
        {!isLoading && journalStats && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {/* Journal Header */}
            <JournalHeader journal={journalStats} />

            {/* Top Keywords */}
            {journalStats.topKeywords?.length > 0 && (
              <JournalTopKeywords keywords={journalStats.topKeywords} />
            )}

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div onClick={() => { setSidebarTotal(journalStats.totalPapers ?? null); setSidebarOpen(true); }} className="cursor-pointer">
                <StatCard
                  label="Total Papers"
                  value={(journalStats.totalPapers ?? 0).toLocaleString()}
                  change=""
                  Icon={FileText}
                  accent="#4F8CFF"
                />
              </div>
              <StatCard
                label="Total Citations"
                value={(journalStats.totalCitations ?? 0).toLocaleString()}
                change=""
                Icon={Star}
                accent="#A78BFA"
              />
              <StatCard
                label="Avg Citations/Paper"
                value={journalStats.avgCitationsPerPaper != null ? journalStats.avgCitationsPerPaper.toFixed(2) : '—'}
                change=""
                Icon={TrendingUp}
                accent="#00D1B2"
              />
              <StatCard
                label="Quartile"
                value={journalStats.quartile || 'N/A'}
                change={!journalStats.quartile ? 'Not ranked yet' : ''}
                Icon={Star}
                accent={Q_COLORS[journalStats.quartile] || 'var(--muted-foreground)'}
              />
            </div>

            {/* Publication Timeline */}
            {quotaExhausted ? (
              <div className="relative">
                <div className="blur-[6px] pointer-events-none select-none">
                  <JournalTimelineChart timeline={timeline} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-3 px-4">
                    <Lock size={20} className="text-primary/40 mx-auto" />
                    <p className="text-xs text-muted-foreground max-w-[260px]">
                      Publication timeline & citation trends — available when you have searches remaining.
                    </p>
                    <button
                      onClick={() => setUpgradeOpen(true)}
                      className="px-4 py-2 rounded-lg text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-foreground transition-colors"
                    >
                      Upgrade now
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <JournalTimelineChart timeline={timeline} />
            )}

            {/* Top Authors */}
            {quotaExhausted ? (
              <div className="relative">
                <div className="blur-[6px] pointer-events-none select-none">
                  <JournalTopAuthors authors={topAuthors} isLocked={false} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-3 px-4">
                    <Lock size={20} className="text-primary/40 mx-auto" />
                    <p className="text-xs text-muted-foreground max-w-[260px]">
                      Top contributing authors — available when you have searches remaining.
                    </p>
                    <button
                      onClick={() => setUpgradeOpen(true)}
                      className="px-4 py-2 rounded-lg text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-foreground transition-colors"
                    >
                      Upgrade now
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <JournalTopAuthors authors={topAuthors} isLocked={false} />
            )}
          </motion.div>
        )}
      </div>

      {/* Paper List Sidebar */}
      <PaperListSidebar
        keyword={journalName}
        totalOverride={sidebarTotal}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Upgrade Request Dialog */}
      <AnimatePresence>
        <UpgradeRequestDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
      </AnimatePresence>
    </div>
  );
}
