import { useEffect, useState } from "react";
import { Toaster as Sonner, toast } from "sonner";
type ToasterProps = React.ComponentProps<typeof Sonner>;
/**
 * Sonner toaster — themed to match the design system.
 *
 * Reads the theme from localStorage (same key as ThemeToggle) instead
 * of using next-themes, which requires a provider we don't mount.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  useEffect(() => {
    const stored = localStorage.getItem("site-theme");
    if (stored === "light" || stored === "dark" || stored === "system") {
      setTheme(stored);
    }
  }, []);
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};
export { Toaster, toast };