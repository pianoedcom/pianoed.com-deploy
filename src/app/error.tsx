import { useEffect } from "react";
import { Link } from "react-router-dom";
import { reportError, safeErrorMessage } from "@/lib/observability";
/**
 * Route-level error boundary fallback.
 *
 * Rendered when a route's component throws during rendering. Unlike the
 * global error boundary, this preserves the site shell so users can navigate
 * away. The error is reported to the observability layer (which logs it
 * with structured context and forwards to the error reporter if configured).
 *
 * Users never see stack traces — only a safe, generic message.
 */
const RouteError = ({
  error,
  resetErrorBoundary,
}: {
  error: Error & { digest?: string };
  resetErrorBoundary: () => void;
}) => {
  useEffect(() => {
    reportError(error, undefined, { boundary: "route" });
  }, [error]);
  const userMessage = safeErrorMessage(error);
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow mb-3">Error</p>
      <h1 className="display-heading mb-3 text-4xl text-foreground">Something went wrong</h1>
      <p className="mb-2 text-muted-foreground">{userMessage}</p>
      <p className="mb-8 text-xs text-muted-foreground/70">
        This error has been logged. If the problem persists, try refreshing.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={resetErrorBoundary}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Try again
        </button>
        <Link
          to="/"
          className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Return home
        </Link>
      </div>
    </div>
  );
};
export default RouteError;