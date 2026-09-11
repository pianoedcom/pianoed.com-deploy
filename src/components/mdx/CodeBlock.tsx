import { useState, type ReactNode } from "react";
/**
 * CodeBlock — client component for fenced code with copy-to-clipboard.
 *
 * Renders horizontally scrollable on narrow screens and provides a keyboard-
 * accessible copy button. Syntax highlighting classes are applied by
 * rehype-highlight at compile time; this component only handles layout and
 * the copy affordance.
 */
interface CodeBlockProps {
  children: ReactNode;
  className?: string;
}
function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return extractText((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}
export const CodeBlock = ({ children, className }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    const text = extractText(children);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may be unavailable; fail silently.
    }
  };
  return (
    <div className="group relative my-6 overflow-hidden rounded-lg border border-border bg-muted/40">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Code copied to clipboard" : "Copy code to clipboard"}
        className="absolute right-2 top-2 z-10 rounded-md border border-border bg-background/80 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-opacity focus:opacity-100 group-hover:opacity-100 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre
        className={`overflow-x-auto p-4 text-sm leading-relaxed ${className ?? ""}`}
        tabIndex={0}
      >
        {children}
      </pre>
    </div>
  );
};
export default CodeBlock;