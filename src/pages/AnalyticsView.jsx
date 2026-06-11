import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FileText, TrendingUp, Users, Star } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import Neo4jGraphCard from '../components/Neo4jGraphCard';

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

const FIELD_DATA = [
  { n: 'AI & ML', v: 45, c: '#4F8CFF' },
  { n: 'Biotech', v: 30, c: '#8B5CF6' },
  { n: 'Climate', v: 25, c: '#00D1B2' }
];

export default function AnalyticsView() {
  const { t } = useTranslation('analytics');

  return (
    <div className="space-y-6 p-8 min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0B1020]">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('cards.trendAnalysis')} value="50.2M" change="+14%" Icon={FileText} accent="#4F8CFF" />
        <StatCard label={t('cards.citationImpact')} value="52.1M" change="+35.7%" Icon={TrendingUp} accent="#8B5CF6" />
        <StatCard label={t('cards.fieldDistribution')} value="284K" change="+8.2%" Icon={Users} accent="#00D1B2" />
        <StatCard label={t('cards.geographicDistribution')} value="9.4" change="+0.8" Icon={Star} accent="#F59E0B" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Neo4jGraphCard />

        <div className="rounded-xl border p-5 bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/5 transition-colors duration-300 shadow-sm dark:shadow-none">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{t('cards.fieldDistribution')}</h3>
          <p className="text-xs mb-4 text-gray-500 dark:text-[#A0AEC0]">{t('charts.citationsPerField')}</p>

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={FIELD_DATA}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={82}
                dataKey="v"
                stroke="none"
                paddingAngle={3}
              >
                {FIELD_DATA.map((f, i) => (
                  <Cell key={i} fill={f.c} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#131A2A',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 11,
                  color: '#fff'
                }}
                formatter={(v) => [`${v}%`, 'Share']}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex flex-wrap gap-3 mt-1 justify-center">
            {FIELD_DATA.map((f) => (
              <div key={f.n} className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-sm" style={{ background: f.c }} />
                <span className="text-gray-500 dark:text-[#A0AEC0]">
                  {f.n}{' '}
                  <span className="font-semibold" style={{ color: f.c, fontFamily: "'JetBrains Mono', monospace" }}>{f.v}%</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
