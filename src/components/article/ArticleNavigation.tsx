import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { PostSummary } from "@/lib/content";
interface ArticleNavigationProps {
  previous: PostSummary | null;
  next: PostSummary | null;
}
/**
 * Previous/Next article navigation — shown at the bottom of an article.
 * Each direction links to the adjacent published post.
 */
const ArticleNavigation = ({ previous, next }: ArticleNavigationProps) => {
  if (!previous && !next) return null;
  return (
    <nav
      className="mt-12 grid gap-4 border-t border-border pt-8 sm:grid-cols-2"
      aria-label="Article navigation"
    >
      {previous ? (
        <Link
          to={`/blog/${previous.slug}`}
          onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "instant" })}
          className="group flex items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label={`Previous article: ${previous.title}`}
        >
          <ArrowLeft className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="min-w-0">
            <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Previous
            </span>
            <span className="mt-1 block font-serif text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-muted-foreground">
              {previous.title}
            </span>
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" aria-hidden />
      )}
      {next ? (
        <Link
          to={`/blog/${next.slug}`}
          onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "instant" })}
          className="group flex items-start gap-3 rounded-lg border border-border p-4 text-right transition-colors hover:bg-muted/40 sm:justify-end focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label={`Next article: ${next.title}`}
        >
          <span className="min-w-0">
            <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Next
            </span>
            <span className="mt-1 block font-serif text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-muted-foreground">
              {next.title}
            </span>
          </span>
          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        </Link>
      ) : null}
    </nav>
  );
};
export default ArticleNavigation;