import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Seo from "@/components/layout/Seo";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema, personSchema } from "@/lib/seo";
import Container from "@/components/layout/Container";
import PostList from "@/components/content/PostList";
import Pagination from "@/components/content/Pagination";
import TaxonomyHeader from "@/components/content/TaxonomyHeader";
import NotFound from "@/app/not-found";
import { getAuthorCached, getAllAuthorsCached, listPostsCached } from "@/lib/content";
import type { PostSummary, Author } from "@/lib/content";
import { paginate, slicePage, parsePageParam } from "@/lib/content/pagination";
/**
 * Author page — shows all published posts by a given author.
 *
 * Validates the author slug against the loaded author list. Unknown
 * authors return a 404. Displays the author's bio and avatar.
 */
const AuthorPage = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const page = parsePageParam(searchParams.get("page"));
  const [author, setAuthor] = useState<Author | null | undefined>(undefined);
  const [posts, setPosts] = useState<PostSummary[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [a, allAuthors, allPosts] = await Promise.all([
        getAuthorCached(slug),
        getAllAuthorsCached(),
        listPostsCached(),
      ]);
      if (cancelled) return;
      // Check if author slug exists
      const exists = allAuthors.some((au) => au.slug === slug);
      if (!exists) {
        setAuthor(null);
        return;
      }
      setAuthor(a);
      setPosts(allPosts.filter((p) => p.author === slug));
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);
  // Author not found — 404
  if (author === null) return <NotFound />;
  if (author === undefined || posts === null) {
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
  const pagination = paginate({ total: posts.length, page });
  const pagePosts = slicePage(posts, pagination);
  const seoTitle = pagination.page > 1 ? `${author.name} — Page ${pagination.page}` : author.name;
  const seoDescription = author.bio || `Articles by ${author.name} on Inkwell.`;
  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={pagination.page > 1 ? `/author/${slug}?page=${pagination.page}` : `/author/${slug}`}
      />
      <JsonLd schema={personSchema(author)} id="person" />
      <JsonLd
        schema={breadcrumbSchema([
          { label: "Home", href: "/" },
          { label: "Articles", href: "/blog" },
          { label: author.name },
        ])}
        id="breadcrumb"
      />
      <Container className="py-12 sm:py-16" width="default">
        <TaxonomyHeader
          eyebrow="Author"
          title={author.name}
          description={author.bio}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Articles", href: "/blog" },
            { label: author.name },
          ]}
        >
          {author.avatar ? (
            <div className="mt-6 flex items-center gap-4">
              <img
                src={author.avatar}
                alt={author.name}
                className="h-16 w-16 rounded-full border border-border object-cover"
              />
              {author.social ? (
                <div className="flex flex-wrap gap-3 text-sm">
                  {author.social.twitter ? (
                    <a
                      href={author.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                    >
                      Twitter
                    </a>
                  ) : null}
                  {author.social.github ? (
                    <a
                      href={author.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                    >
                      GitHub
                    </a>
                  ) : null}
                  {author.social.linkedin ? (
                    <a
                      href={author.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                    >
                      LinkedIn
                    </a>
                  ) : null}
                  {author.social.website ? (
                    <a
                      href={author.social.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                    >
                      Website
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </TaxonomyHeader>
        {pagePosts.length > 0 ? (
          <>
            <PostList posts={pagePosts} layout="grid" />
            <Pagination pagination={pagination} basePath={`/author/${slug}`} />
          </>
        ) : (
          <p className="text-muted-foreground">This author hasn't published any articles yet.</p>
        )}
      </Container>
    </>
  );
};
export default AuthorPage;