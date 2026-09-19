import { z } from "zod";
/**
 * Environment validation layer.
 *
 * Splits variables into:
 *  - `client`: safe to expose to the browser (must be prefixed with VITE_).
 *  - `server`: server-only; never bundled into the client.
 *
 * Vite only embeds variables prefixed with `VITE_` into `import.meta.env`, so
 * server-only variables are validated here but intentionally not read from
 * `import.meta.env` (they are read from `process.env` at build/runtime on a
 * server, if one is introduced later). This keeps credentials out of the
 * browser bundle today.
 */
const clientEnvSchema = z.object({
  /** Public site URL with no trailing slash. */
  VITE_SITE_URL: z
    .string()
    .url("VITE_SITE_URL must be a valid URL with no trailing slash")
    .refine((val) => !val.endsWith("/"), "VITE_SITE_URL must not end with /"),
  /** Absolute URL of the default Open Graph image. */
  VITE_DEFAULT_OG_IMAGE: z.string().url("VITE_DEFAULT_OG_IMAGE must be a valid absolute URL"),
  /** Optional Sentry DSN for error tracking (public identifier only). */
  VITE_SENTRY_DSN: z.string().optional().default(""),
});
const serverEnvSchema = z.object({
  /** Content repository provider, e.g. "github" or "gitlab". */
  CONTENT_REPO_PROVIDER: z
    .string()
    .min(1, "CONTENT_REPO_PROVIDER is required")
    .refine(
      (val) => ["github", "gitlab"].includes(val.toLowerCase()),
      "CONTENT_REPO_PROVIDER must be 'github' or 'gitlab'",
    ),
  /** Repository owner (user or org). */
  CONTENT_REPO_OWNER: z.string().min(1, "CONTENT_REPO_OWNER is required"),
  /** Repository name. */
  CONTENT_REPO_NAME: z.string().min(1, "CONTENT_REPO_NAME is required"),
  /** Branch to read content from. */
  CONTENT_REPO_BRANCH: z.string().min(1, "CONTENT_REPO_BRANCH is required"),
  /** Path inside the repo where content lives. */
  CONTENT_REPO_PATH: z.string().min(1, "CONTENT_REPO_PATH is required"),
  /** Optional access token for private content repos. */
  CONTENT_REPO_TOKEN: z.string().optional().default(""),
  /**
   * Webhook secret for verifying GitHub webhook deliveries.
   *
   * This must match the secret configured in the GitHub repository's webhook
   * settings. It is used to compute HMAC-SHA256 signatures over the raw
   * request body. Server-only — never exposed to the browser.
   */
  CONTENT_WEBHOOK_SECRET: z.string().optional().default(""),
  /**
   * Content source mode: "local" (bundled MDX) or "git" (fetch from provider).
   * Defaults to "local". When "git" is set, a token should be provided for
   * private repos; public repos work without a token.
   */
  CONTENT_SOURCE: z
    .string()
    .optional()
    .default("local")
    .refine(
      (val) => ["local", "git"].includes(val.toLowerCase()),
      "CONTENT_SOURCE must be 'local' or 'git'",
    ),
});
/** Strongly-typed, validated client-safe environment. */
export type ClientEnv = z.infer<typeof clientEnvSchema>;
/** Strongly-typed, validated server-only environment. */
export type ServerEnv = z.infer<typeof serverEnvSchema>;
/**
 * Validated client-safe environment.
 * These values are safe to use anywhere in the browser.
 */
function loadClientEnv(): ClientEnv {
  const metaEnv = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : undefined;
  const procEnv = typeof process !== "undefined" && process.env ? process.env : {};
  let rawUrl = metaEnv?.VITE_SITE_URL || procEnv.VITE_SITE_URL;
  let rawOg = metaEnv?.VITE_DEFAULT_OG_IMAGE || procEnv.VITE_DEFAULT_OG_IMAGE;
  const rawDsn = metaEnv?.VITE_SENTRY_DSN || procEnv.VITE_SENTRY_DSN;

  // Canonicalize apex pianoed.com to www.pianoed.com to eliminate 308 redirect cascades
  if (rawUrl) {
    const trimmed = rawUrl.trim().replace(/\/+$/, "");
    if (trimmed === "https://pianoed.com" || trimmed === "http://pianoed.com") {
      rawUrl = "https://www.pianoed.com";
    }
  }
  if (rawOg) {
    rawOg = rawOg.replace(/^https?:\/\/pianoed\.com(\/.*)?$/, "https://www.pianoed.com$1");
  }

  const parsed = clientEnvSchema.safeParse({
    VITE_SITE_URL: rawUrl,
    VITE_DEFAULT_OG_IMAGE: rawOg,
    VITE_SENTRY_DSN: rawDsn,
  });
  if (!parsed.success) {
    // In dev, surface actionable errors. In production, fall back to safe
    // defaults so the build never hard-fails on missing optional metadata.
    if (metaEnv?.DEV || procEnv.NODE_ENV === "development") {
      console.error(
        "[env] Invalid client environment variables:\n" +
          parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n"),
      );
    }
    return {
      VITE_SITE_URL: "https://www.pianoed.com",
      VITE_DEFAULT_OG_IMAGE: "https://www.pianoed.com/og/default.png",
      VITE_SENTRY_DSN: "",
    };
  }
  return parsed.data;
}
/**
 * Validated server-only environment.
 * Reads from `process.env` (not `import.meta.env`) so values are never bundled
 * to the browser. Returns `null` when running in the browser or when the
 * server variables are absent.
 */
function loadServerEnv(): ServerEnv | null {
  if (typeof process === "undefined" || !process.env) return null;
  const metaEnv = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : undefined;
  const procEnv = process.env;
  const parsed = serverEnvSchema.safeParse({
    CONTENT_REPO_PROVIDER: procEnv.CONTENT_REPO_PROVIDER,
    CONTENT_REPO_OWNER: procEnv.CONTENT_REPO_OWNER,
    CONTENT_REPO_NAME: procEnv.CONTENT_REPO_NAME,
    CONTENT_REPO_BRANCH: procEnv.CONTENT_REPO_BRANCH,
    CONTENT_REPO_PATH: procEnv.CONTENT_REPO_PATH,
    CONTENT_REPO_TOKEN: procEnv.CONTENT_REPO_TOKEN,
    CONTENT_WEBHOOK_SECRET: procEnv.CONTENT_WEBHOOK_SECRET,
    CONTENT_SOURCE: procEnv.CONTENT_SOURCE,
  });
  if (!parsed.success) {
    if (metaEnv?.DEV || procEnv.NODE_ENV === "development") {
      console.error(
        "[env] Invalid server environment variables:\n" +
          parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n"),
      );
    }
    return null;
  }
  return parsed.data;
}
export const clientEnv: ClientEnv = loadClientEnv();
export const serverEnv: ServerEnv | null = loadServerEnv();