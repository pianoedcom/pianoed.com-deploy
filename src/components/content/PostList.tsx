import { cn } from "@/lib/utils";
import type { PostSummary } from "@/lib/content";
import PostCard from "./PostCard";
interface PostListProps {
  posts: PostSummary[];
  /** Layout style for the list. */
  layout?: "grid" | "stack" | "compact-list";
  className?: string;
}
/**
 * Renders a collection of post cards in the chosen layout.
 *
 * - grid:         responsive 2–3 column card grid (default for listings).
 * - stack:        single-column stacked cards (default for homepage recent).
 * - compact-list: minimal rows without images (for sidebars / related).
 */
const PostList = ({ posts, layout = "grid", className }: PostListProps) => {
  if (posts.length === 0) {
    return <p className="text-muted-foreground">No articles published yet.</p>;
  }
  if (layout === "compact-list") {
    return (
      <ul className={cn("space-y-6", className)}>
        {posts.map((post) => (
          <li key={post.slug}>
            <PostCard post={post} variant="compact" />
          </li>
        ))}
      </ul>
    );
  }
  if (layout === "stack") {
    return (
      <ul className={cn("space-y-10", className)}>
        {posts.map((post) => (
          <li key={post.slug}>
            <PostCard post={post} variant="default" />
          </li>
        ))}
      </ul>
    );
  }
  // grid
  return (
    <ul className={cn("grid gap-8 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {posts.map((post) => (
        <li key={post.slug}>
          <PostCard post={post} variant="default" />
        </li>
      ))}
    </ul>
  );
};
export default PostList;