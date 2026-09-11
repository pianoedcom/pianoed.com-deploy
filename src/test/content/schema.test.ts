import { describe, it, expect } from "vitest";
import type { z } from "zod";
import { parseFrontmatter, frontmatterSchema } from "@/lib/content/schema";
const validFrontmatter = {
  title: "Hello World",
  slug: "hello-world",
  description: "A first post.",
  date: "2025-01-01",
  author: "site-team",
  category: "software-craft",
  tags: ["typescript"],
  published: true,
  featured: false,
};
describe("frontmatter schema", () => {
  it("parses valid frontmatter", () => {
    const result = parseFrontmatter(validFrontmatter);
    expect(result.title).toBe("Hello World");
    expect(result.slug).toBe("hello-world");
    expect(result.published).toBe(true);
    expect(result.tags).toEqual(["typescript"]);
  });
  it("applies defaults for optional fields", () => {
    const minimal = {
      title: "Minimal",
      slug: "minimal",
      description: "Minimal post.",
      date: "2025-01-01",
      author: "site-team",
      category: "design",
    };
    const result = parseFrontmatter(minimal);
    expect(result.tags).toEqual([]);
    expect(result.published).toBe(true);
    expect(result.featured).toBe(false);
    expect(result.noindex).toBe(false);
  });
  it("rejects missing title", () => {
    expect(() => parseFrontmatter({ ...validFrontmatter, title: "" })).toThrow("title");
  });
  it("rejects malformed date", () => {
    expect(() => parseFrontmatter({ ...validFrontmatter, date: "not-a-date" })).toThrow("date");
  });
  it("rejects invalid canonicalUrl", () => {
    expect(() => parseFrontmatter({ ...validFrontmatter, canonicalUrl: "not-a-url" })).toThrow();
  });
  it("accepts a valid updated date", () => {
    const result = parseFrontmatter({
      ...validFrontmatter,
      updated: "2025-02-01",
    });
    expect(result.updated).toBe("2025-02-01");
  });
  it("infers the Frontmatter type from the schema", () => {
    // Type-level check: this assignment compiles only if inference works.
    const sample: z.infer<typeof frontmatterSchema> = parseFrontmatter(validFrontmatter);
    expect(sample.slug).toBe("hello-world");
  });
});