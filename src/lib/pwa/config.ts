/**
 * PWA configuration.
 *
 * This module exports a configuration object that can be consumed by
 * `vite-plugin-pwa` once it's installed. The plugin is not included by
 * default to keep the starter lean — install it when you need offline
 * support or installable app behavior.
 *
 * Installation:
 *   pnpm add -D vite-plugin-pwa
 *
 * Then add to vite.config.ts:
 *   import { VitePWA } from "vite-plugin-pwa";
 *   import { pwaConfig } from "./src/lib/pwa/config";
 *   plugins: [react(), VitePWA(pwaConfig)]
 */
export const pwaConfig = {
  registerType: "autoUpdate" as const,
  includeAssets: ["favicon.svg", "robots.txt", "placeholder.svg", "offline.html"],
  manifest: {
    name: "Blog Starter",
    short_name: "Blog",
    description: "A modern, content-heavy blog starter kit.",
    theme_color: "#1a1a2e",
    background_color: "#ffffff",
    display: "standalone",
    start_url: "/",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  },
  workbox: {
    globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
    navigateFallback: "/offline.html",
    navigateFallbackDenylist: [
      /^\/api\//,
      /^\/feed\.xml/,
      /^\/atom\.xml/,
      /^\/feed\.json/,
      /^\/sitemap\.xml/,
      /^\/llms/,
    ],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: "CacheFirst" as const,
        options: {
          cacheName: "google-fonts",
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365,
          },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|webp|avif|svg)$/i,
        handler: "StaleWhileRevalidate" as const,
        options: {
          cacheName: "images",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          },
        },
      },
    ],
  },
};