import * as React from 'react';
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
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import FollowButton from '../components/follow/FollowButton';

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

  // 1. Chuẩn hóa dữ liệu từ API response
  const field = paper.fieldName || paper.field || '';
  const year = paper.pubYear || paper.year || '';
  const citations = paper.citationCount ?? paper.citations ?? 0;
  const journal = paper.journalName || paper.journal || '';
  const abstract = paper.abstractText || paper.abstract || '';

  // 2. Sửa lỗi lấy Tác giả: Hỗ trợ object {fullName}, chuỗi thuần, hoặc object {name}
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

  // Nếu vẫn không tìm thấy tác giả, hiển thị 'Unknown Author' làm fallback
  if (!authors.trim()) {
    authors = 'Unknown Author';
  }

  // 3. Xử lý mảng Keywords an toàn
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

  const handleCardClick = () => {
    if (onClick) onClick(paper);
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ x: 3 }}
    >
      <Card
        onClick={handleCardClick}
        className="bg-[#101010] border-[#DEDBC8]/5 p-5 transition-all duration-300 hover:border-blue-400/50 dark:hover:border-blue-400/30 cursor-pointer"
      >
        <CardContent className="p-0 flex flex-col sm:flex-row items-start justify-between gap-4">
          {/* KHỐI NỘI DUNG BÊN TRÁI */}
          <div className="flex-1 space-y-2.5 w-full">
            {/* 1. Tên tác giả + Badge phân loại (Hàng trên cùng) */}
            <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 dark:text-slate-400">
              <span className="font-semibold text-gray-800 dark:text-slate-300">
                {authors}
              </span>
              {field && (
                <>
                  <span className="text-gray-300 dark:text-white/10">•</span>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0"
                    style={{
                      backgroundColor: `${badgeColor}15`,
                      color: badgeColor,
                      borderColor: `${badgeColor}35`,
                    }}
                  >
                    {field}
                  </Badge>
                </>
              )}
              {citations > 50000 && (
                <Badge
                  variant="secondary"
                  className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-[9px] font-bold"
                >
                  Classic
                </Badge>
              )}
            </div>

            {/* 2. Tiêu đề bài báo */}
            <h4 className="text-base font-bold text-[#E1E0CC] leading-snug">
              {paper.title || 'Untitled Paper'}
            </h4>

            {/* 3. Đã chuyển: Năm bài báo hiển thị ngay dưới tiêu đề kèm Journal & DOI */}
            <div className="space-y-1">
              {year && (
                <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar
                    size={13}
                    className="text-gray-400 dark:text-slate-500 flex-shrink-0"
                  />
                  <span>{year}</span>
                </p>
              )}
              {journal && (
                <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                  <BookOpen
                    size={13}
                    className="text-gray-400 dark:text-slate-500 flex-shrink-0"
                  />
                  <span className="italic">{journal}</span>
                </p>
              )}
            </div>

            {/* 4. Khối nội dung tóm tắt (Abstract) */}
            {abstract && (
              <div className="bg-gray-50 dark:bg-[#121824]/40 border border-gray-200 dark:border-white/[0.05] p-3 rounded-lg space-y-1.5 mt-1 transition-colors">
                <p
                  className={`text-xs text-gray-600 dark:text-slate-400 leading-relaxed transition-all duration-300 ${
                    isAbstractExpanded ? '' : 'line-clamp-2'
                  }`}
                >
                  <strong className="text-gray-900 dark:text-slate-300 font-semibold mr-1">
                    Abstract:
                  </strong>
                  {abstract}
                </p>
                <button
                  type="button"
                  onClick={() => setIsAbstractExpanded(!isAbstractExpanded)}
                  className="text-[11px] text-[#DEDBC8] hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-0.5 font-medium transition-colors pt-0.5"
                >
                  {isAbstractExpanded ? (
                    <>
                      Read Less <ChevronUp size={12} />
                    </>
                  ) : (
                    <>
                      Read More <ChevronDown size={12} />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* 5. Khối từ khóa phổ biến (Keywords) */}
            {keywordsArray.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {keywordsArray.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2.5 py-1 rounded-md font-bold tracking-wide bg-blue-50/60 text-blue-600 border border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 transition-colors cursor-default"
                  >
                    #{tag.toUpperCase()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* KHỐI SỐ LƯỢNG CITATIONS & NÚT THAO TÁC (BÊN PHẢI) */}
          <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-3 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t border-gray-100 border-[#DEDBC8]/5 sm:border-t-0 sm:pl-4">
            <div className="text-left sm:text-right">
              <div className="text-2xl font-bold text-[#E1E0CC] font-sans tracking-tight">
                {citations.toLocaleString()}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-slate-500 uppercase tracking-wider font-semibold">
                Citations
              </div>
              {paper.trend && (
                <div className="text-[10px] font-semibold mt-0.5 text-emerald-600 dark:text-[#A09878] bg-emerald-50 dark:bg-[#A09878]/5 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-[#A09878]/10 inline-block">
                  {paper.trend}
                </div>
              )}
            </div>

            <div className="flex gap-2 sm:mt-1">
              <FollowButton
                journalId={paper.journalId || null}
                journalName={paper.journalName || paper.journal || null}
                topicId={paper.topicId || null}
                topicName={paper.topicName || paper.field || null}
                keywordId={paper.keywords?.[0]?.keywordId || null}
                keywordText={
                  typeof paper.keywords?.[0] === 'string'
                    ? paper.keywords[0]
                    : paper.keywords?.[0]?.keywordText || null
                }
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleToggleBookmark}
                className={`w-9 h-9 border transition-transform active:scale-95 ${
                  isSaved
                    ? 'bg-blue-50 dark:bg-blue-600/10 border-blue-200 dark:border-blue-500 text-[#DEDBC8] hover:bg-blue-100 dark:hover:bg-blue-600/20'
                    : 'bg-white dark:bg-white/[0.02] border-[#DEDBC8]/10 text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleExternalLink}
                className="w-9 h-9 bg-white dark:bg-white/[0.02] border-[#DEDBC8]/10 text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-transform active:scale-95"
              >
                <ExternalLink size={15} />
              </Button>

              {paper.pdfAvailable && paper.pdfUrl && (
                <span
                  className="w-9 h-9 flex items-center justify-center rounded-md border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
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
