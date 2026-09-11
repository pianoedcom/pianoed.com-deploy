import { Link } from "react-router-dom";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import type { PostSummary } from "@/lib/content";
import CategoryBadge from "@/components/content/CategoryBadge";
import { getImageEntry } from "@/lib/content/image-manifest";
interface HeroEditorialGridProps {
  lead: PostSummary | null;
  secondary: PostSummary[];
}
/**
 * Asymmetric editorial hero grid — 1 large lead story (60%) +
 * 2-3 secondary stories stacked (40%). The Verge / TechCrunch style.
 */
const HeroEditorialGrid = ({ lead, secondary }: HeroEditorialGridProps) => {
  if (!lead) return null;
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Lead story — spans 3 of 5 columns */}
      <article className="lg:col-span-3 group">
        <Link
          to={`/blog/${lead.slug}`}
          className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring rounded-lg"
          aria-label={lead.title}
        >
          {lead.image ? (
            (() => {
              const entry = getImageEntry(lead.image);
              return (
                <div
                  className="mb-4 overflow-hidden rounded-lg border border-border"
                  style={
                    entry?.lqip
                      ? { backgroundImage: `url(${entry.lqip})`, backgroundSize: "cover" }
                      : undefined
                  }
                >
                  <img
                    src={entry?.src ?? lead.image}
                    alt={lead.imageAlt ?? lead.title}
                    width={entry?.width ?? 1200}
                    height={entry?.height ?? 675}
                    srcSet={entry?.srcset}
                    sizes="(max-width: 768px) 100vw, 60vw"
                    loading="eager"
                    decoding="async"
                    // @ts-expect-error — fetchPriority is valid HTML, not yet in React types
                    fetchpriority="high"
                    className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
              );
            })()
          ) : (
            <div className="mb-4 aspect-[16/9] w-full rounded-lg border border-border bg-muted" />
          )}
          <CategoryBadge category={lead.category} className="mb-2 block" />
          <h2 className="display-heading mb-2 text-2xl text-foreground transition-colors group-hover:text-muted-foreground sm:text-3xl lg:text-4xl">
            {lead.title}
          </h2>
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground sm:text-base">
            {lead.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              {format(new Date(lead.date), "MMM d, yyyy")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {lead.readingTime} min read
            </span>
          </div>
        </Link>
      </article>
      {/* Secondary stories — spans 2 of 5 columns */}
      <div className="flex flex-col gap-5 lg:col-span-2">
        {secondary.slice(0, 3).map((post) => (
          <article
            key={post.slug}
            className="group flex-1 border-b border-border pb-5 last:border-b-0 last:pb-0"
          >
            <Link
              to={`/blog/${post.slug}`}
              className="flex gap-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-lg"
              aria-label={post.title}
            >
              {post.image ? (
                <div className="shrink-0 overflow-hidden rounded-md border border-border">
                  <img
                    src={post.image}
                    alt={post.imageAlt ?? post.title}
                    width={160}
                    height={120}
                    loading="lazy"
                    decoding="async"
                    className="h-[80px] w-[110px] object-cover transition-transform duration-500 group-hover:scale-[1.05] sm:h-[100px] sm:w-[140px]"
                  />
                </div>
              ) : (
                <div className="shrink-0 h-[80px] w-[110px] rounded-md border border-border bg-muted sm:h-[100px] sm:w-[140px]" />
              )}
              <div className="min-w-0 flex-1">
                <CategoryBadge category={post.category} className="mb-1 block" />
                <h3 className="font-serif text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-muted-foreground line-clamp-2">
                  {post.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {format(new Date(post.date), "MMM d")} · {post.readingTime} min
                </p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
};
export default HeroEditorialGrid;