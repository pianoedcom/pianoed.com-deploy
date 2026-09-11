/**
 * Tests for the security layer: headers, rate limiting, input validation.
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  buildCsp,
  getSecurityHeaders,
  getDevSecurityHeaders,
  RateLimiter,
  rateLimiters,
  validateSlug,
  validatePageNumber,
  validateYear,
  validateMonth,
  sanitizeString,
  isHeaderSafe,
  validateContentType,
  constrainLength,
} from "@/lib/security";
// --- Content Security Policy ---
describe("buildCsp", () => {
  it("produces restrictive CSP in production", () => {
    const csp = buildCsp(true);
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toContain("blob:"); // MDX pre-compiled at build time
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("upgrade-insecure-requests");
  });
  it("allows blob: and inline in development for Vite HMR", () => {
    const csp = buildCsp(false);
    expect(csp).toContain("blob:");
    expect(csp).toContain("unsafe-inline");
    expect(csp).toContain("ws:");
  });
  it("does not include unsafe-eval in production", () => {
    const csp = buildCsp(true);
    expect(csp).not.toMatch(/unsafe-eval/);
  });
});
describe("getSecurityHeaders", () => {
  it("returns all required security headers", () => {
    const headers = getSecurityHeaders();
    expect(headers["Content-Security-Policy"]).toBeTruthy();
    expect(headers["Strict-Transport-Security"]).toContain("max-age=63072000");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Permissions-Policy"]).toContain("camera=()");
  });
  it("dev headers are looser than production", () => {
    const devHeaders = getDevSecurityHeaders();
    expect(devHeaders["Content-Security-Policy"]).toContain("blob:");
  });
});
// --- Rate Limiting ---
describe("RateLimiter", () => {
  let limiter: RateLimiter;
  beforeEach(() => {
    limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });
  });
  it("allows requests up to the limit", () => {
    expect(limiter.check("ip1").allowed).toBe(true);
    expect(limiter.check("ip1").allowed).toBe(true);
    expect(limiter.check("ip1").allowed).toBe(true);
  });
  it("blocks requests exceeding the limit", () => {
    limiter.check("ip1");
    limiter.check("ip1");
    limiter.check("ip1");
    const result = limiter.check("ip1");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });
  it("tracks different IPs independently", () => {
    limiter.check("ip1");
    limiter.check("ip1");
    limiter.check("ip1");
    const result = limiter.check("ip2");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });
  it("reports retryAfterMs when rate limited", () => {
    limiter.check("ip1");
    limiter.check("ip1");
    limiter.check("ip1");
    const result = limiter.check("ip1");
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
    expect(result.retryAfterMs).toBeLessThanOrEqual(1000);
  });
  it("peek does not record a request", () => {
    limiter.check("ip1");
    const peek1 = limiter.peek("ip1");
    expect(peek1.count).toBe(1);
    const peek2 = limiter.peek("ip1");
    expect(peek2.count).toBe(1);
  });
  it("reset clears a specific key", () => {
    limiter.check("ip1");
    limiter.check("ip1");
    limiter.check("ip1");
    limiter.reset("ip1");
    expect(limiter.check("ip1").allowed).toBe(true);
  });
  it("clear removes all entries", () => {
    limiter.check("ip1");
    limiter.check("ip2");
    limiter.clear();
    expect(limiter.size).toBe(0);
  });
});
describe("rateLimiters", () => {
  it("has pre-configured search and webhook limiters", () => {
    expect(rateLimiters.search).toBeInstanceOf(RateLimiter);
    expect(rateLimiters.webhook).toBeInstanceOf(RateLimiter);
  });
});
// --- Input Validation ---
describe("validateSlug", () => {
  it("accepts valid slugs", () => {
    expect(validateSlug("hello-world").valid).toBe(true);
    expect(validateSlug("my-post-2024").valid).toBe(true);
    expect(validateSlug("a").valid).toBe(true);
  });
  it("rejects empty slugs", () => {
    expect(validateSlug("").valid).toBe(false);
  });
  it("rejects uppercase slugs", () => {
    expect(validateSlug("Hello-World").valid).toBe(false);
  });
  it("rejects slugs with special characters", () => {
    expect(validateSlug("hello_world").valid).toBe(false);
    expect(validateSlug("hello.world").valid).toBe(false);
    expect(validateSlug("hello world").valid).toBe(false);
  });
  it("rejects slugs starting or ending with hyphen", () => {
    expect(validateSlug("-hello").valid).toBe(false);
    expect(validateSlug("hello-").valid).toBe(false);
  });
  it("rejects slugs exceeding max length", () => {
    const long = "a".repeat(201);
    expect(validateSlug(long).valid).toBe(false);
  });
});
describe("validatePageNumber", () => {
  it("accepts positive integers", () => {
    expect(validatePageNumber("1").valid).toBe(true);
    expect(validatePageNumber("5").value).toBe(5);
    expect(validatePageNumber(10).valid).toBe(true);
  });
  it("rejects zero and negative numbers", () => {
    expect(validatePageNumber("0").valid).toBe(false);
    expect(validatePageNumber("-1").valid).toBe(false);
  });
  it("rejects non-numeric values", () => {
    expect(validatePageNumber("abc").valid).toBe(false);
    expect(validatePageNumber(null).valid).toBe(false);
  });
  it("rejects extremely large page numbers", () => {
    expect(validatePageNumber("99999").valid).toBe(false);
  });
});
describe("validateYear", () => {
  it("accepts valid years", () => {
    expect(validateYear("2024").valid).toBe(true);
    expect(validateYear(2020).valid).toBe(true);
  });
  it("rejects years outside the range", () => {
    expect(validateYear("1989").valid).toBe(false);
    expect(validateYear("3000").valid).toBe(false);
  });
  it("rejects non-numeric values", () => {
    expect(validateYear("abc").valid).toBe(false);
  });
});
describe("validateMonth", () => {
  it("accepts months 1-12", () => {
    for (let i = 1; i <= 12; i++) {
      expect(validateMonth(i).valid).toBe(true);
    }
  });
  it("rejects months outside 1-12", () => {
    expect(validateMonth(0).valid).toBe(false);
    expect(validateMonth(13).valid).toBe(false);
  });
});
describe("sanitizeString", () => {
  it("removes control characters", () => {
    expect(sanitizeString("hello\x00world")).toBe("helloworld");
    expect(sanitizeString("hello\x07world")).toBe("helloworld");
  });
  it("preserves common whitespace", () => {
    expect(sanitizeString("hello\tworld\n")).toBe("hello\tworld\n");
  });
  it("limits length", () => {
    const long = "a".repeat(100);
    expect(sanitizeString(long, 10).length).toBe(10);
  });
});
describe("isHeaderSafe", () => {
  it("accepts strings without CRLF", () => {
    expect(isHeaderSafe("hello world")).toBe(true);
    expect(isHeaderSafe("application/json")).toBe(true);
  });
  it("rejects strings with CRLF", () => {
    expect(isHeaderSafe("hello\r\nworld")).toBe(false);
    expect(isHeaderSafe("hello\n")).toBe(false);
    expect(isHeaderSafe("hello\r")).toBe(false);
  });
});
describe("validateContentType", () => {
  it("accepts matching content types", () => {
    expect(validateContentType("application/json", "application/json")).toBe(true);
    expect(validateContentType("application/json; charset=utf-8", "application/json")).toBe(true);
  });
  it("rejects non-matching content types", () => {
    expect(validateContentType("text/html", "application/json")).toBe(false);
    expect(validateContentType(null, "application/json")).toBe(false);
  });
  it("is case-insensitive", () => {
    expect(validateContentType("Application/JSON", "application/json")).toBe(true);
  });
});
describe("constrainLength", () => {
  it("returns short strings unchanged", () => {
    expect(constrainLength("hello", 10)).toBe("hello");
  });
  it("truncates long strings with ellipsis", () => {
    const result = constrainLength("hello world this is long", 10);
    expect(result.length).toBe(10);
    expect(result).toContain("…");
  });
});