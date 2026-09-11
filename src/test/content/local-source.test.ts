import { describe, it, expect } from "vitest";
import { localSource } from "@/lib/content/local-source";
import { KNOWN_CATEGORIES, KNOWN_TAGS } from "@/lib/content/constants";
describe("localSource", () => {
  it("lists only published posts by default", async () => {
    const posts = await localSource.listPosts();
    expect(posts.length).toBeGreaterThanOrEqual(3);
    expect(posts.every((p) => p.published)).toBe(true);
    expect(posts.every((p) => p.status === "published")).toBe(true);
  });
  it("returns posts sorted by date descending", async () => {
    const posts = await localSource.listPosts();
    for (let i = 1; i < posts.length; i++) {
      expect(new Date(posts[i - 1].date).getTime()).toBeGreaterThanOrEqual(
        new Date(posts[i].date).getTime(),
      );
    }
  });
  it("returns a full post by slug", async () => {
    const post = await localSource.getPostBySlug("typed-content-pipeline");
    expect(post).not.toBeNull();
    expect(post!.title).toContain("Typed Content Pipeline");
    expect(post!.body).toContain("# Building a Typed Content Pipeline");
    expect(post!.readingTime).toBeGreaterThanOrEqual(1);
  });
  it("returns null for unknown slug", async () => {
    const post = await localSource.getPostBySlug("does-not-exist");
    expect(post).toBeNull();
  });
  it("returns all categories with published posts", async () => {
    const categories = await localSource.getAllCategories();
    expect(categories.length).toBeGreaterThanOrEqual(3);
    const slugs = categories.map((c) => c.slug);
    expect(slugs).toContain("software-craft");
    expect(slugs).toContain("design");
    expect(slugs).toContain("web-platform");
    // All categories must be known.
    expect(categories.every((c) => KNOWN_CATEGORIES.includes(c.slug as never))).toBe(true);
  });
  it("returns tags with counts", async () => {
    const tags = await localSource.getAllTags();
    expect(tags.length).toBeGreaterThanOrEqual(1);
    expect(tags.every((t) => t.count > 0)).toBe(true);
    expect(tags.every((t) => KNOWN_TAGS.includes(t.slug as never))).toBe(true);
  });
  it("filters posts by category", async () => {
    const posts = await localSource.getPostsByCategory("design");
    expect(posts.length).toBeGreaterThanOrEqual(1);
    expect(posts.every((p) => p.category === "design")).toBe(true);
  });
  it("filters posts by tag", async () => {
    const posts = await localSource.getPostsByTag("typescript");
    expect(posts.length).toBeGreaterThanOrEqual(1);
    expect(posts.every((p) => p.tags.includes("typescript"))).toBe(true);
  });
  it("returns an author by slug", async () => {
    const author = await localSource.getAuthor("site-team");
    expect(author).not.toBeNull();
    expect(author!.name).toBe("Site Team");
  });
  it("returns featured posts when requested", async () => {
    const posts = await localSource.listPosts({ featuredOnly: true });
    expect(posts.every((p) => p.featured)).toBe(true);
    expect(posts.length).toBeGreaterThanOrEqual(1);
  });
  it("includes summaries without bodies", async () => {
    const posts = await localSource.listPosts();
    // PostSummary should not have a `body` property.
    expect(posts.every((p) => !("body" in p))).toBe(true);
  });
});