import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FileText, TrendingUp, Users, Star, Search } from 'lucide-react';
import Neo4jGraphCard from '../search/Neo4jGraphCard.jsx';
import { graphAPI } from '../search/graph.api.js';
import SearchWithHistory from '../../components/SearchWithHistory';

const StatCard = ({ label, value, change, Icon, accent }) => (
 <motion.div
  whileHover={{ y: -4 }}
  transition={{ duration: 0.2 }}
  className="p-5 rounded-xl border flex flex-col justify-between bg-card border-primary/5 group"
 >
  <div className="flex items-start justify-between mb-2">
  <div
   className="p-2 rounded-lg card-icon-accent"
   style={{
   '--icon-accent': accent,
   background: `${accent}1A`,
   color: accent,
   }}
  >
   <Icon size={18} />
  </div>
  <span className="text-xs font-bold px-2 py-1 rounded-md bg-white/[0.04]" style={{ color: change.startsWith('+') ? '#34D399' : '#EF4444' }}>
   {change}
  </span>
  </div>
  <div>
  <h4 className="text-[11px] font-semibold tracking-wider uppercase mb-1 text-gray-400">{label}</h4>
  <div className="text-2xl font-bold text-foreground">{value}</div>
  </div>
 </motion.div>
 );

export default function AnalyticsView() {
 const { t } = useTranslation('analytics');
 const [searchKeyword, setSearchKeyword] = useState('');
 const [searchInput, setSearchInput] = useState('');
 const [hotKeywords, setHotKeywords] = useState([]);
 const [hotLoading, setHotLoading] = useState(true);
 const [hotError, setHotError] = useState('');

 useEffect(() => {
 let cancelled = false;
 const fetchHot = async () => {
  setHotLoading(true);
  setHotError('');
  try {
  const data = await graphAPI.getHotKeywords(10);
  if (!cancelled) setHotKeywords(data || []);
  } catch (err) {
  if (!cancelled) {
   setHotError(t('hotKeywords.error'));
   console.error('Hot keywords fetch error:', err);
  }
  } finally {
  if (!cancelled) setHotLoading(false);
  }
 };
 fetchHot();
 return () => { cancelled = true; };
 }, [t]);

 const commitSearch = (term) => {
    const trimmed = (term || '').trim();
    if (!trimmed) return;
    setSearchKeyword(trimmed);
  };

  const handleSearch = (e) => {
 e.preventDefault();
 const trimmed = searchInput.trim();
 if (!trimmed) return;
 commitSearch(trimmed);
 };

 return (
 <div className="space-y-6 p-8 min-h-screen bg-transparent">
  {/* Search bar */}
  <form onSubmit={handleSearch} className="flex justify-center">
  <SearchWithHistory
    storageKey="admin-analytics"
    value={searchInput}
    onChange={setSearchInput}
    onSearch={commitSearch}
    placeholder={t('searchPlaceholder')}
    className="w-full pl-11 pr-28 py-3 rounded-xl text-sm outline-none border transition-colors bg-card border-primary/5 text-gray-900 dark:text-[#E2E8F0] focus:border-blue-500 dark:focus:border-primary"
    wrapperClassName="relative w-full max-w-xl"
    icon={<Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-gray-400" />}
  >
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="submit"
      disabled={!searchInput.trim()}
      className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-lg text-xs font-bold text-black transition-opacity disabled:opacity-40 bg-primary"
    >
      {t('searchButton')}
    </motion.button>
  </SearchWithHistory>
  </form>

  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard label={t('cards.trendAnalysis')} value="50.2M" change="+14%" Icon={FileText} accent="#DEDBC8" />
  <StatCard label={t('cards.citationImpact')} value="52.1M" change="+35.7%" Icon={TrendingUp} accent="#DEDBC8" />
  <StatCard label={t('cards.fieldDistribution')} value="284K" change="+8.2%" Icon={Users} accent="#A09878" />
  <StatCard label={t('cards.geographicDistribution')} value="9.4" change="+0.8" Icon={Star} accent="#E1E0CC" />
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
  <Neo4jGraphCard keyword={searchKeyword} />

  <div className="rounded-xl border p-5 bg-card border-primary/5 ">
   <h3 className="text-sm font-bold text-foreground mb-1">{t('cards.hotKeywords')}</h3>
   <p className="text-xs mb-4 text-gray-400">{t('charts.trendingKeywords')}</p>

   {/* Loading */}
   {hotLoading && (
   <div className="space-y-2.5 py-2">
    {[...Array(5)].map((_, i) => (
    <div key={i} className="flex items-center gap-3 animate-pulse">
     <div className="w-5 h-5 rounded-md bg-gray-200 dark:bg-white/10" />
     <div className="flex-1 h-4 rounded bg-gray-200 dark:bg-white/10" />
     <div className="w-12 h-4 rounded bg-gray-200 dark:bg-white/10" />
    </div>
    ))}
   </div>
   )}

   {/* Error */}
   {!hotLoading && hotError && (
   <div className="flex items-center justify-center py-8 text-xs text-red-500 dark:text-red-400">
    {hotError}
   </div>
   )}

   {/* Empty */}
   {!hotLoading && !hotError && hotKeywords.length === 0 && (
   <div className="flex items-center justify-center py-8 text-xs text-gray-400 text-gray-500">
    {t('hotKeywords.empty')}
   </div>
   )}

   {/* Keyword list */}
   {!hotLoading && !hotError && hotKeywords.length > 0 && (
   <ul className="space-y-2">
    {hotKeywords.map((kw, i) => {
    const rank = i + 1;
    const rankColor =
     rank === 1 ? '#E1E0CC' :
     rank === 2 ? '#94A3B8' :
     rank === 3 ? '#D97706' :
     undefined;
    return (
     <li
     key={kw.keywordText || i}
     className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
     >
     <span
      className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0"
      style={{
      background: rankColor ? `${rankColor}20` : 'transparent',
      color: rankColor || '#6B7280',
      // font inherited from body
      }}
     >
      {rank}
     </span>
     <span className="flex-1 text-xs font-medium text-gray-700 dark:text-[#E2E8F0] truncate">
      {kw.keywordText}
     </span>
     <span
      className="text-[10px] font-semibold flex-shrink-0 text-gray-400 text-gray-400"
     >
      {kw.searchCount.toLocaleString()} {t('hotKeywords.searches')}
     </span>
     </li>
    );
    })}
   </ul>
   )}
  </div>
  </div>
 </div>
 );
}
