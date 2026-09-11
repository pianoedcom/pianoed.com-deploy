/**
 * Tagged in-memory cache for the content access layer.
 *
 * Prevents the adapter from fetching raw Git content on every user request.
 * Supports cache keys/tags as specified:
 *   posts, post:{slug}, category:{slug}, tag:{slug}, authors
 *
 * The cache is TTL-based with optional manual invalidation by tag. In a
 * serverless context each warm instance holds its own cache; for multi-instance
 * deployments an external cache (Redis, etc.) could replace this implementation
 * behind the same interface.
 */
interface CacheEntry<T> {
  value: T;
  /** Absolute expiry timestamp (ms). */
  expiresAt: number;
  /** Tags this entry belongs to, for bulk invalidation. */
  tags: string[];
}
/** Default TTL: 5 minutes. Content is not expected to change more often. */
const DEFAULT_TTL_MS = 5 * 60 * 1000;
export class ContentCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private tagIndex = new Map<string, Set<string>>();
  /**
   * Read a cached value by key. Returns `undefined` if absent or expired.
   * Expired entries are lazily evicted.
   */
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() >= entry.expiresAt) {
      this.evict(key);
      return undefined;
    }
    return entry.value as T;
  }
  /** Write a value to the cache with an optional TTL and tags. */
  set<T>(key: string, value: T, opts?: { ttlMs?: number; tags?: string[] }): void {
    const ttl = opts?.ttlMs ?? DEFAULT_TTL_MS;
    const tags = opts?.tags ?? [];
    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + ttl,
      tags,
    };
    this.store.set(key, entry);
    for (const tag of tags) {
      let keys = this.tagIndex.get(tag);
      if (!keys) {
        keys = new Set();
        this.tagIndex.set(tag, keys);
      }
      keys.add(key);
    }
  }
  /** Invalidate a single key. */
  delete(key: string): void {
    this.evict(key);
  }
  /** Invalidate all keys associated with a tag. */
  invalidateTag(tag: string): void {
    const keys = this.tagIndex.get(tag);
    if (!keys) return;
    for (const key of keys) {
      this.evict(key);
    }
    this.tagIndex.delete(tag);
  }
  /** Invalidate a list of tags. */
  invalidateTags(tags: string[]): void {
    for (const tag of tags) this.invalidateTag(tag);
  }
  /** Clear the entire cache. */
  clear(): void {
    this.store.clear();
    this.tagIndex.clear();
  }
  /** Evict a key and remove it from all tag indexes. */
  private evict(key: string): void {
    const entry = this.store.get(key);
    if (!entry) return;
    this.store.delete(key);
    for (const tag of entry.tags) {
      this.tagIndex.get(tag)?.delete(key);
    }
  }
}
// --- Cache key builders ----------------------------------------------------
/** Cache keys follow the design: posts, post:{slug}, category:{slug}, tag:{slug}, authors. */
export const cacheKeys = {
  posts: () => "posts",
  post: (slug: string) => `post:${slug}`,
  category: (slug: string) => `category:${slug}`,
  tag: (slug: string) => `tag:${slug}`,
  authors: () => "authors",
  author: (slug: string) => `author:${slug}`,
  categories: () => "categories",
  tags: () => "tags",
};