/**
 * SEO metadata builder.
 *
 * Produces a complete set of meta tags (standard, Open Graph, Twitter/X)
 * from a single `PageMetadata` input. Also provides a title template
 * ("Page — Site Name") used across all pages.
 */
import { siteConfig } from "@/lib/site-config";
import { resolveCanonical } from "./canonical";
/** A single meta tag to render in <head>. */
export interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}
/** Full page metadata used to generate meta tags. */
export interface PageMetadata {
  /** Page title (without the site suffix). */
  title: string;
  /** Meta description. */
  description: string;
  /** Site-relative path, e.g. "/blog/my-post". */
  path: string;
  /** Optional OG image override (absolute URL). */
  image?: string;
  /** Whether this is an article page. */
  article?: boolean;
  /** Article publication time (ISO 8601). */
  publishedAt?: string;
  /** Article modification time (ISO 8601). */
  modifiedAt?: string;
  /** Article author name. */
  author?: string;
  /** Canonical URL override (for cross-posted content). */
  canonicalUrl?: string;
  /** When true, adds noindex,nofollow robots directive. */
  noindex?: boolean;
  /** Locale for the og:locale tag. Falls back to site default. */
  locale?: string;
  /** Tags for article OG tags. */
  tags?: string[];
  /** Section (category) for article OG tags. */
  section?: string;
}
/**
 * Build the full page title using the site template.
 * Home page: just the site name. Other pages: "Page — Site Name".
 */
export function buildTitle(title: string): string {
  return title === siteConfig.name ? siteConfig.name : `${title} — ${siteConfig.name}`;
}
/** Build an absolute URL from a site-relative path. */
export function buildUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalized}`;
}
/** Extract the Twitter handle from the site's Twitter URL. */
function twitterHandle(): string | undefined {
  const match = siteConfig.social.twitter.match(/(?:twitter\.com|x\.com)\/@?(\w+)/);
  return match ? `@${match[1]}` : undefined;
}
/** Generate the complete meta tag set for a page. */
export function buildMetaTags(meta: PageMetadata): MetaTag[] {
  const tags: MetaTag[] = [];
  const canonical = resolveCanonical(meta.path, meta.canonicalUrl);
  const image = meta.image ?? siteConfig.defaultOgImage;
  const handle = twitterHandle();
  // --- Standard ---
  tags.push({ name: "description", content: meta.description });
  if (meta.author) {
    tags.push({ name: "author", content: meta.author });
  }
  // --- Open Graph ---
  tags.push({ property: "og:title", content: buildTitle(meta.title) });
  tags.push({ property: "og:description", content: meta.description });
  tags.push({
    property: "og:type",
    content: meta.article ? "article" : "website",
  });
  tags.push({ property: "og:url", content: canonical });
  tags.push({ property: "og:image", content: image });
  tags.push({ property: "og:image:width", content: "1200" });
  tags.push({ property: "og:image:height", content: "630" });
  tags.push({ property: "og:site_name", content: siteConfig.name });
  tags.push({ property: "og:locale", content: meta.locale ?? siteConfig.defaultLocale });
  if (meta.article) {
    if (meta.publishedAt) {
      tags.push({ property: "article:published_time", content: meta.publishedAt });
    }
    if (meta.modifiedAt) {
      tags.push({ property: "article:modified_time", content: meta.modifiedAt });
    }
    if (meta.author) {
      tags.push({ property: "article:author", content: meta.author });
    }
    if (meta.section) {
      tags.push({ property: "article:section", content: meta.section });
    }
    if (meta.tags && meta.tags.length > 0) {
      for (const tag of meta.tags) {
        tags.push({ property: "article:tag", content: tag });
      }
    }
  }
  // --- Twitter / X ---
  tags.push({ name: "twitter:card", content: "summary_large_image" });
  tags.push({ name: "twitter:title", content: buildTitle(meta.title) });
  tags.push({ name: "twitter:description", content: meta.description });
  tags.push({ name: "twitter:image", content: image });
  if (handle) {
    tags.push({ name: "twitter:site", content: handle });
    tags.push({ name: "twitter:creator", content: handle });
  }
  // --- Theme color ---
  tags.push({ name: "theme-color", content: "#6B2737" });
  return tags;
}
/** Default page metadata for the homepage. */
export const homePageMetadata: PageMetadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  path: "/",
};