import { Search, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";
import { fuzzySuggestions } from "@/lib/search/ranking";
import type { PostSummary } from "@/lib/content";
interface SearchEmptyStateProps {
  /** Whether a query has been entered. */
  hasQuery: boolean;
  /** Whether results are loading. */
  loading?: boolean;
  /** The current query string. */
  query?: string;
  /** Total results found (0 when no results). */
  total?: number;
  /** All posts for fuzzy matching (used for "Did you mean?" suggestions). */
  allPosts?: PostSummary[];
  /** Callback when a suggestion is clicked. */
  onSuggestionClick?: (query: string) => void;
  className?: string;
}
/**
 * Empty / no-results state for search.
 *
 * Shows different content depending on whether:
 *   - No query has been entered yet (initial state)
 *   - A query was entered but returned no results
 */
const SearchEmptyState = ({
  hasQuery,
  loading = false,
  query,
  total = 0,
  allPosts,
  onSuggestionClick,
  className,
}: SearchEmptyStateProps) => {
  if (loading) {
    return (
      <div
        className={cn("flex flex-col items-center justify-center py-20 text-center", className)}
        role="status"
        aria-live="polite"
      >
        <Search className="mb-4 h-10 w-10 text-muted-foreground/40" aria-hidden />
        <p className="text-sm text-muted-foreground">Searching…</p>
      </div>
    );
  }
  if (!hasQuery) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-20 text-center", className)}>
        <Search className="mb-4 h-10 w-10 text-muted-foreground/40" aria-hidden />
        <p className="font-serif text-lg text-foreground">Search the archive</p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Find articles by title, topic, tag, or author. Start typing to see results instantly.
        </p>
      </div>
    );
  }
  if (total === 0) {
    const suggestions = allPosts && query ? fuzzySuggestions(allPosts, query) : [];
    return (
      <div
        className={cn("flex flex-col items-center justify-center py-20 text-center", className)}
        role="status"
      >
        <SearchX className="mb-4 h-10 w-10 text-muted-foreground/40" aria-hidden />
        <p className="font-serif text-lg text-foreground">No results found</p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {query
            ? `Nothing matched "${query}". Try different keywords or check your spelling.`
            : "Try different keywords or check your spelling."}
        </p>
        {suggestions.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Did you mean:</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSuggestionClick?.(s)}
                  className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};
export default SearchEmptyState;