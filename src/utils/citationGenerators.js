/* ═══════════════════════════════════════════════════════════════════════════
   Shared citation formatters — BibTeX, RIS, APA
   Used by CitationExport.jsx and batch export in BookmarksView
   ═══════════════════════════════════════════════════════════════════════════ */

function escapeLatex(text) {
  if (!text) return '';
  return text.replace(/[&%$#_{}~^\\]/g, '\\$&');
}

function formatAuthorsBibtex(authors) {
  if (!authors || !authors.length) return '{}';
  const names = authors.map((a) => {
    const name = typeof a === 'string' ? a : a.fullName || a.name || '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0];
    const last = parts.pop();
    return `${last}, ${parts.join(' ')}`;
  });
  return `{${names.join(' and ')}}`;
}

function formatAuthorsAPA(authors) {
  if (!authors || !authors.length) return '';
  return authors
    .map((a) => {
      const name = typeof a === 'string' ? a : a.fullName || a.name || '';
      const parts = name.trim().split(' ');
      if (parts.length === 1) return parts[0];
      const last = parts.pop();
      const initials = parts.map((p) => `${p[0]}.`).join(' ');
      return `${last}, ${initials}`;
    })
    .join(', ');
}

function formatAuthorsRIS(authors) {
  if (!authors || !authors.length) return '';
  return authors
    .map((a) => {
      const name = typeof a === 'string' ? a : a.fullName || a.name || '';
      return `AU  - ${name}`;
    })
    .join('\n');
}

export function generateBibtex(paper) {
  const key = paper.doi
    ? paper.doi.replace(/[^a-zA-Z0-9]/g, '_')
    : `paper_${paper.paperId}`;
  const title = escapeLatex(paper.title || 'Untitled');
  const authors = formatAuthorsBibtex(paper.authors || []);
  const journal = escapeLatex(paper.journalName || paper.journal || '');
  const year = paper.pubYear || paper.year || '';
  const doi = paper.doi || '';
  const volume = paper.volume || '';
  const pages = paper.pages || '';

  return [
    '@article{',
    `  author    = ${authors},`,
    `  title     = {{${title}}},`,
    `  journal   = {${journal}},`,
    `  year      = {${year}},`,
    volume && `  volume    = {${volume}},`,
    pages && `  pages     = {${pages}},`,
    doi && `  doi       = {${doi}},`,
    '}',
  ]
    .filter(Boolean)
    .join('\n');
}

export function generateRIS(paper) {
  const title = paper.title || 'Untitled';
  const journal = paper.journalName || paper.journal || '';
  const year = paper.pubYear || paper.year || '';
  const doi = paper.doi || '';
  const authors = formatAuthorsRIS(paper.authors || []);

  return [
    'TY  - JOUR',
    `TI  - ${title}`,
    authors,
    `JO  - ${journal}`,
    `PY  - ${year}`,
    doi && `DO  - ${doi}`,
    'ER  - ',
    '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function generateAPA(paper) {
  const authors = formatAuthorsAPA(paper.authors || []);
  const year = paper.pubYear || paper.year || '';
  const title = paper.title || 'Untitled';
  const journal = paper.journalName || paper.journal || '';
  const doi = paper.doi || '';
  const pages = paper.pages || '';

  let citation = authors ? `${authors} ` : '';
  citation += year ? `(${year}). ` : '';
  citation += `${title}. `;
  citation += journal ? `*${journal}*` : '';
  if (pages) citation += `, ${pages}`;
  citation += '.';
  if (doi) citation += ` https://doi.org/${doi}`;

  return citation;
}

export const FORMATS = [
  { key: 'bibtex', label: 'BibTeX', ext: '.bib', mime: 'application/x-bibtex', generator: generateBibtex },
  { key: 'ris', label: 'RIS', ext: '.ris', mime: 'application/x-research-info-systems', generator: generateRIS },
  { key: 'apa', label: 'APA', ext: '.txt', mime: 'text/plain', generator: generateAPA },
];

/**
 * Generate combined citations for multiple papers in a given format.
 * Papers are separated by a delimiter comment.
 */
export function generateBatchCitations(papers, formatKey) {
  const fmt = FORMATS.find((f) => f.key === formatKey);
  if (!fmt) return '';

  return papers
    .map((paper, i) => {
      const citation = fmt.generator(paper);
      const separator = formatKey === 'bibtex'
        ? `\n% --- Paper ${i + 1}: ${paper.title || 'Untitled'} ---\n`
        : `\n\n--- Paper ${i + 1}: ${paper.title || 'Untitled'} ---\n\n`;
      return i === 0 ? citation : separator + citation;
    })
    .join('');
}

/**
 * Download combined citations as a file.
 */
export function downloadBatchFile(content, formatKey) {
  const fmt = FORMATS.find((f) => f.key === formatKey);
  if (!fmt) return;

  const blob = new Blob([content], { type: fmt.mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `batch_citations${fmt.ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
