import { Link } from "react-router-dom";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { PostSummary } from "@/lib/content";
import { getImageEntry } from "@/lib/content/image-manifest";
import CategoryBadge from "./CategoryBadge";
import TagBadge from "./TagBadge";
interface PostCardProps {
  post: PostSummary;
  /** "featured" = large with image, "default" = standard card, "compact" = minimal list-row. */
  variant?: "featured" | "default" | "compact";
  className?: string;
}
/**
 * Editorial post card.
 *
 * Variants:
 *   - featured: large image, serif title, description — for the magazine hero.
 *   - default:  image top, category, title, excerpt, meta — for grid layouts.
 *   - compact:  no image, horizontal row — for sidebar / related lists.
 */
const PostCard = ({ post, variant = "default", className }: PostCardProps) => {
  const href = `/blog/${post.slug}`;
  const dateLabel = format(new Date(post.date), "MMM d, yyyy");
  if (variant === "compact") {
    return (
      <article className={cn("group", className)}>
        <Link
          to={href}
          className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring rounded-lg"
          aria-label={post.title}
        >
          <CategoryBadge category={post.category} className="mb-1 block" />
          <h3 className="font-serif text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-muted-foreground">
            {post.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {dateLabel} · {post.readingTime} min read
          </p>
        </Link>
      </article>
    );
  }
  if (variant === "featured") {
    return (
      <article className={cn("group", className)}>
        <Link
          to={href}
          className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring rounded-lg"
          aria-label={post.title}
        >
          {post.image ? (
            <div className="mb-6 overflow-hidden rounded-lg border border-border">
              <img
                src={getImageEntry(post.image)?.src ?? post.image}
                alt={post.imageAlt ?? post.title}
                width={getImageEntry(post.image)?.width ?? 1200}
                height={getImageEntry(post.image)?.height ?? 675}
                srcSet={getImageEntry(post.image)?.srcset}
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="eager"
                decoding="async"
                // @ts-expect-error — fetchPriority is valid HTML, not yet in React types
                fetchpriority="high"
                className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          ) : null}
          <CategoryBadge category={post.category} className="mb-3 block" />
          <h2 className="display-heading mb-3 text-3xl text-foreground transition-colors group-hover:text-muted-foreground sm:text-4xl">
            {post.title}
          </h2>
          <p className="mb-4 text-base text-muted-foreground sm:text-lg">{post.description}</p>
          {post.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {post.tags.slice(0, 6).map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              {dateLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {post.readingTime} min read
            </span>
          </div>
        </Link>
      </article>
    );
  }
  // default variant
  return (
    <article className={cn("group flex flex-col", className)}>
      <Link
        to={href}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring rounded-lg"
        aria-label={post.title}
      >
        {post.image ? (
          <div className="mb-4 overflow-hidden rounded-lg border border-border">
            <img
              src={getImageEntry(post.image)?.src ?? post.image}
              alt={post.imageAlt ?? post.title}
              width={getImageEntry(post.image)?.width ?? 600}
              height={getImageEntry(post.image)?.height ?? 338}
              srcSet={getImageEntry(post.image)?.srcset}
              sizes="(max-width: 768px) 100vw, 33vw"
              loading="lazy"
              decoding="async"
              className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
        ) : null}
        <CategoryBadge category={post.category} className="mb-2 block" />
        <h3 className="mb-2 font-serif text-xl font-semibold leading-snug text-foreground transition-colors group-hover:text-muted-foreground">
          {post.title}
        </h3>
        <p className="line-clamp-2 mb-3 text-sm text-muted-foreground">{post.description}</p>
        {post.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 4).map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" aria-hidden />
            {dateLabel}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden />
            {post.readingTime} min read
          </span>
        </div>
      </Link>
    </article>
  );
};
export default PostCard;