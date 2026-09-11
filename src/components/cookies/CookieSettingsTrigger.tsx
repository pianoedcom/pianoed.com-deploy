import { useConsent } from "@/lib/cookies/use-consent";
import { Settings } from "lucide-react";
interface CookieSettingsTriggerProps {
  /** Render as floating badge (bottom-left) or inline link */
  variant?: "badge" | "link";
  /** Optional label for link variant */
  label?: string;
}
/**
 * Persistent trigger that lets users reopen cookie preferences at any time.
 *
 * Two variants:
 * - "badge": Floating circular button fixed to bottom-left of viewport
 * - "link": Inline text link (for use in footer or privacy pages)
 */
const CookieSettingsTrigger = ({
  variant = "badge",
  label = "Cookie Settings",
}: CookieSettingsTriggerProps) => {
  const { openPreferences } = useConsent();
  if (variant === "link") {
    return (
      <button
        type="button"
        onClick={openPreferences}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
      >
        {label}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={openPreferences}
      aria-label="Open cookie settings"
      className="fixed bottom-4 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <Settings className="h-4 w-4" aria-hidden />
    </button>
  );
};
export default CookieSettingsTrigger;