import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Seo from "@/components/layout/Seo";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/seo";
import Container from "@/components/layout/Container";
import PostList from "@/components/content/PostList";
import Pagination from "@/components/content/Pagination";
import TaxonomyHeader from "@/components/content/TaxonomyHeader";
import NotFound from "@/app/not-found";
import { siteConfig } from "@/lib/site-config";
import { getPostsByTagCached, getAllTagsCached, tagName, isValidTag } from "@/lib/content";
import type { PostSummary, Tag } from "@/lib/content";
import { paginate, slicePage, parsePageParam } from "@/lib/content/pagination";
import { useI18n } from "@/lib/i18n/context";
/**
 * Tag listing page — shows all published posts with a given tag.
 *
 * Validates the tag slug against the known tag list. Invalid tags
 * return a 404. Tags with zero published posts render a helpful
 * message — this prevents thousands of thin tag pages.
 */
const TagPage = () => {
  const { locale } = useI18n();
  const { slug = "" } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const page = parsePageParam(searchParams.get("page"));
  const [posts, setPosts] = useState<PostSummary[] | null>(null);
  const [tags, setTags] = useState<Tag[] | null>(null);
  const valid = isValidTag(slug);
  useEffect(() => {
    if (!valid) return;
    Promise.all([getPostsByTagCached(slug, { locale }), getAllTagsCached()]).then(([p, t]) => {
      setPosts(p);
      setTags(t);
    });
  }, [slug, valid, locale]);
  // Invalid tag — 404
  if (!valid) return <NotFound />;
  if (posts === null || tags === null) {
    return (
      <Container className="py-12 sm:py-16" width="default">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-40 rounded bg-muted" />
          <div className="h-10 w-64 rounded bg-muted" />
          <div className="h-4 w-80 rounded bg-muted" />
        </div>
      </Container>
    );
  }
  const tag = tags.find((t) => t.slug === slug);
  const displayName = tag?.name ?? tagName(slug);
  const postCount = tag?.count ?? posts.length;
  // Tags with zero posts — don't render a thin page.
  if (postCount === 0 || posts.length === 0) {
    return (
      <>
        <Seo
          title={displayName}
          description={`Articles tagged "${displayName}" on ${siteConfig.name}.`}
          path={`/tag/${slug}`}
        />
        <Container className="py-12 sm:py-16" width="default">
          <TaxonomyHeader
            eyebrow="Tag"
            title={displayName}
            description={`Articles tagged "${displayName}" on ${siteConfig.name}.`}
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "Articles", href: "/articles" },
              { label: displayName },
            ]}
          />
          <p className="text-muted-foreground">No articles have been tagged "{displayName}" yet.</p>
        </Container>
      </>
    );
  }
  const pagination = paginate({ total: posts.length, page });
  const pagePosts = slicePage(posts, pagination);
  const seoTitle = pagination.page > 1 ? `${displayName} — Page ${pagination.page}` : displayName;
  const seoDescription = `Articles tagged "${displayName}" on ${siteConfig.name} — ${postCount} ${postCount === 1 ? "article" : "articles"}.`;
  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={pagination.page > 1 ? `/tag/${slug}?page=${pagination.page}` : `/tag/${slug}`}
      />
      <JsonLd
        schema={breadcrumbSchema([
          { label: "Home", href: "/" },
          { label: "Articles", href: "/articles" },
          { label: displayName },
        ])}
        id="breadcrumb"
      />
      <JsonLd
        schema={collectionPageSchema(displayName, seoDescription, `/tag/${slug}`, posts)}
        id="collectionpage"
      />
      <Container className="py-12 sm:py-16" width="default">
        <TaxonomyHeader
          eyebrow="Tag"
          title={displayName}
          description={seoDescription}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Articles", href: "/articles" },
            { label: displayName },
          ]}
        />
        <PostList posts={pagePosts} layout="grid" />
        <Pagination pagination={pagination} basePath={`/tag/${slug}`} />
      </Container>
    </>
  );
};
export default TagPage;