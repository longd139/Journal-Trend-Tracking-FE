import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2, Lock } from 'lucide-react';
import AuthorQuickStats from '../search/AuthorQuickStats';
import AuthorTimeline from '../search/AuthorTimeline';
import AuthorResearchFocus from '../search/AuthorResearchFocus';
import AuthorCoAuthors from '../search/AuthorCoAuthors';
import PaperListSidebar from '../search/PaperListSidebar';

/**
 * AuthorProfilePage — standalone author profile (no search bar).
 * Used when clicking a followed author from My Follows.
 * URL: /:roleName/author-profile?name=AuthorName
 */
export default function AuthorProfilePage() {
  const { t } = useTranslation('search');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const authorName = searchParams.get('name') || '';

  const currentRole = sessionStorage.getItem('userRole') || 'researcher';
  const isAcademic = currentRole === 'academic_user' || currentRole === 'academic';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarYear, setSidebarYear] = useState(null);
  const [sidebarAuthor, setSidebarAuthor] = useState('');
  const [sidebarTotal, setSidebarTotal] = useState(null);

  const handleBarClick = (data) => {
    const entry = data?.payload || data;
    const year = entry?.year ?? data?.year;
    const count = entry?.worksCount ?? data?.worksCount;
    if (!year || !authorName) return;
    setSidebarYear(year);
    setSidebarAuthor(authorName);
    setSidebarTotal(count ?? null);
    setSidebarOpen(true);
  };

  const handleTotalPapersClick = (total) => {
    if (!authorName) return;
    setSidebarYear(null);
    setSidebarAuthor(authorName);
    setSidebarTotal(total ?? null);
    setSidebarOpen(true);
  };

  const handleTopicClick = (topic) => {
    const topicName = topic?.topicName;
    if (!topicName) return;
    const role = currentRole || 'researcher';
    navigate(`/${role}/search?q=${encodeURIComponent(topicName)}`);
  };

  const handleCoAuthorClick = (authorName) => {
    if (!authorName) return;
    const role = currentRole || 'researcher';
    navigate(`/${role}/author-profile?name=${encodeURIComponent(authorName)}`);
  };

  if (!authorName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-4 bg-transparent p-8">
        <p className="text-sm text-muted-foreground">No author specified.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ── Back button ── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        {/* ── Author Profile ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8"
        >
          <AuthorQuickStats keyword={authorName} onTotalPapersClick={handleTotalPapersClick} />

          {isAcademic ? (
            <div className="space-y-8">
              {/* Timeline — blurred */}
              <div className="relative">
                <div className="blur-[6px] pointer-events-none select-none">
                  <AuthorTimeline keyword={authorName} onBarClick={handleBarClick} highlightYear={sidebarOpen ? sidebarYear : null} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-3 px-4">
                    <Lock size={20} className="text-primary/40 mx-auto" />
                    <p className="text-xs text-muted-foreground max-w-[260px]">
                      Publication timeline & citation trends — available for{' '}
                      <strong className="text-foreground">Researcher</strong> accounts.
                    </p>
                    <button
                      onClick={() => navigate(`/${currentRole}/settings`)}
                      className="px-4 py-2 rounded-lg text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-foreground transition-colors"
                    >
                      {t('author.upgradeNow')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Research Focus — blurred */}
              <div className="relative">
                <div className="blur-[6px] pointer-events-none select-none">
                  <AuthorResearchFocus keyword={authorName} onTopicClick={handleTopicClick} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-3 px-4">
                    <Lock size={20} className="text-primary/40 mx-auto" />
                    <p className="text-xs text-muted-foreground max-w-[260px]">
                      Topic distribution & research domains — available for{' '}
                      <strong className="text-foreground">Researcher</strong> accounts.
                    </p>
                    <button
                      onClick={() => navigate(`/${currentRole}/settings`)}
                      className="px-4 py-2 rounded-lg text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-foreground transition-colors"
                    >
                      Upgrade now
                    </button>
                  </div>
                </div>
              </div>

              {/* Co-authors — blurred */}
              <div className="relative">
                <div className="blur-[6px] pointer-events-none select-none">
                  <AuthorCoAuthors keyword={authorName} onAuthorClick={handleCoAuthorClick} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-3 px-4">
                    <Lock size={20} className="text-primary/40 mx-auto" />
                    <p className="text-xs text-muted-foreground max-w-[260px]">
                      Collaboration network & top co-authors — available for{' '}
                      <strong className="text-foreground">Researcher</strong> accounts.
                    </p>
                    <button
                      onClick={() => navigate(`/${currentRole}/settings`)}
                      className="px-4 py-2 rounded-lg text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-foreground transition-colors"
                    >
                      Upgrade now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <AuthorTimeline keyword={authorName} onBarClick={handleBarClick} highlightYear={sidebarOpen ? sidebarYear : null} />
              <AuthorResearchFocus keyword={authorName} onTopicClick={handleTopicClick} />
              <AuthorCoAuthors keyword={authorName} onAuthorClick={handleCoAuthorClick} />
            </>
          )}
        </motion.div>

        {/* ── Paper List Sidebar ── */}
        <PaperListSidebar
          authorName={sidebarAuthor}
          year={sidebarYear}
          totalOverride={sidebarTotal}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
    </div>
  );
}
