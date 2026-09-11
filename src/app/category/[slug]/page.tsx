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
import {
  getPostsByCategoryCached,
  getAllCategoriesCached,
  categoryName,
  isValidCategory,
} from "@/lib/content";
import type { PostSummary, Category } from "@/lib/content";
import { paginate, slicePage, parsePageParam } from "@/lib/content/pagination";
import { useI18n } from "@/lib/i18n/context";
/**
 * Category listing page — shows all published posts in a given category.
 *
 * Validates the category slug against the known category list. Invalid
 * categories return a 404. Empty categories render a helpful message
 * rather than a blank page.
 */
const CategoryPage = () => {
  const { locale } = useI18n();
  const { slug = "" } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const page = parsePageParam(searchParams.get("page"));
  const [posts, setPosts] = useState<PostSummary[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const valid = isValidCategory(slug);
  useEffect(() => {
    if (!valid) return;
    Promise.all([getPostsByCategoryCached(slug, { locale }), getAllCategoriesCached()]).then(
      ([p, c]) => {
        setPosts(p);
        setCategories(c);
      },
    );
  }, [slug, valid, locale]);
  // Invalid category — 404
  if (!valid) return <NotFound />;
  if (posts === null || categories === null) {
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
  const cat = categories.find((c) => c.slug === slug);
  const displayName = cat?.name ?? categoryName(slug);
  const description = cat?.description;
  const pagination = paginate({ total: posts.length, page });
  const pagePosts = slicePage(posts, pagination);
  const seoTitle = pagination.page > 1 ? `${displayName} — Page ${pagination.page}` : displayName;
  const seoDescription = `Articles in the ${displayName} category on ${siteConfig.name}.`;
  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={
          pagination.page > 1 ? `/category/${slug}?page=${pagination.page}` : `/category/${slug}`
        }
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
        schema={collectionPageSchema(displayName, seoDescription, `/category/${slug}`, posts)}
        id="collectionpage"
      />
      <Container className="py-12 sm:py-16" width="default">
        <TaxonomyHeader
          eyebrow="Category"
          title={displayName}
          description={seoDescription}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Articles", href: "/articles" },
            { label: displayName },
          ]}
        />
        {pagePosts.length > 0 ? (
          <>
            <PostList posts={pagePosts} layout="grid" />
            <Pagination pagination={pagination} basePath={`/category/${slug}`} />
          </>
        ) : (
          <p className="text-muted-foreground">No articles in this category yet.</p>
        )}
      </Container>
    </>
  );
};
export default CategoryPage;