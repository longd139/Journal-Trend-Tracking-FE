import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Database, HardDrive, Zap, Cpu, Clock,
  CheckCircle2, AlertTriangle, RefreshCw,
  Layers, TrendingUp, Shield, ChevronRight,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// ─── Shared classes ───
const card = 'bg-white dark:bg-[#1B2235] border border-gray-200 dark:border-white/[0.07] rounded-xl';
const muted = 'text-gray-500 dark:text-[#A0AEC0]';
const subtle = 'text-gray-400 dark:text-[#6B7280]';

function StatusBadge({ status }) {
  const map = {
    Healthy: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    Warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    Syncing: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    Error: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    Success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  };
  return <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${map[status] || map.Healthy}`}>{status}</span>;
}

function CollectionCard({ collection }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`${card} overflow-hidden`}>
      <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.01] group"
        onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: `${collection.color}18`, color: collection.color }}><Layers size={16} /></div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white font-mono">{collection.name}</h4>
            <p className={`text-[10px] ${subtle}`}>{collection.documents} documents • {collection.indexes} indexes</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-gray-900 dark:text-white font-mono">{collection.size}</div>
            <div className={`text-[9px] ${muted}`}>{collection.avgQueryTime}</div>
          </div>
          <StatusBadge status={collection.status} />
          <ChevronRight size={14} className={`${subtle} card-icon-glow transition-all duration-200`} style={{ '--icon-accent': collection.color }} />
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-200 dark:border-white/5">
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { l: 'Documents', v: collection.documents, c: collection.color },
                { l: 'Size', v: collection.size, c: '#F59E0B' },
                { l: 'Avg Query', v: collection.avgQueryTime, c: '#8B5CF6' },
                { l: 'Indexes', v: collection.indexes, c: '#00D1B2' },
              ].map((s) => (
                <div key={s.l} className="rounded-lg p-3 text-center bg-gray-50 dark:bg-white/[0.02]">
                  <div className="text-sm font-black font-mono" style={{ color: s.c }}>{s.v}</div>
                  <div className="text-[9px] mt-0.5 text-gray-500 dark:text-[#A0AEC0]">{s.l}</div>
                </div>
              ))}
            </div>
            <div className={`px-4 pb-4 text-[10px] ${subtle} space-y-1`}>
              <div className="flex justify-between"><span>Growth Rate</span><span className="text-emerald-500 font-mono">{collection.growth}</span></div>
              <div className="flex justify-between"><span>Last Compaction</span><span className="text-gray-900 dark:text-white font-mono">{collection.lastCompaction}</span></div>
              <div className="flex justify-between"><span>Replication Status</span><span className="text-emerald-500 font-mono">{collection.replication}</span></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const COLLECTIONS = [
  { name: 'papers_metadata', documents: '142.5M', size: '850 GB', indexes: 8, avgQueryTime: '12ms', growth: '+12%', status: 'Healthy', lastCompaction: '2 hours ago', replication: '3 nodes', color: '#4F8CFF' },
  { name: 'citations_graph', documents: '280.1M', size: '1.2 TB', indexes: 12, avgQueryTime: '45ms', growth: '+18%', status: 'Healthy', lastCompaction: '1 hour ago', replication: '5 nodes', color: '#8B5CF6' },
  { name: 'users_profiles', documents: '2.4M', size: '15 GB', indexes: 5, avgQueryTime: '3ms', growth: '+2%', status: 'Healthy', lastCompaction: '30 min ago', replication: '3 nodes', color: '#00D1B2' },
  { name: 'analytics_events', documents: '45.8M', size: '320 GB', indexes: 6, avgQueryTime: '28ms', growth: '+25%', status: 'Syncing', lastCompaction: '5 hours ago', replication: '2 nodes', color: '#4F8CFF' },
  { name: 'search_index', documents: '18.2M', size: '95 GB', indexes: 15, avgQueryTime: '8ms', growth: '+8%', status: 'Healthy', lastCompaction: '45 min ago', replication: '3 nodes', color: '#F59E0B' },
  { name: 'api_tokens', documents: '150K', size: '1.2 GB', indexes: 2, avgQueryTime: '1ms', growth: '+1%', status: 'Warning', lastCompaction: '2 days ago', replication: '2 nodes', color: '#EF4444' },
];

const STORAGE_TREND = Array.from({ length: 12 }, (_, i) => ({ m: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i], used: 1.2 + i * 0.1 + Math.random() * 0.05, total: 3.0 }));
const BACKUP_HISTORY = [
  { id: 1, type: 'Full', date: '2026-06-16 03:00', size: '2.4 TB', duration: '45 min', status: 'Success' },
  { id: 2, type: 'Incremental', date: '2026-06-15 03:00', size: '120 GB', duration: '8 min', status: 'Success' },
  { id: 3, type: 'Full', date: '2026-06-14 03:00', size: '2.3 TB', duration: '42 min', status: 'Success' },
  { id: 4, type: 'Incremental', date: '2026-06-13 03:00', size: '95 GB', duration: '7 min', status: 'Success' },
];

export default function DatabaseView() {
  const { t } = useTranslation('dashboard');
  const [activeTab, setActiveTab] = useState('collections');

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-gray-900 dark:text-white font-display flex items-center gap-2"><Database size={18} className="text-violet-500" />Database Overview</h2>
          <p className={`text-xs mt-0.5 ${muted}`}>{COLLECTIONS.length} collections • Cluster: 5 nodes</p>
        </div>
        <div className="flex items-center gap-2">
          {['collections', 'backups'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-colors ${activeTab === tab ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-400 dark:text-[#6B7280] hover:text-gray-700 dark:hover:text-white'}`}>{tab}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Size', value: '2.4 TB', icon: HardDrive, color: '#8B5CF6' },
          { label: 'Documents', value: '489.1M', icon: Layers, color: '#4F8CFF' },
          { label: 'Queries/sec', value: '18.4K', icon: Zap, color: '#00D1B2' },
          { label: 'Cache Hit Rate', value: '94.2%', icon: Cpu, color: '#F59E0B' },
        ].map((s) => (
          <motion.div key={s.label} whileHover={{ y: -2 }}
            className={`p-4 ${card} flex items-center gap-3 group`}>
            <div className="p-2 rounded-lg shrink-0 card-icon-glow" style={{ '--icon-accent': s.color, background: `${s.color}18`, color: s.color }}><s.icon size={18} /></div>
            <div><div className="text-[9px] text-gray-500 uppercase tracking-wider">{s.label}</div><div className="text-lg font-black text-gray-900 dark:text-white font-mono">{s.value}</div></div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`lg:col-span-2 ${card} p-5`}>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><TrendingUp size={14} className="text-amber-500" /> Storage Usage Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={STORAGE_TREND}>
              <defs><linearGradient id="storeGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} /><stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
              <XAxis dataKey="m" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} width={36} unit=" TB" />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="used" stroke="#8B5CF6" fill="url(#storeGrad)" strokeWidth={2} dot={false} name="Used" />
              <Area type="monotone" dataKey="total" stroke="#4F8CFF" strokeWidth={1.5} strokeDasharray="5 5" fill="none" dot={false} name="Capacity" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={`${card} p-5`}>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Shield size={14} className="text-emerald-500" /> Cluster Health</h3>
          <div className="space-y-3">
            {[
              { label: 'Replication Status', value: 'All synced', ok: true },
              { label: 'Last Backup', value: '3 hours ago', ok: true },
              { label: 'Disk Usage', value: '87% — Warning', ok: false },
              { label: 'Connection Pool', value: '45/100 active', ok: true },
              { label: 'Slow Queries (24h)', value: '12 detected', ok: false },
              { label: 'Uptime', value: '99.99%', ok: true },
            ].map((h) => (
              <div key={h.label} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-white/[0.02]">
                <span className="text-[10px] text-gray-500 dark:text-[#A0AEC0]">{h.label}</span>
                <span className={`text-[10px] font-mono font-semibold flex items-center gap-1 ${h.ok ? 'text-gray-900 dark:text-white' : 'text-amber-500'}`}>
                  {h.value}{h.ok ? <CheckCircle2 size={10} className="text-emerald-500" /> : <AlertTriangle size={10} className="text-amber-500" />}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'collections' ? (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2"><Layers size={14} className="text-blue-500" /> Collections ({COLLECTIONS.length})</h3>
          {COLLECTIONS.map((c) => <CollectionCard key={c.name} collection={c} />)}
        </div>
      ) : (
        <div className={`${card} overflow-hidden`}>
          <div className="p-4 border-b border-gray-200 dark:border-white/5"><h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2"><Clock size={14} className="text-emerald-500" /> Backup History</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01]">{['Type','Date','Size','Duration','Status'].map((h) => <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-gray-400 dark:text-[#6B7280] uppercase tracking-wider">{h}</th>)}</tr></thead>
              <tbody>
                {BACKUP_HISTORY.map((b) => (
                  <tr key={b.id} className="border-b border-gray-100 dark:border-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.01]">
                    <td className="px-5 py-3"><span className="text-xs font-bold text-gray-900 dark:text-white">{b.type}</span></td>
                    <td className={`px-5 py-3 text-xs ${muted} font-mono`}>{b.date}</td>
                    <td className="px-5 py-3 text-xs text-gray-900 dark:text-white font-mono">{b.size}</td>
                    <td className={`px-5 py-3 text-xs ${muted} font-mono`}>{b.duration}</td>
                    <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
