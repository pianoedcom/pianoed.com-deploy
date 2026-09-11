import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Seo from "@/components/layout/Seo";
import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/content/Breadcrumbs";
import SearchInput from "@/components/search/SearchInput";
import SearchResults from "@/components/search/SearchResults";
import SearchEmptyState from "@/components/search/SearchEmptyState";
import type { SearchResult } from "@/lib/search/types";
import { siteConfig } from "@/lib/site-config";
import { reportError } from "@/lib/observability";
import { track } from "@/lib/analytics";
/**
 * Search page — /search?q=query
 *
 * The URL is shareable and crawlable. The page uses `noindex` metadata
 * to prevent search result pages from being indexed by search engines,
 * since they generate thin/dynamic content.
 */
const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const lastTrackedQuery = useRef("");
  const handleResults = useCallback((newResults: SearchResult[], newTotal: number, q: string) => {
    setResults(newResults);
    setTotal(newTotal);
    setHasSearched(true);
    setSearchError(null);
    // Track search queries (deduplicated to avoid spamming on each keystroke)
    const trimmed = q.trim();
    if (trimmed && trimmed !== lastTrackedQuery.current) {
      lastTrackedQuery.current = trimmed;
      track("search_query", { query: trimmed, resultCount: newTotal });
    }
  }, []);
  const handleError = useCallback((error: unknown) => {
    const userMsg = reportError(error, undefined, { boundary: "search" });
    setSearchError(userMsg);
    setResults([]);
    setTotal(0);
    setHasSearched(true);
  }, []);
  const handleLoadingChange = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);
  const handleQueryChange = useCallback((q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      setTotal(0);
      setHasSearched(false);
    }
  }, []);
  // Trigger initial search if URL has a query on mount.
  useEffect(() => {
    if (urlQuery && !hasSearched) {
      setQuery(urlQuery);
    }
  }, [urlQuery, hasSearched]);
  const hasQuery = query.trim().length > 0;
  const seoTitle = hasQuery
    ? `Search: ${query} — ${siteConfig.name}`
    : `Search — ${siteConfig.name}`;
  const seoDescription = `Search articles on ${siteConfig.name} by title, topic, tag, or author.`;
  return (
    <>
      <Seo title={seoTitle} description={seoDescription} path="/search" noindex />
      <Container className="py-12 sm:py-16" width="default">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
        <header className="mb-8">
          <p className="eyebrow mb-3">Search</p>
          <h1 className="display-heading mb-6 text-4xl text-foreground sm:text-5xl">
            Find Articles
          </h1>
          <SearchInput
            autoFocus
            onQueryChange={handleQueryChange}
            onResults={handleResults}
            onLoadingChange={handleLoadingChange}
            onError={handleError}
            className="max-w-2xl"
          />
        </header>
        <div aria-live="polite" aria-atomic="true">
          {searchError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-center">
              <p className="text-sm font-medium text-foreground">Search failed</p>
              <p className="mt-1 text-sm text-muted-foreground">{searchError}</p>
              <p className="mt-2 text-xs text-muted-foreground/70">
                Try refining your query or searching again.
              </p>
            </div>
          ) : (
            <>
              {hasQuery && !loading && total > 0 ? (
                <p className="mb-6 text-sm text-muted-foreground">
                  {total} {total === 1 ? "result" : "results"}
                  {query ? ` for "${query}"` : ""}
                </p>
              ) : null}
              {hasQuery && results.length > 0 ? (
                <SearchResults results={results} />
              ) : !hasQuery && !loading ? (
                <div className="mt-8">
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Popular Searches
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "beginner piano",
                      "piano technique",
                      "sheet music",
                      "jazz piano",
                      "digital piano",
                      "piano history",
                    ].map((term) => (
                      <a
                        key={term}
                        href={`/search?q=${encodeURIComponent(term)}`}
                        className="inline-flex items-center rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        {term}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <SearchEmptyState
                  hasQuery={hasQuery}
                  loading={loading}
                  query={query}
                  total={total}
                />
              )}
            </>
          )}
        </div>
      </Container>
    </>
  );
};
export default SearchPage;