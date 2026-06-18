import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Activity, Zap, AlertCircle, CheckCircle2,
  Globe, Server, Wifi, WifiOff, RefreshCw,
  TrendingUp, ChevronRight,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// ─── Shared classes ───
const card = 'bg-white dark:bg-[#1B2235] border border-gray-200 dark:border-white/[0.07] rounded-xl';
const muted = 'text-gray-500 dark:text-[#A0AEC0]';
const subtle = 'text-gray-400 dark:text-[#6B7280]';

function StatusBadge({ status }) {
  const map = {
    healthy: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    degraded: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    down: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  };
  const icons = { healthy: Wifi, degraded: Activity, down: WifiOff };
  const Icon = icons[status] || Wifi;
  const labels = { healthy: 'Healthy', degraded: 'Degraded', down: 'Down' };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1 ${map[status] || map.healthy}`}>
      <Icon size={10} /> {labels[status] || 'Healthy'}
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
  const [expanded, setExpanded] = useState(false);
  const sparkData = Array.from({ length: 20 }, () => ({ v: endpoint.latencyValue + Math.random() * 50 - 25 }));

  return (
    <div className={`${card} overflow-hidden`}>
      <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.01] group"
        onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <StatusBadge status={endpoint.status} />
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{endpoint.name}</h4>
            <p className={`text-[10px] ${subtle} font-mono`}>{endpoint.method} {endpoint.path}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block"><LatencySpark data={sparkData} color={endpoint.color} /></div>
          <div className="text-right">
            <div className="text-xs font-bold text-gray-900 dark:text-white font-mono">{endpoint.latency}</div>
            <div className={`text-[9px] ${muted}`}>{endpoint.uptime}% uptime</div>
          </div>
          <ChevronRight size={14} className={`${subtle} card-icon-glow transition-all duration-200`} style={{ '--icon-accent': endpoint.color }} />
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-200 dark:border-white/5">
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { l: 'Requests (24h)', v: endpoint.requests, c: endpoint.color },
                { l: 'Avg Latency', v: endpoint.latency, c: '#F59E0B' },
                { l: 'Error Rate', v: endpoint.errorRate, c: '#EF4444' },
                { l: 'Success Rate', v: `${endpoint.uptime}%`, c: '#00D1B2' },
              ].map((s) => (
                <div key={s.l} className="rounded-lg p-3 text-center bg-gray-50 dark:bg-white/[0.02]">
                  <div className="text-sm font-black font-mono" style={{ color: s.c }}>{s.v}</div>
                  <div className="text-[9px] mt-0.5 text-gray-500 dark:text-[#A0AEC0]">{s.l}</div>
                </div>
              ))}
            </div>
            <div className="px-4 pb-4 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={Array.from({ length: 24 }, (_, i) => ({ h: `${i}:00`, v: endpoint.latencyValue + Math.sin(i / 3) * 30 + Math.random() * 20 }))}>
                  <defs><linearGradient id={`d-${endpoint.path}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={endpoint.color} stopOpacity={0.3} /><stop offset="100%" stopColor={endpoint.color} stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                  <XAxis dataKey="h" tick={{ fill: '#9CA3AF', fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 9 }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 10 }} />
                  <Area type="monotone" dataKey="v" stroke={endpoint.color} fill={`url(#d-${endpoint.path})`} strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ENDPOINTS = [
  { name: 'Semantic Search API', method: 'GET', path: '/api/v1/papers/search', status: 'healthy', requests: '124K', latency: '120ms', latencyValue: 120, uptime: 99.9, errorRate: '0.02%', color: '#4F8CFF' },
  { name: 'Citation Graph API', method: 'GET', path: '/api/v1/papers/search/graph', status: 'degraded', requests: '89K', latency: '850ms', latencyValue: 850, uptime: 95.5, errorRate: '1.2%', color: '#F59E0B' },
  { name: 'User Authentication API', method: 'POST', path: '/api/auth/login', status: 'healthy', requests: '215K', latency: '45ms', latencyValue: 45, uptime: 99.99, errorRate: '0.01%', color: '#00D1B2' },
  { name: 'Analytics Engine API', method: 'GET', path: '/api/v1/analytics', status: 'healthy', requests: '42K', latency: '210ms', latencyValue: 210, uptime: 99.5, errorRate: '0.05%', color: '#8B5CF6' },
  { name: 'User Profile API', method: 'GET', path: '/api/users/me', status: 'healthy', requests: '310K', latency: '65ms', latencyValue: 65, uptime: 99.95, errorRate: '0.03%', color: '#4F8CFF' },
  { name: 'Paper Detail API', method: 'GET', path: '/api/v1/papers/:id', status: 'healthy', requests: '89K', latency: '90ms', latencyValue: 90, uptime: 99.8, errorRate: '0.01%', color: '#00D1B2' },
];

export default function APIMonitoring() {
  const { t } = useTranslation('dashboard');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const stats = {
    total: ENDPOINTS.length,
    healthy: ENDPOINTS.filter((e) => e.status === 'healthy').length,
    degraded: ENDPOINTS.filter((e) => e.status === 'degraded').length,
    avgUptime: (ENDPOINTS.reduce((s, e) => s + e.uptime, 0) / ENDPOINTS.length).toFixed(1),
    totalReq: ENDPOINTS.reduce((s, e) => s + parseInt(e.requests), 0),
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-gray-900 dark:text-white font-display flex items-center gap-2"><Globe size={18} className="text-blue-500" />API Monitoring</h2>
          <p className={`text-xs mt-0.5 ${muted}`}>{stats.total} endpoints monitored • Last refreshed {lastRefresh.toLocaleTimeString()}</p>
        </div>
        <button onClick={() => setLastRefresh(new Date())} className="px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-[#A0AEC0] hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Endpoints', value: stats.total, icon: Server, color: '#4F8CFF' },
          { label: 'Healthy', value: stats.healthy, icon: CheckCircle2, color: '#00D1B2' },
          { label: 'Degraded', value: stats.degraded, icon: AlertCircle, color: '#F59E0B' },
          { label: 'Avg Uptime', value: `${stats.avgUptime}%`, icon: TrendingUp, color: '#8B5CF6' },
          { label: 'Total Requests', value: `${(stats.totalReq / 1000).toFixed(0)}K`, icon: Activity, color: '#F59E0B' },
        ].map((s) => (
          <motion.div key={s.label} whileHover={{ y: -2 }}
            className={`p-3 ${card} flex items-center gap-3 group`}>
            <div className="p-2 rounded-lg shrink-0 card-icon-glow" style={{ '--icon-accent': s.color, background: `${s.color}18`, color: s.color }}><s.icon size={16} /></div>
            <div><div className="text-[9px] text-gray-500 uppercase tracking-wider">{s.label}</div><div className="text-sm font-black text-gray-900 dark:text-white font-mono">{s.value}</div></div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2"><Globe size={14} className={subtle} /> API Endpoints</h3>
        {ENDPOINTS.map((ep) => <EndpointCard key={ep.path} endpoint={ep} />)}
      </div>
    </div>
  );
}
