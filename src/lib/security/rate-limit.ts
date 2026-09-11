/**
 * Rate limiting utility.
 *
 * A simple in-memory sliding-window rate limiter. Suitable for single-
 * instance deployments. For multi-instance deployments, replace with
 * a Redis-backed implementation behind the same interface.
 *
 * Used by:
 *   - Search API route (per-IP query rate limiting)
 *   - Webhook route (per-IP delivery rate limiting)
 *
 * Security: rate limiting protects against brute-force search abuse
 * and webhook replay attacks. Limits are configurable per endpoint.
 */
/** Rate limiter entry for a single key (IP address). */
interface RateLimitEntry {
  /** Timestamps of requests within the current window. */
  timestamps: number[];
}
/** Configuration for a rate limiter instance. */
export interface RateLimitConfig {
  /** Maximum number of requests allowed within the window. */
  maxRequests: number;
  /** Time window in milliseconds. */
  windowMs: number;
  /** Optional: cleanup threshold. Entries older than this are pruned. */
  cleanupThreshold?: number;
}
/** Result of a rate limit check. */
export interface RateLimitResult {
  /** Whether the request is allowed. */
  allowed: boolean;
  /** Number of requests made in the current window. */
  count: number;
  /** Remaining requests in the window. */
  remaining: number;
  /** Milliseconds until the window resets (for Retry-After header). */
  retryAfterMs: number;
}
/**
 * Sliding-window rate limiter.
 *
 * Uses a sliding window (not fixed window) for smoother rate limiting.
 * Each key (typically an IP address) has its own window.
 */
export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private config: Required<RateLimitConfig>;
  constructor(config: RateLimitConfig) {
    this.config = {
      maxRequests: config.maxRequests,
      windowMs: config.windowMs,
      cleanupThreshold: config.cleanupThreshold ?? 10_000,
    };
  }
  /**
   * Check if a request is allowed and record it.
   *
   * @param key - Identifier (typically IP address).
   * @returns Rate limit result with `allowed` flag and metadata.
   */
  check(key: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const entry = this.store.get(key);
    if (!entry) {
      // First request from this key.
      this.store.set(key, { timestamps: [now] });
      return {
        allowed: true,
        count: 1,
        remaining: this.config.maxRequests - 1,
        retryAfterMs: 0,
      };
    }
    // Prune timestamps outside the window.
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);
    if (entry.timestamps.length >= this.config.maxRequests) {
      // Rate limited — calculate when the oldest request will expire.
      const oldestInWindow = entry.timestamps[0] ?? now;
      const retryAfterMs = Math.max(0, oldestInWindow + this.config.windowMs - now);
      return {
        allowed: false,
        count: entry.timestamps.length,
        remaining: 0,
        retryAfterMs,
      };
    }
    // Allowed — record the request.
    entry.timestamps.push(now);
    return {
      allowed: true,
      count: entry.timestamps.length,
      remaining: this.config.maxRequests - entry.timestamps.length,
      retryAfterMs: 0,
    };
  }
  /**
   * Peek at the current rate limit state without recording a request.
   */
  peek(key: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const entry = this.store.get(key);
    const count = entry ? entry.timestamps.filter((ts) => ts > windowStart).length : 0;
    if (count >= this.config.maxRequests) {
      const oldestInWindow = entry?.timestamps[0] ?? now;
      return {
        allowed: false,
        count,
        remaining: 0,
        retryAfterMs: Math.max(0, oldestInWindow + this.config.windowMs - now),
      };
    }
    return {
      allowed: true,
      count,
      remaining: this.config.maxRequests - count,
      retryAfterMs: 0,
    };
  }
  /** Reset the rate limit for a specific key. */
  reset(key: string): void {
    this.store.delete(key);
  }
  /** Clear all rate limit entries. */
  clear(): void {
    this.store.clear();
  }
  /** Get the number of tracked keys (for monitoring). */
  get size(): number {
    return this.store.size;
  }
  /**
   * Periodic cleanup of expired entries.
   *
   * Call this on a timer or interval to prevent memory growth from
   * abandoned keys. Removes entries with no recent requests.
   */
  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    for (const [key, entry] of this.store) {
      const recent = entry.timestamps.filter((ts) => ts > windowStart);
      if (recent.length === 0) {
        this.store.delete(key);
      } else {
        entry.timestamps = recent;
      }
    }
  }
}
/**
 * Pre-configured rate limiters for the application's endpoints.
 */
export const rateLimiters = {
  /** Search API: 30 requests per minute per IP. */
  search: new RateLimiter({
    maxRequests: 30,
    windowMs: 60_000,
  }),
  /** Webhook endpoint: 10 requests per minute per IP. */
  webhook: new RateLimiter({
    maxRequests: 10,
    windowMs: 60_000,
  }),
  /** Newsletter API: 5 requests per minute per IP. */
  newsletter: new RateLimiter({
    maxRequests: 5,
    windowMs: 60_000,
  }),
};
/**
 * Extract the client IP from request headers.
 *
 * Checks common proxy headers (X-Forwarded-For, X-Real-IP) before
 * falling back to a default. In production behind a CDN/proxy, the
 * X-Forwarded-For header should be set by the platform.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    // X-Forwarded-For can be a comma-separated list; the first is the client.
    return forwarded.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}