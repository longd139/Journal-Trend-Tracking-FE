import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import {
  Sun,
  Moon,
  ArrowLeft,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import ScitrackSLogo from '../../components/prisma/ScitrackSLogo';

/* ═══════════════════════════════════════════════════════════════════════════
   Local cream particles — replaces colored mockData PARTICLES
   ═══════════════════════════════════════════════════════════════════════════ */

const AUTH_PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: ((i * 13) % 5) + 2,
  left: (i * 37 + 7) % 100,
  top: (i * 29 + 11) % 100,
  delay: (i * 0.35) % 6,
  dur: ((i * 0.71) % 8) + 12,
}));

/* ═══════════════════════════════════════════════════════════════════════════
   Left Panel Inner Card
   ═══════════════════════════════════════════════════════════════════════════ */

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
        <div className="rounded-2xl border border-primary/35 bg-muted/25 p-6 backdrop-blur-sm">
          <div className="text-sm font-bold text-foreground mb-1 font-display">
            {t('roleSelect.heading')}
          </div>
          <div className="text-xs text-foreground/80">
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
              className="rounded-2xl border border-primary/35 bg-muted/25 p-6 backdrop-blur-sm"
            >
              <div className="text-3xl font-black text-foreground font-outfit drop-shadow-md">
                {stats[currentStat].value}
              </div>
              <div className="text-xs mt-1 text-foreground/80 font-medium">
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
                  ? 'w-6 h-2 bg-primary'
                  : 'w-2 h-2 bg-primary/20 hover:bg-primary/40'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'register') {
    return (
      <div className="rounded-2xl border border-primary/35 bg-muted/25 p-6 backdrop-blur-sm">
        <div className="text-sm font-bold text-foreground mb-1 font-display">
          {t('register.createFor')}{' '}
          <span className="text-primary uppercase tracking-wider">
            {selectedRole}
          </span>
        </div>
        <div className="text-xs text-foreground/80">
          {selectedRole === 'researcher'
            ? t('register.roleDescResearcher')
            : t('register.roleDescAcademic')}
        </div>
      </div>
    );
  }

  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   AuthLayout
   ═══════════════════════════════════════════════════════════════════════════ */

export default function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('auth');
  const { resolvedTheme, setTheme } = useTheme();

  const pathname = location.pathname;
  const mode = pathname === '/login' ? 'login'
    : pathname === '/register' ? 'register'
    : 'select-role';

  const selectedRole = location.state?.role || null;

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background">
      {/* ─── Background image ─────────────────────────────────────────── */}
      <img
        className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none"
        src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1400&h=900&fit=crop"
        alt=""
      />
      {/* Overlays: subtle in light mode to keep image visible, darker in dark mode */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/60 dark:from-background/60 dark:via-transparent dark:to-background/70 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-background/10 to-transparent dark:from-background/40 dark:via-background/10 dark:to-transparent pointer-events-none" />

      {/* ─── Left panel overlay — form side slightly shaded ──────────── */}
      <div className="absolute left-0 top-0 bottom-0 w-[55%] lg:w-[55%] bg-background/40 dark:bg-background/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-background/20 to-transparent dark:from-background/80 dark:via-background/30 dark:to-transparent pointer-events-none" />

      {/* ─── Noise overlay ────────────────────────────────────────────── */}
      <div className="noise-overlay opacity-[0.04]" style={{ mixBlendMode: 'overlay' }} />

      {/* ─── Single subtle cream ambient glow ──────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-20 w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.04] bg-primary" />
      </div>

      {/* ─── Floating cream particles ─────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        {AUTH_PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              top: `${p.top}%`,
              background: 'var(--primary)',
              opacity: 0.08,
            }}
            animate={{ y: [0, -24, 0], opacity: [0.04, 0.12, 0.04] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* ─── Theme Toggle ─────────────────────────────────────────────── */}
      <button
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className="absolute top-5 right-5 z-50 flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:scale-105 bg-primary/10 text-muted-foreground hover:text-foreground hover:bg-primary/20 border border-primary/35"
        title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* ═════════════════════════════════════════════════════════════════
         LEFT — Form (Outlet)
         ═════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-1 mb-8 lg:hidden">
            <ScitrackSLogo className="text-primary -mr-1 w-7 h-10" />
            <span className="text-lg font-black text-foreground tracking-[0.05em] font-outfit">CITRACK</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════
         RIGHT — Branding (SCITRACK + stats)
         ═════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex w-[45%] relative flex-col justify-center p-10 xl:p-14 overflow-hidden">
        {/* Gradient — subtle vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background/30 dark:from-background/10 dark:via-transparent dark:to-background/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-transparent dark:from-background/20" />

        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center mb-8">
            <ScitrackSLogo className="text-primary -mr-2 w-14 h-20 xl:w-[4rem] xl:h-[5.7rem]" />
            <span className="text-4xl xl:text-5xl font-black text-foreground font-outfit tracking-[0.05em] drop-shadow-lg">
              CITRACK
            </span>
          </div>
          <p className="text-sm text-foreground/80 mb-10 leading-relaxed max-w-sm mx-auto">
            {t('login.platformDesc')}
          </p>

          <LeftPanelCard mode={mode} selectedRole={selectedRole} t={t} />
        </div>
      </div>

      {/* Back to landing */}
      <button
        onClick={() => navigate('/')}
        className="absolute bottom-6 left-6 z-20 text-xs text-foreground/60 hover:text-primary transition-colors flex items-center gap-1.5"
      >
        <ArrowLeft size={11} /> Back to home
      </button>
    </div>
  );
}
