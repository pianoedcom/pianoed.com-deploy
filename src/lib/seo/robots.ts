/**
 * Robots.txt generator.
 *
 * Generates a robots.txt that:
 *   - Allows all crawlers to access public content
 *   - Blocks private/internal routes (/search, /api)
 *   - References the sitemap URL
 *   - Does not accidentally block production content
 */
import { siteConfig } from "@/lib/site-config";
/** Paths that should not be indexed. */
const DISALLOWED_PATHS = ["/search", "/api", "/contact"];
/** Generate the robots.txt content. */
export function generateRobotsTxt(): string {
  const lines: string[] = [];
  // Allow all user agents by default
  lines.push("User-agent: *");
  lines.push("Allow: /");
  for (const path of DISALLOWED_PATHS) {
    lines.push(`Disallow: ${path}`);
  }
  lines.push("");
  // Sitemap reference
  lines.push(`Sitemap: ${siteConfig.url}/sitemap.xml`);
  return lines.join("\n");
}