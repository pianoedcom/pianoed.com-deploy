import { format } from "date-fns";
import { Calendar, Clock, RefreshCw, User } from "lucide-react";
import type { Post, Author } from "@/lib/content";
interface ArticleMetaProps {
  post: Post;
  author: Author | null;
}
/**
 * Article metadata row — author, publication date, updated date, reading time.
 * Rendered as a semantic <dl> for accessibility with proper <dt>/<dd> pairs.
 */
const ArticleMeta = ({ post, author }: ArticleMetaProps) => {
  return (
    <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
      {author ? (
        <div className="flex items-center gap-2">
          {author.avatar ? (
            <img
              src={author.avatar}
              alt=""
              className="h-8 w-8 rounded-full border border-border object-cover"
            />
          ) : null}
          <dt className="sr-only">Author</dt>
          <dd className="font-medium text-foreground">{author.name}</dd>
        </div>
      ) : null}
      <div className="inline-flex items-center gap-1.5">
        <Calendar className="h-4 w-4" aria-hidden />
        <dt className="sr-only">Published</dt>
        <dd>
          <time dateTime={post.date}>{format(new Date(post.date), "MMMM d, yyyy")}</time>
        </dd>
      </div>
      {post.updated ? (
        <div className="inline-flex items-center gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          <dt className="sr-only">Updated</dt>
          <dd>
            <time dateTime={post.updated}>{format(new Date(post.updated), "MMM d, yyyy")}</time>
          </dd>
        </div>
      ) : null}
      <div className="inline-flex items-center gap-1.5">
        <Clock className="h-4 w-4" aria-hidden />
        <dt className="sr-only">Reading time</dt>
        <dd>{post.readingTime} min read</dd>
      </div>
    </dl>
  );
};
export default ArticleMeta;