import { z } from "zod";
/**
 * Frontmatter validation schema.
 *
 * The single source of truth for post metadata. TypeScript types are inferred
 * from this schema so runtime validation and static types never drift.
 */
/** ISO date string (YYYY-MM-DD or full ISO 8601). */
const isoDate = z
  .string()
  .min(1, "date is required")
  .refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "date must be a valid ISO 8601 date",
  });
/** Non-empty string. */
const nonEmpty = (field: string) => z.string().min(1, `${field} is required`);
/**
 * Raw frontmatter as it appears in MDX files.
 * Required fields: title, slug, description, date, author, category.
 */
export const frontmatterSchema = z.object({
  title: nonEmpty("title"),
  slug: nonEmpty("slug"),
  description: nonEmpty("description"),
  date: isoDate,
  updated: isoDate.optional(),
  author: nonEmpty("author"),
  category: nonEmpty("category"),
  tags: z.array(z.string().min(1)).max(8).default([]),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
  noindex: z.boolean().default(false),
  canonicalUrl: z.string().url().optional(),
  relatedArticles: z.array(z.string()).optional(),
  comments: z.boolean().optional(),
  summary: z.string().max(300).optional(),
  lastModified: isoDate.optional(),
  // --- i18n fields ---
  /** BCP-47 locale code for this article (e.g. "en", "hi", "es"). Defaults to site default. */
  locale: z.string().optional(),
  /** Shared key linking translated versions of the same article. */
  translationKey: z.string().optional(),
  // --- Series / multi-part articles ---
  /** Series identifier linking sequential articles (e.g. "react-guide"). */
  series: z.string().optional(),
  /** Position within the series (1-indexed). */
  seriesPart: z.number().int().min(1).optional(),
  // --- Monetization flags ---
  /** Mark this article as sponsored content. */
  sponsored: z.boolean().default(false),
});
/** Inferred type of validated frontmatter. */
export type Frontmatter = z.infer<typeof frontmatterSchema>;
/** Publishing status derived from frontmatter flags. */
export type { PostStatus } from "./types";
/**
 * Parse and validate a raw frontmatter object.
 * Throws a formatted error listing all validation issues.
 */
export function parseFrontmatter(raw: unknown): Frontmatter {
  const result = frontmatterSchema.safeParse(raw);
  if (!result.success) {
    const messages = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid frontmatter:\n${messages}`);
  }
  return result.data;
}