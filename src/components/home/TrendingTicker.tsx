import { Link } from "react-router-dom";
import { Radio } from "lucide-react";
import type { PostSummary } from "@/lib/content";
interface TrendingTickerProps {
  posts: PostSummary[];
}
/**
 * Auto-scrolling headline ticker for the top of the homepage.
 * Shows latest headlines in a horizontal scrolling strip.
 */
const TrendingTicker = ({ posts }: TrendingTickerProps) => {
  if (!posts || posts.length === 0) return null;
  // Duplicate the posts array to create a seamless loop
  const tickerPosts = [...posts, ...posts];
  return (
    <div className="border-b border-border bg-card overflow-hidden">
      <div className="flex items-center gap-3 py-2.5">
        <div className="flex shrink-0 items-center gap-1.5 pl-5 sm:pl-8 pr-3 border-r border-border">
          <Radio className="h-3.5 w-3.5 animate-pulse text-destructive" aria-hidden />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground whitespace-nowrap">
            Latest
          </span>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex animate-[ticker_40s_linear_infinite] gap-8 whitespace-nowrap">
            {tickerPosts.map((post, idx) => (
              <Link
                key={`${post.slug}-${idx}`}
                to={`/blog/${post.slug}`}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
              >
                {post.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[ticker_40s_linear_infinite\\] {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};
export default TrendingTicker;