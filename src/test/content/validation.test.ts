/**
 * Tests for the content validation library.
 *
 * Tests cover: valid frontmatter, invalid frontmatter, duplicate slugs,
 * unpublished content, malformed dates, missing title, invalid categories,
 * reading time, heading hierarchy, internal links, draft leakage, SEO
 * metadata, and the aggregate report.
 */
import { describe, it, expect } from "vitest";
import {
  validatePostFrontmatter,
  checkDuplicateSlugs,
  checkAuthorReferences,
  checkInternalLinks,
  checkHeadingHierarchy,
  checkDraftLeakage,
  checkSeoMetadata,
  checkTaxonomyConsistency,
  extractInternalLinks,
  extractImageReferences,
  validateAllContent,
  formatReport,
  type ContentFile,
} from "@/lib/content/validation";
// --- Helpers ----------------------------------------------------------------
function makePostFile(
  slug: string,
  frontmatter: Record<string, unknown>,
  body = "Some body content.",
): ContentFile {
  const fmLines: string[] = ["---"];
  for (const [key, value] of Object.entries(frontmatter)) {
    if (Array.isArray(value)) {
      fmLines.push(`${key}:`);
      for (const v of value) fmLines.push(`  - ${v}`);
    } else if (typeof value === "object" && value !== null) {
      fmLines.push(`${key}:`);
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        fmLines.push(`  ${k}: ${v}`);
      }
    } else {
      fmLines.push(`${key}: ${typeof value === "string" ? `"${value}"` : value}`);
    }
  }
  fmLines.push("---");
  fmLines.push("");
  fmLines.push(body);
  return {
    path: `/content/posts/${slug}.mdx`,
    slug,
    raw: fmLines.join("\n"),
    type: "post",
  };
}
function makeAuthorFile(slug: string): ContentFile {
  return {
    path: `/content/authors/${slug}.mdx`,
    slug,
    raw: `---\nname: ${slug}\nbio: "Test author"\navatar: /images/authors/${slug}.svg\n---\n\nBio body.`,
    type: "author",
  };
}
// --- Valid frontmatter ------------------------------------------------------
describe("validatePostFrontmatter — valid content", () => {
  it("returns no issues for a well-formed post", () => {
    const file = makePostFile("valid-post", {
      title: "A Valid Post",
      slug: "valid-post",
      description: "A perfectly valid description.",
      date: "2025-01-15",
      author: "site-team",
      category: "software-craft",
      tags: ["typescript", "react"],
      published: true,
    });
    const issues = validatePostFrontmatter(file);
    expect(issues).toHaveLength(0);
  });
  it("accepts optional fields being absent", () => {
    const file = makePostFile("minimal-post", {
      title: "Minimal Post",
      slug: "minimal-post",
      description: "Minimal description.",
      date: "2025-01-15",
      author: "site-team",
      category: "design",
      published: true,
    });
    const issues = validatePostFrontmatter(file);
    const errors = issues.filter((i) => i.severity === "error");
    expect(errors).toHaveLength(0);
  });
});
// --- Invalid frontmatter ---------------------------------------------------
describe("validatePostFrontmatter — invalid content", () => {
  it("reports error for missing title", () => {
    const file = makePostFile("no-title", {
      slug: "no-title",
      description: "No title here.",
      date: "2025-01-15",
      author: "site-team",
      category: "design",
      published: true,
    });
    const issues = validatePostFrontmatter(file);
    expect(issues.some((i) => i.check === "frontmatter-schema" && i.severity === "error")).toBe(
      true,
    );
  });
  it("reports error for missing description", () => {
    const file = makePostFile("no-desc", {
      title: "No Description",
      slug: "no-desc",
      date: "2025-01-15",
      author: "site-team",
      category: "design",
      published: true,
    });
    const issues = validatePostFrontmatter(file);
    expect(issues.some((i) => i.field === "description" && i.severity === "error")).toBe(true);
  });
  it("reports error for malformed date", () => {
    const file = makePostFile("bad-date", {
      title: "Bad Date",
      slug: "bad-date",
      description: "Has a bad date.",
      date: "not-a-date",
      author: "site-team",
      category: "design",
      published: true,
    });
    const issues = validatePostFrontmatter(file);
    expect(
      issues.some(
        (i) =>
          (i.check === "frontmatter-schema" || i.check === "date-validity") &&
          i.severity === "error",
      ),
    ).toBe(true);
  });
  it("reports error for invalid category", () => {
    const file = makePostFile("bad-category", {
      title: "Bad Category",
      slug: "bad-category",
      description: "Has an invalid category.",
      date: "2025-01-15",
      author: "site-team",
      category: "nonexistent-category",
      published: true,
    });
    const issues = validatePostFrontmatter(file);
    expect(issues.some((i) => i.check === "taxonomy-category" && i.severity === "error")).toBe(
      true,
    );
  });
  it("reports error for invalid tag", () => {
    const file = makePostFile("bad-tag", {
      title: "Bad Tag",
      slug: "bad-tag",
      description: "Has an invalid tag.",
      date: "2025-01-15",
      author: "site-team",
      category: "design",
      tags: ["nonexistent-tag"],
      published: true,
    });
    const issues = validatePostFrontmatter(file);
    expect(issues.some((i) => i.check === "taxonomy-tag" && i.severity === "error")).toBe(true);
  });
  it("reports error for slug mismatch", () => {
    const file = makePostFile("file-slug", {
      title: "Slug Mismatch",
      slug: "different-slug",
      description: "Slug doesn't match filename.",
      date: "2025-01-15",
      author: "site-team",
      category: "design",
      published: true,
    });
    const issues = validatePostFrontmatter(file);
    expect(issues.some((i) => i.check === "slug-consistency" && i.severity === "error")).toBe(true);
  });
  it("reports error for malformed MDX (no frontmatter)", () => {
    const file: ContentFile = {
      path: "/content/posts/no-fm.mdx",
      slug: "no-fm",
      raw: "This file has no frontmatter at all.",
      type: "post",
    };
    const issues = validatePostFrontmatter(file);
    expect(issues.some((i) => i.check === "frontmatter-parse" && i.severity === "error")).toBe(
      true,
    );
  });
});
// --- Duplicate slugs --------------------------------------------------------
describe("checkDuplicateSlugs", () => {
  it("reports error for duplicate slugs", () => {
    const files = [
      makePostFile("dup", {
        title: "First",
        slug: "dup",
        description: "d",
        date: "2025-01-01",
        author: "a",
        category: "design",
        published: true,
      }),
      makePostFile("dup", {
        title: "Second",
        slug: "dup",
        description: "d",
        date: "2025-01-02",
        author: "a",
        category: "design",
        published: true,
      }),
    ];
    const issues = checkDuplicateSlugs(files);
    expect(issues).toHaveLength(1);
    expect(issues[0].check).toBe("duplicate-slug");
    expect(issues[0].severity).toBe("error");
  });
  it("returns no issues for unique slugs", () => {
    const files = [
      makePostFile("post-a", {
        title: "A",
        slug: "post-a",
        description: "d",
        date: "2025-01-01",
        author: "a",
        category: "design",
        published: true,
      }),
      makePostFile("post-b", {
        title: "B",
        slug: "post-b",
        description: "d",
        date: "2025-01-02",
        author: "a",
        category: "design",
        published: true,
      }),
    ];
    const issues = checkDuplicateSlugs(files);
    expect(issues).toHaveLength(0);
  });
});
// --- Author references ------------------------------------------------------
describe("checkAuthorReferences", () => {
  it("reports error when author does not exist", () => {
    const posts = [
      makePostFile("post-a", {
        title: "A",
        slug: "post-a",
        description: "d",
        date: "2025-01-01",
        author: "ghost",
        category: "design",
        published: true,
      }),
    ];
    const authors = [makeAuthorFile("site-team")];
    const issues = checkAuthorReferences(
      posts,
      authors.map((a) => a.slug),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].check).toBe("author-reference");
    expect(issues[0].severity).toBe("error");
  });
  it("passes when author exists", () => {
    const posts = [
      makePostFile("post-a", {
        title: "A",
        slug: "post-a",
        description: "d",
        date: "2025-01-01",
        author: "site-team",
        category: "design",
        published: true,
      }),
    ];
    const authors = [makeAuthorFile("site-team")];
    const issues = checkAuthorReferences(
      posts,
      authors.map((a) => a.slug),
    );
    expect(issues).toHaveLength(0);
  });
});
// --- Internal links ---------------------------------------------------------
describe("extractInternalLinks", () => {
  it("extracts markdown internal links", () => {
    const body = "See [this article](/blog/hello-world) and [category](/category/design).";
    const links = extractInternalLinks(body);
    expect(links).toContain("/blog/hello-world");
    expect(links).toContain("/category/design");
  });
  it("does not extract external links", () => {
    const body = "[External](https://example.com) and [internal](/blog/post).";
    const links = extractInternalLinks(body);
    expect(links).not.toContain("https://example.com");
    expect(links).toContain("/blog/post");
  });
});
describe("checkInternalLinks", () => {
  it("warns about broken article links", () => {
    const posts = [
      makePostFile(
        "post-a",
        {
          title: "A",
          slug: "post-a",
          description: "d",
          date: "2025-01-01",
          author: "a",
          category: "design",
          published: true,
        },
        "Link to [missing](/blog/nonexistent).",
      ),
    ];
    const issues = checkInternalLinks(posts, ["post-a"], ["design"], []);
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe("warning");
  });
  it("passes for valid article links", () => {
    const posts = [
      makePostFile(
        "post-a",
        {
          title: "A",
          slug: "post-a",
          description: "d",
          date: "2025-01-01",
          author: "a",
          category: "design",
          published: true,
        },
        "Link to [valid](/blog/post-b).",
      ),
      makePostFile("post-b", {
        title: "B",
        slug: "post-b",
        description: "d",
        date: "2025-01-02",
        author: "a",
        category: "design",
        published: true,
      }),
    ];
    const issues = checkInternalLinks(posts, ["post-a", "post-b"], ["design"], []);
    expect(issues).toHaveLength(0);
  });
});
// --- Heading hierarchy -----------------------------------------------------
describe("checkHeadingHierarchy", () => {
  it("warns about multiple H1s", () => {
    const file = makePostFile(
      "multi-h1",
      {
        title: "Multi H1",
        slug: "multi-h1",
        description: "d",
        date: "2025-01-01",
        author: "a",
        category: "design",
        published: true,
      },
      "# First H1\n\n## Section\n\n# Second H1\n",
    );
    const issues = checkHeadingHierarchy(file);
    expect(issues.some((i) => i.message.includes("H1"))).toBe(true);
  });
  it("warns about skipped heading levels", () => {
    const file = makePostFile(
      "skip-level",
      {
        title: "Skip",
        slug: "skip-level",
        description: "d",
        date: "2025-01-01",
        author: "a",
        category: "design",
        published: true,
      },
      "# Title\n\n## Section\n\n#### Skipped to H4\n",
    );
    const issues = checkHeadingHierarchy(file);
    expect(issues.some((i) => i.message.includes("skip"))).toBe(true);
  });
  it("passes for correct hierarchy", () => {
    const file = makePostFile(
      "good-hierarchy",
      {
        title: "Good",
        slug: "good-hierarchy",
        description: "d",
        date: "2025-01-01",
        author: "a",
        category: "design",
        published: true,
      },
      "# Title\n\n## Section\n\n### Subsection\n\n#### Detail\n",
    );
    const issues = checkHeadingHierarchy(file);
    expect(issues).toHaveLength(0);
  });
});
// --- Draft leakage ----------------------------------------------------------
describe("checkDraftLeakage", () => {
  it("warns about unpublished posts", () => {
    const file = makePostFile("draft", {
      title: "Draft",
      slug: "draft",
      description: "d",
      date: "2025-01-01",
      author: "a",
      category: "design",
      published: false,
    });
    const issues = checkDraftLeakage([file]);
    expect(issues).toHaveLength(1);
    expect(issues[0].check).toBe("draft-leakage");
    expect(issues[0].severity).toBe("warning");
  });
  it("passes for published posts", () => {
    const file = makePostFile("published", {
      title: "Published",
      slug: "published",
      description: "d",
      date: "2025-01-01",
      author: "a",
      category: "design",
      published: true,
    });
    const issues = checkDraftLeakage([file]);
    expect(issues).toHaveLength(0);
  });
});
// --- SEO metadata -----------------------------------------------------------
describe("checkSeoMetadata", () => {
  it("warns about long titles", () => {
    const file = makePostFile("long-title", {
      title: "A".repeat(70),
      slug: "long-title",
      description: "d",
      date: "2025-01-01",
      author: "a",
      category: "design",
      published: true,
    });
    const issues = checkSeoMetadata([file]);
    expect(issues.some((i) => i.check === "seo-title-length")).toBe(true);
  });
  it("warns about long descriptions", () => {
    const file = makePostFile("long-desc", {
      title: "Long Desc",
      slug: "long-desc",
      description: "A".repeat(170),
      date: "2025-01-01",
      author: "a",
      category: "design",
      published: true,
    });
    const issues = checkSeoMetadata([file]);
    expect(issues.some((i) => i.check === "seo-description-length")).toBe(true);
  });
  it("errors on invalid canonical URL", () => {
    const file = makePostFile("bad-canonical", {
      title: "Bad Canonical",
      slug: "bad-canonical",
      description: "d",
      date: "2025-01-01",
      author: "a",
      category: "design",
      published: true,
      canonicalUrl: "not-a-url",
    });
    const issues = checkSeoMetadata([file]);
    expect(issues.some((i) => i.check === "seo-canonical" && i.severity === "error")).toBe(true);
  });
});
// --- Taxonomy consistency ---------------------------------------------------
describe("checkTaxonomyConsistency", () => {
  it("errors on undefined category", () => {
    const file = makePostFile("bad-cat", {
      title: "Bad Cat",
      slug: "bad-cat",
      description: "d",
      date: "2025-01-01",
      author: "a",
      category: "unknown-category",
      published: true,
    });
    const issues = checkTaxonomyConsistency([file]);
    expect(issues.some((i) => i.check === "taxonomy-consistency" && i.severity === "error")).toBe(
      true,
    );
  });
  it("errors on undefined tag", () => {
    const file = makePostFile("bad-tag", {
      title: "Bad Tag",
      slug: "bad-tag",
      description: "d",
      date: "2025-01-01",
      author: "a",
      category: "design",
      tags: ["unknown-tag"],
      published: true,
    });
    const issues = checkTaxonomyConsistency([file]);
    expect(issues.some((i) => i.check === "taxonomy-consistency" && i.severity === "error")).toBe(
      true,
    );
  });
});
// --- Image references -------------------------------------------------------
describe("extractImageReferences", () => {
  it("extracts frontmatter image", () => {
    const file = makePostFile("img-post", {
      title: "Img",
      slug: "img-post",
      description: "d",
      date: "2025-01-01",
      author: "a",
      category: "design",
      published: true,
      image: "/images/posts/test.svg",
      imageAlt: "Test image",
    });
    const images = extractImageReferences(file);
    expect(images).toContain("/images/posts/test.svg");
  });
  it("extracts MDX ResponsiveImage src", () => {
    const file = makePostFile(
      "mdx-img",
      {
        title: "Img",
        slug: "mdx-img",
        description: "d",
        date: "2025-01-01",
        author: "a",
        category: "design",
        published: true,
      },
      '<ResponsiveImage src="/images/posts/test.svg" alt="Test" />',
    );
    const images = extractImageReferences(file);
    expect(images).toContain("/images/posts/test.svg");
  });
});
// --- Aggregate report -------------------------------------------------------
describe("validateAllContent", () => {
  it("returns a report with correct structure", () => {
    const report = validateAllContent();
    expect(report).toHaveProperty("files");
    expect(report).toHaveProperty("issues");
    expect(report).toHaveProperty("errorCount");
    expect(report).toHaveProperty("warningCount");
    expect(report).toHaveProperty("hasErrors");
    expect(report).toHaveProperty("fileCount");
    expect(typeof report.fileCount).toBe("number");
    expect(typeof report.errorCount).toBe("number");
    expect(typeof report.warningCount).toBe("number");
    expect(typeof report.hasErrors).toBe("boolean");
  });
  it("validates the actual content files in the repo", () => {
    const report = validateAllContent();
    // We should have found at least 3 posts + 1 author.
    expect(report.fileCount).toBeGreaterThanOrEqual(4);
  });
});
// --- Format helpers ---------------------------------------------------------
describe("formatReport", () => {
  it("produces readable output", () => {
    const report = validateAllContent();
    const output = formatReport(report);
    expect(output).toContain("Content Validation Report");
    expect(typeof output).toBe("string");
  });
});