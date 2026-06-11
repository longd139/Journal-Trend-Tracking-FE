import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Microscope,
  GraduationCap,
  FlaskConical,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { PARTICLES } from '../../constants/mockData';

// Data cấu hình cho 2 Role (Đã dịch sang tiếng Anh)
const ROLES_DATA = [
  {
    id: 'academic_user',
    title: 'Academic',
    description: 'For students and learners',
    icon: GraduationCap,
    color: '#4F8CFF',
    features: [
      'Access study materials',
      'Track project progress',
      'Join research groups',
    ],
  },
  {
    id: 'researcher',
    title: 'Researcher',
    description: 'For lecturers and researchers',
    icon: FlaskConical,
    color: '#8B5CF6',
    features: [
      'Manage scientific projects',
      'Publish & share papers',
      'Grant permissions to students',
    ],
  },
];

export default function AuthPage({ mode = 'register' }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentMode = location.state?.mode || mode;
  const [selectedRole, setSelectedRole] = useState(null);

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-300 bg-gray-50 dark:bg-[#0B1020]">
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-10 dark:opacity-[0.14] bg-blue-500" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full blur-3xl opacity-10 dark:opacity-10 bg-purple-600" />
        {PARTICLES.slice(0, 18).map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              top: `${p.top}%`,
              background: p.color,
              opacity: 0.18,
            }}
            animate={{ y: [0, -20, 0] }}
            transition={{
              duration: p.dur,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-md mx-6"
      >
        {/* Header Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
            <Microscope size={18} className="text-white" />
          </div>
          <span className="text-lg font-black text-gray-900 dark:text-white tracking-widest" style={{ fontFamily: "'Outfit', sans-serif" }}>
            SCITRACK
          </span>
        </div>

        {/* Khối chứa Form chọn Role */}
        <div className="rounded-2xl border p-8 overflow-hidden bg-white/90 dark:bg-[#1B2235]/85 border-gray-200 dark:border-white/10 backdrop-blur-2xl shadow-xl dark:shadow-none transition-colors duration-300">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Choose your path
            </h2>
            <p className="text-sm text-gray-500 dark:text-[#A0AEC0]">
              Select how you want to use SCITRACK
            </p>
          </div>

          <div className="space-y-4">
            {ROLES_DATA.map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 group overflow-hidden ${
                    isSelected 
                      ? 'shadow-md dark:shadow-none' 
                      : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#131A2A] hover:border-gray-300 dark:hover:border-white/20'
                  }`}
                  style={{
                    backgroundColor: isSelected ? `${role.color}15` : undefined,
                    borderColor: isSelected ? role.color : undefined,
                  }}
                >
                  {isSelected && (
                    <div
                      className="absolute top-0 left-0 h-1 w-full"
                      style={{ background: role.color }}
                    />
                  )}

                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        !isSelected ? 'bg-gray-200 dark:bg-white/5' : ''
                      }`}
                      style={{
                        backgroundColor: isSelected ? role.color : undefined,
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
            whileHover={selectedRole ? { scale: 1.02 } : {}}
            whileTap={selectedRole ? { scale: 0.97 } : {}}
            disabled={!selectedRole}
            onClick={() => {
              // 3. ĐIỀU HƯỚNG SANG TRANG REGISTER VÀ MANG THEO ROLE
              navigate('/register', { state: { role: selectedRole } });
            }}
            className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mt-8 transition-all ${
              selectedRole 
                ? 'text-white shadow-lg shadow-blue-500/20' 
                : 'bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
            style={{
              background: selectedRole ? 'linear-gradient(135deg, #4F8CFF, #8B5CF6)' : undefined,
            }}
          >
            Continue <ArrowRight size={16} />
          </motion.button>
        </div>

        <button
          onClick={() => navigate('/')}
          className="mt-5 w-full text-center text-xs transition-colors text-gray-500 dark:text-[#6B7280] hover:text-gray-900 dark:hover:text-white"
        >
          ← Back to landing page
        </button>
      </motion.div>
    </div>
  );
}