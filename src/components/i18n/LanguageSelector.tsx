/**
 * Language selector dropdown.
 *
 * Accessible dropdown that lists all supported locales and allows the user
 * to switch the UI language. The selection is persisted via the i18n context.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import VisuallyHidden from "@/components/ui/VisuallyHidden";
interface LanguageSelectorProps {
  /** Visual variant — "compact" for header, "full" for mobile menu. */
  variant?: "compact" | "full";
  className?: string;
}
export function LanguageSelector({ variant = "compact", className }: LanguageSelectorProps) {
  const { locale, supportedLocales, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, close]);
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
        close();
      }
    };
    const id = requestAnimationFrame(() => {
      document.addEventListener("mousedown", handleClickOutside);
    });
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, close]);
  const currentLocale = supportedLocales.find((l) => l.code === locale);
  if (variant === "full") {
    return (
      <div className={cn("border-t border-border pt-3", className)}>
        <span className="block px-0 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("language.selectLanguage")}
        </span>
        <div className="flex flex-wrap gap-2 pt-1">
          {supportedLocales.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLocale(l.code)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                l.code === locale
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
              aria-current={l.code === locale}
            >
              {l.nativeName}
            </button>
          ))}
        </div>
      </div>
    );
  }
  // Only show the selector if there's more than one locale
  if (supportedLocales.length <= 1) return null;
  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("language.selectLanguage")}
        className="flex items-center gap-1.5 rounded-md p-1.5 text-[#f5ecd7] hover:text-[#d4af37] hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37]"
      >
        <Globe className="h-4 w-4" aria-hidden />
        <span className="text-xs font-medium uppercase tracking-wide">{currentLocale?.code ?? locale}</span>
      </button>
      {open && (
        <div
          ref={panelRef}
          role="listbox"
          aria-label={t("language.selectLanguage")}
          className="animate-fade-in absolute right-0 top-full z-50 pt-1 min-w-[160px]"
        >
          <div className="rounded-lg border border-border bg-card p-1.5 shadow-lg">
            {supportedLocales.map((l) => (
              <button
                key={l.code}
                type="button"
                role="option"
                aria-selected={l.code === locale}
                onClick={() => {
                  setLocale(l.code);
                  close();
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  l.code === locale
                    ? "bg-accent/50 text-foreground font-medium"
                    : "text-foreground hover:bg-accent/30",
                )}
              >
                <span>{l.nativeName}</span>
                {l.code === locale && <Check className="h-3.5 w-3.5 text-accent" aria-hidden />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export default LanguageSelector;