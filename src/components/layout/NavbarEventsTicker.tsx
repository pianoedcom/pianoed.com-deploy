import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, MapPin, ExternalLink } from "lucide-react";
import {
  fetchUpcomingEvents,
  CURATED_FALLBACK_EVENTS,
  processEventsList,
  type ConferenceEvent,
} from "@/lib/integrations/events";
import { cn } from "@/lib/utils";

/**
 * Unified Split-Flap number tile inspired by airport Solari flight boards.
 * Digits sit immediately adjacent inside a single housing with a thin internal hairline seam.
 */
function SplitFlapNumberTile({
  value,
  variant = "amber",
}: {
  value: string;
  variant?: "amber" | "green" | "white";
}) {
  const colorStyles =
    variant === "green"
      ? "text-emerald-400 bg-[#072418] border-emerald-500/60 shadow-[0_0_6px_rgba(16,185,129,0.25)]"
      : variant === "amber"
      ? "text-amber-400 bg-[#221607] border-amber-500/60 shadow-[0_0_6px_rgba(245,158,11,0.2)]"
      : "text-zinc-100 bg-[#12151d] border-zinc-700/80";

  const chars = value.split("");

  return (
    <span
      className={cn(
        "relative inline-flex items-center select-none rounded-[2.5px] border shadow-xs overflow-hidden h-5 font-mono font-bold text-[11px] leading-none tracking-tight",
        colorStyles
      )}
    >
      {/* Center mechanical split seam across all digits */}
      <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-black/75 pointer-events-none z-20" />

      {chars.map((char, i) => (
        <span
          key={i}
          className={cn(
            "relative z-10 inline-flex items-center justify-center w-[10.5px] h-full",
            i > 0 && "border-l border-black/45"
          )}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

/**
 * Split-flap countdown badge with zero inter-digit gap and 'DAYS' label.
 */
function SplitFlapCountdown({
  days,
  isHappeningNow,
  compact = false,
}: {
  days: number;
  isHappeningNow?: boolean;
  compact?: boolean;
}) {
  if (isHappeningNow) {
    return (
      <span className="inline-flex items-center gap-1" title="Event is happening now!">
        <SplitFlapNumberTile value="NOW" variant="green" />
      </span>
    );
  }

  // Format number into two or more digits (e.g. "06", "17", "36", "141")
  const numStr = days >= 0 ? (days < 10 ? `0${days}` : String(days)) : "00";
  const variant = days <= 7 ? "amber" : "white";

  return (
    <span className="inline-flex items-center gap-1 shrink-0" title={`${days} days remaining`}>
      <SplitFlapNumberTile value={numStr} variant={variant} />

      <span
        className={cn(
          "font-mono font-bold tracking-tight text-[10px] uppercase select-none",
          variant === "amber" ? "text-amber-400" : "text-[#d8c3b0]"
        )}
      >
        Days
      </span>
    </span>
  );
}

/**
 * Compact Airport Flight Display Ticker for the Navbar.
 *
 * Exact Animation Sequence per Event:
 * 1. Event details are active: Days counter transitions over exactly 2.0s with cubic deceleration.
 * 2. Static display for exactly 3.0s (all event details completely stationary).
 * 3. Slow vertical slide-up over 800ms: Event name and location slide up continuously from a list
 *    (Slot 1 rolls up and out while Slot 2 rolls up into view, completely eliminating blanking out).
 * 4. Event name is displayed in bold font so it stands out prominently.
 */
export default function NavbarEventsTicker() {
  const [events, setEvents] = useState<ConferenceEvent[]>(() =>
    processEventsList(CURATED_FALLBACK_EVENTS)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedDays, setDisplayedDays] = useState<number>(() => {
    const initialList = processEventsList(CURATED_FALLBACK_EVENTS);
    return initialList.length > 0 ? initialList[0].daysLeft : 0;
  });
  const [isSlidingUp, setIsSlidingUp] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Track previous target days across transitions
  const previousDaysRef = useRef<number>(displayedDays);

  // Load events asynchronously from Google Apps Script Webhook
  useEffect(() => {
    let cancelled = false;

    fetchUpcomingEvents()
      .then((loaded) => {
        if (!cancelled && loaded.length > 0) {
          setEvents(loaded);
          setDisplayedDays(loaded[0].daysLeft);
          previousDaysRef.current = loaded[0].daysLeft;
        }
      })
      .catch((err) => {
        console.warn("[NavbarEventsTicker] Could not load events:", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Synchronized Cycle Orchestrator:
  // Phase 1 (0 to 2000ms): Counter ticks from previous days to current target over exactly 2.0s.
  // Phase 2 (2000ms to 5000ms): Static display for exactly 3.0s (all details completely stationary).
  // Phase 3 (5000ms to 5800ms): Slow, smooth vertical slide-up from list into next event.
  // At 5800ms: Switch to next event, seamlessly resetting slide offset with zero flicker or blanking out.
  useEffect(() => {
    if (events.length <= 1 || isPaused || isOpen) return;

    const COUNTER_DURATION = 2000; // 2 seconds counter transition
    const STATIC_DURATION = 3000; // 3 seconds static display with no animation
    const SLIDE_DURATION = 800; // 800ms slow, smooth vertical slide-up transition

    const targetDays = events[currentIndex % events.length].daysLeft;
    const startDays = previousDaysRef.current;
    previousDaysRef.current = targetDays;

    // 1. Counter animation: exactly 2000ms
    const diff = targetDays - startDays;
    const startTime = performance.now();
    let animFrame: number;

    const tick = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / COUNTER_DURATION, 1);
      // Ease-out cubic deceleration: brisk start, elegant landing on final day
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(startDays + diff * easeProgress);
      setDisplayedDays(currentVal);

      if (progress < 1) {
        animFrame = requestAnimationFrame(tick);
      } else {
        setDisplayedDays(targetDays);
      }
    };

    animFrame = requestAnimationFrame(tick);

    // 2. Slow vertical slide-up: starts after 2s counter + 3s static display (at 5000ms)
    const slideTimer = setTimeout(() => {
      setIsSlidingUp(true);
    }, COUNTER_DURATION + STATIC_DURATION);

    // 3. Switch to next event: after 800ms slide finishes (at 5800ms)
    const cycleTimer = setTimeout(() => {
      setIsSlidingUp(false);
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, COUNTER_DURATION + STATIC_DURATION + SLIDE_DURATION);

    return () => {
      cancelAnimationFrame(animFrame);
      clearTimeout(slideTimer);
      clearTimeout(cycleTimer);
    };
  }, [currentIndex, events.length, isPaused, isOpen]);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!events || events.length === 0) return null;

  const currentEvent = events[currentIndex % events.length];
  const nextEvent = events[(currentIndex + 1) % events.length];

  const handleEventClick = (event: ConferenceEvent) => {
    setIsOpen(false);
    if (event.linkUrl.startsWith("http://") || event.linkUrl.startsWith("https://")) {
      window.open(event.linkUrl, "_blank", "noopener,noreferrer");
    } else {
      navigate(event.linkUrl);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative hidden lg:block shrink-0"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Trigger Button: Strictly Fixed Width so Navbar never fluctuates */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Upcoming event: ${currentEvent.name}, ${displayedDays} Days left. Click to view all ${events.length} events.`}
        className={cn(
          "group flex h-9 w-[285px] xl:w-[320px] items-center justify-between rounded-md border border-[#a87d3b]/50 bg-[#190507]/90 px-2.5 py-1 text-xs transition-all hover:border-[#d4af37] hover:bg-[#28090d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37] cursor-pointer select-none shrink-0 shadow-sm",
          isOpen && "border-[#d4af37] ring-1 ring-[#d4af37] bg-[#28090d]"
        )}
      >
        {/* Left: Split-Flap countdown counter (tight spacing + 'Days') */}
        <div className="shrink-0 flex items-center">
          <SplitFlapCountdown
            days={displayedDays}
            isHappeningNow={currentEvent.isHappeningNow}
          />
        </div>

        {/* Middle: Event name & location sliding up smoothly from a list (no blanking out) */}
        <div className="flex-1 min-w-0 h-5 overflow-hidden relative mx-2 text-left">
          <div
            className={cn(
              "flex flex-col will-change-transform",
              isSlidingUp
                ? "transition-transform duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] -translate-y-1/2"
                : "translate-y-0 transition-none"
            )}
          >
            {/* Slot 1: Current Active Event */}
            <div className="h-5 flex items-center justify-between gap-1.5 overflow-hidden w-full">
              <span className="truncate min-w-0 font-bold text-[#fcefd2] text-xs tracking-tight group-hover:text-[#f8d479]">
                {currentEvent.name}
              </span>
              {currentEvent.location && (
                <span className="text-[10px] text-[#cfbca8]/80 font-medium shrink-0 text-right whitespace-nowrap pl-1">
                  · {currentEvent.location.split(",")[0]}
                </span>
              )}
            </div>

            {/* Slot 2: Next Event (waiting directly below in the list) */}
            <div className="h-5 flex items-center justify-between gap-1.5 overflow-hidden w-full">
              <span className="truncate min-w-0 font-bold text-[#fcefd2] text-xs tracking-tight group-hover:text-[#f8d479]">
                {nextEvent.name}
              </span>
              {nextEvent.location && (
                <span className="text-[10px] text-[#cfbca8]/80 font-medium shrink-0 text-right whitespace-nowrap pl-1">
                  · {nextEvent.location.split(",")[0]}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Dropdown chevron caret */}
        <ChevronDown
          className={cn(
            "h-3 w-3 text-[#d8c3b0] transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-[#fcefd2]"
          )}
          aria-hidden
        />
      </button>

      {/* Dropdown Menu: 100% Solid, Fully Opaque Airport Departures Board */}
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-lg border border-[#a87d3b]/60 shadow-2xl z-50 p-1.5 origin-top-right text-slate-100"
          style={{
            backgroundColor: "#0b0f19",
            opacity: 1,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2 bg-slate-900/95 rounded-t-md">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-slate-300">
                Departures · Piano Summits & Events
              </span>
            </div>
            <span className="font-mono text-[10px] text-amber-400/90 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {events.length} Scheduled
            </span>
          </div>

          {/* Events List */}
          <div className="max-h-[340px] overflow-y-auto py-1 divide-y divide-slate-800/80 bg-[#0b0f19]">
            {events.map((event, idx) => {
              const isExternal =
                event.linkUrl.startsWith("http://") || event.linkUrl.startsWith("https://");

              return (
                <div
                  key={`${event.id}-${idx}`}
                  role="menuitem"
                  tabIndex={0}
                  onClick={() => handleEventClick(event)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleEventClick(event);
                    }
                  }}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-md hover:bg-slate-800/90 cursor-pointer transition-colors group/item focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
                >
                  {/* Left: Split-Flap Days badge */}
                  <div className="shrink-0">
                    <SplitFlapCountdown
                      days={event.daysLeft}
                      isHappeningNow={event.isHappeningNow}
                      compact
                    />
                  </div>

                  {/* Center: Event Name, Date, Location */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-100 group-hover/item:text-amber-400 truncate">
                        {event.name}
                      </span>
                      {event.category && (
                        <span className="hidden sm:inline-block text-[9px] uppercase tracking-wider font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded border border-slate-700/50">
                          {event.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10.5px] text-slate-400 mt-0.5">
                      <span className="truncate">{event.date}</span>
                      {event.location && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-0.5 truncate">
                            <MapPin className="h-2.5 w-2.5 text-slate-500 shrink-0" aria-hidden />
                            {event.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Navigation indicator */}
                  <div className="shrink-0 text-slate-400 group-hover/item:text-amber-400">
                    {isExternal ? (
                      <ExternalLink className="h-3 w-3" aria-hidden />
                    ) : (
                      <span className="text-xs font-mono">→</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="border-t border-slate-800 px-3 py-2 bg-slate-900/95 rounded-b-md flex items-center justify-between text-[10px] text-slate-400">
            <span className="font-mono">Syncs live via Google Sheets</span>
            <Link
              to="/resources"
              onClick={() => setIsOpen(false)}
              className="text-amber-400 hover:underline font-medium"
            >
              Browse all resources →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
