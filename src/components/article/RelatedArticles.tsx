import { Link } from "react-router-dom";
import { format } from "date-fns";
import { categoryName } from "@/lib/content";
import type { PostSummary, Post } from "@/lib/content";
import CategoryBadge from "@/components/content/CategoryBadge";
interface RelatedArticlesProps {
  posts: PostSummary[];
  category: string;
  /** The current post (for scoring when relatedArticles frontmatter is present). */
  currentPost?: Post | null;
  /** All posts for scoring fallback. */
  allPosts?: PostSummary[];
}
/**
 * Get related posts — uses manually curated `relatedArticles` frontmatter
 * first, falling back to a scoring algorithm based on shared category,
 * tags, title similarity, and recency.
 */
export function getRelatedPosts(post: Post, allPosts: PostSummary[]): PostSummary[] {
  // 1. Check manually curated relatedArticles first
  if (post.relatedArticles && post.relatedArticles.length > 0) {
    const curated = post.relatedArticles
      .map((slug) => allPosts.find((p) => p.slug === slug))
      .filter((p): p is PostSummary => p !== undefined && p.slug !== post.slug);
    if (curated.length > 0) return curated.slice(0, 3);
  }
  // 2. Fall back to scoring algorithm
  const scored = allPosts
    .filter((p) => p.slug !== post.slug && p.published)
    .map((p) => {
      let score = 0;
      // Same category: +20
      if (p.category === post.category) score += 20;
      // Shared tags: +10 per tag
      const sharedTags = p.tags.filter((t) => post.tags.includes(t));
      score += sharedTags.length * 10;
      // Title similarity (shared words): +5 per word
      const titleWords = post.title.toLowerCase().split(/\s+/);
      const pTitleWords = p.title.toLowerCase().split(/\s+/);
      const sharedWords = titleWords.filter((w) => pTitleWords.includes(w));
      score += sharedWords.length * 5;
      // Recency bonus: newer posts get slight boost
      const ageDays = (Date.now() - new Date(p.date).getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 10 - ageDays / 30);
      return { post: p, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((s) => s.post);
}
/**
 * Related articles — shows up to three posts from the same category,
 * excluding the current article. Uses the compact card layout.
 */
const RelatedArticles = ({ posts, category }: RelatedArticlesProps) => {
  if (posts.length === 0) return null;
  return (
    <section className="mt-16" aria-label="Related articles">
      <h2 className="mb-6 font-serif text-2xl font-semibold text-foreground">
        More in {categoryName(category)}
      </h2>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((r) => (
          <Link
            key={r.slug}
            to={`/blog/${r.slug}`}
            onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "instant" })}
            className="group rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <CategoryBadge category={r.category} className="mb-2 block" />
            <h3 className="font-serif text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-muted-foreground">
              {r.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {format(new Date(r.date), "MMM d, yyyy")} · {r.readingTime} min read
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};
export default RelatedArticles;