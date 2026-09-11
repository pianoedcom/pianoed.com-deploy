import { useEffect, useState } from "react";
import { List } from "lucide-react";
import { cn } from "@/lib/utils";
export interface TocHeading {
  id: string;
  text: string;
  level: number;
}
interface TableOfContentsProps {
  headings: TocHeading[];
}
/**
 * Table of Contents — desktop sidebar + mobile collapsible.
 *
 * Headings are extracted from the rendered MDX (rehype-slug IDs), not
 * parsed client-side from raw MDX, avoiding brittle regex parsing.
 *
 * On desktop: a sticky sidebar list with scroll-spy highlighting.
 * On mobile: a collapsible <details> element.
 *
 * Accessibility: uses <nav aria-label>, semantic links, and
 * aria-current to indicate the active section.
 */
const TableOfContents = ({ headings }: TableOfContentsProps) => {
  const [activeId, setActiveId] = useState<string>("");
  // Scroll spy: highlight the heading currently in view.
  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry closest to the top that is intersecting.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        // Trigger when heading is near the top third of the viewport.
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      },
    );
    // Observe each heading element in the article body.
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);
  if (headings.length < 2) return null;
  return (
    <>
      {/* Desktop: sticky sidebar */}
      <nav className="hidden lg:block" aria-label="Table of contents">
        <p className="eyebrow mb-3">Contents</p>
        <ul className="space-y-1.5 border-l border-border">
          {headings.map((h) => (
            <li key={h.id} style={{ paddingLeft: `${(h.level - 2) * 0.75}rem` }}>
              <a
                href={`#${h.id}`}
                className={cn(
                  "block border-l-2 py-1 pl-3 text-sm transition-colors -ml-px",
                  h.level === 2 ? "font-medium" : "font-normal",
                  activeId === h.id
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
                aria-current={activeId === h.id ? "true" : undefined}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {/* Mobile: collapsible */}
      <details className="mb-6 rounded-lg border border-border bg-muted/20 lg:hidden">
        <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          <List className="h-4 w-4" aria-hidden />
          Table of contents
        </summary>
        <ul className="space-y-1 px-4 pb-4">
          {headings.map((h) => (
            <li key={h.id} style={{ paddingLeft: `${(h.level - 2) * 0.75}rem` }}>
              <a
                href={`#${h.id}`}
                className={cn(
                  "block py-1 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  h.level === 2 ? "font-medium" : "font-normal",
                  activeId === h.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </>
  );
};
export default TableOfContents;