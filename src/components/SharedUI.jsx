import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

// Thêm chữ export vào đây
export function GlowBadge({ children, color }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{
        background: `${color}1A`,
        color,
        border: `1px solid ${color}44`,
      }}
    >
      {children}
    </span>
  );
}

// Thêm chữ export vào đây
export function StatusPill({ status }) {
  const map = {
    active: { bg: '#00D1B21A', c: '#00D1B2', label: 'Active' },
    idle: { bg: '#F59E0B1A', c: '#F59E0B', label: 'Idle' },
    offline: { bg: '#6B72801A', c: '#6B7280', label: 'Offline' },
    ok: { bg: '#00D1B21A', c: '#00D1B2', label: 'Online' },
    warn: { bg: '#F59E0B1A', c: '#F59E0B', label: 'Degraded' },
    ready: { bg: '#00D1B21A', c: '#00D1B2', label: 'Ready' },
  };
  const s = map[status] ?? map.offline;
  return (
    <span
      className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium"
      style={{ background: s.bg, color: s.c }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.c }} />
      {s.label}
    </span>
  );
}

// Thêm chữ export vào đây
export function StatCard({ label, value, change, Icon, accent }) {
  const up = !change.startsWith('-');
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.18 }}
      className="rounded-xl p-5 border relative overflow-hidden cursor-default"
      style={{ background: '#1B2235', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <div
        className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-10"
        style={{ background: accent }}
      />
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-lg" style={{ background: `${accent}1A` }}>
          <Icon size={16} style={{ color: accent }} />
        </div>
        <span
          className="text-xs font-semibold flex items-center gap-0.5"
          style={{
            color: up ? '#00D1B2' : '#EF4444',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <ArrowUpRight
            size={11}
            style={{ transform: up ? 'none' : 'scaleY(-1)' }}
          />
          {change}
        </span>
      </div>
      <div
        className="text-2xl font-black text-white mb-0.5"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {value}
      </div>
      <div className="text-xs" style={{ color: '#A0AEC0' }}>
        {label}
      </div>
    </motion.div>
  );
}

// Thêm chữ export vào đây
export function SectionBadge({ children, color }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-5 border"
      style={{ background: `${color}1A`, color, borderColor: `${color}44` }}
    >
      {children}
    </div>
  );
}
