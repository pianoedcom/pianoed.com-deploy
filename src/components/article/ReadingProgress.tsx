import { useEffect, useState } from "react";
/**
 * ReadingProgress — a thin progress bar fixed to the top of the viewport
 * that fills as the user scrolls through the article.
 *
 * Uses a single scroll listener with requestAnimationFrame throttling.
 * No external scroll library. Respects reduced-motion preferences
 * (the bar still tracks but transitions are disabled globally).
 */
const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let ticking = false;
    const update = () => {
      const article = document.querySelector("article");
      if (!article) {
        ticking = false;
        return;
      }
      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleHeight = rect.height;
      const viewport = window.innerHeight;
      // How far we've scrolled into the article (can be negative before
      // the article top reaches the viewport top, or exceed height near end).
      const scrolled = window.scrollY - articleTop + viewport * 0.4;
      const pct = Math.max(0, Math.min(1, scrolled / (articleHeight + viewport * 0.4)));
      setProgress(pct * 100);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <div
      className="fixed left-0 top-0 z-[60] h-0.5 w-full bg-transparent"
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-primary transition-[width] duration-75 ease-out motion-reduce:transition-none"
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />
    </div>
  );
};
export default ReadingProgress;