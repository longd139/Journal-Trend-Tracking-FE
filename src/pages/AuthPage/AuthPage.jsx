import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  FlaskConical,
  CheckCircle2,
  ArrowRight,
  Zap,
} from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('auth');
  const [selectedRole, setSelectedRole] = useState(null);

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

  return (
    <div className="rounded-3xl border border-gray-200/60 dark:border-white/[0.08] p-8 lg:p-10 bg-white/70 dark:bg-[#1B2235]/70 backdrop-blur-2xl shadow-2xl shadow-gray-200/50 dark:shadow-black/20 transition-colors duration-500">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold mb-6 border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
        <Zap size={10} className="drop-shadow-[0_0_6px_rgba(96,165,250,0.6)]" /> {t('roleSelect.heading')}
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
                  className="drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                  style={{ color: isSelected ? '#fff' : role.color, filter: !isSelected ? `drop-shadow(0 2px 6px ${role.color}50)` : undefined }}
                />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{role.title}</h3>
                  <p className="text-xs mb-3 text-gray-500 dark:text-[#A0AEC0]">{role.description}</p>
                  <ul className="space-y-2">
                    {role.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-300">
                        <CheckCircle2 size={12} style={{ color: role.color, filter: `drop-shadow(0 0 4px ${role.color}60)` }} />
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
        <ArrowRight size={16} className="drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]" />
      </motion.button>
    </div>
  );
}
