import { Link } from "react-router-dom";
import { siteConfig } from "@/lib/site-config";
import { track } from "@/lib/analytics";
import Container from "./Container";
import CookieSettingsTrigger from "@/components/cookies/CookieSettingsTrigger";
import FooterNewsletterCTA from "@/components/growth/FooterNewsletterCTA";
import PianoEdLogo from "@/components/brand/PianoEdLogo";

const exploreNav = [
  { label: "Articles", to: "/articles" },
  { label: "Tools", to: "/tools" },
  { label: "Resources", to: "/resources" },
  { label: "Browse by Category", to: "/articles#categories" },
  { label: "Browse by Tag", to: "/articles#tags" },
];

const aboutNav = [
  { label: "About Us", to: "/about" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
  { label: "Search", to: "/search" },
];

const socialLinks = [
  { label: "Twitter", href: siteConfig.social.twitter },
  { label: "GitHub", href: siteConfig.social.github },
  { label: "LinkedIn", href: siteConfig.social.linkedin },
  { label: "RSS Feed", href: "/feed.xml" },
  { label: "Sitemap", href: "/sitemap.xml" },
];

/**
 * Site footer with navigation, social links, and copyright.
 * Uses a balanced editorial grid layout.
 */
const SiteFooter = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-muted/30">
      <Container className="py-12">
        <FooterNewsletterCTA />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand + description */}
          <div className="max-w-xs">
            <PianoEdLogo variant="footer" showTagline={true} />
            <p className="mt-3 text-sm text-muted-foreground">{siteConfig.description}</p>
          </div>
          {/* Explore */}
          <nav aria-label="Explore">
            <h2 className="eyebrow mb-3">Explore</h2>
            <ul className="space-y-2">
              {exploreNav.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {/* About / FAQ / Contact */}
          <nav aria-label="About and Support">
            <h2 className="eyebrow mb-3">About</h2>
            <ul className="space-y-2">
              {aboutNav.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {/* Social & Feeds */}
          <nav aria-label="Social media and feeds">
            <h2 className="eyebrow mb-3">Connect</h2>
            <ul className="space-y-2">
              {socialLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    onClick={() =>
                      item.href.startsWith("http") &&
                      track("outbound_link_click", { url: item.href })
                    }
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {year} {siteConfig.name}. Built with care for the web.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/cookie-policy"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Cookie Policy
            </Link>
            <CookieSettingsTrigger variant="link" label="Cookie Settings" />
          </div>
        </div>
      </Container>
    </footer>
  );
};
export default SiteFooter;