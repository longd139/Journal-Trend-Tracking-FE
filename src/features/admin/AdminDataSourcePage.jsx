import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw, Plus, Trash2, Globe, CheckCircle2, XCircle,
  Database, X, Edit3,
} from 'lucide-react';
import { adminAPI } from './api';

const emptyForm = { sourceName: '', baseUrl: '', rateLimitRpm: 60 };

export default function AdminDataSourcePage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchSources = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getDataSources();
      setSources(res?.data || []);
    } catch {
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSources(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (src) => {
    setEditingId(src.sourceId);
    setForm({ sourceName: src.sourceName, baseUrl: src.baseUrl, rateLimitRpm: src.rateLimitRpm || 60 });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.sourceName || !form.baseUrl) return;
    setSaving(true);
    try {
      if (editingId) {
        await adminAPI.updateDataSource(editingId, form);
      } else {
        await adminAPI.createDataSource(form);
      }
      setShowModal(false);
      fetchSources();
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteDataSource(id);
      fetchSources();
    } catch { /* ignore */ }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white font-display">Data Sources</h1>
          <p className="text-xs text-gray-400 mt-1">Manage academic API integrations and rate limits</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchSources} disabled={loading}
            className="p-2.5 rounded-xl bg-white/[0.04] border border-[#DEDBC8]/10 text-gray-400 hover:text-white transition-colors">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={openCreate}
            className="px-4 py-2.5 rounded-xl bg-[#DEDBC8] text-black text-xs font-bold flex items-center gap-1.5 hover:bg-[#E1E0CC] transition-all">
            <Plus size={14} />Add Source
          </button>
        </div>
      </div>

      {/* Sources grid */}
      <div className="grid gap-3 md:grid-cols-2">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-gray-500">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2" />Loading...
          </div>
        ) : sources.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-500">
            <Database size={24} className="mx-auto mb-2 opacity-30" />No data sources configured
          </div>
        ) : (
          sources.map((src) => (
            <motion.div key={src.sourceId} layout
              className="rounded-2xl border border-[#DEDBC8]/10 bg-[#151922] p-5 hover:border-[#DEDBC8]/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#DEDBC8]/10 flex items-center justify-center">
                    <Globe size={18} className="text-[#DEDBC8]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#E1E0CC]">{src.sourceName}</h3>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5 truncate max-w-[200px]">{src.baseUrl}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {src.isActive ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 size={10} />Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                      <XCircle size={10} />Inactive
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-gray-500 mb-3">
                <span>Rate Limit: <b className="text-gray-300">{src.rateLimitRpm || '—'} rpm</b></span>
                {src.lastSyncedAt && (
                  <span>Last Sync: <b className="text-gray-300">{new Date(src.lastSyncedAt).toLocaleDateString()}</b></span>
                )}
              </div>
              <div className="flex gap-2 pt-3 border-t border-[#DEDBC8]/5">
                <button onClick={() => openEdit(src)}
                  className="flex-1 py-2 rounded-lg text-xs font-bold text-[#DEDBC8] border border-[#DEDBC8]/20 hover:bg-[#DEDBC8]/10 transition-all flex items-center justify-center gap-1">
                  <Edit3 size={11} />Edit
                </button>
                <button onClick={() => handleDelete(src.sourceId)}
                  className="py-2 px-3 rounded-lg text-xs font-bold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all">
                  <Trash2 size={11} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl border p-6 w-full max-w-md mx-4 shadow-2xl bg-[#151922] border-[#DEDBC8]/10"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-white">{editingId ? 'Edit Source' : 'Add Data Source'}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Source Name</label>
                  <input type="text" value={form.sourceName} onChange={(e) => setForm({ ...form, sourceName: e.target.value })}
                    placeholder="e.g., Semantic Scholar"
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none bg-[#0f131a] text-[#E1E0CC] border-[#DEDBC8]/20 focus:border-[#DEDBC8]/60 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Base URL</label>
                  <input type="text" value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
                    placeholder="https://api.example.com"
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none bg-[#0f131a] text-[#E1E0CC] border-[#DEDBC8]/20 focus:border-[#DEDBC8]/60 transition-all font-mono" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Rate Limit (rpm)</label>
                  <input type="number" value={form.rateLimitRpm} onChange={(e) => setForm({ ...form, rateLimitRpm: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none bg-[#0f131a] text-[#E1E0CC] border-[#DEDBC8]/20 focus:border-[#DEDBC8]/60 transition-all" />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold text-gray-400 border border-[#DEDBC8]/10 hover:bg-white/5 transition-all">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.sourceName || !form.baseUrl}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold text-black bg-[#DEDBC8] hover:bg-[#E1E0CC] disabled:opacity-40 transition-all flex items-center justify-center gap-1.5">
                  {saving ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />}
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
