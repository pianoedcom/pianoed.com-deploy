#!/usr/bin/env node
/**
 * Static SEO and Feed generation orchestrator.
 *
 * Runs during the build phase (`prebuild`) to generate static SEO assets directly into `public/`:
 * - /sitemap.xml
 * - /feed.xml (RSS 2.0)
 * - /atom.xml (Atom 1.0)
 * - /feed.json (JSON Feed 1.1)
 * - /llms.txt
 * - /llms-full.txt
 * - /robots.txt
 *
 * Applies strict publish-date guards so scheduled and draft posts are excluded.
 */

import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import matter from "gray-matter";

import { buildSitemapEntries, buildSitemapXml } from "../../src/lib/seo/sitemap";
import { buildFeedItems, feedToXml } from "../../src/lib/seo/feed";
import { atomFeedToXml } from "../../src/lib/seo/atom-feed";
import { buildJsonFeed, jsonFeedToString } from "../../src/lib/seo/json-feed";
import { generateLlmsTxt, generateLlmsFullTxt } from "../../src/lib/seo/llms-txt";
import { generateRobotsTxt } from "../../src/lib/seo/robots";
import { categoryName, tagName } from "../../src/lib/content/frontmatter";
import type { PostSummary, Author, Category, Tag } from "../../src/lib/content/types";

const ROOT_DIR = process.cwd();
const POSTS_DIR = path.resolve(ROOT_DIR, "content/posts");
const AUTHORS_DIR = path.resolve(ROOT_DIR, "content/authors");
const PUBLIC_DIR = path.resolve(ROOT_DIR, "public");

async function main() {
  console.log("[seo] Generating static SEO and feed assets...");

  const now = Date.now();

  // 1. Discover and load authors
  const authorMap = new Map<string, Author>();
  if (existsSync(AUTHORS_DIR)) {
    const authorFiles = await readdir(AUTHORS_DIR);
    for (const file of authorFiles) {
      if (!file.endsWith(".mdx") && !file.endsWith(".md")) continue;
      const slug = file.replace(/\.(mdx|md)$/, "");
      const fullPath = path.join(AUTHORS_DIR, file);
      const raw = await readFile(fullPath, "utf-8");
      const { data } = matter(raw);

      authorMap.set(slug, {
        slug,
        name: String(data.name || slug),
        bio: String(data.bio || ""),
        avatar: String(data.avatar || "/placeholder.svg"),
        role: String(data.role || ""),
        social: data.social || {},
      });
    }
  }

  // 2. Discover and load published posts (with strict date guard)
  const posts: Array<PostSummary & { body: string }> = [];
  if (existsSync(POSTS_DIR)) {
    const postFiles = await readdir(POSTS_DIR);
    for (const file of postFiles) {
      if (!file.endsWith(".mdx") && !file.endsWith(".md")) continue;
      const slug = file.replace(/\.(mdx|md)$/, "");
      const fullPath = path.join(POSTS_DIR, file);
      try {
        const raw = await readFile(fullPath, "utf-8");
        const parsed = matter(raw);
        const data = parsed.data;

        // Check published status
        if (data.published === false) {
          continue;
        }

        // Check date guard (exclude future-dated posts)
        const postDate = new Date(data.date || "");
        if (Number.isNaN(postDate.getTime()) || postDate.getTime() > now) {
          continue;
        }

        const wordsCount = parsed.content.trim().split(/\s+/).filter(Boolean).length;
        const readingTime = Math.max(1, Math.ceil(wordsCount / 200));

        posts.push({
          slug,
          title: String(data.title || slug),
          description: String(data.description || ""),
          date: postDate.toISOString(),
          updated: data.updated ? new Date(data.updated).toISOString() : undefined,
          category: String(data.category || "general"),
          tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
          author: String(data.author || "editorial-team"),
          image: data.image ? String(data.image) : undefined,
          featured: Boolean(data.featured),
          status: "published",
          readingTime,
          wordsCount,
          locale: data.locale ? String(data.locale) : "en",
          published: true,
          noindex: Boolean(data.noindex),
          translationKey: data.translationKey ? String(data.translationKey) : undefined,
          body: parsed.content,
        });
      } catch (err) {
        console.warn(`[seo] Skipping invalid post ${file}:`, err);
      }
    }
  }

  // Sort posts descending by date
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 3. Derive categories and tags from published posts
  const categorySlugs = new Set(posts.map((p) => p.category));
  const categories: Category[] = Array.from(categorySlugs).map((slug) => ({
    slug,
    name: categoryName(slug),
  }));

  const tagCounts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  const tags: Tag[] = Array.from(tagCounts.entries())
    .map(([slug, count]) => ({ slug, name: tagName(slug), count }))
    .sort((a, b) => b.count - a.count);

  const authorsList = Array.from(authorMap.values());

  // 4. Ensure public directory exists
  await mkdir(PUBLIC_DIR, { recursive: true });

  // 5. Generate and write sitemap.xml
  const sitemapEntries = buildSitemapEntries({
    posts,
    categories,
    tags,
    authors: authorsList,
  });
  const sitemapXml = buildSitemapXml(sitemapEntries);
  await writeFile(path.join(PUBLIC_DIR, "sitemap.xml"), sitemapXml, "utf-8");

  // 6. Generate and write feeds
  const feedItems = buildFeedItems(posts, authorMap);
  const rssXml = feedToXml(feedItems);
  await writeFile(path.join(PUBLIC_DIR, "feed.xml"), rssXml, "utf-8");

  const atomXml = atomFeedToXml(feedItems);
  await writeFile(path.join(PUBLIC_DIR, "atom.xml"), atomXml, "utf-8");

  const jsonFeed = buildJsonFeed(posts, authorMap);
  await writeFile(path.join(PUBLIC_DIR, "feed.json"), jsonFeedToString(jsonFeed), "utf-8");

  // 7. Generate and write LLM text endpoints
  const llmsTxt = generateLlmsTxt();
  await writeFile(path.join(PUBLIC_DIR, "llms.txt"), llmsTxt, "utf-8");

  const llmsFullTxt = generateLlmsFullTxt(posts, authorMap, categories, tags);
  await writeFile(path.join(PUBLIC_DIR, "llms-full.txt"), llmsFullTxt, "utf-8");

  // 8. Generate and write robots.txt
  const robotsTxt = generateRobotsTxt();
  await writeFile(path.join(PUBLIC_DIR, "robots.txt"), robotsTxt, "utf-8");

  console.log(
    `[seo] Successfully generated static SEO assets for ${posts.length} published posts:`
  );
  console.log("  ✓ public/sitemap.xml");
  console.log("  ✓ public/feed.xml");
  console.log("  ✓ public/atom.xml");
  console.log("  ✓ public/feed.json");
  console.log("  ✓ public/llms.txt");
  console.log("  ✓ public/llms-full.txt");
  console.log("  ✓ public/robots.txt");
}

main().catch((err) => {
  console.error("[seo] Failed to generate static SEO assets:", err);
  process.exit(1);
});
