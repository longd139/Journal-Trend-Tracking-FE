import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import {
  Microscope,
  Zap,
  Sun,
  Moon,
  GraduationCap,
  FlaskConical,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PARTICLES } from '../constants/mockData';
import { useTheme } from '../hooks/useTheme';

// ─── Constants ──────────────────────────────────────────────────────────────

const HEX_NODES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: 15 + (i % 4) * 22,
  y: 12 + Math.floor(i / 4) * 30,
  size: 3 + (i % 3),
  delay: i * 0.25,
  color: ['#4F8CFF', '#8B5CF6', '#00D1B2', '#F59E0B'][i % 4],
}));

// ─── Left Panel Inner Card ──────────────────────────────────────────────────

function LeftPanelCard({ mode, selectedRole, t }) {
  const [currentStat, setCurrentStat] = useState(0);

  const stats = [
    { value: '50M+', label: t('login.statsPapers') },
    { value: '98.7%', label: t('login.statsUptime') },
    { value: '12K+', label: t('login.statsResearchers') },
    { value: '4 APIs', label: t('login.statsApis') },
  ];

  useEffect(() => {
    if (mode !== 'login' && mode !== 'forgot-password') return;
    const timer = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [mode]);

  if (mode === 'select-role') {
    return (
      <div>
        <div className="rounded-2xl border border-gray-200/60 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04] backdrop-blur-md p-6">
          <div className="text-sm font-bold text-gray-900 dark:text-white mb-1 font-display">
            {t('roleSelect.heading')}
          </div>
          <div className="text-xs text-gray-500 dark:text-[#A0AEC0]">
            {t('roleSelect.subtitle')}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'login' || mode === 'forgot-password') {
    return (
      <div>
        <div className="relative h-28 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStat}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-gray-200/60 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04] backdrop-blur-md p-6"
            >
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 font-outfit">
                {stats[currentStat].value}
              </div>
              <div className="text-xs mt-1 text-gray-500 dark:text-[#A0AEC0] font-medium">
                {stats[currentStat].label}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {stats.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStat(i)}
              className={`rounded-full transition-all duration-300 ${
                i === currentStat
                  ? 'w-6 h-2 bg-gradient-to-r from-blue-500 to-purple-600'
                  : 'w-2 h-2 bg-gray-300 dark:bg-white/20 hover:bg-gray-400 dark:hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'register') {
    return (
      <div className="rounded-2xl border border-gray-200/60 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04] backdrop-blur-md p-6">
        <div className="text-sm font-bold text-gray-900 dark:text-white mb-1 font-display">
          {t('register.createFor')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 uppercase tracking-wider">
            {selectedRole}
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-[#A0AEC0]">
          {selectedRole === 'researcher'
            ? t('register.roleDescResearcher')
            : t('register.roleDescAcademic')}
        </div>
      </div>
    );
  }

  return null;
}

// ══════════════════════════════════════════════════════════════════════════════
// AUTH LAYOUT
// ══════════════════════════════════════════════════════════════════════════════

export default function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('auth');
  const { resolvedTheme, setTheme } = useTheme();

  // Determine current mode from pathname
  const pathname = location.pathname;
  const mode = pathname === '/login' ? 'login'
    : pathname === '/register' ? 'register'
    : 'select-role';

  const selectedRole = location.state?.role || null;

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-[#0B1020] dark:via-[#0D1528] dark:to-[#0B1020] transition-colors duration-500">
      {/* ─── Background ambient glows ─────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.12] dark:opacity-[0.08] bg-blue-500 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.10] dark:opacity-[0.06] bg-purple-600 animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.06] dark:opacity-[0.04] bg-teal-500 animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* ─── Floating particles ──────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        {PARTICLES.slice(0, 12).map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{ width: p.size, height: p.size, left: `${p.left}%`, top: `${p.top}%`, background: p.color, opacity: 0.12 }}
            animate={{ y: [0, -24, 0], opacity: [0.08, 0.2, 0.08] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* ─── Theme Toggle ────────────────────────────────────────────── */}
      <button
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className="absolute top-5 right-5 z-50 flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:scale-105 bg-white/70 dark:bg-white/10 text-gray-600 dark:text-[#A0AEC0] hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/20 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 shadow-sm"
        title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* ═══════════════════════════════════════════════════════════════
         LEFT PANEL — Static Branding (never re-animates)
         ═══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex w-[45%] xl:w-[42%] relative flex-col justify-center items-center bg-white/40 dark:bg-[#0B1020]/60 backdrop-blur-sm border-r border-gray-200/50 dark:border-white/[0.06] transition-colors duration-500">
        {/* Hex grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] dark:opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hexGrid" width="56" height="98" patternUnits="userSpaceOnUse">
              <path d="M28 0L56 16.2V48.5L28 64.7L0 48.5V16.2Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-900 dark:text-white" />
              <path d="M28 98L56 81.8V49.5L28 33.3L0 49.5V81.8Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-900 dark:text-white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexGrid)" />
        </svg>

        {/* Connecting lines between nodes */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06] dark:opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
          {HEX_NODES.map((node, i) => {
            const next = HEX_NODES[(i + 1) % HEX_NODES.length];
            return (
              <motion.line
                key={`line-${i}`}
                x1={`${node.x}%`} y1={`${node.y}%`}
                x2={`${next.x}%`} y2={`${next.y}%`}
                stroke={node.color}
                strokeWidth="0.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 2, delay: node.delay * 0.5, ease: 'easeInOut' }}
              />
            );
          })}
        </svg>

        {/* Animated nodes */}
        {HEX_NODES.map((node) => (
          <motion.div
            key={node.id}
            className="absolute rounded-full"
            style={{ left: `${node.x}%`, top: `${node.y}%`, width: node.size * 2, height: node.size * 2, background: node.color }}
            animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3 + node.delay, delay: node.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {/* Center content — static, no entrance animation */}
        <div className="relative z-10 text-center px-12">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-8 bg-gradient-to-br from-blue-500 via-purple-500 to-teal-400 shadow-2xl shadow-blue-500/20"
            whileHover={{ scale: 1.05, rotate: -3 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Microscope size={34} className="text-white" />
          </motion.div>

          <h1 className="text-4xl xl:text-5xl font-black text-gray-900 dark:text-white mb-3 font-outfit tracking-tight">
            SCITRACK
          </h1>
          <p className="text-sm text-gray-500 dark:text-[#A0AEC0] mb-10 leading-relaxed max-w-sm mx-auto">
            {t('login.platformDesc')}
          </p>

          <LeftPanelCard mode={mode} selectedRole={selectedRole} t={t} />
        </div>

        <div className="absolute bottom-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
         RIGHT PANEL — Animated page switching via Outlet
         ═══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[460px]">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
              <Microscope size={18} className="text-white" />
            </div>
            <span className="text-lg font-black text-gray-900 dark:text-white tracking-widest font-outfit">SCITRACK</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>

          {/* Back link */}
          <button
            onClick={() => navigate('/')}
            className="mt-6 w-full text-center text-xs transition-colors text-gray-400 dark:text-[#6B7280] hover:text-gray-700 dark:hover:text-white/70 flex items-center justify-center gap-1.5"
          >
            <ArrowLeft size={11} /> {t('roleSelect.backToLanding')}
          </button>
        </div>
      </div>
    </div>
  );
}
