import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
interface MainContentProps {
  children: ReactNode;
  className?: string;
}
/**
 * Semantic <main> wrapper. Sits between the site header and footer,
 * flexes to fill available vertical space.
 */
const MainContent = ({ children, className }: MainContentProps) => {
  return (
    <main className={cn("flex-1", className)} id="main-content">
      {children}
    </main>
  );
};
export default MainContent;