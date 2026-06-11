import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatNumber, formatCompactNumber, formatRelativeTime } from '../utils/localization';

/**
 * Enhanced localization hook that combines react-i18next translation
 * with memoized date/number formatting functions.
 *
 * @param {string|string[]} [ns] - Namespace(s) to load
 * @returns {{ t, i18n, formatDate, formatNumber, formatCompactNumber, formatRelativeTime, currentLanguage }}
 */
export function useLocalization(ns) {
  const { t, i18n } = useTranslation(ns);

  const currentLanguage = i18n.language;

  // Memoize format functions to avoid recreating on every render
  const formatDateMemo = useCallback(
    (date, options) => formatDate(date, options, currentLanguage),
    [currentLanguage],
  );

  const formatNumberMemo = useCallback(
    (num, options) => formatNumber(num, options, currentLanguage),
    [currentLanguage],
  );

  const formatCompactNumberMemo = useCallback(
    (num) => formatCompactNumber(num, currentLanguage),
    [currentLanguage],
  );

  const formatRelativeTimeMemo = useCallback(
    (date) => formatRelativeTime(date, currentLanguage),
    [currentLanguage],
  );

  return useMemo(
    () => ({
      t,
      i18n,
      currentLanguage,
      formatDate: formatDateMemo,
      formatNumber: formatNumberMemo,
      formatCompactNumber: formatCompactNumberMemo,
      formatRelativeTime: formatRelativeTimeMemo,
    }),
    [t, i18n, currentLanguage, formatDateMemo, formatNumberMemo, formatCompactNumberMemo, formatRelativeTimeMemo],
  );
}

export default useLocalization;
