import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, X } from 'lucide-react';
import SearchPapers from './SearchPapers';
import SearchAuthor from './SearchAuthor';
import SearchJournal from './SearchJournal';

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

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed) setSearchedQuery(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
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
        <div className="relative">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 z-10"
            />
            <input
              type="text"
              placeholder="Search papers, authors, or journals..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-12 py-4 rounded-xl text-sm outline-none border transition-colors bg-card/80 border-primary/10 text-foreground focus:border-primary/30 placeholder:text-muted-foreground"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setSearchedQuery(''); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted/40 text-foreground/60 hover:text-foreground/80"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSearch}
            disabled={!query.trim()}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-primary-foreground transition-opacity disabled:opacity-40 bg-primary"
          >
            <Search size={14} />
            Search
          </motion.button>
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
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 mb-4">
              <Search size={32} className="text-primary/30" />
            </div>
            <p className="text-sm text-foreground/60 max-w-sm">
              Search across papers, authors, and journals in one place.
              <br />
              Try "deep learning", "hinton", or "nature".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
