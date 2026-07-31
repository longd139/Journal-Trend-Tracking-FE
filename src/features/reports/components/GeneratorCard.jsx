import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * Reusable report generator card — input + submit button.
 * Used in the 3-column grid on the Reports page.
 *
 * @param {object}   props
 * @param {React.Component} props.icon       - Lucide icon component
 * @param {string}   props.iconColor         - Hex color for the icon background
 * @param {string}   props.title             - Card title (already translated)
 * @param {string}   props.description       - Card description (already translated)
 * @param {string}   props.placeholder       - Input placeholder (already translated)
 * @param {boolean}  props.loading           - Whether this card is currently generating
 * @param {function} props.onGenerate        - Called with trimmed input value
 */
export default function GeneratorCard({
  icon: Icon,
  iconColor,
  title,
  description,
  placeholder,
  loading,
  onGenerate,
}) {
  const { t } = useTranslation('reports');
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onGenerate(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit(e);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="p-5 rounded-xl border bg-card border-primary/10 flex flex-col"
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
        style={{ background: `${iconColor}1A`, color: iconColor }}
      >
        <Icon size={20} />
      </div>

      {/* Title + Description */}
      <h3 className="text-sm font-bold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{description}</p>

      {/* Input + Button */}
      <form onSubmit={handleSubmit} className="mt-auto space-y-2.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={loading}
          className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-card border border-primary/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-full px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 bg-primary text-primary-foreground hover:opacity-90"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              {t('button.generating')}
            </>
          ) : (
            t('button.generate') || 'Generate Report'
          )}
        </button>
      </form>
    </motion.div>
  );
}
