import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
  Upload, Link, X, Send, Loader2, FileText, GraduationCap,
  Building2, FlaskConical, Tag, User, Hash,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import axiosClient from '../../lib/apiClient.js';

export function UpgradeRequestDialog({ open, onOpenChange, userInfo }) {
  const { t } = useTranslation('search');
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    fullName: userInfo?.fullName || '',
    institution: userInfo?.institution || '',
    researchField: '',
    position: '',
    orcid: '',
    reason: '',
    paperLinks: '',
  });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    const valid = [];
    for (const f of selected) {
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`"${f.name}" exceeds 10MB limit`);
        continue;
      }
      valid.push(f);
    }
    setFiles((prev) => [...prev, ...valid].slice(0, 5));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!form.fullName.trim() || !form.institution.trim()
        || !form.researchField.trim() || !form.position.trim()
        || !form.reason.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('data', new Blob([JSON.stringify(form)], { type: 'application/json' }));
      files.forEach((f) => fd.append('files', f));

      await axiosClient.post('/api/users/me/upgrade-request', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Upgrade request submitted! Admin will review your application.');
      onOpenChange(false);
      setFiles([]);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to submit request';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <GraduationCap size={18} className="text-primary" />
            Request Researcher Upgrade
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Submit your research profile and publications. An admin will review your application.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Personal Info */}
          <div className="grid grid-cols-2 gap-2">
            <InputField icon={User} label="Full Name *" value={form.fullName}
              onChange={(v) => updateField('fullName', v)} />
            <InputField icon={Building2} label="Institution *" value={form.institution}
              onChange={(v) => updateField('institution', v)} />
            <InputField icon={FlaskConical} label="Research Field *" value={form.researchField}
              onChange={(v) => updateField('researchField', v)}
              placeholder="e.g. Computer Science" />
            <InputField icon={Tag} label="Position *" value={form.position}
              onChange={(v) => updateField('position', v)}
              placeholder="e.g. Lecturer" />
          </div>

          <InputField icon={Hash} label="ORCID (optional)" value={form.orcid}
            onChange={(v) => updateField('orcid', v)}
            placeholder="0000-0000-0000-0000" />

          {/* Reason */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Reason for upgrade *
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => updateField('reason', e.target.value)}
              placeholder="Describe your research background and why you need Researcher access..."
              rows={3}
              maxLength={2000}
              className="w-full px-3 py-2 rounded-lg text-xs border border-input bg-input-background text-foreground placeholder:text-muted-foreground/50 focus:border-primary/30 outline-none resize-none"
            />
          </div>

          {/* Paper Links */}
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <Link size={12} />
              Links to your publications
            </label>
            <textarea
              value={form.paperLinks}
              onChange={(e) => updateField('paperLinks', e.target.value)}
              placeholder="Paste links to your published papers, one per line:&#10;https://doi.org/10.xxx/...&#10;https://link.springer.com/..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-xs border border-input bg-input-background text-foreground placeholder:text-muted-foreground/50 focus:border-primary/30 outline-none resize-none"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <Upload size={12} />
              Upload PDF files (max 5, 10MB each)
            </label>

            {files.length > 0 && (
              <div className="space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-xs">
                    <FileText size={12} className="text-primary shrink-0" />
                    <span className="flex-1 truncate text-foreground">{f.name}</span>
                    <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-red-400">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {files.length < 5 && (
              <>
                <input ref={fileInputRef} type="file" accept=".pdf" multiple onChange={handleFileSelect} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-input text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                >
                  <Upload size={13} />
                  Add PDF files
                </button>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-border pt-4 mt-2 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}
            className="text-xs border-input text-muted-foreground">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}
            className="flex items-center gap-2 text-xs font-semibold bg-primary text-primary-foreground active:scale-[0.97] transition-all disabled:opacity-50">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InputField({ icon: Icon, label, value, onChange, placeholder }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      <div className="relative">
        {Icon && <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-8 pr-3 py-2 rounded-lg text-xs border border-input bg-input-background text-foreground placeholder:text-muted-foreground/50 focus:border-primary/30 outline-none"
        />
      </div>
    </div>
  );
}
