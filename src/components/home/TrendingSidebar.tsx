import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import type { PostSummary } from "@/lib/content";
import CategoryBadge from "@/components/content/CategoryBadge";
import NewsletterCTA from "@/components/growth/NewsletterCTA";
interface TrendingSidebarProps {
  posts: PostSummary[];
}
/**
 * Sticky sidebar with numbered trending stories.
 * Includes a mini newsletter CTA at the bottom.
 */
const TrendingSidebar = ({ posts }: TrendingSidebarProps) => {
  if (!posts || posts.length === 0) return null;
  return (
    <aside className="lg:sticky lg:top-24 flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-foreground" aria-hidden />
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Trending Now
          </h2>
        </div>
        <ol className="space-y-4">
          {posts.slice(0, 5).map((post, idx) => (
            <li key={post.slug} className="group">
              <Link
                to={`/blog/${post.slug}`}
                className="flex gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                aria-label={post.title}
              >
                <span className="font-serif text-2xl font-bold leading-none text-muted-foreground/40 transition-colors group-hover:text-foreground min-w-[1.5rem]">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <CategoryBadge category={post.category} className="mb-0.5 block" />
                  <h3 className="font-serif text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-muted-foreground line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {post.readingTime} min read
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>
      <NewsletterCTA placement="sidebar" compact />
    </aside>
  );
};
export default TrendingSidebar;