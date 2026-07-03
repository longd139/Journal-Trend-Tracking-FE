import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
 Activity, AlertCircle, CheckCircle2,
 Globe, Server, Wifi, WifiOff, RefreshCw,
 TrendingUp, ChevronRight,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// ─── Shared classes ───
const card = 'bg-[#101010] border border-[#DEDBC8]/5 rounded-xl';
const muted = 'text-gray-400';
const subtle = 'text-gray-400 text-gray-500';

function StatusBadge({ status }) {
 const { t } = useTranslation('admin');
 const map = {
 healthy: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
 degraded: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
 down: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
 };
 const icons = { healthy: Wifi, degraded: Activity, down: WifiOff };
 const Icon = icons[status] || Wifi;
 const labels = { healthy: t('apiMonitoring.healthy'), degraded: t('apiMonitoring.degraded'), down: t('apiMonitoring.down') };
 return (
 <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1 ${map[status] || map.healthy}`}>
  <Icon size={10} /> {labels[status] || t('apiMonitoring.healthy')}
 </span>
 );
}

function LatencySpark({ data, color }) {
 return (
 <ResponsiveContainer width={80} height={30}>
  <AreaChart data={data}><defs><linearGradient id={`g-${color}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.3} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
  <Area type="monotone" dataKey="v" stroke={color} fill={`url(#g-${color})`} strokeWidth={1.5} dot={false} /></AreaChart>
 </ResponsiveContainer>
 );
}

function EndpointCard({ endpoint }) {
 const { t } = useTranslation('admin');
 const [expanded, setExpanded] = useState(false);

 return (
 <div className={`${card} overflow-hidden`}>
  <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.01] group"
  onClick={() => setExpanded(!expanded)}>
  <div className="flex items-center gap-3">
   <StatusBadge status={endpoint.status} />
   <div>
   <h4 className="text-sm font-bold text-[#E1E0CC]">{endpoint.name}</h4>
   <p className={`text-[10px] ${subtle} font-mono`}>{endpoint.method} {endpoint.path}</p>
   </div>
  </div>
  <div className="flex items-center gap-4">
   <div className="text-right">
   <div className="text-xs font-bold text-[#E1E0CC] font-mono tabular-nums">{endpoint.latency}</div>
   <div className={`text-[9px] ${muted}`}>{endpoint.uptime}% uptime</div>
   </div>
   <ChevronRight size={14} className={`${subtle} card-icon-glow transition-all duration-200`} style={{ '--icon-accent': endpoint.color }} />
  </div>
  </div>
  <AnimatePresence>
  {expanded && (
   <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
   className="overflow-hidden border-t border-gray-200 border-[#DEDBC8]/5">
   <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
    {[
    { l: t('apiMonitoring.detail.requests24h'), v: endpoint.requests, c: endpoint.color },
    { l: t('apiMonitoring.detail.avgLatency'), v: endpoint.latency, c: '#E1E0CC' },
    { l: t('apiMonitoring.detail.errorRate'), v: endpoint.errorRate, c: '#EF4444' },
    { l: t('apiMonitoring.detail.successRate'), v: `${endpoint.uptime}%`, c: '#A09878' },
    ].map((s) => (
    <div key={s.l} className="rounded-lg p-3 text-center bg-gray-50 dark:bg-white/[0.02]">
     <div className="text-sm font-black font-mono tabular-nums" style={{ color: s.c }}>{s.v}</div>
     <div className="text-[9px] mt-0.5 text-gray-400">{s.l}</div>
    </div>
    ))}
   </div>
  </motion.div>
  )}
  </AnimatePresence>
 </div>
 );
}

const ENDPOINTS = [];

export default function APIMonitoring() {
 const { t } = useTranslation('admin');
 const { t: tc } = useTranslation('common');
 const [lastRefresh, setLastRefresh] = useState(new Date());

 const stats = {
 total: ENDPOINTS.length,
 healthy: ENDPOINTS.filter((e) => e.status === 'healthy').length,
 degraded: ENDPOINTS.filter((e) => e.status === 'degraded').length,
 avgUptime: '0.0',
 totalReq: 0,
 };

 return (
 <div className="p-6 space-y-5">
  {/* Header banner */}
  <motion.div
   initial={{ opacity: 0, y: -8 }}
   animate={{ opacity: 1, y: 0 }}
   className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-[#101010] via-[#141414] to-[#101010] border-[#DEDBC8]/10"
  >
   <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
   <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">
    <div className="flex items-center gap-3">
     <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/15">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">{tc('actions.live')}</span>
     </div>
     <div className="flex items-center gap-1.5">
      <Globe size={14} className="text-[#DEDBC8]" />
      <span className="text-sm font-bold text-[#E1E0CC]">{t('apiMonitoring.title')}</span>
     </div>
     <span className="w-1 h-1 rounded-full bg-[#DEDBC8]/20 hidden sm:block" />
     <span className="text-[11px] text-gray-500 hidden sm:block">{stats.total} {t('apiMonitoring.endpointsMonitored')}</span>
    </div>
    <div className="flex items-center gap-2">
     <span className="text-[10px] text-gray-600">{t('apiMonitoring.lastRefreshed')} {lastRefresh.toLocaleTimeString()}</span>
     <button onClick={() => setLastRefresh(new Date())} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 bg-white/[0.04] text-gray-400 hover:text-[#E1E0CC] hover:bg-white/[0.08] active:scale-[0.97] transition-all duration-150 border border-[#DEDBC8]/8">
      <RefreshCw size={11} /> {tc('actions.refresh')}
     </button>
    </div>
   </div>
  </motion.div>

  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
  {[
   { label: t('apiMonitoring.stats.endpoints'), value: stats.total, icon: Server, color: '#DEDBC8' },
   { label: t('apiMonitoring.stats.healthy'), value: stats.healthy, icon: CheckCircle2, color: '#A09878' },
   { label: t('apiMonitoring.stats.degraded'), value: stats.degraded, icon: AlertCircle, color: '#E1E0CC' },
   { label: t('apiMonitoring.stats.avgUptime'), value: `${stats.avgUptime}%`, icon: TrendingUp, color: '#DEDBC8' },
   { label: t('apiMonitoring.stats.totalRequests'), value: '0', icon: Activity, color: '#E1E0CC' },
  ].map((s) => (
   <motion.div key={s.label} whileHover={{ y: -2 }}
   className={`p-3 ${card} flex items-center gap-3 group`}>
   <div className="p-2 rounded-lg shrink-0 card-icon-glow" style={{ '--icon-accent': s.color, background: `${s.color}18`, color: s.color }}><s.icon size={16} /></div>
   <div><div className="text-[9px] text-gray-500 uppercase tracking-wider">{s.label}</div><div className="text-sm font-black text-[#E1E0CC] font-mono tabular-nums">{s.value}</div></div>
   </motion.div>
  ))}
  </div>

  <div className="space-y-3">
  <h3 className="text-sm font-bold text-[#E1E0CC] flex items-center gap-2"><Globe size={14} className={subtle} /> {t('apiMonitoring.apiEndpoints')}</h3>
  {ENDPOINTS.length === 0 ? (
   <div className={`${card} p-8 text-center`}>
    <p className="text-xs text-gray-500">No endpoints configured</p>
   </div>
  ) : (
   ENDPOINTS.map((ep) => <EndpointCard key={ep.path} endpoint={ep} />)
  )}
  </div>
 </div>
 );
}
