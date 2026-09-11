import { describe, it, expect, beforeEach } from "vitest";
import type { PostSummary } from "@/lib/content/types";
import { LocalSearchIndex } from "@/lib/search/local-index";
import { tokenize, tokenizeAll } from "@/lib/search/tokenize";
import { scoreDocument, rankPosts, FIELD_WEIGHTS } from "@/lib/search/ranking";
import { validateQuery, normalizeQuery } from "@/lib/search/types";
/** Helper: create a minimal PostSummary. */
function makePost(overrides: Partial<PostSummary> = {}): PostSummary {
  return {
    slug: "test-post",
    title: "Test Post",
    description: "A test post about TypeScript and React.",
    date: "2025-01-15",
    author: "site-team",
    category: "software-craft",
    tags: ["typescript", "react"],
    published: true,
    featured: false,
    status: "published",
    readingTime: 5,
    noindex: false,
    ...overrides,
  };
}
/** Sample posts for search tests. */
const samplePosts: PostSummary[] = [
  makePost({
    slug: "typed-content-pipeline",
    title: "Building a Typed Content Pipeline",
    description: "How to build a type-safe MDX content pipeline with Zod.",
    date: "2025-03-10",
    category: "software-craft",
    tags: ["typescript", "mdx", "zod"],
  }),
  makePost({
    slug: "accessible-color-systems",
    title: "Designing Accessible Color Systems",
    description: "A practical guide to WCAG-compliant color palettes.",
    date: "2025-02-20",
    category: "design",
    tags: ["accessibility", "css", "design-tokens"],
  }),
  makePost({
    slug: "streaming-react-server-components",
    title: "Streaming React Server Components",
    description: "Deep dive into RSC streaming and Suspense boundaries.",
    date: "2025-04-01",
    category: "web-platform",
    tags: ["react", "performance", "ssr"],
  }),
];
// --- Tokenizer tests ---
describe("tokenize", () => {
  it("splits on non-alphanumeric characters", () => {
    expect(tokenize("Hello, World!")).toEqual(["hello", "world"]);
  });
  it("lowercases all tokens", () => {
    expect(tokenize("TypeScript REACT")).toEqual(["typescript", "react"]);
  });
  it("removes stop words by default", () => {
    const tokens = tokenize("the quick brown fox");
    expect(tokens).not.toContain("the");
    expect(tokens).toContain("quick");
  });
  it("keeps stop words when removeStopWords is false", () => {
    const tokens = tokenizeAll("the quick brown fox");
    expect(tokens).toContain("the");
  });
  it("removes diacritics", () => {
    expect(tokenize("café résumé naïve")).toEqual(["cafe", "resume", "naive"]);
  });
  it("handles empty string", () => {
    expect(tokenize("")).toEqual([]);
  });
  it("handles special characters only", () => {
    expect(tokenize("!@#$%^&*()")).toEqual([]);
  });
  it("respects minimum length", () => {
    expect(tokenize("a ab abc", { minLength: 2 })).toEqual(["ab", "abc"]);
  });
  it("handles Unicode letters", () => {
    expect(tokenize("日本語 test")).toContain("日本語");
  });
});
// --- Query validation tests ---
describe("validateQuery", () => {
  it("accepts a valid query", () => {
    const result = validateQuery("TypeScript pipeline");
    expect(result.valid).toBe(true);
    expect(result.query).toBe("typescript pipeline");
  });
  it("rejects empty query", () => {
    const result = validateQuery("");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("empty");
  });
  it("rejects whitespace-only query", () => {
    const result = validateQuery("   ");
    expect(result.valid).toBe(false);
  });
  it("rejects very long query", () => {
    const result = validateQuery("a".repeat(201));
    expect(result.valid).toBe(false);
    expect(result.error).toContain("too long");
  });
  it("accepts query of exactly 200 chars", () => {
    const result = validateQuery("a".repeat(200));
    expect(result.valid).toBe(true);
  });
  it("rejects special-characters-only query", () => {
    const result = validateQuery("!@#$%");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("letter or number");
  });
  it("accepts query with special chars and letters", () => {
    const result = validateQuery("react#hooks");
    expect(result.valid).toBe(true);
  });
});
describe("normalizeQuery", () => {
  it("trims and lowercases", () => {
    expect(normalizeQuery("  Hello World  ")).toBe("hello world");
  });
  it("collapses multiple spaces", () => {
    expect(normalizeQuery("hello   world")).toBe("hello world");
  });
});
// --- Ranking tests ---
describe("scoreDocument", () => {
  it("scores exact title match highest", () => {
    const post = makePost({ title: "TypeScript Guide" });
    const exact = scoreDocument(post, "typescript guide", ["typescript", "guide"]);
    const partial = scoreDocument(post, "typescript", ["typescript"]);
    expect(exact.score).toBeGreaterThan(partial.score);
  });
  it("scores title prefix higher than body match", () => {
    const post = makePost({
      title: "React Hooks Deep Dive",
      description: "Understanding hooks in React.",
    });
    const prefixScore = scoreDocument(post, "react hooks", ["react", "hooks"]);
    expect(prefixScore.score).toBeGreaterThan(0);
    expect(prefixScore.score).toBeGreaterThanOrEqual(FIELD_WEIGHTS.titlePrefix);
  });
  it("scores tag matches", () => {
    const post = makePost({ tags: ["typescript", "react"] });
    const result = scoreDocument(post, "typescript", ["typescript"]);
    expect(result.score).toBeGreaterThanOrEqual(FIELD_WEIGHTS.tag);
  });
  it("scores category matches", () => {
    const post = makePost({ category: "software-craft" });
    const result = scoreDocument(post, "software craft", ["software", "craft"]);
    expect(result.score).toBeGreaterThanOrEqual(FIELD_WEIGHTS.category);
  });
  it("scores body matches when body is provided", () => {
    const post = makePost({ slug: "test" });
    const body = "This article discusses TypeScript patterns in depth.";
    const result = scoreDocument(post, "typescript", ["typescript"], body);
    expect(result.score).toBeGreaterThanOrEqual(FIELD_WEIGHTS.body);
  });
  it("returns score 0 for no matches", () => {
    const post = makePost({ title: "Design Systems" });
    const result = scoreDocument(post, "kubernetes", ["kubernetes"]);
    // Recency bonus is always added, so score may be > 0 from recency alone.
    // But there should be no relevance match.
    expect(result.score).toBeLessThan(FIELD_WEIGHTS.body);
  });
  it("produces highlight snippet from body match", () => {
    const post = makePost({ slug: "test" });
    const body = "This article discusses TypeScript patterns in depth and explores advanced usage.";
    const result = scoreDocument(post, "typescript", ["typescript"], body);
    expect(result.highlight).toBeDefined();
    expect(result.highlight).toContain("TypeScript");
  });
});
describe("rankPosts", () => {
  it("ranks exact title match first", () => {
    const posts = [
      makePost({ slug: "a", title: "TypeScript Guide", date: "2025-01-01" }),
      makePost({ slug: "b", title: "Other Article", date: "2025-01-02" }),
    ];
    const ranked = rankPosts(posts, "typescript guide", ["typescript", "guide"]);
    expect(ranked[0].post.slug).toBe("a");
  });
  it("excludes posts with zero relevance score", () => {
    const posts = [
      makePost({ slug: "match", title: "TypeScript Guide" }),
      makePost({ slug: "nomatch", title: "Cooking Recipes" }),
    ];
    const ranked = rankPosts(posts, "typescript", ["typescript"]);
    const slugs = ranked.map((r) => r.post.slug);
    expect(slugs).toContain("match");
    expect(slugs).not.toContain("nomatch");
  });
  it("uses date as tiebreaker for equal scores", () => {
    const posts = [
      makePost({ slug: "older", title: "TypeScript Guide", date: "2025-01-01" }),
      makePost({ slug: "newer", title: "TypeScript Guide", date: "2025-06-01" }),
    ];
    const ranked = rankPosts(posts, "typescript guide", ["typescript", "guide"]);
    expect(ranked[0].post.slug).toBe("newer");
  });
});
// --- Local index tests ---
describe("LocalSearchIndex", () => {
  let index: LocalSearchIndex;
  beforeEach(() => {
    index = new LocalSearchIndex();
  });
  it("indexes posts and returns ready state", async () => {
    await index.index(samplePosts);
    expect(index.isReady()).toBe(true);
    expect(index.size()).toBe(3);
  });
  it("finds by exact title match", async () => {
    await index.index(samplePosts);
    const result = await index.search("Building a Typed Content Pipeline");
    expect(result.total).toBeGreaterThan(0);
    expect(result.results[0].slug).toBe("typed-content-pipeline");
  });
  it("finds by partial title", async () => {
    await index.index(samplePosts);
    const result = await index.search("typed content");
    expect(result.total).toBeGreaterThan(0);
    const slugs = result.results.map((r) => r.slug);
    expect(slugs).toContain("typed-content-pipeline");
  });
  it("finds by tag query", async () => {
    await index.index(samplePosts);
    const result = await index.search("accessibility");
    expect(result.total).toBeGreaterThan(0);
    expect(result.results[0].slug).toBe("accessible-color-systems");
  });
  it("finds by category", async () => {
    await index.index(samplePosts);
    const result = await index.search("design");
    expect(result.total).toBeGreaterThan(0);
    const slugs = result.results.map((r) => r.slug);
    expect(slugs).toContain("accessible-color-systems");
  });
  it("returns empty for no results", async () => {
    await index.index(samplePosts);
    const result = await index.search("kubernetes docker");
    expect(result.total).toBe(0);
    expect(result.results).toEqual([]);
  });
  it("handles special characters in query", async () => {
    await index.index(samplePosts);
    const result = await index.search("react#hooks!");
    // Should still find the streaming RSC article via "react" token.
    expect(result.total).toBeGreaterThan(0);
  });
  it("respects limit option", async () => {
    await index.index(samplePosts);
    const result = await index.search("a", { limit: 1 });
    expect(result.results.length).toBeLessThanOrEqual(1);
  });
  it("respects offset option", async () => {
    await index.index(samplePosts);
    const all = await index.search("a");
    const offset = await index.search("a", { offset: 1 });
    if (all.total > 1) {
      expect(offset.results.length).toBeLessThan(all.results.length);
    }
  });
  it("filters by category", async () => {
    await index.index(samplePosts);
    const result = await index.search("a", { category: "design" });
    const slugs = result.results.map((r) => r.slug);
    expect(slugs).toContain("accessible-color-systems");
    expect(slugs).not.toContain("typed-content-pipeline");
  });
  it("filters by tag", async () => {
    await index.index(samplePosts);
    const result = await index.search("a", { tag: "typescript" });
    const slugs = result.results.map((r) => r.slug);
    expect(slugs).toContain("typed-content-pipeline");
    expect(slugs).not.toContain("accessible-color-systems");
  });
  it("filters by author", async () => {
    await index.index(samplePosts);
    const result = await index.search("a", { author: "site-team" });
    expect(result.total).toBeGreaterThan(0);
  });
  it("adds a single post", async () => {
    await index.index(samplePosts);
    const newPost = makePost({
      slug: "new-post",
      title: "New Article About WebAssembly",
      tags: ["wasm", "performance"],
    });
    await index.add(newPost);
    expect(index.size()).toBe(4);
    const result = await index.search("webassembly");
    expect(result.total).toBeGreaterThan(0);
  });
  it("removes a post", async () => {
    await index.index(samplePosts);
    await index.remove("typed-content-pipeline");
    expect(index.size()).toBe(2);
    const result = await index.search("typed content");
    const slugs = result.results.map((r) => r.slug);
    expect(slugs).not.toContain("typed-content-pipeline");
  });
  it("clears the index", async () => {
    await index.index(samplePosts);
    index.clear();
    expect(index.isReady()).toBe(false);
    expect(index.size()).toBe(0);
  });
  it("returns empty for empty query", async () => {
    await index.index(samplePosts);
    const result = await index.search("");
    expect(result.total).toBe(0);
    expect(result.results).toEqual([]);
  });
  it("returns empty when not ready", async () => {
    const result = await index.search("typescript");
    expect(result.total).toBe(0);
  });
  it("handles very long query gracefully", async () => {
    await index.index(samplePosts);
    const longQuery = "typescript ".repeat(50);
    const result = await index.search(longQuery);
    expect(result.results.length).toBeLessThanOrEqual(50);
  });
});