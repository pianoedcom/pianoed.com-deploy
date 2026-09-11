import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
interface CategoryBadgeProps {
  category: string;
  className?: string;
}
/**
 * Maps a category slug to its display name.
 * In production this would come from the content source's category registry.
 */
const categoryNames: Record<string, string> = {
  "history-culture": "History & Culture",
  "learning-technique": "Learning & Technique",
  "modern-developments": "Modern Developments",
  "sheet-music-practice": "Sheet Music & Practice",
  "gear-reviews": "Gear & Reviews",
  "artists-performers": "Artists & Performers",
  "genres-repertoire": "Genres & Repertoire",
  "piano-technology": "Piano Technology",
};
function displayName(slug: string): string {
  return categoryNames[slug] ?? slug;
}
/**
 * Editorial category badge — links to the category listing page.
 * Uses uppercase tracking and the muted-foreground color for a
 * restrained, magazine-style label.
 */
const CategoryBadge = ({ category, className }: CategoryBadgeProps) => {
  return (
    <Link
      to={`/category/${category}`}
      className={cn(
        "text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm",
        className,
      )}
    >
      {displayName(category)}
    </Link>
  );
};
export default CategoryBadge;
export { displayName as categoryName };