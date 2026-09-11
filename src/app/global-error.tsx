import { useEffect } from "react";
import { reportError, safeErrorMessage } from "@/lib/observability";
/**
 * Global error fallback rendered when the entire app fails to render.
 * This is the last-resort boundary before a blank screen.
 *
 * The error is reported to the observability layer. Users see only a
 * safe, generic message — no stack traces or internal details.
 */
const GlobalError = ({
  error,
  resetErrorBoundary,
}: {
  error: Error & { digest?: string };
  resetErrorBoundary: () => void;
}) => {
  useEffect(() => {
    reportError(error, undefined, { boundary: "global" });
  }, [error]);
  const userMessage = safeErrorMessage(error);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <p className="eyebrow mb-3">Fatal Error</p>
      <h1 className="display-heading mb-3 text-4xl">Application error</h1>
      <p className="mb-2 max-w-md text-muted-foreground">{userMessage}</p>
      <p className="mb-8 max-w-md text-xs text-muted-foreground/70">
        A critical error occurred and has been logged. Please reload to continue.
      </p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Reload
      </button>
    </div>
  );
};
export default GlobalError;