import type { ReactNode } from "react";
/**
 * Quote — styled blockquote with a left accent border.
 */
interface QuoteProps {
  children: ReactNode;
  cite?: string;
}
export const Quote = ({ children, cite }: QuoteProps) => (
  <blockquote
    cite={cite}
    className="my-6 border-l-4 border-primary/40 pl-4 italic text-muted-foreground text-lg leading-relaxed"
  >
    {children}
    {cite ? (
      <footer className="mt-2 text-sm not-italic text-muted-foreground/80">
        — <cite>{cite}</cite>
      </footer>
    ) : null}
  </blockquote>
);
export default Quote;