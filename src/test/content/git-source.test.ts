import { describe, it, expect, vi, beforeEach } from "vitest";
import { createGitSource } from "@/lib/content/git/source";
import type { GitProvider, GitFileEntry } from "@/lib/content/git/types";
/** Build a mock Git provider with stubbed responses. */
function mockProvider(opts: {
  files?: GitFileEntry[];
  contents?: Record<string, string>;
}): GitProvider {
  return {
    id: "github",
    listFiles: vi.fn(async () => opts.files ?? []),
    getFile: vi.fn(async (path: string) => opts.contents?.[path] ?? null),
  };
}
const VALID_POST = `---
title: "Hello World"
slug: "hello-world"
description: "A test post."
date: "2025-01-01"
author: "site-team"
category: "software-craft"
tags: ["typescript"]
published: true
---
# Hello World
This is the body content.`;
const DRAFT_POST = `---
title: "Draft Post"
slug: "draft-post"
description: "A draft."
date: "2025-01-02"
author: "site-team"
category: "software-craft"
tags: []
published: false
---
# Draft`;
const AUTHOR = `---
name: Site Team
bio: "Editors."
avatar: /avatar.svg
---
Bio.`;
describe("createGitSource", () => {
  it("lists only published posts", async () => {
    const provider = mockProvider({
      files: [
        { path: "hello-world.mdx", type: "file" },
        { path: "draft-post.mdx", type: "file" },
      ],
      contents: {
        "hello-world.mdx": VALID_POST,
        "draft-post.mdx": DRAFT_POST,
      },
    });
    const source = createGitSource({ provider });
    const posts = await source.listPosts();
    expect(posts).toHaveLength(1);
    expect(posts[0].slug).toBe("hello-world");
    expect(posts.every((p) => p.published)).toBe(true);
  });
  it("returns a full post by slug", async () => {
    const provider = mockProvider({
      files: [{ path: "hello-world.mdx", type: "file" }],
      contents: { "hello-world.mdx": VALID_POST },
    });
    const source = createGitSource({ provider });
    const post = await source.getPostBySlug("hello-world");
    expect(post).not.toBeNull();
    expect(post!.title).toBe("Hello World");
    expect(post!.body).toContain("This is the body content.");
    expect(post!.readingTime).toBeGreaterThanOrEqual(1);
  });
  it("returns null for unknown slug", async () => {
    const provider = mockProvider({ files: [], contents: {} });
    const source = createGitSource({ provider });
    expect(await source.getPostBySlug("nope")).toBeNull();
  });
  it("does not expose drafts via getPostBySlug", async () => {
    const provider = mockProvider({
      files: [{ path: "draft-post.mdx", type: "file" }],
      contents: { "draft-post.mdx": DRAFT_POST },
    });
    const source = createGitSource({ provider });
    expect(await source.getPostBySlug("draft-post")).toBeNull();
  });
  it("rejects duplicate slugs", async () => {
    const provider = mockProvider({
      files: [
        { path: "hello-world.mdx", type: "file" },
        { path: "posts/hello-world.mdx", type: "file" },
      ],
      contents: {
        "hello-world.mdx": VALID_POST,
        "posts/hello-world.mdx": VALID_POST,
      },
    });
    const source = createGitSource({ provider });
    await expect(source.listPosts()).rejects.toThrow(/Duplicate post slug/);
  });
  it("rejects invalid frontmatter (missing title)", async () => {
    const provider = mockProvider({
      files: [{ path: "bad.mdx", type: "file" }],
      contents: {
        "bad.mdx": `---
slug: "bad"
description: "No title."
date: "2025-01-01"
author: "site-team"
category: "software-craft"
---
body`,
      },
    });
    const source = createGitSource({ provider });
    await expect(source.listPosts()).rejects.toThrow(/title/);
  });
  it("rejects malformed date", async () => {
    const provider = mockProvider({
      files: [{ path: "baddate.mdx", type: "file" }],
      contents: {
        "baddate.mdx": `---
title: "Bad Date"
slug: "baddate"
description: "x"
date: "not-a-date"
author: "site-team"
category: "software-craft"
---
body`,
      },
    });
    const source = createGitSource({ provider });
    await expect(source.listPosts()).rejects.toThrow(/date/);
  });
  it("rejects invalid category", async () => {
    const provider = mockProvider({
      files: [{ path: "badcat.mdx", type: "file" }],
      contents: {
        "badcat.mdx": `---
title: "Bad Cat"
slug: "badcat"
description: "x"
date: "2025-01-01"
author: "site-team"
category: "nonexistent"
---
body`,
      },
    });
    const source = createGitSource({ provider });
    await expect(source.listPosts()).rejects.toThrow(/Invalid category/);
  });
  it("returns categories and tags", async () => {
    const provider = mockProvider({
      files: [{ path: "hello-world.mdx", type: "file" }],
      contents: { "hello-world.mdx": VALID_POST },
    });
    const source = createGitSource({ provider });
    const cats = await source.getAllCategories();
    expect(cats).toContainEqual({ slug: "software-craft", name: "Software Craft" });
    const tags = await source.getAllTags();
    expect(tags).toContainEqual({ slug: "typescript", name: "Typescript", count: 1 });
  });
  it("filters posts by category and tag", async () => {
    const provider = mockProvider({
      files: [{ path: "hello-world.mdx", type: "file" }],
      contents: { "hello-world.mdx": VALID_POST },
    });
    const source = createGitSource({ provider });
    expect((await source.getPostsByCategory("software-craft")).length).toBe(1);
    expect((await source.getPostsByCategory("design")).length).toBe(0);
    expect((await source.getPostsByTag("typescript")).length).toBe(1);
    expect((await source.getPostsByTag("react")).length).toBe(0);
  });
  it("returns an author by slug", async () => {
    const provider = mockProvider({
      contents: { "authors/site-team.mdx": AUTHOR },
    });
    const source = createGitSource({ provider });
    const author = await source.getAuthor("site-team");
    expect(author).not.toBeNull();
    expect(author!.name).toBe("Site Team");
  });
  it("caches the post index (listFiles called once)", async () => {
    const provider = mockProvider({
      files: [{ path: "hello-world.mdx", type: "file" }],
      contents: { "hello-world.mdx": VALID_POST },
    });
    const source = createGitSource({ provider });
    await source.listPosts();
    await source.getAllCategories();
    await source.getAllTags();
    expect(provider.listFiles).toHaveBeenCalledTimes(1);
  });
  it("caches individual posts", async () => {
    const provider = mockProvider({
      files: [{ path: "hello-world.mdx", type: "file" }],
      contents: { "hello-world.mdx": VALID_POST },
    });
    const source = createGitSource({ provider });
    await source.getPostBySlug("hello-world");
    await source.getPostBySlug("hello-world");
    // listFiles once for the index; getFile once for the body.
    expect(provider.listFiles).toHaveBeenCalledTimes(1);
    expect(provider.getFile).toHaveBeenCalledTimes(1);
  });
});