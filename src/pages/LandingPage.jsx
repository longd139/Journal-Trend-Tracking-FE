import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, YAxis } from 'recharts';
import { ArrowRight, TrendingUp, Brain, Zap, ArrowUpRight, Microscope, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PARTICLES, PUB_DATA, INSIGHTS, FEATURES, APIS } from '../constants/mockData';
import { SectionBadge, StatusPill } from '../components/SharedUI';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation(['landing', 'common']);
  const [isDark, setIsDark] = useState(true);

  // Quan sát thẻ HTML để biết web đang ở chế độ nào (để render lại đồ thị Recharts)
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    setIsDark(document.documentElement.classList.contains('dark')); // Check lần đầu
    return () => observer.disconnect();
  }, []);

  const handleAuthRedirect = (mode) => navigate('/auth', { state: { mode: mode } });

  const chartTextColor = isDark ? '#A0AEC0' : '#6B7280';
  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
  const tooltipBg = isDark ? '#131A2A' : '#ffffff';

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0B1020] font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 lg:px-10 py-4 border-b border-gray-200 dark:border-white/5 bg-white/85 dark:bg-[#0B1020]/85 backdrop-blur-md transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
            <Microscope size={13} className="text-white" />
          </div>
          <span className="text-sm font-black text-gray-900 dark:text-white tracking-widest font-outfit">SCITRACK</span>
        </div>
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-500 dark:text-[#A0AEC0]">
          {[{ key: 'trends', label: t('nav.trends') }, { key: 'features', label: t('nav.features') }, { key: 'integrations', label: t('nav.integrations') }].map(({ key, label }) => (
            <a key={key} href={`#${key}`} className="hover:text-blue-600 dark:hover:text-white transition-colors">{label}</a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="topbar" />
          <button onClick={() => handleAuthRedirect('login')} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-white/10 text-gray-600 dark:text-[#A0AEC0] hover:bg-gray-100 dark:hover:bg-white/5 transition-all">{t('nav.signIn')}</button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => handleAuthRedirect('register')} className="px-4 py-2 text-sm font-bold rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">{t('nav.register')}</motion.button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[480px] h-[480px] rounded-full blur-3xl opacity-5 dark:opacity-[0.14] bg-blue-500" />
          <div className="absolute bottom-1/3 right-1/5 w-96 h-96 rounded-full blur-3xl opacity-5 dark:opacity-10 bg-purple-600" />
          <div className="absolute bottom-0 left-1/2 w-72 h-72 rounded-full blur-3xl opacity-5 dark:opacity-10 bg-teal-500" />
          {PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{ width: p.size, height: p.size, left: `${p.left}%`, top: `${p.top}%`, background: p.color, opacity: 0.2 }}
              animate={{ y: [0, -28, 0], opacity: [0.15, 0.38, 0.15] }}
              transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left col */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6 border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Zap size={10} /> {t('hero.badge')}
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-[1.15] mb-6 text-gray-900 dark:text-white overflow-diacritics-safe" style={{ fontFamily: "'Be Vietnam Pro', 'Inter', 'Noto Sans', sans-serif" }}>
              {t('hero.heading1')}<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-blue-500 via-purple-500 to-teal-400">{t('hero.heading2')}</span><br />
              {t('hero.heading3')}
            </h1>
            <p className="text-base lg:text-lg mb-8 leading-relaxed text-gray-600 dark:text-[#A0AEC0] max-w-[480px]">
              {t('hero.description')}
            </p>
            <div className="flex flex-wrap gap-3">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => handleAuthRedirect('register')} className="px-6 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
                {t('hero.cta')} <ArrowRight size={15} />
              </motion.button>
            </div>
            <div className="flex gap-10 mt-10 pt-8 border-t border-gray-200 dark:border-white/10">
              {[{ v: '50M+', l: t('stats.papers') }, { v: '4 APIs', l: t('stats.apis') }, { v: '98.7%', l: t('stats.uptime') }].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-black text-gray-900 dark:text-white font-outfit">{s.v}</div>
                  <div className="text-xs mt-0.5 text-gray-500 dark:text-[#A0AEC0]">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right col — Dashboard preview */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative hidden lg:block">
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-5 relative overflow-hidden bg-white/60 dark:bg-[#1B2235]/90 backdrop-blur-xl shadow-xl dark:shadow-none">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-900 dark:text-white">{t('preview.title')}</span>
                <span className="text-xs font-semibold flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> {t('preview.live')}
                </span>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={PUB_DATA.slice(-6)}>
                  <defs>
                    <linearGradient id="hgAI" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                    <linearGradient id="hgBio" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
                    <linearGradient id="hgCli" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#14b8a6" stopOpacity={0.25} /><stop offset="95%" stopColor="#14b8a6" stopOpacity={0} /></linearGradient>
                  </defs>
                  <XAxis dataKey="m" tick={{ fill: chartTextColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${gridColor}`, borderRadius: 8, fontSize: 11, color: isDark ? '#fff' : '#000' }} />
                  <Area type="monotone" dataKey="ai" stroke="#3b82f6" fill="url(#hgAI)" strokeWidth={2} name="AI & ML" />
                  <Area type="monotone" dataKey="bio" stroke="#8b5cf6" fill="url(#hgBio)" strokeWidth={2} name="Biotech" />
                  <Area type="monotone" dataKey="cli" stroke="#14b8a6" fill="url(#hgCli)" strokeWidth={2} name="Climate" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[{ l: t('preview.aiMl'), v: '7,200', c: 'text-blue-500', d: '+18%' }, { l: t('preview.biotech'), v: '3,680', c: 'text-purple-500', d: '+12%' }, { l: t('preview.climate'), v: '2,720', c: 'text-teal-500', d: '+24%' }].map((s) => (
                  <div key={s.l} className="rounded-lg p-2.5 text-center bg-gray-50 dark:bg-[#131A2A]">
                    <div className="text-[10px] mb-1 text-gray-500 dark:text-[#A0AEC0]">{s.l}</div>
                    <div className="text-base font-black text-gray-900 dark:text-white font-outfit">{s.v}</div>
                    <div className={`text-[10px] font-semibold font-mono ${s.c}`}>{s.d}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating AI insight card */}
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="absolute -top-8 -right-6 rounded-xl p-4 border w-52 bg-white/95 dark:bg-[#1B2235]/95 border-blue-200 dark:border-blue-500/30 backdrop-blur-md shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={13} className="text-teal-500" />
                <span className="text-[10px] font-bold text-gray-900 dark:text-white">{t('preview.aiInsight')}</span>
              </div>
              <p className="text-[10px] leading-relaxed text-gray-600 dark:text-[#A0AEC0]">
                <span className="text-blue-600 dark:text-blue-400">{t('preview.insightHighlight')}</span> surged{' '}
                <span className="text-teal-600 dark:text-teal-400 font-mono font-semibold">{t('preview.insightStat')}</span> — {t('preview.insightSuffix')}
              </p>
            </motion.div>

            {/* Floating citation card */}
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }} className="absolute -bottom-8 -left-6 rounded-xl p-4 border bg-white/95 dark:bg-[#1B2235]/95 border-teal-200 dark:border-teal-500/30 backdrop-blur-md shadow-xl">
              <div className="text-[10px] mb-1 text-gray-500 dark:text-[#A0AEC0]">{t('preview.totalCitations')}</div>
              <div className="text-3xl font-black text-gray-900 dark:text-white font-outfit">52.1M</div>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight size={11} className="text-teal-500" />
                <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 font-mono">+35.7% {t('preview.yoy')}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trending Showcase */}
      <section id="trends" className="py-24 px-6 lg:px-10 bg-white dark:bg-[#131A2A] transition-colors">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <SectionBadge color="#8B5CF6"><TrendingUp size={11} /> {t('trends.badge')}</SectionBadge>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-3 font-outfit">{t('trends.heading')}</h2>
            <p className="text-gray-600 dark:text-[#A0AEC0]">{t('trends.description')}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border p-6 mb-8 bg-gray-50 dark:bg-[#1B2235] border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors">
            <div className="flex flex-wrap gap-5 mb-4">
              {[{ k: 'ai', c: '#3b82f6', l: t('trends.fields.aiMl') }, { k: 'bio', c: '#8b5cf6', l: t('trends.fields.biotechnology') }, { k: 'cli', c: '#14b8a6', l: t('trends.fields.climateScience') }, { k: 'qc', c: '#f59e0b', l: t('trends.fields.quantumComputing') }].map((f) => (
                <div key={f.k} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-[#A0AEC0] font-mono">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: f.c }} />{f.l}
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={PUB_DATA}>
                <defs>
                  {[{ id: 'lai', c: '#3b82f6' }, { id: 'lbio', c: '#8b5cf6' }, { id: 'lcli', c: '#14b8a6' }, { id: 'lqc', c: '#f59e0b' }].map((g) => (
                    <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={g.c} stopOpacity={0.22} /><stop offset="95%" stopColor={g.c} stopOpacity={0} /></linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="m" tick={{ fill: chartTextColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartTextColor, fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
                <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${gridColor}`, borderRadius: 8, fontSize: 12, color: isDark ? '#fff' : '#000' }} />
                <Area type="monotone" dataKey="ai" stroke="#3b82f6" fill="url(#lai)" strokeWidth={2} name={t('trends.fields.aiMl')} />
                <Area type="monotone" dataKey="bio" stroke="#8b5cf6" fill="url(#lbio)" strokeWidth={2} name={t('trends.fields.biotechnology')} />
                <Area type="monotone" dataKey="cli" stroke="#14b8a6" fill="url(#lcli)" strokeWidth={2} name={t('trends.fields.climateScience')} />
                <Area type="monotone" dataKey="qc" stroke="#f59e0b" fill="url(#lqc)" strokeWidth={2} name={t('trends.fields.quantumComputing')} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INSIGHTS.map((ins, i) => {
              const keys = ['llm', 'mrna', 'carbon', 'neuro'];
              const item = t(`insights.${keys[i]}`, { returnObjects: true });
              return (
              <motion.div key={keys[i]} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.09 }} whileHover={{ y: -5 }} className="rounded-xl border p-5 bg-gray-50 dark:bg-[#1B2235] border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ins.c}1A` }}>
                    <TrendingUp size={14} style={{ color: ins.c }} />
                  </div>
                  <span className="text-sm font-black font-mono" style={{ color: ins.c }}>{ins.growth}</span>
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">{item.topic}</div>
                <div className="text-xs leading-relaxed mb-3 text-gray-600 dark:text-[#A0AEC0]">{item.desc}</div>
                <div className="text-xs font-mono text-gray-500 dark:text-gray-400">{ins.papers.toLocaleString()} {t('trends.papersLabel')}</div>
              </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 lg:px-10 bg-gray-50 dark:bg-[#0B1020] transition-colors">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <SectionBadge color="#00D1B2"><Zap size={11} /> {t('features.badge')}</SectionBadge>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-3 font-outfit">{t('features.heading')}</h2>
            <p className="text-gray-600 dark:text-[#A0AEC0]">{t('features.description')}</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ Icon, c }, i) => {
              const keys = ['analytics', 'citations', 'aiRecs', 'viz', 'search', 'forecasting'];
              const item = t(`features.items.${keys[i]}`, { returnObjects: true });
              return (
              <motion.div key={keys[i]} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} whileHover={{ y: -6, scale: 1.02 }} className="rounded-xl border p-6 bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${c}1A` }}>
                  <Icon size={20} style={{ color: c }} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{item.label}</h3>
                <p className="text-xs leading-relaxed text-gray-600 dark:text-[#A0AEC0]">{item.desc}</p>
              </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* API Integrations */}
      <section id="integrations" className="py-24 px-6 lg:px-10 bg-white dark:bg-[#131A2A] transition-colors">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <SectionBadge color="#4F8CFF"><Globe size={11} /> {t('integrations.badge')}</SectionBadge>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-3 font-outfit">{t('integrations.heading')}</h2>
            <p className="text-gray-600 dark:text-[#A0AEC0]">{t('integrations.description')}</p>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {APIS.map((api, i) => (
              <motion.div key={api.name} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -5 }} className="rounded-xl border p-5 bg-gray-50 dark:bg-[#1B2235] border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-500/10">
                    <Globe size={16} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <StatusPill status={api.status} />
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white mb-3">{api.name}</div>
                <div className="space-y-1.5">
                  {[{ l: t('integrations.uptime'), v: `${api.up}%`, c: 'text-teal-600 dark:text-[#00D1B2]' }, { l: t('integrations.latency'), v: api.lat, c: 'text-gray-900 dark:text-white' }, { l: t('integrations.reqPerDay'), v: api.req, c: 'text-gray-900 dark:text-white' }].map((s) => (
                    <div key={s.l} className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-[#A0AEC0]">{s.l}</span>
                      <span className={`font-semibold font-mono ${s.c}`}>{s.v}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 relative overflow-hidden bg-gray-50 dark:bg-[#0B1020] transition-colors">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[320px] rounded-full blur-3xl opacity-10 dark:opacity-12 bg-gradient-to-r from-blue-500 to-purple-600" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-5 font-outfit">{t('cta.heading')}</h2>
            <p className="text-lg mb-10 text-gray-600 dark:text-[#A0AEC0]">{t('cta.description')}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => handleAuthRedirect('login')} className="px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">{t('cta.login')}</motion.button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => handleAuthRedirect('register')} className="px-8 py-3.5 rounded-xl text-sm font-bold border border-gray-300 dark:border-white/15 text-gray-700 dark:text-[#A0AEC0] hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">{t('cta.register')}</motion.button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => handleAuthRedirect('register')} className="px-8 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30">
                {t('cta.exploreDashboard')} <ArrowRight size={14} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6 bg-white dark:bg-[#131A2A] border-gray-200 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600"><Microscope size={10} className="text-white" /></div>
            <span className="text-xs font-black text-gray-900 dark:text-white tracking-widest font-outfit">SCITRACK</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-[#A0AEC0]">{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}