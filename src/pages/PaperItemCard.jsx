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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ x: 3 }}
    >
      <Card className="bg-[#1B2235] border-white/[0.07] p-5 shadow-sm transition-all duration-200">
        <CardContent className="p-0 flex flex-col sm:flex-row items-start justify-between gap-4">
          
          <div className="flex-1 space-y-3 w-full">
            {/* Tag Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant="outline" 
                className="text-[10px] font-bold uppercase tracking-wide bg-opacity-10"
                style={{ backgroundColor: `${badgeColor}15`, color: badgeColor, borderColor: `${badgeColor}35` }}
              >
                {paper.field}
              </Badge>
              <span className="text-xs text-slate-500 font-mono">{paper.year}</span>
              {paper.citations > 50000 && (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                  Classic
                </Badge>
              )}
            </div>
            
            {/* Title */}
            <h4 onClick={handleRedirect} className="text-base font-bold text-white hover:text-blue-400 transition-colors cursor-pointer leading-snug">
              {paper.title}
            </h4>

            {/* Authors & Journal Metadata */}
            <div className="space-y-1">
              <p className="text-xs text-slate-300 font-medium">{paper.authors}</p>
              {paper.journal && (
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <BookOpen size={13} className="text-slate-500 flex-shrink-0" />
                  <span className="italic">{paper.journal}</span>
                </p>
              )}
              {paper.doi && (
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Link2 size={13} className="text-slate-500 flex-shrink-0" />
                  <a 
                    href={`https://doi.org/${paper.doi}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-[11px] font-mono truncate max-w-[250px] sm:max-w-md"
                  >
                    {paper.doi}
                  </a>
                </p>
              )}
            </div>

            {/* Abstract Section (Mở rộng / Thu gọn) */}
            {paper.abstract && (
              <div className="bg-[#121824]/40 border border-white/[0.03] p-3 rounded-lg space-y-1.5 mt-2">
                <p className={`text-xs text-slate-400 leading-relaxed transition-all duration-300 ${
                  isAbstractExpanded ? "" : "line-clamp-2"
                }`}>
                  <strong className="text-slate-300 font-medium mr-1">Abstract:</strong> 
                  {paper.abstract}
                </p>
                <button
                  type="button"
                  onClick={() => setIsAbstractExpanded(!isAbstractExpanded)}
                  className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5 font-medium transition-colors pt-0.5"
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
          <div className="flex items-center sm:flex-col gap-5 sm:gap-3 shrink-0 self-center sm:self-start w-full sm:w-auto justify-between sm:justify-start border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5 sm:pl-4">
            <div className="text-left sm:text-right">
              <div className="text-2xl font-black text-white font-sans tracking-tight">
                {paper.citations.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">citations</div>
              <div className="text-[10px] font-semibold font-mono mt-0.5 text-[#00D1B2] bg-[#00D1B2]/5 px-1.5 py-0.5 rounded border border-[#00D1B2]/10 inline-block">
                {paper.trend}
              </div>
            </div>

            <div className="flex gap-2 sm:mt-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onToggleBookmark(paper)}
                className={`w-9 h-9 border-white/10 transition-transform active:scale-95 ${
                  isSaved ? "bg-blue-600/10 border-blue-500 text-blue-400" : "bg-white/[0.02] text-slate-400 hover:text-white"
                }`}
              >
                <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleRedirect}
                className="w-9 h-9 border-white/10 bg-white/[0.02] text-slate-400 hover:text-white transition-transform active:scale-95"
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