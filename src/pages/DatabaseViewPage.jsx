import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Database, Hash, Zap, Cpu } from 'lucide-react';

// ==========================================
// 1. COMPONENTS DÙNG CHUNG
// ==========================================
const StatCard = ({ label, value, change, Icon, accent }) => (
  <motion.div 
    whileHover={{ y: -4 }} 
    className="p-5 rounded-xl border flex flex-col justify-between bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/5 transition-colors duration-300 shadow-sm dark:shadow-none"
  >
    <div className="flex items-start justify-between mb-2">
      <div className="p-2 rounded-lg" style={{ background: `${accent}1A`, color: accent }}>
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
    healthy: 'bg-emerald-500/10 text-emerald-500',
    warning: 'bg-amber-500/10 text-amber-500',
    syncing: 'bg-blue-500/10 text-blue-500',
    error: 'bg-red-500/10 text-red-500',
  };
  const c = colors[status.toLowerCase()] || colors.healthy;
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${c}`}>
      {status}
    </span>
  );
};

// ==========================================
// 2. DỮ LIỆU GIẢ
// ==========================================
const DB_TABLES = [
  { name: 'papers_metadata', rows: '142.5M', size: '850 GB', growth: '+12%', status: 'Healthy' },
  { name: 'citations_graph', rows: '280.1M', size: '1.2 TB', growth: '+18%', status: 'Healthy' },
  { name: 'users_auth', rows: '2.4M', size: '15 GB', growth: '+2%', status: 'Healthy' },
  { name: 'analytics_logs', rows: '45.8M', size: '320 GB', growth: '+25%', status: 'Syncing' },
  { name: 'api_tokens', rows: '150K', size: '1.2 GB', growth: '+1%', status: 'Warning' },
];

// ==========================================
// 3. GIAO DIỆN CHÍNH
// ==========================================
export default function DatabaseView() {
  const { t } = useTranslation('dashboard');

  return (
    <div className="space-y-6 p-8 bg-gray-50 dark:bg-[#0B1020] min-h-screen transition-colors duration-300">
      {/* 4 Cục Thống kê */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('database.totalSize')} value="2.4 TB" change="+5.1%" Icon={Database} accent="#8B5CF6" />
        <StatCard label={t('database.totalRecords')} value="471M" change="+3.8%" Icon={Hash} accent="#4F8CFF" />
        <StatCard label={t('database.queriesPerSec')} value="18.4K" change="+12%" Icon={Zap} accent="#00D1B2" />
        <StatCard label={t('database.cacheHitRate')} value="94.2%" change="+1.8%" Icon={Cpu} accent="#F59E0B" />
      </div>

      {/* Bảng Database Tables */}
      <div className="rounded-xl border overflow-hidden bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/5 transition-colors duration-300 shadow-sm dark:shadow-none">
        <div className="p-5 border-b border-gray-200 dark:border-white/5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t('database.databaseTables')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01]">
                {[t('database.columns.table'), t('database.columns.rows'), t('database.columns.size'), t('database.columns.growth'), t('database.columns.status')].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DB_TABLES.map((t) => (
                <tr key={t.name} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5 text-xs font-semibold text-[#4F8CFF]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{t.name}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-900 dark:text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{t.rows}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-900 dark:text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{t.size}</td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-[#00D1B2]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{t.growth}</td>
                  <td className="px-5 py-3.5"><StatusPill status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}