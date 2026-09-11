import { useState } from "react";
import { ResponsiveImage } from "@/components/mdx";
import type { Post } from "@/lib/content";

interface ArticleHeroProps {
  post: Post;
}

/**
 * Full-width hero image for an article. Renders nothing if the post
 * has no cover image.
 *
 * This is the article's LCP element, so it loads eagerly with high
 * fetch priority. Fixed aspect ratio prevents CLS while the image loads.
 */
const ArticleHero = ({ post }: ArticleHeroProps) => {
  const [hasError, setHasError] = useState(false);

  if (!post.image) return null;

  return (
    <figure className="mb-10">
      <div className="overflow-hidden rounded-lg border border-border">
        <ResponsiveImage
          src={post.image}
          alt={post.imageAlt ?? post.title}
          priority
          figureClassName="my-0"
          className="h-auto w-full rounded-none border-0"
          onError={() => setHasError(true)}
        />
      </div>
      {hasError && post.imageAlt ? (
        <figcaption className="mt-3 text-center text-sm text-muted-foreground">
          {post.imageAlt}
        </figcaption>
      ) : null}
    </figure>
  );
};

export default ArticleHero;