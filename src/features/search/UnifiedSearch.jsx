import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, X } from 'lucide-react';
import SearchPapers from './SearchPapers';
import SearchAuthor from './SearchAuthor';
import SearchJournal from './SearchJournal';
import { trendAPI } from './trend.api.js';

const TABS = [
  { key: 'papers', label: 'Papers', icon: '📄' },
  { key: 'authors', label: 'Authors', icon: '👤' },
  { key: 'journals', label: 'Journals', icon: '📚' },
];

/**
 * Unified search page that merges keyword, author, and journal search
 * into a single search bar with tabbed results.
 * Each tab renders the existing search page component in embedded mode,
 * preserving all stats, charts, and visualizations.
 *
 * URL param: ?q=keyword — pre-fills the search box and auto-triggers search.
 *             Used by Author Research Focus "deep analysis" topic clicks.
 */
export default function UnifiedSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQ);
  const [searchedQuery, setSearchedQuery] = useState(initialQ);
  const [activeTab, setActiveTab] = useState('papers');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [trendingKeywords, setTrendingKeywords] = useState([]);
  const debounceRef = useRef(null);

  // ─── Load trending keywords on mount ───
  useEffect(() => {
    trendAPI.getTrendingKeywords(8).then((list) => {
      if (Array.isArray(list)) {
        const keywords = list.map((item) =>
          typeof item === 'string' ? item : item.keywordText
        ).filter(Boolean);
        setTrendingKeywords(keywords);
      }
    }).catch(() => {});
  }, []);

  // ─── Debounced keyword autocomplete via OpenAlex ───
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const list = await trendAPI.suggestKeywords(q, 8);
        const arr = Array.isArray(list) ? list : [];
        setSuggestions(arr);
        if (arr.length > 0) setShowSuggestions(true);
      } catch (err) {
        console.error('Suggest API failed:', err);
        setSuggestions([]);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSearch = (kw) => {
    const trimmed = (kw || query).trim();
    if (trimmed) {
      setQuery(trimmed);
      setSearchedQuery(trimmed);
    } else {
      setSearchedQuery('');
    }
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') setShowSuggestions(false);
  };

  // Listen for URL param changes (e.g., clicking a topic from Author Research Focus)
  // When ?q=... changes, auto-trigger search and clean the URL param.
  const urlQ = searchParams.get('q');
  useEffect(() => {
    if (urlQ && urlQ.trim()) {
      setQuery(urlQ);
      setSearchedQuery(urlQ);
      setActiveTab('papers');
      // Clean URL param after consuming to keep URL tidy
      const next = new URLSearchParams(searchParams);
      next.delete('q');
      setSearchParams(next, { replace: true });
    }
  }, [urlQ]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* ── Search Bar ── */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 z-10"
            />
            <input
              type="text"
              placeholder="Search papers, authors, or journals..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-12 py-4 rounded-xl text-sm outline-none border transition-colors bg-card/80 border-primary/10 text-foreground focus:border-primary/30 placeholder:text-muted-foreground"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setSearchedQuery(''); setSuggestions([]); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted/40 text-foreground/60 hover:text-foreground/80"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Autocomplete dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 right-0 mt-2 z-20 rounded-2xl border bg-card border-border shadow-xl overflow-hidden"
              >
                {suggestions.slice(0, 10).map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSearch(kw);
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-xs text-left hover:bg-muted/40 transition-colors text-muted-foreground"
                  >
                    <Search size={12} className="text-primary/40 shrink-0" />
                    <span className="flex-1 truncate">{kw}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Tabs + Embedded Results ── */}
        {searchedQuery && (
          <>
            {/* Tab Navigation */}
            <div className="flex items-center gap-0.5 p-1 rounded-xl bg-card border border-border">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab.key
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/60 hover:text-foreground/80'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'papers' && (
                <SearchPapers embedded initialQuery={searchedQuery} />
              )}
              {activeTab === 'authors' && (
                <SearchAuthor embedded initialQuery={searchedQuery} />
              )}
              {activeTab === 'journals' && (
                <SearchJournal embedded initialQuery={searchedQuery} />
              )}
            </div>
          </>
        )}

        {/* ── Zero State ── */}
        {!searchedQuery && (
          <div className="flex flex-col items-center py-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={16} className="text-primary/60" />
              <span className="text-sm font-semibold text-foreground/70">Trending now</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {trendingKeywords.map((kw) => (
                <motion.button
                  key={kw}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleSearch(kw)}
                  className="px-4 py-2 rounded-full text-xs font-medium border transition-colors bg-card/60 border-primary/10 text-foreground/70 hover:border-primary/30 hover:text-primary hover:bg-primary/5"
                >
                  {kw}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
