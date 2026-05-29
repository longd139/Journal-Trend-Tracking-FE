import { useState } from "react";
import { motion } from "motion/react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Search, Bell, ArrowRight, TrendingUp, Brain, Database,
  Activity, Users, Settings, BarChart2, FileText, Globe,
  Zap, LogIn, Mail, Lock, Download, RefreshCw, CheckCircle,
  Server, Home, Cpu, Shield, Eye, Star, ArrowUpRight, Filter,
  AlertCircle, BookOpen, Lightbulb, X, Plus, MoreHorizontal,
  Microscope, Hash,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  size: ((i * 13) % 5) + 2,
  left: (i * 37 + 7) % 100,
  top: (i * 29 + 11) % 100,
  color: ["#4F8CFF", "#8B5CF6", "#00D1B2"][i % 3],
  delay: (i * 0.35) % 6,
  dur: ((i * 0.71) % 8) + 12,
}));

const FIELD_DATA = [
  { n: "AI & ML", v: 34, c: "#4F8CFF" },
  { n: "Biotech", v: 22, c: "#8B5CF6" },
  { n: "Climate", v: 18, c: "#00D1B2" },
  { n: "Quantum", v: 14, c: "#F59E0B" },
  { n: "Neuro", v: 12, c: "#EF4444" },
];

const PUB_DATA = [
  { m: "Jan", ai: 2840, bio: 1920, cli: 1340, qc: 890 },
  { m: "Feb", ai: 3120, bio: 2080, cli: 1480, qc: 960 },
  { m: "Mar", ai: 3580, bio: 2240, cli: 1580, qc: 1040 },
  { m: "Apr", ai: 3920, bio: 2380, cli: 1720, qc: 1120 },
  { m: "May", ai: 4210, bio: 2560, cli: 1840, qc: 1200 },
  { m: "Jun", ai: 4680, bio: 2720, cli: 1960, qc: 1320 },
  { m: "Jul", ai: 5100, bio: 2890, cli: 2080, qc: 1420 },
  { m: "Aug", ai: 5480, bio: 3040, cli: 2200, qc: 1540 },
  { m: "Sep", ai: 5890, bio: 3180, cli: 2340, qc: 1680 },
  { m: "Oct", ai: 6240, bio: 3350, cli: 2460, qc: 1800 },
  { m: "Nov", ai: 6780, bio: 3520, cli: 2580, qc: 1940 },
  { m: "Dec", ai: 7200, bio: 3680, cli: 2720, qc: 2100 },
];

const CIT_DATA = [
  { y: "2019", v: 8.2 }, { y: "2020", v: 12.4 }, { y: "2021", v: 18.9 },
  { y: "2022", v: 26.8 }, { y: "2023", v: 38.4 }, { y: "2024", v: 52.1 },
];

const PAPERS = [
  { title: "Scaling Laws for Neural Language Models", authors: "Kaplan, Brown et al.", year: 2024, citations: 2847, field: "AI & ML", trend: "+18%" },
  { title: "CRISPR-Cas9 Precision Editing in Rare Genetic Diseases", authors: "Zhang, Liu et al.", year: 2024, citations: 2341, field: "Biotech", trend: "+12%" },
  { title: "Climate Tipping Points and Cascade Effects in Global Ecosystems", authors: "Lenton et al.", year: 2024, citations: 1983, field: "Climate", trend: "+24%" },
  { title: "Fault-Tolerant Quantum Computing with Logical Qubits", authors: "Preskill, Harrow et al.", year: 2024, citations: 1654, field: "Quantum", trend: "+31%" },
  { title: "Neural Correlates of Conscious Awareness in Cortex", authors: "Koch, Friston et al.", year: 2024, citations: 1428, field: "Neuro", trend: "+9%" },
  { title: "AlphaFold3 Applications in Drug Target Discovery", authors: "Jumper, Hassabis et al.", year: 2024, citations: 1287, field: "AI & ML", trend: "+45%" },
];

const APIS = [
  { name: "Google Scholar", up: 98.7, lat: "1.2ms", req: "142.8K", status: "ok" },
  { name: "IEEE Xplore", up: 99.1, lat: "0.8ms", req: "98.4K", status: "ok" },
  { name: "Springer Link", up: 97.8, lat: "1.4ms", req: "76.2K", status: "warn" },
  { name: "Scopus API", up: 99.3, lat: "0.6ms", req: "112.0K", status: "ok" },
];

const USERS_TABLE = [
  { id: "U-001", name: "Dr. Sarah Chen", email: "s.chen@mit.edu", role: "Researcher", status: "active", last: "2 min ago", papers: 127 },
  { id: "U-002", name: "Prof. James Patel", email: "j.patel@stanford.edu", role: "Professor", status: "active", last: "15 min ago", papers: 284 },
  { id: "U-003", name: "Dr. Maria Santos", email: "m.santos@ox.ac.uk", role: "Researcher", status: "idle", last: "1 hr ago", papers: 93 },
  { id: "U-004", name: "Dr. Liu Wei", email: "l.wei@tsinghua.edu.cn", role: "Researcher", status: "active", last: "5 min ago", papers: 156 },
  { id: "U-005", name: "Prof. Anna Kowalski", email: "a.kowalski@eth.ch", role: "Professor", status: "offline", last: "2 days ago", papers: 312 },
  { id: "U-006", name: "Dr. Raj Sharma", email: "r.sharma@iit.ac.in", role: "Researcher", status: "active", last: "Just now", papers: 78 },
];

const INSIGHTS = [
  { topic: "Large Multimodal Models", growth: "+234%", papers: 1847, c: "#4F8CFF", desc: "Vision-language convergence enabling unprecedented cross-modal reasoning" },
  { topic: "mRNA Vaccine Platforms", growth: "+189%", papers: 1234, c: "#8B5CF6", desc: "Expanding beyond infectious disease into targeted cancer immunotherapy" },
  { topic: "Carbon Capture Tech", growth: "+156%", papers: 892, c: "#00D1B2", desc: "Direct air capture costs now below $200/tonne CO₂ at scale" },
  { topic: "Neuromorphic Computing", growth: "+143%", papers: 743, c: "#F59E0B", desc: "Brain-inspired chips achieving ultra-low-power edge AI deployment" },
];

