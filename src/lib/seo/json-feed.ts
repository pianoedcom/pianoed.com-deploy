/**
 * JSON Feed 1.1 generator.
 *
 * Creates a valid JSON Feed from published posts. This provides an
 * alternative feed format alongside the RSS 2.0 feed for readers who
 * prefer JSON-based feed readers.
 *
 * @see https://jsonfeed.org/version/1.1
 */
import { siteConfig } from "@/lib/site-config";
import { buildUrl } from "@/lib/seo/metadata";
import { resolveCanonical } from "@/lib/seo/canonical";
import { categoryName, tagName } from "@/lib/content/frontmatter";
import type { PostSummary, Author } from "@/lib/content/types";
export interface JsonFeedItem {
  id: string;
  url: string;
  title: string;
  content_text: string;
  summary: string;
  date_published: string;
  authors: Array<{ name: string }>;
  tags: string[];
}
export interface JsonFeed {
  version: string;
  title: string;
  home_page_url: string;
  feed_url: string;
  description: string;
  items: JsonFeedItem[];
}
/** Build JSON Feed from posts + authors. */
export function buildJsonFeed(posts: PostSummary[], authors: Map<string, Author>): JsonFeed {
  const published = posts.filter((p) => p.published && !p.noindex);
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: siteConfig.name,
    home_page_url: siteConfig.url,
    feed_url: buildUrl("/feed.json"),
    description: siteConfig.description,
    items: published.map((post) => {
      const author = authors.get(post.author);
      const url = resolveCanonical(`/blog/${post.slug}`);
      return {
        id: url,
        url,
        title: post.title,
        content_text: post.description,
        summary: post.description,
        date_published: new Date(post.date).toISOString(),
        authors: [{ name: author?.name ?? siteConfig.defaultAuthor.name }],
        tags: [categoryName(post.category), ...post.tags.map((t) => tagName(t))],
      };
    }),
  };
}
/** Serialize the JSON Feed to a JSON string. */
export function jsonFeedToString(feed: JsonFeed): string {
  return JSON.stringify(feed, null, 2);
}