import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { IconButton } from "./IconButton";
import VisuallyHidden from "./VisuallyHidden";
import { cn } from "@/lib/utils";
type Theme = "light" | "dark" | "system";
const STORAGE_KEY = "site-theme";
function getSystemPreference(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemPreference() : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}
/**
 * Accessible three-state theme toggle: light → dark → system.
 *
 * Persists choice to localStorage and reacts to system changes when in
 * "system" mode. The inline script in index.html prevents a flash of the
 * wrong theme before hydration.
 */
interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system";
    setTheme(stored);
    applyTheme(stored);
    setMounted(true);
  }, []);
  // React to system changes when in "system" mode
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);
  const cycle = () => {
    const next: Theme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  };
  const label =
    theme === "light"
      ? "Light theme — switch to dark"
      : theme === "dark"
        ? "Dark theme — switch to system"
        : "System theme — switch to light";
  return (
    <IconButton
      variant="ghost"
      size="sm"
      label={label}
      onClick={cycle}
      className={cn(
        "text-[#f5ecd7] hover:text-[#d4af37] hover:bg-white/10 transition-colors focus-visible:outline-[#d4af37]",
        !mounted && "opacity-0",
        className
      )}
    >
      {mounted ? (
        theme === "light" ? (
          <Sun className="h-4 w-4" aria-hidden />
        ) : theme === "dark" ? (
          <Moon className="h-4 w-4" aria-hidden />
        ) : (
          <Monitor className="h-4 w-4" aria-hidden />
        )
      ) : (
        <Sun className="h-4 w-4" aria-hidden />
      )}
      <VisuallyHidden>{label}</VisuallyHidden>
    </IconButton>
  );
};
export default ThemeToggle;