import { motion } from 'framer-motion';
import { CheckCircle, Activity, Zap, AlertCircle } from 'lucide-react';

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
    ok: { bg: '#00D1B21A', text: '#00D1B2' },
    degraded: { bg: '#F59E0B1A', text: '#F59E0B' },
    down: { bg: '#EF44441A', text: '#EF4444' },
  };
  const c = colors[status.toLowerCase()] || colors.ok;
  
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" style={{ background: c.bg, color: c.text }}>
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
// 3. GIAO DIỆN CHÍNH (Đã thêm export default)
// ==========================================
export default function APIMonitoring() {
  return (
    <div className="space-y-6 p-8">
      {/* 4 Cục Thống kê Tổng quan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Avg Uptime"
          value="98.7%"
          change="+0.3%"
          Icon={CheckCircle}
          accent="#00D1B2"
        />
        <StatCard
          label="Requests / day"
          value="429.4K"
          change="+11%"
          Icon={Activity}
          accent="#4F8CFF"
        />
        <StatCard
          label="Avg Latency"
          value="1.0ms"
          change="-8%"
          Icon={Zap}
          accent="#8B5CF6"
        />
        <StatCard
          label="Error Rate"
          value="0.03%"
          change="-15%"
          Icon={AlertCircle}
          accent="#F59E0B"
        />
      </div>

      {/* Danh sách các API */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {APIS.map((api) => (
          <div
            key={api.name}
            className="rounded-xl border p-5 transition-colors hover:bg-white/[0.02]"
            style={{
              background: '#1B2235',
              borderColor: 'rgba(255,255,255,0.07)',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">{api.name}</h3>
                <p className="text-xs mt-0.5" style={{ color: '#A0AEC0' }}>
                  {api.req} requests today
                </p>
              </div>
              <StatusPill status={api.status} />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { l: 'Uptime', v: `${api.up}%`, c: '#00D1B2' },
                { l: 'Latency', v: api.lat, c: '#4F8CFF' },
                { l: 'Requests', v: api.req, c: '#8B5CF6' },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-lg p-3 text-center"
                  style={{ background: '#131A2A' }}
                >
                  <div
                    className="text-base font-black"
                    style={{ color: s.c, fontFamily: "'Outfit', sans-serif" }}
                  >
                    {s.v}
                  </div>
                  <div
                    className="text-[10px] mt-0.5"
                    style={{ color: '#A0AEC0' }}
                  >
                    {s.l}
                  </div>
                </div>
              ))}
            </div>

            {/* Thanh tiến trình Uptime */}
            <div>
              <div
                className="flex justify-between text-[10px] mb-1.5"
                style={{ color: '#A0AEC0' }}
              >
                <span>Uptime</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {api.up}%
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: '#131A2A' }}
              >
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