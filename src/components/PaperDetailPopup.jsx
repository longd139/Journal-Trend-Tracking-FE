import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bookmark,
  ExternalLink,
  FileText,
  FileSpreadsheet,
  User,
  Calendar,
  BookOpen,
  Link2,
  Quote,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export function PaperDetailPopup({
  paper,
  isOpen,
  onClose,
  isSaved = false,
  onToggleBookmark,
  badgeColor = '#4F8CFF',
}) {
  const { t } = useTranslation('search');

  if (!paper) return null;

  // Chuẩn hóa dữ liệu
  const authors = Array.isArray(paper.authors)
    ? paper.authors.map((a) => a.fullName).join(', ')
    : paper.authors || '';
  const year = paper.pubYear || paper.year || '';
  const citations = paper.citationCount ?? paper.citations ?? 0;
  const journal = paper.journalName || paper.journal || '';
  const field = paper.fieldName || paper.field || '';
  const doi = paper.doi || '';
  const abstract = paper.abstractText || paper.abstract || '';
  const sourceUrl = paper.sourceUrl || paper.downloadUrl || '';
  const pdfUrl = paper.pdfUrl || '';
  const csvUrl = paper.csvUrl || '';

  const handleViewOriginal = () => {
    if (sourceUrl) window.open(sourceUrl, '_blank');
    else if (doi) window.open(`https://doi.org/${doi}`, '_blank');
  };

  const handleDownloadPdf = () => {
    if (pdfUrl) window.open(pdfUrl, '_blank');
  };

  const handleDownloadCsv = () => {
    if (csvUrl) window.open(csvUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white dark:bg-[#1B2235] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white max-w-xl max-h-[85vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-gray-200 dark:border-white/10 text-left">
          <DialogTitle className="text-base font-bold text-gray-900 dark:text-white leading-snug pr-6">
            {paper.title || 'Untitled Paper'}
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Authors */}
          {authors && (
            <div className="flex items-start gap-2.5">
              <User size={16} className="text-gray-400 dark:text-slate-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-slate-500 mb-0.5">
                  {t('detail.authors')}
                </p>
                <p className="text-sm text-gray-800 dark:text-slate-200 font-medium">
                  {authors}
                </p>
              </div>
            </div>
          )}

          {/* Year + Journal row */}
          <div className="flex items-center gap-4 flex-wrap">
            {year && (
              <div className="flex items-center gap-1.5">
                <Calendar size={15} className="text-gray-400 dark:text-slate-500 shrink-0" />
                <span className="text-xs text-gray-600 dark:text-slate-400">
                  <span className="text-gray-400 dark:text-slate-500 mr-1">{t('detail.year')}:</span>
                  <span className="font-mono font-medium text-gray-800 dark:text-slate-200">{year}</span>
                </span>
              </div>
            )}
            {journal && (
              <div className="flex items-center gap-1.5">
                <BookOpen size={15} className="text-gray-400 dark:text-slate-500 shrink-0" />
                <span className="text-xs text-gray-600 dark:text-slate-400">
                  <span className="text-gray-400 dark:text-slate-500 mr-1">{t('detail.journal')}:</span>
                  <span className="italic text-gray-800 dark:text-slate-200">{journal}</span>
                </span>
              </div>
            )}
          </div>

          {/* Field + Citations row */}
          <div className="flex items-center gap-3 flex-wrap">
            {field && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-slate-500">
                  {t('detail.field')}:
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor: `${badgeColor}15`,
                    color: badgeColor,
                    borderColor: `${badgeColor}35`,
                  }}
                >
                  {field}
                </Badge>
              </div>
            )}
            {citations > 0 && (
              <div className="flex items-center gap-1.5">
                <Quote size={15} className="text-gray-400 dark:text-slate-500 shrink-0" />
                <span className="text-xs text-gray-600 dark:text-slate-400">
                  <span className="text-gray-400 dark:text-slate-500 mr-1">{t('detail.citations')}:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{citations.toLocaleString()}</span>
                </span>
              </div>
            )}
          </div>

          {/* DOI */}
          {doi && (
            <div className="flex items-start gap-2.5">
              <Link2 size={16} className="text-gray-400 dark:text-slate-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-slate-500 mb-0.5">
                  {t('detail.doi')}
                </p>
                <a
                  href={`https://doi.org/${doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-mono break-all"
                >
                  {doi}
                </a>
              </div>
            </div>
          )}

          {/* Abstract */}
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-slate-500">
              {t('detail.abstract')}
            </p>
            {abstract ? (
              <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                {abstract}
              </p>
            ) : (
              <p className="text-sm text-gray-400 dark:text-slate-500 italic">
                {t('detail.noAbstract')}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-5 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0F1525] rounded-b-lg">
          <div className="flex items-center gap-2">
            {/* Bookmark */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(paper);
              }}
              className={`h-8 border transition-all ${
                isSaved
                  ? 'bg-blue-50 dark:bg-blue-600/10 border-blue-200 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-600/20'
                  : 'bg-white dark:bg-white/[0.02] border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} />
              <span className="ml-1.5 text-xs font-medium">
                {isSaved ? t('bookmark.remove') : t('bookmark.save')}
              </span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* PDF download */}
            {pdfUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadPdf}
                className="h-8 border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] text-gray-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/20 transition-all text-xs"
              >
                <FileText size={14} className="mr-1.5" />
                {t('detail.downloadPdf')}
              </Button>
            )}

            {/* CSV download */}
            {csvUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadCsv}
                className="h-8 border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] text-gray-600 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400 hover:border-green-200 dark:hover:border-green-500/20 transition-all text-xs"
              >
                <FileSpreadsheet size={14} className="mr-1.5" />
                {t('detail.downloadCsv')}
              </Button>
            )}

            {/* View Original Paper */}
            {(sourceUrl || doi) && (
              <Button
                type="button"
                size="sm"
                onClick={handleViewOriginal}
                className="h-8 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-xs font-medium shadow-sm shadow-blue-500/20 transition-all"
              >
                <ExternalLink size={14} className="mr-1.5" />
                {t('detail.viewOriginal')}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PaperDetailPopup;
