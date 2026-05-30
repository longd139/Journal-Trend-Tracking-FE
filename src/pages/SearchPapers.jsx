function SearchPapers() {
  const [query, setQuery] = useState('');
  const filtered = PAPERS.filter(
    (p) =>
      !query ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.authors.toLowerCase().includes(query.toLowerCase()) ||
      p.field.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2"
          style={{ color: '#A0AEC0' }}
        />
        <input
          type="text"
          placeholder="Search papers by title, author, or field…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm outline-none"
          style={{
            background: '#1B2235',
            borderColor: 'rgba(255,255,255,0.09)',
            color: '#E2E8F0',
          }}
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        {FIELD_DATA.map((f) => (
          <button
            key={f.n}
            onClick={() => setQuery(f.n)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: `${f.c}1A`,
              color: f.c,
              border: `1px solid ${f.c}44`,
            }}
          >
            {f.n}
          </button>
        ))}
        {query && (
          <button
            onClick={() => setQuery('')}
            className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: '#A0AEC0',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <X size={10} /> Clear
          </button>
        )}
      </div>
      <p className="text-xs" style={{ color: '#6B7280' }}>
        {filtered.length} result{filtered.length !== 1 ? 's' : ''}
      </p>
      <div className="space-y-3">
        {filtered.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ x: 4 }}
            className="rounded-xl border p-5 cursor-default"
            style={{
              background: '#1B2235',
              borderColor: 'rgba(255,255,255,0.07)',
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <GlowBadge
                    color={
                      FIELD_DATA.find((f) => f.n === p.field)?.c ?? '#4F8CFF'
                    }
                  >
                    {p.field}
                  </GlowBadge>
                  <span
                    className="text-xs"
                    style={{
                      color: '#6B7280',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {p.year}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{p.title}</h4>
                <p className="text-xs" style={{ color: '#A0AEC0' }}>
                  {p.authors}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div
                  className="text-xl font-black text-white"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {p.citations.toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: '#6B7280' }}>
                  citations
                </div>
                <div
                  className="text-xs font-semibold mt-1"
                  style={{
                    color: '#00D1B2',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {p.trend}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
