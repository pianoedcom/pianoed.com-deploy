/**
 * MDX compiler — runtime compilation fallback (development only).
 *
 * In production, MDX is pre-compiled at build time by
 * `scripts/precompile-mdx/script.ts` and imported directly — no Blob URLs
 * are needed and `blob:` is not in the production CSP.
 *
 * In development, this module provides a fallback that compiles MDX at
 * runtime. It uses outputFormat: 'function-body' which produces a plain JS
 * code block that we execute via new Function().
 *
 * This fixes the error:
 *   "Failed to resolve module specifier 'react/jsx-runtime'"
 * which occurs when compiled code tries to import from "react/jsx-runtime"
 * inside a Blob URL.
 */
import React from "react";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
// Use a subset of highlight.js languages to avoid bundling all 190+ languages.
import { createLowlight } from "lowlight";
import bash from "highlight.js/lib/languages/bash";
import typescript from "highlight.js/lib/languages/typescript";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import python from "highlight.js/lib/languages/python";
import shell from "highlight.js/lib/languages/shell";
const lowlight = createLowlight();
lowlight.register("bash", bash);
lowlight.register("typescript", typescript);
lowlight.register("javascript", javascript);
lowlight.register("json", json);
lowlight.register("css", css);
lowlight.register("html", xml);
lowlight.register("xml", xml);
lowlight.register("python", python);
lowlight.register("shell", shell);
lowlight.register("sh", shell);
// Import React's automatic JSX runtime.
import * as jsxRuntime from "react/jsx-runtime";
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ["className"]],
    span: [...(defaultSchema.attributes?.span ?? []), ["className"]],
    pre: [...(defaultSchema.attributes?.pre ?? []), ["className"]],
    h1: [...(defaultSchema.attributes?.h1 ?? []), ["id"]],
    h2: [...(defaultSchema.attributes?.h2 ?? []), ["id"]],
    h3: [...(defaultSchema.attributes?.h3 ?? []), ["id"]],
    h4: [...(defaultSchema.attributes?.h4 ?? []), ["id"]],
    h5: [...(defaultSchema.attributes?.h5 ?? []), ["id"]],
    h6: [...(defaultSchema.attributes?.h6 ?? []), ["id"]],
    a: [...(defaultSchema.attributes?.a ?? []), ["rel", "target"]],
    div: [...(defaultSchema.attributes?.div ?? []), ["className", "dataCallout", "dataType"]],
  },
  tagNames: [...(defaultSchema.tagNames ?? []), "div"],
};
interface CacheEntry {
  Component: React.ComponentType<{ components?: Record<string, React.ComponentType> }>;
  body: string;
}
const compiledCache = new Map<string, CacheEntry>();
const MAX_CACHE_SIZE = 50;
/**
 * Compile MDX at runtime using 'function-body' format.
 */
export async function compileMdx(body: string): Promise<string> {
  const cacheKey = body;
  const cached = compiledCache.get(cacheKey);
  if (cached) return `mdx-cache://${cacheKey}`;
  const compiled = await compile(body, {
    format: "mdx",
    outputFormat: "function-body",
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeSanitize, sanitizeSchema],
      [rehypeHighlight, { lowlight }] as unknown as any,
    ],
  });
  const fnBody = String(compiled);
  // The 'function-body' format expects {Fragment, jsx, jsxs} in scope.
  // It populates a 'MDXContent' variable.
  const mdxFn = new Function(
    "{Fragment, jsx, jsxs, ...components}",
    `${fnBody}; return MDXContent;`,
  );
  const MdxComponent = ({ components }: { components?: Record<string, React.ComponentType> }) => {
    try {
      const Content = mdxFn({
        ...jsxRuntime,
        ...components,
      });
      return React.createElement(Content, { components });
    } catch (err) {
      console.error("[mdx] Error rendering compiled content:", err);
      return React.createElement(
        "div",
        { className: "rounded-lg border border-destructive/30 bg-destructive/5 p-6" },
        React.createElement("p", { className: "text-sm text-destructive" }, String(err)),
      );
    }
  };
  if (compiledCache.size >= MAX_CACHE_SIZE) {
    const oldest = compiledCache.keys().next().value;
    if (oldest) compiledCache.delete(oldest);
  }
  compiledCache.set(cacheKey, { Component: MdxComponent, body });
  return `mdx-cache://${cacheKey}`;
}
export function getCachedComponent(
  url: string,
): React.ComponentType<{ components?: Record<string, React.ComponentType> }> | undefined {
  if (!url.startsWith("mdx-cache://")) return undefined;
  const entry = compiledCache.get(url.slice(12));
  return entry?.Component;
}
export function clearMdxCache(): void {
  compiledCache.clear();
}
export function revokeMdxUrl(body: string): void {
  compiledCache.delete(body);
}