import { useState, useEffect } from 'react';

/**
 * Fetches live data from the backend API with a mock fallback.
 * @param {string} endpoint  - e.g. '/api/news' or '/api/commodities'
 * @param {*} mockFallback   - value to use if the fetch fails or backend is down
 * @param {number} ttlMs     - how often to re-fetch (default: 15 minutes)
 */
export function useLiveData(endpoint, mockFallback, ttlMs = 15 * 60 * 1000) {
  const [data, setData] = useState(null);
  const [source, setSource] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await fetch(endpoint, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setSource(json.source ?? 'live');
        }
      } catch {
        if (!cancelled) {
          setData({ source: 'mock', ...mockFallback });
          setSource('mock');
        }
      }
    }

    fetchData();
    const interval = setInterval(fetchData, ttlMs);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [endpoint, ttlMs]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, source };
}
