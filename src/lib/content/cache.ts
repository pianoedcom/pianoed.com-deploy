/**
 * Content cache with stale-while-revalidate semantics.
 *
 * This is the central cache for the content access layer. It supports:
 *   - TTL-based freshness (entries are "fresh" for `freshMs`)
 *   - Stale-while-revalidate (expired entries are served stale while a
 *     background refresh runs, then evicted after `staleMs`)
 *   - Tag-based invalidation (revalidateTag semantics)
 *
 * In a Next.js deployment this maps to `unstable_cache` / `cacheTag` /
 * `cacheLife`. In this Vite SPA environment, the cache is in-memory and
 * per-instance. The interface mirrors the Next.js model so the same
 * query/revalidation code works in both environments.
 */
import type { CacheProfile, CacheProfileName } from "@/lib/cache/profiles";
export type { CacheProfile, CacheProfileName };
import { getProfile, totalTtlMs } from "@/lib/cache/profiles";
interface CacheEntry<T> {
  value: T;
  /** Absolute timestamp when the entry stops being fresh (ms epoch). */
  freshUntil: number;
  /** Absolute timestamp when the entry is fully evicted (ms epoch). */
  expiresAt: number;
  /** Tags this entry belongs to, for bulk invalidation. */
  tags: string[];
  /** Whether a background revalidation is in progress. */
  revalidating: boolean;
}
/** Result of a cache read. */
export interface CacheResult<T> {
  /** The cached value, if present (may be stale). */
  value: T | undefined;
  /** Whether the value is fresh (within TTL). */
  isStale: boolean;
  /** Whether any value was found (fresh or stale). */
  hasValue: boolean;
}
/**
 * Tagged cache with stale-while-revalidate support.
 *
 * When `get()` finds a stale-but-valid entry, it returns the value with
 * `isStale: true` so the caller can trigger a background refresh. The entry
 * remains available until `expiresAt` (freshMs + staleMs).
 */
export class ContentCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private tagIndex = new Map<string, Set<string>>();
  /**
   * Read a cached value by key.
   *
   * Returns `{ value, isStale, hasValue }`. If the entry is past its total
   * lifetime it is evicted and treated as missing.
   */
  get<T>(key: string): CacheResult<T> {
    const entry = this.store.get(key);
    if (!entry) {
      return { value: undefined, isStale: false, hasValue: false };
    }
    const now = Date.now();
    if (now >= entry.expiresAt) {
      this.evict(key);
      return { value: undefined, isStale: false, hasValue: false };
    }
    return {
      value: entry.value as T,
      isStale: now >= entry.freshUntil,
      hasValue: true,
    };
  }
  /**
   * Write a value to the cache with a named profile and tags.
   *
   * The entry is fresh for `profile.freshMs`, then stale for `profile.staleMs`,
   * then evicted.
   */
  set<T>(key: string, value: T, opts?: { profile?: CacheProfileName; tags?: string[] }): void {
    const profile = opts?.profile ? getProfile(opts.profile) : getProfile("default");
    this.setWithProfile(key, value, profile, opts?.tags);
  }
  /** Write a value using an explicit CacheProfile object. */
  setWithProfile<T>(key: string, value: T, profile: CacheProfile, tags?: string[]): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      value,
      freshUntil: now + profile.freshMs,
      expiresAt: now + totalTtlMs(profile),
      tags: tags ?? [],
      revalidating: false,
    };
    // Remove old tag associations before overwriting.
    this.evict(key);
    this.store.set(key, entry);
    for (const tag of entry.tags) {
      let keys = this.tagIndex.get(tag);
      if (!keys) {
        keys = new Set();
        this.tagIndex.set(tag, keys);
      }
      keys.add(key);
    }
  }
  /** Mark a key as currently revalidating (prevents duplicate background fetches). */
  markRevalidating(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (entry.revalidating) return false;
    entry.revalidating = true;
    return true;
  }
  /** Clear the revalidating flag. */
  clearRevalidating(key: string): void {
    const entry = this.store.get(key);
    if (entry) entry.revalidating = false;
  }
  /** Invalidate a single key. */
  delete(key: string): void {
    this.evict(key);
  }
  /**
   * Invalidate all keys associated with a tag.
   *
   * This mirrors `revalidateTag(tag)` from Next.js: all cached entries tagged
   * with `tag` are evicted, so the next read fetches fresh data.
   */
  invalidateTag(tag: string): void {
    const keys = this.tagIndex.get(tag);
    if (!keys) return;
    // Copy to avoid mutating during iteration.
    for (const key of Array.from(keys)) {
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
  /** Get all keys currently in the cache (for debugging/testing). */
  keys(): string[] {
    return Array.from(this.store.keys());
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
// --- Singleton instance -----------------------------------------------------
/**
 * Shared content cache instance.
 *
 * The query layer (`queries.ts`) and revalidation helpers (`revalidate.ts`)
 * both use this singleton. In production with multiple instances, this would
 * be backed by Redis or a similar shared store behind the same interface.
 */
export const contentCache = new ContentCache();