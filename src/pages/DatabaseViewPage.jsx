import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
 Database, FileText, Users, Hash, BookOpen,
 TrendingUp, Network, RefreshCw, Clock,
 Globe, Archive, Brain, Layers, FileCheck,
} from 'lucide-react';
import { adminAPI } from '../lib/api/admin.api';

const card = 'bg-[#101010] border border-[#DEDBC8]/5 rounded-xl';

const SOURCE_ICONS = {
 openalex: Globe,
 'semantic-scholar': Brain,
 arxiv: Archive,
 core: Layers,
};

const StatCard = ({ label, value, icon: Icon, accent, sub }) => (
 <motion.div
 whileHover={{ y: -2 }}
 className={`${card} p-4 flex items-center gap-3 group`}
 >
 <div
  className="p-2 rounded-lg shrink-0 card-icon-accent"
  style={{ '--icon-accent': accent, background: `${accent}18`, color: accent }}
 >
  <Icon size={18} />
 </div>
 <div>
  <div className="text-[9px] uppercase tracking-wider text-gray-400">{label}</div>
  <div className="text-lg font-bold text-[#E1E0CC]">
  {value?.toLocaleString() ?? '—'}
  </div>
  {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
 </div>
 </motion.div>
);

const Section = ({ title, icon: Icon, accent, children }) => (
 <div className={`${card} p-5`}>
 <h3 className="text-sm font-bold text-[#E1E0CC] mb-4 flex items-center gap-2">
  <Icon size={14} style={{ color: accent }} />
  {title}
 </h3>
 {children}
 </div>
);

export default function DatabaseViewPage() {
 const { t } = useTranslation('dashboard');
 const [stats, setStats] = useState(null);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState(null);

 useEffect(() => {
 const fetchStats = async () => {
  setIsLoading(true);
  setError(null);
  try {
  const response = await adminAPI.getSyncStats();
  setStats(response.data || response);
  } catch (err) {
  console.error('Stats error:', err);
  setError(err.response?.data?.message || err.message || 'Failed to load stats');
  } finally {
  setIsLoading(false);
  }
 };
 fetchStats();
 }, []);

 if (isLoading) {
 return (
  <div className="p-6 flex items-center justify-center min-h-[400px]">
  <RefreshCw size={24} className="animate-spin text-emerald-500" />
  </div>
 );
 }

 if (error) {
 return (
  <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-center gap-3">
  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20">
   <Network size={24} className="text-red-500" />
  </div>
  <h3 className="text-sm font-bold text-[#E1E0CC]">Failed to load stats</h3>
  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
  </div>
 );
 }

 if (!stats) return null;

 const { papers, authors, keywords, journals, researchFields, researchTopics, neo4j, syncLogs } = stats;

 return (
 <div className="p-6 space-y-5">
  {/* ── Header ── */}
  <div>
  <h2 className="text-lg font-black text-[#E1E0CC] font-display flex items-center gap-2">
   <Database size={18} className="text-violet-500" />
   {t('headings.database')}
  </h2>
  <p className="text-xs mt-0.5 text-gray-400">
   System-wide statistics and data overview
  </p>
  </div>

  {/* ── Top Stat Cards ── */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
  <StatCard label="Papers" value={papers?.total} icon={FileText} accent="#DEDBC8" />
  <StatCard label="Authors" value={authors?.total} icon={Users} accent="#DEDBC8" />
  <StatCard label="Keywords" value={keywords?.total} icon={Hash} accent="#A09878" />
  <StatCard label="Journals" value={journals?.total} icon={BookOpen} accent="#E1E0CC" />
  </div>

  {/* ── Paper Details + Sources ── */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  {/* Paper breakdown */}
  <Section title="Papers" icon={FileText} accent="#DEDBC8">
   <div className="grid grid-cols-2 gap-3">
   <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.02] text-center">
    <div className="text-xl font-bold text-emerald-500">{papers?.openAccess?.toLocaleString() ?? '—'}</div>
    <div className="text-[9px] uppercase tracking-wider text-gray-400 mt-0.5">Open Access</div>
   </div>
   <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.02] text-center">
    <div className="text-xl font-bold text-[#DEDBC8]">{papers?.hasPdfUrl?.toLocaleString() ?? '—'}</div>
    <div className="text-[9px] uppercase tracking-wider text-gray-400 mt-0.5">Has PDF URL</div>
   </div>
   </div>

   {/* Sources breakdown */}
   {papers?.bySource && Object.keys(papers.bySource).length > 0 && (
   <div className="mt-4 pt-4 border-t border-gray-100 border-[#DEDBC8]/5">
    <h5 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3">
    Papers by Source
    </h5>
    <div className="space-y-2">
    {Object.entries(papers.bySource).map(([source, count]) => {
     const Icon = SOURCE_ICONS[source] || Database;
     return (
     <div key={source} className="flex items-center gap-2.5">
      <Icon size={14} className="text-gray-500 dark:text-slate-400" />
      <span className="text-xs text-gray-700 dark:text-slate-300 capitalize flex-1">{source}</span>
      <span className="text-xs font-bold text-[#E1E0CC]">{count.toLocaleString()}</span>
     </div>
     );
    })}
    </div>
   </div>
   )}

   {/* Year distribution — top 5 */}
   {papers?.byYear && Object.keys(papers.byYear).length > 0 && (
   <div className="mt-4 pt-4 border-t border-gray-100 border-[#DEDBC8]/5">
    <h5 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3">
    Papers by Year
    </h5>
    <div className="grid grid-cols-3 gap-1.5">
    {Object.entries(papers.byYear)
     .sort(([, a], [, b]) => b - a)
     .slice(0, 9)
     .map(([year, count]) => (
     <div
      key={year}
      className="p-2 rounded-lg text-center bg-gray-50 dark:bg-white/[0.02]"
     >
      <div className="text-sm font-bold text-[#E1E0CC]">{year}</div>
      <div className="text-[10px] text-emerald-500">{count.toLocaleString()}</div>
     </div>
     ))}
    </div>
   </div>
   )}
  </Section>

  {/* Right column */}
  <div className="space-y-4">
   {/* Neo4j */}
   <Section title="Knowledge Graph (Neo4j)" icon={Network} accent="#DEDBC8">
   <div className="grid grid-cols-3 gap-3">
    <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.02] text-center">
    <div className="text-xl font-bold text-violet-500">{neo4j?.paperNodes?.toLocaleString() ?? '—'}</div>
    <div className="text-[9px] uppercase tracking-wider text-gray-400 mt-0.5">Paper Nodes</div>
    </div>
    <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.02] text-center">
    <div className="text-xl font-bold text-teal-500">{neo4j?.keywordNodes?.toLocaleString() ?? '—'}</div>
    <div className="text-[9px] uppercase tracking-wider text-gray-400 mt-0.5">Keyword Nodes</div>
    </div>
    <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.02] text-center">
    <div className="text-xl font-bold text-amber-500">{neo4j?.relationships?.toLocaleString() ?? '—'}</div>
    <div className="text-[9px] uppercase tracking-wider text-gray-400 mt-0.5">Relationships</div>
    </div>
   </div>
   </Section>

   {/* Research Fields & Topics */}
   <Section title="Research & Topics" icon={TrendingUp} accent="#A09878">
   <div className="grid grid-cols-2 gap-3 mb-3">
    <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.02] text-center">
    <div className="text-xl font-bold text-emerald-500">{researchFields?.total?.toLocaleString() ?? '—'}</div>
    <div className="text-[9px] uppercase tracking-wider text-gray-400 mt-0.5">Fields</div>
    </div>
    <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.02] text-center">
    <div className="text-xl font-bold text-amber-500">{researchTopics?.total?.toLocaleString() ?? '—'}</div>
    <div className="text-[9px] uppercase tracking-wider text-gray-400 mt-0.5">Topics</div>
    </div>
   </div>
   {researchTopics?.trending > 0 && (
    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/10">
    <TrendingUp size={14} className="text-amber-500" />
    <span className="text-xs text-amber-700 dark:text-amber-400">
     <strong>{researchTopics.trending.toLocaleString()}</strong> trending topics
    </span>
    </div>
   )}
   </Section>

   {/* Orphaned data warnings */}
   {(authors?.orphaned > 0 || keywords?.orphaned > 0) && (
   <Section title="Orphaned Data" icon={FileCheck} accent="#EF4444">
    <div className="space-y-2">
    {authors?.orphaned > 0 && (
     <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/10">
     <span className="text-xs text-red-700 dark:text-red-400">Orphaned Authors</span>
     <span className="text-xs font-bold text-red-600 dark:text-red-400">{authors.orphaned.toLocaleString()}</span>
     </div>
    )}
    {keywords?.orphaned > 0 && (
     <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/10">
     <span className="text-xs text-red-700 dark:text-red-400">Orphaned Keywords</span>
     <span className="text-xs font-bold text-red-600 dark:text-red-400">{keywords.orphaned.toLocaleString()}</span>
     </div>
    )}
    </div>
   </Section>
   )}
  </div>
  </div>

  {/* ── Sync Logs ── */}
  <Section title="Sync Logs" icon={Clock} accent="#E1E0CC">
  <div className="flex items-center gap-4">
   <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.02] text-center flex-1">
   <div className="text-xl font-bold text-amber-500">{syncLogs?.total?.toLocaleString() ?? '—'}</div>
   <div className="text-[9px] uppercase tracking-wider text-gray-400 mt-0.5">Total Syncs</div>
   </div>
   <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.02] text-center flex-1">
   <div className="text-sm font-bold text-[#E1E0CC]">
    {syncLogs?.lastSync
    ? new Date(syncLogs.lastSync).toLocaleString()
    : 'Never'}
   </div>
   <div className="text-[9px] uppercase tracking-wider text-gray-400 mt-0.5 flex items-center justify-center gap-1">
    <Clock size={10} />
    Last Sync
   </div>
   </div>
  </div>
  </Section>
 </div>
 );
}
