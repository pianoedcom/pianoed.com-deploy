import { useEffect, useState, type ComponentType } from "react";
import { compileMdx, getCachedComponent } from "@/lib/content/mdx-compiler";
import { getCompiledPostModule } from "@/lib/content/local-source";
import { mdxComponents } from "./mdx-components";
/**
/**
 * MDX renderer — prefers build-time compiled modules, falls back to runtime
 * compilation via direct function execution (no Blob URLs).
 *
 * Build-time path (production):
 *   scripts/precompile-mdx compiles all .mdx files to JS modules at build time.
 *   The compiled module is imported directly — no Blob URLs, no runtime
 *   compilation latency.
 *
 * Runtime fallback (development):
 *   If no pre-compiled module exists, falls back to runtime compilation using
 *   @mdx-js/mdx with outputFormat: 'function'. The compiled JS function is
 *   executed directly with React's JSX runtime injected — NO Blob URLs needed,
 *   so there are no "Failed to resolve module specifier" errors.
 * explicitly registered components are available. No arbitrary imports from
 * content are allowed — MDX is treated as trusted executable content, but
 * the component surface is controlled.
 *
 * MDX Trust Model:
 *   - Production MDX is trusted executable content.
 *   - MDX may only be modified through trusted repository workflows (Git
 *     commits to the content repository, verified by the webhook's HMAC
 *     signature).
 *   - Anonymous users cannot upload or modify MDX content.
 *   - The system does not provide a mechanism for evaluating arbitrary
 *     user-provided JavaScript.
 *   - See SECURITY.md for the full security model.
 */
interface MdxRendererProps {
  /** Raw MDX body (frontmatter already stripped). */
  body: string;
  /** Slug of the post — used to look up the pre-compiled module. */
  slug?: string;
}
type CompiledState =
  | { status: "loading" }
  | { status: "ready"; Component: ComponentType }
  | { status: "error"; message: string };
export function MdxRenderer({ body, slug }: MdxRendererProps) {
  const [state, setState] = useState<CompiledState>(() => {
    // Fast path: check for a pre-compiled module synchronously on first render.
    // This avoids the loading flash entirely in production.
    if (slug) {
      const compiled = getCompiledPostModule(slug);
      if (compiled) {
        return { status: "ready", Component: compiled };
      }
    }
    return { status: "loading" };
  });
  useEffect(() => {
    // If we already have a pre-compiled module, no effect needed.
    if (state.status === "ready") return;
    let cancelled = false;
    // Check again for pre-compiled module (in case it loaded after initial render).
    if (slug) {
      const compiled = getCompiledPostModule(slug);
      if (compiled) {
        setState({ status: "ready", Component: compiled });
        return;
      }
    }
    // In production, MDX must be pre-compiled at build time.
    // Runtime compilation requires 'unsafe-eval' in CSP which is
    // intentionally NOT enabled in production for security.
    // Run `pnpm precompile` (or `pnpm build`) before deploying.
    if (import.meta.env.PROD) {
      console.error(
        `[mdx] No pre-compiled module found for "${slug}". ` +
          `Run \`pnpm precompile\` or \`pnpm build\` before deploying to ` +
          `generate pre-compiled MDX modules. Runtime compilation is ` +
          `disabled in production (CSP does not allow 'unsafe-eval').`,
      );
      if (!cancelled) {
        setState({
          status: "error",
          message:
            "This article was not pre-compiled. Run `pnpm precompile` or `pnpm build` before deploying to generate pre-compiled MDX modules.",
        });
      }
      return;
    }
    // Development: runtime compilation is allowed (dev CSP is looser).
    setState({ status: "loading" });
    console.log(`[mdx] Compiling article "${slug}" at runtime (dev mode)...`);
    compileMdx(body)
      .then((cacheUrl) => {
        if (cancelled) return;
        const Component = getCachedComponent(cacheUrl);
        if (Component) {
          setState({ status: "ready", Component });
        } else {
          if (!cancelled) {
            setState({
              status: "error",
              message: "Compiled component not found in cache.",
            });
          }
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(`[mdx] Compilation failed for "${slug}":`, err);
        setState({
          status: "error",
          message: `Failed to render article: ${(err as Error).message}.`,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [body, slug, state.status]);
  if (state.status === "loading") {
    return (
      <div className="animate-pulse space-y-3" aria-busy="true" aria-live="polite">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
        <p className="sr-only">Loading article content...</p>
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div
        className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 my-8"
        role="alert"
      >
        <p className="font-semibold text-destructive mb-2 flex items-center gap-2">
          <span aria-hidden>⚠️</span>
          Article Content Unavailable
        </p>
        <p className="text-sm text-destructive/80">{state.message}</p>
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
            Technical Details
          </summary>
          <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-48">
            {`Slug: ${slug ?? "(none)"}\nBody length: ${body.length} chars\nBody preview: ${body.slice(0, 200)}...`}
          </pre>
        </details>
      </div>
    );
  }
  const Component = state.Component as ComponentType<{ components: typeof mdxComponents }>;
  return <Component components={mdxComponents} />;
}
export default MdxRenderer;