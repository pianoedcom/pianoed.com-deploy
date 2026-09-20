/**
 * Configurable Navigation Schema
 *
 * Central, strongly-typed navigation configuration. Admins can enable/disable
 * items, rename labels, reorder, add dropdown children, badges, and mega-menu
 * groups. The SiteHeader and MobileNavigation consume this config — no need to
 * edit component code to change the menu.
 *
 * Preset C (Content + Tools): Articles, Tools, Resources, About, FAQ, Contact
 */
import { categories } from "../../../content/categories";
/* ── Types ──────────────────────────────────────────────────────────────── */
export interface NavChildItem {
  /** Display label */
  label: string;
  /** Internal path or external URL */
  href: string;
  /** Optional short description shown in mega-menu */
  description?: string;
  /** Optional icon name (lucide-react) */
  icon?: string;
  /** Mark as external link (opens new tab) */
  external?: boolean;
}
export interface NavMenuGroup {
  /** Group heading shown in the mega-menu panel */
  label: string;
  /** Links within this group */
  items: NavChildItem[];
}
export interface NavBadge {
  text: string;
  variant: "new" | "beta" | "hot";
}
export interface NavItem {
  /** Unique identifier */
  id: string;
  /** Display label in the nav bar */
  label: string;
  /** Internal route path or external URL */
  href: string;
  /** Enable/disable this item without removing it */
  enabled: boolean;
  /** Badge tag (e.g. "New", "Beta") */
  badge?: NavBadge;
  /** External link (opens new tab) */
  external?: boolean;
  /** Simple dropdown: single-column list of links */
  children?: NavChildItem[];
  /** Mega-menu: multi-column grouped links */
  groups?: NavMenuGroup[];
  /** Promo card shown in mega-menu (highlighted content) */
  promo?: {
    title: string;
    description: string;
    href: string;
    ctaLabel: string;
  };
  /** "View all" link at the bottom of dropdowns */
  viewAll?: { label: string; href: string };
}
export interface NavigationConfig {
  /** Top-level nav items in display order */
  items: NavItem[];
  /** Header CTA button */
  cta?: { label: string; href: string };
}
/* ── Preset C: Content + Tools ─────────────────────────────────────────── */
const MAX_DROPDOWN_CATEGORIES = 8;
export const navigationConfig: NavigationConfig = {
  items: [
    {
      id: "home",
      label: "Home",
      href: "/",
      enabled: true,
    },
    {
      id: "articles",
      label: "Articles",
      href: "/articles",
      enabled: true,
      groups: [
        {
          label: "Categories",
          items: categories.slice(0, MAX_DROPDOWN_CATEGORIES).map((cat) => ({
            label: cat.name,
            href: `/category/${cat.slug}`,
            description: cat.description,
          })),
        },
        {
          label: "Browse",
          items: [
            { label: "All Articles", href: "/articles", description: "Browse every article" },
            {
              label: "By Author",
              href: "/articles#authors",
              description: "Find writers you follow",
            },
            { label: "Archive", href: "/articles#archive", description: "Past articles by month" },
          ],
        },
      ],
      ...(categories.length > MAX_DROPDOWN_CATEGORIES
        ? { viewAll: { label: "View all categories", href: "/articles#categories" } }
        : {}),
    },
    {
      id: "tools",
      label: "Tools",
      href: "/tools",
      enabled: true,
      groups: [
        {
          label: "Interactive Tools",
          items: [
            {
              label: "Metronome",
              href: "/tools/metronome",
              description: "Practice with tempo markings and tap-tempo",
            },
            {
              label: "Piano Note Finder",
              href: "/tools/piano-note-finder",
              description: "Interactive keyboard with note names and scales",
            },
            {
              label: "Scale & Chord Reference",
              href: "/tools/scale-chord-reference",
              description: "Look up scales and chords by key",
            },
            {
              label: "Practice Timer",
              href: "/tools/practice-timer",
              description: "Structure your practice sessions",
            },
          ],
        },
      ],
    },
    {
      id: "resources",
      label: "Resources",
      href: "/resources",
      enabled: true,
      groups: [
        {
          label: "Reference",
          items: [
            {
              label: "Sheet Music Library",
              href: "/resources/sheet-music-library",
              description: "Curated sheet music across all genres",
            },
            {
              label: "Piano Glossary",
              href: "/resources/piano-glossary",
              description: "Piano terms explained warmly",
            },
            {
              label: "Practice Exercises",
              href: "/resources/practice-exercises",
              description: "Hanon, Czerny, scales with tips",
            },
            {
              label: "Books & Recordings",
              href: "/resources/recommended-books-recordings",
              description: "Recommended piano books and recordings",
            },
          ],
        },
      ],
      promo: {
        title: "Getting Started with Piano",
        description: "Everything you need to begin your piano journey with confidence.",
        href: "/resources/getting-started",
        ctaLabel: "Read guide",
      },
    },
    { id: "about", label: "About", href: "/about", enabled: false },
    { id: "faq", label: "FAQ", href: "/faq", enabled: false },
    { id: "contact", label: "Contact", href: "/contact", enabled: false },
  ],
  cta: { label: "Share a Tip", href: "/contact" },
};
/* ── Helpers ───────────────────────────────────────────────────────────── */
/** Returns only enabled nav items */
export function getEnabledNavItems(): NavItem[] {
  return navigationConfig.items.filter((item) => item.enabled);
}
/** Check if a nav item has a dropdown (children or groups) */
export function hasDropdown(item: NavItem): boolean {
  return !!item.children || !!item.groups;
}