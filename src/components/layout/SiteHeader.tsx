import { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
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
import PianoEdLogo from "@/components/brand/PianoEdLogo";

const enabledNavItems = getEnabledNavItems();
const headerCta = navigationConfig.cta;

/**
 * Site header with luxury classical banner texture, PianoEd crest logo,
 * config-driven navigation, and actions.
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
    <header
      className="sticky top-0 z-50 w-full border-b border-[#a87d3b]/40 shadow-lg text-[#f4e6d8]"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(34, 7, 10, 0.96) 0%, rgba(24, 5, 7, 0.93) 50%, rgba(34, 7, 10, 0.96) 100%), url('/images/brand/header-banner-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto flex h-20 w-full items-center justify-between px-4 sm:px-8">
        {/* Logo / Crest / Tagline */}
        <div className="flex items-center py-1">
          <PianoEdLogo variant="header" showTagline={true} />
        </div>

        {/* Desktop nav — config-driven */}
        <nav className="hidden items-center gap-7 lg:gap-8 md:flex" aria-label="Primary">
          {enabledNavItems.map((item) =>
            hasDropdown(item) ? (
              <MegaMenu key={item.id} item={item} />
            ) : (
              <NavLink
                key={item.id}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37] rounded-sm",
                    isActive
                      ? "text-[#fce4a6] font-semibold drop-shadow-sm"
                      : "text-[#f1dfce] hover:text-[#d4af37]"
                  )
                }
              >
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        {/* Desktop controls */}
        <div className="hidden items-center gap-2 md:flex">
          {headerCta && (
            <Link
              to={headerCta.href}
              className="mr-2 inline-flex items-center justify-center rounded-md border border-[#c69a54]/80 bg-[#1e0507]/90 px-4 py-2 text-xs sm:text-sm font-medium text-[#f6deb3] shadow-[0_2px_4px_rgba(0,0,0,0.6)] backdrop-blur-sm transition-all hover:bg-[#340b0e] hover:border-[#d4af37] hover:text-[#fff2d8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37]"
            >
              {headerCta.label}
            </Link>
          )}

          <div className="flex items-center text-[#f1dfce]">
            <SearchButton />
            <Link
              to="/about"
              className="rounded-full p-2 text-[#f1dfce] hover:text-[#d4af37] hover:bg-white/5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37]"
              aria-label="About PianoEd"
              title="About PianoEd"
            >
              <User className="h-4 w-4" aria-hidden />
            </Link>
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden text-[#f1dfce]">
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
            className="text-[#f1dfce] hover:text-[#d4af37] hover:bg-white/10"
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