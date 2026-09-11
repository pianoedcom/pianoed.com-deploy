import type { ReactNode } from "react";
import Breadcrumbs, { type BreadcrumbItem } from "./Breadcrumbs";
interface TaxonomyHeaderProps {
  /** Eyebrow / kicker label, e.g. "Category" or "Archive". */
  eyebrow: string;
  /** Page title, e.g. "Software Craft" or "Archive: 2025". */
  title: string;
  /** Optional description shown below the title. */
  description?: string;
  /** Breadcrumb trail items. */
  breadcrumbs: BreadcrumbItem[];
  /** Optional content rendered after the description (e.g. post count). */
  children?: ReactNode;
}
/**
 * Shared header for taxonomy listing pages (category, tag, author,
 * archive). Provides consistent breadcrumbs, eyebrow, title, and
 * description styling across all listing pages.
 */
const TaxonomyHeader = ({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
}: TaxonomyHeaderProps) => {
  return (
    <header className="mb-10">
      <Breadcrumbs items={breadcrumbs} />
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h1 className="display-heading mb-4 text-3xl text-foreground sm:text-4xl">{title}</h1>
      {description ? (
        <p className="max-w-2xl text-lg text-muted-foreground">{description}</p>
      ) : null}
      {children}
    </header>
  );
};
export default TaxonomyHeader;