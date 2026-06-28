import { motion } from 'framer-motion';
import { Users, Sparkles } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   Curated list of well-known authors across diverse academic fields
   ═══════════════════════════════════════════════════════════════════════════ */

const SUGGESTED_AUTHORS = [
  // AI / Machine Learning
  { name: 'Geoffrey Hinton', field: 'AI & Deep Learning' },
  { name: 'Yann LeCun', field: 'AI & Computer Vision' },
  { name: 'Yoshua Bengio', field: 'AI & Deep Learning' },
  { name: 'Andrew Ng', field: 'AI & Online Education' },
  { name: 'Fei-Fei Li', field: 'AI & Computer Vision' },
  { name: 'Ian Goodfellow', field: 'AI & Generative Models' },
  { name: 'Demis Hassabis', field: 'AI & Reinforcement Learning' },
  { name: 'Jürgen Schmidhuber', field: 'AI & Neural Networks' },

  // Computer Science
  { name: 'Donald Knuth', field: 'Computer Science' },
  { name: 'Leslie Lamport', field: 'Distributed Systems' },
  { name: 'Tim Berners-Lee', field: 'Web & Internet' },

  // Medicine & Biology
  { name: 'Anthony Fauci', field: 'Immunology' },
  { name: 'Francis Collins', field: 'Genetics' },
  { name: 'Jennifer Doudna', field: 'CRISPR & Genetics' },
  { name: 'Emmanuelle Charpentier', field: 'CRISPR & Microbiology' },

  // Physics
  { name: 'Stephen Hawking', field: 'Theoretical Physics' },
  { name: 'Edward Witten', field: 'String Theory' },
  { name: 'Kip Thorne', field: 'Gravitational Physics' },
  { name: 'Roger Penrose', field: 'Mathematical Physics' },

  // Economics & Social Sciences
  { name: 'Paul Krugman', field: 'Economics' },
  { name: 'Steven Pinker', field: 'Psychology & Linguistics' },
  { name: 'Daniel Kahneman', field: 'Behavioral Economics' },
  { name: 'Amartya Sen', field: 'Economics & Philosophy' },

  // Chemistry & Materials
  { name: 'John B. Goodenough', field: 'Solid-State Chemistry' },
  { name: 'Robert Langer', field: 'Biomedical Engineering' },

  // Environmental Science
  { name: 'Jane Goodall', field: 'Primatology & Conservation' },
  { name: 'James Hansen', field: 'Climate Science' },
];

/* ═══════════════════════════════════════════════════════════════════════════
   Field color palette
   ═══════════════════════════════════════════════════════════════════════════ */

const FIELD_COLORS = {
  'AI': '#4F8CFF',
  'Computer Science': '#34D399',
  'Medicine': '#F472B6',
  'Physics': '#A78BFA',
  'Economics': '#F59E0B',
  'Chemistry': '#FB923C',
  'Environmental': '#60A5FA',
};

function getFieldColor(field) {
  for (const [key, color] of Object.entries(FIELD_COLORS)) {
    if (field.includes(key)) return color;
  }
  return '#DEDBC8';
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function AuthorSuggestions({ onAuthorClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <Sparkles size={14} className="text-[#DEDBC8]/50" />
        <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500">
          Suggested Authors
        </span>
      </div>

      {/* Subtitle */}
      <p className="text-[12px] text-gray-500 leading-relaxed">
        Click a name below to instantly explore an author's academic profile, publication timeline,
        research focus, and collaboration network.
      </p>

      {/* Author chips grouped by field */}
      <div className="space-y-4">
        {/* All chips in a flowing wrap layout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="flex flex-wrap gap-2"
        >
          {SUGGESTED_AUTHORS.map((author, i) => {
            const fieldColor = getFieldColor(author.field);
            return (
              <motion.button
                key={author.name}
                type="button"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.03 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAuthorClick?.(author.name)}
                className="group relative px-4 py-2.5 rounded-xl text-left transition-all
                           bg-[#101010] border border-[#DEDBC8]/5
                           hover:border-[#DEDBC8]/15 hover:bg-[#1A1F2E]"
              >
                {/* Field color dot */}
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: fieldColor }}
                  />
                  <div>
                    <div className="text-[12px] font-semibold text-[#E1E0CC] group-hover:text-[#DEDBC8] transition-colors leading-tight">
                      {author.name}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                      {author.field}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Footer hint */}
      <div className="flex items-center gap-2 text-[11px] text-gray-500">
        <Users size={12} className="text-[#DEDBC8]/30" />
        <span>Data sourced from OpenAlex — click any author to view their full academic profile.</span>
      </div>
    </motion.div>
  );
}
