import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  RefreshCw, Save, Search, Settings,
  CheckCircle2, Clock, Sliders, ChevronDown,
} from 'lucide-react';
import { adminAPI } from './api';
import SearchWithHistory from '../../components/SearchWithHistory';

/* ═══════════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Infer a config group from its key prefix.
 * Returns { id, label, icon, accent }.
 */
const CATEGORIES = [
  { id: 'academic',  label: 'Academic Limits',         prefix: 'academic_', icon: '🎓', accent: '#A78BFA' },
  { id: 'sync',      label: 'Sync Configuration',     prefix: 'sync_',     icon: '🔄', accent: '#22D3EE' },
  { id: 'trend',     label: 'Trend Detection',         prefix: 'trend_',   icon: '📈', accent: '#34D399' },
  { id: 'auto_sync', label: 'Auto Sync',               prefix: 'auto_sync_', icon: '⏰', accent: '#F59E0B' },
  { id: 'other',     label: 'Other',                   prefix: '',         icon: '⚙️', accent: '#6B7280' },
];

function detectCategory(key) {
  for (const cat of CATEGORIES) {
    if (cat.prefix && key.startsWith(cat.prefix)) return cat;
  }
  return CATEGORIES[CATEGORIES.length - 1]; // 'other'
}

/**
 * Infer input type from config key name & current value.
 */
function detectInputType(key, value) {
  // Boolean indicators
  if (/enabled|active|notify|toggle/i.test(key)) return 'boolean';
  // Datetime indicators
  if (/time|date|last_.*_at/i.test(key)) return 'datetime';
  // Decimal indicators
  if (/threshold|score|rate|factor/i.test(key)) return 'number';
  // Integer indicators
  if (/limit|count|size|hours|interval|max|top/i.test(key)) return 'number';
  // Fallback: try parsing current value
  if (/^\d+\.?\d*$/.test(String(value))) return 'number';
  if (/^true|false$/i.test(String(value))) return 'boolean';
  return 'text';
}

/**
 * Friendly label derived from configKey.
 * "academic_monthly_search_limit" → "Monthly Search Limit"
 */
function friendlyLabel(key) {
  return key
    .replace(/^(academic_|sync_|trend_|auto_sync_)/, '')
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/* ═══════════════════════════════════════════════════════════════════════════
   Neon palette tokens
   ═══════════════════════════════════════════════════════════════════════════ */

const NEON = {
  primary: '#DEDBC8',
  accent: '#DEDBC8',
  success: '#34D399',
};

/* ── Hook: track previous value ── */

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => { ref.current = value; });
  return ref.current;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════════════════ */

function ConfigToggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-all duration-200 focus-visible:outline-none"
      style={{
        background: checked
          ? '#DEDBC8'
          : 'rgba(255,255,255,0.06)',
        boxShadow: checked ? '0 0 12px rgba(222,219,200,0.2)' : 'none',
      }}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════════════════ */

