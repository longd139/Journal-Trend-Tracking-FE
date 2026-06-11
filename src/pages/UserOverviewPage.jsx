import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { AreaChart, Area, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, YAxis, PieChart, Pie, Cell } from 'recharts';
import { FileText, TrendingUp, Hash, Brain, Filter, Download, Star, Users, Bookmark, Cpu, Wifi, BookOpen } from 'lucide-react';

const StatCard = ({ label, value, change, Icon, accent }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="p-5 rounded-xl border flex flex-col justify-between bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/5 transition-colors duration-300 shadow-sm dark:shadow-none"
  >
    <div className="flex items-start justify-between mb-2">
      <div className="p-2 rounded-lg" style={{ background: `${accent}1A`, color: accent }}>
        <Icon size={18} />
      </div>
      <span
        className="text-xs font-bold px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5"
        style={{ color: change.startsWith('+') ? '#00D1B2' : '#EF4444' }}
      >
        {change}
      </span>
    </div>
    <div>
      <h4 className="text-[11px] font-semibold tracking-wider uppercase mb-1 text-gray-500 dark:text-[#A0AEC0]">{label}</h4>
      <div className="text-2xl font-black text-gray-900 dark:text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
    </div>
  </motion.div>
);

const GlowBadge = ({ color, children }) => (
  <span
    className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap"
    style={{ background: `${color}10`, color: color, borderColor: `${color}25`, textShadow: `0 0 10px ${color}40` }}
  >
    {children}
  </span>
);

const ACADEMIC_TRENDS = [
  { m: 'Jan', iot: 120, emb: 80, ai: 40 }, { m: 'Feb', iot: 150, emb: 90, ai: 45 },
  { m: 'Mar', iot: 180, emb: 110, ai: 60 }, { m: 'Apr', iot: 220, emb: 130, ai: 75 },
  { m: 'May', iot: 280, emb: 150, ai: 90 }, { m: 'Jun', iot: 310, emb: 160, ai: 110 }
];
const ACADEMIC_FIELDS = [
  { n: 'IoT Systems', v: 45, c: '#4F8CFF' },
  { n: 'Embedded C/C++', v: 35, c: '#00D1B2' },
  { n: 'Hardware AI', v: 20, c: '#F59E0B' }
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
  { n: 'Wireless Sensors', v: 60, c: '#8B5CF6' },
  { n: 'Edge Computing', v: 40, c: '#EF4444' }
];
const MY_PUBLICATIONS = [
  { title: 'A Novel Architecture for Distributed Edge Devices', journal: 'IEEE Internet of Things', year: 2026, citations: 342, role: 'First Author' },
  { title: 'Low-latency Protocols for Automated Feeding Mechanisms', journal: 'Sensors', year: 2025, citations: 512, role: 'Co-Author' },
  { title: 'Security Vulnerabilities in Early Arduino Deployments', journal: 'ACM Embedded', year: 2024, citations: 430, role: 'First Author' },
];

