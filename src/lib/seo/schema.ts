/**
 * JSON-LD structured data generators.
 *
 * Produces typed schema.org objects for:
 *   - WebSite
 *   - Organization
 *   - Person (author)
 *   - BlogPosting
 *   - BreadcrumbList
 *
 * All generators return plain objects that are safe to serialize via
 * `JSON.stringify`. String values are escaped by the JSON-LD component
 * before injection — we never blindly inject raw content.
 */
import { siteConfig } from "@/lib/site-config";
import { buildUrl } from "./metadata";
import { resolveCanonical } from "./canonical";
import type { Post, PostSummary, Author } from "@/lib/content/types";
/** Schema.org WebSite entity. */
export function websiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: { "@id": `${siteConfig.url}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
/** Schema.org Organization entity. */
export function organizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "WebSite"],
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}/og/default.png`,
    },
    sameAs: [
      siteConfig.social.twitter,
      siteConfig.social.github,
      siteConfig.social.linkedin,
    ].filter(Boolean),
  };
}
/** Schema.org Person entity for an author. */
export function personSchema(author: Author): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteConfig.url}/author/${author.slug}#person`,
    name: author.name,
    url: `${siteConfig.url}/author/${author.slug}`,
    description: author.bio,
  };
  if (author.avatar) {
    schema.image = author.avatar;
  }
  const sameAs: string[] = [];
  if (author.social?.twitter) sameAs.push(author.social.twitter);
  if (author.social?.github) sameAs.push(author.social.github);
  if (author.social?.linkedin) sameAs.push(author.social.linkedin);
  if (author.social?.website) sameAs.push(author.social.website);
  if (sameAs.length > 0) {
    schema.sameAs = sameAs;
  }
  return schema;
}
/** Schema.org BlogPosting entity for an article. */
export function blogPostingSchema(post: Post, author: Author | null): Record<string, unknown> {
  const canonical = resolveCanonical(`/blog/${post.slug}`, post.canonicalUrl);
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${canonical}#blogposting`,
    headline: post.title,
    description: post.description,
    url: canonical,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    articleSection: post.category,
  };
  if (post.image) {
    schema.image = {
      "@type": "ImageObject",
      url: post.image,
      ...(post.imageAlt ? { caption: post.imageAlt } : {}),
    };
  } else {
    schema.image = siteConfig.defaultOgImage;
  }
  if (post.tags.length > 0) {
    schema.keywords = post.tags.join(", ");
  }
  if (author) {
    schema.author = {
      "@type": "Person",
      "@id": `${siteConfig.url}/author/${author.slug}#person`,
      name: author.name,
    };
    schema.publisher = {
      "@id": `${siteConfig.url}/#organization`,
    };
  } else {
    schema.author = {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.defaultAuthor.name,
    };
    schema.publisher = { "@id": `${siteConfig.url}/#organization` };
  }
  return schema;
}
/** Schema.org BreadcrumbList entity. */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}
export function breadcrumbSchema(items: BreadcrumbItem[]): Record<string, unknown> {
  const itemList = items.map((item, index) => {
    const entry: Record<string, unknown> = {
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
    };
    if (item.href) {
      entry.item = buildUrl(item.href);
    }
    return entry;
  });
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: itemList,
  };
}
/** Schema.org CollectionPage for taxonomy listing pages. */
export function collectionPageSchema(
  title: string,
  description: string,
  path: string,
  posts: PostSummary[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: buildUrl(path),
    isPartOf: { "@id": `${siteConfig.url}/#website` },
    hasPart: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: buildUrl(`/blog/${p.slug}`),
      datePublished: p.date,
    })),
  };
}
/** FAQ entry for FAQPage schema. */
export interface FaqEntry {
  question: string;
  answer: string;
}
/** Schema.org FAQPage entity. */
export function faqPageSchema(faqs: FaqEntry[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}
/** How-to step for HowTo schema. */
export interface HowToStep {
  name: string;
  text: string;
}
/** Schema.org HowTo entity. */
export function howToSchema(steps: HowToStep[], totalTime?: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    step: steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.name,
      text: step.text,
    })),
    ...(totalTime ? { totalTime } : {}),
  };
}
/** Schema.org Article entity (alternative to BlogPosting). */
export function articleSchema(post: Post, author: Author | null): Record<string, unknown> {
  const schema = blogPostingSchema(post, author);
  return { ...schema, "@type": "Article" };
}