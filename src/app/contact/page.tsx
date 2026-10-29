import { useState } from "react";
import { Mail, MapPin, MessageSquare, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Container from "@/components/layout/Container";
import Seo from "@/components/layout/Seo";
import { useI18n } from "@/lib/i18n/context";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  _gotcha: string; // Anti-spam honeypot
}

const INITIAL_FORM: ContactFormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
  _gotcha: "",
};

const ContactPage = () => {
  const { t, locale } = useI18n();
  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const webhookUrl = import.meta.env.VITE_CONTACT_FORM_WEBHOOK_URL;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Anti-spam honeypot drop
    if (formData._gotcha) {
      setSubmitted(true);
      return;
    }

    // 2. Validate endpoint
    if (!webhookUrl) {
      setErrorMessage(
        "Contact form webhook is temporarily unconfigured. Please email us directly or try again later.",
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        referrer: typeof window !== "undefined" ? window.location.href : "",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      };

      // Use text/plain transport to avoid CORS preflight OPTIONS rejection on Google Apps Script
      const response = await fetch(webhookUrl, {
        method: "POST",
        redirect: "follow",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "success") {
        setSubmitted(true);
        setFormData(INITIAL_FORM);
      } else {
        throw new Error(result.message || "Failed to submit message.");
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Something went wrong. Please try again or reach out directly by email.";
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tSafe = (key: string, fallback: string) => {
    const val = t(key);
    return val && val !== key ? val : fallback;
  };

  return (
    <>
      <Seo
        title={tSafe("page.contact.seoTitle", "Contact — Get in Touch")}
        description={tSafe(
          "page.contact.seoDescription",
          "Have a question, feedback, or collaboration idea? Reach out to the PianoEd team.",
        )}
        path="/contact"
        noindex={true}
        locale={locale}
      />
      <Container className="py-12">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow mb-2">{tSafe("page.contact.eyebrow", "Contact")}</p>
          <h1 className="display-heading text-4xl">{tSafe("page.contact.title", "Get in touch")}</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {tSafe("page.contact.subtitle", "Questions, collaboration inquiries, or feedback — we'd love to hear from you.")}
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center">
              <Mail className="h-5 w-5 text-accent" aria-hidden />
              <span className="text-sm font-medium text-foreground">
                {tSafe("page.contact.emailLabel", "Email")}
              </span>
              <a
                href="mailto:contact@pianoed.com"
                className="text-xs text-muted-foreground hover:text-accent transition-colors"
              >
                {tSafe("page.contact.emailValue", "contact@pianoed.com")}
              </a>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center">
              <MessageSquare className="h-5 w-5 text-accent" aria-hidden />
              <span className="text-sm font-medium text-foreground">
                {tSafe("page.contact.communityLabel", "Community")}
              </span>
              <span className="text-xs text-muted-foreground">
                {tSafe("page.contact.communityValue", "Discord & Forum")}
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center">
              <MapPin className="h-5 w-5 text-accent" aria-hidden />
              <span className="text-sm font-medium text-foreground">
                {tSafe("page.contact.locationLabel", "Location")}
              </span>
              <span className="text-xs text-muted-foreground">
                {tSafe("page.contact.locationValue", "Global / Remote-First")}
              </span>
            </div>
          </div>

          {submitted ? (
            <div className="mt-8 rounded-lg border border-accent/30 bg-accent/5 p-8 text-center animate-in fade-in zoom-in-95">
              <CheckCircle2 className="mx-auto h-10 w-10 text-accent mb-3" />
              <h2 className="text-xl font-semibold text-foreground">
                {tSafe("page.contact.thanksTitle", "Thanks for reaching out!")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {tSafe(
                  "page.contact.thanksBody",
                  "Your message has been received. We'll get back to you as soon as possible.",
                )}
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-6 inline-flex text-xs font-semibold text-accent hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Honeypot anti-spam field hidden from human users */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="_gotcha">Do not fill this field if human</label>
                <input
                  type="text"
                  id="_gotcha"
                  name="_gotcha"
                  value={formData._gotcha}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    {tSafe("page.contact.nameLabel", "Name")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
                    placeholder={tSafe("page.contact.namePlaceholder", "Your name")}
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    {tSafe("page.contact.emailLabel2", "Email")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
                    placeholder={tSafe("page.contact.emailPlaceholder", "you@example.com")}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  {tSafe("page.contact.subjectLabel", "Subject")} <span className="text-destructive">*</span>
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
                  placeholder={tSafe("page.contact.subjectPlaceholder", "What is this regarding?")}
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  {tSafe("page.contact.messageLabel", "Message")}{" "}
                  <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
                  placeholder={tSafe("page.contact.messagePlaceholder", "Tell us more...")}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending message...</span>
                  </>
                ) : (
                  <span>{tSafe("page.contact.send", "Send message")}</span>
                )}
              </button>
            </form>
          )}
        </div>
      </Container>
    </>
  );
};

export default ContactPage;