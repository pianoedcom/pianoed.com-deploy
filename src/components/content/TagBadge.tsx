import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
interface TagBadgeProps {
  tag: string;
  className?: string;
}
/**
 * Maps a tag slug to its display name.
 * In production this would come from the content source's tag registry.
 */
const tagNames: Record<string, string> = {
  piano: "Piano",
  classical: "Classical",
  jazz: "Jazz",
  "pop-piano": "Pop Piano",
  beginners: "Beginners",
  technique: "Technique",
  practice: "Practice",
  "sheet-music": "Sheet Music",
  "acoustic-pianos": "Acoustic Pianos",
  "digital-pianos": "Digital Pianos",
  "hybrid-pianos": "Hybrid Pianos",
  accessories: "Accessories",
  pianists: "Pianists",
  history: "History",
  "piano-technology": "Piano Technology",
  contemporary: "Contemporary",
};
function displayName(slug: string): string {
  return tagNames[slug] ?? slug;
}
/**
 * Editorial tag badge — links to the tag listing page.
 * Uses a pill style with muted background for a restrained, magazine look.
 */
const TagBadge = ({ tag, className }: TagBadgeProps) => {
  return (
    <Link
      to={`/tag/${tag}`}
      className={cn(
        "inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
    >
      {displayName(tag)}
    </Link>
  );
};
export default TagBadge;