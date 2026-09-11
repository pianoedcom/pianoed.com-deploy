import { useState } from "react";
import { getImageEntry } from "@/lib/content/image-manifest";
/**
 * ResponsiveImage — image with lazy loading, optional caption, and
 * graceful fallback to the placeholder if the source fails.
 *
 * Performance:
 *   - `loading="lazy"` + `decoding="async"` for below-the-fold images.
 *   - Pass `priority` to mark the LCP image (hero) for eager loading.
 *   - When `width`/`height` are provided, the browser reserves space
 *     before the image loads, preventing CLS.
 *   - `fetchpriority="high"` on priority images helps the browser
 *     schedule the LCP fetch earlier.
 *   - If the image is in the optimization manifest, renders `srcset` and
 *     LQIP blur-up placeholder for optimal Core Web Vitals.
 */
interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
  /** Mark as the LCP image — loads eagerly with high priority. */
  priority?: boolean;
  className?: string;
  figureClassName?: string;
  onError?: () => void;
  onLoad?: () => void;
}
export const ResponsiveImage = ({
  src,
  alt,
  width,
  height,
  caption,
  priority = false,
  className,
  figureClassName,
  onError,
  onLoad,
}: ResponsiveImageProps) => {
  const [error, setError] = useState(false);
  const entry = getImageEntry(src);
  const resolvedSrc = error ? "/placeholder.svg" : (entry?.src ?? src);
  return (
    <figure className={figureClassName ?? "my-6"}>
      <img
        src={resolvedSrc}
        alt={alt}
        width={entry?.width ?? width}
        height={entry?.height ?? height}
        srcSet={entry?.srcset}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        // @ts-expect-error — fetchPriority is a valid HTML attribute not yet in React's types
        fetchpriority={priority ? "high" : "auto"}
        onError={() => {
          setError(true);
          onError?.();
        }}
        onLoad={onLoad}
        className={className ?? "h-auto w-full rounded-lg border border-border"}
        style={
          entry?.lqip
            ? {
                backgroundImage: `url(${entry.lqip})`,
                backgroundSize: "cover",
              }
            : undefined
        }
      />
      {caption ? (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
};
export default ResponsiveImage;