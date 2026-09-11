import { useState } from "react";
import { Mail, MapPin, MessageSquare } from "lucide-react";
import Container from "@/components/layout/Container";
import Seo from "@/components/layout/Seo";
import { useI18n } from "@/lib/i18n/context";
const ContactPage = () => {
  const { t, locale } = useI18n();
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Wire this to your API route or newsletter endpoint
    setSubmitted(true);
  };
  return (
    <>
      <Seo
        title={t("page.contact.seoTitle")}
        description={t("page.contact.seoDescription")}
        path="/contact"
        noindex={true}
        locale={locale}
      />
      <Container className="py-12">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow mb-2">{t("page.contact.eyebrow")}</p>
          <h1 className="display-heading text-4xl">{t("page.contact.title")}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{t("page.contact.subtitle")}</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center">
              <Mail className="h-5 w-5 text-accent" aria-hidden />
              <span className="text-sm font-medium text-foreground">
                {t("page.contact.emailLabel")}
              </span>
              <span className="text-xs text-muted-foreground">{t("page.contact.emailValue")}</span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center">
              <MessageSquare className="h-5 w-5 text-accent" aria-hidden />
              <span className="text-sm font-medium text-foreground">
                {t("page.contact.communityLabel")}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("page.contact.communityValue")}
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center">
              <MapPin className="h-5 w-5 text-accent" aria-hidden />
              <span className="text-sm font-medium text-foreground">
                {t("page.contact.locationLabel")}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("page.contact.locationValue")}
              </span>
            </div>
          </div>
          {submitted ? (
            <div className="mt-8 rounded-lg border border-accent/30 bg-accent/5 p-6 text-center">
              <h2 className="text-lg font-semibold text-foreground">
                {t("page.contact.thanksTitle")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("page.contact.thanksBody")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    {t("page.contact.nameLabel")}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    placeholder={t("page.contact.namePlaceholder")}
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    {t("page.contact.emailLabel2")}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    placeholder={t("page.contact.emailPlaceholder")}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="subject"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  {t("page.contact.subjectLabel")}
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  placeholder={t("page.contact.subjectPlaceholder")}
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  {t("page.contact.messageLabel")}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  placeholder={t("page.contact.messagePlaceholder")}
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {t("page.contact.send")}
              </button>
            </form>
          )}
        </div>
      </Container>
    </>
  );
};
export default ContactPage;