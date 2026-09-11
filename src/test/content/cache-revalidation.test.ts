import { describe, it, expect, beforeEach } from "vitest";
import { contentCache } from "@/lib/content/cache";
import {
  postTag,
  categoryTag,
  tagTag,
  authorTag,
  POSTS_TAG,
  CATEGORIES_TAG,
  TAGS_TAG,
  AUTHORS_TAG,
  HOMEPAGE_TAG,
  tagsForPost,
  tagsForPostIndex,
  tagsForCategory,
  tagsForTag,
  tagsForHomepage,
} from "@/lib/cache/tags";
import { cacheProfiles, getProfile } from "@/lib/cache/profiles";
import {
  revalidatePost,
  revalidatePostIndex,
  revalidateCategory,
  revalidateTag,
  revalidateAuthor,
  revalidateHomepage,
  revalidateAll,
} from "@/lib/content/revalidate";
describe("cache tag builders", () => {
  it("builds individual tags", () => {
    expect(postTag("hello-world")).toBe("post:hello-world");
    expect(categoryTag("software-craft")).toBe("category:software-craft");
    expect(tagTag("typescript")).toBe("tag:typescript");
    expect(authorTag("site-team")).toBe("author:site-team");
  });
  it("exports collection tag constants", () => {
    expect(POSTS_TAG).toBe("posts");
    expect(CATEGORIES_TAG).toBe("categories");
    expect(TAGS_TAG).toBe("tags");
    expect(AUTHORS_TAG).toBe("authors");
    expect(HOMEPAGE_TAG).toBe("homepage");
  });
  it("builds composite tag sets for a post", () => {
    const tags = tagsForPost("hello-world", "software-craft", ["typescript", "react"]);
    expect(tags).toContain("post:hello-world");
    expect(tags).toContain("posts");
    expect(tags).toContain("category:software-craft");
    expect(tags).toContain("tag:typescript");
    expect(tags).toContain("tag:react");
    expect(tags).toContain("homepage");
  });
  it("builds tag sets for index, category, tag, and homepage", () => {
    expect(tagsForPostIndex()).toContain("posts");
    expect(tagsForPostIndex()).toContain("homepage");
    expect(tagsForCategory("design")).toContain("category:design");
    expect(tagsForTag("react")).toContain("tag:react");
    expect(tagsForHomepage()).toContain("homepage");
    expect(tagsForHomepage()).toContain("posts");
  });
});
describe("cache profiles", () => {
  it("defines all expected profiles", () => {
    expect(cacheProfiles.default.freshMs).toBeGreaterThan(0);
    expect(cacheProfiles.short.freshMs).toBeLessThan(cacheProfiles.default.freshMs);
    expect(cacheProfiles.long.freshMs).toBeGreaterThan(cacheProfiles.default.freshMs);
    expect(cacheProfiles.homepage.freshMs).toBeGreaterThan(0);
    expect(cacheProfiles.immutable.freshMs).toBe(Number.MAX_SAFE_INTEGER);
  });
  it("returns default for unknown profile name", () => {
    // @ts-expect-error — testing runtime fallback for unknown name
    expect(getProfile("nonexistent")).toBe(cacheProfiles.default);
  });
  it("each profile has fresh + stale > fresh", () => {
    for (const profile of Object.values(cacheProfiles)) {
      if (profile.staleMs > 0) {
        expect(profile.freshMs + profile.staleMs).toBeGreaterThan(profile.freshMs);
      }
    }
  });
});
describe("ContentCache (SWR)", () => {
  beforeEach(() => {
    contentCache.clear();
  });
  it("returns fresh values within TTL", () => {
    contentCache.set("k", "v", { profile: "default" });
    const result = contentCache.get<string>("k");
    expect(result.hasValue).toBe(true);
    expect(result.isStale).toBe(false);
    expect(result.value).toBe("v");
  });
  it("returns stale values after fresh window but before eviction", async () => {
    const profile = { freshMs: 10, staleMs: 50 };
    contentCache.setWithProfile("k", "v", profile, ["test"]);
    await new Promise((r) => setTimeout(r, 20));
    const result = contentCache.get<string>("k");
    expect(result.hasValue).toBe(true);
    expect(result.isStale).toBe(true);
    expect(result.value).toBe("v");
  });
  it("evicts entries past total lifetime", async () => {
    const profile = { freshMs: 10, staleMs: 20 };
    contentCache.setWithProfile("k", "v", profile, ["test"]);
    await new Promise((r) => setTimeout(r, 40));
    const result = contentCache.get<string>("k");
    expect(result.hasValue).toBe(false);
  });
  it("invalidates by tag", () => {
    contentCache.set("post:a", "a", {
      profile: "default",
      tags: ["post:a", "posts"],
    });
    contentCache.set("post:b", "b", {
      profile: "default",
      tags: ["post:b", "posts"],
    });
    contentCache.set("authors", [], {
      profile: "default",
      tags: ["authors"],
    });
    contentCache.invalidateTag("posts");
    expect(contentCache.get("post:a").hasValue).toBe(false);
    expect(contentCache.get("post:b").hasValue).toBe(false);
    expect(contentCache.get("authors").hasValue).toBe(true);
  });
  it("tracks revalidating flag", () => {
    contentCache.set("k", "v", { profile: "default" });
    expect(contentCache.markRevalidating("k")).toBe(true);
    expect(contentCache.markRevalidating("k")).toBe(false); // already revalidating
    contentCache.clearRevalidating("k");
    expect(contentCache.markRevalidating("k")).toBe(true);
  });
});
describe("revalidation helpers", () => {
  beforeEach(() => {
    contentCache.clear();
  });
  it("revalidatePost invalidates post, index, category, tags, and homepage", () => {
    contentCache.set("post:hello", "data", {
      profile: "default",
      tags: ["post:hello", "posts", "category:software-craft", "tag:typescript", "homepage"],
    });
    contentCache.set("post:other", "other", {
      profile: "default",
      tags: ["post:other", "posts"],
    });
    contentCache.set("category:software-craft", [], {
      profile: "default",
      tags: ["category:software-craft"],
    });
    contentCache.set("unrelated", "x", {
      profile: "default",
      tags: ["authors"],
    });
    revalidatePost("hello", "software-craft", ["typescript"]);
    expect(contentCache.get("post:hello").hasValue).toBe(false);
    expect(contentCache.get("post:other").hasValue).toBe(false);
    expect(contentCache.get("category:software-craft").hasValue).toBe(false);
    expect(contentCache.get("unrelated").hasValue).toBe(true);
  });
  it("revalidatePostIndex invalidates posts, homepage, categories, tags", () => {
    contentCache.set("posts", [], { profile: "default", tags: ["posts"] });
    contentCache.set("homepage", [], { profile: "default", tags: ["homepage"] });
    contentCache.set("categories", [], { profile: "default", tags: ["categories"] });
    contentCache.set("tags", [], { profile: "default", tags: ["tags"] });
    contentCache.set("authors", [], { profile: "default", tags: ["authors"] });
    revalidatePostIndex();
    expect(contentCache.get("posts").hasValue).toBe(false);
    expect(contentCache.get("homepage").hasValue).toBe(false);
    expect(contentCache.get("categories").hasValue).toBe(false);
    expect(contentCache.get("tags").hasValue).toBe(false);
    expect(contentCache.get("authors").hasValue).toBe(true);
  });
  it("revalidateCategory invalidates only the category + collection", () => {
    contentCache.set("category:design", [], {
      profile: "default",
      tags: ["category:design", "categories"],
    });
    contentCache.set("category:software-craft", [], {
      profile: "default",
      tags: ["category:software-craft", "categories"],
    });
    contentCache.set("posts", [], { profile: "default", tags: ["posts"] });
    revalidateCategory("design");
    expect(contentCache.get("category:design").hasValue).toBe(false);
    expect(contentCache.get("category:software-craft").hasValue).toBe(false);
    expect(contentCache.get("posts").hasValue).toBe(true);
  });
  it("revalidateTag invalidates only the tag + collection", () => {
    contentCache.set("tag:typescript", [], {
      profile: "default",
      tags: ["tag:typescript", "tags"],
    });
    contentCache.set("tag:react", [], {
      profile: "default",
      tags: ["tag:react", "tags"],
    });
    contentCache.set("posts", [], { profile: "default", tags: ["posts"] });
    revalidateTag("typescript");
    expect(contentCache.get("tag:typescript").hasValue).toBe(false);
    expect(contentCache.get("tag:react").hasValue).toBe(false);
    expect(contentCache.get("posts").hasValue).toBe(true);
  });
  it("revalidateAuthor invalidates author + collection", () => {
    contentCache.set(
      "author:site-team",
      {},
      {
        profile: "default",
        tags: ["author:site-team", "authors"],
      },
    );
    contentCache.set(
      "author:jane",
      {},
      {
        profile: "default",
        tags: ["author:jane", "authors"],
      },
    );
    contentCache.set("posts", [], { profile: "default", tags: ["posts"] });
    revalidateAuthor("site-team");
    expect(contentCache.get("author:site-team").hasValue).toBe(false);
    expect(contentCache.get("author:jane").hasValue).toBe(false);
    expect(contentCache.get("posts").hasValue).toBe(true);
  });
  it("revalidateHomepage invalidates homepage + posts", () => {
    contentCache.set("homepage:latest", [], {
      profile: "default",
      tags: ["homepage", "posts"],
    });
    contentCache.set("authors", [], { profile: "default", tags: ["authors"] });
    revalidateHomepage();
    expect(contentCache.get("homepage:latest").hasValue).toBe(false);
    expect(contentCache.get("authors").hasValue).toBe(true);
  });
  it("revalidateAll clears everything", () => {
    contentCache.set("a", 1, { profile: "default", tags: ["x"] });
    contentCache.set("b", 2, { profile: "default", tags: ["y"] });
    revalidateAll();
    expect(contentCache.get("a").hasValue).toBe(false);
    expect(contentCache.get("b").hasValue).toBe(false);
  });
});