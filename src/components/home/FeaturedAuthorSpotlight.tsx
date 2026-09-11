import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { PostSummary, Author } from "@/lib/content";
interface FeaturedAuthorSpotlightProps {
  author: Author | null;
  posts: PostSummary[];
}
/**
 * Featured author spotlight — shows author avatar, bio, and
 * their recent articles. Placed as a full-width section.
 */
const FeaturedAuthorSpotlight = ({ author, posts }: FeaturedAuthorSpotlightProps) => {
  if (!author || !posts || posts.length === 0) return null;
  return (
    <section className="border-t border-border bg-card">
      <div className="mx-auto w-full max-w-content px-5 sm:px-8 py-10 sm:py-12">
        <p className="eyebrow mb-6">Featured Author</p>
        <div className="grid gap-8 md:grid-cols-3">
          {/* Author info */}
          <div className="md:col-span-1">
            <Link
              to={`/author/${author.slug}`}
              className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-lg"
            >
              <div className="mb-4 overflow-hidden rounded-full border border-border w-20 h-20">
                <img
                  src={author.avatar}
                  alt={author.name}
                  width={80}
                  height={80}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground transition-colors group-hover:text-muted-foreground">
                {author.name}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{author.bio}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                View profile
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </Link>
          </div>
          {/* Author's recent posts */}
          <div className="md:col-span-2">
            <ul className="divide-y divide-border">
              {posts.slice(0, 3).map((post) => (
                <li key={post.slug} className="group py-3 first:pt-0 last:pb-0">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="flex items-start justify-between gap-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                    aria-label={post.title}
                  >
                    <div className="min-w-0">
                      <h4 className="font-serif text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-muted-foreground line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                        {post.description}
                      </p>
                    </div>
                    <ArrowRight
                      className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-foreground"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
export default FeaturedAuthorSpotlight;