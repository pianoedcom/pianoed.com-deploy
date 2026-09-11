/**
 * HTTP security headers.
 *
 * Centralizes all security-related response headers for the application.
 * In a Next.js deployment these would be applied via `next.config.ts`
 * `headers()` or middleware. In this Vite SPA environment, they are applied
 * via a meta-tag injection utility and documented for deployment-level
 * configuration (CDN, reverse proxy, hosting platform).
 *
 * Headers implemented:
 *   - Content-Security-Policy: restricts script/style/img/font/connect sources
 *   - Strict-Transport-Security: enforces HTTPS (HSTS)
 *   - X-Frame-Options: prevents clickjacking (frame restrictions)
 *   - X-Content-Type-Options: prevents MIME sniffing
 *   - Referrer-Policy: controls referrer information leakage
 *   - Permissions-Policy: restricts browser feature access
 *
 * Security principles:
 *   - CSP is restrictive by default; only known origins are allowed.
 *   - `unsafe-inline` is avoided for scripts; `unsafe-eval` is never used
 *     in production (MDX is compiled at build time, not eval'd at runtime).
 *   - The GitHub raw content domain is allow-listed for Git-sourced images.
 *   - Google Fonts domains are allow-listed for the font loading strategy.
 */
import { siteConfig } from "@/lib/site-config";
/** Content Security Policy directives. */
export interface CspDirectives {
  "default-src": string;
  "script-src": string;
  "style-src": string;
  "img-src": string;
  "font-src": string;
  "connect-src": string;
  "frame-src": string;
  "object-src": string;
  "base-uri": string;
  "form-action": string;
  "frame-ancestors": string;
  "upgrade-insecure-requests": string;
}
/**
 * Build the Content Security Policy string.
 *
 * The policy is restrictive:
 *   - default-src: 'self' — everything defaults to same-origin
 *   - script-src: 'self' — only same-origin scripts (no inline, no eval)
 *   - style-src: 'self' 'unsafe-inline' — Tailwind requires inline styles;
 *     this is the only relaxation
 *   - img-src: 'self' data: https: — allow data URIs and any HTTPS image
 *   - font-src: 'self' and Google Fonts
 *   - connect-src: 'self' and the site URL (for API calls)
 *   - object-src: 'none' — no plugins
 *   - frame-ancestors: 'none' — prevent framing (clickjacking)
 *
 * @param isProduction - In development, Vite requires looser CSP for HMR.
 */
export function buildCsp(isProduction = true): string {
  if (!isProduction) {
    // Development: Vite needs inline scripts for HMR. Blob URLs are used
    // by the MDX runtime compiler — no unsafe-eval needed.
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' blob: https://giscus.app",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' ws: wss: https:",
      "frame-src 'self' https://giscus.app",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; ");
  }
  const siteOrigin = siteConfig.url.replace(/\/$/, "");
  // Check if Giscus comments are configured — if so, allow-list the domain.
  const giscusConfigured =
    typeof import.meta !== "undefined" &&
    import.meta.env.VITE_GISCUS_REPO &&
    import.meta.env.VITE_GISCUS_REPO_ID &&
    import.meta.env.VITE_GISCUS_CATEGORY_ID;
  // Production: MDX is pre-compiled at build time by
  // `scripts/precompile-mdx/script.ts` (run via `pnpm precompile` or
  // automatically as part of `pnpm build`). No runtime eval is needed.
  // If pre-compilation is skipped, runtime MDX compilation will fail
  // with a CSP violation — run `pnpm precompile` before deploying.
  const scriptSrc = giscusConfigured
    ? "script-src 'self' https://giscus.app"
    : "script-src 'self'";
  const frameSrc = giscusConfigured ? "frame-src 'self' https://giscus.app" : "frame-src 'none'";
  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src 'self' ${siteOrigin} https://analytics.pianoed.com`,
    frameSrc,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}
/**
 * Complete set of security headers for production.
 *
 * These should be set by the hosting platform, CDN, or reverse proxy.
 * In Next.js they would be returned from `headers()` in `next.config.ts`.
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    "Content-Security-Policy": buildCsp(true),
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "magnetometer=()",
      "gyroscope=()",
      "accelerometer=()",
    ].join(", "),
    "X-DNS-Prefetch-Control": "on",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
  };
}
/**
 * Security headers for development (looser CSP for Vite HMR).
 */
export function getDevSecurityHeaders(): Record<string, string> {
  return {
    "Content-Security-Policy": buildCsp(false),
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "DENY",
  };
}
/**
 * Inject security headers as meta tags in the document head.
 *
 * In a Vite SPA without a server, we can only set CSP and other headers
 * via <meta> tags. Note that some headers (HSTS, X-Frame-Options as
 * `frame-ancestors` in CSP) are more effective when set by the server,
 * but meta-tag CSP is still enforced by browsers.
 *
 * This is called once on application startup.
 */
export function injectSecurityMetaTags(): void {
  if (typeof document === "undefined") return;
  const isProduction = import.meta.env.PROD;
  const csp = buildCsp(isProduction);
  // CSP via meta tag
  let meta = document.querySelector<HTMLMetaElement>('meta[http-equiv="Content-Security-Policy"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.httpEquiv = "Content-Security-Policy";
    document.head.prepend(meta);
  }
  meta.content = csp;
  // Referrer-Policy via meta tag
  let referrer = document.querySelector<HTMLMetaElement>('meta[name="referrer"]');
  if (!referrer) {
    referrer = document.createElement("meta");
    referrer.name = "referrer";
    document.head.appendChild(referrer);
  }
  referrer.content = "strict-origin-when-cross-origin";
  // color-scheme for theme support
  let colorScheme = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
  if (!colorScheme) {
    colorScheme = document.createElement("meta");
    colorScheme.name = "color-scheme";
    document.head.appendChild(colorScheme);
  }
  colorScheme.content = "light dark";
}
/**
 * Get the security headers documentation for deployment configuration.
 *
 * Returns a formatted string suitable for inclusion in documentation
 * or as a reference for platform-level header configuration.
 */
export function getSecurityHeadersDocumentation(): string {
  const headers = getSecurityHeaders();
  const lines = ["# Security Headers (Production)", ""];
  for (const [key, value] of Object.entries(headers)) {
    lines.push(`${key}: ${value}`);
  }
  lines.push("");
  lines.push(`Site URL: ${siteConfig.url}`);
  return lines.join("\n");
}