const FEATURES = [
  { Icon: BarChart2, label: "Publication Analytics", desc: "Track trends across 50M+ papers from all major journals worldwide", c: "#4F8CFF" },
  { Icon: TrendingUp, label: "Citation Tracking", desc: "Monitor citation velocity and impact factor evolution in real time", c: "#8B5CF6" },
  { Icon: Brain, label: "AI Recommendations", desc: "GPT-powered research discovery tailored to your specific domain", c: "#00D1B2" },
  { Icon: Eye, label: "Research Visualization", desc: "Interactive knowledge graphs and citation network topology maps", c: "#F59E0B" },
  { Icon: Search, label: "Academic Search Engine", desc: "Semantic full-text search with context-aware relevance ranking", c: "#EF4444" },
  { Icon: Zap, label: "Trend Forecasting", desc: "Predictive models for emerging research directions and hot topics", c: "#8B5CF6" },
];

const DB_TABLES = [
  { name: "publications", rows: "50.2M", size: "840 GB", growth: "+2.1%", status: "ok" },
  { name: "citations", rows: "412.8M", size: "1.1 TB", growth: "+3.4%", status: "ok" },
  { name: "authors", rows: "8.4M", size: "120 GB", growth: "+1.2%", status: "ok" },
  { name: "journals", rows: "148K", size: "8.4 GB", growth: "+0.4%", status: "ok" },
  { name: "keywords", rows: "2.1M", size: "42 GB", growth: "+5.7%", status: "ok" },
  { name: "api_logs", rows: "890M", size: "340 GB", growth: "+8.2%", status: "warn" },
];

// ─── Shared atoms ─────────────────────────────────────────────────────────────
function GlowBadge({ children, color }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: `${color}1A`, color, border: `1px solid ${color}44` }}
    >
      {children}
    </span>
  );
}

function StatusPill({ status }) {
  const map = {
    active: { bg: "#00D1B21A", c: "#00D1B2", label: "Active" },
    idle:   { bg: "#F59E0B1A", c: "#F59E0B", label: "Idle" },
    offline:{ bg: "#6B72801A", c: "#6B7280", label: "Offline" },
    ok:     { bg: "#00D1B21A", c: "#00D1B2", label: "Online" },
    warn:   { bg: "#F59E0B1A", c: "#F59E0B", label: "Degraded" },
    ready:  { bg: "#00D1B21A", c: "#00D1B2", label: "Ready" },
  };
  const s = map[status] ?? map.offline;
  return (
    <span className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium" style={{ background: s.bg, color: s.c }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.c }} />
      {s.label}
    </span>
  );
}

function StatCard({ label, value, change, Icon, accent }) {
  const up = !change.startsWith("-");
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.18 }}
      className="rounded-xl p-5 border relative overflow-hidden cursor-default"
      style={{ background: "#1B2235", borderColor: "rgba(255,255,255,0.07)" }}
    >
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-10" style={{ background: accent }} />
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-lg" style={{ background: `${accent}1A` }}>
          <Icon size={16} style={{ color: accent }} />
        </div>
        <span
          className="text-xs font-semibold flex items-center gap-0.5"
          style={{ color: up ? "#00D1B2" : "#EF4444", fontFamily: "'JetBrains Mono', monospace" }}
        >
          <ArrowUpRight size={11} style={{ transform: up ? "none" : "scaleY(-1)" }} />
          {change}
        </span>
      </div>
      <div className="text-2xl font-black text-white mb-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>{value}</div>
      <div className="text-xs" style={{ color: "#A0AEC0" }}>{label}</div>
    </motion.div>
  );
}

