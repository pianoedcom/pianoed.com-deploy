import { cn } from "@/lib/utils";
/**
 * "Ivory" — the PianoEd mascot: a personified piano-key spirit.
 *
 * Two exports:
 *  - <MascotMark />  — compact header/logo icon (24px+).
 *  - <MascotHero />  — a simple, elegant illustration of a few piano keys.
 *
 * All color is driven by semantic design tokens via Tailwind classes
 * (fill-background for ivory, fill-primary for wine, fill-accent for gold)
 * so the mascot re-themes automatically across light/dark modes. No raw
 * hex values are used.
 */
export interface MascotMarkProps extends React.SVGProps<SVGSVGElement> {
  /** Decorative by default — set a title for a standalone, labelled icon. */
  title?: string;
}
/**
 * Compact piano-keys mark — a small row of white keys with black keys set
 * into them and a single gold accent note. Designed to sit beside the
 * "PianoEd" wordmark in the header. Re-themes automatically across
 * light/dark modes via semantic tokens.
 */
export function MascotMark({ title, className, ...props }: MascotMarkProps) {
  // 4 white keys (C D E F), black keys after C and D (not E)
  const whiteKeys = [0, 1, 2, 3];
  const blackKeyAfter = [0, 1];
  const keyW = 7;
  const keyH = 22;
  const blackW = 4;
  const blackH = 14;
  const startX = 2;
  const gap = 1;
  return (
    <svg
      viewBox="0 0 32 32"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={cn("h-7 w-7 shrink-0", className)}
      fill="none"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {/* White keys */}
      {whiteKeys.map((i) => (
        <rect
          key={`wk-${i}`}
          x={startX + i * (keyW + gap)}
          y={6}
          width={keyW}
          height={keyH}
          rx="1.4"
          className="fill-background"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      ))}
      {/* Black keys */}
      {blackKeyAfter.map((i) => (
        <rect
          key={`bk-${i}`}
          x={startX + i * (keyW + gap) + keyW - blackW / 2}
          y={6}
          width={blackW}
          height={blackH}
          rx="0.8"
          className="fill-primary"
        />
      ))}
      {/* Gold accent note */}
      <ellipse
        cx="24"
        cy="4"
        rx="2.2"
        ry="1.6"
        className="fill-accent"
        transform="rotate(-18 24 4)"
      />
    </svg>
  );
}
export interface MascotHeroProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}
/**
 * A simple, elegant illustration of a few piano keys — a clean row of
 * white keys with black keys set into them, resting on a soft shadow.
 * Minimal and decorative; re-themes automatically across light/dark modes.
 */
export function MascotHero({
  title = "PianoEd — a love letter to the piano",
  className,
  ...props
}: MascotHeroProps) {
  // White keys: C D E F G A B (7 keys)
  const whiteKeys = [0, 1, 2, 3, 4, 5, 6];
  // Black keys sit between certain white keys (after C, D, F, G, A — not E, B)
  const blackKeyAfter = [0, 1, 3, 4, 5];
  const keyW = 40;
  const keyH = 150;
  const blackW = 24;
  const blackH = 94;
  const startX = 30;
  const gap = 4;
  return (
    <svg
      viewBox="0 0 330 200"
      role="img"
      aria-label={title}
      className={cn("h-auto w-full", className)}
      fill="none"
      {...props}
    >
      <title>{title}</title>
      {/* Soft ground shadow */}
      <ellipse cx="165" cy="178" rx="140" ry="9" className="fill-muted" opacity="0.55" />
      {/* White keys */}
      {whiteKeys.map((i) => (
        <rect
          key={`wk-${i}`}
          x={startX + i * (keyW + gap)}
          y={28}
          width={keyW}
          height={keyH}
          rx="4"
          className="fill-background"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      ))}
      {/* Black keys */}
      {blackKeyAfter.map((i) => (
        <rect
          key={`bk-${i}`}
          x={startX + i * (keyW + gap) + keyW - blackW / 2}
          y={28}
          width={blackW}
          height={blackH}
          rx="2.5"
          className="fill-primary"
        />
      ))}
      {/* A single gold accent note resting on the keys */}
      <g>
        <ellipse
          cx="150"
          cy="20"
          rx="6"
          ry="4.6"
          className="fill-accent"
          transform="rotate(-18 150 20)"
        />
        <line
          x1="155.5"
          y1="18"
          x2="155.5"
          y2="-6"
          className="stroke-accent"
          strokeWidth="2"
          strokeLinecap="round"
          transform="rotate(-18 150 20)"
        />
      </g>
    </svg>
  );
}
export default MascotMark;