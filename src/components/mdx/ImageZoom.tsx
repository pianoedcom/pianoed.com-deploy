import { useState, useCallback, type ReactNode } from "react";
/**
 * ImageZoom — accessible click-to-expand lightbox for MDX images.
 *
 * Renders a normal image inline. On click (or keyboard Enter/Space),
 * opens a full-screen overlay with the image at maximum size. Closes
 * on Escape, overlay click, or close button.
 *
 * Usage in MDX:
 *   <ImageZoom src="/images/diagram.png" alt="Architecture diagram" />
 */
interface ImageZoomProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  children?: ReactNode;
}
export const ImageZoom = ({ src, alt, width, height }: ImageZoomProps) => {
  const [open, setOpen] = useState(false);
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  }, []);
  if (open) {
    return (
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4"
        onClick={() => setOpen(false)}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-label={alt}
        tabIndex={-1}
      >
        <button
          type="button"
          className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          onClick={() => setOpen(false)}
          aria-label="Close image"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <img
          src={src}
          alt={alt}
          className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="group block cursor-zoom-in"
      aria-label={`Zoom: ${alt}`}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="my-4 rounded-lg border border-border transition-shadow hover:shadow-lg"
        loading="lazy"
      />
      <span className="sr-only">Click to enlarge</span>
    </button>
  );
};
export default ImageZoom;