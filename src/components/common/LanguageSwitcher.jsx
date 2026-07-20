import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Globe, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸', nativeLabel: 'English' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', nativeLabel: 'Tiếng Việt' },
];

export default function LanguageSwitcher({ variant = 'sidebar' }) {
  const { t, i18n } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (!open) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setOpen(true);
          setFocusedIndex(LANGUAGES.findIndex((l) => l.code === i18n.language));
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % LANGUAGES.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + LANGUAGES.length) % LANGUAGES.length);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < LANGUAGES.length) {
            handleLanguageChange(LANGUAGES[focusedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          setFocusedIndex(-1);
          break;
        default:
          break;
      }
    },
    [open, focusedIndex, i18n.language],
  );

  // Scroll focused item into view
  useEffect(() => {
    if (!open || focusedIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll('[role="option"]');
    if (items[focusedIndex]) {
      items[focusedIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, open]);

  const handleLanguageChange = async (lang) => {
    if (lang.code === i18n.language) {
      setOpen(false);
      return;
    }

    setIsChanging(true);
    setOpen(false);
    setFocusedIndex(-1);

    // Small delay for loading transition feel
    await new Promise((resolve) => setTimeout(resolve, 150));

    await i18n.changeLanguage(lang.code);
    localStorage.setItem('preferredLanguage', lang.code);
    setIsChanging(false);

    // Show toast
    const messages = {
      en: 'Language updated successfully',
      vi: 'Đã cập nhật ngôn ngữ',
    };

    toast.success(messages[lang.code] || messages.en, {
      duration: 2000,
    });
  };

  const isLoading = isChanging;

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => {
          setOpen(!open);
          setFocusedIndex(LANGUAGES.findIndex((l) => l.code === i18n.language));
        }}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('topbar.profileSettings') || 'Select language'}
        className={`
          group flex items-center gap-2 rounded-lg transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background
          ${variant === 'sidebar'
            ? 'w-full px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground'
            : 'px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/50'
          }
          ${open ? 'bg-muted text-foreground' : ''}
          ${isLoading ? 'opacity-60 cursor-wait' : ''}
        `}
      >
        {isLoading ? (
          <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        ) : (
          <Globe size={14} className="shrink-0" />
        )}
        <span className="flex-1 text-left truncate">
          {currentLang.flag} {currentLang.nativeLabel}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={12} className="shrink-0" />
        </motion.span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 mt-2 w-full min-w-[200px] rounded-xl border border-border bg-popover shadow-xl shadow-black/5 dark:shadow-black/40 overflow-hidden"
            role="listbox"
            aria-label="Select language"
            ref={listRef}
          >
            <div className="p-1">
              {LANGUAGES.map((lang, index) => {
                const isSelected = lang.code === i18n.language;
                const isFocused = index === focusedIndex;

                return (
                  <div
                    key={lang.code}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={-1}
                    onMouseEnter={() => setFocusedIndex(index)}
                    onClick={() => handleLanguageChange(lang)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 text-sm
                      ${isSelected
                        ? 'bg-primary/10 text-primary font-semibold'
                        : isFocused
                          ? 'bg-muted text-foreground'
                          : 'text-muted-foreground'
                      }
                      ${isFocused ? 'outline-none ring-1 ring-inset ring-ring/30' : ''}
                    `}
                  >
                    <span className="text-lg shrink-0">{lang.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs leading-tight">{lang.nativeLabel}</div>
                      {lang.nativeLabel !== lang.label && (
                        <div className="text-[10px] leading-tight opacity-60">{lang.label}</div>
                      )}
                    </div>
                    {isSelected && (
                      <Check size={16} className="shrink-0 text-primary" />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen reader announcement */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {i18n.language === 'en' ? 'English selected' : 'Tiếng Việt đã được chọn'}
      </div>
    </div>
  );
}