export default function AdminConfigPage() {
  const { t } = useTranslation('admin');
  const { t: tc } = useTranslation('common');
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [expandedGroups, setExpandedGroups] = useState(() => new Set());

  /* ── Accordion logic ── */

  const toggleGroup = (id) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const all = activeTab === 'all'
      ? CATEGORIES.map((c) => c.id)
      : [activeTab];
    setExpandedGroups(new Set(all));
  };

  const collapseAll = () => setExpandedGroups(new Set());

  // Auto-open groups on search
  const prevSearch = usePrevious(search);
  useEffect(() => {
    if (search.trim()) {
      const matching = new Set();
      for (const cfg of configs) {
        const q = search.toLowerCase();
        if (
          cfg.configKey.toLowerCase().includes(q) ||
          (cfg.description || '').toLowerCase().includes(q)
        ) {
          matching.add(detectCategory(cfg.configKey).id);
        }
      }
      setExpandedGroups(matching);
    } else if (prevSearch && !search) {
      // Search cleared → restore default (first group open)
      const defaultSet = new Set();
      if (CATEGORIES.length > 0) defaultSet.add(CATEGORIES[0].id);
      setExpandedGroups(defaultSet);
    }
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getConfigs();
      setConfigs(res?.data || []);
    } catch {
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfigs(); }, []);

  /* ── Helpers ── */

  const handleEdit = (configKey, rawValue) => {
    setEditing((prev) => ({ ...prev, [configKey]: String(rawValue) }));
  };

  const handleSave = async () => {
    if (Object.keys(editing).length === 0) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      await adminAPI.updateConfigs({ ...editing });
      setEditing({});
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      fetchConfigs();
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const editedCount = Object.keys(editing).length;

  /* ── Group + filter ── */

  const grouped = useMemo(() => {
    const map = {};
    for (const cfg of configs) {
      const cat = detectCategory(cfg.configKey);
      if (!map[cat.id]) map[cat.id] = { ...cat, items: [] };
      map[cat.id].items.push(cfg);
    }
    return map;
  }, [configs]);

  const allTabs = [{ id: 'all', label: 'All', accent: '#FFFFFF' }, ...CATEGORIES];

  const filtered = useMemo(() => {
    let list = configs;
    if (activeTab !== 'all') {
      list = list.filter((cfg) => detectCategory(cfg.configKey).id === activeTab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (cfg) =>
          cfg.configKey.toLowerCase().includes(q) ||
          (cfg.description || '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [configs, activeTab, search]);

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* ═══ HEADER ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-[#101010] via-[#141414] to-[#101010] border-[#DEDBC8]/10"
      >
        <div
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#DEDBC8]/60 to-transparent"
        />

        <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl bg-[#DEDBC8]/10"
            >
              <Sliders size={15} className="text-[#DEDBC8]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-display tracking-wide">
                {t('configs.title')}
              </h2>
              <p className="text-[11px] text-gray-500">{t('configs.description')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1 text-[10px] text-[#34D399] font-semibold"
              >
                <CheckCircle2 size={11} />
                Saved
              </motion.span>
            )}
            <button
              onClick={fetchConfigs}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/[0.06] active:scale-[0.97] transition-all duration-150 border border-white/5"
            >
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
              {tc('actions.refresh')}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || editedCount === 0}
              className="px-4 py-1.5 rounded-lg text-[11px] font-bold text-black disabled:opacity-30 active:scale-[0.97] transition-all duration-150 flex items-center gap-1.5"
              style={{
                background:
                  editedCount > 0
                    ? '#DEDBC8'
                    : 'rgba(255,255,255,0.05)',
                color: editedCount > 0 ? '#000' : '#666',
                boxShadow: editedCount > 0
                  ? '0 0 20px rgba(222,219,200,0.25)'
                  : 'none',
              }}
            >
              <Save size={12} />
              {saving ? t('configs.saving') : t('configs.saveChanges')}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ═══ MAIN CONTENT WRAPPER (max 960px, centered) ═══ */}
      <div className="max-w-[960px] mx-auto space-y-5">

      {/* ═══ SEARCH + TABS ═══ */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Search */}
        <SearchWithHistory
          storageKey="admin-configs"
          value={search}
          onChange={setSearch}
          onSearch={setSearch}
          placeholder="Search configs..."
          className="w-full pl-9 pr-4 py-2 rounded-xl text-xs outline-none transition-all duration-200 bg-white/[0.03] text-gray-300 placeholder:text-gray-600 border border-white/5 focus:border-[#DEDBC8]/30"
          wrapperClassName="relative flex-1 max-w-xs w-full"
          icon={<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-gray-500" />}
          inputStyle={{ boxShadow: search ? '0 0 20px rgba(222,219,200,0.04)' : 'none' }}
        />

        {/* Tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          {allTabs.map((tab) => {
            const count =
              tab.id === 'all'
                ? configs.length
                : (grouped[tab.id]?.items?.length ?? 0);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 active:scale-[0.97]"
                style={{
                  background: isActive ? `${tab.accent}15` : 'transparent',
                  color: isActive ? tab.accent : '#666',
                  border: `1px solid ${isActive ? `${tab.accent}30` : 'transparent'}`,
                  boxShadow: isActive ? `0 0 16px ${tab.accent}08` : 'none',
                }}
              >
                {tab.label}
                <span
                  className="ml-1.5 px-1 py-0.5 rounded text-[9px] font-mono"
                  style={{
                    background: isActive ? `${tab.accent}20` : 'rgba(255,255,255,0.04)',
                    color: isActive ? tab.accent : '#555',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ CONFIG ACCORDION ═══ */}
      <div className="space-y-1">
        {/* Expand / Collapse controls */}
        {configs.length > 0 && (
          <div className="flex items-center justify-end gap-2 px-1 pb-2">
            <button onClick={expandAll} className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors">
              Expand all
            </button>
            <span className="text-gray-700">·</span>
            <button onClick={collapseAll} className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors">
              Collapse all
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-2 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl px-4 py-3"
                style={{ background: 'rgba(13,13,26,0.3)' }}
              >
                <div className="h-3 w-32 bg-[#DEDBC8]/8 rounded" />
                <div className="h-3 w-48 bg-white/5 rounded flex-1" />
                <div className="h-7 w-28 bg-white/5 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="p-4 rounded-2xl mb-4"
              style={{ background: 'rgba(222,219,200,0.05)', border: '1px solid rgba(222,219,200,0.1)' }}
            >
              <Settings size={28} className="text-[#DEDBC8]/30" />
            </div>
            <p className="text-sm text-gray-500">
              {search ? 'No configs match your search' : t('configs.noConfigsFound')}
            </p>
          </div>
        ) : (
          /* ── Category sections ── */
          (activeTab !== 'all'
            ? [filtered]
            : CATEGORIES.map((cat) => grouped[cat.id]?.items ?? []).filter((arr) => arr.length > 0)
          ).map((items, si) => {
            const cat = detectCategory(items[0]?.configKey || '');
            const isExpanded = expandedGroups.has(cat.id);
            const hasItems = items.length > 0;

            if (!hasItems) return null;

            // When searching, hide groups with no matches
            if (search.trim()) {
              const q = search.toLowerCase();
              const matches = items.some(
                (cfg) =>
                  cfg.configKey.toLowerCase().includes(q) ||
                  (cfg.description || '').toLowerCase().includes(q),
              );
              if (!matches) return null;
            }

            return (
              <div key={cat.id} className="mb-2">
                {/* Accordion header */}
                <button
                  onClick={() => toggleGroup(cat.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 group active:scale-[0.99]"
                  style={{ background: isExpanded ? 'rgba(222,219,200,0.03)' : 'transparent' }}
                >
                  <motion.div
                    animate={{ rotate: isExpanded ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={13} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                  </motion.div>
                  <div
                    className="w-[3px] h-[14px] rounded-full shrink-0 transition-all duration-200"
                    style={{
                      background: cat.accent,
                      opacity: isExpanded ? 1 : 0.35,
                      boxShadow: isExpanded ? `0 0 8px ${cat.accent}40` : 'none',
                    }}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
                    {cat.label}
                  </span>
                  <span className="text-[10px] text-gray-600 font-mono">({items.length})</span>

                  {/* Dirty badge in header */}
                  {isExpanded && items.some((cfg) => editing[cfg.configKey] !== undefined) && (
                    <span className="ml-auto flex items-center gap-1 text-[9px] text-[#DEDBC8] font-semibold">
                      <span className="flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full opacity-75 bg-[#DEDBC8]" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#DEDBC8]" />
                      </span>
                      edited
                    </span>
                  )}
                </button>

                {/* Accordion body */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden rounded-xl"
                      style={{ border: '1px solid rgba(222,219,200,0.06)' }}
                    >
                      <div className="grid grid-cols-2" style={{ borderBottom: '1px solid rgba(222,219,200,0.04)' }}>
                        {items.map((cfg, idx) => {
                          const isEdited = editing[cfg.configKey] !== undefined;
                          const inputType = detectInputType(cfg.configKey, cfg.configValue);
                          const displayValue = isEdited ? editing[cfg.configKey] : cfg.configValue;
                          const isBoolean = inputType === 'boolean';
                          const isChecked = isBoolean && (isEdited ? editing[cfg.configKey] === 'true' : cfg.configValue === 'true');
                          const isLastRow = idx >= items.length - 2;
                          const isLeftCol = idx % 2 === 0;

                          return (
                            <motion.div
                              key={cfg.configId}
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: idx * 0.02 }}
                              className={`grid grid-cols-[1fr_auto] gap-3 px-3 items-center h-[56px] overflow-hidden ${
                                isLeftCol ? 'border-r border-[rgba(222,219,200,0.04)]' : ''
                              } ${!isLastRow ? 'border-b border-[rgba(222,219,200,0.04)]' : ''}`}
                              style={{
                                background: isEdited ? 'rgba(222,219,200,0.03)' : 'rgba(13,13,26,0.3)',
                              }}
                              title={`${friendlyLabel(cfg.configKey)} (${cfg.configKey})${cfg.description ? ': ' + cfg.description : ''}`}
                            >
                              {/* Left: name + desc — single line, no wrap */}
                              <div className="min-w-0 truncate">
                                <span className="text-[13px] font-bold text-white font-mono tracking-tight truncate block">
                                  {friendlyLabel(cfg.configKey)}
                                </span>
                                {cfg.description && (
                                  <span className="text-[11px] text-gray-500 truncate block leading-tight">
                                    {cfg.description}
                                  </span>
                                )}
                              </div>

                              {/* Right: input + timestamp */}
                              <div className="flex items-center gap-2 shrink-0">
                                {isBoolean ? (
                                  <ConfigToggle
                                    checked={isChecked}
                                    onChange={(v) => handleEdit(cfg.configKey, v ? 'true' : 'false')}
                                  />
                                ) : inputType === 'number' ? (
                                  <input
                                    type="number"
                                    value={displayValue ?? ''}
                                    onChange={(e) => handleEdit(cfg.configKey, e.target.value)}
                                    className="w-24 px-3 py-1.5 rounded-lg text-sm outline-none transition-all duration-200 font-mono text-right"
                                    style={{
                                      background: isEdited ? 'rgba(222,219,200,0.05)' : 'rgba(255,255,255,0.02)',
                                      color: '#E1E0CC',
                                      border: `1px solid ${isEdited ? 'rgba(222,219,200,0.3)' : 'rgba(222,219,200,0.08)'}`,
                                      boxShadow: isEdited ? '0 0 15px rgba(222,219,200,0.05)' : 'none',
                                    }}
                                    onFocus={(e) => {
                                      e.target.style.borderColor = 'rgba(222,219,200,0.5)';
                                      e.target.style.boxShadow = '0 0 20px rgba(222,219,200,0.08)';
                                    }}
                                    onBlur={(e) => {
                                      e.target.style.borderColor = isEdited ? 'rgba(222,219,200,0.3)' : 'rgba(222,219,200,0.08)';
                                      e.target.style.boxShadow = isEdited ? '0 0 15px rgba(222,219,200,0.05)' : 'none';
                                    }}
                                  />
                                ) : inputType === 'datetime' ? (
                                  <span className="text-xs text-gray-500 font-mono tabular-nums">
                                    {cfg.configValue
                                      ? new Date(cfg.configValue).toLocaleString()
                                      : '—'}
                                  </span>
                                ) : (
                                  <input
                                    type="text"
                                    value={displayValue ?? ''}
                                    onChange={(e) => handleEdit(cfg.configKey, e.target.value)}
                                    className="w-32 px-3 py-1.5 rounded-lg text-sm outline-none transition-all duration-200 font-mono"
                                    style={{
                                      background: isEdited ? 'rgba(222,219,200,0.05)' : 'rgba(255,255,255,0.02)',
                                      color: '#E1E0CC',
                                      border: `1px solid ${isEdited ? 'rgba(222,219,200,0.3)' : 'rgba(222,219,200,0.08)'}`,
                                      boxShadow: isEdited ? '0 0 15px rgba(222,219,200,0.05)' : 'none',
                                    }}
                                    onFocus={(e) => {
                                      e.target.style.borderColor = 'rgba(222,219,200,0.5)';
                                      e.target.style.boxShadow = '0 0 20px rgba(222,219,200,0.08)';
                                    }}
                                    onBlur={(e) => {
                                      e.target.style.borderColor = isEdited ? 'rgba(222,219,200,0.3)' : 'rgba(222,219,200,0.08)';
                                      e.target.style.boxShadow = isEdited ? '0 0 15px rgba(222,219,200,0.05)' : 'none';
                                    }}
                                  />
                                )}

                                {/* Dirty indicator */}
                                {isEdited && (
                                  <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex h-2 w-2 shrink-0"
                                  >
                                    <span
                                      className="animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-75"
                                      style={{ background: NEON.primary }}
                                    />
                                    <span
                                      className="relative inline-flex rounded-full h-2 w-2"
                                      style={{ background: NEON.primary }}
                                    />
                                  </motion.span>
                                )}

                                {/* Timestamp icon */}
                                {cfg.updatedAt && !isEdited && (
                                  <span
                                    className="group/tip relative shrink-0"
                                    title={new Date(cfg.updatedAt).toLocaleString()}
                                  >
                                    <Clock size={11} className="text-gray-600 hover:text-gray-400 transition-colors cursor-help" />
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
      </div>

      {/* ═══ UNSAVED CHANGES BAR ═══ */}
      <AnimatePresence>
        {editedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div
              className="px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-2xl backdrop-blur-xl"
              style={{
                background: 'rgba(13,13,26,0.9)',
                border: '1px solid rgba(222,219,200,0.2)',
                
              }}
            >
              <span className="text-xs text-gray-400">
                {editedCount} unsaved change{editedCount > 1 ? 's' : ''}
              </span>
              <div className="w-px h-4 bg-white/5" />
              <button
                onClick={() => setEditing({})}
                className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3.5 py-1 rounded-lg text-[11px] font-bold text-black transition-all"
                style={{
                  background: '#DEDBC8',
                  boxShadow: '0 0 20px rgba(222,219,200,0.2)',
                }}
              >
                {saving ? 'Saving...' : `Save (${editedCount})`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
