import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../lib/analytics';

/**
 * Tracks page_view on every React Router navigation.
 * Mount once inside <BrowserRouter> (in App.tsx).
 * Deduplicates: won't fire twice for the same path.
 */
export function useAnalytics() {
  const location = useLocation();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const path = location.pathname + location.search;

    // Skip if same path (StrictMode double-fire guard)
    if (lastPath.current === path) return;
    lastPath.current = path;

    trackPageView(path);
  }, [location]);
}