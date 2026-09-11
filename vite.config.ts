import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "@leadconnector/vibe-tagger";
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [".modal.host"],
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger({ tailwindConfig: true }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "radix-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-accordion",
            "@radix-ui/react-tabs",
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-label",
            "@radix-ui/react-progress",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-separator",
            "@radix-ui/react-switch",
            "@radix-ui/react-toast",
            "@radix-ui/react-avatar",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-collapsible",
            "@radix-ui/react-context-menu",
            "@radix-ui/react-hover-card",
            "@radix-ui/react-menubar",
            "@radix-ui/react-navigation-menu",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-slider",
            "@radix-ui/react-slot",
            "@radix-ui/react-toggle",
            "@radix-ui/react-toggle-group",
            "@radix-ui/react-aspect-ratio",
          ],
          "query-vendor": ["@tanstack/react-query"],
          "chart-vendor": ["recharts"],
          "date-vendor": ["date-fns"],
          "mdx-vendor": [
            "@mdx-js/mdx",
            "remark-gfm",
            "rehype-slug",
            "rehype-highlight",
            "rehype-sanitize",
          ],
          "form-vendor": ["react-hook-form", "@hookform/resolvers", "zod"],
          "ui-vendor": [
            "cmdk",
            "sonner",
            "vaul",
            "embla-carousel-react",
            "input-otp",
            "react-day-picker",
            "react-resizable-panels",
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
            "lucide-react",
            "next-themes",
            "react-error-boundary",
          ],
        },
      },
    },
  },
}));