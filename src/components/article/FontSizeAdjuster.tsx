import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
/**
 * Font size adjuster for article reading.
 *
 * Provides A-/A+ buttons that scale the article body font size.
 * The preference is persisted in localStorage and applied via a
 * CSS custom property (--article-font-scale).
 */
const STORAGE_KEY = "site-font-scale";
const MIN_SCALE = 0.85;
const MAX_SCALE = 1.3;
const STEP = 0.075;
const FontSizeAdjuster = ({ className }: { className?: string }) => {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = parseFloat(stored);
        if (!Number.isNaN(parsed) && parsed >= MIN_SCALE && parsed <= MAX_SCALE) {
          setScale(parsed);
          document.documentElement.style.setProperty("--article-font-scale", String(parsed));
        }
      }
    } catch {
      // localStorage unavailable
    }
  }, []);
  const applyScale = (newScale: number) => {
    const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
    setScale(clamped);
    document.documentElement.style.setProperty("--article-font-scale", String(clamped));
    try {
      localStorage.setItem(STORAGE_KEY, String(clamped));
    } catch {
      // ignore
    }
  };
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        type="button"
        onClick={() => applyScale(scale - STEP)}
        disabled={scale <= MIN_SCALE}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label="Decrease font size"
      >
        A−
      </button>
      <button
        type="button"
        onClick={() => applyScale(1)}
        className="inline-flex h-8 items-center justify-center rounded-md border border-border px-2 text-xs text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label="Reset font size"
      >
        Reset
      </button>
      <button
        type="button"
        onClick={() => applyScale(scale + STEP)}
        disabled={scale >= MAX_SCALE}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-base text-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label="Increase font size"
      >
        A+
      </button>
    </div>
  );
};
export default FontSizeAdjuster;