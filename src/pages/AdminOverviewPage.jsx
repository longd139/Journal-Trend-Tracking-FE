import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Users, Server, Database, Cpu, Activity, TrendingUp,
  AlertTriangle, Zap, Clock, Globe, Shield, RefreshCw,
  ArrowUpRight, CheckCircle2, HardDrive, Eye,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line,
} from 'recharts';

// ─── Shared classes ───
const card = 'bg-white dark:bg-[#1B2235] border border-gray-200 dark:border-white/[0.07] rounded-xl';
const muted = 'text-gray-500 dark:text-[#A0AEC0]';
const subtle = 'text-gray-400 dark:text-[#6B7280]';

function StatCard({ label, value, change, Icon, accent }) {
  return (
    <motion.div whileHover={{ y: -3 }} className={`p-4 ${card} flex flex-col justify-between group`}>
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 rounded-lg card-icon-glow" style={{ '--icon-accent': accent, background: `${accent}18`, color: accent }}><Icon size={18} /></div>
        {change && <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: `${change.startsWith('+') ? '#00D1B2' : '#EF4444'}15`, color: change.startsWith('+') ? '#00D1B2' : '#EF4444' }}>{change}</span>}
      </div>
      <div>
        <h4 className="text-[10px] font-semibold uppercase tracking-wider mb-1 text-gray-500 dark:text-[#A0AEC0]">{label}</h4>
        <div className="text-xl font-black text-gray-900 dark:text-white font-mono">{value}</div>
      </div>
    </motion.div>
  );
}

function PulseDot({ color = '#00D1B2' }) {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: color }} />
      <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: color }} />
    </span>
  );
}

const REQUEST_SERIES = Array.from({ length: 24 }, (_, i) => ({ h: `${i}:00`, requests: Math.round(800 + Math.sin(i / 4) * 400 + Math.random() * 200), errors: Math.round(5 + Math.random() * 15) }));
const USER_GROWTH = Array.from({ length: 7 }, (_, i) => ({ day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], new: Math.round(20 + Math.random() * 80), active: Math.round(200 + i * 30 + Math.random() * 50) }));
const RESOURCE_USAGE = [
  { name: 'CPU', value: 34, color: '#4F8CFF' }, { name: 'Memory', value: 62, color: '#8B5CF6' },
  { name: 'Disk', value: 87, color: '#F59E0B' }, { name: 'Network', value: 28, color: '#00D1B2' },
];
const VISITORS_TODAY = Array.from({ length: 24 }, (_, i) => ({
  h: `${i}:00`,
  today: Math.round(50 + Math.sin((i - 9) / 4) * 180 + Math.sin(i / 2) * 60 + Math.random() * 40 + (i >= 8 && i <= 20 ? 200 : 0)),
  yesterday: Math.round(40 + Math.sin((i - 10) / 4) * 160 + Math.sin(i / 2.3) * 50 + Math.random() * 35 + (i >= 9 && i <= 19 ? 180 : 0)),
}));
const RECENT_EVENTS = [
  { id: 1, msg: 'API v2.4.1 deployed successfully', time: '12 min ago', icon: CheckCircle2, color: '#00D1B2' },
  { id: 2, msg: 'Citation Graph API latency spike detected', time: '28 min ago', icon: AlertTriangle, color: '#F59E0B' },
  { id: 3, msg: 'Database backup completed (2.4 TB)', time: '1 hour ago', icon: Database, color: '#4F8CFF' },
  { id: 4, msg: 'Disk usage at 87% — cleanup recommended', time: '2 hours ago', icon: HardDrive, color: '#EF4444' },
  { id: 5, msg: '12 new users registered today', time: '3 hours ago', icon: Users, color: '#8B5CF6' },
];

