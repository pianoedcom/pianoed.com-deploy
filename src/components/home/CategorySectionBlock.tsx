import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { PostSummary, Category } from "@/lib/content";
import PostCard from "@/components/content/PostCard";
interface CategorySectionBlockProps {
  category: Category;
  posts: PostSummary[];
}
/**
 * Category strip — horizontal section with a category header,
 * "View all" link, and a responsive grid of post cards.
 */
const CategorySectionBlock = ({ category, posts }: CategorySectionBlockProps) => {
  if (!posts || posts.length === 0) return null;
  return (
    <section className="border-t border-border">
      <div className="mx-auto w-full max-w-content px-5 sm:px-8 py-10 sm:py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-1">Category</p>
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {category.name}
            </h2>
            {category.description ? (
              <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
            ) : null}
          </div>
          <Link
            to={`/category/${category.slug}`}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
          >
            View all
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {posts.slice(0, 4).map((post) => (
            <PostCard key={post.slug} post={post} variant="default" />
          ))}
        </div>
      </div>
    </section>
  );
};
export default CategorySectionBlock;