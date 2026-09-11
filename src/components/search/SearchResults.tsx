import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/lib/search/types";
import CategoryBadge from "@/components/content/CategoryBadge";
interface SearchResultsProps {
  results: SearchResult[];
  className?: string;
  onClear?: () => void;
}
/**
 * Renders search results as a list of article cards with keyboard navigation.
 *
 * Keyboard controls:
 *   - ArrowDown / ArrowUp: navigate between results
 *   - Enter: navigate to the selected result
 *   - Escape: clear search
 *
 * Each result links to the article page. If a highlight snippet is
 * available, it's shown below the description.
 */
const SearchResults = ({ results, className, onClear }: SearchResultsProps) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [results]);
  // Keyboard navigation
  useEffect(() => {
    if (results.length === 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && results[activeIndex]) {
        e.preventDefault();
        navigate(`/blog/${results[activeIndex].slug}`);
      } else if (e.key === "Escape") {
        onClear?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [results, activeIndex, navigate, onClear]);
  if (results.length === 0) return null;
  return (
    <div
      className={cn("divide-y divide-border", className)}
      role="listbox"
      aria-label="Search results"
      aria-live="polite"
      aria-activedescendant={`search-result-${activeIndex}`}
    >
      {results.map((result, i) => {
        const href = `/blog/${result.slug}`;
        const dateLabel = format(new Date(result.date), "MMM d, yyyy");
        const isActive = i === activeIndex;
        return (
          <article
            key={result.slug}
            id={`search-result-${i}`}
            role="option"
            aria-selected={isActive}
            className={cn(
              "py-6 transition-colors",
              isActive && "bg-accent/5 rounded-md px-2 -mx-2",
            )}
          >
            <Link
              to={href}
              className="group block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <CategoryBadge category={result.category} className="mb-2 inline-block" />
              <h3 className="mb-2 font-serif text-xl font-semibold leading-snug text-foreground transition-colors group-hover:text-muted-foreground">
                {result.title}
              </h3>
              <p className="line-clamp-2 mb-3 text-sm text-muted-foreground">
                {result.description}
              </p>
              {result.highlight ? (
                <p className="line-clamp-2 mb-3 text-sm italic text-muted-foreground/80">
                  {result.highlight}
                </p>
              ) : null}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" aria-hidden />
                  {dateLabel}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden />
                  {result.readingTime} min read
                </span>
                {result.tags.length > 0 ? (
                  <span className="hidden sm:inline">
                    {result.tags
                      .slice(0, 3)
                      .map((t) => `#${t}`)
                      .join(" ")}
                  </span>
                ) : null}
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  );
};
export default SearchResults;