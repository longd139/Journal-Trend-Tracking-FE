import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Image as ImageIcon,
  Loader2,
  Send,
  X,
  Plus,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { paperAPI } from './paper.api';

const REPORT_REASONS = [
  'INCORRECT_DATA',
  'DUPLICATE',
  'INAPPROPRIATE',
  'COPYRIGHT',
  'SPAM',
  'OTHER',
];

const MAX_IMAGES = 5;

export function ReportPaperDialog({ paper, open, onOpenChange }) {
  const { t } = useTranslation('search');
  const fileInputRef = useRef(null);

  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setReason('');
    setDescription('');
    setImages([]);
  };

  const handleOpenChange = (open) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" is not an image file`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds 5MB limit`);
        continue;
      }
      validFiles.push(file);
    }
    const remaining = MAX_IMAGES - images.length;
    if (validFiles.length > remaining) {
      validFiles.splice(remaining);
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
    }
    // Generate preview URLs
    const newImages = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages].slice(0, MAX_IMAGES));
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Please select a reason');
      return;
    }
    if (!paper?.paperId) return;

    setSubmitting(true);
    try {
      await paperAPI.reportPaper(
        paper.paperId,
        { reason, description: description.trim() || undefined },
        images.map((img) => img.file)
      );
      toast.success(t('report.success'));
      handleOpenChange(false);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        toast.error(t('report.duplicate'));
      } else {
        const msg = err?.response?.data?.message || err?.message || t('report.error');
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!paper) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-card border-border text-foreground">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <AlertTriangle size={18} className="text-amber-400" />
            {t('report.title')}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t('report.description')}
          </DialogDescription>
        </DialogHeader>

        {/* Paper info pill */}
        <div className="px-3 py-2 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground truncate">
          <span className="font-semibold text-foreground">{paper.title || 'Untitled Paper'}</span>
        </div>

        <div className="space-y-4">
          {/* Reason dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('report.reason')}
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-colors"
            >
              <option value="" disabled>
                {t('report.reasonPlaceholder')}
              </option>
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {t(`report.reasons.${r}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('report.details')}
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('report.detailsPlaceholder')}
              rows={3}
              maxLength={2000}
            />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('report.images')}
              </label>
              <span className="text-[10px] text-muted-foreground">
                {images.length}/{MAX_IMAGES}
              </span>
            </div>

            {/* Image previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border border-border aspect-square">
                    <img
                      src={img.preview}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title={t('report.removeImage')}
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add images button */}
            {images.length < MAX_IMAGES && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-input text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/[0.02] transition-all"
                >
                  <Plus size={14} />
                  {t('report.addImages')}
                </button>
              </>
            )}
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {t('report.imagesHint')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t border-border pt-4 mt-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="text-xs border-input text-muted-foreground hover:bg-muted/50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !reason}
            className="flex items-center gap-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white active:scale-[0.97] transition-all disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            {submitting ? t('report.submitting') : t('report.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
