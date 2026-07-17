import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X, Send, Building, BookOpen, Briefcase, FileText, Globe, Loader2,
  CheckCircle2, User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { upgradeAPI } from './api';
import { useAuthStore } from '../user/store';

const RESEARCH_FIELDS = [
  'Computer Science', 'Mathematics', 'Physics', 'Biology', 'Chemistry',
  'Medicine', 'Engineering', 'Environmental Science', 'Psychology',
  'Economics', 'Sociology', 'Political Science', 'Education',
  'Philosophy', 'History', 'Linguistics', 'Art & Design',
  'Business & Management', 'Law', 'Agricultural Science',
];

const POSITIONS = [
  'PhD Student', 'PostDoc', 'Professor', 'Associate Professor',
  'Assistant Professor', 'Senior Researcher', 'Research Associate',
  'Independent Researcher', 'Lab Director', 'Department Head',
  'Graduate Student', 'Undergraduate Student',
];

export default function UpgradeRequestForm({ open, onClose }) {
  const { t } = useTranslation('common');
  const [step, setStep] = useState('form');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    institution: '',
    researchField: '',
    position: '',
    orcid: '',
    reason: '',
  });
  const [errors, setErrors] = useState({});

  const authUser = useAuthStore((s) => s.user);

  const handleClose = () => {
    setStep('form');
    setForm({ fullName: '', institution: '', researchField: '', position: '', orcid: '', reason: '' });
    setErrors({});
    onClose();
  };

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') {
        setStep('form');
        setForm({ fullName: '', institution: '', researchField: '', position: '', orcid: '', reason: '' });
        setErrors({});
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const validate = () => {
    const errs = {};
    if (!form.researchField) errs.researchField = 'Research field is required';
    if (!form.position) errs.position = 'Position is required';
    if (!form.reason.trim()) errs.reason = 'Please provide a reason for upgrade';
    if (form.orcid && !/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(form.orcid.trim())) {
      errs.orcid = 'Invalid ORCID format (e.g. 0000-0000-0000-0000)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await upgradeAPI.submitRequest(form);
      setStep('success');
      toast.success('Upgrade request submitted!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewRequests = () => {
    handleClose();
    const role = sessionStorage.getItem('userRole');
    window.location.href = `/${role}/settings`;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0f141c] shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors z-10"
            >
              <X size={16} />
            </button>

            {step === 'form' ? (
              <>
                {/* Header */}
                <div className="p-6 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <Briefcase size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-white font-display">
                        Researcher Upgrade Request
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Submit your details for admin review.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
                  {/* Row 1 — Full Name + Institution (disabled) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        Full Name
                      </label>
                      <div className="relative">
                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          value={form.fullName || authUser?.fullName || 'Dr. Sarah Chen'}
                          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                          disabled
                          className="w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm outline-none bg-[#0a0f16] border-white/5 text-gray-400 placeholder:text-gray-600 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        Institution
                      </label>
                      <div className="relative">
                        <Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          value={form.institution || authUser?.institution || 'Stanford University'}
                          onChange={(e) => setForm({ ...form, institution: e.target.value })}
                          disabled
                          className="w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm outline-none bg-[#0a0f16] border-white/5 text-gray-400 placeholder:text-gray-600 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2 — Research Field + Position */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        Research Field <span className="text-blue-400">*</span>
                      </label>
                      <div className="relative">
                        <BookOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                        <select
                          value={form.researchField}
                          onChange={(e) => setForm({ ...form, researchField: e.target.value })}
                          className="w-full pl-9 pr-8 py-2.5 rounded-lg border text-sm outline-none appearance-none bg-[#0a0f16] border-white/8 text-white focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-colors"
                        >
                          <option value="" className="bg-[#0f141c]">Select field...</option>
                          {RESEARCH_FIELDS.map((f) => (
                            <option key={f} value={f} className="bg-[#0f141c]">{f}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                      {errors.researchField && <p className="text-[10px] text-red-400">{errors.researchField}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        Position <span className="text-blue-400">*</span>
                      </label>
                      <div className="relative">
                        <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                        <select
                          value={form.position}
                          onChange={(e) => setForm({ ...form, position: e.target.value })}
                          className="w-full pl-9 pr-8 py-2.5 rounded-lg border text-sm outline-none appearance-none bg-[#0a0f16] border-white/8 text-white focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-colors"
                        >
                          <option value="" className="bg-[#0f141c]">Select position...</option>
                          {POSITIONS.map((p) => (
                            <option key={p} value={p} className="bg-[#0f141c]">{p}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                      {errors.position && <p className="text-[10px] text-red-400">{errors.position}</p>}
                    </div>
                  </div>

                  {/* Row 3 — ORCID */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                      ORCID <span className="text-gray-500 font-normal normal-case">(optional)</span>
                    </label>
                    <div className="relative">
                      <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        value={form.orcid}
                        onChange={(e) => setForm({ ...form, orcid: e.target.value })}
                        placeholder="0000-0000-0000-0000"
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm outline-none bg-[#0a0f16] border-white/8 text-white placeholder:text-gray-600 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-colors"
                      />
                    </div>
                    {errors.orcid && <p className="text-[10px] text-red-400">{errors.orcid}</p>}
                  </div>

                  {/* Row 4 — Reason */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                      Reason for Upgrade <span className="text-blue-400">*</span>
                    </label>
                    <div className="relative">
                      <FileText size={14} className="absolute left-3 top-3 text-gray-500" />
                      <textarea
                        value={form.reason}
                        onChange={(e) => setForm({ ...form, reason: e.target.value })}
                        rows={4}
                        placeholder="I am conducting a systematic review on... Need access to advanced analytics to..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm outline-none bg-[#0a0f16] border-white/8 text-white placeholder:text-gray-600 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-colors resize-none"
                      />
                    </div>
                    {errors.reason && <p className="text-[10px] text-red-400">{errors.reason}</p>}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 rounded-lg text-xs font-semibold bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                      {submitting ? (
                        <><Loader2 size={14} className="animate-spin" /> Submitting...</>
                      ) : (
                        <><Send size={14} /> Submit Request</>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Success */
              <div className="p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={28} className="text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white font-display mb-1">Request Submitted!</h3>
                <p className="text-sm text-gray-400 max-w-sm mx-auto mb-6 leading-relaxed">
                  Your upgrade request is pending admin review. You'll be notified when it's processed.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleViewRequests}
                    className="px-5 py-2 rounded-lg text-xs font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    View My Requests
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-5 py-2 rounded-lg text-xs font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