export default function AdminOverview() {
  const { t } = useTranslation('dashboard');
  const [now, setNow] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(i); }, []);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-gray-900 dark:text-white font-display flex items-center gap-2">
            <Activity size={18} className="text-[#00D1B2]" />System Dashboard
          </h2>
          <p className={`text-xs mt-0.5 flex items-center gap-1.5 ${muted}`}><PulseDot /> All systems operational • {now.toLocaleTimeString()}</p>
        </div>
        <div className={`hidden sm:flex items-center gap-3 text-[10px] ${subtle}`}>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Operational</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Degraded</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Down</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Active Users" value="12,847" change="+8.4%" Icon={Users} accent="#4F8CFF" />
        <StatCard label="Total Requests" value="429K" change="+11%" Icon={Globe} accent="#00D1B2" />
        <StatCard label="Avg Latency" value="42ms" change="-8%" Icon={Clock} accent="#8B5CF6" />
        <StatCard label="Error Rate" value="0.03%" change="-15%" Icon={AlertTriangle} accent="#F59E0B" />
        <StatCard label="DB Size" value="2.4 TB" change="+5.1%" Icon={Database} accent="#EF4444" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`lg:col-span-2 ${card} p-5`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2"><Globe size={14} className="text-blue-500" /> Request Volume (24h)</h3>
            <div className={`flex items-center gap-3 text-[10px] ${muted}`}>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-blue-500" /> Requests</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-red-500" /> Errors</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REQUEST_SERIES}>
              <defs>
                <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4F8CFF" stopOpacity={0.3} /><stop offset="100%" stopColor="#4F8CFF" stopOpacity={0} /></linearGradient>
                <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#EF4444" stopOpacity={0.2} /><stop offset="100%" stopColor="#EF4444" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
              <XAxis dataKey="h" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="requests" stroke="#4F8CFF" fill="url(#reqGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="errors" stroke="#EF4444" fill="url(#errGrad)" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={`${card} p-5`}>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Cpu size={14} className="text-amber-500" /> Resource Usage</h3>
          <div className="space-y-4">
            {RESOURCE_USAGE.map((r) => (
              <div key={r.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-gray-500 dark:text-[#A0AEC0]">{r.name}</span>
                  <span className="text-[10px] font-mono font-semibold text-gray-900 dark:text-white">{r.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-white/[0.04] overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${r.value}%` }} transition={{ duration: 1, delay: 0.3 }} className="h-full rounded-full" style={{ background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`lg:col-span-2 ${card} p-5`}>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><TrendingUp size={14} className="text-emerald-500" /> User Growth (7 days)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={USER_GROWTH}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
              <XAxis dataKey="day" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="new" fill="#4F8CFF" radius={[3, 3, 0, 0]} name="New Users" />
              <Bar dataKey="active" fill="#8B5CF6" radius={[3, 3, 0, 0]} name="Active Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={`${card} p-5`}>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Zap size={14} className="text-amber-500" /> Recent Events</h3>
          <div className="space-y-2.5">
            {RECENT_EVENTS.map((e) => (
              <div key={e.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-gray-50 dark:bg-white/[0.02]">
                <e.icon size={13} style={{ color: e.color }} className="shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0"><p className="text-[11px] text-gray-900 dark:text-white leading-snug">{e.msg}</p><span className={`text-[9px] ${subtle}`}>{e.time}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Visitors Chart */}
      <div className={`${card} p-5`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Eye size={14} className="text-violet-500" /> Daily Visitors
            </h3>
            <p className={`text-[10px] mt-0.5 ${muted}`}>
              {VISITORS_TODAY.reduce((s, d) => s + d.today, 0).toLocaleString()} visitors today
              <span className="text-emerald-500 ml-2">
                +{Math.round((VISITORS_TODAY.reduce((s, d) => s + d.today, 0) / VISITORS_TODAY.reduce((s, d) => s + d.yesterday, 0) - 1) * 100)}% vs yesterday
              </span>
            </p>
          </div>
          <div className={`flex items-center gap-3 text-[10px] ${muted}`}>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-violet-500" /> Today</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-gray-400" /> Yesterday</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={VISITORS_TODAY}>
            <defs>
              <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.25} /><stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
            <XAxis dataKey="h" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 11 }} />
            <Area type="monotone" dataKey="yesterday" stroke="#9CA3AF" strokeWidth={1.5} strokeDasharray="5 5" fill="none" dot={false} name="Yesterday" />
            <Area type="monotone" dataKey="today" stroke="#8B5CF6" fill="url(#visGrad)" strokeWidth={2} dot={false} name="Today" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'User Management', icon: Users, color: '#4F8CFF' },
          { label: 'API Monitoring', icon: Globe, color: '#00D1B2' },
          { label: 'Database View', icon: Database, color: '#8B5CF6' },
          { label: 'System Settings', icon: Shield, color: '#F59E0B' },
        ].map((q) => (
          <motion.div key={q.label} whileHover={{ y: -2 }}
            className={`p-3 ${card} cursor-pointer flex items-center gap-3 hover:shadow-md transition-all duration-200 group`}>
            <div className="p-2 rounded-lg card-icon-glow transition-all duration-200" style={{ '--icon-accent': q.color, background: `${q.color}18`, color: q.color }}><q.icon size={16} /></div>
            <span className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-blue-300 transition-colors">{q.label}</span>
            <ArrowUpRight size={12} className={`ml-auto ${subtle}`} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
