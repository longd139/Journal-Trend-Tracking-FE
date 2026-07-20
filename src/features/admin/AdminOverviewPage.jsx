import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Users, Server, Database,
  AlertTriangle, Zap, Clock, Globe, TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area,
  CartesianGrid, XAxis, YAxis, Tooltip,
} from 'recharts';
import { adminAPI } from './api.js';
import { Skeleton } from '../../components/ui/skeleton';

/* ═══════════════════════════════════════════════════════════════════════════
   Data — fetched from GET /api/v1/admin/overview
   ═══════════════════════════════════════════════════════════════════════════ */

const NO_DATA = '—';

/* ═══════════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Trim leading & trailing empty data points from a time-series array.
 * "Empty" means both `requests` and `errors` are 0 or null.
 * Keeps the chart focused on the period where the server was actually active.
 */
function trimEmptyEdges(points) {
  if (!points?.length) return points;
  let start = 0;
  let end = points.length - 1;
  while (start <= end && !points[start].requests && !points[start].errors) start++;
  while (end >= start && !points[end].requests && !points[end].errors) end--;
  return points.slice(start, end + 1);
}

/* ═══════════════════════════════════════════════════════════════════════════
   Components
   ═══════════════════════════════════════════════════════════════════════════ */

function StatCard({ label, value, loading, Icon, accent, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="group p-4 rounded-2xl border flex flex-col gap-2.5 bg-card border-border hover:border-primary/15 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="p-2.5 rounded-xl" style={{ background: `${accent}18`, color: accent }}>
          <Icon size={18} />
        </div>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="h-6 w-20 mt-1 bg-primary/10" />
        ) : (
          <p className="text-xl font-bold text-foreground font-mono tabular-nums">{value}</p>
        )}
      </div>
    </motion.div>
  );
}