export default function UserOverviewPage() {
  const { t } = useTranslation('dashboard');
  const role = sessionStorage.getItem('userRole') || 'academic';
  const isResearcher = role === 'researcher';

  const statCards = isResearcher
    ? [
        { label: t('user.totalCitations'), value: '1,284', change: '+12%', Icon: TrendingUp, accent: '#4F8CFF' },
        { label: t('user.publishedPapers'), value: '18', change: '+2', Icon: FileText, accent: '#8B5CF6' },
        { label: t('user.hIndex'), value: '14', change: '+1', Icon: Star, accent: '#F59E0B' },
        { label: 'Co-authors', value: '42', change: '+3', Icon: Users, accent: '#00D1B2' },
      ]
    : [
        { label: 'Saved Papers', value: '24', change: '+5', Icon: Bookmark, accent: '#4F8CFF' },
        { label: 'Papers Read', value: '128', change: '+18%', Icon: BookOpen, accent: '#8B5CF6' },
        { label: 'IoT Topics', value: '15', change: '+2%', Icon: Wifi, accent: '#00D1B2' },
        { label: 'Hardware Insights', value: '34', change: '+12%', Icon: Cpu, accent: '#F59E0B' },
      ];

  const pieData = isResearcher ? MY_RESEARCH_FIELDS : ACADEMIC_FIELDS;

  return (
    <div className="w-full h-full min-h-screen p-8 space-y-6 overflow-y-auto bg-gray-50 dark:bg-[#0B1020] transition-colors duration-300">
      <div className="mb-2 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            {isResearcher ? t('user.publicationTrends') : t('user.researchFields')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isResearcher ? 'Track your publication metrics and global academic reach.' : 'Discover trends in embedded systems and organize your research.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => <StatCard key={index} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-xl border p-5 bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {isResearcher ? t('user.researchImpact') : t('user.publicationTrends')}
              </h3>
              <p className="text-xs mt-0.5 text-gray-500 dark:text-[#A0AEC0]">
                {isResearcher ? 'Total citations received per year' : 'Monthly papers in IoT & Embedded fields'}
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            {isResearcher ? (
              <BarChart data={MY_CITATIONS_HISTORY}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-white/5" vertical={false} />
                <XAxis dataKey="y" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }} contentStyle={{ background: '#1B2235', border: 'none', borderRadius: 8, fontSize: 11, color: '#fff' }} />
                <Bar dataKey="citations" fill="#4F8CFF" radius={[4, 4, 0, 0]} name="Citations" />
              </BarChart>
            ) : (
              <AreaChart data={ACADEMIC_TRENDS}>
                <defs>
                  {[{ id: 'oa1', c: '#4F8CFF' }, { id: 'oa2', c: '#00D1B2' }, { id: 'oa3', c: '#F59E0B' }].map((g) => (
                    <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={g.c} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={g.c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-white/5" />
                <XAxis dataKey="m" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ background: '#1B2235', border: 'none', borderRadius: 8, fontSize: 11, color: '#fff' }} />
                <Area type="monotone" dataKey="iot" stroke="#4F8CFF" fill="url(#oa1)" strokeWidth={2} name="IoT Systems" />
                <Area type="monotone" dataKey="emb" stroke="#00D1B2" fill="url(#oa2)" strokeWidth={2} name="Embedded C/C++" />
                <Area type="monotone" dataKey="ai" stroke="#F59E0B" fill="url(#oa3)" strokeWidth={2} name="Hardware AI" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border p-5 bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none transition-colors duration-300">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
            {isResearcher ? t('user.researchFields') : t('user.fieldDistribution')}
          </h3>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="v" stroke="none" paddingAngle={2}>
                {pieData.map((f, i) => <Cell key={i} fill={f.c} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1B2235', border: 'none', borderRadius: 8, fontSize: 11, color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {pieData.map((f) => (
              <div key={f.n} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: f.c }} />
                  <span className="text-gray-600 dark:text-[#A0AEC0]">{f.n}</span>
                </div>
                <span className="font-semibold" style={{ color: f.c, fontFamily: "'JetBrains Mono', monospace" }}>{f.v}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none transition-colors duration-300">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-white/5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            {isResearcher ? t('user.recentPublications') : t('user.trendingTopics')}
          </h3>
          <div className="flex gap-2">
            <button className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#131A2A] dark:text-[#A0AEC0] dark:hover:bg-white/5">
              <Filter size={11} /> Filter
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            {isResearcher ? (
              <>
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/5">
                    {['Paper Title', 'Journal', 'Year', 'Role', 'Citations'].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {MY_PUBLICATIONS.map((p, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5"><span className="text-xs font-semibold text-gray-900 dark:text-white block max-w-xs truncate">{p.title}</span></td>
                      <td className="px-5 py-3.5 text-xs text-[#4F8CFF] font-medium">{p.journal}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400 font-mono">{p.year}</td>
                      <td className="px-5 py-3.5"><GlowBadge color={p.role === 'First Author' ? '#F59E0B' : '#00D1B2'}>{p.role}</GlowBadge></td>
                      <td className="px-5 py-3.5 text-xs font-bold text-gray-900 dark:text-white font-mono">{p.citations}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            ) : (
              <>
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/5">
                    {['Title', 'Authors', 'Year', 'Field', 'Action'].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {RECOMMENDED_PAPERS.map((p, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5"><span className="text-xs font-semibold text-gray-900 dark:text-white block max-w-[250px] truncate">{p.title}</span></td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">{p.authors}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400 font-mono">{p.year}</td>
                      <td className="px-5 py-3.5"><GlowBadge color={ACADEMIC_FIELDS.find(f => f.n === p.field)?.c ?? '#4F8CFF'}>{p.field}</GlowBadge></td>
                      <td className="px-5 py-3.5">
                        <button className="text-xs font-semibold text-[#4F8CFF] hover:text-blue-700 dark:hover:text-white transition-colors bg-blue-50 dark:bg-[#4F8CFF]/10 px-3 py-1 rounded-md">Save</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
