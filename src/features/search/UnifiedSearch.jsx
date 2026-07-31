import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, TrendingUp, BookOpen, Users, Library, ChevronDown } from 'lucide-react';
import SearchPapers from './SearchPapers';
import SearchAuthor from './SearchAuthor';
import SearchJournal from './SearchJournal';
import { trendAPI } from './trend.api.js';

const TABS = [
  { key: 'papers', labelKey: 'tabs.papers', icon: BookOpen },
  { key: 'authors', labelKey: 'tabs.authors', icon: Users },
  { key: 'journals', labelKey: 'tabs.journals', icon: Library },
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
  const { t } = useTranslation('search');
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQ);
  const [searchedQuery, setSearchedQuery] = useState(initialQ);
  const [activeTab, setActiveTab] = useState('papers');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [trendingKeywords, setTrendingKeywords] = useState([]);
  const [showTabDropdown, setShowTabDropdown] = useState(false);
  const debounceRef = useRef(null);
  const searchContainerRef = useRef(null);

  // ─── Close tab dropdown on outside click ───
  useEffect(() => {
    const handleClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowTabDropdown(false);
      }
    };
    if (showTabDropdown) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showTabDropdown]);

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
        setShowSuggestions(arr.length > 0);
      } catch (err) {
        console.error('Suggest API failed:', err);
        setSuggestions([]);
        setShowSuggestions(false);
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
    setShowTabDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setShowTabDropdown(false);
    }
  };

  // Listen for URL param changes (e.g., clicking a topic from Author Research Focus)
  // When ?q=... changes, auto-trigger search and clean the URL param.
  const urlQ = searchParams.get('q');
  const urlTab = searchParams.get('tab');
  // Capture auto param in ref so it survives URL cleanup re-render
  const urlAutoRef = useRef(searchParams.get('auto'));
  // Track whether user has manually searched (to disable autoSearch on subsequent searches)
  const [hasManualSearch, setHasManualSearch] = useState(false);
  useEffect(() => {
    if (urlQ && urlQ.trim()) {
      setQuery(urlQ);
      setSearchedQuery(urlQ);
      // Respect tab param: authors|journals|papers
      const validTabs = ['papers', 'authors', 'journals'];
      setActiveTab(validTabs.includes(urlTab) ? urlTab : 'papers');
      // Clean URL params after consuming to keep URL tidy
      const next = new URLSearchParams(searchParams);
      next.delete('q');
      next.delete('tab');
      next.delete('auto');
      setSearchParams(next, { replace: true });
    }
  }, [urlQ]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeTabDef = TABS.find((t) => t.key === activeTab);
  const ActiveTabIcon = activeTabDef?.icon;

  return (
    <div className="min-h-screen bg-transparent">
      {/* ══════════════════════════════════════════════════════════════
          HERO SECTION — centered hero with headline, subheading & search
          ══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col items-center px-4 sm:px-6 pt-12 sm:pt-20 pb-4">
        {/* ── Heading + Subheading (animated collapse, stays in DOM) ── */}
        <motion.div
          animate={{
            opacity: searchedQuery ? 0 : 1,
            maxHeight: searchedQuery ? 0 : 300,
            marginBottom: searchedQuery ? 0 : 0,
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center overflow-hidden"
        >
          <h1 className="text-center font-extrabold tracking-tight leading-tight text-3xl sm:text-[42px]">
            {t('hero.line1')}{' '}
            <span className="inline-block bg-accent-blue text-white px-2.5 py-1 rounded-lg">
              {t('hero.highlight')}
            </span>{' '}
            {t('hero.line2')}
          </h1>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground text-center max-w-[500px] leading-relaxed">
            {t('hero.subtitle')}
          </p>
        </motion.div>

        {/* ── Pill-Shaped Composite Search Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{
            opacity: 1,
            y: 0,
            marginTop: searchedQuery ? 16 : 32,
          }}
          transition={{
            opacity: { duration: 0.5, delay: 0.2 },
            y: { duration: 0.5, delay: 0.2 },
            marginTop: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
          }}
          className="relative w-full max-w-[560px]"
          ref={searchContainerRef}
        >
          <div
            className={`flex items-center bg-card border rounded-full p-1.5 transition-all duration-300 ${
              showSuggestions
                ? 'border-primary/50 shadow-[0_4px_24px_rgba(79,140,255,0.15)]'
                : 'border-primary/20 shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:border-primary/30'
            }`}
          >
            {/* ── Search icon button (circle, primary bg) ── */}
            <button
              onClick={() => handleSearch()}
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 hover:bg-primary/90 active:scale-95 transition-all"
              title={t('actions.search')}
            >
              <Search size={16} className="text-white" strokeWidth={2.5} />
            </button>

            {/* ── Keyword input ── */}
            <input
              type="text"
              placeholder={t('hero.placeholder')}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchedQuery(''); // clear old results when typing new keyword
                setShowSuggestions(true);
                setShowTabDropdown(false);
              }}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              className="flex-1 min-w-0 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
            />

            {/* ── Clear button ── */}
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setSearchedQuery('');
                  setSuggestions([]);
                }}
                className="p-1.5 rounded-full hover:bg-muted/50 text-foreground/30 hover:text-foreground/60 transition-colors mr-0.5"
              >
                <X size={14} />
              </button>
            )}

            {/* ── Tab selector (like "location filter" in reference design) ── */}
            <div className="relative shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTabDropdown(!showTabDropdown);
                  setShowSuggestions(false);
                }}
                className="flex items-center gap-1.5 pl-3 pr-1.5 py-2 rounded-full bg-muted/60 text-xs font-medium text-foreground/70 hover:bg-muted hover:text-foreground transition-colors border border-transparent hover:border-border"
              >
                {ActiveTabIcon && <ActiveTabIcon size={13} className="text-primary/60" />}
                <span>{t(activeTabDef?.labelKey)}</span>
                <ChevronDown
                  size={12}
                  className={`text-foreground/40 transition-transform duration-200 ${
                    showTabDropdown ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* ── Tab dropdown ── */}
              <AnimatePresence>
                {showTabDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 z-30 w-44 rounded-xl border bg-card border-border shadow-xl shadow-black/30 overflow-hidden"
                  >
                    {TABS.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => {
                            setActiveTab(tab.key);
                            setShowTabDropdown(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left transition-colors ${
                            activeTab === tab.key
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-foreground/70 hover:bg-muted/40'
                          }`}
                        >
                          <Icon size={13} />
                          {t(tab.labelKey)}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Autocomplete dropdown ── */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute top-full left-0 right-0 mt-3 z-20 rounded-2xl border bg-card border-border shadow-xl shadow-black/30 overflow-hidden"
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
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            ZERO STATE — Trending keywords (collapses when search done)
            ══════════════════════════════════════════════════════════════ */}
        <motion.div
          animate={{
            opacity: searchedQuery ? 0 : 1,
            maxHeight: searchedQuery ? 0 : 200,
            marginTop: searchedQuery ? 0 : 40,
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-primary/50" />
            <span className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wider">
              {t('hero.trending')}
            </span>
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
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          RESULTS SECTION — tabs + embedded tab content
          ══════════════════════════════════════════════════════════════ */}
      {searchedQuery && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-[400px]"
          >
            {activeTab === 'papers' && (
              <SearchPapers embedded initialQuery={searchedQuery} />
            )}
            {activeTab === 'authors' && (
              <SearchAuthor embedded initialQuery={searchedQuery} />
            )}
            {activeTab === 'journals' && (
              <SearchJournal embedded initialQuery={searchedQuery} />
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
