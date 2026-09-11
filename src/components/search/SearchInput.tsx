import { useState, useEffect, useRef, useCallback, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateQuery } from "@/lib/search/types";
import { clientSearch } from "@/app/api/search/route";
import type { SearchResult } from "@/lib/search/types";
interface SearchInputProps {
  /** Placeholder text. */
  placeholder?: string;
  /** Additional class names. */
  className?: string;
  /** Autofocus on mount. */
  autoFocus?: boolean;
  /** Called when the query changes (for live search). */
  onQueryChange?: (query: string) => void;
  /** Called when results are loaded. */
  onResults?: (results: SearchResult[], total: number, query: string) => void;
  /** Called when loading state changes. */
  onLoadingChange?: (loading: boolean) => void;
  /** Called when a search error occurs. */
  onError?: (error: unknown) => void;
}
/** Debounce delay for live search (ms). */
const DEBOUNCE_MS = 250;
/**
 * Search input with debounced live search.
 *
 * Reads and writes the `q` URL search param so the search URL is
 * shareable. Uses the client-side search helper which indexes
 * post metadata only — no article bodies are shipped to the browser.
 */
const SearchInput = ({
  placeholder = "Search articles…",
  className,
  autoFocus = false,
  onQueryChange,
  onResults,
  onLoadingChange,
  onError,
}: SearchInputProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialQuery = searchParams.get("q") ?? "";
  const [inputValue, setInputValue] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  /** Execute search and notify parent. */
  const executeSearch = useCallback(
    async (query: string) => {
      const validation = validateQuery(query);
      if (!validation.valid) {
        onResults?.([], 0, "");
        setLoading(false);
        return;
      }
      try {
        const response = await clientSearch(validation.query);
        onResults?.(response.results, response.total, response.query);
      } catch (err) {
        onError?.(err);
      } finally {
        setLoading(false);
      }
    },
    [onResults, onError],
  );
  // Sync input with URL on back/forward navigation.
  useEffect(() => {
    const urlQuery = searchParams.get("q") ?? "";
    if (urlQuery !== inputValue) {
      setInputValue(urlQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  // Autofocus on mount.
  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);
  // Trigger initial search on mount if URL has a query.
  useEffect(() => {
    const urlQuery = searchParams.get("q") ?? "";
    if (urlQuery) {
      setLoading(true);
      void executeSearch(urlQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Notify loading state changes.
  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);
  /** Update URL and trigger debounced search. */
  const handleChange = (value: string) => {
    setInputValue(value);
    onQueryChange?.(value);
    setLoading(true);
    // Update URL search param.
    const params = new URLSearchParams(searchParams);
    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }
    setSearchParams(params, { replace: true });
    // Debounce the search execution.
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      void executeSearch(value);
    }, DEBOUNCE_MS);
  };
  /** Handle form submit (Enter key). */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setLoading(true);
    void executeSearch(inputValue);
  };
  /** Clear the search. */
  const handleClear = () => {
    setInputValue("");
    onQueryChange?.("");
    onResults?.([], 0, "");
    const params = new URLSearchParams(searchParams);
    params.delete("q");
    setSearchParams(params, { replace: true });
    inputRef.current?.focus();
  };
  return (
    <form role="search" onSubmit={handleSubmit} className={cn("relative", className)}>
      <label htmlFor="search-input" className="sr-only">
        Search articles
      </label>
      <div className="relative flex items-center">
        <Search
          className="pointer-events-none absolute left-4 h-5 w-5 text-muted-foreground"
          aria-hidden
        />
        <input
          ref={inputRef}
          id="search-input"
          type="search"
          name="q"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          maxLength={200}
          aria-label="Search articles"
          autoComplete="off"
          spellCheck={false}
          className="h-14 w-full rounded-lg border border-border bg-card pl-12 pr-12 font-sans text-base text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
        {loading ? (
          <Loader2
            className="absolute right-4 h-5 w-5 animate-spin text-muted-foreground"
            aria-hidden
          />
        ) : inputValue ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>
    </form>
  );
};
export default SearchInput;