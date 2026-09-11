/**
 * Editorial content validation library.
 *
 * Provides structured validation results (errors vs. warnings) that can be
 * consumed by CI scripts, pre-commit hooks, or programmatic callers. The
 * validation layer checks frontmatter, taxonomy, links, images, SEO metadata,
 * heading hierarchy, and draft leakage — without depending on the rendering
 * pipeline.
 *
 * Severity model:
 *   - "error":   Critical issue that should block deployment.
 *   - "warning": Editorial concern that should be flagged but not block.
 *
 * The CI entry point (`validateAllContent`) returns a summary with counts
 * and an exit-code-friendly `hasErrors` flag.
 */
import { frontmatterSchema } from "./schema";
import { splitFrontmatter } from "./frontmatter";
import { isValidSlug } from "./slug";
import { KNOWN_CATEGORIES, KNOWN_TAGS } from "./constants";
import { slugFromPath } from "./git/paths";
// --- Types ------------------------------------------------------------------
/** Validation severity. */
export type Severity = "error" | "warning";
/** A single validation finding. */
export interface ValidationIssue {
  /** Severity: errors block deployment, warnings do not. */
  severity: Severity;
  /** Human-readable message. */
  message: string;
  /** Source file path or slug where the issue was found. */
  source: string;
  /** Optional field name (e.g. "date", "slug"). */
  field?: string;
  /** The check that produced this issue. */
  check: string;
}
/** Result of validating a single content file. */
export interface FileValidationResult {
  source: string;
  slug: string;
  issues: ValidationIssue[];
}
/** Aggregate result of validating all content. */
export interface ValidationReport {
  /** Per-file results. */
  files: FileValidationResult[];
  /** All issues flattened and sorted by severity. */
  issues: ValidationIssue[];
  /** Total error count. */
  errorCount: number;
  /** Total warning count. */
  warningCount: number;
  /** Whether any errors were found (CI exit gate). */
  hasErrors: boolean;
  /** Number of files validated. */
  fileCount: number;
}
// --- Content file discovery -------------------------------------------------
/** A discovered content file with its raw content. */
export interface ContentFile {
  /** Full path (e.g. "/content/posts/hello-world.mdx"). */
  path: string;
  /** Derived slug. */
  slug: string;
  /** Raw file content. */
  raw: string;
  /** Content type. */
  type: "post" | "author";
}
/**
 * Discover content files from Vite's eager raw imports.
 *
 * This reuses the same `import.meta.glob` pattern as the local source adapter
 * so CI validates exactly what the app will render.
 */
export function discoverContentFiles(): ContentFile[] {
  const postFiles = import.meta.glob<string>("/content/posts/*.{mdx,md}", {
    query: "?raw",
    import: "default",
    eager: true,
  });
  const authorFiles = import.meta.glob<string>("/content/authors/*.{mdx,md}", {
    query: "?raw",
    import: "default",
    eager: true,
  });
  const posts: ContentFile[] = Object.entries(postFiles).map(([path, raw]) => ({
    path,
    slug: slugFromPath(path),
    raw: raw as string,
    type: "post",
  }));
  const authors: ContentFile[] = Object.entries(authorFiles).map(([path, raw]) => ({
    path,
    slug: slugFromPath(path),
    raw: raw as string,
    type: "author",
  }));
  return [...posts, ...authors];
}
// --- Individual checks ------------------------------------------------------
/**
 * Validate frontmatter for a single post file.
 * Returns a list of issues (empty if valid).
 */
