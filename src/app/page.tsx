import { useEffect, useState } from "react";
import {
  getHomepageFeaturedCached,
  getHomepageLatestCached,
  getHomepageTickerCached,
  getHomepageTrendingCached,
  getHomepageCategoryCached,
  getAllCategoriesCached,
  getAllAuthorsCached,
  getHomepageAuthorPostsCached,
} from "@/lib/content";
import type { PostSummary, Category, Author } from "@/lib/content";
import Container from "@/components/layout/Container";
import PostCard from "@/components/content/PostCard";
import NewsletterCTA from "@/components/growth/NewsletterCTA";
import {
  TrendingTicker,
  HeroEditorialGrid,
  CategorySectionBlock,
  TrendingSidebar,
  FeaturedAuthorSpotlight,
  LandingHero,
} from "@/components/home";
import { useI18n } from "@/lib/i18n/context";
/**
 * Homepage — "Fast-Paced Newsroom" editorial layout.
 *
 * Layout: auto-scrolling ticker → asymmetric hero grid →
 * latest grid + sticky trending sidebar → category strips →
 * featured author spotlight → newsletter CTA.
 */
const Home = () => {
  const { t, locale } = useI18n();
  const [tickerPosts, setTickerPosts] = useState<PostSummary[] | null>(null);
  const [featured, setFeatured] = useState<PostSummary[] | null>(null);
  const [latest, setLatest] = useState<PostSummary[] | null>(null);
  const [trending, setTrending] = useState<PostSummary[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [categoryPosts, setCategoryPosts] = useState<Record<string, PostSummary[]>>({});
  const [authors, setAuthors] = useState<Author[] | null>(null);
  const [authorPosts, setAuthorPosts] = useState<PostSummary[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Round 1: Fetch all primary data in parallel using current active locale
      const [ticker, feat, lat, trend, cats, auths] = await Promise.all([
        getHomepageTickerCached(5, locale),
        getHomepageFeaturedCached(1, locale),
        getHomepageLatestCached(12, locale),
        getHomepageTrendingCached(5, locale),
        getAllCategoriesCached(),
        getAllAuthorsCached(),
      ]);
      // Round 2: Fetch category posts and author posts in the same parallel batch
      // (no need to wait for state update — use the resolved values directly)
      const [catResults, authorPosts] = await Promise.all([
        Promise.all(cats.map((cat) => getHomepageCategoryCached(cat.slug, 4, locale))),
        auths.length > 0
          ? getHomepageAuthorPostsCached(auths[0].slug, 3, locale)
          : Promise.resolve([]),
      ]);
      if (cancelled) return;
      // Set all state in one batch to minimize re-renders
      const categoryMap: Record<string, PostSummary[]> = {};
      cats.forEach((cat, idx) => {
        categoryMap[cat.slug] = catResults[idx];
      });
      const featuredSlugs = new Set(feat.map((p) => p.slug));
      setTickerPosts(ticker);
      setFeatured(feat);
      setTrending(trend);
      setCategories(cats);
      setAuthors(auths);
      setCategoryPosts(categoryMap);
      setAuthorPosts(authorPosts);
      setLatest(lat.filter((p) => !featuredSlugs.has(p.slug)));
    })();
    return () => {
      cancelled = true;
    };
  }, [locale]);
  const leadPost = featured?.[0] ?? null;
  const secondaryPosts = latest?.slice(0, 3) ?? [];
  const latestGridPosts = latest?.slice(3, 9) ?? [];
  const featuredAuthor = authors?.[0] ?? null;
  return (
    <>
      {/* Luxurious Classical Landing Hero with 3-Pillar Feature Strip */}
      <LandingHero />

      {/* Breaking news ticker */}
      {tickerPosts && tickerPosts.length > 0 ? <TrendingTicker posts={tickerPosts} /> : null}

      {/* Hero editorial grid */}
      <section className="border-b border-border">
        <Container className="py-8 sm:py-10" width="default">
          {leadPost ? (
            <HeroEditorialGrid lead={leadPost} secondary={secondaryPosts} />
          ) : (
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3 animate-pulse">
                <div className="aspect-[16/9] mb-4 rounded-lg bg-muted" />
                <div className="h-3 w-20 rounded bg-muted mb-3" />
                <div className="h-8 w-3/4 rounded bg-muted mb-2" />
                <div className="h-5 w-full rounded bg-muted" />
              </div>
              <div className="lg:col-span-2 flex flex-col gap-5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="h-20 w-28 rounded-md bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-16 rounded bg-muted" />
                      <div className="h-5 w-full rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>
      {/* Latest grid + trending sidebar */}
      <section>
        <Container className="py-10 sm:py-12" width="default">
          <div className="grid gap-10 lg:grid-cols-3">
            {/* Latest articles — 2/3 width */}
            <div className="lg:col-span-2">
              <h2 className="mb-6 font-serif text-2xl font-semibold tracking-tight text-foreground">
                {t("page.home.latest") !== "page.home.latest" ? t("page.home.latest") : "Latest"}
              </h2>
              {latestGridPosts === null || latestGridPosts.length === 0 ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse space-y-3">
                      <div className="aspect-[16/9] rounded-lg bg-muted" />
                      <div className="h-3 w-20 rounded bg-muted" />
                      <div className="h-5 w-3/4 rounded bg-muted" />
                      <div className="h-4 w-full rounded bg-muted" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {latestGridPosts.map((post) => (
                    <PostCard key={post.slug} post={post} variant="default" />
                  ))}
                </div>
              )}
            </div>
            {/* Trending sidebar — 1/3 width, sticky */}
            <div className="lg:col-span-1">
              {trending ? <TrendingSidebar posts={trending} /> : null}
            </div>
          </div>
        </Container>
      </section>
      {/* Category strips */}
      {categories?.map((cat) => {
        const posts = categoryPosts[cat.slug];
        if (!posts || posts.length === 0) return null;
        return <CategorySectionBlock key={cat.slug} category={cat} posts={posts} />;
      })}
      {/* Featured author spotlight */}
      <FeaturedAuthorSpotlight author={featuredAuthor} posts={authorPosts ?? []} />
      {/* Newsletter CTA */}
      <section className="border-t border-border">
        <Container className="py-12 sm:py-16" width="default">
          <div className="mx-auto max-w-2xl">
            <NewsletterCTA placement="homepage" />
          </div>
        </Container>
      </section>
    </>
  );
};
export default Home;