/**
 * Shared frontmatter parsing utilities.
 *
 * Extracted from `local-source.ts` so both the local adapter and the Git
 * adapter use identical parsing logic. This guarantees that content validated
 * locally is identical to content validated from a remote Git source.
 *
 * Uses a browser-safe YAML parser (no Node.js APIs like Buffer) so it works
 * in Vite SPA builds. Handles block scalars, multi-line strings, nested
 * objects, arrays, and quoted strings.
 */
import { parseFrontmatter, type Frontmatter } from "./schema";
import { ContentParseError, ContentValidationError } from "./errors";
import { calculateReadingTime } from "./reading-time";
import { assertValidSlug } from "./slug";
import { KNOWN_CATEGORIES, KNOWN_TAGS } from "./constants";
import { getTaxonomyConfig } from "./taxonomy-config";
import type { Post, PostStatus, PostSummary } from "./types";
// ---------------------------------------------------------------------------
// Browser-safe YAML frontmatter parser
// No Node.js APIs (Buffer, fs, path). Works in Vite SPA.
// ---------------------------------------------------------------------------
/** Parse a single YAML scalar value into its JS equivalent. */
function parseYamlValue(value: string): unknown {
  value = value.trim();
  if (!value || value === "null" || value === "~") return null;
  if (value === "true") return true;
  if (value === "false") return false;
  // Numbers (but not empty strings or things like "1.2.3")
  if (/^-?\d+$/.test(value) || /^-?\d+\.\d+$/.test(value)) return Number(value);
  // Strip surrounding quotes (single or double)
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}
/** Parse a YAML block sequence (newline-delimited `- item` list). */
function parseYamlArray(text: string): string[] {
  const items: string[] = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) {
      items.push(
        trimmed
          .slice(2)
          .trim()
          .replace(/^["']|["']$/g, ""),
      );
    }
  }
  return items;
}
/** Parse a YAML inline array `[a, b, c]` or block array. */
function parseYamlList(value: string): string[] {
  const trimmed = value.trim();
  if (trimmed.startsWith("[")) {
    // Inline array: [a, b, c]
    const inner = trimmed.replace(/^\[|\]$/g, "").trim();
    if (!inner) return [];
    return inner
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  // Block array (multi-line with - items)
  return parseYamlArray(trimmed);
}
/** Parse a nested YAML object (indented key: value pairs). */
function parseYamlObject(
  lines: string[],
  startIndex: number,
): {
  value: Record<string, unknown>;
  nextIndex: number;
} {
  const result: Record<string, unknown> = {};
  let i = startIndex;
  while (i < lines.length) {
    const line = lines[i];
    // End of nested block when we hit a non-indented line
    if (!line.startsWith("  ") && !line.startsWith("\t") && line.trim() !== "") {
      break;
    }
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      i++;
      continue;
    }
    const match = trimmed.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (match) {
      const key = match[1];
      const val = match[2].trim();
      if (!val) {
        // Could be nested object or array on following lines
        const nested = parseYamlObject(lines, i + 1);
        result[key] = nested.value;
        i = nested.nextIndex;
      } else if (val.startsWith("[")) {
        result[key] = parseYamlList(val);
        i++;
      } else {
        result[key] = parseYamlValue(val);
        i++;
      }
    } else {
      i++;
    }
  }
  return { value: result, nextIndex: i };
}
/** Parse a complete YAML frontmatter block into a plain object. */
function parseYamlFrontmatter(yamlText: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = yamlText.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    // Skip blank lines and comments
    if (!trimmed || trimmed.startsWith("#")) {
      i++;
      continue;
    }
    const match = trimmed.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (match) {
      const key = match[1];
      const value = match[2].trim();
      if (!value) {
        // Check if next line is an indented array item or nested object
        const nextLine = lines[i + 1] ?? "";
        const nextTrimmed = nextLine.trim();
        if (nextTrimmed.startsWith("- ")) {
          // Block array — collect all consecutive array lines
          let arrayText = "";
          let j = i + 1;
          while (j < lines.length) {
            const arrLine = lines[j];
            const arrTrimmed = arrLine.trim();
            if (arrTrimmed.startsWith("- ") || (!arrTrimmed && arrLine.startsWith(" "))) {
              arrayText += "\n" + arrLine;
              j++;
            } else {
              break;
            }
          }
          result[key] = parseYamlArray(arrayText);
          i = j;
        } else if (nextLine.startsWith("  ") || nextLine.startsWith("\t")) {
          // Nested object
          const nested = parseYamlObject(lines, i + 1);
          result[key] = nested.value;
          i = nested.nextIndex;
        } else {
          result[key] = "";
          i++;
        }
      } else if (value.startsWith("[")) {
        result[key] = parseYamlList(value);
        i++;
      } else if (value.startsWith("|") || value.startsWith(">")) {
        // Block scalar (| literal or > folded) — collect indented lines
        let blockText = "";
        let j = i + 1;
        while (j < lines.length) {
          const blockLine = lines[j];
          if (blockLine.startsWith("  ") || blockLine.startsWith("\t") || blockLine.trim() === "") {
            blockText += "\n" + blockLine.replace(/^  /, "");
            j++;
          } else {
            break;
          }
        }
        result[key] = blockText.trim();
        i = j;
      } else {
        result[key] = parseYamlValue(value);
        i++;
      }
    } else {
      i++;
    }
  }
  return result;
}
/** Extract frontmatter (YAML) and body from a raw MDX string. */
export function splitFrontmatter(raw: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  if (typeof raw !== "string" || raw.length === 0) {
    throw new ContentParseError(
      "Expected non-empty raw string content but received " + typeof raw,
      "unknown",
    );
  }
  // Normalize line breaks
  const normalized = raw.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---")) {
    throw new ContentParseError(
      "Missing or malformed frontmatter block. Content must start with --- and a valid YAML block.",
      "unknown",
    );
  }
  // Find the closing --- delimiter (skip the opening one)
  const endIdx = normalized.indexOf("\n---", 3);
  if (endIdx === -1) {
    throw new ContentParseError("Missing closing --- delimiter in frontmatter block.", "unknown");
  }
  const yamlBlock = normalized.slice(3, endIdx).trim();
  const body = normalized.slice(endIdx + 4).trim();
  try {
    return {
      frontmatter: parseYamlFrontmatter(yamlBlock),
      body,
    };
  } catch (err) {
    const snippet = normalized.slice(0, 200);
    console.error("[frontmatter] Failed to parse YAML. Snippet:", snippet, err);
    throw new ContentParseError(
      "Missing or malformed frontmatter block. Content must start with --- and a valid YAML block.",
      "unknown",
    );
  }
}
/** Derive publishing status from frontmatter. */
export function deriveStatus(fm: Frontmatter): PostStatus {
  if (!fm.published) return "draft";
  // Published but dated in the future — treat as "scheduled" (hidden from
  // public listings but accessible via direct URL for preview).
  const now = new Date();
  const pubDate = new Date(fm.date);
  if (pubDate.getTime() > now.getTime()) return "draft";
  return "published";
}
/** Helper to derive translationKey from slug if omitted in frontmatter. */
function deriveTranslationKey(slug: string, fmTranslationKey?: string): string {
  if (fmTranslationKey && typeof fmTranslationKey === "string" && fmTranslationKey.trim()) {
    return fmTranslationKey.trim();
  }
  const match = slug.match(/^(.+)-(ar|de|es|fr|hi)$/);
  return match ? match[1] : slug;
}

