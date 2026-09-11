import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Seo from "@/components/layout/Seo";
import Container from "@/components/layout/Container";
import PostList from "@/components/content/PostList";
import Breadcrumbs from "@/components/content/Breadcrumbs";
import { listPostsCached, getArchiveMonths, monthName } from "@/lib/content";
import type { PostSummary } from "@/lib/content";
import { getPostsByYear } from "@/lib/content/taxonomy";
/**
 * Archive: Year — shows all published posts from a given year,
 * grouped by month with a month navigation sidebar.
 *
 * Invalid years (non-numeric or no posts) render a 404.
 */
const ArchiveYearPage = () => {
  const { year: yearStr = "" } = useParams<{ year: string }>();
  const year = Number.parseInt(yearStr, 10);
  const [posts, setPosts] = useState<PostSummary[] | null>(null);
  useEffect(() => {
    listPostsCached().then(setPosts);
  }, []);
  const validYear = Number.isInteger(year) && year > 1900 && year < 3000;
  if (posts === null) {
    return (
      <Container className="py-12 sm:py-16" width="default">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-40 rounded bg-muted" />
          <div className="h-10 w-64 rounded bg-muted" />
        </div>
      </Container>
    );
  }
  // Filter to this year's posts
  const yearPosts = validYear ? getPostsByYear(posts, year) : [];
  // If no posts for this year, show 404
  if (yearPosts.length === 0) {
    return (
      <>
        <Seo
          title={`Archive: ${yearStr}`}
          description={`No articles found in ${yearStr}.`}
          path={`/archive/${yearStr}`}
        />
        <Container className="py-12 sm:py-16" width="default">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Articles", href: "/blog" },
              { label: "Archive", href: "/blog" },
              { label: yearStr },
            ]}
          />
          <p className="eyebrow mb-3">Archive</p>
          <h1 className="display-heading mb-4 text-3xl text-foreground sm:text-4xl">{yearStr}</h1>
          <p className="text-muted-foreground">
            No articles were published in {yearStr}.{" "}
            <Link
              to="/blog"
              className="text-foreground underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
            >
              Browse all articles
            </Link>
            .
          </p>
        </Container>
      </>
    );
  }
  // Build month navigation from actual posts
  const months = getArchiveMonths(yearPosts);
  return (
    <>
      <Seo
        title={`Archive: ${year}`}
        description={`All articles published in ${year} on Inkwell — ${yearPosts.length} ${yearPosts.length === 1 ? "article" : "articles"}.`}
        path={`/archive/${year}`}
      />
      <Container className="py-12 sm:py-16" width="default">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Articles", href: "/blog" },
            { label: "Archive", href: "/blog" },
            { label: String(year) },
          ]}
        />
        <header className="mb-10">
          <p className="eyebrow mb-3">Archive</p>
          <h1 className="display-heading mb-4 text-4xl text-foreground sm:text-5xl">{year}</h1>
          <p className="text-lg text-muted-foreground">
            {yearPosts.length} {yearPosts.length === 1 ? "article" : "articles"} published this
            year.
          </p>
        </header>
        <div className="lg:grid lg:grid-cols-[14rem_1fr] lg:gap-10">
          {/* Month navigation sidebar */}
          <aside className="mb-8 lg:mb-0">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Months
            </h2>
            <ul className="space-y-1">
              {months.map((m) => (
                <li key={m.month}>
                  <Link
                    to={`/archive/${year}/${String(m.month).padStart(2, "0")}`}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                  >
                    {monthName(m.month)}
                    <span className="text-xs text-muted-foreground/60">({m.count})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
          {/* Posts list */}
          <div>
            <PostList posts={yearPosts} layout="grid" />
          </div>
        </div>
      </Container>
    </>
  );
};
export default ArchiveYearPage;