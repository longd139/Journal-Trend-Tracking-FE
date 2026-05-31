import { motion } from 'framer-motion';
import { Database, Hash, Zap, Cpu } from 'lucide-react';

// ==========================================
// 1. COMPONENTS BỊ THIẾU
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
    healthy: { bg: '#00D1B21A', text: '#00D1B2' },
    warning: { bg: '#F59E0B1A', text: '#F59E0B' },
    syncing: { bg: '#4F8CFF1A', text: '#4F8CFF' },
    error: { bg: '#EF44441A', text: '#EF4444' },
  };
  const c = colors[status.toLowerCase()] || colors.healthy;
  
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" style={{ background: c.bg, color: c.text }}>
      {status}
    </span>
  );
};

// ==========================================
// 2. DỮ LIỆU GIẢ (Mock Data)
// ==========================================
const DB_TABLES = [
  { name: 'papers_metadata', rows: '142.5M', size: '850 GB', growth: '+12%', status: 'Healthy' },
  { name: 'citations_graph', rows: '280.1M', size: '1.2 TB', growth: '+18%', status: 'Healthy' },
  { name: 'users_auth', rows: '2.4M', size: '15 GB', growth: '+2%', status: 'Healthy' },
  { name: 'analytics_logs', rows: '45.8M', size: '320 GB', growth: '+25%', status: 'Syncing' },
  { name: 'api_tokens', rows: '150K', size: '1.2 GB', growth: '+1%', status: 'Warning' },
];

// ==========================================
// 3. GIAO DIỆN CHÍNH (Đã thêm export default)
// ==========================================
export default function DatabaseView() {
  return (
    <div className="space-y-6 p-8">
      {/* 4 Cục Thống kê */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Size"
          value="2.4 TB"
          change="+5.1%"
          Icon={Database}
          accent="#8B5CF6"
        />
        <StatCard
          label="Total Records"
          value="471M"
          change="+3.8%"
          Icon={Hash}
          accent="#4F8CFF"
        />
        <StatCard
          label="Queries / sec"
          value="18.4K"
          change="+12%"
          Icon={Zap}
          accent="#00D1B2"
        />
        <StatCard
          label="Cache Hit Rate"
          value="94.2%"
          change="+1.8%"
          Icon={Cpu}
          accent="#F59E0B"
        />
      </div>

      {/* Bảng Database Tables */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: '#1B2235', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div
          className="p-5 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}
        >
          <h3 className="text-sm font-bold text-white">Database Tables</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="border-b"
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}
              >
                {['Table', 'Rows', 'Size', 'Growth', 'Status'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold"
                    style={{ color: '#6B7280' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DB_TABLES.map((t) => (
                <tr
                  key={t.name}
                  className="border-b hover:bg-white/[0.02] transition-colors"
                  style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                >
                  <td
                    className="px-5 py-3.5 text-xs font-semibold"
                    style={{
                      color: '#4F8CFF',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {t.name}
                  </td>
                  <td
                    className="px-5 py-3.5 text-xs text-white"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {t.rows}
                  </td>
                  <td
                    className="px-5 py-3.5 text-xs text-white"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {t.size}
                  </td>
                  <td
                    className="px-5 py-3.5 text-xs font-semibold"
                    style={{
                      color: '#00D1B2',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {t.growth}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}