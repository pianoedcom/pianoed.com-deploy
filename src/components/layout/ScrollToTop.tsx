import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Automatically scrolls window to top on route navigation.
 * Preserves anchor hash scrolling if a hash target exists in the URL.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // If there's a hash, allow anchor navigation to target element
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);

  return null;
}
