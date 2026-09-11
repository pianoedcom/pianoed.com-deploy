import { Loader2 } from "lucide-react";
/**
 * Full-page loading indicator shown while route-level data loads.
 *
 * Minimal and accessible: uses `role="status"` with an `aria-label` so
 * screen readers announce the loading state.
 */
const Loading = () => {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      role="status"
      aria-label="Loading page"
    >
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden />
      <span className="sr-only">Loading…</span>
    </div>
  );
};
export default Loading;