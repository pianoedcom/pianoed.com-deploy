import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSelector } from "@/components/i18n/LanguageSelector";
import { getEnabledNavItems, hasDropdown } from "@/lib/config/navigation";
import type { NavItem, NavMenuGroup } from "@/lib/config/navigation";
interface MobileNavigationProps {
  open: boolean;
  onClose: () => void;
}
const enabledNavItems = getEnabledNavItems();
/** Flatten groups or children into a single list for mobile accordion */
function getItemLinks(item: NavItem): NavMenuGroup[] {
  if (item.groups) return item.groups;
  if (item.children) return [{ label: item.label, items: item.children }];
  return [];
}
/** Collapsible accordion section for nav items with dropdowns */
function MobileAccordion({ item, onClose }: { item: NavItem; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const groups = getItemLinks(item);
  return (
    <div className="border-b border-border">
      <div className="flex items-center justify-between">
        <NavLink
          to={item.href}
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              "flex-1 py-3 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )
          }
        >
          {item.label}
        </NavLink>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={`Toggle ${item.label} sub-menu`}
          className="rounded-sm p-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-150", expanded && "rotate-180")}
            aria-hidden
          />
        </button>
      </div>
      {expanded && (
        <div className="pb-3">
          {groups.map((group) => (
            <div key={group.label} className="mb-2">
              <span className="block px-0 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </span>
              {group.items.map((child) => (
                <NavLink
                  key={child.href}
                  to={child.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "block py-2 pl-4 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      isActive
                        ? "text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground",
                    )
                  }
                >
                  {child.label}
                </NavLink>
              ))}
            </div>
          ))}
          {item.viewAll && (
            <NavLink
              to={item.viewAll.href}
              onClick={onClose}
              className="block py-2 pl-4 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.viewAll.label} →
            </NavLink>
          )}
        </div>
      )}
    </div>
  );
}
/**
 * Mobile navigation panel — slides down below the header.
 *
 * Uses config-driven nav items with collapsible accordion sections for
 * items that have dropdowns (groups or children).
 */
const MobileNavigation = ({ open, onClose }: MobileNavigationProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  // Focus management: move focus into the panel when opened
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const firstLink = panel.querySelector<HTMLAnchorElement>("a");
    firstLink?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const focusable = Array.from(
          panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    panel.addEventListener("keydown", handleKeyDown);
    return () => panel.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      ref={panelRef}
      className="border-t border-border bg-background md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
    >
      <nav className="flex flex-col px-5 py-4" aria-label="Mobile">
        {enabledNavItems.map((item) =>
          hasDropdown(item) ? (
            <MobileAccordion key={item.id} item={item} onClose={onClose} />
          ) : (
            <NavLink
              key={item.id}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "border-b border-border py-3 text-base font-medium transition-colors last:border-b-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {item.label}
            </NavLink>
          ),
        )}
        {/* Language selector */}
        <div className="mt-3">
          <LanguageSelector variant="full" />
        </div>
      </nav>
    </div>
  );
};
export default MobileNavigation;