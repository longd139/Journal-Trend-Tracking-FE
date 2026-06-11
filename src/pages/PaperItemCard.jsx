import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, ExternalLink, BookOpen, Link2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export function PaperItemCard({ 
  paper, 
  index = 0, 
  badgeColor = "#4F8CFF", 
  isSaved = false, 
  onToggleBookmark 
}) {
  const [isAbstractExpanded, setIsAbstractExpanded] = useState(false);

  const handleRedirect = () => {
    if (!paper?.title) return;
    window.open(`https://scholar.google.com/scholar?q=${encodeURIComponent(paper.title)}`, "_blank");
  };

  if (!paper) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ x: 3 }}
    >
      <Card className="bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/[0.07] p-5 shadow-sm dark:shadow-none transition-all duration-300">
        <CardContent className="p-0 flex flex-col sm:flex-row items-start justify-between gap-4">
          
          <div className="flex-1 space-y-3 w-full">
            {/* Tag Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {paper.field && (
                <Badge 
                  variant="outline" 
                  className="text-[10px] font-bold uppercase tracking-wide"
                  style={{ backgroundColor: `${badgeColor}15`, color: badgeColor, borderColor: `${badgeColor}35` }}
                >
                  {paper.field}
                </Badge>
              )}
              {paper.year && <span className="text-xs text-gray-500 dark:text-slate-400 font-mono">{paper.year}</span>}
              {paper.citations > 50000 && (
                <Badge variant="secondary" className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-[10px]">
                  Classic
                </Badge>
              )}
            </div>
            
            {/* Title */}
            <h4 onClick={handleRedirect} className="text-base font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer leading-snug">
              {paper.title || "Untitled Paper"}
            </h4>

            {/* Authors & Journal Metadata */}
            <div className="space-y-1">
              {paper.authors && <p className="text-xs text-gray-700 dark:text-slate-300 font-medium">{paper.authors}</p>}
              {paper.journal && (
                <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                  <BookOpen size={13} className="text-gray-400 dark:text-slate-500 flex-shrink-0" />
                  <span className="italic">{paper.journal}</span>
                </p>
              )}
              {paper.doi && (
                <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Link2 size={13} className="text-gray-400 dark:text-slate-500 flex-shrink-0" />
                  <a 
                    href={`https://doi.org/${paper.doi}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-[11px] font-mono truncate max-w-[250px] sm:max-w-md"
                  >
                    {paper.doi}
                  </a>
                </p>
              )}
            </div>

            {/* Abstract Section */}
            {paper.abstract && (
              <div className="bg-gray-50 dark:bg-[#121824]/40 border border-gray-200 dark:border-white/[0.05] p-3 rounded-lg space-y-1.5 mt-2 transition-colors">
                <p className={`text-xs text-gray-600 dark:text-slate-400 leading-relaxed transition-all duration-300 ${isAbstractExpanded ? "" : "line-clamp-2"}`}>
                  <strong className="text-gray-900 dark:text-slate-300 font-medium mr-1">Abstract:</strong> 
                  {paper.abstract}
                </p>
                <button
                  type="button"
                  onClick={() => setIsAbstractExpanded(!isAbstractExpanded)}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-0.5 font-medium transition-colors pt-0.5"
                >
                  {isAbstractExpanded ? (
                    <>Show less <ChevronUp size={12} /></>
                  ) : (
                    <>Read abstract <ChevronDown size={12} /></>
                  )}
                </button>
              </div>
            )}
          </div>
          
          {/* Cột hiển thị số lượng citation & hành động */}
          <div className="flex items-center sm:flex-col gap-5 sm:gap-3 shrink-0 self-center sm:self-start w-full sm:w-auto justify-between sm:justify-start border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-200 dark:border-white/5 sm:pl-4">
            <div className="text-left sm:text-right">
              <div className="text-2xl font-black text-gray-900 dark:text-white font-sans tracking-tight">
                {(paper.citations ?? 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-slate-500 uppercase tracking-wider font-semibold">citations</div>
              {paper.trend && (
                <div className="text-[10px] font-semibold font-mono mt-0.5 text-emerald-600 dark:text-[#00D1B2] bg-emerald-50 dark:bg-[#00D1B2]/5 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-[#00D1B2]/10 inline-block">
                  {paper.trend}
                </div>
              )}
            </div>

            <div className="flex gap-2 sm:mt-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onToggleBookmark(paper)}
                className={`w-9 h-9 border transition-transform active:scale-95 ${
                  isSaved 
                    ? "bg-blue-50 dark:bg-blue-600/10 border-blue-200 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-600/20" 
                    : "bg-white dark:bg-white/[0.02] border-gray-200 dark:border-white/10 text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleRedirect}
                className="w-9 h-9 bg-white dark:bg-white/[0.02] border-gray-200 dark:border-white/10 text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-transform active:scale-95"
              >
                <ExternalLink size={15} />
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
}