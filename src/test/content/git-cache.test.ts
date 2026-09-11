import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContentCache, cacheKeys } from "@/lib/content/git/cache";
describe("ContentCache (git/cache.ts — legacy TTL interface)", () => {
  it("stores and retrieves values by key", () => {
    const cache = new ContentCache();
    cache.set("posts", ["a", "b"]);
    expect(cache.get<string[]>("posts")).toEqual(["a", "b"]);
  });
  it("returns undefined for missing keys", () => {
    const cache = new ContentCache();
    expect(cache.get("missing")).toBeUndefined();
  });
  it("expires entries after the TTL", async () => {
    const cache = new ContentCache();
    cache.set("temp", "value", { ttlMs: 10 });
    expect(cache.get("temp")).toBe("value");
    await new Promise((r) => setTimeout(r, 20));
    expect(cache.get("temp")).toBeUndefined();
  });
  it("invalidates entries by tag", () => {
    const cache = new ContentCache();
    cache.set("post:a", "a", { tags: ["posts", "post:a"] });
    cache.set("post:b", "b", { tags: ["posts", "post:b"] });
    cache.set("authors", [], { tags: ["authors"] });
    cache.invalidateTag("posts");
    expect(cache.get("post:a")).toBeUndefined();
    expect(cache.get("post:b")).toBeUndefined();
    expect(cache.get("authors")).toEqual([]);
  });
  it("invalidates multiple tags", () => {
    const cache = new ContentCache();
    cache.set("post:a", "a", { tags: ["posts"] });
    cache.set("authors", [], { tags: ["authors"] });
    cache.invalidateTags(["posts", "authors"]);
    expect(cache.get("post:a")).toBeUndefined();
    expect(cache.get("authors")).toBeUndefined();
  });
  it("deletes a single key", () => {
    const cache = new ContentCache();
    cache.set("k", "v");
    cache.delete("k");
    expect(cache.get("k")).toBeUndefined();
  });
  it("clears the entire cache", () => {
    const cache = new ContentCache();
    cache.set("a", 1);
    cache.set("b", 2);
    cache.clear();
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBeUndefined();
  });
});
describe("cacheKeys", () => {
  it("builds expected key strings", () => {
    expect(cacheKeys.posts()).toBe("posts");
    expect(cacheKeys.post("hello")).toBe("post:hello");
    expect(cacheKeys.category("design")).toBe("category:design");
    expect(cacheKeys.tag("typescript")).toBe("tag:typescript");
    expect(cacheKeys.authors()).toBe("authors");
    expect(cacheKeys.author("site-team")).toBe("author:site-team");
  });
});