/**
 * RSS 2.0 feed generator.
 *
 * Creates a valid RSS 2.0 feed from published posts. The feed provides
 * full content excerpts (the post description) rather than the complete
 * MDX body, since the body requires client-side rendering.
 *
 * Feed items include:
 *   - title
 *   - description (excerpt)
 *   - canonical URL (link)
 *   - publication date
 *   - author
 *   - GUID (the canonical URL)
 *   - category tags
 */
import { siteConfig } from "@/lib/site-config";
import { buildUrl } from "@/lib/seo/metadata";
import { resolveCanonical } from "@/lib/seo/canonical";
import type { PostSummary, Author } from "@/lib/content/types";
import { categoryName, tagName } from "@/lib/content/frontmatter";
/** RSS feed item. */
export interface FeedItem {
  title: string;
  link: string;
  description: string;
  contentEncoded?: string;
  pubDate: string;
  guid: string;
  author?: string;
  categories: string[];
}
/**
 * Convert markdown/MDX body text to readable plain text for RSS feeds.
 * Preserves link text (not URLs), heading text, and list item text.
 */
function markdownToPlainText(md: string): string {
  return (
    md
      // Strip image syntax: ![alt](url) → alt
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
      // Strip link syntax: [text](url) → text
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      // Strip headings: ## Heading → Heading
      .replace(/^#{1,6}\s+/gm, "")
      // Strip bold/italic: **text** / *text* / __text__ / _text_ → text
      .replace(/(\*\*|__)(.+?)\1/g, "$2")
      .replace(/(\*|_)(.+?)\1/g, "$2")
      // Strip inline code: `code` → code
      .replace(/`([^`]+)`/g, "$1")
      // Strip code blocks: ```lang\ncode\n``` → code
      .replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*\n?/g, "").replace(/```/g, ""))
      // Strip blockquotes: > text → text
      .replace(/^>\s+/gm, "")
      // Strip horizontal rules: --- → (remove)
      .replace(/^[-*_]{3,}\s*$/gm, "")
      // Strip list markers: - item / 1. item → item
      .replace(/^[\s]*[-*+]\s+/gm, "")
      .replace(/^[\s]*\d+\.\s+/gm, "")
      // Strip JSX component tags: <Component ...>...</Component>
      .replace(/<\/?[A-Z][A-Za-z0-9]*[^>]*>/g, "")
      // Collapse multiple newlines
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}
/** Build RSS feed items from posts + authors. */
export function buildFeedItems(
  posts: Array<PostSummary & { body?: string }>,
  authors: Map<string, Author>,
): FeedItem[] {
  return posts
    .filter((p) => p.published && !p.noindex)
    .map((post) => {
      const author = authors.get(post.author);
      const link = resolveCanonical(`/blog/${post.slug}`);
      // Convert markdown to plain text and truncate at 1000 chars
      const plainBody = post.body ? markdownToPlainText(post.body) : "";
      const truncated = plainBody.slice(0, 1000);
      const contentEncoded =
        plainBody.length > 0
          ? `${truncated}${plainBody.length > 1000 ? "…" : ""}\n\nContinue reading at ${link}`
          : undefined;
      return {
        title: post.title,
        link,
        description: post.description,
        contentEncoded,
        pubDate: new Date(post.date).toUTCString(),
        guid: link,
        author: author?.name ?? siteConfig.defaultAuthor.name,
        categories: [categoryName(post.category), ...post.tags.map((t) => tagName(t))],
      };
    });
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
/** Serialize feed items to RSS 2.0 XML. */
export function feedToXml(items: FeedItem[]): string {
  const itemsXml = items
    .map((item) => {
      let xml = "    <item>\n";
      xml += `      <title>${escapeXml(item.title)}</title>\n`;
      xml += `      <link>${escapeXml(item.link)}</link>\n`;
      xml += `      <description>${escapeXml(item.description)}</description>\n`;
      if (item.contentEncoded) {
        xml += `      <content:encoded><![CDATA[${escapeXml(item.contentEncoded)}]]></content:encoded>\n`;
      }
      xml += `      <pubDate>${item.pubDate}</pubDate>\n`;
      xml += `      <guid>${escapeXml(item.guid)}</guid>\n`;
      if (item.author) {
        // Use dc:creator for author name (RSS 2.0 <author> requires an email).
        xml += `      <dc:creator><![CDATA[${escapeXml(item.author)}]]></dc:creator>\n`;
      }
      for (const cat of item.categories) {
        xml += `      <category>${escapeXml(cat)}</category>\n`;
      }
      xml += "    </item>";
      return xml;
    })
    .join("\n");
  const lastBuildDate = items.length > 0 ? items[0].pubDate : new Date().toUTCString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${escapeXml(siteConfig.url)}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>${siteConfig.defaultLocale}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(buildUrl("/feed.xml"))}" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;
}