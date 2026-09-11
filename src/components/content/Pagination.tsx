import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { pageRange, type PaginationResult } from "@/lib/content/pagination";
interface PaginationProps {
  /** Pagination metadata from `paginate()`. */
  pagination: PaginationResult;
  /** Base path for page links, e.g. "/blog" or "/category/software-craft". */
  basePath: string;
  /** Optional search query to preserve in links, e.g. "?q=react". */
  searchParams?: string;
  className?: string;
}
/**
 * URL-based pagination controls.
 *
 * Generates page links with `?page=N` query parameters. Uses ellipsis
 * for large page counts. Accessible: uses <nav aria-label>, disabled
 * links for prev/next boundaries, and aria-current for the active page.
 */
const Pagination = ({ pagination, basePath, searchParams, className }: PaginationProps) => {
  const { page, totalPages, hasPrev, hasNext } = pagination;
  if (totalPages <= 1) return null;
  const buildHref = (p: number): string => {
    const params = new URLSearchParams(searchParams ?? "");
    if (p > 1) {
      params.set("page", String(p));
    } else {
      params.delete("page");
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const pages = pageRange(page, totalPages);
  const baseLinkClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
  return (
    <nav
      aria-label="Pagination"
      className={cn("mt-12 flex items-center justify-center gap-1.5", className)}
    >
      {/* Previous */}
      {hasPrev ? (
        <Link
          to={buildHref(page - 1)}
          rel="prev"
          className={cn(
            baseLinkClass,
            "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          <span className="sr-only">Previous page</span>
        </Link>
      ) : (
        <span className={cn(baseLinkClass, "cursor-not-allowed opacity-40")} aria-disabled="true">
          <ChevronLeft className="h-4 w-4" aria-hidden />
          <span className="sr-only">Previous page (disabled)</span>
        </span>
      )}
      {/* Page numbers */}
      <ol className="flex items-center gap-1.5">
        {pages.map((p, i) =>
          p === "..." ? (
            <li key={`ellipsis-${i}`} className="px-1 text-muted-foreground" aria-hidden>
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                to={buildHref(p)}
                aria-current={p === page ? "page" : undefined}
                className={cn(
                  baseLinkClass,
                  p === page
                    ? "border-primary bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {p}
              </Link>
            </li>
          ),
        )}
      </ol>
      {/* Next */}
      {hasNext ? (
        <Link
          to={buildHref(page + 1)}
          rel="next"
          className={cn(
            baseLinkClass,
            "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
          <span className="sr-only">Next page</span>
        </Link>
      ) : (
        <span className={cn(baseLinkClass, "cursor-not-allowed opacity-40")} aria-disabled="true">
          <ChevronRight className="h-4 w-4" aria-hidden />
          <span className="sr-only">Next page (disabled)</span>
        </span>
      )}
    </nav>
  );
};
export default Pagination;