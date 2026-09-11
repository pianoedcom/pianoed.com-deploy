import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
interface VisuallyHiddenProps {
  children: ReactNode;
  className?: string;
}
/**
 * Hides content visually while keeping it accessible to screen readers.
 * Use for labels, descriptions, and skip-links that sighted users don't need.
 */
const VisuallyHidden = ({ children, className }: VisuallyHiddenProps) => {
  return <span className={cn("sr-only", className)}>{children}</span>;
};
export default VisuallyHidden;