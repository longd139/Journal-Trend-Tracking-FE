import { useLocation, useOutlet } from 'react-router-dom';
import { useRef } from 'react';

/**
 * KeepAlive — replaces <Outlet /> to preserve page state across navigation.
 *
 * Caches rendered route elements keyed by pathname. All cached pages stay
 * mounted in the DOM; only the active page is visible (display: block).
 * Inactive pages use display: none so React preserves all component state
 * (useState, useEffect data, scroll position, form inputs, etc.).
 *
 * Automatically evicts the oldest cached page when exceeding maxCache.
 */
export default function KeepAlive({ maxCache = 10 }) {
  const { pathname } = useLocation();
  const currentOutlet = useOutlet();
  const cacheRef = useRef(new Map());

  // Store the current route element into cache
  if (currentOutlet) {
    cacheRef.current.set(pathname, currentOutlet);
  }

  // Evict oldest entries when over the limit
  if (cacheRef.current.size > maxCache) {
    const keys = [...cacheRef.current.keys()];
    const removeCount = keys.length - maxCache;
    for (let i = 0; i < removeCount; i++) {
      cacheRef.current.delete(keys[i]);
    }
  }

  return (
    <>
      {Array.from(cacheRef.current.entries()).map(([path, element]) => (
        <div
          key={path}
          style={{
            display: path === pathname ? 'block' : 'none',
            height: '100%',
          }}
        >
          {element}
        </div>
      ))}
    </>
  );
}
