import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'theme';

/**
 * Resolve a system-preference media-query to 'dark' or 'light'.
 * Pure function — safe to call anywhere (SSR, inline script, React).
 */
function resolveSystemTheme() {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Read the raw stored value: 'dark' | 'light' | 'system' | null.
 * Falls back to 'system' when nothing is stored.
 */
function getStoredTheme() {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light' || stored === 'system') return stored;
  return 'system';
}

/**
 * Resolve the *actual* theme that should be applied to <html>.
 * 'system' delegates to the OS preference; 'dark'/'light' are explicit.
 */
export function getResolvedTheme() {
  const stored = getStoredTheme();
  return stored === 'system' ? resolveSystemTheme() : stored;
}

/**
 * Apply / remove the .dark class on <html>. Idempotent — safe to call
 * from both the inline <script> and React.
 */
export function applyThemeClass(resolved) {
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// ─── Subscriptions for external changes (other tabs, DevTools) ────────────
let listeners = [];

function subscribeToStorage(cb) {
  const handler = (e) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

function subscribeToSystem(cb) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => cb();
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}

function subscribe(cb) {
  listeners.push(cb);
  const unsub1 = subscribeToStorage(cb);
  const unsub2 = subscribeToSystem(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
    unsub1();
    unsub2();
  };
}

function getSnapshot() {
  return getResolvedTheme();
}

// ─── Hook ─────────────────────────────────────────────────────────────────

/**
 * useTheme — read & write the application theme.
 *
 * Returns { theme, resolvedTheme, setTheme }
 *   - theme:         'dark' | 'light' | 'system'  (the stored preference)
 *   - resolvedTheme: 'dark' | 'light'              (what's actually applied)
 *   - setTheme(t):   persist a new preference
 *
 * The .dark class on <html> is kept in sync automatically.
 * Changes from other tabs (localStorage "storage" event) and OS-level
 * preference switches are picked up without a page reload.
 */
export function useTheme() {
  const resolvedTheme = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const [theme, setThemeState] = useState(getStoredTheme);

  // Sync .dark class whenever resolvedTheme changes
  useEffect(() => {
    applyThemeClass(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((newTheme) => {
    if (newTheme !== 'dark' && newTheme !== 'light' && newTheme !== 'system') return;
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    // Immediately apply — don't wait for useSyncExternalStore to re-render
    const resolved = newTheme === 'system' ? resolveSystemTheme() : newTheme;
    applyThemeClass(resolved);
  }, []);

  return { theme, resolvedTheme, setTheme };
}

export default useTheme;
