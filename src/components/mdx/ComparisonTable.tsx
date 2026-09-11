import { cn } from "@/lib/utils";
interface ComparisonTableProps {
  title?: string;
  columns: string[];
  rows: { label: string; values: (string | boolean)[] }[];
  className?: string;
}
/**
 * Comparison table for side-by-side tool/platform comparisons.
 * Renders a styled markdown-like table using design system tokens.
 */
const ComparisonTable = ({ title, columns, rows, className }: ComparisonTableProps) => {
  return (
    <div className={cn("my-6 overflow-x-auto rounded-lg border border-border", className)}>
      {title && (
        <div className="border-b border-border bg-muted/40 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">{title}</p>
        </div>
      )}
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Feature
            </th>
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row.label}
              className={cn(
                "border-b border-border last:border-b-0",
                idx % 2 === 1 && "bg-muted/20",
              )}
            >
              <td className="px-4 py-3 text-sm font-medium text-foreground">{row.label}</td>
              {row.values.map((val, vIdx) => (
                <td key={vIdx} className="px-4 py-3 text-sm text-muted-foreground">
                  {typeof val === "boolean" ? (
                    val ? (
                      <span className="text-accent" aria-label="Yes">
                        ✓
                      </span>
                    ) : (
                      <span className="text-destructive" aria-label="No">
                        ✗
                      </span>
                    )
                  ) : (
                    val
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default ComparisonTable;