/**
 * Search API route.
 *
 * In a Next.js deployment this would be an App Router route handler at
 * `src/app/api/search/route.ts` exporting `GET`. In this Vite SPA
 * environment, we export the handler logic so it can be wired to a
 * serverless function or edge handler, and also provide a client-side
 * helper that the UI calls directly.
 *
 * Security:
 *   - Queries are validated and constrained (max 200 chars).
 *   - Rate limiting is applied via the shared RateLimiter (per-IP, sliding window).
 *   - Only published posts are searchable — drafts are never exposed.
 *   - Article bodies are NOT shipped to the browser; only metadata
 *     and an optional highlight snippet are returned.
 */
import type { PostSummary } from "@/lib/content/types";
import { listPostsCached } from "@/lib/content/queries";
import { validateQuery } from "@/lib/search/types";
import type { SearchQueryOptions, SearchResponse } from "@/lib/search/types";
import { searchPosts, resetSearchIndex } from "@/lib/search/query";
import { reportError } from "@/lib/observability";
import { rateLimiters } from "@/lib/security";
/** Maximum results per page. */
const MAX_LIMIT = 50;
/** Default results per page. */
const DEFAULT_LIMIT = 20;
/** Sanitize and constrain search options. */
function sanitizeOptions(options: SearchQueryOptions | undefined): SearchQueryOptions {
  const limit = Math.min(Math.max(options?.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
  const offset = Math.max(options?.offset ?? 0, 0);
  return {
    limit,
    offset,
    category: options?.category?.slice(0, 100),
    tag: options?.tag?.slice(0, 100),
    author: options?.author?.slice(0, 100),
  };
}
/** API response shape (wraps SearchResponse with status). */
export interface SearchApiResponse {
  ok: boolean;
  status: number;
  message?: string;
  data?: SearchResponse;
}
/**
 * Server-side search handler.
 *
 * Call this from your serverless function / edge handler with the query
 * string and client IP. It validates the query, rate-limits, builds the
 * search index from published posts, and returns ranked results.
 *
 * @param query - Raw search query string.
 * @param ip - Client IP for rate limiting.
 * @param options - Search options (limit, offset, filters).
 */
export async function handleSearch(
  query: string,
  ip: string,
  options?: SearchQueryOptions,
): Promise<SearchApiResponse> {
  // --- Rate limiting ---
  const rateLimitResult = rateLimiters.search.check(ip);
  if (!rateLimitResult.allowed) {
    return {
      ok: false,
      status: 429,
      message: "Too many search requests. Please try again in a minute.",
    };
  }
  // --- Query validation ---
  const validation = validateQuery(query);
  if (!validation.valid) {
    return {
      ok: false,
      status: 400,
      message: validation.error,
      data: {
        results: [],
        total: 0,
        query: "",
        tookMs: 0,
      },
    };
  }
  // --- Fetch published posts ---
  let posts: PostSummary[];
  try {
    posts = await listPostsCached();
  } catch (err) {
    reportError(err, ip, { boundary: "search-content" });
    return {
      ok: false,
      status: 500,
      message: "Failed to load content index.",
    };
  }
  // --- Execute search ---
  try {
    const sanitized = sanitizeOptions(options);
    const response = await searchPosts(validation.query, posts, sanitized);
    return {
      ok: true,
      status: 200,
      data: response,
    };
  } catch (err) {
    reportError(err, ip, { boundary: "search-execute" });
    return {
      ok: false,
      status: 500,
      message: "Search failed.",
    };
  }
}
/**
 * Client-side search helper.
 *
 * Used by the search UI when running in the browser (Vite SPA mode).
 * Fetches published posts via the cached content layer and searches
 * locally. No article bodies are shipped — only metadata is indexed.
 */
export async function clientSearch(
  query: string,
  options?: SearchQueryOptions,
): Promise<SearchResponse> {
  const validation = validateQuery(query);
  if (!validation.valid) {
    return {
      results: [],
      total: 0,
      query: "",
      tookMs: 0,
    };
  }
  const posts = await listPostsCached();
  const sanitized = sanitizeOptions(options);
  return searchPosts(validation.query, posts, sanitized);
}
/** Reset the search index (used by revalidation when content changes). */
export function invalidateSearchIndex(): void {
  resetSearchIndex();
}
/** Convert a SearchApiResponse to a standard Response (for serverless). */
export function searchApiResponseToResponse(res: SearchApiResponse): Response {
  return new Response(JSON.stringify(res), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}