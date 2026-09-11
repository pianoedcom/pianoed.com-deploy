import { type ReactNode } from "react";
import { useConsent } from "@/lib/cookies/use-consent";
import type { CookieCategory } from "@/lib/config/cookies";
interface ConsentGateProps {
  /** Category required for children to render */
  category: CookieCategory;
  /** Content to render if consent is granted */
  children: ReactNode;
  /** Optional fallback to show if consent is not granted */
  fallback?: ReactNode;
}
/**
 * ConsentGate — conditionally renders children only if the user has
 * consented to the specified cookie category.
 *
 * Useful for wrapping analytics scripts, embedded iframes, comment
 * systems, and marketing pixels.
 *
 * @example
 * <ConsentGate category="analytics">
 *   <iframe src="https://embed.example.com" />
 * </ConsentGate>
 */
const ConsentGate = ({ category, children, fallback }: ConsentGateProps) => {
  const { hasCategory } = useConsent();
  if (!hasCategory(category)) {
    return <>{fallback ?? null}</>;
  }
  return <>{children}</>;
};
export default ConsentGate;