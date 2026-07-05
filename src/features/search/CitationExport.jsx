import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Copy, Check, FileText, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { FORMATS, downloadBlob } from '../../utils/citationGenerators.js';
import { paperAPI } from './paper.api.js';

/* ═══════════════════════════════════════════════════════════════════════════
   CitationExport — single-paper citation export (compact / inline)
   Fetches server-generated citation via API, falls back to client-side
   generators when the API is unavailable.
   ═══════════════════════════════════════════════════════════════════════════ */

export default function CitationExport({ paper, variant = 'inline' }) {
  const [open, setOpen] = useState(false);
  const [activeFormat, setActiveFormat] = useState('bibtex');
  const [copied, setCopied] = useState(false);
  const [citationText, setCitationText] = useState('');
  const [citationBlob, setCitationBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const abortRef = useRef(null);

  if (!paper) return null;

  const paperId = paper.paperId;
  const currentFormat = FORMATS.find((f) => f.key === activeFormat) || FORMATS[0];

  // ── Fetch citation from API (or fall back to client-side generator) ──
  const fetchCitation = useCallback(async (format) => {
    if (!paperId) {
      // No paperId — use client-side generator directly
      const fmt = FORMATS.find((f) => f.key === format) || FORMATS[0];
      setCitationText(fmt.generator(paper));
      setCitationBlob(null);
      setFetchError(false);
      return;
    }

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setFetchError(false);

    try {
      const blob = await paperAPI.getCitation(paperId, format);
      if (controller.signal.aborted) return;

      const text = await blob.text();
      if (controller.signal.aborted) return;

      // Server may return an error message as text/plain (e.g. "Paper not found: ...")
      if (text.trim().startsWith('Paper not found')) {
        throw new Error(text.trim());
      }

      setCitationText(text);
      setCitationBlob(blob);
    } catch (err) {
      if (controller.signal.aborted) return;
      // Fall back to client-side generator
      const fmt = FORMATS.find((f) => f.key === format) || FORMATS[0];
      setCitationText(fmt.generator(paper));
      setCitationBlob(null);
      setFetchError(true);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [paperId, paper]);

  // Fetch when opened or format changes
  useEffect(() => {
    if (open && paperId) {
      fetchCitation(activeFormat);
    } else if (open && !paperId) {
      // No paperId, generate locally
      const fmt = FORMATS.find((f) => f.key === activeFormat) || FORMATS[0];
      setCitationText(fmt.generator(paper));
      setCitationBlob(null);
    }
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [open, activeFormat, paperId, paper, fetchCitation]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(citationText);
      setCopied(true);
      toast.success(`Citation copied as ${currentFormat.label}`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy citation');
    }
  };

  const handleDownload = () => {
    const filename = `citation_${paperId || 'paper'}${currentFormat.ext}`;
    if (citationBlob) {
      // Use the server-generated blob directly
      downloadBlob(citationBlob, filename);
    } else {
      // Fallback: create blob from client-generated text
      const blob = new Blob([citationText], { type: 'text/plain' });
      downloadBlob(blob, filename);
    }
  };

  const wrapperBtn =
    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-200 active:scale-95';

  if (variant === 'compact') {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`${wrapperBtn} border-[#DEDBC8]/10 text-[#DEDBC8]/70 bg-transparent hover:bg-[#DEDBC8]/10 hover:text-[#DEDBC8] hover:border-[#DEDBC8]/20`}
        >
          <Quote size={12} />
          Cite
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 mt-2 w-72 rounded-xl border border-[#DEDBC8]/10 bg-[#101010] shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-3 space-y-3">
                {/* Format tabs */}
                <div className="flex gap-1 p-1 rounded-lg bg-[#DEDBC8]/5">
                  {FORMATS.map((fmt) => (
                    <button
                      key={fmt.key}
                      type="button"
                      onClick={() => setActiveFormat(fmt.key)}
                      className={`flex-1 px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                        activeFormat === fmt.key
                          ? 'bg-[#DEDBC8] text-black'
                          : 'text-gray-400 hover:text-[#E1E0CC]'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>

                {/* Citation preview */}
                <pre className="text-[11px] text-gray-300 font-mono whitespace-pre-wrap break-words bg-[#0A0A0A] rounded-lg p-3 border border-[#DEDBC8]/5 max-h-32 overflow-y-auto">
                  {loading ? (
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <Loader2 size={11} className="animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    citationText || 'No citation available'
                  )}
                </pre>

                {/* API fallback indicator */}
                {fetchError && !loading && (
                  <p className="text-[9px] text-amber-400/60 italic">
                    Generated locally (server unavailable)
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={loading || !citationText}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold bg-[#DEDBC8] text-black hover:opacity-90 transition-all disabled:opacity-40"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={loading || !citationText}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold bg-[#DEDBC8]/10 text-[#DEDBC8] border border-[#DEDBC8]/20 hover:bg-[#DEDBC8]/20 transition-all disabled:opacity-40"
                  >
                    {loading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Inline variant — full-width display
  return (
    <div className="rounded-xl border border-[#DEDBC8]/10 bg-[#101010] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Quote size={15} className="text-[#DEDBC8]/40" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Export Citation</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            disabled={loading || !citationText}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-[#DEDBC8]/10 text-[#DEDBC8] hover:bg-[#DEDBC8]/20 transition-all border border-[#DEDBC8]/10 disabled:opacity-40"
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={loading || !citationText}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-[#DEDBC8]/5 text-gray-400 hover:text-[#E1E0CC] hover:bg-[#DEDBC8]/10 transition-all border border-[#DEDBC8]/5 disabled:opacity-40"
          >
            {loading ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
            Download
          </button>
        </div>
      </div>

      {/* Format selector */}
      <div className="flex gap-1.5">
        {FORMATS.map((fmt) => (
          <button
            key={fmt.key}
            type="button"
            onClick={() => setActiveFormat(fmt.key)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
              activeFormat === fmt.key
                ? 'bg-[#DEDBC8]/15 text-[#DEDBC8] border-[#DEDBC8]/30'
                : 'text-gray-400 border-[#DEDBC8]/5 hover:text-[#E1E0CC] hover:border-[#DEDBC8]/15'
            }`}
          >
            {fmt.label}
          </button>
        ))}
      </div>

      {/* Citation text */}
      <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-words bg-[#0A0A0A] rounded-xl p-4 border border-[#DEDBC8]/5 max-h-52 overflow-y-auto">
        {loading ? (
          <span className="flex items-center gap-2 text-gray-500">
            <Loader2 size={13} className="animate-spin" />
            Fetching citation...
          </span>
        ) : (
          citationText || 'No citation available'
        )}
      </pre>

      {/* API fallback indicator */}
      {fetchError && !loading && (
        <p className="text-[10px] text-amber-400/60 italic">
          Generated locally (server unavailable)
        </p>
      )}
    </div>
  );
}
