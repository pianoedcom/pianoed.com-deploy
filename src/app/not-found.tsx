import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import Seo from "@/components/layout/Seo";
/**
 * 404 page rendered for unknown routes.
 *
 * Provides clear navigation options: return home, browse articles, or
 * search. Includes SEO metadata with noindex to prevent indexing.
 */
const NotFound = () => {
  return (
    <>
      <Seo
        title="Page not found"
        description="The page you are looking for does not exist or may have moved."
        path="/404"
        noindex
      />
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <p className="eyebrow mb-3">404</p>
        <h1 className="display-heading mb-3 text-4xl text-foreground">Page not found</h1>
        <p className="mb-8 text-muted-foreground">
          The page you are looking for does not exist or may have moved.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Return home
          </Link>
          <Link
            to="/blog"
            className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Browse articles
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Search className="h-4 w-4" aria-hidden />
            Search
          </Link>
        </div>
      </div>
    </>
  );
};
export default NotFound;