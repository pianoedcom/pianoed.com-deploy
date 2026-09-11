import { cn } from "@/lib/utils";
interface ChecklistBoxProps {
  title?: string;
  items: string[];
  className?: string;
}
/**
 * Checklist box for self-audit tools and step-by-step checklists.
 * Renders a styled list with checkbox icons.
 */
const ChecklistBox = ({ title = "Checklist", items, className }: ChecklistBoxProps) => {
  return (
    <div className={cn("my-6 rounded-lg border border-border bg-card p-5", className)}>
      <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground">
            <span
              className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-border text-accent"
              aria-hidden
            >
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default ChecklistBox;