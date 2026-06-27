import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { AreaChart, Area, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, YAxis, PieChart, Pie, Cell } from 'recharts';
import { FileText, TrendingUp, Star, Users, Bookmark, BookOpen, Wifi, Cpu, ArrowUpRight, Sparkles } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   Mock Data
   ═══════════════════════════════════════════════════════════════════════════ */

const ACADEMIC_TRENDS = [
  { m: 'Jan', iot: 120, emb: 80, ai: 40 }, { m: 'Feb', iot: 150, emb: 90, ai: 45 },
  { m: 'Mar', iot: 180, emb: 110, ai: 60 }, { m: 'Apr', iot: 220, emb: 130, ai: 75 },
  { m: 'May', iot: 280, emb: 150, ai: 90 }, { m: 'Jun', iot: 310, emb: 160, ai: 110 }
];
const ACADEMIC_FIELDS = [
  { n: 'IoT Systems', v: 45, c: '#DEDBC8' },
  { n: 'Embedded C/C++', v: 35, c: '#A09878' },
  { n: 'Hardware AI', v: 20, c: '#E1E0CC' }
];
const RECOMMENDED_PAPERS = [
  { title: 'Smart Pet Feeding & Water Monitoring System via WiFi', authors: 'Nguyen et al.', year: 2026, citations: 124, field: 'IoT Systems', trend: 'Trending' },
  { title: 'Optimizing Power Consumption in ESP8266 Microcontrollers', authors: 'Smith, J.', year: 2025, citations: 892, field: 'Embedded C/C++', trend: 'Stable' },
  { title: 'Real-time Temperature Calibration using DHT11 & LM35', authors: 'Chen, S.', year: 2025, citations: 456, field: 'IoT Systems', trend: 'Rising' },
];

const MY_CITATIONS_HISTORY = [
  { y: '2021', citations: 45 }, { y: '2022', citations: 120 },
  { y: '2023', citations: 350 }, { y: '2024', citations: 680 },
  { y: '2025', citations: 950 }, { y: '2026', citations: 1284 }
];
const MY_RESEARCH_FIELDS = [
  { n: 'Wireless Sensors', v: 60, c: '#DEDBC8' },
  { n: 'Edge Computing', v: 40, c: '#EF4444' }
];
const MY_PUBLICATIONS = [
  { title: 'A Novel Architecture for Distributed Edge Devices', journal: 'IEEE Internet of Things', year: 2026, citations: 342, role: 'First Author' },
  { title: 'Low-latency Protocols for Automated Feeding Mechanisms', journal: 'Sensors', year: 2025, citations: 512, role: 'Co-Author' },
  { title: 'Security Vulnerabilities in Early Arduino Deployments', journal: 'ACM Embedded', year: 2024, citations: 430, role: 'First Author' },
];

/* ═══════════════════════════════════════════════════════════════════════════
   Shared Components
   ═══════════════════════════════════════════════════════════════════════════ */

