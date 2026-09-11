import { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { IconButton } from "@/components/ui/IconButton";
import ThemeToggle from "@/components/ui/ThemeToggle";
import SearchButton from "@/components/ui/SearchButton";
import VisuallyHidden from "@/components/ui/VisuallyHidden";
import MobileNavigation from "./MobileNavigation";
import { LanguageSelector } from "@/components/i18n/LanguageSelector";
import { cn } from "@/lib/utils";
import { navigationConfig, getEnabledNavItems, hasDropdown } from "@/lib/config/navigation";
import { MegaMenu } from "./MegaMenu";
import { MascotMark } from "@/components/brand/Mascot";
const enabledNavItems = getEnabledNavItems();
const headerCta = navigationConfig.cta;
/**
 * Site header with config-driven desktop navigation, mega-menu dropdowns,
 * theme toggle, search trigger, and language selector.
 * The mobile menu is rendered via MobileNavigation (client-side dialog).
 */
const SiteHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  // Close mobile menu on route change
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = () => setMobileOpen(false);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [mobileOpen]);
  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);
  // Return focus to the toggle button when the menu closes
  useEffect(() => {
    if (!mobileOpen) {
      toggleRef.current?.focus();
    }
  }, [mobileOpen]);
  const closeMenu = () => setMobileOpen(false);
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-5 sm:px-8">
        {/* Logo / site name */}
        <Link
          to="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
          aria-label={`${siteConfig.name} home`}
        >
          <MascotMark className="text-primary" />
          <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
            {siteConfig.name}
          </span>
        </Link>
        {/* Desktop nav — config-driven */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {enabledNavItems.map((item) =>
            hasDropdown(item) ? (
              <MegaMenu key={item.id} item={item} />
            ) : (
              <NavLink
                key={item.id}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm",
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>
        {/* Desktop controls */}
        <div className="hidden items-center gap-1 md:flex">
          {headerCta && (
            <Link
              to={headerCta.href}
              className="mr-2 rounded-md bg-accent px-3.5 py-1.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {headerCta.label}
            </Link>
          )}
          <SearchButton />
          <LanguageSelector />
          <ThemeToggle />
        </div>
        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <SearchButton />
          <ThemeToggle />
          <IconButton
            ref={toggleRef}
            variant="ghost"
            size="sm"
            label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
            <VisuallyHidden>{mobileOpen ? "Close menu" : "Open menu"}</VisuallyHidden>
          </IconButton>
        </div>
      </div>
      {/* Mobile navigation panel */}
      <MobileNavigation open={mobileOpen} onClose={closeMenu} />
    </header>
  );
};
export default SiteHeader;