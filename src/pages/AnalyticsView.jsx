import { motion } from 'framer-motion';
import { FileText, TrendingUp, Users, Star } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell, PieChart, Pie } from 'recharts';

// ==========================================
// 1. COMPONENT BỊ THIẾU
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

// ==========================================
// 2. DỮ LIỆU GIẢ BỊ THIẾU
// ==========================================
const FIELD_DATA = [
  { n: 'AI & ML', v: 45, c: '#4F8CFF' },
  { n: 'Biotech', v: 30, c: '#8B5CF6' },
  { n: 'Climate', v: 25, c: '#00D1B2' }
];

const CIT_DATA = [
  { y: '2019', v: 12.5 },
  { y: '2020', v: 18.2 },
  { y: '2021', v: 25.4 },
  { y: '2022', v: 34.1 },
  { y: '2023', v: 45.8 },
  { y: '2024', v: 52.1 }
];

// ==========================================
// 3. GIAO DIỆN CHÍNH (Đã thêm export default)
// ==========================================
export default function AnalyticsView() {
  return (
    <div className="space-y-6 p-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Publications"
          value="50.2M"
          change="+14%"
          Icon={FileText}
          accent="#4F8CFF"
        />
        <StatCard
          label="Citation Index"
          value="52.1M"
          change="+35.7%"
          Icon={TrendingUp}
          accent="#8B5CF6"
        />
        <StatCard
          label="Active Researchers"
          value="284K"
          change="+8.2%"
          Icon={Users}
          accent="#00D1B2"
        />
        <StatCard
          label="Impact Score"
          value="9.4"
          change="+0.8"
          Icon={Star}
          accent="#F59E0B"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Biểu đồ Cột */}
        <div
          className="rounded-xl border p-5"
          style={{
            background: '#1B2235',
            borderColor: 'rgba(255,255,255,0.07)',
          }}
        >
          <h3 className="text-sm font-bold text-white mb-1">
            Citation Growth (Global)
          </h3>
          <p className="text-xs mb-4" style={{ color: '#A0AEC0' }}>
            Total citations indexed 2019–2024
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CIT_DATA}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="y"
                tick={{ fill: '#A0AEC0', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#A0AEC0', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                unit="M"
                width={40}
              />
              <Tooltip
                contentStyle={{
                  background: '#0B1020',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 11,
                }}
                formatter={(v) => [`${v}M`, 'Citations']}
              />
              <Bar dataKey="v" radius={[4, 4, 0, 0]} name="Citations">
                {CIT_DATA.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === CIT_DATA.length - 1 ? '#4F8CFF' : '#4F8CFF44'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Biểu đồ Tròn */}
        <div
          className="rounded-xl border p-5"
          style={{
            background: '#1B2235',
            borderColor: 'rgba(255,255,255,0.07)',
          }}
        >
          <h3 className="text-sm font-bold text-white mb-1">
            Field Distribution
          </h3>
          <p className="text-xs mb-4" style={{ color: '#A0AEC0' }}>
            Share of total publications by research area
          </p>
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
                  background: '#0B1020',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 11,
                }}
                formatter={(v) => [`${v}%`, 'Share']}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Chú thích biểu đồ */}
          <div className="flex flex-wrap gap-3 mt-1 justify-center">
            {FIELD_DATA.map((f) => (
              <div key={f.n} className="flex items-center gap-1.5 text-xs">
                <span
                  className="w-2 h-2 rounded-sm"
                  style={{ background: f.c }}
                />
                <span style={{ color: '#A0AEC0' }}>
                  {f.n}{' '}
                  <span
                    className="font-semibold"
                    style={{
                      color: f.c,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {f.v}%
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}