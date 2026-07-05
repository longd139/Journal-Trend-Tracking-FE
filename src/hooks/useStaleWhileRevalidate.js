import { useState, useEffect, useCallback, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   useStaleWhileRevalidate — cache-first data fetching

   - Returns cached data instantly (no loading spinner on tab switch)
   - Refetches in background, updates UI when fresh data arrives
   - TTL controls how long cached data is considered "fresh"
   ═══════════════════════════════════════════════════════════════════════════ */

const cache = new Map();

export function useStaleWhileRevalidate(key, fetcher, { ttl = 5 * 60 * 1000, enabled = true, defaultValue } = {}) {
  const cachedEntry = cache.get(key);
  const hasFreshCache = cachedEntry && (Date.now() - cachedEntry.timestamp < ttl);

  const [data, setData] = useState(() => {
    if (hasFreshCache) return cachedEntry.data;
    return defaultValue;
  });
  const [loading, setLoading] = useState(!hasFreshCache && enabled);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);

  const fetch = useCallback(async (force = false) => {
    if (!enabled) return;
    if (fetchingRef.current && !force) return;
    fetchingRef.current = true;

    if (!data) setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      cache.set(key, { data: result, timestamp: Date.now() });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [key, fetcher, enabled, data]);

  // Initial fetch
  useEffect(() => {
    const entry = cache.get(key);
    const isFresh = entry && (Date.now() - entry.timestamp < ttl);

    if (isFresh) {
      // Already showing cached data — silent background refresh if stale-ish
      const age = Date.now() - entry.timestamp;
      if (age > ttl / 2) {
        fetch();
      }
    } else {
      fetch();
    }
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset when key changes
  useEffect(() => {
    return () => {
      fetchingRef.current = false;
    };
  }, [key]);

  const mutate = useCallback((updater) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      cache.set(key, { data: next, timestamp: Date.now() });
      return next;
    });
  }, [key]);

  return { data, loading, error, refetch: () => fetch(true), mutate };
}

/**
 * Clear specific cache entry or entire cache.
 */
export function clearCache(key) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

/**
 * Prepend an item to a cached array (used for optimistic bookmark adds).
 * Deduplicates by comparing item.bookmarkId or item.paperId.
 */
export function prependToCache(key, item) {
  const entry = cache.get(key);
  if (entry && Array.isArray(entry.data)) {
    const itemId = item.bookmarkId || item.paperId;
    const filtered = entry.data.filter((e) => {
      const eId = e.bookmarkId || e.paperId;
      return eId !== itemId;
    });
    cache.set(key, { data: [item, ...filtered], timestamp: Date.now() });
  }
}

/**
 * Remove an item from a cached array by predicate (used for optimistic bookmark removes).
 */
export function removeFromCache(key, matchFn) {
  const entry = cache.get(key);
  if (entry && Array.isArray(entry.data)) {
    cache.set(key, { data: entry.data.filter((e) => !matchFn(e)), timestamp: Date.now() });
  }
}
