/**
 * Sitemap generator.
 *
 * Builds a valid XML sitemap from the content source. Includes:
 *   - Article URLs (published, non-noindex posts only)
 *   - Important taxonomy URLs (categories, tags with posts, authors with posts)
 *   - Key static pages (home, articles index)
 *
 * Excludes:
 *   - Drafts and archived posts
 *   - noindex posts
 *   - Internal search query URLs
 *   - Pagination URLs beyond page 1 (canonical URLs are page 1)
 */
import { siteConfig } from "@/lib/site-config";
import { buildUrl } from "@/lib/seo/metadata";
import { resolveCanonical } from "@/lib/seo/canonical";
import { getRedirectSources } from "@/lib/content/redirects";
import type { PostSummary, Category, Tag, Author } from "@/lib/content/types";
/** A hreflang alternate link for a sitemap entry. */
export interface SitemapAlternate {
  hreflang: string;
  href: string;
}
/** A single sitemap URL entry. */
export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
  /** Alternate language versions (hreflang). */
  alternates?: SitemapAlternate[];
}
/**
 * Build sitemap entries from content data.
 * This is called by the sitemap route component after fetching all content.
 */
export function buildSitemapEntries(params: {
  posts: PostSummary[];
  categories: Category[];
  tags: Tag[];
  authors: Author[];
  /** Optional: map of translationKey → locale slugs for hreflang alternates. */
  translationMap?: Map<string, Array<{ locale: string; slug: string }>>;
}): SitemapEntry[] {
  const { posts, categories, tags, authors, translationMap } = params;
  const entries: SitemapEntry[] = [];
  // Build a set of paths that are redirect sources — these must NOT
  // appear in the sitemap since they permanently redirect elsewhere.
  const redirectSources = new Set(getRedirectSources());
  // --- Static pages ---
  entries.push({
    loc: buildUrl("/"),
    changefreq: "daily",
    priority: 1.0,
  });
  entries.push({
    loc: buildUrl("/articles"),
    changefreq: "daily",
    priority: 0.9,
  });
  entries.push({
    loc: buildUrl("/blog"),
    changefreq: "daily",
    priority: 0.9,
  });
  entries.push({
    loc: buildUrl("/about"),
    changefreq: "monthly",
    priority: 0.5,
  });
  // --- Article URLs (published, non-noindex, non-redirected only) ---
  for (const post of posts) {
    if (!post.published || post.noindex) continue;
    const path = `/blog/${post.slug}`;
    if (redirectSources.has(path)) continue;
    // Build hreflang alternates if this post has translations
    let alternates: SitemapAlternate[] | undefined;
    if (post.translationKey && translationMap) {
      const translations = translationMap.get(post.translationKey);
      if (translations && translations.length > 1) {
        const siteUrl = siteConfig.url.replace(/\/$/, "");
        alternates = translations.map((t) => ({
          hreflang: t.locale,
          href: `${siteUrl}/blog/${t.slug}`,
        }));
        // Add x-default pointing to the default locale version
        const defaultVersion = translations.find((t) => t.locale === "en");
        if (defaultVersion) {
          alternates.unshift({
            hreflang: "x-default",
            href: `${siteUrl}/blog/${defaultVersion.slug}`,
          });
        }
      }
    }
    entries.push({
      loc: resolveCanonical(path),
      lastmod: post.updated ?? post.date,
      changefreq: "weekly",
      priority: 0.8,
      alternates,
    });
  }
  // --- Category URLs ---
  for (const category of categories) {
    entries.push({
      loc: buildUrl(`/category/${category.slug}`),
      changefreq: "weekly",
      priority: 0.6,
    });
  }
  // --- Tag URLs (only tags with at least 1 post) ---
  for (const tag of tags) {
    if (tag.count > 0) {
      entries.push({
        loc: buildUrl(`/tag/${tag.slug}`),
        changefreq: "weekly",
        priority: 0.5,
      });
    }
  }
  // --- Author URLs (only authors with at least 1 post) ---
  const postAuthors = new Set(posts.filter((p) => p.published).map((p) => p.author));
  for (const author of authors) {
    if (postAuthors.has(author.slug)) {
      entries.push({
        loc: buildUrl(`/author/${author.slug}`),
        changefreq: "weekly",
        priority: 0.5,
      });
    }
  }
  return entries;
}
/** Escape a string for safe inclusion in XML. */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
/** Serialize sitemap entries to XML. */
export function sitemapToXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map((entry) => {
      let xml = "  <url>\n";
      xml += `    <loc>${escapeXml(entry.loc)}</loc>\n`;
      if (entry.lastmod) {
        xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
      }
      if (entry.changefreq) {
        xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
      }
      if (entry.priority !== undefined) {
        xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
      }
      if (entry.alternates && entry.alternates.length > 0) {
        for (const alt of entry.alternates) {
          xml += `    <xhtml:link rel="alternate" hreflang="${escapeXml(alt.hreflang)}" href="${escapeXml(alt.href)}" />\n`;
        }
      }
      xml += "  </url>";
      return xml;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>`;
}
/** Maximum URLs per sitemap file (per sitemaps.org spec). */
const MAX_URLS_PER_SITEMAP = 500;
/**
 * Split sitemap entries into chunks for large sites.
 * Returns an array of entry arrays, each ≤500 entries.
 */
export function chunkSitemapEntries(entries: SitemapEntry[]): SitemapEntry[][] {
  const chunks: SitemapEntry[][] = [];
  for (let i = 0; i < entries.length; i += MAX_URLS_PER_SITEMAP) {
    chunks.push(entries.slice(i, i + MAX_URLS_PER_SITEMAP));
  }
  return chunks;
}
/**
 * Generate a sitemap index XML pointing to sub-sitemaps.
 * Used when the site has >500 URLs.
 */
export function sitemapIndexToXml(subSitemapUrls: string[]): string {
  const sitemaps = subSitemapUrls
    .map((url) => `  <sitemap>\n    <loc>${escapeXml(url)}</loc>\n  </sitemap>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps}\n</sitemapindex>`;
}
/**
 * Build the full sitemap XML, automatically using an index if >500 entries.
 */
export function buildSitemapXml(entries: SitemapEntry[]): string {
  if (entries.length <= MAX_URLS_PER_SITEMAP) {
    return sitemapToXml(entries);
  }
  // For large sites, generate a sitemap index pointing to sub-sitemaps.
  const chunks = chunkSitemapEntries(entries);
  const subSitemapUrls = chunks.map((_, i) => buildUrl(`/sitemap-${i + 1}.xml`));
  return sitemapIndexToXml(subSitemapUrls);
}
/**
 * Build a specific sitemap chunk XML (for sub-sitemaps).
 */
export function buildSitemapChunkXml(entries: SitemapEntry[], chunkIndex: number): string {
  const chunks = chunkSitemapEntries(entries);
  return sitemapToXml(chunks[chunkIndex] ?? []);
}