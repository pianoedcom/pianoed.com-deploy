import { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { tagName, getPostsByTranslationKeyCached } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";
import {
  getPostCached,
  getAuthorCached,
  getAdjacentPosts,
  getRelatedPosts,
} from "@/lib/content";
import { checkSlugRedirect } from "@/lib/content/redirects";
import type { Post, PostSummary, Author } from "@/lib/content";
import { extractHeadings } from "@/lib/content/headings";
import { reportError } from "@/lib/observability";
import Seo from "@/components/layout/Seo";
import JsonLd from "@/components/seo/JsonLd";
import { blogPostingSchema, breadcrumbSchema } from "@/lib/seo";
import Container from "@/components/layout/Container";
import ArticleHeader from "@/components/article/ArticleHeader";
import ArticleHero from "@/components/article/ArticleHero";
import ArticleContent from "@/components/article/ArticleContent";
import AuthorBio from "@/components/article/AuthorBio";
import RelatedArticles from "@/components/article/RelatedArticles";
import ArticleNavigation from "@/components/article/ArticleNavigation";
import TableOfContents, { type TocHeading } from "@/components/article/TableOfContents";
import ReadingProgress from "@/components/article/ReadingProgress";
import ArticleActions from "@/components/article/ArticleActions";
import NewsletterCTA from "@/components/growth/NewsletterCTA";
import ComingSoon from "@/components/article/ComingSoon";
import TranslationBanner from "@/components/i18n/TranslationBanner";
import {
  findTranslations,
  buildHreflangAlternates,
  injectHreflangTags,
  removeHreflangTags,
  type ArticleTranslation,
} from "@/lib/i18n/translations";
import NotFound from "@/app/not-found";
/**
 * Article page — renders a single published post with the full reader
 * experience: hero, header, TOC, reading progress, share controls,
 * author bio, related articles, and prev/next navigation.
 *
 * Fetches content through the content abstraction (never directly from
 * Git APIs). Drafts are never exposed on the public site. Includes
 * BlogPosting and BreadcrumbList JSON-LD structured data.
 */
const ArticlePage = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null | undefined>(undefined);
  const [author, setAuthor] = useState<Author | null>(null);
  const [related, setRelated] = useState<PostSummary[]>([]);
  const [adjacent, setAdjacent] = useState<{
    previous: PostSummary | null;
    next: PostSummary | null;
  }>({ previous: null, next: null });
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [translations, setTranslations] = useState<ArticleTranslation[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const articleRef = useRef<HTMLElement>(null);
  // Check for a permanent redirect before fetching content. If this slug
  // has been renamed or aliased, navigate to the new URL with a replace
  // so the browser history and canonical URL point to the destination.
  useEffect(() => {
    const redirectSlug = checkSlugRedirect(slug);
    if (redirectSlug && redirectSlug !== slug) {
      navigate(`/blog/${redirectSlug}`, { replace: true });
    }
  }, [slug, navigate]);
  // Reset window scroll to top when opening an article or switching between articles
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [slug]);
  // Fetch the post, author, related posts, and adjacent posts for nav.
  // Errors are caught and reported — the user sees a graceful error state
  // instead of a blank page or stack trace.
  useEffect(() => {
    let cancelled = false;
    setFetchError(null);
    getPostCached(slug)
      .then(async (p) => {
        if (cancelled) return;
        setPost(p);
        if (p) {
          const articleLocale = p.locale || "en";
          const [a, rel, adj] = await Promise.all([
            getAuthorCached(p.author),
            getRelatedPosts(p, 3, articleLocale),
            getAdjacentPosts(p.slug, articleLocale),
          ]);
          if (cancelled) return;
          setAuthor(a);
          setRelated(rel);
          setAdjacent(adj);
          // Fetch translations if the article has a translationKey
          if (p.translationKey) {
            try {
              const translationPosts = await getPostsByTranslationKeyCached(p.translationKey);
              if (cancelled) return;
              const found = findTranslations(p.slug, translationPosts);
              setTranslations(found);
              // Inject hreflang tags
              const alternates = buildHreflangAlternates(found, siteConfig.url);
              injectHreflangTags(alternates);
            } catch {
              // Translation fetch failed — non-critical, continue without banner
            }
          } else {
            setTranslations([]);
          }
        }
      })
      .catch((err) => {
        if (cancelled) return;
        const userMsg = reportError(err, undefined, {
          boundary: "article-fetch",
          slug,
        });
        setPost(null);
        setFetchError(userMsg);
      });
    return () => {
      cancelled = true;
      removeHreflangTags();
    };
  }, [slug]);
  // Extract headings from the rendered article after MDX compiles.
  // Uses a MutationObserver instead of polling — fires as soon as the
  // MDX renderer injects heading elements into the DOM.
  useEffect(() => {
    if (!post || !articleRef.current) return;
    const container = articleRef.current;
    let found = extractHeadings(container);
    if (found.length > 0) {
      setHeadings(found);
      return;
    }
    const observer = new MutationObserver(() => {
      found = extractHeadings(container);
      if (found.length > 0) {
        setHeadings(found);
        observer.disconnect();
      }
    });
    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [post]);
  // Loading state
  if (post === undefined) {
    return (
      <Container className="py-24" width="article">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-24 rounded bg-muted" />
          <div className="h-10 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
          <div className="mt-8 space-y-3">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
          </div>
        </div>
      </Container>
    );
  }
  // Not found — render the 404 page (or error state if fetch failed)
  if (post === null) {
    if (fetchError) {
      return (
        <Container className="py-24" width="article">
          <div className="mx-auto max-w-md text-center">
            <p className="eyebrow mb-3">Error</p>
            <h1 className="display-heading mb-3 text-3xl text-foreground">Content unavailable</h1>
            <p className="mb-8 text-muted-foreground">{fetchError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Try again
            </button>
          </div>
        </Container>
      );
    }
    return <NotFound />;
  }
  // Draft or future-dated article — render a "Coming Soon" view instead of 404.
  if (!post.published || post.status !== "published") {
    return (
      <>
        <Seo
          title={post.title}
          description={post.description}
          path={`/blog/${post.slug}`}
          noindex
        />
        <ComingSoon post={post} />
      </>
    );
  }
  const { previous: previousPost, next: nextPost } = adjacent;
  return (
    <>
      <Seo
        title={post.title}
        description={post.description}
        path={`/blog/${post.slug}`}
        image={post.image}
        article
        publishedAt={post.date}
        modifiedAt={post.updated}
        author={author?.name}
        canonicalUrl={post.canonicalUrl}
        noindex={post.noindex}
        tags={post.tags}
        section={post.category}
      />
      <JsonLd schema={blogPostingSchema(post, author)} id="blogposting" />
      <JsonLd
        schema={breadcrumbSchema([
          { label: "Home", href: "/" },
          { label: "Articles", href: "/blog" },
          { label: post.title },
        ])}
        id="breadcrumb"
      />
      <ReadingProgress />
      <article ref={articleRef} className="py-12 sm:py-16">
        <Container width="default">
          {/* Back link */}
          <Link
            to="/articles"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All articles
          </Link>
          {/* Desktop two-column: TOC sidebar + content */}
          <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-12">
            {/* TOC sidebar (desktop sticky) */}
            <aside className="hidden lg:block">
              {headings.length >= 2 ? (
                <div className="sticky top-24">
                  <TableOfContents headings={headings} />
                </div>
              ) : null}
            </aside>
            {/* Main article column */}
            <div className="mx-auto w-full max-w-article">
              {/* TOC (mobile, collapsible) */}
              <div className="lg:hidden">
                <TableOfContents headings={headings} />
              </div>
              {translations.length > 1 && <TranslationBanner translations={translations} />}
              <ArticleHeader post={post} author={author} />
              <ArticleHero post={post} />
              <ArticleContent body={post.body} slug={post.slug} />
              {/* Tags */}
              {post.tags.length > 0 ? (
                <div className="mt-8 flex flex-wrap items-center gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/tag/${tag}`}
                      className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {tagName(tag)}
                    </Link>
                  ))}
                </div>
              ) : null}
              {/* Share controls */}
              <div className="mt-8 border-t border-border pt-6">
                <ArticleActions
                  slug={post.slug}
                  title={post.title}
                  description={post.description}
                />
              </div>
              {/* Author bio */}
              {author ? <AuthorBio author={author} /> : null}
              {/* Prev / next navigation */}
              <ArticleNavigation previous={previousPost} next={nextPost} />
              {/* Related articles */}
              <RelatedArticles posts={related} category={post.category} />
              {/* Newsletter CTA */}
              <div className="mt-12">
                <NewsletterCTA placement="article-footer" />
              </div>
            </div>
          </div>
        </Container>
      </article>
    </>
  );
};
export default ArticlePage;