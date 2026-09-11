import { useState, useRef, useEffect, type ReactNode } from "react";
/**
 * VideoEmbed — responsive, privacy-conscious video embed for MDX.
 *
 * Supports YouTube, Vimeo, and direct MP4 URLs. Uses a facade pattern:
 * shows a thumbnail with a play button until clicked, then loads the
 * actual iframe/player. This prevents third-party cookies and improves
 * page load performance.
 *
 * Usage in MDX:
 *   <VideoEmbed src="https://youtube.com/watch?v=abc123" title="Demo video" />
 *   <VideoEmbed src="https://vimeo.com/123456" title="Vimeo demo" />
 *   <VideoEmbed src="/videos/demo.mp4" title="Local MP4" />
 */
interface VideoEmbedProps {
  src: string;
  title: string;
  /** Optional thumbnail URL. If not provided, a gradient placeholder is used. */
  thumbnail?: string;
  children?: ReactNode;
}
/** Extract YouTube video ID from various URL formats. */
function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
/** Extract Vimeo video ID from URL. */
function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}
export const VideoEmbed = ({ src, title, thumbnail }: VideoEmbedProps) => {
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const youtubeId = getYouTubeId(src);
  const vimeoId = getVimeoId(src);
  const isMP4 = src.endsWith(".mp4") || src.endsWith(".webm");
  // Lazy-load when scrolled into view
  useEffect(() => {
    if (loaded) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          // Preload thumbnail area, but don't load iframe until click
        }
      },
      { rootMargin: "200px" },
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [loaded]);
  const handleClick = () => setLoaded(true);
  const embedUrl = youtubeId
    ? `https://www.youtube-nocookie.com/embed/${youtubeId}`
    : vimeoId
      ? `https://player.vimeo.com/video/${vimeoId}`
      : null;
  if (isMP4) {
    return (
      <figure className="my-6">
        <div
          className="overflow-hidden rounded-lg border border-border bg-black"
          ref={containerRef}
        >
          <video controls className="w-full" preload="metadata" title={title}>
            <source src={src} type={src.endsWith(".webm") ? "video/webm" : "video/mp4"} />
            Your browser does not support the video tag.
          </video>
        </div>
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">{title}</figcaption>
      </figure>
    );
  }
  if (!embedUrl) {
    return (
      <p className="my-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        Unsupported video URL: {src}
      </p>
    );
  }
  return (
    <figure className="my-6">
      <div
        className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted"
        ref={containerRef}
      >
        {loaded ? (
          <iframe
            src={embedUrl}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <button
            type="button"
            onClick={handleClick}
            className="absolute inset-0 flex items-center justify-center"
            aria-label={`Play video: ${title}`}
          >
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
            )}
            <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-6 w-6">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">{title}</figcaption>
    </figure>
  );
};
export default VideoEmbed;