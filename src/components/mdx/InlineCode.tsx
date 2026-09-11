import type { ReactNode } from "react";
/**
 * InlineCode — styled inline code element.
 */
export const InlineCode = ({ children }: { children: ReactNode }) => (
  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
    {children}
  </code>
);
export default InlineCode;