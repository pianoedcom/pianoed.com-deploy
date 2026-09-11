import CategoryBadge from "@/components/content/CategoryBadge";
import ArticleMeta from "./ArticleMeta";
import type { Post, Author } from "@/lib/content";
interface ArticleHeaderProps {
  post: Post;
  author: Author | null;
}
/**
 * Article header — category, title, description/excerpt, and metadata.
 * Uses semantic heading hierarchy: the page's single H1 lives here.
 */
const ArticleHeader = ({ post, author }: ArticleHeaderProps) => {
  return (
    <header className="mb-10">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <CategoryBadge category={post.category} />
        {post.featured ? (
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Featured
          </span>
        ) : null}
      </div>
      <h1 className="display-heading mb-4 text-4xl text-foreground sm:text-5xl">{post.title}</h1>
      <p className="mb-6 text-lg text-muted-foreground">{post.description}</p>
      <ArticleMeta post={post} author={author} />
    </header>
  );
};
export default ArticleHeader;