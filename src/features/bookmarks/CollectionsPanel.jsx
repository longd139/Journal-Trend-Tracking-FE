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
              ? 'bg-primary/10 text-primary border-primary/30'
              : 'text-muted-foreground border-primary/8 hover:text-foreground hover:border-primary/20'
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
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-primary/20 bg-card">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRename(col.collectionId || col.id); if (e.key === 'Escape') setEditingId(null); }}
                      className="w-24 text-[11px] bg-transparent text-foreground outline-none"
                      autoFocus
                    />
                    <button onClick={() => handleRename(col.collectionId || col.id)} className="text-emerald-600 dark:text-emerald-400"><Check size={11} /></button>
                    <button onClick={() => setEditingId(null)} className="text-muted-foreground"><X size={11} /></button>
                  </div>
                ) : (
                  <div className={`flex items-center rounded-lg border transition-all ${
                    isActive
                      ? 'bg-primary/10 border-primary/30'
                      : 'border-primary/8 hover:border-primary/20'
                  }`}>
                    <button
                      onClick={() => onSelectCollection(col.collectionId || col.id)}
                      className={`px-3 py-1.5 text-[11px] font-semibold rounded-l-lg transition-colors ${
                        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Folder size={11} className="inline mr-1.5" />
                      {col.name || col.collectionName || 'Untitled'}
                      {col.paperCount > 0 && (
                        <span className="ml-1.5 text-[9px] text-muted-foreground">({col.paperCount})</span>
                      )}
                    </button>
                    <div className="flex items-center px-1 border-l border-primary/8">
                      <button
                        onClick={() => { setEditingId(col.collectionId || col.id); setEditName(col.name || col.collectionName || ''); }}
                        className="p-1 text-muted-foreground hover:text-primary transition-colors"
                        title="Rename"
                      >
                        <Edit3 size={9} />
                      </button>
                      <button
                        onClick={() => handleDelete(col.collectionId || col.id, col.name || col.collectionName)}
                        className="p-1 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
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
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-muted-foreground border border-dashed border-primary/10 hover:text-primary hover:border-primary/30 transition-all"
          >
            <Plus size={11} />
            New
          </button>
        ) : (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-primary/20 bg-card">
            <FolderPlus size={11} className="text-primary/40" />
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setShowCreate(false); setNewName(''); } }}
              placeholder="Name..."
              className="w-28 text-[11px] bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <button onClick={handleCreate} disabled={creating || !newName.trim()} className="text-emerald-600 dark:text-emerald-400 disabled:opacity-40">
              <Check size={11} />
            </button>
            <button onClick={() => { setShowCreate(false); setNewName(''); }} className="text-muted-foreground">
              <X size={11} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
