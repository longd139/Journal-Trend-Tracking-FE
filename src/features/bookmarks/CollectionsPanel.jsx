import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderPlus, Folder, Trash2, Check, X, Plus, Edit3, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { collectionsAPI } from './collectionsApi';

/* ═══════════════════════════════════════════════════════════════════════════
   CollectionsPanel — shows collection tabs + create/rename/delete
   ═══════════════════════════════════════════════════════════════════════════ */

export default function CollectionsPanel({ activeCollection, onSelectCollection }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchCollections = useCallback(async () => {
    try {
      const res = await collectionsAPI.getCollections();
      const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setCollections(items);
    } catch {
      // Silently fail — collections are optional
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCollections(); }, [fetchCollections]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      await collectionsAPI.createCollection({ name });
      toast.success('Collection created!');
      setNewName('');
      setShowCreate(false);
      fetchCollections();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to create collection');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete collection "${name}"? Papers inside will not be deleted.`)) return;
    try {
      await collectionsAPI.deleteCollection(id);
      toast.success('Collection deleted');
      if (activeCollection === id) onSelectCollection(null);
      fetchCollections();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete');
    }
  };

  const handleRename = async (id) => {
    const name = editName.trim();
    if (!name) return;
    try {
      await collectionsAPI.updateCollection(id, { name });
      toast.success('Collection renamed');
      setEditingId(null);
      setEditName('');
      fetchCollections();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to rename');
    }
  };

  if (loading) return null; // Don't show anything while loading — non-blocking

  return (
    <div className="space-y-2">
      {/* Collection tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* "All" tab */}
        <button
          onClick={() => onSelectCollection(null)}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
            !activeCollection
              ? 'bg-[#DEDBC8]/10 text-[#DEDBC8] border-[#DEDBC8]/30'
              : 'text-gray-500 border-[#DEDBC8]/8 hover:text-[#E1E0CC] hover:border-[#DEDBC8]/20'
          }`}
        >
          <Layers size={11} className="inline mr-1.5" />
          All
        </button>

        {/* Collection tabs */}
        <AnimatePresence>
          {collections.map((col) => {
            const isActive = activeCollection === col.collectionId || activeCollection === col.id;
            const isEditing = editingId === (col.collectionId || col.id);

            return (
              <motion.div
                key={col.collectionId || col.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center"
              >
                {isEditing ? (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-[#DEDBC8]/20 bg-[#101010]">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRename(col.collectionId || col.id); if (e.key === 'Escape') setEditingId(null); }}
                      className="w-24 text-[11px] bg-transparent text-[#E1E0CC] outline-none"
                      autoFocus
                    />
                    <button onClick={() => handleRename(col.collectionId || col.id)} className="text-emerald-400"><Check size={11} /></button>
                    <button onClick={() => setEditingId(null)} className="text-gray-500"><X size={11} /></button>
                  </div>
                ) : (
                  <div className={`flex items-center rounded-lg border transition-all ${
                    isActive
                      ? 'bg-[#DEDBC8]/10 border-[#DEDBC8]/30'
                      : 'border-[#DEDBC8]/8 hover:border-[#DEDBC8]/20'
                  }`}>
                    <button
                      onClick={() => onSelectCollection(col.collectionId || col.id)}
                      className={`px-3 py-1.5 text-[11px] font-semibold rounded-l-lg transition-colors ${
                        isActive ? 'text-[#DEDBC8]' : 'text-gray-400 hover:text-[#E1E0CC]'
                      }`}
                    >
                      <Folder size={11} className="inline mr-1.5" />
                      {col.name || col.collectionName || 'Untitled'}
                      {col.paperCount > 0 && (
                        <span className="ml-1.5 text-[9px] text-gray-500">({col.paperCount})</span>
                      )}
                    </button>
                    <div className="flex items-center px-1 border-l border-[#DEDBC8]/8">
                      <button
                        onClick={() => { setEditingId(col.collectionId || col.id); setEditName(col.name || col.collectionName || ''); }}
                        className="p-1 text-gray-500 hover:text-[#DEDBC8] transition-colors"
                        title="Rename"
                      >
                        <Edit3 size={9} />
                      </button>
                      <button
                        onClick={() => handleDelete(col.collectionId || col.id, col.name || col.collectionName)}
                        className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={9} />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Create button / form */}
        {!showCreate ? (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-gray-500 border border-dashed border-[#DEDBC8]/10 hover:text-[#DEDBC8] hover:border-[#DEDBC8]/30 transition-all"
          >
            <Plus size={11} />
            New
          </button>
        ) : (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-[#DEDBC8]/20 bg-[#101010]">
            <FolderPlus size={11} className="text-[#DEDBC8]/40" />
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setShowCreate(false); setNewName(''); } }}
              placeholder="Name..."
              className="w-28 text-[11px] bg-transparent text-[#E1E0CC] outline-none placeholder:text-gray-500"
              autoFocus
            />
            <button onClick={handleCreate} disabled={creating || !newName.trim()} className="text-emerald-400 disabled:opacity-40">
              <Check size={11} />
            </button>
            <button onClick={() => { setShowCreate(false); setNewName(''); }} className="text-gray-500">
              <X size={11} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
