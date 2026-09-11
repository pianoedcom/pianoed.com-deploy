/**
 * Image manifest types and loader.
 *
 * The build-time image optimization script (`scripts/optimize-images/`)
 * generates `image-manifest.json` which maps original image paths to
 * responsive variants with srcset, LQIP placeholders, and dimensions.
 *
 * At runtime, ResponsiveImage and PostCard look up images in this manifest
 * to render optimized `<img>` tags with srcset and LQIP.
 *
 * Uses a static ESM import for the JSON manifest — Vite handles JSON imports
 * natively at build time. A placeholder `{}` file ships with the starter
 * kit so the import always resolves; the optimization script overwrites it.
 */
import manifestData from "./image-manifest.json";
export interface ImageManifestEntry {
  /** Original source path (e.g., "/images/posts/my-article.webp"). */
  src: string;
  /** Responsive srcset string (e.g., "img-640.webp 640w, img-1024.webp 1024w"). */
  srcset: string;
  /** Base64 LQIP data URI for blur-up placeholder. */
  lqip: string;
  /** Original width in pixels. */
  width: number;
  /** Original height in pixels. */
  height: number;
}
export type ImageManifest = Record<string, ImageManifestEntry>;
/** The manifest, typed. Falls back to empty object if no entries. */
const cachedManifest: ImageManifest = (manifestData as ImageManifest) ?? {};
/** Get the image manifest. */
export function getImageManifest(): ImageManifest {
  return cachedManifest;
}
/** Look up an image path in the manifest. */
export function getImageEntry(src: string): ImageManifestEntry | null {
  return cachedManifest[src] ?? null;
}
/** Reset the manifest cache (no-op — static import, kept for API compat). */
export function resetImageManifestCache(): void {}
/** Backward-compatible async loader. */
export async function loadImageManifest(): Promise<ImageManifest> {
  return cachedManifest;
}