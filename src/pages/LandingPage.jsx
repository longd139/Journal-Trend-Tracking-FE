import { motion } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  YAxis,
} from 'recharts';
import {
  ArrowRight,
  TrendingUp,
  Brain,
  Zap,
  ArrowUpRight,
  Microscope,
  Globe,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// Import Data
import {
  PARTICLES,
  PUB_DATA,
  INSIGHTS,
  FEATURES,
  APIS,
} from '../constants/mockData';

// Import Shared Components
import { SectionBadge, StatusPill } from '../components/SharedUI';

export default function LandingPage() {
  const navigate = useNavigate();

  // Hàm xử lý chung: Tất cả các nút điều hướng về trang Auth để bắt buộc chọn Role trước
  const handleAuthRedirect = () => {
    navigate('/auth'); // Đảm bảo ông có route '/auth' trỏ tới AuthPage
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: '#0B1020', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Navbar */}
      <nav
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 lg:px-10 py-4 border-b"
        style={{
          background: 'rgba(11,16,32,0.85)',
          backdropFilter: 'blur(16px)',
          borderColor: 'rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)',
            }}
          >
            <Microscope size={13} className="text-white" />
          </div>
          <span
            className="text-sm font-black text-white tracking-widest"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            SCITRACK
          </span>
        </div>
        <div
          className="hidden md:flex items-center gap-7 text-sm font-medium"
          style={{ color: '#A0AEC0' }}
        >
          {['Trends', 'Features', 'Integrations'].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="hover:text-white transition-colors"
            >
              {l}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAuthRedirect} // Chỉnh lại chuyển hướng
            className="px-4 py-2 text-sm font-medium rounded-lg border transition-all hover:text-white"
            style={{
              color: '#A0AEC0',
              borderColor: 'rgba(255,255,255,0.12)',
            }}
          >
            Log in
          </button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAuthRedirect} // Chỉnh lại chuyển hướng
            className="px-4 py-2 text-sm font-bold rounded-lg text-white"
            style={{
              background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)',
            }}
          >
            Get Started
          </motion.button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Ambient glows (Giữ nguyên) */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/4 left-1/4 w-[480px] h-[480px] rounded-full blur-3xl opacity-[0.14]"
            style={{ background: '#4F8CFF' }}
          />
          <div
            className="absolute bottom-1/3 right-1/5 w-96 h-96 rounded-full blur-3xl opacity-10"
            style={{ background: '#8B5CF6' }}
          />
          <div
            className="absolute bottom-0 left-1/2 w-72 h-72 rounded-full blur-3xl opacity-10"
            style={{ background: '#00D1B2' }}
          />
          {PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.left}%`,
                top: `${p.top}%`,
                background: p.color,
                opacity: 0.2,
              }}
              animate={{ y: [0, -28, 0], opacity: [0.15, 0.38, 0.15] }}
              transition={{
                duration: p.dur,
                delay: p.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left col */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6 border"
              style={{
                background: '#4F8CFF1A',
                color: '#4F8CFF',
                borderColor: '#4F8CFF44',
              }}
            >
              <Zap size={10} /> AI-Powered Academic Intelligence Platform
            </div>
            <h1
              className="text-5xl lg:text-6xl font-black leading-[1.05] mb-6"
              style={{
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: '-0.025em',
              }}
            >
              <span className="text-white">Track the Future</span>
              <br />
              <span
                style={{
                  background:
                    'linear-gradient(135deg, #4F8CFF 0%, #8B5CF6 50%, #00D1B2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                of Scientific
              </span>
              <br />
              <span className="text-white">Research</span>
            </h1>
            <p
              className="text-base lg:text-lg mb-8 leading-relaxed"
              style={{ color: '#A0AEC0', maxWidth: 480 }}
            >
              Analyze publication trends, discover emerging research topics, and
              visualize academic intelligence with AI-powered analytics across
              50M+ papers.
            </p>
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAuthRedirect} // Chỉnh lại chuyển hướng
                className="px-6 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)',
                }}
              >
                Explore Trends <ArrowRight size={15} />
              </motion.button>
            </div>
            <div
              className="flex gap-10 mt-10 pt-8 border-t"
              style={{ borderColor: 'rgba(255,255,255,0.07)' }}
            >
              {[
                { v: '50M+', l: 'Research Papers' },
                { v: '4 APIs', l: 'Live Data Sources' },
                { v: '98.7%', l: 'System Uptime' },
              ].map((s) => (
                <div key={s.l}>
                  <div
                    className="text-2xl font-black text-white"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {s.v}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: '#A0AEC0' }}>
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right col — Dashboard preview (Giữ nguyên) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div
              className="rounded-2xl border p-5 relative overflow-hidden"
              style={{
                background: 'rgba(27,34,53,0.92)',
                borderColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-white">
                  Publication Trends — 2024
                </span>
                <span
                  className="text-xs font-semibold flex items-center gap-1.5"
                  style={{
                    color: '#00D1B2',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  Live
                </span>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={PUB_DATA.slice(-6)}>
                  <defs>
                    <linearGradient id="hgAI" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F8CFF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4F8CFF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="hgBio" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="hgCli" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#00D1B2"
                        stopOpacity={0.25}
                      />
                      <stop offset="95%" stopColor="#00D1B2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="m"
                    tick={{ fill: '#A0AEC0', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#131A2A',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ai"
                    stroke="#4F8CFF"
                    fill="url(#hgAI)"
                    strokeWidth={2}
                    name="AI & ML"
                  />
                  <Area
                    type="monotone"
                    dataKey="bio"
                    stroke="#8B5CF6"
                    fill="url(#hgBio)"
                    strokeWidth={2}
                    name="Biotech"
                  />
                  <Area
                    type="monotone"
                    dataKey="cli"
                    stroke="#00D1B2"
                    fill="url(#hgCli)"
                    strokeWidth={2}
                    name="Climate"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { l: 'AI & ML', v: '7,200', c: '#4F8CFF', d: '+18%' },
                  { l: 'Biotech', v: '3,680', c: '#8B5CF6', d: '+12%' },
                  { l: 'Climate', v: '2,720', c: '#00D1B2', d: '+24%' },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="rounded-lg p-2.5 text-center"
                    style={{ background: '#131A2A' }}
                  >
                    <div
                      className="text-[10px] mb-1"
                      style={{ color: '#A0AEC0' }}
                    >
                      {s.l}
                    </div>
                    <div
                      className="text-base font-black text-white"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {s.v}
                    </div>
                    <div
                      className="text-[10px] font-semibold"
                      style={{
                        color: s.c,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {s.d}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating AI insight card (Giữ nguyên) */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -top-8 -right-6 rounded-xl p-4 border w-52"
              style={{
                background: 'rgba(27,34,53,0.97)',
                borderColor: 'rgba(79,140,255,0.35)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Brain size={13} style={{ color: '#00D1B2' }} />
                <span className="text-[10px] font-bold text-white">
                  AI Insight
                </span>
              </div>
              <p
                className="text-[10px] leading-relaxed"
                style={{ color: '#A0AEC0' }}
              >
                <span style={{ color: '#4F8CFF' }}>LLM research</span> surged{' '}
                <span
                  style={{
                    color: '#00D1B2',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  +234%
                </span>{' '}
                — now the fastest-growing field in 2024.
              </p>
            </motion.div>

            {/* Floating citation card (Giữ nguyên) */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1.2,
              }}
              className="absolute -bottom-8 -left-6 rounded-xl p-4 border"
              style={{
                background: 'rgba(27,34,53,0.97)',
                borderColor: 'rgba(0,209,178,0.3)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div className="text-[10px] mb-1" style={{ color: '#A0AEC0' }}>
                Total Citations 2024
              </div>
              <div
                className="text-3xl font-black text-white"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                52.1M
              </div>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight size={11} style={{ color: '#00D1B2' }} />
                <span
                  className="text-[10px] font-semibold"
                  style={{
                    color: '#00D1B2',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  +35.7% YoY
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trending Showcase (Giữ nguyên nội dung bên trong) */}
      <section
        id="trends"
        className="py-24 px-6 lg:px-10"
        style={{ background: '#131A2A' }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <SectionBadge color="#8B5CF6">
              <TrendingUp size={11} /> Live Trend Analytics
            </SectionBadge>
            <h2
              className="text-4xl font-black text-white mb-3"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Publication Velocity by Field
            </h2>
            <p style={{ color: '#A0AEC0' }}>
              Monthly paper counts across major research disciplines — 2024
            </p>
          </motion.div>

          {/* ... (Đoạn AreaChart và INSIGHTS giữ nguyên) ... */}
           <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border p-6 mb-8"
            style={{
              background: '#1B2235',
              borderColor: 'rgba(255,255,255,0.07)',
            }}
          >
            <div className="flex flex-wrap gap-5 mb-4">
              {[
                { k: 'ai', c: '#4F8CFF', l: 'AI & ML' },
                { k: 'bio', c: '#8B5CF6', l: 'Biotechnology' },
                { k: 'cli', c: '#00D1B2', l: 'Climate Science' },
                { k: 'qc', c: '#F59E0B', l: 'Quantum Computing' },
              ].map((f) => (
                <div
                  key={f.k}
                  className="flex items-center gap-1.5 text-xs"
                  style={{
                    color: '#A0AEC0',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ background: f.c }}
                  />
                  {f.l}
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={PUB_DATA}>
                <defs>
                  {[
                    { id: 'lai', c: '#4F8CFF' },
                    { id: 'lbio', c: '#8B5CF6' },
                    { id: 'lcli', c: '#00D1B2' },
                    { id: 'lqc', c: '#F59E0B' },
                  ].map((g) => (
                    <linearGradient
                      key={g.id}
                      id={g.id}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={g.c} stopOpacity={0.22} />
                      <stop offset="95%" stopColor={g.c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                />
                <XAxis
                  dataKey="m"
                  tick={{ fill: '#A0AEC0', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#A0AEC0', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip
                  contentStyle={{
                    background: '#131A2A',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="ai"
                  stroke="#4F8CFF"
                  fill="url(#lai)"
                  strokeWidth={2}
                  name="AI & ML"
                />
                <Area
                  type="monotone"
                  dataKey="bio"
                  stroke="#8B5CF6"
                  fill="url(#lbio)"
                  strokeWidth={2}
                  name="Biotech"
                />
                <Area
                  type="monotone"
                  dataKey="cli"
                  stroke="#00D1B2"
                  fill="url(#lcli)"
                  strokeWidth={2}
                  name="Climate"
                />
                <Area
                  type="monotone"
                  dataKey="qc"
                  stroke="#F59E0B"
                  fill="url(#lqc)"
                  strokeWidth={2}
                  name="Quantum"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INSIGHTS.map((ins, i) => (
              <motion.div
                key={ins.topic}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.09 }}
                whileHover={{ y: -5 }}
                className="rounded-xl border p-5 cursor-default"
                style={{
                  background: '#1B2235',
                  borderColor: 'rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${ins.c}1A` }}
                  >
                    <TrendingUp size={14} style={{ color: ins.c }} />
                  </div>
                  <span
                    className="text-sm font-black"
                    style={{
                      color: ins.c,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {ins.growth}
                  </span>
                </div>
                <div className="text-sm font-bold text-white mb-1.5">
                  {ins.topic}
                </div>
                <div
                  className="text-xs leading-relaxed mb-3"
                  style={{ color: '#A0AEC0' }}
                >
                  {ins.desc}
                </div>
                <div
                  className="text-xs"
                  style={{
                    color: '#6B7280',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {ins.papers.toLocaleString()} papers
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features (Giữ nguyên nội dung bên trong) */}
      <section id="features" className="py-24 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <SectionBadge color="#00D1B2">
              <Zap size={11} /> Platform Capabilities
            </SectionBadge>
            <h2
              className="text-4xl font-black text-white mb-3"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Built for Academic Excellence
            </h2>
            <p style={{ color: '#A0AEC0' }}>
              Everything you need to navigate the scientific literature
              landscape at scale
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ Icon, label, desc, c }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="rounded-xl border p-6 cursor-default"
                style={{
                  background: '#1B2235',
                  borderColor: 'rgba(255,255,255,0.07)',
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${c}1A` }}
                >
                  <Icon size={20} style={{ color: c }} />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{label}</h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: '#A0AEC0' }}
                >
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* API Integrations (Giữ nguyên nội dung bên trong) */}
      <section
        id="integrations"
        className="py-24 px-6 lg:px-10"
        style={{ background: '#131A2A' }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <SectionBadge color="#4F8CFF">
              <Globe size={11} /> Live Integrations
            </SectionBadge>
            <h2
              className="text-4xl font-black text-white mb-3"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Connected to Leading Databases
            </h2>
            <p style={{ color: '#A0AEC0' }}>
              Real-time synchronization with the world's major academic
              repositories
            </p>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {APIS.map((api, i) => (
              <motion.div
                key={api.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="rounded-xl border p-5"
                style={{
                  background: '#1B2235',
                  borderColor: 'rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: '#4F8CFF1A' }}
                  >
                    <Globe size={16} style={{ color: '#4F8CFF' }} />
                  </div>
                  <StatusPill status={api.status} />
                </div>
                <div className="text-sm font-bold text-white mb-3">
                  {api.name}
                </div>
                <div className="space-y-1.5">
                  {[
                    { l: 'Uptime', v: `${api.up}%`, c: '#00D1B2' },
                    { l: 'Latency', v: api.lat, c: 'white' },
                    { l: 'Req / day', v: api.req, c: 'white' },
                  ].map((s) => (
                    <div key={s.l} className="flex justify-between text-xs">
                      <span style={{ color: '#A0AEC0' }}>{s.l}</span>
                      <span
                        className="font-semibold"
                        style={{
                          color: s.c,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {s.v}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[320px] rounded-full blur-3xl opacity-12"
            style={{
              background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)',
            }}
          />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className="text-5xl font-black text-white mb-5"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Start Exploring Scientific Trends
            </h2>
            <p className="text-lg mb-10" style={{ color: '#A0AEC0' }}>
              Join 12,000+ researchers using SciTrack to navigate the future of
              academic publishing.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                {
                  label: 'Login',
                  action: handleAuthRedirect, // Chỉnh lại chuyển hướng
                  style: {
                    background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)',
                  },
                  text: 'text-white',
                },
              ].map((b) => (
                <motion.button
                  key={b.label}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={b.action}
                  className={`px-8 py-3.5 rounded-xl text-sm font-bold ${b.text}`}
                  style={b.style}
                >
                  {b.label}
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAuthRedirect} // Nút Explore Dashboard cũng đưa về Auth luôn
                className="px-8 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2"
                style={{
                  color: '#00D1B2',
                  background: '#00D1B21A',
                  border: '1px solid #00D1B244',
                }}
              >
                Explore Dashboard <ArrowRight size={14} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer (Giữ nguyên) */}
      <footer
        className="border-t py-8 px-6"
        style={{
          background: '#131A2A',
          borderColor: 'rgba(255,255,255,0.07)',
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)',
              }}
            >
              <Microscope size={10} className="text-white" />
            </div>
            <span
              className="text-xs font-black text-white tracking-widest"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              SCITRACK
            </span>
          </div>
          <p className="text-xs" style={{ color: '#A0AEC0' }}>
            © 2026 SciTrack — AI-Powered Academic Research Analytics Platform
          </p>
        </div>
      </footer>
    </div>
  );
}