import { describe, it, expect, beforeEach } from "vitest";
import {
  checkRedirect,
  checkSlugRedirect,
  resolveRedirect,
  recordRuntimeRedirect,
  getRuntimeRedirects,
  clearRuntimeRedirects,
  getAllRedirects,
  getRedirectSources,
  reloadRedirects,
  normalizeRedirectPath,
  articlePath,
  REDIRECT_STATUS_PERMANENT,
  REDIRECT_STATUS_MOVED,
} from "@/lib/content/redirects";
describe("redirects", () => {
  beforeEach(() => {
    clearRuntimeRedirects();
    reloadRedirects();
  });
  // --- Path normalization ---------------------------------------------------
  describe("normalizeRedirectPath", () => {
    it("ensures leading slash", () => {
      expect(normalizeRedirectPath("blog/foo")).toBe("/blog/foo");
    });
    it("strips trailing slash", () => {
      expect(normalizeRedirectPath("/blog/foo/")).toBe("/blog/foo");
    });
    it("lowercases the path", () => {
      expect(normalizeRedirectPath("/Blog/Foo")).toBe("/blog/foo");
    });
    it("preserves root", () => {
      expect(normalizeRedirectPath("/")).toBe("/");
    });
  });
  describe("articlePath", () => {
    it("builds the blog path for a slug", () => {
      expect(articlePath("my-article")).toBe("/blog/my-article");
    });
  });
  // --- Static redirects ----------------------------------------------------
  describe("static redirects", () => {
    it("loads static redirects from content/redirects.ts", () => {
      const all = getAllRedirects();
      expect(all.length).toBeGreaterThanOrEqual(3);
    });
    it("finds the hello-world → typed-content-pipeline redirect", () => {
      const result = checkRedirect("/blog/hello-world");
      expect(result.hasRedirect).toBe(true);
      expect(result.destination).toBe("/blog/typed-content-pipeline");
      expect(result.statusCode).toBe(REDIRECT_STATUS_PERMANENT);
    });
    it("finds the old-react-patterns → streaming-react-server-components redirect", () => {
      const result = checkRedirect("/blog/old-react-patterns");
      expect(result.hasRedirect).toBe(true);
      expect(result.destination).toBe("/blog/streaming-react-server-components");
    });
    it("finds the color-systems-guide → accessible-color-systems redirect", () => {
      const result = checkRedirect("/blog/color-systems-guide");
      expect(result.hasRedirect).toBe(true);
      expect(result.destination).toBe("/blog/accessible-color-systems");
    });
  });
  // --- checkSlugRedirect ---------------------------------------------------
  describe("checkSlugRedirect", () => {
    it("returns the destination slug for a redirected slug", () => {
      expect(checkSlugRedirect("hello-world")).toBe("typed-content-pipeline");
    });
    it("returns null for a slug with no redirect", () => {
      expect(checkSlugRedirect("typed-content-pipeline")).toBeNull();
    });
    it("returns null for an invalid slug", () => {
      expect(checkSlugRedirect("")).toBeNull();
      expect(checkSlugRedirect("UPPER CASE")).toBeNull();
    });
  });
  // --- Runtime redirects ---------------------------------------------------
  describe("runtime redirects", () => {
    it("records a runtime redirect", () => {
      recordRuntimeRedirect("old-slug", "new-slug");
      const result = checkRedirect("/blog/old-slug");
      expect(result.hasRedirect).toBe(true);
      expect(result.destination).toBe("/blog/new-slug");
    });
    it("runtime redirects take precedence over static", () => {
      // Static has hello-world → typed-content-pipeline
      recordRuntimeRedirect("hello-world", "different-target");
      const result = checkRedirect("/blog/hello-world");
      expect(result.destination).toBe("/blog/different-target");
    });
    it("getRuntimeRedirects returns all runtime entries", () => {
      recordRuntimeRedirect("a", "b");
      recordRuntimeRedirect("c", "d");
      const runtime = getRuntimeRedirects();
      expect(runtime).toHaveLength(2);
    });
    it("clearRuntimeRedirects removes all runtime entries", () => {
      recordRuntimeRedirect("a", "b");
      clearRuntimeRedirects();
      expect(getRuntimeRedirects()).toHaveLength(0);
    });
  });
  // --- Chain resolution ----------------------------------------------------
  describe("resolveRedirect (chain resolution)", () => {
    it("resolves a single-hop redirect", () => {
      recordRuntimeRedirect("a", "b");
      expect(resolveRedirect("/blog/a")).toBe("/blog/b");
    });
    it("resolves a multi-hop chain to the final destination", () => {
      recordRuntimeRedirect("a", "b");
      recordRuntimeRedirect("b", "c");
      recordRuntimeRedirect("c", "d");
      expect(resolveRedirect("/blog/a")).toBe("/blog/d");
    });
    it("returns null when no redirect exists", () => {
      expect(resolveRedirect("/blog/nonexistent")).toBeNull();
    });
    it("handles circular redirects without infinite loop", () => {
      recordRuntimeRedirect("loop-a", "loop-b");
      recordRuntimeRedirect("loop-b", "loop-a");
      const result = resolveRedirect("/blog/loop-a");
      // Should return one of the two, not hang.
      expect(["/blog/loop-a", "/blog/loop-b"]).toContain(result);
    });
  });
  // --- getRedirectSources (sitemap exclusion) ------------------------------
  describe("getRedirectSources", () => {
    it("returns all source paths", () => {
      const sources = getRedirectSources();
      expect(sources).toContain("/blog/hello-world");
      expect(sources).toContain("/blog/old-react-patterns");
      expect(sources).toContain("/blog/color-systems-guide");
    });
  });
  // --- Status codes --------------------------------------------------------
  describe("status codes", () => {
    it("uses 308 for rename redirects", () => {
      recordRuntimeRedirect("a", "b", "rename");
      const result = checkRedirect("/blog/a");
      expect(result.statusCode).toBe(REDIRECT_STATUS_PERMANENT);
    });
    it("uses 301 for deleted redirects", () => {
      recordRuntimeRedirect("a", "b", "deleted");
      const result = checkRedirect("/blog/a");
      expect(result.statusCode).toBe(REDIRECT_STATUS_MOVED);
    });
    it("uses 308 for legacy redirects", () => {
      const result = checkRedirect("/blog/hello-world");
      expect(result.statusCode).toBe(REDIRECT_STATUS_PERMANENT);
    });
  });
  // --- No redirect for valid articles --------------------------------------
  describe("non-redirected paths", () => {
    it("returns no redirect for a path without a redirect entry", () => {
      const result = checkRedirect("/blog/typed-content-pipeline");
      expect(result.hasRedirect).toBe(false);
      expect(result.destination).toBeNull();
    });
    it("returns no redirect for non-article paths", () => {
      const result = checkRedirect("/category/engineering");
      expect(result.hasRedirect).toBe(false);
    });
  });
});