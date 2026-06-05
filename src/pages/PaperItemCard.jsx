import * as React from "react";
import { motion } from "framer-motion";
import { Bookmark, ExternalLink } from "lucide-react";
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
      <Card className="bg-[#1B2235] border-white/[0.07] p-5 shadow-sm">
        <CardContent className="p-0 flex flex-col sm:flex-row items-start justify-between gap-4">
          
          <div className="flex-1 space-y-2.5">
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
            
            <h4 onClick={handleRedirect} className="text-sm font-bold text-white hover:text-blue-400 transition-colors cursor-pointer leading-snug">
              {paper.title}
            </h4>
            <p className="text-xs text-slate-400">{paper.authors}</p>
          </div>
          
          <div className="flex items-center gap-5 shrink-0 self-center w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
            <div className="text-left sm:text-right">
              <div className="text-lg font-black text-white font-sans tracking-tight">
                {paper.citations.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500">citations</div>
              <div className="text-[10px] font-semibold font-mono mt-0.5 text-[#00D1B2]">
                {paper.trend}
              </div>
            </div>

            <div className="flex gap-2">
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