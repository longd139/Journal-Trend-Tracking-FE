import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Users, Server, Database,
  AlertTriangle, Zap, Clock, Globe, HardDrive,
  CheckCircle2, TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area,
  CartesianGrid, XAxis, YAxis, Tooltip,
} from 'recharts';

/* ═══════════════════════════════════════════════════════════════════════════
   Data — zeroed out until BE endpoint is ready
   ═══════════════════════════════════════════════════════════════════════════ */

const NO_DATA = '—';

/* ═══════════════════════════════════════════════════════════════════════════
   Components
   ═══════════════════════════════════════════════════════════════════════════ */

function StatCard({ label, value, change, Icon, accent, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="group p-4 rounded-2xl border flex flex-col gap-2.5 bg-[#101010] border-[#DEDBC8]/5 hover:border-[#DEDBC8]/15 hover:shadow-lg hover:shadow-[#DEDBC8]/5 hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="p-2.5 rounded-xl" style={{ background: `${accent}18`, color: accent }}>
          <Icon size={18} />
        </div>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</p>
        <p className="text-xl font-bold text-[#E1E0CC] font-mono tabular-nums">{value}</p>
      </div>
    </motion.div>
  );
}

function PulseDot({ color = '#34D399' }) {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: color }} />
      <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: color }} />
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Admin Overview Page
   ═══════════════════════════════════════════════════════════════════════════ */

export default function AdminOverview() {
  const { t } = useTranslation('admin');
  const { t: tc } = useTranslation('common');
  const [now, setNow] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(i); }, []);

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* ─── Admin Status Banner ─── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-[#101010] via-[#141414] to-[#101010] border-[#DEDBC8]/10"
        >
          {/* Subtle top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#DEDBC8]/60 to-transparent" />
          {/* Noise overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '128px 128px' }} />

          <div className="px-5 sm:px-7 py-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              {/* Left: Status overview */}
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#DEDBC8]/10 border border-[#DEDBC8]/15">
                    <PulseDot color="#34D399" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#DEDBC8]">{tc('actions.live')}</span>
                  </div>
                  <span className="text-[11px] text-gray-500">
                    {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {now.toLocaleTimeString()}
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-black text-[#E1E0CC] font-display tracking-tight">
                  {t('overview.console')}
                </h1>
                <p className="text-xs text-gray-500 max-w-md">
                  {t('overview.description')}
                </p>
              </div>

              {/* Right: Quick stat pills */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#DEDBC8]/5 border border-[#DEDBC8]/8">
                  <Users size={13} className="text-[#DEDBC8]" />
                  <div>
                    <div className="text-sm font-bold text-[#E1E0CC] font-mono tabular-nums">{NO_DATA}</div>
                    <div className="text-[9px] text-gray-500 uppercase">{t('overview.users')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-emerald-400 font-mono tabular-nums">{NO_DATA}</div>
                    <div className="text-[9px] text-gray-500 uppercase">{t('overview.uptime')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#DEDBC8]/5 border border-[#DEDBC8]/8">
                  <Clock size={13} className="text-[#DEDBC8]" />
                  <div>
                    <div className="text-sm font-bold text-[#E1E0CC] font-mono tabular-nums">{NO_DATA}</div>
                    <div className="text-[9px] text-gray-500 uppercase">{t('overview.latency')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#DEDBC8]/5 border border-[#DEDBC8]/8">
                  <Database size={13} className="text-[#DEDBC8]" />
                  <div>
                    <div className="text-sm font-bold text-[#E1E0CC] font-mono tabular-nums">{NO_DATA}</div>
                    <div className="text-[9px] text-gray-500 uppercase">{t('overview.storage')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Stat Cards ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard index={0} label={t('overview.stats.activeUsers')} value={NO_DATA} Icon={Users} accent="#DEDBC8" />
          <StatCard index={1} label={t('overview.stats.totalRequests')} value={NO_DATA} Icon={Globe} accent="#A09878" />
          <StatCard index={2} label={t('overview.stats.avgLatency')} value={NO_DATA} Icon={Clock} accent="#DEDBC8" />
          <StatCard index={3} label={t('overview.stats.errorRate')} value={NO_DATA} Icon={AlertTriangle} accent="#EF4444" />
          <StatCard index={4} label={t('overview.stats.dbSize')} value={NO_DATA} Icon={Database} accent="#DEDBC8" />
        </div>

        {/* ─── Charts Row 1 ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Request Volume */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="rounded-2xl border p-6 bg-[#101010] border-[#DEDBC8]/5"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-[#E1E0CC] flex items-center gap-2">
                  <Globe size={14} className="text-[#DEDBC8]" /> {t('overview.requestVolume')}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{t('overview.requestSubtitle')}</p>
              </div>
            </div>
            <div className="flex items-center justify-center h-[220px] text-gray-600 text-xs">
              {t('overview.noData') || 'No data available'}
            </div>
          </motion.div>

          {/* Resource Usage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="rounded-2xl border p-6 bg-[#101010] border-[#DEDBC8]/5"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-[#E1E0CC] flex items-center gap-2">
                  <Server size={14} className="text-[#DEDBC8]" /> {t('overview.resourceUsage')}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{t('overview.resourceSubtitle')}</p>
              </div>
            </div>
            <div className="flex items-center justify-center h-[220px] text-gray-600 text-xs">
              {t('overview.noData') || 'No data available'}
            </div>
          </motion.div>
        </div>

        {/* ─── Charts Row 2 ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Visitor Traffic */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="lg:col-span-3 rounded-2xl border p-6 bg-[#101010] border-[#DEDBC8]/5"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-[#E1E0CC] flex items-center gap-2">
                  <TrendingUp size={14} className="text-[#DEDBC8]" /> {t('overview.visitorTraffic')}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{t('overview.trafficSubtitle')}</p>
              </div>
            </div>
            <div className="flex items-center justify-center h-[200px] text-gray-600 text-xs">
              {t('overview.noData') || 'No data available'}
            </div>
          </motion.div>

          {/* Recent Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="lg:col-span-2 rounded-2xl border p-6 bg-[#101010] border-[#DEDBC8]/5"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-[#E1E0CC] flex items-center gap-2">
                  <Zap size={14} className="text-[#DEDBC8]" /> {t('overview.recentEvents')}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{t('overview.eventsSubtitle')}</p>
              </div>
            </div>
            <div className="flex items-center justify-center h-[200px] text-gray-600 text-xs">
              {t('overview.noData') || 'No recent events'}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
