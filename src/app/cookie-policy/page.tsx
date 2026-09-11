/**
 * Cookie Policy page — auto-generated from src/lib/config/cookies.ts
 *
 * Dynamically populates the cookie table from the central config so the
 * policy page is always in sync with the actual cookies used.
 */
import Seo from "@/components/layout/Seo";
import Container from "@/components/layout/Container";
import { Link } from "react-router-dom";
import { cookieConfig, getCookiesByCategory, type CookieCategory } from "@/lib/config/cookies";
const CookiePolicyPage = () => {
  return (
    <>
      <Seo
        title="Cookie Policy"
        description="Learn how we use cookies on this site, what each cookie does, and how to manage your preferences."
        path="/cookie-policy"
        noindex
      />
      <Container className="py-12" width="article">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground">Cookie Policy</h1>
        <p className="mb-6 text-muted-foreground">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <div className="prose-body space-y-6">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">What Are Cookies</h2>
            <p className="text-muted-foreground">
              Cookies are small text files stored on your device when you visit a website. They help
              the site function properly, remember your preferences, and provide insights into how
              the site is used. We use cookies to enhance your browsing experience and to understand
              how our site is performing.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">Types of Cookies We Use</h2>
            <p className="mb-4 text-muted-foreground">
              We categorize our cookies into four types. You can control which optional cookies are
              set by adjusting your{" "}
              <Link to="/cookie-policy" onClick={() => {}} className="text-accent underline">
                cookie preferences
              </Link>{" "}
              at any time.
            </p>
            {cookieConfig.categories.map((cat) => (
              <div key={cat.id} className="mb-6">
                <h3 className="mb-1 text-lg font-semibold text-foreground">
                  {cat.label}
                  {cat.alwaysEnabled && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      (Always Enabled)
                    </span>
                  )}
                </h3>
                <p className="mb-3 text-sm text-muted-foreground">{cat.description}</p>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="pb-2 pr-3 font-medium">Name</th>
                        <th className="pb-2 pr-3 font-medium">Provider</th>
                        <th className="pb-2 pr-3 font-medium">Purpose</th>
                        <th className="pb-2 pr-3 font-medium">Expiration</th>
                        <th className="pb-2 font-medium">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getCookiesByCategory(cat.id as CookieCategory).map((cookie) => (
                        <tr key={cookie.name} className="border-b border-border/50">
                          <td className="py-2 pr-3 font-mono text-foreground">{cookie.name}</td>
                          <td className="py-2 pr-3 text-muted-foreground">{cookie.provider}</td>
                          <td className="py-2 pr-3 text-muted-foreground">{cookie.purpose}</td>
                          <td className="py-2 pr-3 text-muted-foreground">{cookie.expiration}</td>
                          <td className="py-2 text-muted-foreground">{cookie.type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </section>
          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Managing Your Preferences
            </h2>
            <p className="text-muted-foreground">
              You can change your cookie preferences at any time by clicking the "Cookie Settings"
              link in the footer or the settings icon in the bottom-left corner of the screen. You
              can also clear cookies through your browser settings.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">Third-Party Services</h2>
            <p className="text-muted-foreground">
              We may use third-party services that set their own cookies. These services are listed
              in the table above under their respective categories. Third-party cookies are only
              loaded after you have granted consent for their category.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">Consent Mode</h2>
            <p className="text-muted-foreground">
              This site operates in <strong>opt-in</strong> consent mode, meaning non-essential
              cookies are only set after you explicitly grant permission. You can withdraw consent
              at any time through the cookie settings panel.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">Contact</h2>
            <p className="text-muted-foreground">
              If you have questions about our use of cookies, please{" "}
              <Link to="/contact" className="text-accent underline">
                contact us
              </Link>
              .
            </p>
          </section>
        </div>
      </Container>
    </>
  );
};
export default CookiePolicyPage;