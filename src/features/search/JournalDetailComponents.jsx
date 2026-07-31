import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  TrendingUp, Library, Globe, Hash, User,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import FollowButton from '../follows/FollowButton';

/* ═══════════════════════════════════════════════════════════════════════════
   Shared journal detail components — used by SearchJournal & JournalProfilePage
   ═══════════════════════════════════════════════════════════════════════════ */

const Q_COLORS = { Q1: '#34D399', Q2: '#F59E0B', Q3: '#FB923C', Q4: '#EF4444' };

/* ── JournalHeader ── */
export function JournalHeader({ journal }) {
  if (!journal) return null;
  const qColor = Q_COLORS[journal.quartile] || 'var(--muted-foreground)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-border bg-card-recessed p-6 space-y-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Library size={18} className="text-primary/40" />
            <h2 className="text-lg font-bold text-foreground font-display">
              {journal.journalName}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-foreground/60">
            {journal.publisher && (
              <span className="flex items-center gap-1">
                <Globe size={11} />
                {journal.publisher}
              </span>
            )}
            {journal.issn && (
              <span className="flex items-center gap-1">
                <Hash size={11} />
                ISSN {journal.issn}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <FollowButton
            journalId={journal.journalId}
            journalName={journal.journalName}
          />
          {journal.impactFactor != null && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <TrendingUp size={12} className="text-amber-400" />
              <span className="text-xs font-bold text-amber-400">IF {journal.impactFactor}</span>
            </div>
          )}
          {journal.quartile && (
            <span
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: `${qColor}18`, color: qColor, border: `1px solid ${qColor}30` }}
            >
              {journal.quartile}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── TimelineChart ── */
export function JournalTimelineChart({ timeline }) {
  if (!timeline || timeline.length === 0) return null;

  const sorted = [...timeline].sort((a, b) => a.year - b.year);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-border bg-card-recessed p-6 space-y-4"
    >
      <div className="flex items-center gap-2">
        <TrendingUp size={14} className="text-primary/40" />
        <span className="text-[11px] uppercase tracking-wider font-bold text-foreground/60">
          Publication Timeline
        </span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sorted} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="paperGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="citationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="year"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: 'var(--popover-foreground)', fontWeight: 600 }}
              itemStyle={{ color: 'var(--popover-foreground)' }}
            />
            <Area
              type="monotone"
              dataKey="paperCount"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#paperGradient)"
              name="Papers"
            />
            <Area
              type="monotone"
              dataKey="citationCount"
              stroke="var(--chart-4)"
              strokeWidth={2}
              fill="url(#citationGradient)"
              name="Citations"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-[11px] text-foreground/60">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
          Papers
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--chart-4)' }} />
          Citations
        </span>
      </div>
    </motion.div>
  );
}

/* ── TopAuthors ── */
export function JournalTopAuthors({ authors, isLocked }) {
  if (!authors || authors.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-border bg-card-recessed p-6 space-y-4"
    >
      <div className="flex items-center gap-2">
        <User size={14} className="text-primary/40" />
        <span className="text-[11px] uppercase tracking-wider font-bold text-foreground/60">
          Top Authors
        </span>
        <span className="text-[10px] text-foreground/60 ml-auto">By total citations</span>
      </div>

      <div className="space-y-2">
        {authors.map((author, i) => {
          const isBlurred = isLocked && i < 3;
          return (
            <motion.div
              key={author.authorName || i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
              className={`relative flex items-center gap-4 px-4 py-3 rounded-xl bg-primary/[0.03] border border-border hover:bg-primary/[0.06] transition-colors ${
                isBlurred ? 'blur-[4px] select-none pointer-events-none' : ''
              }`}
            >
              <span className="w-5 text-xs font-bold text-foreground/60 text-center">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{author.authorName}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-xs font-bold text-foreground">{author.paperCount}</p>
                  <p className="text-[10px] text-foreground/60">Papers</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-foreground">{author.totalCitations?.toLocaleString()}</p>
                  <p className="text-[10px] text-foreground/60">Citations</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-muted-foreground">{author.avgCitationsPerPaper?.toFixed(1)}</p>
                  <p className="text-[10px] text-foreground/60">Avg</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ── TopKeywords ── */
export function JournalTopKeywords({ keywords }) {
  if (!keywords || keywords.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Hash size={12} className="text-primary/30" />
      {keywords.map((kw) => (
        <span
          key={kw}
          className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-accent-blue/10 text-accent-blue border border-accent-blue/20"
        >
          {kw}
        </span>
      ))}
    </div>
  );
}
