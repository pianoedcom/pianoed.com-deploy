/**
 * Per-article translation utilities.
 *
 * Supports selective, article-level translations. Articles can declare a
 * `translationKey` in their frontmatter — all articles sharing the same key
 * are considered translations of each other, each with their own `locale`.
 *
 * Example frontmatter:
 *   ---
 *   title: "How to Choose a Domain Name"
 *   slug: "how-to-choose-domain-name"
 *   locale: en
 *   translationKey: how-to-choose-domain-name
 *   ---
 *
 * A Hindi version would have:
 *   ---
 *   title: "डोमेन नाम कैसे चुनें"
 *   slug: "how-to-choose-domain-name-hi"
 *   locale: hi
 *   translationKey: how-to-choose-domain-name
 *   ---
 */
import type { PostSummary } from "@/lib/content/types";
import { DEFAULT_LOCALE, getLocale } from "./config";
export interface ArticleTranslation {
  /** Locale code (e.g. "en", "hi", "es"). */
  locale: string;
  /** Display name of the locale (e.g. "English", "हिन्दी"). */
  localeName: string;
  /** Native name of the locale for display. */
  nativeName: string;
  /** Slug of the translated article. */
  slug: string;
  /** Whether this is the currently-viewed version. */
  isCurrent: boolean;
}
/**
 * Find all translations of an article from a list of posts sharing the
 * same translationKey.
 *
 * @param currentSlug - The slug of the currently-viewed article.
 * @param translationPosts - All posts sharing the same translationKey.
 */
export function findTranslations(
  currentSlug: string,
  translationPosts: PostSummary[],
): ArticleTranslation[] {
  return translationPosts
    .map((post) => {
      const locale = post.locale ?? DEFAULT_LOCALE;
      const config = getLocale(locale);
      return {
        locale,
        localeName: config?.name ?? locale,
        nativeName: config?.nativeName ?? locale,
        slug: post.slug,
        isCurrent: post.slug === currentSlug,
      };
    })
    .sort((a, b) => {
      if (a.locale === "en") return -1;
      if (b.locale === "en") return 1;
      return a.locale.localeCompare(b.locale);
    });
}
/**
 * Build hreflang alternate links for an article.
 *
 * Returns an array of { hreflang, href } pairs for all available translations
 * of the article, plus an x-default entry.
 *
 * @param translations - The translations found for the article.
 * @param siteUrl - The base site URL (no trailing slash).
 * @param defaultPath - The path of the default-locale version (e.g. "/blog/my-post").
 */
export function buildHreflangAlternates(
  translations: ArticleTranslation[],
  siteUrl: string,
): Array<{ hreflang: string; href: string }> {
  const alternates: Array<{ hreflang: string; href: string }> = [];
  // Find the default locale version for x-default
  const defaultVersion = translations.find((t) => t.locale === DEFAULT_LOCALE);
  if (defaultVersion) {
    alternates.push({
      hreflang: "x-default",
      href: `${siteUrl}/blog/${defaultVersion.slug}`,
    });
  }
  // Add each locale version
  for (const t of translations) {
    const path = t.locale === DEFAULT_LOCALE ? `/blog/${t.slug}` : `/${t.locale}/blog/${t.slug}`;
    alternates.push({
      hreflang: t.locale,
      href: `${siteUrl}${path}`,
    });
  }
  return alternates;
}
/**
 * Inject hreflang <link> tags into the document head.
 * Removes any previously-injected hreflang tags first.
 */
export function injectHreflangTags(alternates: Array<{ hreflang: string; href: string }>): void {
  // Remove existing hreflang tags
  const existing = document.head.querySelectorAll('link[rel="alternate"][hreflang]');
  existing.forEach((el) => el.remove());
  // Inject new ones
  for (const alt of alternates) {
    const link = document.createElement("link");
    link.rel = "alternate";
    link.setAttribute("hreflang", alt.hreflang);
    link.href = alt.href;
    document.head.appendChild(link);
  }
}
/**
 * Remove all injected hreflang tags from the document head.
 */
export function removeHreflangTags(): void {
  const existing = document.head.querySelectorAll('link[rel="alternate"][hreflang]');
  existing.forEach((el) => el.remove());
}