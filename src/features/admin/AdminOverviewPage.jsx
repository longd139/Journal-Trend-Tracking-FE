import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Users, Server, Database, Cpu,
  AlertTriangle, Zap, Clock, Globe, HardDrive,
  CheckCircle2, ArrowUpRight, TrendingUp, Shield,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip,
} from 'recharts';

/* ═══════════════════════════════════════════════════════════════════════════
   Mock Data
   ═══════════════════════════════════════════════════════════════════════════ */

const REQUEST_SERIES = Array.from({ length: 24 }, (_, i) => ({
  h: `${i}:00`,
  requests: Math.round(800 + Math.sin(i / 4) * 400 + Math.random() * 200),
  errors: Math.round(5 + Math.random() * 15),
}));

const RESOURCE_USAGE = [
  { name: 'CPU', value: 34, color: '#DEDBC8' },
  { name: 'Memory', value: 62, color: '#DEDBC8' },
  { name: 'Disk', value: 87, color: '#E1E0CC' },
  { name: 'Network', value: 28, color: '#A09878' },
];

const VISITORS_TODAY = Array.from({ length: 24 }, (_, i) => ({
  h: `${i}:00`,
  today: Math.round(50 + Math.sin((i - 9) / 4) * 180 + Math.sin(i / 2) * 60 + Math.random() * 40 + (i >= 8 && i <= 20 ? 200 : 0)),
  yesterday: Math.round(40 + Math.sin((i - 10) / 4) * 160 + Math.sin(i / 2.3) * 50 + Math.random() * 35 + (i >= 9 && i <= 19 ? 180 : 0)),
}));

const RECENT_EVENTS = [
  { id: 1, msg: 'API v2.4.1 deployed successfully', time: '12 min ago', icon: CheckCircle2, color: '#34D399' },
  { id: 2, msg: 'Citation Graph API latency spike detected', time: '28 min ago', icon: AlertTriangle, color: '#F59E0B' },
  { id: 3, msg: 'Database backup completed (2.4 TB)', time: '1 hour ago', icon: Database, color: '#DEDBC8' },
  { id: 4, msg: 'Disk usage at 87% — cleanup recommended', time: '2 hours ago', icon: HardDrive, color: '#EF4444' },
  { id: 5, msg: '12 new users registered today', time: '3 hours ago', icon: Users, color: '#DEDBC8' },
];

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
      className="group p-4 rounded-2xl border flex flex-col gap-2.5 bg-[#101010] border-[#DEDBC8]/5 hover:border-[#DEDBC8]/15 transition-colors duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg" style={{ background: `${accent}18`, color: accent }}>
          <Icon size={18} />
        </div>
        {change && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${change.startsWith('+') ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
            {change}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</p>
        <p className="text-xl font-bold text-[#E1E0CC]">{value}</p>
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
  const { t } = useTranslation('dashboard');
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

          <div className="px-5 sm:px-7 py-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              {/* Left: Status overview */}
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#DEDBC8]/10 border border-[#DEDBC8]/15">
                    <PulseDot color="#34D399" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#DEDBC8]">Live</span>
                  </div>
                  <span className="text-[11px] text-gray-500">
                    {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {now.toLocaleTimeString()}
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-black text-[#E1E0CC] font-display tracking-tight">
                  Admin Console
                </h1>
                <p className="text-xs text-gray-500 max-w-md">
                  Real-time platform monitoring, user analytics, and system health dashboard.
                </p>
              </div>

              {/* Right: Quick stat pills */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#DEDBC8]/5 border border-[#DEDBC8]/8">
                  <Users size={13} className="text-[#DEDBC8]" />
                  <div>
                    <div className="text-sm font-bold text-[#E1E0CC]">12,847</div>
                    <div className="text-[9px] text-gray-500 uppercase">Users</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-emerald-400">99.97%</div>
                    <div className="text-[9px] text-gray-500 uppercase">Uptime</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#DEDBC8]/5 border border-[#DEDBC8]/8">
                  <Clock size={13} className="text-[#DEDBC8]" />
                  <div>
                    <div className="text-sm font-bold text-[#E1E0CC]">42ms</div>
                    <div className="text-[9px] text-gray-500 uppercase">Latency</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#DEDBC8]/5 border border-[#DEDBC8]/8">
                  <Database size={13} className="text-[#DEDBC8]" />
                  <div>
                    <div className="text-sm font-bold text-[#E1E0CC]">2.4TB</div>
                    <div className="text-[9px] text-gray-500 uppercase">Storage</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Stat Cards ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard index={0} label="Active Users" value="12,847" change="+8.4%" Icon={Users} accent="#DEDBC8" />
          <StatCard index={1} label="Total Requests" value="429K" change="+11%" Icon={Globe} accent="#A09878" />
          <StatCard index={2} label="Avg Latency" value="42ms" change="-8%" Icon={Clock} accent="#DEDBC8" />
          <StatCard index={3} label="Error Rate" value="0.03%" change="-15%" Icon={AlertTriangle} accent="#EF4444" />
          <StatCard index={4} label="DB Size" value="2.4 TB" change="+5.1%" Icon={Database} accent="#DEDBC8" />
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
                  <Globe size={14} className="text-[#DEDBC8]" /> Request Volume (24h)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Requests & errors over the last 24 hours</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-[#DEDBC8]" /> Requests</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-red-400" /> Errors</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={REQUEST_SERIES}>
                <defs>
                  <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DEDBC8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#DEDBC8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-5" />
                <XAxis dataKey="h" tick={{ fill: '#6B7280', fontSize: 10 }} interval={3} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} width={45} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, fontSize: 12, color: '#E1E0CC' }} />
                <Area type="monotone" dataKey="requests" stroke="#DEDBC8" fill="url(#reqGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="errors" stroke="#EF4444" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
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
                  <Server size={14} className="text-[#DEDBC8]" /> Resource Usage
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Current system resource allocation</p>
              </div>
            </div>
            <div className="space-y-4">
              {RESOURCE_USAGE.map((r) => (
                <div key={r.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-400">{r.name}</span>
                    <span className="font-bold" style={{ color: r.value > 80 ? '#EF4444' : r.color }}>{r.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${r.value}%` }}
                      transition={{ delay: 0.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{ background: r.value > 80 ? '#EF4444' : r.color }}
                    />
                  </div>
                </div>
              ))}
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
                  <TrendingUp size={14} className="text-[#DEDBC8]" /> Visitor Traffic
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Today vs Yesterday comparison</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-[#DEDBC8]" /> Today</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-gray-600" /> Yesterday</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={VISITORS_TODAY}>
                <defs>
                  <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DEDBC8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#DEDBC8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-5" />
                <XAxis dataKey="h" tick={{ fill: '#6B7280', fontSize: 10 }} interval={3} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, fontSize: 12, color: '#E1E0CC' }} />
                <Area type="monotone" dataKey="today" stroke="#DEDBC8" fill="url(#visGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="yesterday" stroke="#6B7280" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
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
                  <Zap size={14} className="text-[#DEDBC8]" /> Recent Events
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Latest system activity</p>
              </div>
            </div>
            <div className="space-y-1">
              {RECENT_EVENTS.map((ev, i) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.06 }}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] transition-colors"
                >
                  <div className="p-1.5 rounded-lg shrink-0" style={{ background: `${ev.color}15`, color: ev.color }}>
                    <ev.icon size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-300 truncate">{ev.msg}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{ev.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
