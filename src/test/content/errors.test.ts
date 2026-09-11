/**
 * Tests for content error classes and their integration with the
 * frontmatter validation and parsing pipeline.
 */
import { describe, it, expect } from "vitest";
import {
  ContentError,
  ContentNotFoundError,
  ContentValidationError,
  ContentParseError,
  ContentUnavailableError,
  isContentError,
  isContentNotFoundError,
  isContentValidationError,
  isContentParseError,
  isContentUnavailableError,
} from "@/lib/content/errors";
import { splitFrontmatter, validateFrontmatter } from "@/lib/content/frontmatter";
describe("ContentError classes", () => {
  it("ContentNotFoundError has correct kind and user message", () => {
    const err = new ContentNotFoundError("Article", "missing-slug");
    expect(err.kind).toBe("content_not_found");
    expect(err.userMessage).toBe("The requested article could not be found.");
    expect(err.sourceLabel).toBe("missing-slug");
    expect(err.name).toBe("ContentNotFoundError");
  });
  it("ContentValidationError has correct kind and field", () => {
    const err = new ContentValidationError("Invalid category", "post.mdx", "category");
    expect(err.kind).toBe("content_invalid");
    expect(err.field).toBe("category");
    expect(err.userMessage).toBe("The content could not be displayed due to a formatting issue.");
  });
  it("ContentParseError has correct kind", () => {
    const err = new ContentParseError("Missing frontmatter", "unknown");
    expect(err.kind).toBe("content_parse_error");
    expect(err.userMessage).toBe("The content could not be processed.");
  });
  it("ContentUnavailableError has retryable flag", () => {
    const err = new ContentUnavailableError("Git timeout", {
      retryable: true,
      sourceLabel: "posts",
    });
    expect(err.kind).toBe("content_unavailable");
    expect(err.retryable).toBe(true);
    expect(err.userMessage).toBe("Content is temporarily unavailable. Please try again later.");
  });
  it("ContentUnavailableError defaults to non-retryable", () => {
    const err = new ContentUnavailableError("Fatal error");
    expect(err.retryable).toBe(false);
  });
});
describe("Content error type guards", () => {
  it("isContentError identifies ContentError subclasses", () => {
    expect(isContentError(new ContentNotFoundError("Post", "x"))).toBe(true);
    expect(isContentError(new ContentValidationError("err", "f"))).toBe(true);
    expect(isContentError(new ContentParseError("err", "f"))).toBe(true);
    expect(isContentError(new ContentUnavailableError("err"))).toBe(true);
    expect(isContentError(new Error("generic"))).toBe(false);
  });
  it("isContentNotFoundError identifies only ContentNotFoundError", () => {
    expect(isContentNotFoundError(new ContentNotFoundError("Post", "x"))).toBe(true);
    expect(isContentNotFoundError(new ContentParseError("err", "f"))).toBe(false);
  });
  it("isContentValidationError identifies only ContentValidationError", () => {
    const err = new ContentValidationError("err", "f", "field");
    expect(isContentValidationError(err)).toBe(true);
    expect(isContentValidationError(new ContentNotFoundError("P", "s"))).toBe(false);
  });
  it("isContentParseError identifies only ContentParseError", () => {
    expect(isContentParseError(new ContentParseError("err", "f"))).toBe(true);
    expect(isContentParseError(new ContentNotFoundError("P", "s"))).toBe(false);
  });
  it("isContentUnavailableError identifies only ContentUnavailableError", () => {
    expect(isContentUnavailableError(new ContentUnavailableError("err"))).toBe(true);
    expect(isContentUnavailableError(new ContentParseError("err", "f"))).toBe(false);
  });
});
describe("splitFrontmatter error handling", () => {
  it("throws ContentParseError for missing frontmatter block", () => {
    expect(() => splitFrontmatter("Just some text without frontmatter")).toThrow(ContentParseError);
  });
  it("throws ContentParseError with descriptive message", () => {
    try {
      splitFrontmatter("No frontmatter here");
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ContentParseError);
      expect((err as ContentParseError).message).toContain("frontmatter");
    }
  });
});
describe("validateFrontmatter error handling", () => {
  it("throws ContentValidationError for invalid category", () => {
    const raw = {
      title: "Test",
      slug: "test-post",
      description: "A test post",
      date: "2025-01-15",
      author: "site-team",
      category: "nonexistent-category",
      tags: ["typescript"],
      published: true,
      featured: false,
    };
    expect(() => validateFrontmatter(raw, "test-post", "test-post.mdx")).toThrow(
      ContentValidationError,
    );
  });
  it("throws ContentValidationError for slug mismatch", () => {
    const raw = {
      title: "Test",
      slug: "wrong-slug",
      description: "A test post",
      date: "2025-01-15",
      author: "site-team",
      category: "software-craft",
      tags: ["typescript"],
      published: true,
      featured: false,
    };
    expect(() => validateFrontmatter(raw, "expected-slug", "file.mdx")).toThrow(
      ContentValidationError,
    );
  });
  it("throws ContentValidationError for invalid tag", () => {
    const raw = {
      title: "Test",
      slug: "test-post",
      description: "A test post",
      date: "2025-01-15",
      author: "site-team",
      category: "software-craft",
      tags: ["nonexistent-tag"],
      published: true,
      featured: false,
    };
    expect(() => validateFrontmatter(raw, "test-post", "test-post.mdx")).toThrow(
      ContentValidationError,
    );
  });
  it("ContentValidationError has field set for category errors", () => {
    const raw = {
      title: "Test",
      slug: "test-post",
      description: "A test post",
      date: "2025-01-15",
      author: "site-team",
      category: "bad-category",
      tags: ["typescript"],
      published: true,
      featured: false,
    };
    try {
      validateFrontmatter(raw, "test-post", "test-post.mdx");
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ContentValidationError);
      expect((err as ContentValidationError).field).toBe("category");
    }
  });
});