export function validatePostFrontmatter(file: ContentFile): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { path: source, slug } = file;
  let parsed: { frontmatter: Record<string, unknown>; body: string };
  try {
    parsed = splitFrontmatter(file.raw);
  } catch (err) {
    issues.push({
      severity: "error",
      message: `Failed to parse frontmatter: ${(err as Error).message}`,
      source,
      check: "frontmatter-parse",
    });
    return issues;
  }
  // Schema validation via Zod.
  const result = frontmatterSchema.safeParse(parsed.frontmatter);
  if (!result.success) {
    for (const issue of result.error.issues) {
      issues.push({
        severity: "error",
        message: `${issue.path.join(".") || "root"}: ${issue.message}`,
        source,
        field: issue.path.join("."),
        check: "frontmatter-schema",
      });
    }
    return issues; // If schema fails, further checks are unreliable.
  }
  const fm = result.data;
  // Slug consistency: frontmatter slug must match filename slug.
  if (fm.slug !== slug) {
    issues.push({
      severity: "error",
      message: `Frontmatter slug "${fm.slug}" does not match filename slug "${slug}".`,
      source,
      field: "slug",
      check: "slug-consistency",
    });
  }
  // Slug format.
  if (!isValidSlug(fm.slug)) {
    issues.push({
      severity: "error",
      message: `Slug "${fm.slug}" is not a valid slug (lowercase, alphanumeric, hyphen-separated).`,
      source,
      field: "slug",
      check: "slug-format",
    });
  }
  // Category must be in the known list.
  if (!KNOWN_CATEGORIES.includes(fm.category as never)) {
    issues.push({
      severity: "error",
      message: `Invalid category "${fm.category}". Known categories: ${KNOWN_CATEGORIES.join(", ")}.`,
      source,
      field: "category",
      check: "taxonomy-category",
    });
  }
  // Tags must all be in the known list.
  for (const tag of fm.tags) {
    if (!KNOWN_TAGS.includes(tag as never)) {
      issues.push({
        severity: "error",
        message: `Invalid tag "${tag}". Known tags: ${KNOWN_TAGS.join(", ")}.`,
        source,
        field: "tags",
        check: "taxonomy-tag",
      });
    }
  }
  // Date validity (already checked by schema, but double-check parseability).
  if (Number.isNaN(Date.parse(fm.date))) {
    issues.push({
      severity: "error",
      message: `Invalid date "${fm.date}". Must be a valid ISO 8601 date.`,
      source,
      field: "date",
      check: "date-validity",
    });
  }
  // Updated date must be after publication date.
  if (fm.updated && Date.parse(fm.updated) < Date.parse(fm.date)) {
    issues.push({
      severity: "warning",
      message: `Updated date "${fm.updated}" is before publication date "${fm.date}".`,
      source,
      field: "updated",
      check: "date-order",
    });
  }
  // Description length (SEO best practice).
  if (fm.description.length > 160) {
    issues.push({
      severity: "warning",
      message: `Description is ${fm.description.length} characters (recommended max 160 for SEO).`,
      source,
      field: "description",
      check: "seo-description-length",
    });
  }
  // Image alt text: if image is present, imageAlt should be too.
  if (fm.image && !fm.imageAlt) {
    issues.push({
      severity: "warning",
      message: `Hero image is set but imageAlt is missing. Add alt text for accessibility.`,
      source,
      field: "imageAlt",
      check: "image-alt",
    });
  }
  // Canonical URL: if set, must be a valid URL (schema already checks this, but warn if it duplicates the site URL).
  if (fm.canonicalUrl) {
    issues.push({
      severity: "warning",
      message: `Canonical URL override is set to "${fm.canonicalUrl}". Ensure this is intentional and points to the preferred URL.`,
      source,
      field: "canonicalUrl",
      check: "seo-canonical",
    });
  }
  return issues;
}
/**
 * Check for duplicate slugs across all post files.
 */
