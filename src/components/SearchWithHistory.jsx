import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X } from 'lucide-react';

const STORAGE_PREFIX = 'search-history-';

function loadHistory(key) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(key, items) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(items));
  } catch { /* quota exceeded — silently ignore */ }
}

/**
 * SearchWithHistory — a search input with localStorage-backed search history suggestions.
 *
 * Props:
 *   storageKey      (required) unique key for localStorage (e.g. "admin-users")
 *   value           controlled input value
 *   onChange        called on every keystroke
 *   onSearch        called when a term is "committed" (Enter or suggestion click)
 *   placeholder     input placeholder
 *   className       classes applied to the <input>
 *   wrapperClassName classes applied to the outer wrapper <div>
 *   icon            ReactNode rendered absolutely on the left of the input
 *   children        slot — rendered inside the wrapper (e.g. a submit button)
 *   maxHistory      max stored items (default 8)
 *   inputStyle      optional inline style object for the <input>
 */
export default function SearchWithHistory({
  storageKey,
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  className = '',
  wrapperClassName = '',
  icon,
  children,
  maxHistory = 8,
  inputStyle,
}) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState(() => loadHistory(storageKey));
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Reload history when storageKey changes
  useEffect(() => {
    setHistory(loadHistory(storageKey));
  }, [storageKey]);

  // Click outside → close
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const commit = useCallback(
    (term) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      // Save to history (dedup + limit)
      setHistory((prev) => {
        const next = [trimmed, ...prev.filter((t) => t !== trimmed)].slice(0, maxHistory);
        saveHistory(storageKey, next);
        return next;
      });
      onSearch?.(trimmed);
      setOpen(false);
    },
    [onSearch, storageKey, maxHistory],
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit(value);
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleFocus = () => {
    setOpen(true);
  };

  const handleSelect = (term) => {
    onChange(term);
    commit(term);
    inputRef.current?.focus();
  };

  const handleRemove = (e, term) => {
    e.stopPropagation();
    setHistory((prev) => {
      const next = prev.filter((t) => t !== term);
      saveHistory(storageKey, next);
      return next;
    });
  };

  const handleClearAll = () => {
    setHistory([]);
    saveHistory(storageKey, []);
    setOpen(false);
  };

  // Filter suggestions based on current input
  const suggestions = value.trim()
    ? history.filter((t) => t.toLowerCase().includes(value.toLowerCase().trim()))
    : history;

  const showDropdown = open && suggestions.length > 0;

  return (
    <div ref={wrapperRef} className={wrapperClassName}>
      {icon}
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        className={className}
        style={inputStyle}
        autoComplete="off"
      />
      {children}

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 top-full mt-1.5 z-50 w-full rounded-2xl border border-[#DEDBC8]/10 bg-[#151515] shadow-2xl backdrop-blur-xl overflow-hidden"
          >
            <div className="py-1 max-h-[260px] overflow-y-auto">
              {suggestions.map((term, i) => (
                <button
                  key={`${term}-${i}`}
                  type="button"
                  onClick={() => handleSelect(term)}
                  className="w-full text-left px-3.5 py-2.5 text-[13px] text-slate-300 hover:text-white hover:bg-[#DEDBC8]/5 transition-all flex items-center gap-3 group"
                >
                  <Clock size={12} className="text-slate-500 shrink-0 group-hover:text-slate-400 transition-colors" />
                  <span className="flex-1 truncate">{term}</span>
                  <button
                    type="button"
                    onClick={(e) => handleRemove(e, term)}
                    className="p-0.5 rounded text-slate-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    title="Remove"
                  >
                    <X size={12} />
                  </button>
                </button>
              ))}
            </div>
            {/* Clear all footer */}
            <div className="border-t border-[#DEDBC8]/5 px-3.5 py-2 flex justify-end">
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[10px] font-semibold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-wider"
              >
                Clear all
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