function SectionBadge({ children, color }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-5 border"
      style={{ background: `${color}1A`, color, borderColor: `${color}44` }}
    >
      {children}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ role, activeTab, setTab, navigate }) {
  const userNav = [
    { id: "overview", Icon: Home, label: "Overview" },
    { id: "search", Icon: Search, label: "Search Papers" },
    { id: "analytics", Icon: BarChart2, label: "Analytics" },
    { id: "reports", Icon: FileText, label: "Reports" },
  ];
  const adminNav = [
    { id: "overview", Icon: Home, label: "Dashboard" },
    { id: "users", Icon: Users, label: "User Management" },
    { id: "api", Icon: Globe, label: "API Monitoring" },
    { id: "database", Icon: Database, label: "Database" },
  ];
  const nav = role === "user" ? userNav : adminNav;

  return (
    <aside
      className="w-60 flex flex-col border-r h-screen sticky top-0 shrink-0"
      style={{ background: "#131A2A", borderColor: "rgba(255,255,255,0.07)" }}
    >
      <div className="p-5 border-b flex items-center gap-3" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #4F8CFF, #8B5CF6)" }}
        >
          <Microscope size={14} className="text-white" />
        </div>
        <div>
          <div className="text-xs font-black text-white tracking-widest">SCITRACK</div>
          <div className="text-[10px] mt-0.5" style={{ color: "#A0AEC0" }}>
            {role === "admin" ? "Admin Console" : "Research Platform"}
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ id, Icon, label }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left"
              style={{
                background: active ? "#4F8CFF1A" : "transparent",
                color: active ? "#4F8CFF" : "#A0AEC0",
                borderLeft: `2px solid ${active ? "#4F8CFF" : "transparent"}`,
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-2" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3 p-2 rounded-lg" style={{ background: "#1B2235" }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #4F8CFF, #8B5CF6)" }}
          >
            {role === "admin" ? "AD" : "SC"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {role === "admin" ? "Admin User" : "Dr. Sarah Chen"}
            </div>
            <div className="text-[10px] truncate" style={{ color: "#A0AEC0" }}>
              {role === "admin" ? "System Administrator" : "MIT · Researcher"}
            </div>
          </div>
          <Settings size={12} style={{ color: "#A0AEC0" }} />
        </div>
        <button
          onClick={() => navigate("landing")}
          className="w-full text-xs py-2 rounded-lg font-medium transition-all hover:text-white"
          style={{ color: "#A0AEC0", background: "rgba(255,255,255,0.04)" }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ─── Top bar ─────────────────────────────────────────────────────────────────
function TopBar({ title, subtitle }) {
  return (
    <header
      className="flex items-center justify-between px-6 py-4 border-b shrink-0"
      style={{ background: "#0B1020", borderColor: "rgba(255,255,255,0.07)" }}
    >
      <div>
        <h1 className="text-base font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{title}</h1>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: "#A0AEC0" }}>{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#A0AEC0" }} />
          <input
            type="text"
            placeholder="Search papers, topics…"
            className="pl-8 pr-4 py-2 rounded-lg text-xs outline-none w-52 border"
            style={{ background: "#1B2235", borderColor: "rgba(255,255,255,0.08)", color: "#E2E8F0" }}
          />
        </div>
        <button
          className="relative p-2 rounded-lg border transition-colors"
          style={{ background: "#1B2235", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <Bell size={15} style={{ color: "#A0AEC0" }} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "#4F8CFF" }} />
        </button>
      </div>
    </header>
  );
}

// ─── Landing page ─────────────────────────────────────────────────────────────
function LandingPage({ navigate }) {
  return (
    <div className="min-h-screen" style={{ background: "#0B1020", fontFamily: "'Inter', sans-serif" }}>
      {/* Navbar */}
      <nav
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 lg:px-10 py-4 border-b"
        style={{ background: "rgba(11,16,32,0.85)", backdropFilter: "blur(16px)", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #4F8CFF, #8B5CF6)" }}
          >
            <Microscope size={13} className="text-white" />
          </div>
          <span className="text-sm font-black text-white tracking-widest" style={{ fontFamily: "'Outfit', sans-serif" }}>
            SCITRACK
          </span>
        </div>
        <div className="hidden md:flex items-center gap-7 text-sm font-medium" style={{ color: "#A0AEC0" }}>
          {["Trends", "Features", "Integrations"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-white transition-colors">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("login")}
            className="px-4 py-2 text-sm font-medium rounded-lg border transition-all hover:text-white"
            style={{ color: "#A0AEC0", borderColor: "rgba(255,255,255,0.12)" }}
          >
            Log in
          </button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("register")}
            className="px-4 py-2 text-sm font-bold rounded-lg text-white"
            style={{ background: "linear-gradient(135deg, #4F8CFF, #8B5CF6)" }}
          >
            Get Started
          </motion.button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[480px] h-[480px] rounded-full blur-3xl opacity-[0.14]" style={{ background: "#4F8CFF" }} />
          <div className="absolute bottom-1/3 right-1/5 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: "#8B5CF6" }} />
          <div className="absolute bottom-0 left-1/2 w-72 h-72 rounded-full blur-3xl opacity-10" style={{ background: "#00D1B2" }} />
          {PARTICLES.map(p => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{ width: p.size, height: p.size, left: `${p.left}%`, top: `${p.top}%`, background: p.color, opacity: 0.2 }}
              animate={{ y: [0, -28, 0], opacity: [0.15, 0.38, 0.15] }}
              transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left col */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6 border"
              style={{ background: "#4F8CFF1A", color: "#4F8CFF", borderColor: "#4F8CFF44" }}
            >
              <Zap size={10} /> AI-Powered Academic Intelligence Platform
            </div>
            <h1
              className="text-5xl lg:text-6xl font-black leading-[1.05] mb-6"
              style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.025em" }}
            >
              <span className="text-white">Track the Future</span>
              <br />
              <span style={{ background: "linear-gradient(135deg, #4F8CFF 0%, #8B5CF6 50%, #00D1B2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                of Scientific
              </span>
              <br />
              <span className="text-white">Research</span>
            </h1>
            <p className="text-base lg:text-lg mb-8 leading-relaxed" style={{ color: "#A0AEC0", maxWidth: 480 }}>
              Analyze publication trends, discover emerging research topics, and visualize academic intelligence with AI-powered analytics across 50M+ papers.
            </p>
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("register")}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, #4F8CFF, #8B5CF6)" }}
              >
                Explore Trends <ArrowRight size={15} />
              </motion.button>
              
            </div>
            <div className="flex gap-10 mt-10 pt-8 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              {[
                { v: "50M+", l: "Research Papers" },
                { v: "4 APIs", l: "Live Data Sources" },
                { v: "98.7%", l: "System Uptime" },
              ].map(s => (
                <div key={s.l}>
                  <div className="text-2xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{s.v}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#A0AEC0" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right col — Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div
              className="rounded-2xl border p-5 relative overflow-hidden"
              style={{ background: "rgba(27,34,53,0.92)", borderColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-white">Publication Trends — 2024</span>
                <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "#00D1B2", fontFamily: "'JetBrains Mono', monospace" }}>
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
                      <stop offset="5%" stopColor="#00D1B2" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#00D1B2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="m" tick={{ fill: "#A0AEC0", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#131A2A", border: "none", borderRadius: 8, fontSize: 11 }} />
                  <Area type="monotone" dataKey="ai" stroke="#4F8CFF" fill="url(#hgAI)" strokeWidth={2} name="AI & ML" />
                  <Area type="monotone" dataKey="bio" stroke="#8B5CF6" fill="url(#hgBio)" strokeWidth={2} name="Biotech" />
                  <Area type="monotone" dataKey="cli" stroke="#00D1B2" fill="url(#hgCli)" strokeWidth={2} name="Climate" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { l: "AI & ML", v: "7,200", c: "#4F8CFF", d: "+18%" },
                  { l: "Biotech", v: "3,680", c: "#8B5CF6", d: "+12%" },
                  { l: "Climate", v: "2,720", c: "#00D1B2", d: "+24%" },
                ].map(s => (
                  <div key={s.l} className="rounded-lg p-2.5 text-center" style={{ background: "#131A2A" }}>
                    <div className="text-[10px] mb-1" style={{ color: "#A0AEC0" }}>{s.l}</div>
                    <div className="text-base font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{s.v}</div>
                    <div className="text-[10px] font-semibold" style={{ color: s.c, fontFamily: "'JetBrains Mono', monospace" }}>{s.d}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating AI insight card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-8 -right-6 rounded-xl p-4 border w-52"
              style={{ background: "rgba(27,34,53,0.97)", borderColor: "rgba(79,140,255,0.35)", backdropFilter: "blur(16px)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Brain size={13} style={{ color: "#00D1B2" }} />
                <span className="text-[10px] font-bold text-white">AI Insight</span>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: "#A0AEC0" }}>
                <span style={{ color: "#4F8CFF" }}>LLM research</span> surged{" "}
                <span style={{ color: "#00D1B2", fontFamily: "'JetBrains Mono', monospace" }}>+234%</span> — now the fastest-growing field in 2024.
              </p>
            </motion.div>

            {/* Floating citation card */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              className="absolute -bottom-8 -left-6 rounded-xl p-4 border"
              style={{ background: "rgba(27,34,53,0.97)", borderColor: "rgba(0,209,178,0.3)", backdropFilter: "blur(16px)" }}
            >
              <div className="text-[10px] mb-1" style={{ color: "#A0AEC0" }}>Total Citations 2024</div>
              <div className="text-3xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>52.1M</div>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight size={11} style={{ color: "#00D1B2" }} />
                <span className="text-[10px] font-semibold" style={{ color: "#00D1B2", fontFamily: "'JetBrains Mono', monospace" }}>+35.7% YoY</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trending Showcase */}
      <section id="trends" className="py-24 px-6 lg:px-10" style={{ background: "#131A2A" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <SectionBadge color="#8B5CF6"><TrendingUp size={11} /> Live Trend Analytics</SectionBadge>
            <h2 className="text-4xl font-black text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Publication Velocity by Field</h2>
            <p style={{ color: "#A0AEC0" }}>Monthly paper counts across major research disciplines — 2024</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border p-6 mb-8"
            style={{ background: "#1B2235", borderColor: "rgba(255,255,255,0.07)" }}
          >
            <div className="flex flex-wrap gap-5 mb-4">
              {[
                { k: "ai", c: "#4F8CFF", l: "AI & ML" },
                { k: "bio", c: "#8B5CF6", l: "Biotechnology" },
                { k: "cli", c: "#00D1B2", l: "Climate Science" },
                { k: "qc", c: "#F59E0B", l: "Quantum Computing" },
              ].map(f => (
                <div key={f.k} className="flex items-center gap-1.5 text-xs" style={{ color: "#A0AEC0", fontFamily: "'JetBrains Mono', monospace" }}>
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: f.c }} />
                  {f.l}
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={PUB_DATA}>
                <defs>
                  {[{ id: "lai", c: "#4F8CFF" }, { id: "lbio", c: "#8B5CF6" }, { id: "lcli", c: "#00D1B2" }, { id: "lqc", c: "#F59E0B" }].map(g => (
                    <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={g.c} stopOpacity={0.22} />
                      <stop offset="95%" stopColor={g.c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="m" tick={{ fill: "#A0AEC0", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#A0AEC0", fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
                <Tooltip contentStyle={{ background: "#131A2A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="ai" stroke="#4F8CFF" fill="url(#lai)" strokeWidth={2} name="AI & ML" />
                <Area type="monotone" dataKey="bio" stroke="#8B5CF6" fill="url(#lbio)" strokeWidth={2} name="Biotech" />
                <Area type="monotone" dataKey="cli" stroke="#00D1B2" fill="url(#lcli)" strokeWidth={2} name="Climate" />
                <Area type="monotone" dataKey="qc" stroke="#F59E0B" fill="url(#lqc)" strokeWidth={2} name="Quantum" />
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
                style={{ background: "#1B2235", borderColor: "rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ins.c}1A` }}>
                    <TrendingUp size={14} style={{ color: ins.c }} />
                  </div>
                  <span className="text-sm font-black" style={{ color: ins.c, fontFamily: "'JetBrains Mono', monospace" }}>{ins.growth}</span>
                </div>
                <div className="text-sm font-bold text-white mb-1.5">{ins.topic}</div>
                <div className="text-xs leading-relaxed mb-3" style={{ color: "#A0AEC0" }}>{ins.desc}</div>
                <div className="text-xs" style={{ color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}>{ins.papers.toLocaleString()} papers</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <SectionBadge color="#00D1B2"><Zap size={11} /> Platform Capabilities</SectionBadge>
            <h2 className="text-4xl font-black text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Built for Academic Excellence</h2>
            <p style={{ color: "#A0AEC0" }}>Everything you need to navigate the scientific literature landscape at scale</p>
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
                style={{ background: "#1B2235", borderColor: "rgba(255,255,255,0.07)" }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${c}1A` }}>
                  <Icon size={20} style={{ color: c }} />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{label}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "#A0AEC0" }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* API Integrations */}
      <section id="integrations" className="py-24 px-6 lg:px-10" style={{ background: "#131A2A" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <SectionBadge color="#4F8CFF"><Globe size={11} /> Live Integrations</SectionBadge>
            <h2 className="text-4xl font-black text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Connected to Leading Databases</h2>
            <p style={{ color: "#A0AEC0" }}>Real-time synchronization with the world's major academic repositories</p>
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
                style={{ background: "#1B2235", borderColor: "rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#4F8CFF1A" }}>
                    <Globe size={16} style={{ color: "#4F8CFF" }} />
                  </div>
                  <StatusPill status={api.status} />
                </div>
                <div className="text-sm font-bold text-white mb-3">{api.name}</div>
                <div className="space-y-1.5">
                  {[
                    { l: "Uptime", v: `${api.up}%`, c: "#00D1B2" },
                    { l: "Latency", v: api.lat, c: "white" },
                    { l: "Req / day", v: api.req, c: "white" },
                  ].map(s => (
                    <div key={s.l} className="flex justify-between text-xs">
                      <span style={{ color: "#A0AEC0" }}>{s.l}</span>
                      <span className="font-semibold" style={{ color: s.c, fontFamily: "'JetBrains Mono', monospace" }}>{s.v}</span>
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[320px] rounded-full blur-3xl opacity-12" style={{ background: "linear-gradient(135deg, #4F8CFF, #8B5CF6)" }} />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-5xl font-black text-white mb-5" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Start Exploring Scientific Trends
            </h2>
            <p className="text-lg mb-10" style={{ color: "#A0AEC0" }}>
              Join 12,000+ researchers using SciTrack to navigate the future of academic publishing.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                { label: "Login", action: () => navigate("login"), style: { background: "linear-gradient(135deg, #4F8CFF, #8B5CF6)" }, text: "text-white" },
                { label: "Register Free", action: () => navigate("register"), style: { border: "1px solid rgba(255,255,255,0.14)", color: "#A0AEC0" }, text: "" },
              ].map(b => (
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
                onClick={() => navigate("userDash")}
                className="px-8 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2"
                style={{ color: "#00D1B2", background: "#00D1B21A", border: "1px solid #00D1B244" }}
              >
                Explore Dashboard <ArrowRight size={14} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6" style={{ background: "#131A2A", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #4F8CFF, #8B5CF6)" }}>
              <Microscope size={10} className="text-white" />
            </div>
            <span className="text-xs font-black text-white tracking-widest" style={{ fontFamily: "'Outfit', sans-serif" }}>SCITRACK</span>
          </div>
          <p className="text-xs" style={{ color: "#A0AEC0" }}>© 2024 SciTrack — AI-Powered Academic Research Analytics Platform</p>
        </div>
      </footer>
    </div>
  );
}

// ─── Auth page ────────────────────────────────────────────────────────────────
function AuthPage({ mode, navigate }) {
  const [form, setForm] = useState({ email: "", password: "", role: "user", name: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(form.role === "admin" ? "adminDash" : "userDash");
    }, 1100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "#0B1020" }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-[0.14]" style={{ background: "#4F8CFF" }} />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full blur-3xl opacity-10" style={{ background: "#8B5CF6" }} />
        {PARTICLES.slice(0, 18).map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{ width: p.size, height: p.size, left: `${p.left}%`, top: `${p.top}%`, background: p.color, opacity: 0.18 }}
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-md mx-6"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #4F8CFF, #8B5CF6)" }}>
            <Microscope size={18} className="text-white" />
          </div>
          <span className="text-lg font-black text-white tracking-widest" style={{ fontFamily: "'Outfit', sans-serif" }}>SCITRACK</span>
        </div>

        <div
          className="rounded-2xl border p-8"
          style={{ background: "rgba(27,34,53,0.85)", borderColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(24px)" }}
        >
          <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-sm mb-6" style={{ color: "#A0AEC0" }}>
            {mode === "login" ? "Sign in to your research dashboard" : "Start your academic intelligence journey"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-xs font-semibold text-white block mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="Dr. Sarah Chen"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ background: "#131A2A", borderColor: "rgba(255,255,255,0.1)", color: "#E2E8F0" }}
                />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-white block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#A0AEC0" }} />
                <input
                  type="email"
                  placeholder="you@university.edu"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ background: "#131A2A", borderColor: "rgba(255,255,255,0.1)", color: "#E2E8F0" }}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-white block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#A0AEC0" }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ background: "#131A2A", borderColor: "rgba(255,255,255,0.1)", color: "#E2E8F0" }}
                />
              </div>
            </div>

            {/* Role selection */}
            <div>
              <label className="text-xs font-semibold text-white block mb-2">Access Role</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "user", label: "Researcher", desc: "User Dashboard", Icon: BookOpen },
                  { id: "admin", label: "Administrator", desc: "Admin Console", Icon: Shield },
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: r.id }))}
                    className="p-3 rounded-xl border text-left transition-all"
                    style={{
                      background: form.role === r.id ? "#4F8CFF1A" : "#131A2A",
                      borderColor: form.role === r.id ? "#4F8CFF55" : "rgba(255,255,255,0.08)",
                    }}
                  >
                    <r.Icon size={14} style={{ color: form.role === r.id ? "#4F8CFF" : "#A0AEC0" }} className="mb-1.5" />
                    <div className="text-xs font-bold" style={{ color: form.role === r.id ? "#4F8CFF" : "white" }}>{r.label}</div>
                    <div className="text-[10px]" style={{ color: "#A0AEC0" }}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {mode === "login" && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer" style={{ color: "#A0AEC0" }}>
                  <input type="checkbox" className="rounded" /> Remember me
                </label>
                <button type="button" className="font-semibold" style={{ color: "#4F8CFF" }}>Forgot password?</button>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #4F8CFF, #8B5CF6)", opacity: loading ? 0.8 : 1 }}
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  {mode === "login" ? "Signing in…" : "Creating account…"}
                </>
              ) : (
                mode === "login" ? "Sign In" : "Create Account"
              )}
            </motion.button>
          </form>

          <div className="mt-6 pt-5 border-t text-center text-xs" style={{ borderColor: "rgba(255,255,255,0.07)", color: "#A0AEC0" }}>
            {mode === "login" ? (
              <>Don&apos;t have an account?{" "}
                <button onClick={() => navigate("register")} className="font-semibold" style={{ color: "#4F8CFF" }}>Register</button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => navigate("login")} className="font-semibold" style={{ color: "#4F8CFF" }}>Sign In</button>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate("landing")}
          className="mt-5 w-full text-center text-xs transition-colors hover:text-white"
          style={{ color: "#6B7280" }}
        >
          ← Back to landing page
        </button>
      </motion.div>
    </div>
  );
}

// ─── User dashboard sub-views ─────────────────────────────────────────────────
function UserOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Papers Tracked" value="2,847" change="+18%" Icon={FileText} accent="#4F8CFF" />
        <StatCard label="Total Citations" value="52.1M" change="+35.7%" Icon={TrendingUp} accent="#8B5CF6" />
        <StatCard label="Active Topics" value="48" change="+6%" Icon={Hash} accent="#00D1B2" />
        <StatCard label="AI Insights" value="127" change="+24%" Icon={Brain} accent="#F59E0B" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-xl border p-5" style={{ background: "#1B2235", borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Publication Trends</h3>
              <p className="text-xs mt-0.5" style={{ color: "#A0AEC0" }}>Monthly papers by research field — 2024</p>
            </div>
            <div className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "#4F8CFF1A", color: "#4F8CFF" }}>2024</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={PUB_DATA}>
              <defs>
                {[{ id: "oa1", c: "#4F8CFF" }, { id: "oa2", c: "#8B5CF6" }, { id: "oa3", c: "#00D1B2" }].map(g => (
                  <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={g.c} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={g.c} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="m" tick={{ fill: "#A0AEC0", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#A0AEC0", fontSize: 10 }} axisLine={false} tickLine={false} width={42} />
              <Tooltip contentStyle={{ background: "#0B1020", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="ai" stroke="#4F8CFF" fill="url(#oa1)" strokeWidth={2} name="AI & ML" />
              <Area type="monotone" dataKey="bio" stroke="#8B5CF6" fill="url(#oa2)" strokeWidth={2} name="Biotech" />
              <Area type="monotone" dataKey="cli" stroke="#00D1B2" fill="url(#oa3)" strokeWidth={2} name="Climate" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border p-5" style={{ background: "#1B2235", borderColor: "rgba(255,255,255,0.07)" }}>
          <h3 className="text-sm font-bold text-white mb-4">Research Fields</h3>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={FIELD_DATA} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="v" stroke="none" paddingAngle={2}>
                {FIELD_DATA.map((f, i) => <Cell key={i} fill={f.c} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0B1020", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {FIELD_DATA.map(f => (
              <div key={f.n} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: f.c }} />
                  <span style={{ color: "#A0AEC0" }}>{f.n}</span>
                </div>
                <span className="font-semibold" style={{ color: f.c, fontFamily: "'JetBrains Mono', monospace" }}>{f.v}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="rounded-xl border p-5" style={{ background: "#1B2235", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Brain size={15} style={{ color: "#00D1B2" }} />
          <h3 className="text-sm font-bold text-white">AI-Powered Research Insights</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {INSIGHTS.map(ins => (
            <motion.div
              key={ins.topic}
              whileHover={{ y: -3 }}
              className="rounded-lg p-4 cursor-default"
              style={{ background: "#131A2A", border: `1px solid ${ins.c}1A` }}
            >
              <div className="text-xs font-bold text-white mb-1.5">{ins.topic}</div>
              <div className="text-xs leading-relaxed mb-3" style={{ color: "#A0AEC0" }}>{ins.desc}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}>{ins.papers.toLocaleString()}</span>
                <span className="text-xs font-bold" style={{ color: ins.c, fontFamily: "'JetBrains Mono', monospace" }}>{ins.growth}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Papers table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "#1B2235", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <h3 className="text-sm font-bold text-white">Trending Research Papers</h3>
          <div className="flex gap-2">
            <button className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5" style={{ background: "#131A2A", color: "#A0AEC0" }}>
              <Filter size={11} /> Filter
            </button>
            <button className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5" style={{ background: "#131A2A", color: "#A0AEC0" }}>
              <Download size={11} /> Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {["Title", "Authors", "Year", "Citations", "Field", "Trend"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "#6B7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PAPERS.map((p, i) => (
                <tr key={i} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-semibold text-white block" style={{ maxWidth: 280 }}>{p.title}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: "#A0AEC0" }}>{p.authors}</td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "#A0AEC0", fontFamily: "'JetBrains Mono', monospace" }}>{p.year}</td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.citations.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <GlowBadge color={FIELD_DATA.find(f => f.n === p.field)?.c ?? "#4F8CFF"}>{p.field}</GlowBadge>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-semibold" style={{ color: "#00D1B2", fontFamily: "'JetBrains Mono', monospace" }}>{p.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SearchPapers() {
  const [query, setQuery] = useState("");
  const filtered = PAPERS.filter(p =>
    !query ||
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.authors.toLowerCase().includes(query.toLowerCase()) ||
    p.field.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#A0AEC0" }} />
        <input
          type="text"
          placeholder="Search papers by title, author, or field…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm outline-none"
          style={{ background: "#1B2235", borderColor: "rgba(255,255,255,0.09)", color: "#E2E8F0" }}
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        {FIELD_DATA.map(f => (
          <button
            key={f.n}
            onClick={() => setQuery(f.n)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{ background: `${f.c}1A`, color: f.c, border: `1px solid ${f.c}44` }}
          >
            {f.n}
          </button>
        ))}
        {query && (
          <button
            onClick={() => setQuery("")}
            className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1"
            style={{ background: "rgba(255,255,255,0.05)", color: "#A0AEC0", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <X size={10} /> Clear
          </button>
        )}
      </div>
      <p className="text-xs" style={{ color: "#6B7280" }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
      <div className="space-y-3">
        {filtered.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ x: 4 }}
            className="rounded-xl border p-5 cursor-default"
            style={{ background: "#1B2235", borderColor: "rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <GlowBadge color={FIELD_DATA.find(f => f.n === p.field)?.c ?? "#4F8CFF"}>{p.field}</GlowBadge>
                  <span className="text-xs" style={{ color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}>{p.year}</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{p.title}</h4>
                <p className="text-xs" style={{ color: "#A0AEC0" }}>{p.authors}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{p.citations.toLocaleString()}</div>
                <div className="text-xs" style={{ color: "#6B7280" }}>citations</div>
                <div className="text-xs font-semibold mt-1" style={{ color: "#00D1B2", fontFamily: "'JetBrains Mono', monospace" }}>{p.trend}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Publications" value="50.2M" change="+14%" Icon={FileText} accent="#4F8CFF" />
        <StatCard label="Citation Index" value="52.1M" change="+35.7%" Icon={TrendingUp} accent="#8B5CF6" />
        <StatCard label="Active Researchers" value="284K" change="+8.2%" Icon={Users} accent="#00D1B2" />
        <StatCard label="Impact Score" value="9.4" change="+0.8" Icon={Star} accent="#F59E0B" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl border p-5" style={{ background: "#1B2235", borderColor: "rgba(255,255,255,0.07)" }}>
          <h3 className="text-sm font-bold text-white mb-1">Citation Growth (Global)</h3>
          <p className="text-xs mb-4" style={{ color: "#A0AEC0" }}>Total citations indexed 2019–2024</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CIT_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="y" tick={{ fill: "#A0AEC0", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#A0AEC0", fontSize: 11 }} axisLine={false} tickLine={false} unit="M" width={40} />
              <Tooltip contentStyle={{ background: "#0B1020", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }} formatter={(v) => [`${v}M`, "Citations"]} />
              <Bar dataKey="v" radius={[4, 4, 0, 0]} name="Citations">
                {CIT_DATA.map((_, i) => <Cell key={i} fill={i === CIT_DATA.length - 1 ? "#4F8CFF" : "#4F8CFF44"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border p-5" style={{ background: "#1B2235", borderColor: "rgba(255,255,255,0.07)" }}>
          <h3 className="text-sm font-bold text-white mb-1">Field Distribution</h3>
          <p className="text-xs mb-4" style={{ color: "#A0AEC0" }}>Share of total publications by research area</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={FIELD_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={82} dataKey="v" stroke="none" paddingAngle={3}>
                {FIELD_DATA.map((f, i) => <Cell key={i} fill={f.c} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0B1020", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }} formatter={(v) => [`${v}%`, "Share"]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-1 justify-center">
            {FIELD_DATA.map(f => (
              <div key={f.n} className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-sm" style={{ background: f.c }} />
                <span style={{ color: "#A0AEC0" }}>{f.n} <span className="font-semibold" style={{ color: f.c, fontFamily: "'JetBrains Mono', monospace" }}>{f.v}%</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportsView() {
  const reports = [
    { title: "Q4 2024 AI Research Landscape Report", date: "Dec 28, 2024", type: "Quarterly", size: "2.4 MB", status: "ready" },
    { title: "Citation Impact Analysis — NLP & LLMs", date: "Dec 15, 2024", type: "Topic Analysis", size: "1.1 MB", status: "ready" },
    { title: "Emerging Fields Forecast 2025", date: "Dec 10, 2024", type: "Forecast", size: "3.8 MB", status: "ready" },
    { title: "Biotechnology Publication Trends", date: "Nov 30, 2024", type: "Field Report", size: "1.7 MB", status: "ready" },
    { title: "API Data Quality & Availability Audit", date: "Nov 22, 2024", type: "System", size: "0.9 MB", status: "ready" },
  ];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "#A0AEC0" }}>{reports.length} reports available</p>
        <button className="px-4 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-2" style={{ background: "linear-gradient(135deg, #4F8CFF, #8B5CF6)" }}>
          <Plus size={13} /> Generate Report
        </button>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{ background: "#1B2235", borderColor: "rgba(255,255,255,0.07)" }}>
        {reports.map((r, i) => (
          <div key={i} className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-white/[0.02] transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#4F8CFF1A" }}>
                <FileText size={15} style={{ color: "#4F8CFF" }} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{r.title}</div>
                <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: "#A0AEC0" }}>
                  <span>{r.type}</span><span>·</span><span>{r.date}</span><span>·</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{r.size}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StatusPill status={r.status} />
              <button className="p-2 rounded-lg transition-colors hover:text-white" style={{ color: "#A0AEC0" }}>
                <Download size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Admin sub-views ──────────────────────────────────────────────────────────
function AdminOverview() {
  const hourlyData = PUB_DATA.slice(-8).map((d, i) => ({
    h: `${8 + i * 2}:00`,
    req: Math.round((d.ai + d.bio) / 14),
  }));
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Users" value="12,847" change="+8.4%" Icon={Users} accent="#4F8CFF" />
        <StatCard label="API Health" value="98.7%" change="+0.3%" Icon={Server} accent="#00D1B2" />
        <StatCard label="DB Size" value="2.4 TB" change="+5.1%" Icon={Database} accent="#8B5CF6" />
        <StatCard label="System Load" value="34%" change="-12%" Icon={Cpu} accent="#F59E0B" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl border p-5" style={{ background: "#1B2235", borderColor: "rgba(255,255,255,0.07)" }}>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Activity size={14} style={{ color: "#00D1B2" }} /> API Status Overview
          </h3>
          <div className="space-y-2.5">
            {APIS.map(api => (
              <div key={api.name} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "#131A2A" }}>
                <div className="flex items-center gap-3">
                  <StatusPill status={api.status} />
                  <span className="text-sm font-medium text-white">{api.name}</span>
                </div>
                <div className="flex gap-6 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  <span style={{ color: "#A0AEC0" }}>{api.lat}</span>
                  <span style={{ color: "#00D1B2" }}>{api.up}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border p-5" style={{ background: "#1B2235", borderColor: "rgba(255,255,255,0.07)" }}>
          <h3 className="text-sm font-bold text-white mb-4">Request Volume (24h)</h3>
          <ResponsiveContainer width="100%" height={185}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="h" tick={{ fill: "#A0AEC0", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#A0AEC0", fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={{ background: "#0B1020", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="req" fill="#4F8CFF" radius={[3, 3, 0, 0]} opacity={0.8} name="Requests" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{ background: "#1B2235", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <h3 className="text-sm font-bold text-white">Recent User Activity</h3>
        </div>
        {USERS_TABLE.slice(0, 4).map((u, i) => (
          <div key={u.id} className="flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-white/[0.02] transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: `linear-gradient(135deg, ${FIELD_DATA[i % FIELD_DATA.length].c}, #8B5CF6)` }}>
              {u.name.split(" ").slice(-1)[0][0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white">{u.name}</div>
              <div className="text-xs" style={{ color: "#A0AEC0" }}>{u.email}</div>
            </div>
            <StatusPill status={u.status} />
            <span className="text-xs hidden md:block" style={{ color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}>{u.last}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserManagement() {
  const [search, setSearch] = useState("");
  const filtered = USERS_TABLE.filter(u =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#A0AEC0" }} />
          <input
            type="text"
            placeholder="Search users by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2.5 rounded-xl border text-xs outline-none"
            style={{ background: "#1B2235", borderColor: "rgba(255,255,255,0.09)", color: "#E2E8F0" }}
          />
        </div>
        <button className="px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2" style={{ background: "linear-gradient(135deg, #4F8CFF, #8B5CF6)" }}>
          <Plus size={13} /> Add User
        </button>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{ background: "#1B2235", borderColor: "rgba(255,255,255,0.07)" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {["User", "Role", "Papers", "Status", "Last Active", ""].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "#6B7280" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: `linear-gradient(135deg, ${FIELD_DATA[i % FIELD_DATA.length].c}, #8B5CF6)` }}>
                      {u.name.split(" ").slice(-1)[0][0]}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{u.name}</div>
                      <div className="text-[10px]" style={{ color: "#A0AEC0" }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5"><GlowBadge color="#8B5CF6">{u.role}</GlowBadge></td>
                <td className="px-5 py-3.5 text-xs font-semibold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{u.papers}</td>
                <td className="px-5 py-3.5"><StatusPill status={u.status} /></td>
                <td className="px-5 py-3.5 text-xs" style={{ color: "#A0AEC0", fontFamily: "'JetBrains Mono', monospace" }}>{u.last}</td>
                <td className="px-5 py-3.5">
                  <button className="hover:text-white transition-colors" style={{ color: "#6B7280" }}><MoreHorizontal size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function APIMonitoring() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Avg Uptime" value="98.7%" change="+0.3%" Icon={CheckCircle} accent="#00D1B2" />
        <StatCard label="Requests / day" value="429.4K" change="+11%" Icon={Activity} accent="#4F8CFF" />
        <StatCard label="Avg Latency" value="1.0ms" change="-8%" Icon={Zap} accent="#8B5CF6" />
        <StatCard label="Error Rate" value="0.03%" change="-15%" Icon={AlertCircle} accent="#F59E0B" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {APIS.map(api => (
          <div key={api.name} className="rounded-xl border p-5" style={{ background: "#1B2235", borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">{api.name}</h3>
                <p className="text-xs mt-0.5" style={{ color: "#A0AEC0" }}>{api.req} requests today</p>
              </div>
              <StatusPill status={api.status} />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { l: "Uptime", v: `${api.up}%`, c: "#00D1B2" },
                { l: "Latency", v: api.lat, c: "#4F8CFF" },
                { l: "Requests", v: api.req, c: "#8B5CF6" },
              ].map(s => (
                <div key={s.l} className="rounded-lg p-3 text-center" style={{ background: "#131A2A" }}>
                  <div className="text-base font-black" style={{ color: s.c, fontFamily: "'Outfit', sans-serif" }}>{s.v}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: "#A0AEC0" }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-1.5" style={{ color: "#A0AEC0" }}>
                <span>Uptime</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{api.up}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#131A2A" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${api.up}%`, background: api.status === "ok" ? "#00D1B2" : "#F59E0B" }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DatabaseView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Size" value="2.4 TB" change="+5.1%" Icon={Database} accent="#8B5CF6" />
        <StatCard label="Total Records" value="471M" change="+3.8%" Icon={Hash} accent="#4F8CFF" />
        <StatCard label="Queries / sec" value="18.4K" change="+12%" Icon={Zap} accent="#00D1B2" />
        <StatCard label="Cache Hit Rate" value="94.2%" change="+1.8%" Icon={Cpu} accent="#F59E0B" />
      </div>
      <div className="rounded-xl border overflow-hidden" style={{ background: "#1B2235", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <h3 className="text-sm font-bold text-white">Database Tables</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {["Table", "Rows", "Size", "Growth", "Status"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "#6B7280" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DB_TABLES.map(t => (
              <tr key={t.name} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                <td className="px-5 py-3.5 text-xs font-semibold" style={{ color: "#4F8CFF", fontFamily: "'JetBrains Mono', monospace" }}>{t.name}</td>
                <td className="px-5 py-3.5 text-xs text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{t.rows}</td>
                <td className="px-5 py-3.5 text-xs text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{t.size}</td>
                <td className="px-5 py-3.5 text-xs font-semibold" style={{ color: "#00D1B2", fontFamily: "'JetBrains Mono', monospace" }}>{t.growth}</td>
                <td className="px-5 py-3.5"><StatusPill status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Dashboard wrappers ───────────────────────────────────────────────────────
function UserDashboard({ navigate }) {
  const [tab, setTab] = useState("overview");
  const titles = {
    overview: "Research Overview",
    search: "Search Papers",
    analytics: "Analytics",
    reports: "Reports",
  };
  const subs = {
    overview: "Your personalized academic intelligence dashboard",
    search: undefined,
    analytics: undefined,
    reports: undefined,
  };
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0B1020" }}>
      <Sidebar role="user" activeTab={tab} setTab={t => setTab(t)} navigate={navigate} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={titles[tab]} subtitle={subs[tab]} />
        <main className="flex-1 overflow-y-auto p-6">
          {tab === "overview" && <UserOverview />}
          {tab === "search" && <SearchPapers />}
          {tab === "analytics" && <AnalyticsView />}
          {tab === "reports" && <ReportsView />}
        </main>
      </div>
    </div>
  );
}

function AdminDashboard({ navigate }) {
  const [tab, setTab] = useState("overview");
  const titles = {
    overview: "Admin Dashboard",
    users: "User Management",
    api: "API Monitoring",
    database: "Database Management",
  };
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0B1020" }}>
      <Sidebar role="admin" activeTab={tab} setTab={t => setTab(t)} navigate={navigate} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={titles[tab]} subtitle={tab === "overview" ? "System health and administration console" : undefined} />
        <main className="flex-1 overflow-y-auto p-6">
          {tab === "overview" && <AdminOverview />}
          {tab === "users" && <UserManagement />}
          {tab === "api" && <APIMonitoring />}
          {tab === "database" && <DatabaseView />}
        </main>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing");
  const navigate = (p) => setPage(p);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
      <motion.div
        key={page}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="size-full"
      >
        {page === "landing" && <LandingPage navigate={navigate} />}
        {page === "login" && <AuthPage mode="login" navigate={navigate} />}
        {page === "register" && <AuthPage mode="register" navigate={navigate} />}
        {page === "userDash" && <UserDashboard navigate={navigate} />}
        {page === "adminDash" && <AdminDashboard navigate={navigate} />}
      </motion.div>
    </>
  );
}