import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('graph');
  const {
    matchLevel,
    unmatchedTerms,
    fuzzyCandidates,
    availableLandscape,
    guidanceMessage,
    ideaText,
    selectFuzzyCandidate,
    startCrawl,
    isCrawling,
    reset,
  } = useGapExplorerStore();

  // Fallback: extract words from ideaText as crawl keywords if unmatchedTerms is empty
  const crawlKeywords = unmatchedTerms.length > 0
    ? unmatchedTerms
    : (ideaText ? ideaText.split(/[,;]\s*/).filter(t => t.trim().length > 0) : []);

  const [confirmedTerms, setConfirmedTerms] = useState(new Set());

  if (!matchLevel || matchLevel === 'FULL') return null;

  // Truncate long guidance messages (AI sometimes leaks internal reasoning)
  const shortMsg = guidanceMessage?.length > 200
    ? guidanceMessage.slice(0, 200) + '…'
    : guidanceMessage;

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
              {t('someConceptsNotFound')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('notFound')}{' '}
              <span className="text-amber-300 font-medium">
                {unmatchedTerms.join(', ')}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1 italic">
              {shortMsg}
            </p>
            {crawlKeywords.length > 0 && (
              <CrawlButton
                keywords={crawlKeywords}
                isCrawling={isCrawling}
                onClick={() => startCrawl(crawlKeywords)}
                t={t}
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
          <Search size={14} className="text-foreground" />
          <p className="text-xs font-semibold text-foreground">{t('didYouMean')}</p>
        </div>

        <p className="text-xs text-muted-foreground">{shortMsg}</p>

        {fuzzyCandidates.map((fs, i) => (
          <div key={i} className="rounded-lg border border-primary/10 bg-card p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {t('forTerm')} <span className="text-foreground italic">"{fs.originalTerm}"</span>:
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
                          ? 'bg-accent-teal/10 border border-accent-teal/30'
                          : 'bg-card hover:bg-muted/30 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {isConfirmed ? (
                          <Check size={12} className="text-accent-teal shrink-0" />
                        ) : (
                          <span className="w-3 shrink-0" />
                        )}
                        <span className="text-xs text-foreground truncate">
                          {c.keywordText}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          ({c.paperCount} {t('papersLabel')})
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-accent-teal ml-2 shrink-0">
                        {Math.round(c.similarity * 100)}%
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {t('noSimilarKeywords')}
              </p>
            )}
          </div>
        ))}

        <div className="flex gap-2">
          {crawlKeywords.length > 0 && (
            <CrawlButton
              keywords={crawlKeywords}
              isCrawling={isCrawling}
              onClick={() => startCrawl(crawlKeywords)}
              t={t}
            />
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={reset}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-primary-foreground bg-primary hover:opacity-90"
          >
            <BookOpen size={12} />
            {t('exploreAvailableTopics')}
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
          <BookOpen size={14} className="text-foreground" />
          <h4 className="text-xs font-semibold text-foreground">
            {t('availableKnowledgeMap')}
          </h4>
        </div>

        <p className="text-xs text-muted-foreground">
          {guidanceMessage || t('systemScopeNote')}
        </p>

        {availableLandscape.length > 0 ? (
          <div className="flex flex-col gap-2">
            {availableLandscape.map((item, i) => (
              <div
                key={i}
                className="rounded-lg border border-primary/10 bg-card p-3"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp size={12} className="text-accent-blue" />
                  <span className="text-xs font-semibold text-foreground">
                    {item.fieldName}
                  </span>
                  {item.topicName && (
                    <>
                      <ChevronRight size={10} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{item.topicName}</span>
                    </>
                  )}
                </div>

                {item.topKeywords && item.topKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.topKeywords.map((kw) => (
                      <span
                        key={kw.text}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-primary/5 text-foreground border border-primary/10"
                      >
                        {kw.text}
                        <span className="text-muted-foreground">({kw.paperCount})</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            {t('noIndexedDataYet')}
          </p>
        )}

        <div className="flex gap-2">
          {crawlKeywords.length > 0 && (
            <CrawlButton
              keywords={crawlKeywords}
              isCrawling={isCrawling}
              onClick={() => startCrawl(crawlKeywords)}
              t={t}
            />
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-primary-foreground bg-primary hover:opacity-90"
          >
            <BookOpen size={12} />
            {t('viewFullKnowledgeMap')}
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
function CrawlButton({ keywords, isCrawling, onClick, t }) {
  const label = t('crawlFromOpenAlex', { keywords: keywords.join(', ') });

  return (
    <motion.button
      whileHover={{ scale: isCrawling ? 1 : 1.02 }}
      whileTap={{ scale: isCrawling ? 1 : 0.98 }}
      onClick={onClick}
      disabled={isCrawling}
      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-opacity ${
        isCrawling
          ? 'bg-accent-blue/20 text-accent-blue cursor-not-allowed'
          : 'bg-accent-blue text-white hover:opacity-90'
      }`}
    >
      {isCrawling ? (
        <>
          <RefreshCw size={12} className="animate-spin" />
          {t('crawling')}
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
