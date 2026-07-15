import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Star,
  TrendingUp,
  GraduationCap,
  Building2,
  Hash,
  BarChart3,
  AlertCircle,
  User,
  ExternalLink,
  IdCard,
} from 'lucide-react';
import { StatCard } from '../../components/SharedUI';
import { authorAPI } from './author.api';
import FollowButton from '../follows/FollowButton';

/* ═══════════════════════════════════════════════════════════════════════════
   Loading Skeleton
   ═══════════════════════════════════════════════════════════════════════════ */

function StatsSkeleton() {
  return (
    <div className="space-y-5">
      {/* Author identity skeleton */}
      <div className="flex items-center gap-4 p-5 rounded-xl border border-[#DEDBC8]/5 bg-[#101010] animate-pulse">
        <div className="w-14 h-14 rounded-full bg-[#DEDBC8]/8" />
        <div className="space-y-2 flex-1">
          <div className="h-5 w-48 bg-[#DEDBC8]/8 rounded" />
          <div className="h-3 w-64 bg-[#DEDBC8]/5 rounded" />
        </div>
      </div>
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-4 border border-[#DEDBC8]/5 bg-[#101010] animate-pulse space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 bg-[#DEDBC8]/8 rounded" />
              <div className="h-8 w-8 bg-[#DEDBC8]/5 rounded-lg" />
            </div>
            <div className="h-6 w-20 bg-[#DEDBC8]/8 rounded" />
            <div className="h-3 w-12 bg-[#DEDBC8]/5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function AuthorQuickStats({ keyword }) {
  const navigate = useNavigate();
  const role = sessionStorage.getItem('userRole') || 'academic';
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!keyword || !keyword.trim()) {
      setStats(null);
      setError(null);
      return;
    }

    let cancelled = false;

    async function fetchStats() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await authorAPI.quickStats(keyword.trim());
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) {
          console.error('Author quick stats fetch error:', err);
          setError(err?.message || 'Failed to load author statistics');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    const timer = setTimeout(fetchStats, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [keyword]);

  /* ─── Nothing to show ─── */
  if (!keyword || !keyword.trim()) return null;

  /* ─── Loading ─── */
  if (isLoading) return <StatsSkeleton />;

  /* ─── Error ─── */
  if (error) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[11px] text-amber-400/70">
        <AlertCircle size={13} className="shrink-0" />
        <span>Author stats unavailable. {error}</span>
      </div>
    );
  }

  /* ─── Empty / no data ─── */
  if (!stats) return null;

  /* ─── Helpers ─── */
  const orcidUrl = stats.orcid
    ? stats.orcid.startsWith('http')
      ? stats.orcid
      : `https://orcid.org/${stats.orcid}`
    : null;

  /* ─── Render ─── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5"
    >
      {/* Section label */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-[#DEDBC8]/20" />
        <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500">
          Author Profile
        </span>
      </div>

      {/* ─── Author Profile Card ─── */}
      <div className="rounded-2xl border border-[#DEDBC8]/10 bg-[#101010] overflow-hidden">
        {/* Top accent line */}
        <div className="h-0.5 bg-[#DEDBC8]/30" />

        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#DEDBC8]/[0.08] border border-[#DEDBC8]/10 text-[#DEDBC8] shrink-0">
              <User size={24} />
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-[#E1E0CC] truncate font-display">
                {stats.fullName || keyword}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1.5">
                {stats.academicTitle && (
                  <span className="text-[12px] text-gray-400 flex items-center gap-1.5">
                    <GraduationCap size={12} className="text-[#DEDBC8]/50" />
                    {stats.academicTitle}
                  </span>
                )}
                {stats.currentAffiliation && (
                  <span className="text-[12px] text-gray-400 flex items-center gap-1.5">
                    <Building2 size={12} className="text-[#DEDBC8]/50" />
                    {stats.currentAffiliation}
                  </span>
                )}
              </div>

              {/* External links */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {orcidUrl && (
                  <a
                    href={orcidUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium
                               bg-[#A6CE39]/10 text-[#A6CE39] border border-[#A6CE39]/20
                               hover:bg-[#A6CE39]/15 hover:border-[#A6CE39]/30 transition-all"
                  >
                    <IdCard size={12} />
                    ORCID Profile
                    <ExternalLink size={10} />
                  </a>
                )}
                {stats.openAlexId && (
                  <a
                    href={stats.openAlexId}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium
                               bg-[#DEDBC8]/10 text-[#DEDBC8] border border-[#DEDBC8]/20
                               hover:bg-[#DEDBC8]/15 hover:border-[#DEDBC8]/30 transition-all"
                  >
                    <ExternalLink size={12} />
                    View on OpenAlex
                  </a>
                )}
                {stats.authorId && (
                  <FollowButton
                    authorId={stats.authorId}
                    authorName={stats.fullName}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Stat cards grid ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Papers */}
        <StatCard
          label="Total Papers"
          value={(stats.totalPapers ?? 0).toLocaleString()}
          change=""
          Icon={FileText}
          accent="#DEDBC8"
        />

        {/* Total Citations */}
        <StatCard
          label="Total Citations"
          value={(stats.totalCitations ?? 0).toLocaleString()}
          change=""
          Icon={Star}
          accent="#C5BFA0"
        />

        {/* h-Index */}
        <StatCard
          label="h-Index"
          value={((stats.hIndex ?? stats.hindex) != null) ? (stats.hIndex ?? stats.hindex).toLocaleString() : '—'}
          change=""
          Icon={Hash}
          accent="#A09878"
        />

        {/* i10-Index */}
        <StatCard
          label="i10-Index"
          value={stats.i10Index != null ? stats.i10Index.toLocaleString() : '—'}
          change=""
          Icon={BarChart3}
          accent="#8A8468"
        />
      </div>

      {/* Two-year mean citedness */}
      {stats.twoYearMeanCitedness != null && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#DEDBC8]/3 border border-[#DEDBC8]/5 text-[11px] text-gray-400">
          <TrendingUp size={12} className="text-[#DEDBC8]/50" />
          <span>2-Year Mean Citedness:</span>
          <span className="font-semibold text-[#E1E0CC]">{stats.twoYearMeanCitedness.toFixed(1)}</span>
        </div>
      )}
    </motion.div>
  );
}