function BannerPill({ icon, value, loading, label, accent = 'text-foreground', borderClass = 'bg-primary/5 border-primary/8' }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${borderClass}`}>
      {icon}
      <div>
        {loading ? (
          <Skeleton className="h-4 w-14 bg-primary/10" />
        ) : (
          <div className={`text-sm font-bold font-mono tabular-nums ${accent}`}>{value}</div>
        )}
        <div className="text-[9px] text-muted-foreground uppercase">{label}</div>
      </div>
    </div>
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Chart data states
  const [requestVolume, setRequestVolume] = useState(null);
  const [resourceUsage, setResourceUsage] = useState(null);
  const [visitorTraffic, setVisitorTraffic] = useState(null);
  const [recentEvents, setRecentEvents] = useState(null);

  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchOverview() {
      try {
        const res = await adminAPI.getOverview();
        if (!cancelled && res?.data) {
          setStats(res.data);
          setError(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('Failed to fetch admin overview:', err);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchOverview();
    // Refresh every 60 seconds
    const interval = setInterval(fetchOverview, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // Fetch chart data independently
  useEffect(() => {
    let cancelled = false;
    async function fetchCharts() {
      try {
        const [volRes, resRes, visRes, evtRes] = await Promise.allSettled([
          adminAPI.getRequestVolumeChart(),
          adminAPI.getResourceUsageChart(),
          adminAPI.getVisitorTrafficChart(),
          adminAPI.getRecentEvents(),
        ]);
        if (!cancelled) {
          if (volRes.status === 'fulfilled' && volRes.value?.data) setRequestVolume(volRes.value.data);
          if (resRes.status === 'fulfilled' && resRes.value?.data) setResourceUsage(resRes.value.data);
          if (visRes.status === 'fulfilled' && visRes.value?.data) setVisitorTraffic(visRes.value.data);
          if (evtRes.status === 'fulfilled' && evtRes.value?.data) setRecentEvents(evtRes.value.data);
        }
      } catch (err) {
        console.warn('Failed to fetch chart data:', err);
      }
    }
    fetchCharts();
    const chartInterval = setInterval(fetchCharts, 60000);
    return () => { cancelled = true; clearInterval(chartInterval); };
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    Promise.allSettled([
      adminAPI.getOverview(),
      adminAPI.getRequestVolumeChart(),
      adminAPI.getResourceUsageChart(),
      adminAPI.getVisitorTrafficChart(),
      adminAPI.getRecentEvents(),
    ]).then(([overRes, volRes, resRes, visRes, evtRes]) => {
      if (overRes.status === 'fulfilled' && overRes.value?.data) setStats(overRes.value.data);
      if (volRes.status === 'fulfilled' && volRes.value?.data) setRequestVolume(volRes.value.data);
      if (resRes.status === 'fulfilled' && resRes.value?.data) setResourceUsage(resRes.value.data);
      if (visRes.status === 'fulfilled' && visRes.value?.data) setVisitorTraffic(visRes.value.data);
      if (evtRes.status === 'fulfilled' && evtRes.value?.data) setRecentEvents(evtRes.value.data);
    }).catch((err) => {
      console.warn('Retry failed:', err);
      setError(true);
    }).finally(() => setLoading(false));
  };

  const fmt = (val) => (val != null ? val.toLocaleString() : NO_DATA);

  // Trim empty edges so the chart only shows the server's active window
  const chartData = trimEmptyEdges(requestVolume?.points);

  const activeUsers    = stats?.activeUsers != null ? fmt(stats.activeUsers) : NO_DATA;
  const totalRequests  = stats?.totalRequests != null ? fmt(stats.totalRequests) : NO_DATA;
  const avgLatencyMs   = stats?.avgLatencyMs != null ? `${stats.avgLatencyMs} ms` : NO_DATA;
  const errorRate      = stats?.errorRate != null ? `${stats.errorRate}%` : NO_DATA;
  const dbSizeMb       = stats?.dbSizeMb != null ? `${fmt(stats.dbSizeMb)} MB` : NO_DATA;
  const uptime         = stats?.uptime || NO_DATA;
  const storage        = stats?.totalStorageMb != null ? `${fmt(stats.totalStorageMb)} MB` : NO_DATA;
  const requestsPerHr  = stats?.requestsLastHour != null ? `${fmt(stats.requestsLastHour)}/h` : NO_DATA;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* ─── Admin Status Banner ─── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-card dark:from-[#101010] via-card dark:via-[#141414] to-card dark:to-[#101010] border-primary/10"
        >
          {/* Subtle top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          {/* Noise overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '128px 128px' }} />

          <div className="px-5 sm:px-7 py-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              {/* Left: Status overview */}
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/15">
                    <PulseDot color="#34D399" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{tc('actions.live')}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {now.toLocaleTimeString()}
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-black text-foreground font-display tracking-tight">
                  {t('overview.console')}
                </h1>
                <p className="text-xs text-muted-foreground max-w-md">
                  {t('overview.description')}
                </p>
              </div>

              {/* Right: Quick stat pills */}
              <div className="flex flex-wrap items-center gap-2">
                <BannerPill
                  icon={<Users size={13} className="text-primary" />}
                  value={activeUsers}
                  loading={loading}
                  label={t('overview.users')}
                />
                <BannerPill
                  icon={(
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                  )}
                  value={uptime}
                  loading={loading}
                  label={t('overview.uptime')}
                  accent="text-emerald-400"
                  borderClass="bg-emerald-500/5 border-emerald-500/10"
                />
                <BannerPill
                  icon={<Clock size={13} className="text-primary" />}
                  value={avgLatencyMs}
                  loading={loading}
                  label={t('overview.latency')}
                />
                <BannerPill
                  icon={<Database size={13} className="text-primary" />}
                  value={storage}
                  loading={loading}
                  label={t('overview.storage')}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Error Banner ─── */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={15} className="text-red-400 shrink-0" />
              <span className="text-xs text-muted-foreground">
                {tc('errors.loadFailed')} — {tc('actions.retry')}?
              </span>
            </div>
            <button
              onClick={handleRetry}
              className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-primary/10 hover:bg-primary/20 text-foreground transition-colors"
            >
              {tc('actions.retry')}
            </button>
          </motion.div>
        )}

        {/* ─── Stat Cards ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard index={0} label={t('overview.stats.activeUsers')} value={activeUsers} loading={loading} Icon={Users} accent="var(--primary)" />
          <StatCard index={1} label={t('overview.stats.totalRequests')} value={totalRequests} loading={loading} Icon={Globe} accent="#A09878" />
          <StatCard index={2} label={t('overview.stats.avgLatency')} value={avgLatencyMs} loading={loading} Icon={Clock} accent="var(--primary)" />
          <StatCard index={3} label={t('overview.stats.errorRate')} value={errorRate} loading={loading} Icon={AlertTriangle} accent="#EF4444" />
          <StatCard index={4} label={t('overview.stats.dbSize')} value={dbSizeMb} loading={loading} Icon={Database} accent="var(--primary)" />
        </div>

        {/* ─── Charts Row 1 ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Request Volume */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="rounded-2xl border p-6 bg-card border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Globe size={14} className="text-primary" /> {t('overview.requestVolume')}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t('overview.requestSubtitle')}</p>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />{t('overview.requests')}</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />{t('overview.errors')}</span>
              </div>
            </div>
            {chartData?.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="requestsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34D399" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="errorsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.3} vertical={false} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={40}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                    tickCount={4}
                    allowDecimals={false}
                    width={45}
                  />
                  <Tooltip
                    contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ color: 'var(--foreground)' }}
                  />
                  <Area type="monotone" dataKey="requests" stroke="#34D399" fill="url(#requestsGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="errors" stroke="#EF4444" fill="url(#errorsGrad)" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[260px] text-muted-foreground text-xs">
                {t('overview.noData') || 'No data available'}
              </div>
            )}
          </motion.div>

          {/* Resource Usage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="rounded-2xl border p-6 bg-card border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Server size={14} className="text-primary" /> {t('overview.resourceUsage')}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t('overview.resourceSubtitle')}</p>
              </div>
            </div>
            {resourceUsage ? (
              <div className="space-y-5 h-[220px] flex flex-col justify-center">
                {/* CPU */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{t('overview.cpu')}</span>
                    <span className="text-foreground font-mono tabular-nums">{resourceUsage.cpuPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-primary/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
                         style={{ width: `${Math.min(resourceUsage.cpuPercent, 100)}%` }} />
                  </div>
                </div>
                {/* Memory */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{t('overview.memory')}</span>
                    <span className="text-foreground font-mono tabular-nums">{resourceUsage.heapUsedMb} / {resourceUsage.heapMaxMb} MB</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-primary/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700"
                         style={{ width: `${resourceUsage.heapMaxMb > 0 ? Math.min((resourceUsage.heapUsedMb / resourceUsage.heapMaxMb) * 100, 100) : 0}%` }} />
                  </div>
                </div>
                {/* Disk */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{t('overview.disk')}</span>
                    <span className="text-foreground font-mono tabular-nums">{resourceUsage.diskUsedGb} / {resourceUsage.diskTotalGb} GB</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-primary/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-700"
                         style={{ width: `${resourceUsage.diskTotalGb > 0 ? Math.min((resourceUsage.diskUsedGb / resourceUsage.diskTotalGb) * 100, 100) : 0}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-muted-foreground text-xs">
                {t('overview.noData') || 'No data available'}
              </div>
            )}
          </motion.div>
        </div>

        {/* ─── Charts Row 2 ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Visitor Traffic */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="lg:col-span-3 rounded-2xl border p-6 bg-card border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <TrendingUp size={14} className="text-primary" /> {t('overview.visitorTraffic')}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t('overview.trafficSubtitle')}</p>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" />Today</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-500" />Yesterday</span>
              </div>
            </div>
            {visitorTraffic?.points?.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={visitorTraffic.points} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="todayGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="yesterdayGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.3} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} interval={3} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ color: 'var(--foreground)' }}
                  />
                  <Area type="monotone" dataKey="todayVisitors" stroke="#60A5FA" fill="url(#todayGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="yesterdayVisitors" stroke="#9CA3AF" fill="url(#yesterdayGrad)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground text-xs">
                {t('overview.noData') || 'No data available'}
              </div>
            )}
          </motion.div>

          {/* Recent Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="lg:col-span-2 rounded-2xl border p-6 bg-card border-border"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Zap size={14} className="text-primary" /> {t('overview.recentEvents')}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t('overview.eventsSubtitle')}</p>
              </div>
            </div>
            {recentEvents?.events?.length > 0 ? (
              <div className="space-y-3 h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                {recentEvents.events.map((evt, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl border border-primary/6 hover:border-primary/12 transition-colors">
                    <div className={`p-1.5 rounded-lg mt-0.5 ${evt.type === 'audit' ? 'bg-amber-500/10 text-amber-400' : evt.type === 'sync' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {evt.type === 'audit' ? <AlertTriangle size={12} /> : evt.type === 'sync' ? <Server size={12} /> : <Zap size={12} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{evt.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{evt.description}</p>
                      <p className="text-[9px] text-muted-foreground mt-1">{evt.timestamp ? new Date(evt.timestamp).toLocaleString() : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground text-xs">
                {t('overview.noData') || 'No recent events'}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
