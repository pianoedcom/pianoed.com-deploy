import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Seo from "@/components/layout/Seo";
import Container from "@/components/layout/Container";
import PostList from "@/components/content/PostList";
import Breadcrumbs from "@/components/content/Breadcrumbs";
import { listPostsCached, monthName } from "@/lib/content";
import type { PostSummary } from "@/lib/content";
import { getPostsByYearMonth } from "@/lib/content/taxonomy";
/**
 * Archive: Year/Month — shows all published posts from a specific
 * year and month.
 *
 * Invalid year/month values or months with no posts render a 404.
 */
const ArchiveYearMonthPage = () => {
  const { year: yearStr = "", month: monthStr = "" } = useParams<{
    year: string;
    month: string;
  }>();
  const year = Number.parseInt(yearStr, 10);
  const month = Number.parseInt(monthStr, 10);
  const [posts, setPosts] = useState<PostSummary[] | null>(null);
  useEffect(() => {
    listPostsCached().then(setPosts);
  }, []);
  const validYear = Number.isInteger(year) && year > 1900 && year < 3000;
  const validMonth = Number.isInteger(month) && month >= 1 && month <= 12;
  const valid = validYear && validMonth;
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
  const monthPosts = valid ? getPostsByYearMonth(posts, year, month) : [];
  // Invalid date or no posts — show 404-style message
  if (!valid || monthPosts.length === 0) {
    return (
      <>
        <Seo
          title={valid ? `Archive: ${monthName(month)} ${year}` : "Archive"}
          description={
            valid ? `No articles found in ${monthName(month)} ${year}.` : "Invalid archive date."
          }
          path={valid ? `/archive/${year}/${String(month).padStart(2, "0")}` : "/archive"}
        />
        <Container className="py-12 sm:py-16" width="default">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Articles", href: "/blog" },
              { label: "Archive", href: "/blog" },
              valid ? { label: String(year), href: `/archive/${year}` } : { label: "Archive" },
              valid ? { label: monthName(month) } : { label: "Not found" },
            ]}
          />
          <p className="eyebrow mb-3">Archive</p>
          <h1 className="display-heading mb-4 text-3xl text-foreground sm:text-4xl">
            {valid ? `${monthName(month)} ${year}` : "Not found"}
          </h1>
          <p className="text-muted-foreground">
            {valid
              ? `No articles were published in ${monthName(month)} ${year}. `
              : "The requested archive page does not exist. "}
            <Link
              to={`/archive/${year}`}
              className="text-foreground underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
            >
              View {year} archive
            </Link>
          </p>
        </Container>
      </>
    );
  }
  const monthLabel = monthName(month);
  const paddedMonth = String(month).padStart(2, "0");
  return (
    <>
      <Seo
        title={`Archive: ${monthLabel} ${year}`}
        description={`All articles published in ${monthLabel} ${year} on Inkwell — ${monthPosts.length} ${monthPosts.length === 1 ? "article" : "articles"}.`}
        path={`/archive/${year}/${paddedMonth}`}
      />
      <Container className="py-12 sm:py-16" width="default">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Articles", href: "/blog" },
            { label: "Archive", href: "/blog" },
            { label: String(year), href: `/archive/${year}` },
            { label: monthLabel },
          ]}
        />
        <header className="mb-10">
          <p className="eyebrow mb-3">Archive</p>
          <h1 className="display-heading mb-4 text-3xl text-foreground sm:text-4xl">
            {monthLabel} {year}
          </h1>
          <p className="text-lg text-muted-foreground">
            {monthPosts.length} {monthPosts.length === 1 ? "article" : "articles"} published this
            month.
          </p>
        </header>
        <PostList posts={monthPosts} layout="grid" />
      </Container>
    </>
  );
};
export default ArchiveYearMonthPage;