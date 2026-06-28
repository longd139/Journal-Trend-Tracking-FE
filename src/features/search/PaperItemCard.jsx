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
  onToggleBookmark,
  onClick,
}) {
  const [isAbstractExpanded, setIsAbstractExpanded] = useState(false);

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

 const handleToggleBookmark = (e) => {
  e.stopPropagation();
  if (onToggleBookmark) onToggleBookmark(paper);
 };

 // ── Icon button style: transparent + border → filled on hover ──
 const iconBtn =
  'w-9 h-9 flex items-center justify-center rounded-lg border transition-all duration-300 bg-transparent border-[#DEDBC8]/15 text-gray-500 hover:text-[#DEDBC8] hover:bg-[#DEDBC8]/10 hover:border-[#DEDBC8]/30 active:scale-95';

 return (
  <motion.div
   initial={{ opacity: 0, y: 8 }}
   animate={{ opacity: 1, y: 0 }}
   transition={{ delay: index * 0.04 }}
   whileHover={{ x: 4 }}
  >
   <Card
    onClick={handleCardClick}
    className="bg-[#101010] border-[#DEDBC8]/5 p-5 transition-all duration-300 hover:border-[#DEDBC8]/20 cursor-pointer"
   >
    <CardContent className="p-0 flex flex-col sm:flex-row items-start justify-between gap-4">
     {/* ── LEFT CONTENT ── */}
     <div className="flex-1 space-y-2.5 w-full">
      {/* Authors + Badge */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
       <span className="font-semibold text-slate-300">{authors}</span>
       {field && (
        <>
         <span className="text-[#DEDBC8]/15">•</span>
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
         className="bg-[#DEDBC8]/10 text-[#DEDBC8] border border-[#DEDBC8]/20 text-[9px] font-bold"
        >
         Classic
        </Badge>
       )}
      </div>

      {/* Title */}
      <h4 className="text-base font-bold text-[#E1E0CC] leading-snug">
       {paper.title || 'Untitled Paper'}
      </h4>

      {/* Year + Journal */}
      <div className="space-y-1">
       {year && (
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
         <Calendar size={13} className="text-gray-500 flex-shrink-0" />
         <span>{year}</span>
        </p>
       )}
       {journal && (
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
         <BookOpen size={13} className="text-gray-500 flex-shrink-0" />
         <span className="italic">{journal}</span>
        </p>
       )}
      </div>

      {/* Abstract */}
      {abstract && (
       <div className="bg-[#DEDBC8]/[0.02] border border-[#DEDBC8]/5 p-3 rounded-lg space-y-1.5 mt-1 transition-colors">
        <p
         className={`text-xs text-gray-400 leading-relaxed transition-all duration-300 ${
          isAbstractExpanded ? '' : 'line-clamp-2'
         }`}
        >
         <strong className="text-slate-300 font-semibold mr-1">Abstract:</strong>
         {abstract}
        </p>
        <button
         type="button"
         onClick={() => setIsAbstractExpanded(!isAbstractExpanded)}
         className="text-[11px] text-[#DEDBC8] hover:text-[#E1E0CC] flex items-center gap-0.5 font-medium transition-colors pt-0.5"
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
          className="text-[10px] px-2.5 py-1 rounded-md font-bold tracking-wide bg-[#DEDBC8]/5 text-[#DEDBC8]/70 border border-[#DEDBC8]/10 transition-colors cursor-default"
         >
          #{tag.toUpperCase()}
         </span>
        ))}
       </div>
      )}
     </div>

     {/* ── RIGHT: Citations + Actions ── */}
     <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-3 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t border-[#DEDBC8]/5 sm:border-t-0 sm:pl-4">
      <div className="text-left sm:text-right">
       <div className="text-2xl font-bold text-[#E1E0CC] font-display tracking-tight">
        {citations.toLocaleString()}
       </div>
       <div className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
        Citations
       </div>
       {paper.trend && (
        <div className="text-[10px] font-semibold mt-0.5 text-[#DEDBC8] bg-[#DEDBC8]/5 px-1.5 py-0.5 rounded border border-[#DEDBC8]/10 inline-block">
         {paper.trend}
        </div>
       )}
      </div>

      <div className="flex gap-2 sm:mt-1">
       {/* Bookmark */}
       <button
        type="button"
        onClick={handleToggleBookmark}
        className={`${iconBtn} ${
         isSaved
          ? 'bg-[#DEDBC8]/10 border-[#DEDBC8]/30 text-[#DEDBC8]'
          : ''
        }`}
       >
        <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
       </button>

       {/* External link */}
       <button
        type="button"
        onClick={handleExternalLink}
        className={iconBtn}
       >
        <ExternalLink size={15} />
       </button>

       {/* PDF indicator */}
       {paper.pdfAvailable && paper.pdfUrl && (
        <span
         className={`${iconBtn} text-[#DEDBC8]/60 border-[#DEDBC8]/15`}
         title="PDF Available"
        >
         <FileText size={15} />
        </span>
       )}
      </div>
     </div>
    </CardContent>
   </Card>
  </motion.div>
 );
}
