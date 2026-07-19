import { useState } from 'react';
import { motion } from 'framer-motion';
import {
 Bookmark,
 ExternalLink,
 BookOpen,
 Calendar,
 ChevronDown,
 ChevronUp,
 FileText,
 Lock,
 Loader2,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import FollowButton from '../follows/FollowButton';

export function PaperItemCard({
  paper,
  index = 0,
  badgeColor = '#DEDBC8',
  isSaved = false,
  isLocked = false,
  onToggleBookmark,
  onClick,
}) {
  const [isAbstractExpanded, setIsAbstractExpanded] = useState(false);
 const [bookmarkLoading, setBookmarkLoading] = useState(false);

  if (!paper) return null;

 const field = paper.fieldName || paper.field || '';
 const year = paper.pubYear || paper.year || '';
 const citations = paper.citationCount ?? paper.citations ?? 0;
 const journal = paper.journalName || paper.journal || '';
 const abstract = paper.abstractText || paper.abstract || '';

 let authors = '';
 if (Array.isArray(paper.authors) && paper.authors.length > 0) {
  authors = paper.authors
   .map((a) => {
    if (typeof a === 'string') return a;
    return a.fullName || a.name || '';
   })
   .filter(Boolean)
   .join(', ');
 } else if (typeof paper.authors === 'string') {
  authors = paper.authors;
 }
 if (!authors.trim()) authors = 'Unknown Author';

 let keywordsArray = [];
 if (Array.isArray(paper.keywords)) {
  keywordsArray = paper.keywords.map((k) =>
   typeof k === 'string' ? k : (k?.keywordText || '')
  ).filter(Boolean);
 } else if (typeof paper.keywords === 'string' && paper.keywords.trim()) {
  keywordsArray = paper.keywords.split(',').map((k) => k.trim());
 } else if (field) {
  keywordsArray = [field];
 }

 const handleCardClick = () => { if (onClick) onClick(paper); };

 const handleRedirect = (e) => {
  e.stopPropagation();
  if (!paper?.title) return;
  window.open(
   `https://scholar.google.com/scholar?q=${encodeURIComponent(paper.title)}`,
   '_blank',
  );
 };

 const handleExternalLink = (e) => {
  e.stopPropagation();
  const url = paper.sourceUrl || paper.downloadUrl || paper.pdfUrl;
  if (url) window.open(url, '_blank');
 };

 const handleToggleBookmark = async (e) => {
  e.stopPropagation();
  if (!onToggleBookmark) return;
  setBookmarkLoading(true);
  try {
   await onToggleBookmark(paper);
  } finally {
   setBookmarkLoading(false);
  }
 };

 // ── Icon button style: transparent + border → filled on hover ──
 const iconBtn =
  'w-9 h-9 flex items-center justify-center rounded-lg border transition-all duration-300 bg-transparent border-input text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/30 active:scale-95';

 return (
  <motion.div
   initial={{ opacity: 0, y: 8 }}
   animate={{ opacity: 1, y: 0 }}
   transition={{ delay: index * 0.04 }}
   whileHover={{ x: 4 }}
  >
   <Card
    onClick={handleCardClick}
    className={`bg-card border-border p-5 transition-all duration-300 hover:border-primary/20 cursor-pointer relative`}
   >
    {/* Lock badge for academic users — pinned to top border */}
    {isLocked && (
      <div className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-card border border-primary/15 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
        <Lock size={10} className="text-primary/50" />
        <span className="text-[9px] font-bold text-primary/50 uppercase tracking-wider">Researcher</span>
      </div>
    )}
    <CardContent className="p-0 flex flex-col sm:flex-row items-start justify-between gap-4">
     {/* ── LEFT CONTENT ── */}
     <div className="flex-1 space-y-2.5 w-full">
      {/* Authors + Badge */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
       <span className="font-semibold text-foreground">{authors}</span>
       {field && (
        <>
         <span className="text-primary/15">•</span>
         <Badge
          variant="outline"
          className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0"
          style={{
           backgroundColor: `${badgeColor}12`,
           color: badgeColor,
           borderColor: `${badgeColor}30`,
          }}
         >
          {field}
         </Badge>
        </>
       )}
       {citations > 50000 && (
        <Badge
         variant="secondary"
         className="bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold"
        >
         Classic
        </Badge>
       )}
      </div>

      {/* Title */}
      <h4 className="text-base font-bold text-foreground leading-snug">
       {paper.title || 'Untitled Paper'}
      </h4>

      {/* Year + Journal */}
      <div className="space-y-1">
       {year && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
         <Calendar size={13} className="text-muted-foreground flex-shrink-0" />
         <span>{year}</span>
        </p>
       )}
       {journal && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
         <BookOpen size={13} className="text-muted-foreground flex-shrink-0" />
         <span className="italic">{journal}</span>
        </p>
       )}
      </div>

      {/* Abstract */}
      {abstract && (
       <div className="bg-muted/30 border border-border p-3 rounded-lg space-y-1.5 mt-1 transition-colors">
        <p
         className={`text-xs text-muted-foreground leading-relaxed transition-all duration-300 ${
          isAbstractExpanded ? '' : 'line-clamp-2'
         }`}
        >
         <strong className="text-foreground font-semibold mr-1">Abstract:</strong>
         {abstract}
        </p>
        <button
         type="button"
         onClick={() => setIsAbstractExpanded(!isAbstractExpanded)}
         className="text-[11px] text-primary hover:text-foreground flex items-center gap-0.5 font-medium transition-colors pt-0.5"
        >
         {isAbstractExpanded ? (
          <><ChevronUp size={12} /> Read Less</>
         ) : (
          <><ChevronDown size={12} /> Read More</>
         )}
        </button>
       </div>
      )}

      {/* Keywords */}
      {keywordsArray.length > 0 && (
       <div className="flex flex-wrap gap-1.5 pt-1">
        {keywordsArray.map((tag, idx) => (
         <span
          key={idx}
          className="text-[10px] px-2.5 py-1 rounded-md font-bold tracking-wide bg-primary/5 text-primary/70 border border-primary/10 transition-colors cursor-default"
         >
          #{tag.toUpperCase()}
         </span>
        ))}
       </div>
      )}
     </div>

     {/* ── RIGHT: Citations + Actions ── */}
     <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-3 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t border-border sm:border-t-0 sm:pl-4">
      <div className="text-left sm:text-right">
       <div className="text-2xl font-bold text-foreground font-display tracking-tight">
        {citations.toLocaleString()}
       </div>
       <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
        Citations
       </div>
       {paper.trend && (
        <div className="text-[10px] font-semibold mt-0.5 text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10 inline-block">
         {paper.trend}
        </div>
       )}
      </div>

      {/* Follow button */}
      <span onClick={(e) => e.stopPropagation()}>
       <FollowButton
        journalId={paper.journalId || null}
        journalName={journal || null}
        topicId={paper.topicId || null}
        topicName={paper.topicName || field || null}
        keywordId={
         Array.isArray(paper.keywords) && paper.keywords[0]?.keywordId
          ? paper.keywords[0].keywordId
          : null
        }
        keywordText={
         Array.isArray(paper.keywords)
          ? typeof paper.keywords[0] === 'string'
            ? paper.keywords[0]
            : paper.keywords[0]?.keywordText || null
          : null
        }
       />
      </span>

      <div className="flex gap-2 sm:mt-1">
       {/* Bookmark — only when onToggleBookmark is provided */}
       {onToggleBookmark && (
       <button
        type="button"
        onClick={handleToggleBookmark}
        disabled={bookmarkLoading}
        className={`${iconBtn} ${
         isSaved
          ? 'bg-primary/10 border-primary/30 text-primary'
          : ''
        } ${bookmarkLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
       >
        {bookmarkLoading ? (
         <Loader2 size={15} className="animate-spin" />
        ) : (
         <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
        )}
       </button>
       )}

       {/* External link */}
       <button
        type="button"
        onClick={handleExternalLink}
        className={iconBtn}
       >
        <ExternalLink size={15} />
       </button>

       {/* PDF indicator */}
       <span
         className={`${iconBtn} ${
           paper.pdfAvailable
             ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-700 hover:border-emerald-500/30'
             : 'text-muted-foreground border-input'
         }`}
         title={paper.pdfAvailable ? 'PDF Available' : 'PDF Unavailable'}
       >
         <FileText size={15} />
       </span>
      </div>
     </div>
    </CardContent>
   </Card>
  </motion.div>
 );
}
