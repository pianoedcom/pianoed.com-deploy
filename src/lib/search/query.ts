/**
 * Search query layer.
 *
 * Bridges the content source and the search index. Builds the index
 * from published posts and provides a simple `searchPosts()` function
 * for the UI and API route.
 */
import type { PostSummary } from "@/lib/content/types";
import { localSearchIndex } from "./local-index";
import type { SearchQueryOptions, SearchResponse } from "./types";
/** Whether the index has been initialized. */
let initialized = false;
/** Pending initialization promise (prevents duplicate builds). */
let initPromise: Promise<void> | null = null;
/**
 * Build the search index from a list of post summaries.
 *
 * This is called once on first search. The index stores metadata only —
 * article bodies are NOT shipped to the browser. For server-side body
 * matching, pass body text via `indexWithBodies()`.
 */
export async function buildIndex(posts: PostSummary[]): Promise<void> {
  await localSearchIndex.index(posts);
  initialized = true;
}
/**
 * Build the index with body text included for richer matching.
 *
 * Used when post summaries include `bodyExcerpt` (populated by the content
 * source). The body excerpt is stored in the indexed post and used for
 * body/heading matching during search.
 */
export async function indexWithBodies(
  posts: Array<PostSummary & { bodyExcerpt?: string }>,
): Promise<void> {
  localSearchIndex.clear();
  for (const post of posts) {
    await localSearchIndex.addWithBody(post, post.bodyExcerpt ?? "");
  }
  initialized = true;
}
/**
 * Ensure the index is built from the content source.
 * Uses the provided post list to avoid circular dependencies.
 */
export async function ensureIndex(posts: PostSummary[]): Promise<void> {
  if (initialized && localSearchIndex.isReady()) return;
  if (initPromise) return initPromise;
  initPromise = buildIndex(posts);
  return initPromise;
}
/**
 * Search published posts.
 *
 * @param query - Raw search query string.
 * @param posts - Published post summaries to search within.
 * @param options - Search options (limit, offset, filters).
 */
export async function searchPosts(
  query: string,
  posts: PostSummary[],
  options?: SearchQueryOptions,
): Promise<SearchResponse> {
  await ensureIndex(posts);
  return localSearchIndex.search(query, options);
}
/** Reset the search index (used by tests and revalidation). */
export function resetSearchIndex(): void {
  localSearchIndex.clear();
  initialized = false;
  initPromise = null;
}
/** Check if the index is ready. */
export function isSearchReady(): boolean {
  return initialized && localSearchIndex.isReady();
}