export function checkDuplicateSlugs(files: ContentFile[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seen = new Map<string, string>();
  for (const file of files) {
    if (file.type !== "post") continue;
    const existing = seen.get(file.slug);
    if (existing) {
      issues.push({
        severity: "error",
        message: `Duplicate slug "${file.slug}" found in both ${existing} and ${file.path}.`,
        source: file.path,
        field: "slug",
        check: "duplicate-slug",
      });
    } else {
      seen.set(file.slug, file.path);
    }
  }
  return issues;
}
/**
 * Check that all post authors reference a known author file.
 */
export function checkAuthorReferences(
  files: ContentFile[],
  knownAuthorSlugs: string[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const authorSet = new Set(knownAuthorSlugs);
  for (const file of files) {
    if (file.type !== "post") continue;
    let parsed: { frontmatter: Record<string, unknown>; body: string };
    try {
      parsed = splitFrontmatter(file.raw);
    } catch {
      continue; // Parse errors are caught by frontmatter check.
    }
    const result = frontmatterSchema.safeParse(parsed.frontmatter);
    if (!result.success) continue;
    if (!authorSet.has(result.data.author)) {
      issues.push({
        severity: "error",
        message: `Author "${result.data.author}" is not found in content/authors/. Known authors: ${knownAuthorSlugs.join(", ")}.`,
        source: file.path,
        field: "author",
        check: "author-reference",
      });
    }
  }
  return issues;
}
/**
 * Extract internal links from MDX body.
 * Returns paths like "/blog/some-article" or "/category/design".
 */
export function extractInternalLinks(body: string): string[] {
  const links: string[] = [];
  // Markdown links: [text](/path)
  const mdLinkPattern = /\[([^\]]*)\]\(([^)\s]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = mdLinkPattern.exec(body)) !== null) {
    const url = match[2];
    if (url.startsWith("/") && !url.startsWith("//")) {
      links.push(url);
    }
  }
  // MDX component props: <Link to="/path" or href="/path"
  const jsxLinkPattern = /\b(?:to|href)=["']([^"']+)["']/g;
  while ((match = jsxLinkPattern.exec(body)) !== null) {
    const url = match[1];
    if (url.startsWith("/") && !url.startsWith("//")) {
      links.push(url);
    }
  }
  return links;
}
/**
 * Check internal links to see if they reference known content.
 * Only checks article links (/blog/slug, /articles/slug) and taxonomy pages.
 */
