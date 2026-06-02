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

// Data cấu hình cho 2 Role
const ROLES_DATA = [
  {
    id: 'student',
    title: 'Student',
    description: 'Dành cho sinh viên, học viên',
    icon: GraduationCap,
    color: '#4F8CFF',
    features: [
      'Truy cập tài liệu học tập',
      'Theo dõi tiến độ đồ án',
      'Tham gia nhóm nghiên cứu',
    ],
  },
  {
    id: 'researcher',
    title: 'Researcher',
    description: 'Dành cho giảng viên, nhà nghiên cứu',
    icon: FlaskConical,
    color: '#8B5CF6',
    features: [
      'Quản lý dự án khoa học',
      'Xuất bản & chia sẻ bài báo',
      'Cấp quyền cho sinh viên',
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
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#0B1020' }}
    >
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-[0.14]"
          style={{ background: '#4F8CFF' }}
        />
        <div
          className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full blur-3xl opacity-10"
          style={{ background: '#8B5CF6' }}
        />
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
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4F8CFF, #8B5CF6)' }}
          >
            <Microscope size={18} className="text-white" />
          </div>
          <span
            className="text-lg font-black text-white tracking-widest"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            SCITRACK
          </span>
        </div>

        {/* Khối chứa Form chọn Role */}
        <div
          className="rounded-2xl border p-8 overflow-hidden"
          style={{
            background: 'rgba(27,34,53,0.85)',
            borderColor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <div className="text-center mb-8">
            <h2
              className="text-2xl font-black text-white mb-2"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Choose your path
            </h2>
            <p className="text-sm" style={{ color: '#A0AEC0' }}>
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
                  className="relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 group overflow-hidden"
                  style={{
                    background: isSelected ? `${role.color}15` : '#131A2A',
                    borderColor: isSelected
                      ? role.color
                      : 'rgba(255,255,255,0.08)',
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
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                      style={{
                        background: isSelected
                          ? role.color
                          : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <role.icon
                        size={24}
                        style={{ color: isSelected ? '#fff' : role.color }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-white mb-1">
                        {role.title}
                      </h3>
                      <p className="text-xs mb-3" style={{ color: '#A0AEC0' }}>
                        {role.description}
                      </p>

                      <ul className="space-y-2">
                        {role.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-xs"
                            style={{ color: '#CBD5E1' }}
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
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-8 transition-all"
            style={{
              background: selectedRole
                ? 'linear-gradient(135deg, #4F8CFF, #8B5CF6)'
                : 'rgba(255,255,255,0.1)',
              opacity: selectedRole ? 1 : 0.5,
              cursor: selectedRole ? 'pointer' : 'not-allowed',
            }}
          >
            Continue <ArrowRight size={16} />
          </motion.button>
        </div>

        <button
          onClick={() => navigate('/')}
          className="mt-5 w-full text-center text-xs transition-colors hover:text-white"
          style={{ color: '#6B7280' }}
        >
          ← Back to landing page
        </button>
      </motion.div>
    </div>
  );
}
