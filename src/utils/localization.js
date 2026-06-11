import i18n from '../i18n/index.js';

/**
 * Format a date according to the current locale.
 * @param {Date|string|number} date - The date to format
 * @param {Intl.DateTimeFormatOptions} [options] - Intl formatting options
 * @param {string} [locale] - Override locale (defaults to i18n.language)
 * @returns {string} Formatted date string
 *
 * @example
 * formatDate(new Date()) // "June 12, 2026" (en) or "12 tháng 6, 2026" (vi)
 * formatDate(new Date(), { month: 'short', year: 'numeric' }) // "Jun 2026"
 */
export function formatDate(date, options, locale) {
  const loc = locale || i18n.language || 'en';
  const defaults = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Intl.DateTimeFormat(loc, options || defaults).format(
    new Date(date),
  );
}

/**
 * Format a number according to the current locale.
 * @param {number} num - The number to format
 * @param {Intl.NumberFormatOptions} [options] - Intl formatting options
 * @param {string} [locale] - Override locale (defaults to i18n.language)
 * @returns {string} Formatted number string
 *
 * @example
 * formatNumber(12500) // "12,500" (en) or "12.500" (vi)
 * formatNumber(1234567.89, { style: 'decimal', maximumFractionDigits: 2 })
 */
export function formatNumber(num, options, locale) {
  const loc = locale || i18n.language || 'en';
  return new Intl.NumberFormat(loc, options).format(num);
}

/**
 * Format a compact number (e.g., 1.2K, 3.4M).
 * @param {number} num - The number to format
 * @param {string} [locale] - Override locale
 * @returns {string} Compact number string
 */
export function formatCompactNumber(num, locale) {
  const loc = locale || i18n.language || 'en';
  return new Intl.NumberFormat(loc, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
}

/**
 * Format a relative time string.
 * @param {Date|string|number} date - The date to format relatively
 * @param {string} [locale] - Override locale
 * @returns {string} Relative time string (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeTime(date, locale) {
  const loc = locale || i18n.language || 'en';
  const now = new Date();
  const then = new Date(date);
  const diffMs = then.getTime() - now.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const absDiffSecs = Math.abs(diffSecs);

  const rtf = new Intl.RelativeTimeFormat(loc, { numeric: 'auto' });

  const units = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ];

  for (const { unit, seconds } of units) {
    const value = Math.round(diffSecs / seconds);
    if (Math.abs(value) >= 1 || unit === 'second') {
      return rtf.format(value, unit);
    }
  }

  return rtf.format(diffSecs, 'second');
}

/**
 * Get locale-aware date format samples for preview.
 * @param {string} [locale] - The locale to preview
 * @returns {{ date: string, number: string }} Sample formatted values
 */
export function getLocalePreview(locale) {
  const loc = locale || i18n.language || 'en';
  return {
    date: formatDate(new Date(), undefined, loc),
    number: formatNumber(12500, undefined, loc),
    compactNumber: formatCompactNumber(52847, loc),
  };
}
