#!/usr/bin/env node
/**
 * Generate a static article index for crawler/SEO fallback.
 *
 * Reads all published MDX posts, extracts title, description, date, category,
 * tags, and slug, then writes a JSON file to public/article-index.json.
 *
 * This file is used by the <noscript> fallback to provide crawlers and
 * LLM-based search engines with article metadata without requiring JavaScript.
 *
 * Usage:
 *   npx tsx scripts/extract-noscript-content/script.ts
 */
import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import matter from "gray-matter";
const POSTS_DIR = path.resolve(process.cwd(), "content/posts");
const OUTPUT_FILE = path.resolve(process.cwd(), "public/article-index.json");
interface ArticleEntry {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  author: string;
  url: string;
}
async function main() {
  if (!existsSync(POSTS_DIR)) {
    console.log("[extract-noscript] No posts directory found, skipping.");
    process.exit(0);
  }
  const files = await readdir(POSTS_DIR);
  const mdxFiles = files.filter(
    (f) => f.endsWith(".mdx") || f.endsWith(".md"),
  );
  const entries: ArticleEntry[] = [];
  for (const file of mdxFiles) {
    const filePath = path.join(POSTS_DIR, file);
    const raw = await readFile(filePath, "utf-8");
    try {
      const parsed = matter(raw);
      const fm = parsed.data as Record<string, unknown>;
      // Only include published posts
      if (fm.published === false) continue;
      const slug = (fm.slug as string) ?? file.replace(/\.(mdx|md)$/, "");
      entries.push({
        slug,
        title: String(fm.title ?? slug),
        description: String(fm.description ?? ""),
        date: String(fm.date ?? ""),
        category: String(fm.category ?? ""),
        tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
        author: String(fm.author ?? ""),
        url: `/blog/${slug}`,
      });
    } catch (err) {
      console.error(`[extract-noscript] Failed to parse ${file}:`, err);
    }
  }
  // Sort by date descending
  entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  // Ensure public directory exists
  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, JSON.stringify(entries, null, 2), "utf-8");
  console.log(
    `[extract-noscript] Wrote ${entries.length} articles to ${path.relative(process.cwd(), OUTPUT_FILE)}`,
  );
}
main().catch((err) => {
  console.error("[extract-noscript] Fatal error:", err);
  process.exit(1);
});