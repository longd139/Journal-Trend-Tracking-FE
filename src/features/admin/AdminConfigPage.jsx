import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw, Settings, Save, Plus, Trash2, Globe,
  CheckCircle2, XCircle, Sliders,
} from 'lucide-react';
import { adminAPI } from './api';

export default function AdminConfigPage() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState({});

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

  const handleEdit = (configKey, value) => {
    setEditing((prev) => ({ ...prev, [configKey]: value }));
  };

  const handleSave = async () => {
    if (Object.keys(editing).length === 0) return;
    setSaving(true);
    try {
      const payload = {};
      Object.entries(editing).forEach(([key, value]) => { payload[key] = value; });
      await adminAPI.updateConfigs(payload);
      setEditing({});
      fetchConfigs();
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-[#101010] via-[#141414] to-[#101010] border-[#DEDBC8]/10"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />
        <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
              <Sliders size={15} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#E1E0CC] font-display">System Configuration</h2>
              <p className="text-[11px] text-gray-500">Manage platform-wide settings and parameters</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchConfigs} disabled={loading}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 bg-white/[0.04] text-gray-400 hover:text-[#E1E0CC] hover:bg-white/[0.08] transition-colors border border-[#DEDBC8]/8">
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button onClick={handleSave} disabled={saving || Object.keys(editing).length === 0}
              className="px-4 py-1.5 rounded-lg text-[11px] font-bold bg-[#DEDBC8] text-black hover:bg-[#E1E0CC] disabled:opacity-40 transition-all flex items-center gap-1.5">
              <Save size={12} />{saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Config cards */}
      <div className="grid gap-3">
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2" />Loading configs...
          </div>
        ) : configs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Settings size={24} className="mx-auto mb-2 opacity-30" />No configurations found
          </div>
        ) : (
          configs.map((cfg) => {
            const isEdited = editing[cfg.configKey] !== undefined;
            const displayValue = isEdited ? editing[cfg.configKey] : cfg.configValue;
            return (
              <motion.div key={cfg.configId} layout
                className={`rounded-2xl border p-5 transition-all ${
                  isEdited
                    ? 'border-[#DEDBC8]/40 bg-[#DEDBC8]/[0.04]'
                    : 'border-[#DEDBC8]/10 bg-[#151922]'
                }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Settings size={13} className="text-[#DEDBC8]" />
                      <h3 className="text-sm font-bold text-[#E1E0CC] font-mono">{cfg.configKey}</h3>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{cfg.description || 'No description'}</p>
                    <input
                      type="text"
                      value={displayValue || ''}
                      onChange={(e) => handleEdit(cfg.configKey, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all bg-[#0f131a] text-[#E1E0CC] placeholder:text-gray-500 border-[#DEDBC8]/20 focus:border-[#DEDBC8]/60 focus:bg-[#111620]"
                    />
                  </div>
                  {isEdited && (
                    <span className="shrink-0 px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      EDITED
                    </span>
                  )}
                </div>
                {cfg.updatedAt && (
                  <div className="mt-3 pt-3 border-t border-[#DEDBC8]/5 flex items-center gap-1 text-[10px] text-gray-500">
                    <RefreshCw size={10} />
                    Updated: {new Date(cfg.updatedAt).toLocaleString()}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
