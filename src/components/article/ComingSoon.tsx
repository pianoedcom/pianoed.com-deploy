import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, PenTool } from "lucide-react";
import type { Post } from "@/lib/content";
import { categoryName } from "@/lib/content/frontmatter";
import Container from "@/components/layout/Container";
import NewsletterCTA from "@/components/growth/NewsletterCTA";
interface ComingSoonProps {
  post: Post;
}
/**
 * "Coming Soon" / "Work in Progress" fallback view.
 *
 * Rendered when a visitor navigates to a draft or future-dated article URL.
 * Instead of a 404, shows the article title, category, scheduled date,
 * a teaser, and a newsletter signup prompt.
 */
const ComingSoon = ({ post }: ComingSoonProps) => {
  const pubDate = new Date(post.date);
  const isFuture = pubDate.getTime() > Date.now();
  return (
    <Container className="py-16 sm:py-24" width="article">
      <Link
        to="/articles"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to Articles
      </Link>
      <div className="mx-auto max-w-2xl text-center">
        {/* Illustration / icon */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <PenTool className="h-9 w-9 text-muted-foreground" aria-hidden />
          </div>
        </div>
        {/* Status badge */}
        <p className="eyebrow mb-3">{isFuture ? "Coming Soon" : "Work in Progress"}</p>
        {/* Title */}
        <h1 className="display-heading mb-4 text-3xl text-foreground sm:text-4xl">{post.title}</h1>
        {/* Category badge */}
        <div className="mb-6">
          <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            {categoryName(post.category)}
          </span>
        </div>
        {/* Teaser / description */}
        {post.description ? (
          <p className="mb-8 text-lg text-muted-foreground">{post.description}</p>
        ) : null}
        {/* Meta info */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          {isFuture ? (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" aria-hidden />
              Scheduled for{" "}
              {pubDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" aria-hidden />
              This article is being written
            </span>
          )}
        </div>
        {/* Divider */}
        <div className="mx-auto mb-10 h-px w-24 bg-border" />
        {/* Newsletter prompt */}
        <div className="rounded-lg border border-border bg-card p-6 text-left">
          <NewsletterCTA placement="coming-soon" />
        </div>
      </div>
    </Container>
  );
};
export default ComingSoon;