function StatCard({ label, value, change, Icon, accent, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group p-5 rounded-2xl border flex flex-col gap-3 bg-[#101010] border-[#DEDBC8]/5 hover:border-[#DEDBC8]/15 transition-colors duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="p-2.5 rounded-xl" style={{ background: `${accent}15`, color: accent }}>
          <Icon size={20} />
        </div>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${change.startsWith('+') ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
          {change}
        </span>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-[#E1E0CC]">{value}</p>
      </div>
    </motion.div>
  );
}

function GlowBadge({ color, children }) {
  return (
    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap"
      style={{ background: `${color}12`, color: color, borderColor: `${color}25` }}>
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   User Overview Page
   ═══════════════════════════════════════════════════════════════════════════ */

export default function UserOverviewPage() {
  const { t } = useTranslation('dashboard');
  const role = sessionStorage.getItem('userRole') || 'academic';
  const isResearcher = role === 'researcher';

  const statCards = isResearcher
    ? [
      { label: t('user.totalCitations'), value: '1,284', change: '+12%', Icon: TrendingUp, accent: '#DEDBC8' },
      { label: t('user.publishedPapers'), value: '18', change: '+2', Icon: FileText, accent: '#DEDBC8' },
      { label: t('user.hIndex'), value: '14', change: '+1', Icon: Star, accent: '#E1E0CC' },
      { label: 'Co-authors', value: '42', change: '+3', Icon: Users, accent: '#A09878' },
    ]
    : [
      { label: 'Saved Papers', value: '24', change: '+5', Icon: Bookmark, accent: '#DEDBC8' },
      { label: 'Papers Read', value: '128', change: '+18%', Icon: BookOpen, accent: '#DEDBC8' },
      { label: 'IoT Topics', value: '15', change: '+2%', Icon: Wifi, accent: '#A09878' },
      { label: 'Hardware Insights', value: '34', change: '+12%', Icon: Cpu, accent: '#E1E0CC' },
    ];

  const pieData = isResearcher ? MY_RESEARCH_FIELDS : ACADEMIC_FIELDS;
  const chartData = isResearcher ? MY_CITATIONS_HISTORY : ACADEMIC_TRENDS;
  const tableData = isResearcher ? MY_PUBLICATIONS : RECOMMENDED_PAPERS;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* ─── Hero Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-[#DEDBC8]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#DEDBC8]/70">Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#E1E0CC]">
            {isResearcher ? 'Your Research Impact' : 'Research Explorer'}
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 max-w-lg">
            {isResearcher
              ? 'Track your publication metrics, citations, and global academic reach in real time.'
              : 'Discover trending topics in embedded systems and organize your academic journey.'}
          </p>
        </motion.div>

        {/* ─── Stat Cards ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => <StatCard key={i} index={i} {...stat} />)}
        </div>

        {/* ─── Charts Row ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="lg:col-span-2 rounded-2xl border p-6 bg-[#101010] border-[#DEDBC8]/5"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-[#E1E0CC]">
                  {isResearcher ? t('user.researchImpact') : t('user.publicationTrends')}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isResearcher ? 'Total citations received per year' : 'Monthly papers in IoT & Embedded fields'}
                </p>
              </div>
              <ArrowUpRight size={16} className="text-[#DEDBC8]/50" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              {isResearcher ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-5" vertical={false} />
                  <XAxis dataKey="y" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
                  <Tooltip cursor={{ fill: 'rgba(222,219,200,0.04)' }} contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, fontSize: 12, color: '#E1E0CC' }} />
                  <Bar dataKey="citations" fill="#DEDBC8" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              ) : (
                <AreaChart data={chartData}>
                  <defs>
                    {[{ id: 'ga1', c: '#DEDBC8' }, { id: 'ga2', c: '#A09878' }, { id: 'ga3', c: '#E1E0CC' }].map((g) => (
                      <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={g.c} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={g.c} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-5" />
                  <XAxis dataKey="m" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, fontSize: 12, color: '#E1E0CC' }} />
                  <Area type="monotone" dataKey="iot" stroke="#DEDBC8" fill="url(#ga1)" strokeWidth={2} name="IoT" />
                  <Area type="monotone" dataKey="emb" stroke="#A09878" fill="url(#ga2)" strokeWidth={2} name="Embedded" />
                  <Area type="monotone" dataKey="ai" stroke="#E1E0CC" fill="url(#ga3)" strokeWidth={2} name="AI" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="rounded-2xl border p-6 bg-[#101010] border-[#DEDBC8]/5 flex flex-col"
          >
            <h3 className="text-sm font-bold text-[#E1E0CC] mb-4">
              {isResearcher ? t('user.researchFields') : 'Field Distribution'}
            </h3>
            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="v" stroke="none" paddingAngle={3}>
                    {pieData.map((f, i) => <Cell key={i} fill={f.c} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, fontSize: 12, color: '#E1E0CC' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2.5 mt-2">
              {pieData.map((f) => (
                <div key={f.n} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: f.c }} />
                    <span className="text-gray-400">{f.n}</span>
                  </div>
                  <span className="font-bold" style={{ color: f.c }}>{f.v}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ─── Publications / Recommendations Table ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="rounded-2xl border overflow-hidden bg-[#101010] border-[#DEDBC8]/5"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#DEDBC8]/5">
            <div>
              <h3 className="text-sm font-bold text-[#E1E0CC]">
                {isResearcher ? t('user.recentPublications') : 'Recommended Papers'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {isResearcher ? 'Your latest published research' : 'Curated picks based on your interests'}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              {isResearcher ? (
                <>
                  <thead>
                    <tr className="border-b border-[#DEDBC8]/5">
                      {['Paper Title', 'Journal', 'Year', 'Role', 'Citations'].map((h) =>
                        <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((p, i) => (
                      <motion.tr key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.08 }}
                        className="border-b border-[#DEDBC8]/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4"><span className="text-sm font-semibold text-[#E1E0CC] block max-w-xs truncate">{p.title}</span></td>
                        <td className="px-6 py-4 text-xs text-[#DEDBC8] font-medium">{p.journal}</td>
                        <td className="px-6 py-4 text-xs text-gray-400">{p.year}</td>
                        <td className="px-6 py-4"><GlowBadge color={p.role === 'First Author' ? '#E1E0CC' : '#A09878'}>{p.role}</GlowBadge></td>
                        <td className="px-6 py-4 text-sm font-bold text-[#E1E0CC]">{p.citations}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </>
              ) : (
                <>
                  <thead>
                    <tr className="border-b border-[#DEDBC8]/5">
                      {['Title', 'Authors', 'Year', 'Field', 'Citations'].map((h) =>
                        <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((p, i) => (
                      <motion.tr key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.08 }}
                        className="border-b border-[#DEDBC8]/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4"><span className="text-sm font-semibold text-[#E1E0CC] block max-w-[280px] truncate">{p.title}</span></td>
                        <td className="px-6 py-4 text-xs text-gray-400">{p.authors}</td>
                        <td className="px-6 py-4 text-xs text-gray-400">{p.year}</td>
                        <td className="px-6 py-4"><GlowBadge color={ACADEMIC_FIELDS.find(f => f.n === p.field)?.c ?? '#DEDBC8'}>{p.field}</GlowBadge></td>
                        <td className="px-6 py-4 text-sm font-bold text-[#E1E0CC]">{p.citations}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
