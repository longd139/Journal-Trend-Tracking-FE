import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Search, X, BookOpen, FileText, Star, User, Hash,
  TrendingUp, AlertCircle, Library, Newspaper, Globe,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { paperAPI } from './paper.api';
import { journalAPI } from './journal.api';
import { StatCard } from '../../components/SharedUI';
import { PaperItemCard } from './PaperItemCard';
import { PaperDetailDialog } from './PaperDetailDialog';
import FollowButton from '../follows/FollowButton';

/* ═══════════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════════ */

const Q_COLORS = { Q1: '#34D399', Q2: '#F59E0B', Q3: '#FB923C', Q4: '#EF4444' };

/* ═══════════════════════════════════════════════════════════════════════════
   Journal Header
   ═══════════════════════════════════════════════════════════════════════════ */

function JournalHeader({ journal }) {
  if (!journal) return null;
  const qColor = Q_COLORS[journal.quartile] || '#6B7280';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-[#DEDBC8]/10 bg-[#101010] p-6 space-y-4"
    >
      {/* Journal name */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Library size={18} className="text-[#DEDBC8]/40" />
            <h2 className="text-lg font-bold text-[#E1E0CC] font-display">
              {journal.journalName}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {journal.publisher && (
              <span className="flex items-center gap-1">
                <Globe size={11} />
                {journal.publisher}
              </span>
            )}
            {journal.issn && (
              <span className="flex items-center gap-1">
                <Hash size={11} />
                ISSN {journal.issn}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Follow */}
          <FollowButton
            journalId={journal.journalId}
            journalName={journal.journalName}
          />
          {/* Impact Factor */}
          {journal.impactFactor != null && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <TrendingUp size={12} className="text-amber-400" />
              <span className="text-xs font-bold text-amber-400">IF {journal.impactFactor}</span>
            </div>
          )}
          {/* Quartile */}
          {journal.quartile && (
            <span
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: `${qColor}18`, color: qColor, border: `1px solid ${qColor}30` }}
            >
              {journal.quartile}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Timeline Chart
   ═══════════════════════════════════════════════════════════════════════════ */

function TimelineChart({ timeline }) {
  if (!timeline || timeline.length === 0) return null;

  const sorted = [...timeline].sort((a, b) => a.year - b.year);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-[#DEDBC8]/10 bg-[#101010] p-6 space-y-4"
    >
      <div className="flex items-center gap-2">
        <TrendingUp size={14} className="text-[#DEDBC8]/40" />
        <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500">
          Publication Timeline
        </span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sorted} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="paperGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4F8CFF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#4F8CFF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="citationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00D1B2" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00D1B2" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(222,219,200,0.05)" />
            <XAxis
              dataKey="year"
              tick={{ fill: '#6B7280', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(222,219,200,0.08)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6B7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#1B2235',
                border: '1px solid rgba(222,219,200,0.1)',
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: '#E1E0CC', fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="paperCount"
              stroke="#4F8CFF"
              strokeWidth={2}
              fill="url(#paperGradient)"
              name="Papers"
            />
            <Area
              type="monotone"
              dataKey="citationCount"
              stroke="#00D1B2"
              strokeWidth={2}
              fill="url(#citationGradient)"
              name="Citations"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4F8CFF]" />
          Papers
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00D1B2]" />
          Citations
        </span>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Top Authors
   ═══════════════════════════════════════════════════════════════════════════ */

function TopAuthors({ authors }) {
  if (!authors || authors.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-[#DEDBC8]/10 bg-[#101010] p-6 space-y-4"
    >
      <div className="flex items-center gap-2">
        <User size={14} className="text-[#DEDBC8]/40" />
        <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500">
          Top Authors
        </span>
        <span className="text-[10px] text-gray-500 ml-auto">By total citations</span>
      </div>

      <div className="space-y-2">
        {authors.map((author, i) => (
          <motion.div
            key={author.authorName || i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
            className="flex items-center gap-4 px-4 py-3 rounded-xl bg-[#DEDBC8]/[0.02] border border-[#DEDBC8]/5"
          >
            {/* Rank */}
            <span className="w-5 text-xs font-bold text-gray-500 text-center">#{i + 1}</span>

            {/* Author name */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#E1E0CC] truncate">{author.authorName}</p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="text-xs font-bold text-[#E1E0CC]">{author.paperCount}</p>
                <p className="text-[10px] text-gray-500">Papers</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-[#E1E0CC]">{author.totalCitations?.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500">Citations</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-[#00D1B2]">{author.avgCitationsPerPaper?.toFixed(1)}</p>
                <p className="text-[10px] text-gray-500">Avg</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Top Keywords
   ═══════════════════════════════════════════════════════════════════════════ */

function TopKeywords({ keywords }) {
  if (!keywords || keywords.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Hash size={12} className="text-[#DEDBC8]/30" />
      {keywords.map((kw) => (
        <span
          key={kw}
          className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/20"
        >
          {kw}
        </span>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Loading Skeleton
   ═══════════════════════════════════════════════════════════════════════════ */

function JournalSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Header skeleton */}
      <div className="rounded-2xl border border-[#DEDBC8]/5 bg-[#101010] p-6 space-y-3">
        <div className="h-5 w-64 bg-[#DEDBC8]/8 rounded" />
        <div className="h-3 w-48 bg-[#DEDBC8]/5 rounded" />
      </div>
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl p-5 border border-[#DEDBC8]/5 bg-[#101010] space-y-3">
            <div className="h-3 w-14 bg-[#DEDBC8]/8 rounded" />
            <div className="h-6 w-20 bg-[#DEDBC8]/8 rounded" />
            <div className="h-3 w-10 bg-[#DEDBC8]/5 rounded" />
          </div>
        ))}
      </div>
      {/* Timeline skeleton */}
      <div className="rounded-2xl border border-[#DEDBC8]/5 bg-[#101010] p-6">
        <div className="h-3 w-32 bg-[#DEDBC8]/8 rounded mb-4" />
        <div className="h-48 bg-[#DEDBC8]/3 rounded-lg" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function SearchJournal() {
  const { t } = useTranslation('search');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [journalStats, setJournalStats] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [topPapers, setTopPapers] = useState([]);
  const [topAuthors, setTopAuthors] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);

  // ─── Browse mode (categories) ───
  const [categories, setCategories] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [fieldData, setFieldData] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingField, setLoadingField] = useState(false);
  const [browseError, setBrowseError] = useState(null);

  /* ─── Search journal ─── */
  const handleSearch = (keywordOverride) => {
    const q = (keywordOverride || query).trim();
    if (!q) return;

    let cancelled = false;

    async function fetchAll() {
      setIsLoading(true);
      setError(null);
      setJournalStats(null);
      setTimeline(null);
      setTopPapers([]);
      setTopAuthors([]);

      try {
        const [stats, tl, papers, authors] = await Promise.all([
          paperAPI.getJournalQuickStats(q),
          paperAPI.getJournalTimeline(q),
          paperAPI.getJournalTopPapers(q),
          paperAPI.getJournalTopAuthors(q),
        ]);

        if (!cancelled) {
          if (stats) setJournalStats(stats);
          if (tl) setTimeline(Array.isArray(tl.timeline) ? tl.timeline : Array.isArray(tl) ? tl : []);
          if (papers) setTopPapers(Array.isArray(papers) ? papers : []);
          if (authors) setTopAuthors(Array.isArray(authors) ? authors : []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Journal search error:', err);
          setError(err?.message || 'Failed to load journal data');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  };

  /* ─── Keyboard shortcut ─── */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  /* ─── Browse mode: fetch categories when no query ─── */
  useEffect(() => {
    if (query.trim()) return;

    let cancelled = false;

    async function loadCategories() {
      setLoadingCategories(true);
      setBrowseError(null);
      try {
        const cats = await journalAPI.getCategories();
        if (!cancelled && Array.isArray(cats)) {
          // Sort by journalCount descending
          const sorted = cats.sort((a, b) => (b.journalCount || 0) - (a.journalCount || 0));
          setCategories(sorted);
          // Auto-select first category
          if (cats.length > 0) {
            setSelectedFieldId(cats[0].fieldId);
            setFieldData(cats[0]);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load categories:', err);
          setBrowseError(err?.message || 'Failed to load journal categories');
        }
      } finally {
        if (!cancelled) setLoadingCategories(false);
      }
    }

    loadCategories();
    return () => { cancelled = true; };
  }, [query]);

  /* ─── Browse mode: fetch journals for a specific field ─── */
  const handleFieldClick = async (fieldId) => {
    if (fieldId === selectedFieldId) return;
    setSelectedFieldId(fieldId);
    setLoadingField(true);
    try {
      // Check if we already have full data from categories
      const cat = categories.find((c) => c.fieldId === fieldId);
      if (cat && cat.topJournals && cat.topJournals.length > 0) {
        setFieldData(cat);
      } else {
        const data = await journalAPI.getByField(fieldId);
        setFieldData(data);
      }
    } catch (err) {
      console.error('Failed to load field journals:', err);
      // Keep showing previous field data on error
    } finally {
      setLoadingField(false);
    }
  };

  /* ═══════════════════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════════════════ */

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* ─── Journal Search Bar ─── */}
        <div className="relative">
          <div className="relative">
            <BookOpen size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#DEDBC8]/40 z-10" />
            <input
              type="text"
              placeholder="Search by journal name or ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-14 py-4 rounded-2xl text-sm bg-[#101010] border border-[#DEDBC8]/10 text-[#E1E0CC] placeholder:text-gray-500 focus:outline-none focus:border-[#DEDBC8]/30 focus:ring-1 focus:ring-[#DEDBC8]/10 transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setJournalStats(null); setTimeline(null); setTopPapers([]); setTopAuthors([]); setError(null); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[#DEDBC8]/10 text-[#DEDBC8]/60 hover:bg-[#DEDBC8]/20 hover:text-[#DEDBC8] transition-all"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ─── Browse mode: category tabs + journal cards ─── */}
        {!query.trim() && !isLoading && (
          <div className="space-y-5">
            {/* Loading categories */}
            {loadingCategories && (
              <div className="space-y-4">
                <div className="flex gap-2 overflow-hidden">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-9 w-36 rounded-full bg-[#DEDBC8]/5 animate-pulse shrink-0" />
                  ))}
                </div>
                <JournalSkeleton />
              </div>
            )}

            {/* Browse error */}
            {browseError && !loadingCategories && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/10 text-[11px] text-red-400/70">
                <AlertCircle size={13} className="shrink-0" />
                <span>{browseError}</span>
              </div>
            )}

            {/* Categories loaded */}
            {!loadingCategories && categories.length > 0 && (
              <div className="rounded-2xl border border-[#DEDBC8]/5 bg-[#0A0A0A]/80 p-5 space-y-4">
                {/* ── Category Tabs ── */}
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 flex-wrap"
                >
                  {categories.map((cat) => {
                    const active = cat.fieldId === selectedFieldId;
                    return (
                      <button
                        key={cat.fieldId}
                        type="button"
                        onClick={() => handleFieldClick(cat.fieldId)}
                        disabled={loadingField}
                        className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all border whitespace-nowrap ${
                          active
                            ? 'bg-[#DEDBC8]/15 text-[#DEDBC8] border-[#DEDBC8]/30'
                            : 'text-gray-400 border-[#DEDBC8]/8 hover:bg-[#DEDBC8]/5 hover:text-[#E1E0CC] hover:border-[#DEDBC8]/15'
                        }`}
                      >
                        {cat.fieldName}
                        {cat.journalCount > 0 && (
                          <span className={`ml-1.5 text-[10px] ${active ? 'text-[#DEDBC8]/60' : 'text-gray-600'}`}>
                            {cat.journalCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </motion.div>

                {/* ── Journal Cards Grid ── */}
                {loadingField ? (
                  <JournalSkeleton />
                ) : fieldData && fieldData.topJournals && fieldData.topJournals.length > 0 ? (
                  <motion.div
                    key={selectedFieldId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-3"
                  >
                    {/* Field description */}
                    {fieldData.description && (
                      <p className="text-xs text-gray-500 px-1">
                        {fieldData.description}
                      </p>
                    )}

                    {/* Journal cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {fieldData.topJournals.map((journal, i) => (
                        <motion.div
                          key={journal.journalId || i}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          onClick={() => {
                            setQuery(journal.journalName);
                            handleSearch(journal.journalName);
                          }}
                          className="rounded-2xl border border-[#DEDBC8]/10 bg-[#101010] p-5 space-y-3 hover:border-[#DEDBC8]/20 transition-all cursor-pointer"
                        >
                          {/* Journal name + quartile */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 min-w-0">
                              <h3 className="text-sm font-bold text-[#E1E0CC] font-display truncate">
                                {journal.journalName}
                              </h3>
                              {journal.publisher && (
                                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                  <Globe size={10} />
                                  {journal.publisher}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Follow — stopPropagation so clicking doesn't trigger the card */}
                              <span onClick={(e) => e.stopPropagation()}>
                                <FollowButton
                                  journalId={journal.journalId}
                                  journalName={journal.journalName}
                                />
                              </span>
                              {journal.impactFactor != null && (
                                <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  IF {journal.impactFactor}
                                </span>
                              )}
                              {journal.quartile && (
                                <span
                                  className="px-2 py-1 rounded-md text-[10px] font-bold"
                                  style={{
                                    background: `${Q_COLORS[journal.quartile] || '#6B7280'}18`,
                                    color: Q_COLORS[journal.quartile] || '#6B7280',
                                    border: `1px solid ${Q_COLORS[journal.quartile] || '#6B7280'}30`,
                                  }}
                                >
                                  {journal.quartile}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* ISSN */}
                          {journal.issn && (
                            <div className="flex items-center gap-1 text-[10px] text-gray-600">
                              <Hash size={10} />
                              ISSN {journal.issn}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : !loadingField ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="p-3 rounded-2xl bg-[#DEDBC8]/5 border border-[#DEDBC8]/10 mb-3">
                      <Newspaper size={24} className="text-[#DEDBC8]/20" />
                    </div>
                    <p className="text-xs text-gray-500">
                      No journals found in this category yet.
                    </p>
                  </motion.div>
                ) : null}
              </div>
            )}

            {/* Categories empty (no error, no data, not loading) */}
            {!loadingCategories && !browseError && categories.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="p-4 rounded-2xl bg-[#DEDBC8]/5 border border-[#DEDBC8]/10 mb-4">
                  <Newspaper size={32} className="text-[#DEDBC8]/30" />
                </div>
                <p className="text-sm text-gray-500 max-w-sm">
                  Enter a journal name to explore its statistics, top papers, authors, and publication timeline.
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* ─── Loading ─── */}
        {isLoading && <JournalSkeleton />}

        {/* ─── Error ─── */}
        {error && !isLoading && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[11px] text-amber-400/70">
            <AlertCircle size={13} className="shrink-0" />
            <span>Unable to load journal data. Please check the journal name and try again.</span>
          </div>
        )}

        {/* ─── Results ─── */}
        {!isLoading && journalStats && (
          <div className="space-y-5">
            {/* Journal Header */}
            <JournalHeader journal={journalStats} />

            {/* Top Keywords */}
            {journalStats.topKeywords?.length > 0 && (
              <TopKeywords keywords={journalStats.topKeywords} />
            )}

            {/* Stat Cards */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-2 lg:grid-cols-3 gap-3"
            >
              <StatCard
                label="Total Papers"
                value={(journalStats.totalPapers ?? 0).toLocaleString()}
                change=""
                Icon={FileText}
                accent="#4F8CFF"
              />
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
            </motion.div>

            {/* Timeline Chart */}
            {timeline && timeline.length > 0 && <TimelineChart timeline={timeline} />}

            {/* Top Papers */}
            {topPapers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-[#DEDBC8]/40" />
                  <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500">
                    Top Cited Papers
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {topPapers.map((paper, i) => (
                    <motion.div
                      key={paper.paperId || i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <PaperItemCard
                        paper={paper}
                        index={i}
                        badgeColor="#F59E0B"
                        onClick={(p) => setSelectedPaper(p)}
                      />
                    </motion.div>
                  ))}
                </div>
                <PaperDetailDialog
                  paper={selectedPaper}
                  open={!!selectedPaper}
                  onOpenChange={(open) => { if (!open) setSelectedPaper(null); }}
                />
              </motion.div>
            )}

            {/* Top Authors */}
            {topAuthors.length > 0 && <TopAuthors authors={topAuthors} />}
          </div>
        )}
      </div>
    </div>
  );
}
