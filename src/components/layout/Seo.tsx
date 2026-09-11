import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { siteConfig } from "@/lib/site-config";
import {
  buildMetaTags,
  buildTitle,
  resolveCanonical,
  type MetaTag,
  type PageMetadata,
} from "@/lib/seo";
interface SeoProps {
  title: string;
  description: string;
  /** Site-relative path. Defaults to the current location. */
  path?: string;
  image?: string;
  article?: boolean;
  publishedAt?: string;
  modifiedAt?: string;
  author?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  locale?: string;
  tags?: string[];
  section?: string;
}
/**
 * Imperatively updates document head metadata for the current route.
 * In a Vite SPA there is no server render, so we manage <head> at runtime.
 *
 * Supports: title template, canonical URLs (with override), Open Graph,
 * Twitter/X cards, article metadata, and robots/noindex directives.
 */
const Seo = ({
  title,
  description,
  path,
  image,
  article,
  publishedAt,
  modifiedAt,
  author,
  canonicalUrl,
  noindex,
  locale,
  tags,
  section,
}: SeoProps) => {
  const location = useLocation();
  const resolvedPath = path ?? location.pathname;
  useEffect(() => {
    const fullTitle = buildTitle(title);
    document.title = fullTitle;
    const meta: PageMetadata = {
      title,
      description,
      path: resolvedPath,
      image,
      article,
      publishedAt,
      modifiedAt,
      author,
      canonicalUrl,
      noindex,
      locale,
      tags,
      section,
    };
    const tagsArray = buildMetaTags(meta);
    tagsArray.forEach((tag: MetaTag) => {
      const attr = tag.name ? "name" : "property";
      const key = tag.name ?? tag.property ?? "";
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", tag.content);
    });
    // Remove stale article:tag entries from previous pages
    const oldTagMetas = document.head.querySelectorAll<HTMLMetaElement>(
      'meta[property="article:tag"]',
    );
    oldTagMetas.forEach((el) => {
      if (!tagsArray.some((t) => t.property === "article:tag" && t.content === el.content)) {
        el.remove();
      }
    });
    // Canonical link
    const canonicalUrlResolved = resolveCanonical(resolvedPath, canonicalUrl);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrlResolved;
    // Robots / noindex
    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    robots.content = noindex ? "noindex, nofollow" : "index, follow";
  }, [
    title,
    description,
    resolvedPath,
    image,
    article,
    publishedAt,
    modifiedAt,
    author,
    canonicalUrl,
    noindex,
    locale,
    tags,
    section,
  ]);
  return null;
};
export default Seo;