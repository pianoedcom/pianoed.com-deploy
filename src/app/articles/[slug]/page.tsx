/**
 * Article page — re-exports the implementation from the canonical
 * location at src/app/blog/[slug]/page.tsx.
 *
 * The route is registered at both /articles/:slug (legacy) and
 * /blog/:slug in the router.
 */
export { default } from "@/app/blog/[slug]/page";