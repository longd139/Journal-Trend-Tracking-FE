import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

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

export function StatusPill({ status }) {
  const { t } = useTranslation('common');
  const map = {
    active: { bg: '#34D3991A', c: '#34D399', label: t('status.active') },
    idle: { bg: '#F59E0B1A', c: '#F59E0B', label: t('status.idle') },
    offline: { bg: '#6B72801A', c: '#6B7280', label: t('status.offline') },
    ok: { bg: '#34D3991A', c: '#34D399', label: t('status.online') },
    warn: { bg: '#F59E0B1A', c: '#F59E0B', label: t('status.degraded') },
    ready: { bg: '#34D3991A', c: '#34D399', label: t('status.ready') },
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

export function StatCard({ label, value, change, Icon, accent }) {
  const up = !change.startsWith('-');
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="rounded-xl p-5 border border-border bg-card relative overflow-hidden cursor-default group"
    >
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-[0.06] group-hover:opacity-[0.10] transition-opacity duration-700"
        style={{ background: accent }}
      />
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-lg" style={{ background: `${accent}12`, color: accent }}>
          <Icon size={16} />
        </div>
        {change && (
          <span
            className="text-xs font-semibold flex items-center gap-0.5"
            style={{ color: up ? '#34D399' : '#EF4444' }}
          >
            <ArrowUpRight
              size={11}
              style={{ transform: up ? 'none' : 'scaleY(-1)' }}
            />
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-card-foreground mb-0.5 font-display tracking-[-0.02em]">
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
}

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