export function checkInternalLinks(
  files: ContentFile[],
  knownSlugs: string[],
  knownCategories: string[],
  knownTags: string[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const slugSet = new Set(knownSlugs);
  const categorySet = new Set(knownCategories);
  const tagSet = new Set(knownTags);
  for (const file of files) {
    if (file.type !== "post") continue;
    let parsed: { frontmatter: Record<string, unknown>; body: string };
    try {
      parsed = splitFrontmatter(file.raw);
    } catch {
      continue;
    }
    const links = extractInternalLinks(parsed.body);
    for (const link of links) {
      // Article links: /blog/slug or /articles/slug
      const articleMatch = link.match(/^\/(?:blog|articles)\/([^/?#]+)/);
      if (articleMatch) {
        const targetSlug = articleMatch[1];
        if (!slugSet.has(targetSlug)) {
          issues.push({
            severity: "warning",
            message: `Internal link "${link}" references article slug "${targetSlug}" which does not exist.`,
            source: file.path,
            check: "internal-link",
          });
        }
        continue;
      }
      // Category links: /category/slug
      const categoryMatch = link.match(/^\/category\/([^/?#]+)/);
      if (categoryMatch) {
        const targetSlug = categoryMatch[1];
        if (!categorySet.has(targetSlug)) {
          issues.push({
            severity: "warning",
            message: `Internal link "${link}" references category "${targetSlug}" which is not a known category.`,
            source: file.path,
            check: "internal-link",
          });
        }
        continue;
      }
      // Tag links: /tag/slug
      const tagMatch = link.match(/^\/tag\/([^/?#]+)/);
      if (tagMatch) {
        const targetSlug = tagMatch[1];
        if (!tagSet.has(targetSlug)) {
          issues.push({
            severity: "warning",
            message: `Internal link "${link}" references tag "${targetSlug}" which is not a known tag.`,
            source: file.path,
            check: "internal-link",
          });
        }
        continue;
      }
      // Unknown internal paths like /search, /archive are valid static routes.
      // We don't flag those — only content references.
    }
  }
  return issues;
}
/**
 * Extract image references from frontmatter and MDX body.
 */
export function extractImageReferences(file: ContentFile): string[] {
  const images: string[] = [];
  let parsed: { frontmatter: Record<string, unknown>; body: string };
  try {
    parsed = splitFrontmatter(file.raw);
  } catch {
    return images;
  }
  // Frontmatter image.
  const result = frontmatterSchema.safeParse(parsed.frontmatter);
  if (result.success && result.data.image) {
    images.push(result.data.image);
  }
  // MDX ResponsiveImage components: <ResponsiveImage src="..." />
  const srcPattern = /src=["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = srcPattern.exec(parsed.body)) !== null) {
    const src = match[1];
    // Only track local images (not external URLs).
    if (src.startsWith("/") || src.startsWith("./") || !src.startsWith("http")) {
      images.push(src);
    }
  }
  // Markdown image syntax: ![alt](/path)
  const mdImagePattern = /!\[[^\]]*\]\(([^)]+)\)/g;
  while ((match = mdImagePattern.exec(parsed.body)) !== null) {
    const src = match[1];
    if (src.startsWith("/") || src.startsWith("./") || !src.startsWith("http")) {
      images.push(src);
    }
  }
  return images;
}
/**
 * Check that all referenced images exist in the public directory.
 * Uses the provided `publicDir` path to resolve image files.
 */
export function checkImageReferences(files: ContentFile[], publicDir: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  // Collect all known public image paths via Vite glob.
  const publicImages = import.meta.glob<string>("/public/**/*.{svg,png,jpg,jpeg,webp,gif,avif}", {
    query: "?url",
    import: "default",
    eager: true,
  });
  const knownImagePaths = new Set(Object.keys(publicImages).map((p) => p.replace(/^\/public/, "")));
  for (const file of files) {
    if (file.type !== "post") continue;
    const images = extractImageReferences(file);
    for (const img of images) {
      // Skip external URLs.
      if (img.startsWith("http://") || img.startsWith("https://")) continue;
      // Normalize: remove query strings, fragments.
      const cleanPath = img.split("?")[0].split("#")[0];
      const normalized = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
      if (!knownImagePaths.has(normalized)) {
        issues.push({
          severity: "warning",
          message: `Image "${img}" referenced in ${file.path} was not found in ${publicDir}.`,
          source: file.path,
          check: "image-reference",
        });
      }
    }
  }
  return issues;
}
/**
 * Check heading hierarchy in MDX body.
 * Flags: multiple H1s, skipped heading levels (e.g. H2 → H4).
 */
export function checkHeadingHierarchy(file: ContentFile): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  let parsed: { frontmatter: Record<string, unknown>; body: string };
  try {
    parsed = splitFrontmatter(file.raw);
  } catch {
    return issues;
  }
  // Match ATX headings: # through ######
  const headingPattern = /^(#{1,6})\s+(.+)$/gm;
  const headings: { level: number; text: string; line: number }[] = [];
  const lines = parsed.body.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      headings.push({ level: match[1].length, text: match[2], line: i + 1 });
    }
  }
  if (headings.length === 0) return issues;
  // Multiple H1s: only the first H1 is expected (the article title).
  const h1Count = headings.filter((h) => h.level === 1).length;
  if (h1Count > 1) {
    issues.push({
      severity: "warning",
      message: `Found ${h1Count} H1 headings. Use only one H1 per article (the title). Use H2+ for sections.`,
      source: file.path,
      check: "heading-hierarchy",
    });
  }
  // Skipped heading levels (e.g. H2 → H4 without H3).
  let prevLevel = 0;
  for (const heading of headings) {
    if (prevLevel > 0 && heading.level > prevLevel + 1) {
      issues.push({
        severity: "warning",
        message: `Heading level skip: H${prevLevel} → H${heading.level} at line ${heading.line} ("${heading.text}").`,
        source: file.path,
        check: "heading-hierarchy",
      });
    }
    prevLevel = heading.level;
  }
  return issues;
}
/**
 * Check for draft leakage: posts with published: false that might
 * accidentally appear in production.
 */
export function checkDraftLeakage(files: ContentFile[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const file of files) {
    if (file.type !== "post") continue;
    let parsed: { frontmatter: Record<string, unknown>; body: string };
    try {
      parsed = splitFrontmatter(file.raw);
    } catch {
      continue;
    }
    const result = frontmatterSchema.safeParse(parsed.frontmatter);
    if (!result.success) continue;
    if (!result.data.published) {
      issues.push({
        severity: "warning",
        message: `Post "${result.data.slug}" has published: false (draft). It will not appear in production listings.`,
        source: file.path,
        field: "published",
        check: "draft-leakage",
      });
    }
  }
  return issues;
}
/**
 * Check SEO metadata quality.
 */
export function checkSeoMetadata(files: ContentFile[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const file of files) {
    if (file.type !== "post") continue;
    let parsed: { frontmatter: Record<string, unknown>; body: string };
    try {
      parsed = splitFrontmatter(file.raw);
    } catch {
      continue;
    }
    const result = frontmatterSchema.safeParse(parsed.frontmatter);
    if (!result.success) continue;
    const fm = result.data;
    // Title length (SEO best practice: under 60 chars).
    if (fm.title.length > 60) {
      issues.push({
        severity: "warning",
        message: `Title is ${fm.title.length} characters (recommended max 60 for SEO).`,
        source: file.path,
        field: "title",
        check: "seo-title-length",
      });
    }
    // Description missing.
    if (!fm.description || fm.description.trim().length === 0) {
      issues.push({
        severity: "error",
        message: `Description is missing or empty.`,
        source: file.path,
        field: "description",
        check: "seo-description-missing",
      });
    }
    // Canonical URL format check.
    if (fm.canonicalUrl) {
      try {
        const url = new URL(fm.canonicalUrl);
        if (!url.protocol.startsWith("http")) {
          issues.push({
            severity: "error",
            message: `Canonical URL "${fm.canonicalUrl}" must use http or https protocol.`,
            source: file.path,
            field: "canonicalUrl",
            check: "seo-canonical",
          });
        }
      } catch {
        issues.push({
          severity: "error",
          message: `Canonical URL "${fm.canonicalUrl}" is not a valid URL.`,
          source: file.path,
          field: "canonicalUrl",
          check: "seo-canonical",
        });
      }
    }
  }
  return issues;
}
/**
 * Check that all categories and tags used in posts are defined in the
 * canonical taxonomy files.
 */
export function checkTaxonomyConsistency(files: ContentFile[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const file of files) {
    if (file.type !== "post") continue;
    let parsed: { frontmatter: Record<string, unknown>; body: string };
    try {
      parsed = splitFrontmatter(file.raw);
    } catch {
      continue;
    }
    const result = frontmatterSchema.safeParse(parsed.frontmatter);
    if (!result.success) continue;
    const fm = result.data;
    if (!KNOWN_CATEGORIES.includes(fm.category as never)) {
      issues.push({
        severity: "error",
        message: `Category "${fm.category}" is not defined in content/categories.ts.`,
        source: file.path,
        field: "category",
        check: "taxonomy-consistency",
      });
    }
    for (const tag of fm.tags) {
      if (!KNOWN_TAGS.includes(tag as never)) {
        issues.push({
          severity: "error",
          message: `Tag "${tag}" is not defined in content/tags.ts.`,
          source: file.path,
          field: "tags",
          check: "taxonomy-consistency",
        });
      }
    }
  }
  return issues;
}
// --- Aggregate validation ---------------------------------------------------
/**
 * Validate all content files and return a comprehensive report.
 *
 * This is the main entry point for CI scripts. It runs every check and
 * aggregates results into a single report with error/warning counts.
 */
export function validateAllContent(options?: { publicDir?: string }): ValidationReport {
  const publicDir = options?.publicDir ?? "public";
  const files = discoverContentFiles();
  const fileResults: FileValidationResult[] = [];
  const allIssues: ValidationIssue[] = [];
  // Per-file checks.
  for (const file of files) {
    if (file.type === "post") {
      const fmIssues = validatePostFrontmatter(file);
      const headingIssues = checkHeadingHierarchy(file);
      const fileIssues = [...fmIssues, ...headingIssues];
      fileResults.push({
        source: file.path,
        slug: file.slug,
        issues: fileIssues,
      });
      allIssues.push(...fileIssues);
    }
  }
  // Cross-file checks.
  const postFiles = files.filter((f) => f.type === "post");
  const authorFiles = files.filter((f) => f.type === "author");
  const dupIssues = checkDuplicateSlugs(files);
  const authorIssues = checkAuthorReferences(
    files,
    authorFiles.map((a) => a.slug),
  );
  const knownSlugs = postFiles.map((f) => f.slug);
  const knownCategories = [...KNOWN_CATEGORIES];
  const knownTags = [...KNOWN_TAGS];
  const linkIssues = checkInternalLinks(files, knownSlugs, knownCategories, knownTags);
  const imageIssues = checkImageReferences(files, publicDir);
  const draftIssues = checkDraftLeakage(files);
  const seoIssues = checkSeoMetadata(files);
  const taxonomyIssues = checkTaxonomyConsistency(files);
  allIssues.push(
    ...dupIssues,
    ...authorIssues,
    ...linkIssues,
    ...imageIssues,
    ...draftIssues,
    ...seoIssues,
    ...taxonomyIssues,
  );
  // Sort: errors first, then warnings.
  allIssues.sort((a, b) => {
    if (a.severity === "error" && b.severity === "warning") return -1;
    if (a.severity === "warning" && b.severity === "error") return 1;
    return a.source.localeCompare(b.source);
  });
  const errorCount = allIssues.filter((i) => i.severity === "error").length;
  const warningCount = allIssues.filter((i) => i.severity === "warning").length;
  return {
    files: fileResults,
    issues: allIssues,
    errorCount,
    warningCount,
    hasErrors: errorCount > 0,
    fileCount: files.length,
  };
}
// --- Formatting helpers -----------------------------------------------------
/**
 * Format a validation issue for terminal output.
 */
export function formatIssue(issue: ValidationIssue): string {
  const icon = issue.severity === "error" ? "✖" : "⚠";
  const label = issue.severity.toUpperCase();
  return `  ${icon} [${label}] ${issue.check}: ${issue.message}\n    └─ ${issue.source}${issue.field ? ` (${issue.field})` : ""}`;
}
/**
 * Format the full validation report for terminal output.
 */
export function formatReport(report: ValidationReport): string {
  const lines: string[] = [];
  lines.push("═".repeat(70));
  lines.push("  Content Validation Report");
  lines.push("═".repeat(70));
  lines.push("");
  if (report.issues.length === 0) {
    lines.push("  ✓ All content is valid. No issues found.");
    lines.push("");
    lines.push(`  Files checked: ${report.fileCount}`);
    lines.push("═".repeat(70));
    return lines.join("\n");
  }
  // Group issues by source file.
  const bySource = new Map<string, ValidationIssue[]>();
  for (const issue of report.issues) {
    const existing = bySource.get(issue.source) ?? [];
    existing.push(issue);
    bySource.set(issue.source, existing);
  }
  for (const [source, issues] of bySource) {
    lines.push(`  ${source}`);
    for (const issue of issues) {
      lines.push(formatIssue(issue));
    }
    lines.push("");
  }
  lines.push("─".repeat(70));
  lines.push(`  Files checked: ${report.fileCount}`);
  lines.push(`  Errors:   ${report.errorCount}`);
  lines.push(`  Warnings: ${report.warningCount}`);
  lines.push("─".repeat(70));
  if (report.hasErrors) {
    lines.push("  ✖ Validation FAILED — errors must be fixed before deployment.");
  } else {
    lines.push("  ✓ Validation PASSED — warnings are non-blocking.");
  }
  lines.push("═".repeat(70));
  return lines.join("\n");
}