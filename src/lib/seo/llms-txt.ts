/**
 * llms.txt generator — AEO (Answer Engine Optimization) endpoint.
 *
 * Produces a structured plain-text index of the site and its content for
 * LLM/answer-engine crawlers. Follows the emerging llms.txt convention:
 *
 *   - /llms.txt      → concise summary with links to key pages
 *   - /llms-full.txt → expanded index with all published articles
 *
 * @see https://llmstxt.org/
 */
import { siteConfig } from "@/lib/site-config";
import { buildUrl } from "@/lib/seo/metadata";
import { resolveCanonical } from "@/lib/seo/canonical";
import { categoryName, tagName } from "@/lib/content/frontmatter";
import type { PostSummary, Author, Category, Tag } from "@/lib/content/types";
/**
 * Generate the concise /llms.txt content — a high-level summary
 * with links to the most important site pages.
 */
export function generateLlmsTxt(): string {
  const lines: string[] = [];
  lines.push(`# ${siteConfig.name}`);
  lines.push("");
  lines.push(`> ${siteConfig.description}`);
  lines.push("");
  lines.push("## Key Pages");
  lines.push("");
  lines.push(`- [Home](${siteConfig.url}): Main site with latest articles`);
  lines.push(`- [Articles](${buildUrl("/articles")}): Complete article archive`);
  lines.push(`- [Blog](${buildUrl("/blog")}): Blog index`);
  lines.push(`- [Search](${buildUrl("/search")}): Search all content`);
  lines.push(`- [About](${buildUrl("/about")}): About ${siteConfig.name}`);
  lines.push(`- [Contact](${buildUrl("/contact")}): Contact information`);
  lines.push(`- [FAQ](${buildUrl("/faq")}): Frequently asked questions`);
  lines.push("");
  lines.push("## Feeds");
  lines.push("");
  lines.push(`- [RSS Feed](${buildUrl("/feed.xml")}): RSS 2.0 feed`);
  lines.push(`- [Atom Feed](${buildUrl("/atom.xml")}): Atom 1.0 feed`);
  lines.push(`- [JSON Feed](${buildUrl("/feed.json")}): JSON Feed 1.1`);
  lines.push(`- [Sitemap](${buildUrl("/sitemap.xml")}): XML sitemap`);
  lines.push("");
  lines.push("## Optional");
  lines.push("");
  lines.push(
    `- [Full Content Index](${buildUrl("/llms-full.txt")}): Complete article index with descriptions`,
  );
  lines.push("");
  return lines.join("\n");
}
/**
 * Generate the expanded /llms-full.txt content — a comprehensive
 * plain-text index of all published articles with descriptions,
 * categories, tags, and canonical URLs for LLM indexing.
 */
export function generateLlmsFullTxt(
  posts: PostSummary[],
  authors: Map<string, Author>,
  categories: Category[],
  tags: Tag[],
): string {
  const published = posts
    .filter((p) => p.published && !p.noindex)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lines: string[] = [];
  // Header
  lines.push(`# ${siteConfig.name} — Full Content Index`);
  lines.push("");
  lines.push(`> ${siteConfig.description}`);
  lines.push(`> Generated: ${new Date().toISOString()}`);
  lines.push(`> Articles: ${published.length}`);
  lines.push("");
  // Categories
  if (categories.length > 0) {
    lines.push("## Categories");
    lines.push("");
    for (const cat of categories) {
      lines.push(`- ${cat.name}: ${buildUrl(`/category/${cat.slug}`)}`);
    }
    lines.push("");
  }
  // Tags
  if (tags.length > 0) {
    lines.push("## Tags");
    lines.push("");
    for (const tag of tags.slice(0, 30)) {
      lines.push(`- ${tag.name}: ${buildUrl(`/tag/${tag.slug}`)}`);
    }
    lines.push("");
  }
  // Authors
  if (authors.size > 0) {
    lines.push("## Authors");
    lines.push("");
    for (const [, author] of authors) {
      lines.push(`- ${author.name}: ${buildUrl(`/author/${author.slug}`)}`);
    }
    lines.push("");
  }
  // Articles
  lines.push("## Articles");
  lines.push("");
  for (const post of published) {
    const author = authors.get(post.author);
    const url = resolveCanonical(`/blog/${post.slug}`);
    const catName = categoryName(post.category);
    lines.push(`### ${post.title}`);
    lines.push(`- URL: ${url}`);
    lines.push(`- Date: ${post.date}`);
    lines.push(`- Author: ${author?.name ?? siteConfig.defaultAuthor.name}`);
    lines.push(`- Category: ${catName}`);
    if (post.tags.length > 0) {
      lines.push(`- Tags: ${post.tags.map((t) => tagName(t)).join(", ")}`);
    }
    lines.push(`- Description: ${post.description}`);
    lines.push("");
  }
  return lines.join("\n");
}