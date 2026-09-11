/**
 * Search abstraction types.
 *
 * Defines the contracts used by the search engine. The UI depends on
 * `SearchProvider` and `SearchResult`, not on any specific implementation.
 * A local in-memory adapter is provided by default; an external adapter
 * (Meilisearch, Typesense, Algolia, OpenSearch) can implement the same
 * interface without changing the UI.
 */
import type { PostSummary } from "@/lib/content/types";
/** A single search result item. */
export interface SearchResult {
  /** Post slug. */
  slug: string;
  /** Post title. */
  title: string;
  /** Post description / excerpt. */
  description: string;
  /** Publication date (ISO string). */
  date: string;
  /** Author slug. */
  author: string;
  /** Category slug. */
  category: string;
  /** Tag slugs. */
  tags: string[];
  /** Reading time in minutes. */
  readingTime: number;
  /** Hero image URL, if any. */
  image?: string;
  /** Hero image alt text, if any. */
  imageAlt?: string;
  /** Relevance score (higher = more relevant). */
  score: number;
  /** Highlighted snippet of matched text (optional). */
  highlight?: string;
}
/** Options for a search query. */
export interface SearchQueryOptions {
  /** Maximum number of results to return. Defaults to 20. */
  limit?: number;
  /** Offset for pagination. Defaults to 0. */
  offset?: number;
  /** Filter results to a specific category slug. */
  category?: string;
  /** Filter results to a specific tag slug. */
  tag?: string;
  /** Filter results to a specific author slug. */
  author?: string;
}
/** The result of a search query. */
export interface SearchResponse {
  /** Matching results, ranked by relevance. */
  results: SearchResult[];
  /** Total number of matching documents (before limit/offset). */
  total: number;
  /** The normalized query string. */
  query: string;
  /** Time taken to execute the search, in milliseconds. */
  tookMs: number;
}
/**
 * Search provider interface.
 *
 * Implementations build an index from content and answer queries.
 * The local adapter indexes in-memory from the ContentSource; an external
 * adapter would proxy to a remote search service.
 */
export interface SearchProvider {
  /** Human-readable name of the provider. */
  readonly name: string;
  /** (Re)build the search index from the given posts. */
  index(posts: PostSummary[]): void | Promise<void>;
  /** Add or update a single document in the index. */
  add(post: PostSummary): void | Promise<void>;
  /** Remove a document from the index by slug. */
  remove(slug: string): void | Promise<void>;
  /** Clear the entire index. */
  clear(): void | Promise<void>;
  /** Execute a search query. */
  search(query: string, options?: SearchQueryOptions): Promise<SearchResponse>;
  /** Whether the index has been built and is ready. */
  isReady(): boolean;
}
/** Normalize a raw search query string. */
export function normalizeQuery(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toLowerCase();
}
/** Validate and constrain a search query. Returns null if invalid. */
export function validateQuery(raw: string): {
  valid: boolean;
  query: string;
  error?: string;
} {
  const normalized = raw.trim();
  if (normalized.length === 0) {
    return { valid: false, query: "", error: "Query is empty" };
  }
  if (normalized.length > 200) {
    return {
      valid: false,
      query: normalized.slice(0, 200),
      error: "Query is too long (max 200 characters)",
    };
  }
  // Reject queries that are only special characters.
  if (!/[\p{L}\p{N}]/u.test(normalized)) {
    return {
      valid: false,
      query: normalized,
      error: "Query must contain at least one letter or number",
    };
  }
  return { valid: true, query: normalizeQuery(normalized) };
}