/** Convert frontmatter + body to a PostSummary. */
export function toSummary(slug: string, fm: Frontmatter, body: string): PostSummary {
  // Extract a body excerpt for full-text search (first ~2000 chars).
  // Strip MDX component syntax and markdown to get plain text.
  const bodyExcerpt = extractBodyExcerpt(body, 2000);
  return {
    slug,
    title: fm.title,
    description: fm.description,
    date: fm.date,
    updated: fm.updated,
    author: fm.author,
    category: fm.category,
    tags: fm.tags,
    image: fm.image,
    imageAlt: fm.imageAlt,
    published: fm.published,
    featured: fm.featured,
    status: deriveStatus(fm),
    readingTime: calculateReadingTime(body),
    noindex: fm.noindex,
    bodyExcerpt,
    locale: fm.locale || "en",
    translationKey: deriveTranslationKey(slug, fm.translationKey),
  };
}
/**
 * Extract a plain-text excerpt from an MDX/Markdown body for search indexing.
 * Strips component syntax, code blocks, and markdown formatting.
 */
function extractBodyExcerpt(body: string, maxLen: number): string {
  let text = body;
  // Remove fenced code blocks
  text = text.replace(/```[\s\S]*?```/g, " ");
  // Remove inline code
  text = text.replace(/`[^`]+`/g, " ");
  // Remove MDX component tags (both opening and closing)
  text = text.replace(/<\/?[A-Z][a-zA-Z0-9]*[^>]*>/g, " ");
  // Remove MDX component self-closing tags
  text = text.replace(/<[A-Z][a-zA-Z0-9]*[^>]*\/>/g, " ");
  // Remove markdown images
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1");
  // Remove markdown links, keep text
  text = text.replace(/\[([^\]]*)\]\([^)]+\)/g, "$1");
  // Remove heading markers
  text = text.replace(/^#{1,6}\s+/gm, "");
  // Remove bold/italic markers
  text = text.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1");
  // Remove blockquotes
  text = text.replace(/^>\s+/gm, "");
  // Remove horizontal rules
  text = text.replace(/^---+$/gm, "");
  // Remove list markers
  text = text.replace(/^[-*+]\s+/gm, "");
  // Remove HTML tags
  text = text.replace(/<\/?[a-z][^>]*>/gi, " ");
  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();
  // Truncate to max length
  if (text.length > maxLen) {
    text = text.slice(0, maxLen);
  }
  return text;
}
/** Convert frontmatter + body to a full Post. */
export function toPost(slug: string, fm: Frontmatter, body: string): Post {
  return {
    ...toSummary(slug, fm, body),
    body,
    canonicalUrl: fm.canonicalUrl,
    relatedArticles: fm.relatedArticles,
  };
}
/** Human-readable name for a category slug. */
export function categoryName(slug: string): string {
  try {
    const { categories } = getTaxonomyConfig();
    const found = (categories as Array<{ slug: string; name: string }>).find(
      (c) => c.slug === slug,
    );
    return found?.name ?? slug;
  } catch {
    return slug;
  }
}
/** Human-readable name for a tag slug. */
export function tagName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
/**
 * Validate a parsed frontmatter object against the schema and canonical
 * category/tag lists. Throws a structured `ContentValidationError` on
 * failure with a useful, contextual message.
 *
 * @param sourceLabel - A label for error messages, e.g. the file path or slug.
 */
export function validateFrontmatter(
  raw: Record<string, unknown>,
  slug: string,
  sourceLabel: string,
): Frontmatter {
  let fm: Frontmatter;
  try {
    fm = parseFrontmatter(raw);
  } catch (err) {
    throw new ContentValidationError(
      `Error validating frontmatter in ${sourceLabel}: ${(err as Error).message}`,
      sourceLabel,
    );
  }
  if (fm.slug !== slug) {
    throw new ContentValidationError(
      `Slug mismatch in ${sourceLabel}: frontmatter slug "${fm.slug}" does not match expected slug "${slug}".`,
      sourceLabel,
      "slug",
    );
  }
  try {
    assertValidSlug(fm.slug);
  } catch (err) {
    throw new ContentValidationError(
      `Invalid slug in ${sourceLabel}: ${(err as Error).message}`,
      sourceLabel,
      "slug",
    );
  }
  if (!KNOWN_CATEGORIES.includes(fm.category as never)) {
    throw new ContentValidationError(
      `Invalid category "${fm.category}" in ${sourceLabel}. Known: ${KNOWN_CATEGORIES.join(", ")}.`,
      sourceLabel,
      "category",
    );
  }
  for (const tag of fm.tags) {
    if (!KNOWN_TAGS.includes(tag as never)) {
      throw new ContentValidationError(
        `Invalid tag "${tag}" in ${sourceLabel}. Known: ${KNOWN_TAGS.join(", ")}.`,
        sourceLabel,
        "tags",
      );
    }
  }
  return fm;
}