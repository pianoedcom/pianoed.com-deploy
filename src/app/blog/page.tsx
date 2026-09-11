import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Seo from "@/components/layout/Seo";
import Container from "@/components/layout/Container";
import PostList from "@/components/content/PostList";
import Pagination from "@/components/content/Pagination";
import Breadcrumbs from "@/components/content/Breadcrumbs";
import { listPostsCached } from "@/lib/content";
import type { PostSummary } from "@/lib/content";
import { paginate, slicePage, parsePageParam } from "@/lib/content/pagination";
import { useI18n } from "@/lib/i18n/context";
/**
 * Blog index — paginated list of all published articles.
 *
 * Uses URL-based pagination (?page=N) so older content is discoverable
 * without infinite scroll. Each page has unique SEO metadata and a
 * canonical URL.
 */
const BlogPage = () => {
  const { locale } = useI18n();
  const [searchParams] = useSearchParams();
  const page = parsePageParam(searchParams.get("page"));
  const [posts, setPosts] = useState<PostSummary[] | null>(null);
  useEffect(() => {
    listPostsCached({ locale }).then(setPosts);
  }, [locale]);
  if (posts === null) {
    return (
      <Container className="py-12 sm:py-16" width="default">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Articles" }]} />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="aspect-[16/9] rounded-lg bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
            </div>
          ))}
        </div>
      </Container>
    );
  }
  const pagination = paginate({ total: posts.length, page });
  const pagePosts = slicePage(posts, pagination);
  const seoTitle = pagination.page > 1 ? `Articles — Page ${pagination.page}` : "Articles";
  const seoDescription =
    pagination.page > 1
      ? `Browse all articles on Inkwell — page ${pagination.page} of ${pagination.totalPages}.`
      : "Browse all articles on Inkwell — software craft, design, and the web platform.";
  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={pagination.page > 1 ? `/blog?page=${pagination.page}` : "/blog"}
      />
      <Container className="py-12 sm:py-16" width="default">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Articles" }]} />
        <header className="mb-10">
          <p className="eyebrow mb-3">All Articles</p>
          <h1 className="display-heading mb-4 text-4xl text-foreground sm:text-5xl">The Archive</h1>
          <p className="text-lg text-muted-foreground">
            {pagination.total} {pagination.total === 1 ? "article" : "articles"} published.
          </p>
        </header>
        <PostList posts={pagePosts} layout="grid" />
        <Pagination pagination={pagination} basePath="/blog" />
      </Container>
    </>
  );
};
export default BlogPage;