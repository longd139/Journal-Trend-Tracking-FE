import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Minus, Hash, Calendar, Lightbulb, Tag,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import ExportButtons from './ExportButtons';

/**
 * Keyword Trend Report — formatted result panel.
 *
 * Displays: status badge, stat cards, 5-year BarChart,
 * related keywords (clickable → search), and insight text.
 *
 * @param {object}   props
 * @param {object}   props.data       - KeywordTrendReportResponse from BE
 * @param {function} props.onClose    - Called to dismiss the result
 * @param {function} props.onSave     - Called to save report to history
 * @param {boolean}  props.saving     - Whether save is in progress
 */
export default function KeywordTrendResult({ data, onClose, onSave, saving }) {
  const navigate = useNavigate();
  const role = sessionStorage.getItem('userRole') || 'academic';
  const resultRef = useRef(null);

  if (!data) return null;

  const {
    reportTitle,
    keyword,
    totalPapers,
    yoyGrowthRate,
    status,
    insight,
    topRelatedKeywords = [],
    yearlyBreakdown = [],
  } = data;

  // ── Status color mapping ──
  const statusColors = {
    'Đang bùng nổ': '#34D399',
    'Ổn định': '#F59E0B',
    'Bão hòa': '#EF4444',
    'Không có dữ liệu': '#6B7280',
  };
  const statusColor = statusColors[status] || '#6B7280';

  // ── Growth icon ──
  const GrowthIcon = yoyGrowthRate == null
    ? Minus
    : yoyGrowthRate > 0
      ? TrendingUp
      : TrendingDown;
  const growthColor = yoyGrowthRate == null
    ? '#6B7280'
    : yoyGrowthRate > 0
      ? '#34D399'
      : '#EF4444';

  // ── Navigate to search ──
  const goToSearch = (kw) => {
    navigate(`/${role}/search?q=${encodeURIComponent(kw)}`);
  };

  return (
    <motion.div
      ref={resultRef}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl border border-[#DEDBC8]/10 bg-[#101010] overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between p-5 border-b border-[#DEDBC8]/5">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
            Keyword Trend Report
          </p>
          <h3 className="text-base font-bold text-[#E1E0CC]">
            {reportTitle || `Báo cáo phân tích chủ đề: ${keyword}`}
          </h3>
          <p className="text-sm text-[#4F8CFF] font-mono mt-0.5">
            &quot;{keyword}&quot;
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1"
          >
            ✕
          </button>
        )}
      </div>

      <div className="p-6 space-y-5">
        {/* ── Status Badge + Growth ── */}
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: `${statusColor}1A`,
              color: statusColor,
              border: `1px solid ${statusColor}44`,
            }}
          >
            {status}
          </span>
          {yoyGrowthRate != null && (
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold"
              style={{ color: growthColor }}
            >
              <GrowthIcon size={14} />
              {yoyGrowthRate > 0 ? '+' : ''}{yoyGrowthRate}% YoY
            </span>
          )}
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl p-4 border border-[#DEDBC8]/5 bg-[#0A0A0A]">
            <div className="flex items-center gap-2 mb-2">
              <Hash size={13} className="text-[#4F8CFF]" />
              <span className="text-[10px] uppercase tracking-wider text-gray-500">
                Total Papers
              </span>
            </div>
            <p className="text-xl font-bold text-[#E1E0CC] font-mono tabular-nums">
              {(totalPapers ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl p-4 border border-[#DEDBC8]/5 bg-[#0A0A0A]">
            <div className="flex items-center gap-2 mb-2">
              <GrowthIcon size={13} style={{ color: growthColor }} />
              <span className="text-[10px] uppercase tracking-wider text-gray-500">
                YoY Growth
              </span>
            </div>
            <p
              className="text-xl font-bold font-mono tabular-nums"
              style={{ color: growthColor }}
            >
              {yoyGrowthRate != null
                ? `${yoyGrowthRate > 0 ? '+' : ''}${yoyGrowthRate}%`
                : '—'}
            </p>
          </div>
          <div className="rounded-xl p-4 border border-[#DEDBC8]/5 bg-[#0A0A0A]">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={13} className="text-[#A78BFA]" />
              <span className="text-[10px] uppercase tracking-wider text-gray-500">
                Window
              </span>
            </div>
            <p className="text-xl font-bold text-[#E1E0CC] font-mono tabular-nums">
              {yearlyBreakdown.length}y
            </p>
          </div>
        </div>

        {/* ── Yearly Trend Chart ── */}
        {yearlyBreakdown.length > 0 && (
          <div className="rounded-xl p-5 border border-[#DEDBC8]/5 bg-[#0A0A0A]">
            <h4 className="text-xs font-semibold text-[#E1E0CC] mb-4 flex items-center gap-2">
              <TrendingUp size={13} className="text-[#4F8CFF]" />
              Yearly Publication Trend
            </h4>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={yearlyBreakdown}
                margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(222,219,200,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: 12,
                    fontSize: 12,
                    color: '#E1E0CC',
                  }}
                  formatter={(value) => [value.toLocaleString(), 'Papers']}
                  labelFormatter={(label) => `Year ${label}`}
                />
                <Bar
                  dataKey="paperCount"
                  fill="#4F8CFF"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                  name="Papers"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Related Keywords ── */}
        {topRelatedKeywords.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-[#E1E0CC] mb-2.5 flex items-center gap-2">
              <Tag size={13} className="text-[#DEDBC8]" />
              Related Topics
            </h4>
            <div className="flex flex-wrap gap-2">
              {topRelatedKeywords.map((kw) => (
                <button
                  key={kw}
                  onClick={() => goToSearch(kw)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200
                    bg-[#DEDBC8]/5 border-[#DEDBC8]/10 text-[#DEDBC8]
                    hover:bg-[#DEDBC8]/12 hover:border-[#DEDBC8]/25 hover:text-[#E1E0CC]"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Insight ── */}
        {insight && (
          <div className="rounded-xl p-4 border border-[#DEDBC8]/5 bg-[#0A0A0A]">
            <h4 className="text-xs font-semibold text-[#E1E0CC] mb-2 flex items-center gap-2">
              <Lightbulb size={13} className="text-[#F59E0B]" />
              Insight
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed">{insight}</p>
          </div>
        )}

        {/* ── Actions ── */}
        <ExportButtons
          contentRef={resultRef}
          jsonData={data}
          filename={`keyword_trend_${keyword || 'report'}`}
          accentColor="#3B82F6"
          onSave={onSave}
          saving={saving}
        />
      </div>
    </motion.div>
  );
}
