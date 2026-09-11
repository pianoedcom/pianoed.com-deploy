import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
export interface BreadcrumbItem {
  /** Display label. */
  label: string;
  /** Route path, or null for the current page (non-clickable). */
  href?: string | null;
}
interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}
/**
 * Breadcrumbs — semantic navigation trail using an ordered list.
 *
 * The last item is the current page (aria-current="page") and is not
 * a link. Each intermediate item is a link with a chevron separator.
 */
const Breadcrumbs = ({ items, className }: BreadcrumbsProps) => {
  if (items.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className={cn("mb-6", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isLink = !isLast && item.href;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {isLink ? (
                <Link
                  to={item.href as string}
                  className="transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? "font-medium text-foreground" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
export default Breadcrumbs;