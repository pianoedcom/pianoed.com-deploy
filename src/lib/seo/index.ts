/**
 * SEO layer public API.
 *
 * Re-exports metadata builders, canonical utilities, and JSON-LD schema
 * generators. The Seo component and JsonLd component consume these.
 */
// --- Metadata ---
export { buildTitle, buildUrl, buildMetaTags, homePageMetadata } from "./metadata";
export type { MetaTag, PageMetadata } from "./metadata";
// --- Canonical ---
export { buildCanonical, resolveCanonical, cleanPath } from "./canonical";
// --- JSON-LD Schema ---
export {
  websiteSchema,
  organizationSchema,
  personSchema,
  blogPostingSchema,
  breadcrumbSchema,
  collectionPageSchema,
} from "./schema";
export type { BreadcrumbItem } from "./schema";
// --- Sitemap ---
export { buildSitemapEntries, sitemapToXml } from "./sitemap";
export type { SitemapEntry } from "./sitemap";
// --- Robots ---
export { generateRobotsTxt } from "./robots";
// --- RSS Feed ---
export { buildFeedItems, feedToXml } from "./feed";
export type { FeedItem } from "./feed";
// --- Atom Feed ---
export { atomFeedToXml } from "./atom-feed";
// --- llms.txt (AEO) ---
export { generateLlmsTxt, generateLlmsFullTxt } from "./llms-txt";