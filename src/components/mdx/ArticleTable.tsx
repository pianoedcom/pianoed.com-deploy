import type { ReactNode } from "react";
/**
 * ArticleTable — responsive table wrapper.
 *
 * On narrow screens the table scrolls horizontally inside a bordered container,
 * keeping it keyboard-navigable. On wider screens it renders as a normal table.
 * A visually-hidden label informs screen reader users that the table is scrollable.
 */
interface ArticleTableProps {
  children: ReactNode;
}
export const ArticleTable = ({ children }: ArticleTableProps) => (
  <div
    className="my-6 overflow-x-auto rounded-lg border border-border"
    role="region"
    aria-label="Table — scroll horizontally to see more"
    tabIndex={0}
  >
    <table className="w-full border-collapse text-sm">{children}</table>
  </div>
);
export default ArticleTable;