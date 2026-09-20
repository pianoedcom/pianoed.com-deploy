import type { ReactNode, ElementType } from "react";
import { cn } from "@/lib/utils";
interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** "default" = content-width (72rem), "wide" = content-width (72rem), "article" = reading-width (42rem), "full" = no max. */
  width?: "default" | "wide" | "article" | "full";
  as?: ElementType;
}
const widthMap = {
  default: "max-w-content",
  wide: "max-w-content",
  article: "max-w-article",
  full: "",
} as const;
/**
 * Centered content container with consistent horizontal padding.
 * Use `width="article"` for long-form prose, `width="default"` for listings.
 */
const Container = ({ children, className, width = "default", as: Tag = "div" }: ContainerProps) => {
  return (
    <Tag className={cn("mx-auto w-full px-5 sm:px-8", widthMap[width], className)}>{children}</Tag>
  );
};
export default Container;