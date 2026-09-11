/**
 * Cache lifetime profiles.
 *
 * Named profiles map to TTL durations. They encode the stale-while-revalidate
 * strategy: content is served from cache immediately (stale) while a
 * background refresh fetches fresh data. Profiles let us tune cache duration
 * per content type without scattering magic numbers.
 *
 * Profiles:
 *   - `default`   — standard editorial content (5 min fresh, 1 hr stale)
 *   - `short`     — rapidly changing data like post index (1 min fresh, 10 min stale)
 *   - `long`      — stable data like authors/categories (1 hr fresh, 24 hr stale)
 *   - `homepage`  — homepage latest/featured (2 min fresh, 30 min stale)
 *   - `immutable` — never expires (used for validated schema constants)
 */
export type CacheProfileName = "default" | "short" | "long" | "homepage" | "immutable";
export interface CacheProfile {
  /** Time-to-live in ms — how long an entry is considered fresh. */
  freshMs: number;
  /**
   * Stale-while-revalidate window in ms. After `freshMs` expires, the entry
   * is still served from cache (stale) while a background refresh runs.
   * The entry is fully evicted after `freshMs + staleMs`.
   */
  staleMs: number;
}
/** One minute in milliseconds. */
const MINUTE = 60 * 1000;
/** One hour in milliseconds. */
const HOUR = 60 * MINUTE;
/** One day in milliseconds. */
const DAY = 24 * HOUR;
export const cacheProfiles: Record<CacheProfileName, CacheProfile> = {
  /** Standard editorial content: 5 min fresh, 1 hr stale. */
  default: { freshMs: 5 * MINUTE, staleMs: HOUR },
  /** Rapidly changing data: 1 min fresh, 10 min stale. */
  short: { freshMs: MINUTE, staleMs: 10 * MINUTE },
  /** Stable data (authors, categories): 1 hr fresh, 24 hr stale. */
  long: { freshMs: HOUR, staleMs: DAY },
  /** Homepage latest/featured: 2 min fresh, 30 min stale. */
  homepage: { freshMs: 2 * MINUTE, staleMs: 30 * MINUTE },
  /** Never expires. */
  immutable: { freshMs: Number.MAX_SAFE_INTEGER, staleMs: 0 },
};
/** Total lifetime (fresh + stale) for a profile. */
export function totalTtlMs(profile: CacheProfile): number {
  return profile.freshMs + profile.staleMs;
}
/** Get a profile by name. Falls back to `default`. */
export function getProfile(name: CacheProfileName): CacheProfile {
  return cacheProfiles[name] ?? cacheProfiles.default;
}