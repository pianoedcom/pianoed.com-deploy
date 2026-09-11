import { useState, useEffect, useRef, useCallback } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import VisuallyHidden from "@/components/ui/VisuallyHidden";
import type { NavItem, NavChildItem, NavMenuGroup } from "@/lib/config/navigation";
/* ── Badge component ────────────────────────────────────────────────────── */
function NavBadge({ variant, text }: { variant: "new" | "beta" | "hot"; text: string }) {
  const styles: Record<string, string> = {
    new: "bg-accent/15 text-accent border-accent/30",
    beta: "bg-secondary text-secondary-foreground border-border",
    hot: "bg-destructive/10 text-destructive border-destructive/30",
  };
  return (
    <span
      className={cn(
        "ml-1.5 inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        styles[variant],
      )}
    >
      {text}
    </span>
  );
}
/* ── Mega-Menu Panel ───────────────────────────────────────────────────── */
function MegaMenuPanel({
  item,
  isOpen,
  onClose,
}: {
  item: NavItem;
  isOpen: boolean;
  onClose: () => void;
}) {
  // Build groups: explicit groups take priority, otherwise use children as a single group
  const groups: NavMenuGroup[] = item.groups
    ? item.groups
    : item.children
      ? [{ label: item.label, items: item.children }]
      : [];
  return (
    <div
      className="animate-fade-in absolute left-0 top-full z-50 pt-1"
      style={{ minWidth: groups.length > 1 ? "560px" : "240px" }}
    >
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xl">
        {/* Multi-column grid for grouped links */}
        {groups.length > 1 && (
          <div className="grid grid-cols-2 gap-0">
            {groups.map((group) => (
              <div key={group.label} className="p-4">
                <h3 className="eyebrow mb-2.5">{group.label}</h3>
                <nav aria-label={group.label} className="space-y-0.5">
                  {group.items.map((child) => (
                    <MegaMenuLink key={child.href} child={child} onClose={onClose} />
                  ))}
                </nav>
              </div>
            ))}
          </div>
        )}
        {/* Single-column layout for 1 group */}
        {groups.length === 1 && (
          <div className="p-2">
            <nav aria-label={groups[0].label} className="space-y-0.5">
              {groups[0].items.map((child) => (
                <MegaMenuLink key={child.href} child={child} onClose={onClose} />
              ))}
            </nav>
          </div>
        )}
        {/* Promo card (shown in multi-column mode) */}
        {item.promo && groups.length > 1 && (
          <Link
            to={item.promo.href}
            onClick={onClose}
            className="flex items-center justify-between gap-3 border-t border-border bg-secondary/50 px-5 py-3.5 transition-colors hover:bg-secondary"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">{item.promo.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.promo.description}</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-accent">
              {item.promo.ctaLabel}
              <ArrowRight className="h-3 w-3" aria-hidden />
            </span>
          </Link>
        )}
        {/* View all link */}
        {item.viewAll && (
          <div className="border-t border-border px-4 py-2">
            <Link
              to={item.viewAll.href}
              onClick={onClose}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.viewAll.label} →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
/* ── Individual mega-menu link ──────────────────────────────────────────── */
function MegaMenuLink({ child, onClose }: { child: NavChildItem; onClose: () => void }) {
  if (child.external) {
    return (
      <a
        href={child.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        className="block rounded-md px-3 py-2 transition-colors hover:bg-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <span className="block text-sm font-medium text-foreground">{child.label}</span>
        {child.description && (
          <span className="block text-xs text-muted-foreground">{child.description}</span>
        )}
      </a>
    );
  }
  return (
    <NavLink
      to={child.href}
      onClick={onClose}
      className={({ isActive }) =>
        cn(
          "block rounded-md px-3 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          isActive ? "bg-accent/10 text-accent" : "hover:bg-accent/50",
        )
      }
    >
      <span className="block text-sm font-medium text-foreground">{child.label}</span>
      {child.description && (
        <span className="block text-xs text-muted-foreground">{child.description}</span>
      )}
    </NavLink>
  );
}
/* ── Main MegaMenu trigger + panel ──────────────────────────────────────── */
export function MegaMenu({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const openMenu = useCallback(() => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setOpen(true);
  }, []);
  const closeMenu = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    setOpen(false);
  }, []);
  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(openMenu, 50);
  };
  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    leaveTimeoutRef.current = setTimeout(() => setOpen(false), 200);
  };
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, closeMenu]);
  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        closeMenu();
      }
    };
    const id = requestAnimationFrame(() => {
      document.addEventListener("mousedown", handleClickOutside);
    });
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, closeMenu]);
  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="flex items-center gap-1">
        <NavLink
          to={item.href}
          end
          className={({ isActive }) =>
            cn(
              "text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )
          }
        >
          {item.label}
          {item.badge && <NavBadge variant={item.badge.variant} text={item.badge.text} />}
        </NavLink>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => (open ? closeMenu() : openMenu())}
          onMouseEnter={(e) => {
            e.stopPropagation();
            openMenu();
          }}
          aria-haspopup="menu"
          aria-expanded={open}
          className="rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform duration-150", open && "rotate-180")}
            aria-hidden
          />
          <VisuallyHidden>Toggle {item.label} menu</VisuallyHidden>
        </button>
      </div>
      {open && (
        <div ref={panelRef} onMouseEnter={openMenu} onMouseLeave={handleMouseLeave}>
          <MegaMenuPanel item={item} isOpen={open} onClose={closeMenu} />
        </div>
      )}
    </div>
  );
}
export default MegaMenu;