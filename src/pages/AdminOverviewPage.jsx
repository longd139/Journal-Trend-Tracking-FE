import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Users, Server, Database, Cpu, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';

// ==========================================
// 1. COMPONENTS DÙNG CHUNG
// ==========================================
const StatCard = ({ label, value, change, Icon, accent }) => (
  <motion.div whileHover={{ y: -4 }} className="p-5 rounded-xl border flex flex-col justify-between" style={{ background: '#1B2235', borderColor: 'rgba(255,255,255,0.07)' }}>
    <div className="flex items-start justify-between mb-2">
      <div className="p-2 rounded-lg" style={{ background: `${accent}1A`, color: accent }}>
        <Icon size={18} />
      </div>
      <span className="text-xs font-bold px-2 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.05)', color: change.startsWith('+') ? '#00D1B2' : '#EF4444' }}>
        {change}
      </span>
    </div>
    <div>
      <h4 className="text-[11px] font-semibold tracking-wider uppercase mb-1" style={{ color: '#A0AEC0' }}>{label}</h4>
      <div className="text-2xl font-black text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
    </div>
  </motion.div>
);

const StatusPill = ({ status }) => {
  const colors = {
    active: { bg: '#00D1B21A', text: '#00D1B2' },
    ok: { bg: '#00D1B21A', text: '#00D1B2' },
    offline: { bg: '#6B72801A', text: '#A0AEC0' },
    suspended: { bg: '#EF44441A', text: '#EF4444' },
    degraded: { bg: '#F59E0B1A', text: '#F59E0B' },
    down: { bg: '#EF44441A', text: '#EF4444' },
  };
  const c = colors[status?.toLowerCase()] || colors.ok;
  
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" style={{ background: c.bg, color: c.text }}>
      {status}
    </span>
  );
};

// ==========================================
// 2. DỮ LIỆU GIẢ (Mock Data)
// ==========================================
const PUB_DATA = [
  { m: 'Jan', ai: 120, bio: 80 }, { m: 'Feb', ai: 150, bio: 90 },
  { m: 'Mar', ai: 180, bio: 110 }, { m: 'Apr', ai: 220, bio: 130 },
  { m: 'May', ai: 280, bio: 150 }, { m: 'Jun', ai: 310, bio: 160 },
  { m: 'Jul', ai: 340, bio: 180 }, { m: 'Aug', ai: 380, bio: 190 }
];

const APIS = [
  { name: 'Semantic Search API', req: '124K', status: 'ok', up: 99.9, lat: '120ms' },
  { name: 'Citation Graph API', req: '89K', status: 'degraded', up: 95.5, lat: '850ms' },
  { name: 'User Auth API', req: '215K', status: 'ok', up: 99.99, lat: '45ms' },
  { name: 'Analytics Engine API', req: '42K', status: 'ok', up: 99.5, lat: '210ms' },
];

const USERS_TABLE = [
  { id: 1, name: 'Sarah Chen', email: 'sarah.c@mit.edu', role: 'Researcher', papers: 142, status: 'Active', last: '2 mins ago' },
  { id: 2, name: 'Michael Ross', email: 'm.ross@stanford.edu', role: 'Professor', papers: 89, status: 'Active', last: '1 hour ago' },
  { id: 3, name: 'Elena Gilbert', email: 'elena.g@harvard.edu', role: 'Student', papers: 12, status: 'Offline', last: '2 days ago' },
  { id: 4, name: 'David Kim', email: 'dkim@berkeley.edu', role: 'Researcher', papers: 56, status: 'Suspended', last: '1 week ago' },
];

const FIELD_DATA = [
  { n: 'AI & ML', v: 45, c: '#4F8CFF' },
  { n: 'Biotech', v: 30, c: '#8B5CF6' },
  { n: 'Climate', v: 25, c: '#00D1B2' }
];

// ==========================================
// 3. GIAO DIỆN CHÍNH (Đã thêm export default)
// ==========================================
export default function AdminOverview() {
  const { t } = useTranslation('dashboard');

  const hourlyData = PUB_DATA.slice(-8).map((d, i) => ({
    h: `${8 + i * 2}:00`,
    req: Math.round((d.ai + d.bio) / 14),
  }));

  return (
    <div className="space-y-6 p-8">
      {/* 4 Cục Thống kê */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('admin.activeUsers')}
          value="12,847"
          change="+8.4%"
          Icon={Users}
          accent="#4F8CFF"
        />
        <StatCard
          label={t('admin.apiHealth')}
          value="98.7%"
          change="+0.3%"
          Icon={Server}
          accent="#00D1B2"
        />
        <StatCard
          label={t('admin.dbSize')}
          value="2.4 TB"
          change="+5.1%"
          Icon={Database}
          accent="#8B5CF6"
        />
        <StatCard
          label={t('admin.systemLoad')}
          value="34%"
          change="-12%"
          Icon={Cpu}
          accent="#F59E0B"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Cục API Status */}
        <div
          className="rounded-xl border p-5"
          style={{
            background: '#1B2235',
            borderColor: 'rgba(255,255,255,0.07)',
          }}
        >
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Activity size={14} style={{ color: '#00D1B2' }} /> {t('admin.apiStatusOverview')}
          </h3>
          <div className="space-y-2.5">
            {APIS.map((api) => (
              <div
                key={api.name}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.02] transition-colors"
                style={{ background: '#131A2A' }}
              >
                <div className="flex items-center gap-3">
                  <StatusPill status={api.status} />
                  <span className="text-sm font-medium text-white">
                    {api.name}
                  </span>
                </div>
                <div
                  className="flex gap-6 text-xs"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  <span style={{ color: '#A0AEC0' }}>{api.lat}</span>
                  <span style={{ color: '#00D1B2' }}>{api.up}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cục Request Volume */}
        <div
          className="rounded-xl border p-5"
          style={{
            background: '#1B2235',
            borderColor: 'rgba(255,255,255,0.07)',
          }}
        >
          <h3 className="text-sm font-bold text-white mb-4">
            {t('admin.requestVolume')}
          </h3>
          <ResponsiveContainer width="100%" height={185}>
            <BarChart data={hourlyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="h"
                tick={{ fill: '#A0AEC0', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#A0AEC0', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  background: '#0B1020',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 11,
                }}
              />
              <Bar
                dataKey="req"
                fill="#4F8CFF"
                radius={[3, 3, 0, 0]}
                opacity={0.8}
                name={t('admin.requests')}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bảng Recent User Activity */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: '#1B2235', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}
        >
          <h3 className="text-sm font-bold text-white">{t('admin.recentUserActivity')}</h3>
        </div>
        {USERS_TABLE.slice(0, 4).map((u, i) => (
          <div
            key={u.id}
            className="flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-white/[0.02] transition-colors"
            style={{ borderColor: 'rgba(255,255,255,0.04)' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{
                background: `linear-gradient(135deg, ${FIELD_DATA[i % FIELD_DATA.length].c}, #8B5CF6)`,
              }}
            >
              {u.name.split(' ').slice(-1)[0][0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white">{u.name}</div>
              <div className="text-xs" style={{ color: '#A0AEC0' }}>
                {u.email}
              </div>
            </div>
            <StatusPill status={u.status} />
            <span
              className="text-xs hidden md:block"
              style={{
                color: '#6B7280',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {u.last}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}