import { useState } from 'react';
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
 */
export default function UnifiedSearch() {
  const [query, setQuery] = useState('');
  const [searchedQuery, setSearchedQuery] = useState('');
  const [activeTab, setActiveTab] = useState('papers');

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed) setSearchedQuery(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* ── Search Bar ── */}
        <div className="relative">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-[#DEDBC8]/40 z-10"
            />
            <input
              type="text"
              placeholder="Search papers, authors, or journals..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-12 py-4 rounded-xl text-sm outline-none border transition-colors bg-[#0F0F0F]/80 border-[#DEDBC8]/10 text-[#E2E8F0] focus:border-[#DEDBC8]/30 placeholder:text-gray-500"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setSearchedQuery(''); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/5 text-gray-500 hover:text-gray-300"
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
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-black transition-opacity disabled:opacity-40 bg-[#DEDBC8]"
          >
            <Search size={14} />
            Search
          </motion.button>
        </div>

        {/* ── Tabs + Embedded Results ── */}
        {searchedQuery && (
          <>
            {/* Tab Navigation */}
            <div className="flex items-center gap-0.5 p-1 rounded-xl bg-[#101010] border border-[#DEDBC8]/5">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab.key
                      ? 'bg-[#DEDBC8]/10 text-[#DEDBC8]'
                      : 'text-gray-500 hover:text-gray-300'
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
            <div className="p-4 rounded-2xl bg-[#DEDBC8]/5 border border-[#DEDBC8]/10 mb-4">
              <Search size={32} className="text-[#DEDBC8]/30" />
            </div>
            <p className="text-sm text-gray-500 max-w-sm">
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
