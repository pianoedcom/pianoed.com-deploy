import { useState, useCallback, useEffect } from "react";
const STORAGE_KEY = "search-history";
const MAX_HISTORY = 10;
/**
 * Hook for persisting recent search queries to localStorage.
 * Provides a list of recent searches, a function to add new searches,
 * and a function to clear the history.
 */
export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        if (Array.isArray(parsed)) setHistory(parsed);
      }
    } catch {
      // localStorage not available or corrupted — ignore
    }
  }, []);
  const addSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    setHistory((prev) => {
      const filtered = prev.filter((h) => h !== query);
      const updated = [query, ...filtered].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  }, []);
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);
  return { history, addSearch, clearHistory };
}