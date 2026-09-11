import { useEffect } from "react";
const STORAGE_KEY_PREFIX = "reading-position:";
/**
 * Hook for persisting and restoring reading scroll position per article.
 *
 * On mount: restores the saved scroll position for the given slug.
 * On unmount: saves the current scroll position.
 * When reading progress > 95%: clears the saved position (article fully read).
 *
 * @param slug - Article slug for storage key
 * @param progress - Reading progress (0-100), used to clear when fully read
 */
export function useReadingPosition(slug: string, progress: number) {
  // Restore scroll position on mount
  useEffect(() => {
    const key = `${STORAGE_KEY_PREFIX}${slug}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const position = parseInt(saved, 10);
        if (!Number.isNaN(position) && position > 0) {
          requestAnimationFrame(() => window.scrollTo(0, position));
        }
      }
    } catch {
      // localStorage not available
    }
  }, [slug]);
  // Save scroll position periodically and on unmount
  useEffect(() => {
    const key = `${STORAGE_KEY_PREFIX}${slug}`;
    const save = () => {
      try {
        localStorage.setItem(key, String(window.scrollY));
      } catch {
        // Ignore
      }
    };
    const interval = setInterval(save, 5000);
    window.addEventListener("beforeunload", save);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", save);
      // Clear if fully read, otherwise save current position
      try {
        if (progress > 95) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, String(window.scrollY));
        }
      } catch {
        // Ignore
      }
    };
  }, [slug, progress]);
}