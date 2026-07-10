import { BarChart2, BookOpen, User, FileText } from 'lucide-react';

/**
 * Report type configuration — shared across all report components.
 * Each type maps to an icon, color, label, and placeholder for the generator card.
 */
const REPORT_TYPES = {
  'keyword-trend': {
    icon: BarChart2,
    color: '#3B82F6',
    label: 'Keyword Trend',
    descriptionKey: 'templates.trendAnalysis.description',
    placeholderKey: 'input.placeholder.keyword',
    apiFn: 'getKeywordTrend',
  },
  'journal-quality': {
    icon: BookOpen,
    color: '#DEDBC8',
    label: 'Journal Quality',
    descriptionKey: 'templates.readingList.description',
    placeholderKey: 'input.placeholder.journal',
    apiFn: 'getJournalQuality',
  },
  'author-impact': {
    icon: User,
    color: '#A09878',
    label: 'Author Impact',
    descriptionKey: 'templates.authorImpact.description',
    placeholderKey: 'input.placeholder.author',
    apiFn: 'getAuthorImpact',
  },
};

/** Fallback for unknown report types */
const DEFAULT_TYPE_CONFIG = { icon: FileText, color: '#DEDBC8', label: 'Report' };

/**
 * Get the display config for a report type.
 * @param {string} type - one of 'keyword-trend' | 'journal-quality' | 'author-impact'
 * @returns {{ icon: React.Component, color: string, label: string }}
 */
export function getReportTypeConfig(type) {
  return REPORT_TYPES[type] || DEFAULT_TYPE_CONFIG;
}

export { REPORT_TYPES };
export default REPORT_TYPES;
