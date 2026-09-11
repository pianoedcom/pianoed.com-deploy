import { useEffect } from "react";
import type { FallbackProps } from "react-error-boundary";
/**
 * Route-level error boundary fallback.
 * Displays a friendly message and a recovery action.
 */
const ErrorBoundary = ({ error, resetErrorBoundary }: FallbackProps) => {
  useEffect(() => {
    console.error("[error-boundary] Uncaught route error:", error);
  }, [error]);
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-3xl font-bold text-foreground">Something went wrong</h1>
      <p className="mb-6 max-w-md text-muted-foreground">
        An unexpected error occurred while rendering this page. You can try again.
      </p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
};
export default ErrorBoundary;