import { useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  Search,
  ChevronRight,
  BookOpen,
  TrendingUp,
  X,
  Check,
  RefreshCw,
  Download,
} from 'lucide-react';
import useGapExplorerStore from '../../store/useGapExplorerStore';

/**
 * Renders feedback for each match level when keywords are not fully found.
 *
 * matchLevel === 'FULL'       → renders nothing (normal suggestions flow)
 * matchLevel === 'PARTIAL'    → warning banner about unmatched terms
 * matchLevel === 'FUZZY_ONLY' → "Did you mean?" suggestions
 * matchLevel === 'NONE'       → guided discovery landscape cards
 */
export default function KeywordMatchFeedback() {
  const {
    matchLevel,
    unmatchedTerms,
    fuzzyCandidates,
    availableLandscape,
    guidanceMessage,
    selectFuzzyCandidate,
    startCrawl,
    isCrawling,
    reset,
  } = useGapExplorerStore();

  const [confirmedTerms, setConfirmedTerms] = useState(new Set());

  if (!matchLevel || matchLevel === 'FULL') return null;

  // ── PARTIAL: warning + continue ──
  if (matchLevel === 'PARTIAL') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5"
      >
        <div className="flex items-start gap-2">
          <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-300">
              Some concepts not found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Not found:{' '}
              <span className="text-amber-300 font-medium">
                {unmatchedTerms.join(', ')}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1 italic">
              {guidanceMessage}
            </p>
            {unmatchedTerms.length > 0 && (
              <CrawlButton
                keywords={unmatchedTerms}
                isCrawling={isCrawling}
                onClick={() => startCrawl(unmatchedTerms)}
              />
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // ── FUZZY_ONLY: "Did you mean?" ──
  if (matchLevel === 'FUZZY_ONLY') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center gap-2">
          <Search size={14} className="text-[#DEDBC8]" />
          <p className="text-xs font-semibold text-[#E1E0CC]">Did you mean?</p>
        </div>

        <p className="text-xs text-gray-400">{guidanceMessage}</p>

        {fuzzyCandidates.map((fs, i) => (
          <div key={i} className="rounded-lg border border-[#DEDBC8]/10 bg-[#101010] p-3">
            <p className="text-xs font-medium text-gray-400 mb-2">
              For <span className="text-[#DEDBC8] italic">"{fs.originalTerm}"</span>:
            </p>

            {fs.candidates && fs.candidates.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {fs.candidates.map((c, j) => {
                  const isConfirmed = confirmedTerms.has(`${fs.originalTerm}:${c.normalizedText}`);
                  return (
                    <button
                      key={j}
                      onClick={() => {
                        if (!isConfirmed) {
                          setConfirmedTerms((prev) =>
                            new Set(prev).add(`${fs.originalTerm}:${c.normalizedText}`)
                          );
                          selectFuzzyCandidate(fs.originalTerm, c.keywordText);
                        }
                      }}
                      disabled={isConfirmed}
                      className={`flex items-center justify-between rounded-md px-3 py-2 text-left transition-colors ${
                        isConfirmed
                          ? 'bg-[#00D1B2]/10 border border-[#00D1B2]/30'
                          : 'bg-white/[0.03] hover:bg-white/[0.06] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {isConfirmed ? (
                          <Check size={12} className="text-[#00D1B2] shrink-0" />
                        ) : (
                          <span className="w-3 shrink-0" />
                        )}
                        <span className="text-xs text-[#E1E0CC] truncate">
                          {c.keywordText}
                        </span>
                        <span className="text-[10px] text-gray-500 shrink-0">
                          ({c.paperCount} papers)
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-[#00D1B2] ml-2 shrink-0">
                        {Math.round(c.similarity * 100)}%
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                No similar keywords found. System only indexes Computer Science & AI papers (2024-2026).
              </p>
            )}
          </div>
        ))}

        <div className="flex gap-2">
          {unmatchedTerms.length > 0 && (
            <CrawlButton
              keywords={unmatchedTerms}
              isCrawling={isCrawling}
              onClick={() => startCrawl(unmatchedTerms)}
            />
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={reset}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-black bg-[#DEDBC8] hover:opacity-90"
          >
            <BookOpen size={12} />
            Explore Available Topics Instead
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ── NONE: Guided Discovery ──
  if (matchLevel === 'NONE') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-[#DEDBC8]" />
          <h4 className="text-xs font-semibold text-[#E1E0CC]">
            Available Knowledge Map
          </h4>
        </div>

        <p className="text-xs text-gray-400">
          {guidanceMessage ||
            'Our system currently indexes Computer Science & AI papers (2024-2026).'}
        </p>

        {availableLandscape.length > 0 ? (
          <div className="flex flex-col gap-2">
            {availableLandscape.map((item, i) => (
              <div
                key={i}
                className="rounded-lg border border-[#DEDBC8]/10 bg-[#101010] p-3"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp size={12} className="text-[#4F8CFF]" />
                  <span className="text-xs font-semibold text-[#E1E0CC]">
                    {item.fieldName}
                  </span>
                  {item.topicName && (
                    <>
                      <ChevronRight size={10} className="text-gray-600" />
                      <span className="text-xs text-gray-400">{item.topicName}</span>
                    </>
                  )}
                </div>

                {item.topKeywords && item.topKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.topKeywords.map((kw) => (
                      <span
                        key={kw.text}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-[#DEDBC8]/5 text-[#DEDBC8] border border-[#DEDBC8]/10"
                      >
                        {kw.text}
                        <span className="text-gray-500">({kw.paperCount})</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">
            No indexed data available yet. Run a crawl to populate the knowledge graph.
          </p>
        )}

        <div className="flex gap-2">
          {unmatchedTerms.length > 0 && (
            <CrawlButton
              keywords={unmatchedTerms}
              isCrawling={isCrawling}
              onClick={() => startCrawl(unmatchedTerms)}
            />
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-black bg-[#DEDBC8] hover:opacity-90"
          >
            <BookOpen size={12} />
            View Full Knowledge Map
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return null;
}

/**
 * Shared button for triggering an on-demand crawl of unmatched keywords.
 */
function CrawlButton({ keywords, isCrawling, onClick }) {
  const label = keywords.length > 1
    ? `Crawl "${keywords.join(', ')}" from OpenAlex`
    : `Crawl "${keywords[0]}" from OpenAlex`;

  return (
    <motion.button
      whileHover={{ scale: isCrawling ? 1 : 1.02 }}
      whileTap={{ scale: isCrawling ? 1 : 0.98 }}
      onClick={onClick}
      disabled={isCrawling}
      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-opacity ${
        isCrawling
          ? 'bg-[#4F8CFF]/20 text-[#4F8CFF] cursor-not-allowed'
          : 'bg-[#4F8CFF] text-white hover:opacity-90'
      }`}
    >
      {isCrawling ? (
        <>
          <RefreshCw size={12} className="animate-spin" />
          Crawling...
        </>
      ) : (
        <>
          <Download size={12} />
          {label.length > 50 ? label.slice(0, 47) + '...' : label}
        </>
      )}
    </motion.button>
  );
}
