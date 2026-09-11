import { useState, useEffect, useCallback, type FormEvent } from "react";
import { track } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";
import { getNewsletterProvider } from "@/lib/integrations/newsletter";
import { isSubscribed, setSubscribedStatus } from "@/lib/newsletter/storage";

export const FooterNewsletterCTA = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    setSubscribed(isSubscribed());
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!email.trim()) return;

      setStatus("loading");
      track("newsletter_footer_click");
      const provider = getNewsletterProvider();

      try {
        let result: { success: boolean; error?: string };
        if (provider) {
          result = await provider.subscribe(email);
        } else {
          const res = await fetch("/api/newsletter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          result = (await res.json()) as { success: boolean; error?: string };
        }

        if (result.success) {
          setStatus("success");
          setSubscribed(true);
          setSubscribedStatus(true);
          track("newsletter_footer_signup", { url: siteConfig.url });
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    },
    [email],
  );

  return (
    <div className="border-b border-border/80 pb-10 mb-10">
      <div className="rounded-2xl bg-card border border-border/60 p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7">
            <span className="eyebrow text-primary mb-2 inline-block">Stay in tune</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Master the piano, one insight at a time.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Join thousands of musicians and learners receiving practical technique tips, theory
              breakdowns, and curated repertoire directly in their inboxes.
            </p>
          </div>

          <div className="lg:col-span-5">
            {subscribed || status === "success" ? (
              <div
                className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center"
                role="status"
                aria-live="polite"
              >
                <p className="font-medium text-sm text-foreground">You are subscribed to the newsletter!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Thank you for following along with Pianoed.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2.5" noValidate>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={status === "loading"}
                    className="flex-1 rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    autoComplete="email"
                    aria-label="Email address for newsletter"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading" || !email.trim()}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {status === "loading" ? "Joining..." : "Subscribe"}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Free weekly issues. Unsubscribe in one click.
                  </p>
                  {status === "error" && (
                    <p className="text-xs text-destructive font-medium" role="alert">
                      Failed to subscribe. Please try again.
                    </p>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterNewsletterCTA;
