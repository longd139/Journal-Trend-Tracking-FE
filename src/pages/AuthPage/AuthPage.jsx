import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  Microscope,
  GraduationCap,
  FlaskConical,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Zap,
  Sun,
  Moon,
} from 'lucide-react';
import { PARTICLES } from '../../constants/mockData';
import { useTheme } from '../../hooks/useTheme';

export default function AuthPage({ mode = 'register' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('auth');
  const { resolvedTheme, setTheme } = useTheme();

  const currentMode = location.state?.mode || mode;
  const [selectedRole, setSelectedRole] = useState(null);

  // Build roles data using i18n
  const rolesData = [
    {
      id: 'academic_user',
      title: t('roleSelect.academic.title'),
      description: t('roleSelect.academic.description'),
      icon: GraduationCap,
      color: '#4F8CFF',
      features: [
        t('roleSelect.academic.feature1'),
        t('roleSelect.academic.feature2'),
        t('roleSelect.academic.feature3'),
      ],
    },
    {
      id: 'researcher',
      title: t('roleSelect.researcher.title'),
      description: t('roleSelect.researcher.description'),
      icon: FlaskConical,
      color: '#8B5CF6',
      features: [
        t('roleSelect.researcher.feature1'),
        t('roleSelect.researcher.feature2'),
        t('roleSelect.researcher.feature3'),
      ],
    },
  ];

  // 1. KIỂM TRA ĐIỀU HƯỚNG NGAY KHI VÀO TRANG
  useEffect(() => {
    if (currentMode === 'login') {
      navigate('/login');
    }
  }, [currentMode, navigate]);

  // Nếu là login, render null để tránh chớp nhoáng giao diện chọn role trước khi chuyển trang
  if (currentMode === 'login') return null;

  // 2. GIAO DIỆN CHỌN ROLE DÀNH CHO REGISTER
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
         LEFT PANEL — Academic Branding
         ═══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex w-[45%] xl:w-[42%] relative flex-col justify-center items-center bg-white/40 dark:bg-[#0B1020]/60 backdrop-blur-sm border-r border-gray-200/50 dark:border-white/[0.06] transition-colors duration-500">
        {/* Decorative circles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[20%] w-3 h-3 rounded-full bg-blue-400/30" />
          <div className="absolute top-[25%] right-[25%] w-2 h-2 rounded-full bg-purple-400/30" />
          <div className="absolute bottom-[30%] left-[30%] w-4 h-4 rounded-full bg-teal-400/20" />
          <div className="absolute top-[55%] right-[20%] w-2.5 h-2.5 rounded-full bg-blue-400/25" />
          <div className="absolute bottom-[20%] right-[35%] w-3 h-3 rounded-full bg-purple-400/20" />
        </div>

        {/* Center content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative z-10 text-center px-12"
        >
          {/* Logo */}
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

          {/* Instruction card */}
          <div className="rounded-2xl border border-gray-200/60 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04] backdrop-blur-md p-6">
            <div className="text-sm font-bold text-gray-900 dark:text-white mb-1 font-display">
              {t('roleSelect.heading')}
            </div>
            <div className="text-xs text-gray-500 dark:text-[#A0AEC0]">
              {t('roleSelect.subtitle')}
            </div>
          </div>
        </motion.div>

        {/* Bottom accent bar */}
        <div className="absolute bottom-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
         RIGHT PANEL — Role Selection
         ═══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-[460px]"
        >
          {/* Mobile logo (hidden on desktop) */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
              <Microscope size={18} className="text-white" />
            </div>
            <span className="text-lg font-black text-gray-900 dark:text-white tracking-widest font-outfit">SCITRACK</span>
          </div>

          {/* Role Selection Card */}
          <div className="rounded-3xl border border-gray-200/60 dark:border-white/[0.08] p-8 lg:p-10 bg-white/70 dark:bg-[#1B2235]/70 backdrop-blur-2xl shadow-2xl shadow-gray-200/50 dark:shadow-black/20 transition-colors duration-500">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold mb-6 border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Zap size={10} /> {t('roleSelect.heading')}
            </div>

            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-1 font-display tracking-tight">
              {t('roleSelect.heading')}
            </h2>
            <p className="text-sm mb-8 text-gray-500 dark:text-[#A0AEC0]">
              {t('roleSelect.subtitle')}
            </p>

            <div className="space-y-4">
              {rolesData.map((role) => {
                const isSelected = selectedRole === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 group overflow-hidden ${
                      isSelected
                        ? 'shadow-lg dark:shadow-none'
                        : 'border-gray-200 dark:border-white/[0.08] bg-gray-50/50 dark:bg-white/[0.03] hover:border-gray-300 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/[0.06]'
                    }`}
                    style={{
                      backgroundColor: isSelected ? `${role.color}12` : undefined,
                      borderColor: isSelected ? `${role.color}60` : undefined,
                    }}
                  >
                    {isSelected && (
                      <div
                        className="absolute top-0 left-0 h-1 w-full rounded-t-2xl"
                        style={{ background: `linear-gradient(to right, ${role.color}, ${role.color}80)` }}
                      />
                    )}

                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isSelected ? 'shadow-md' : 'bg-gray-200/60 dark:bg-white/[0.06]'
                        }`}
                        style={{
                          backgroundColor: isSelected ? role.color : undefined,
                          boxShadow: isSelected ? `0 4px 12px ${role.color}40` : undefined,
                        }}
                      >
                        <role.icon
                          size={24}
                          style={{ color: isSelected ? '#fff' : role.color }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                          {role.title}
                        </h3>
                        <p className="text-xs mb-3 text-gray-500 dark:text-[#A0AEC0]">
                          {role.description}
                        </p>

                        <ul className="space-y-2">
                          {role.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-300"
                            >
                              <CheckCircle2
                                size={12}
                                style={{ color: role.color }}
                              />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <motion.button
              whileHover={selectedRole ? { scale: 1.01, y: -1 } : {}}
              whileTap={selectedRole ? { scale: 0.98 } : {}}
              disabled={!selectedRole}
              onClick={() => {
                navigate('/register', { state: { role: selectedRole } });
              }}
              className={`w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 mt-8 transition-all duration-300 shadow-lg shadow-blue-500/20 ${
                selectedRole
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500'
              }`}
            >
              {t('roleSelect.continue')}
              {selectedRole ? <ArrowRight size={16} /> : <ArrowRight size={16} />}
            </motion.button>
          </div>

          {/* Back link */}
          <button
            onClick={() => navigate('/')}
            className="mt-6 w-full text-center text-xs transition-colors text-gray-400 dark:text-[#6B7280] hover:text-gray-700 dark:hover:text-white/70 flex items-center justify-center gap-1.5"
          >
            <ArrowLeft size={11} /> {t('roleSelect.backToLanding')}
          </button>
        </motion.div>
      </div>
    </div>
  );
}