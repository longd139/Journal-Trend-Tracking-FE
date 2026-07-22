import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Flag, X, Loader2, CheckCircle2 } from 'lucide-react';
import { reportAPI } from '../reports/api';

const spring = { type: 'spring', stiffness: 300, damping: 30 };

const REPORT_TYPES = [
  { value: 'pdf_issue', labelKey: 'report.pdfIssue' },
  { value: 'content_error', labelKey: 'report.contentError' },
  { value: 'other', labelKey: 'report.other' },
];

export default function ReportForm({ isOpen, onClose, targetType, targetId }) {
  const { t } = useTranslation('common');

  const [reportType, setReportType] = useState('content_error');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await reportAPI.submitReport({
        reportType,
        targetType: targetType || null,
        targetId: targetId || null,
        title: title.trim(),
        description: description.trim() || null,
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setTitle('');
        setDescription('');
        setReportType('content_error');
      }, 2000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={spring}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md bg-card-elevated border border-card-elevated-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-card-elevated-border">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <Flag size={16} className="text-orange-400" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground font-display">
                    {t('report.title')}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form */}
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
                  <CheckCircle2 size={40} className="text-emerald-400 mb-3" />
                  <p className="text-sm font-medium text-foreground">{t('report.submitted')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  {/* Report Type */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      {t('report.reportType')}
                    </label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-card-hover border border-card-elevated-border text-sm text-foreground focus:outline-none focus:border-primary/30 transition-colors"
                    >
                      {REPORT_TYPES.map((rt) => (
                        <option key={rt.value} value={rt.value}>
                          {t(rt.labelKey)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={300}
                      placeholder="Brief summary of the issue..."
                      className="w-full px-3 py-2 rounded-xl bg-card-hover border border-card-elevated-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30 transition-colors"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      {t('report.description')}
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={2000}
                      rows={4}
                      placeholder="Describe the issue in detail..."
                      className="w-full px-3 py-2 rounded-xl bg-card-hover border border-card-elevated-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30 transition-colors resize-none"
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting || !title.trim()}
                    className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        {t('report.submitting')}
                      </>
                    ) : (
                      t('report.submitReport')
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
