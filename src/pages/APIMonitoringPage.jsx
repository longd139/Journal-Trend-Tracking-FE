import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Activity, Zap, AlertCircle } from 'lucide-react';

// ==========================================
// 1. COMPONENTS DÙNG CHUNG
// ==========================================
const StatCard = ({ label, value, change, Icon, accent }) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2 }}
    className="p-5 rounded-xl border flex flex-col justify-between bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/5 transition-colors duration-300 shadow-sm dark:shadow-none group"
  >
    <div className="flex items-start justify-between mb-2">
      <div className="p-2 rounded-lg card-icon-accent" style={{ '--icon-accent': accent, background: `${accent}1A`, color: accent }}>
        <Icon size={18} />
      </div>
      <span className="text-xs font-bold px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5" style={{ color: change.startsWith('+') ? '#00D1B2' : '#EF4444' }}>
        {change}
      </span>
    </div>
    <div>
      <h4 className="text-[11px] font-semibold tracking-wider uppercase mb-1 text-gray-500 dark:text-[#A0AEC0]">{label}</h4>
      <div className="text-2xl font-black text-gray-900 dark:text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
    </div>
  </motion.div>
);

const StatusPill = ({ status }) => {
  const colors = {
    ok: 'bg-emerald-500/10 text-emerald-500',
    degraded: 'bg-amber-500/10 text-amber-500',
    down: 'bg-red-500/10 text-red-500',
  };
  const c = colors[status.toLowerCase()] || colors.ok;
  
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${c}`}>
      {status}
    </span>
  );
};

// ==========================================
// 2. DỮ LIỆU GIẢ (Mock Data)
// ==========================================
const APIS = [
  { name: 'Semantic Search API', req: '124K', status: 'ok', up: 99.9, lat: '120ms' },
  { name: 'Citation Graph API', req: '89K', status: 'degraded', up: 95.5, lat: '850ms' },
  { name: 'User Auth API', req: '215K', status: 'ok', up: 99.99, lat: '45ms' },
  { name: 'Analytics Engine API', req: '42K', status: 'ok', up: 99.5, lat: '210ms' },
];

// ==========================================
// 3. GIAO DIỆN CHÍNH
// ==========================================
export default function APIMonitoring() {
  const { t } = useTranslation('dashboard');

  return (
    <div className="space-y-6 p-8 min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0B1020]">
      {/* 4 Cục Thống kê Tổng quan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('apiMonitoring.avgUptime')} value="98.7%" change="+0.3%" Icon={CheckCircle} accent="#00D1B2" />
        <StatCard label={t('apiMonitoring.requestsPerDay')} value="429.4K" change="+11%" Icon={Activity} accent="#4F8CFF" />
        <StatCard label={t('apiMonitoring.avgLatency')} value="1.0ms" change="-8%" Icon={Zap} accent="#8B5CF6" />
        <StatCard label={t('apiMonitoring.errorRate')} value="0.03%" change="-15%" Icon={AlertCircle} accent="#F59E0B" />
      </div>

      {/* Danh sách các API */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {APIS.map((api) => (
          <div
            key={api.name}
            className="rounded-xl border p-5 bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/5 transition-colors duration-300 shadow-sm dark:shadow-none hover:bg-gray-100 dark:hover:bg-white/[0.02]"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">{api.name}</h3>
                <p className="text-xs mt-0.5 text-gray-500 dark:text-[#A0AEC0]">
                  {api.req} {t('apiMonitoring.requestsToday')}
                </p>
              </div>
              <StatusPill status={api.status} />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { l: t('apiMonitoring.uptime'), v: `${api.up}%`, c: '#00D1B2' },
                { l: t('apiMonitoring.latency'), v: api.lat, c: '#4F8CFF' },
                { l: t('apiMonitoring.requests'), v: api.req, c: '#8B5CF6' },
              ].map((s) => (
                <div key={s.l} className="rounded-lg p-3 text-center bg-gray-50 dark:bg-[#131A2A] transition-colors">
                  <div className="text-base font-black font-outfit" style={{ color: s.c }}>{s.v}</div>
                  <div className="text-[10px] mt-0.5 text-gray-500 dark:text-[#A0AEC0]">{s.l}</div>
                </div>
              ))}
            </div>

            {/* Thanh tiến trình Uptime */}
            <div>
              <div className="flex justify-between text-[10px] mb-1.5 text-gray-500 dark:text-[#A0AEC0]">
                <span>{t('apiMonitoring.uptime')}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{api.up}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden bg-gray-200 dark:bg-[#131A2A]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${api.up}%`,
                    background: api.status === 'ok' ? '#00D1B2' : (api.status === 'degraded' ? '#F59E0B' : '#EF4444'),
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}