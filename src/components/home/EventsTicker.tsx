import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, ExternalLink } from "lucide-react";
import { fetchUpcomingEvents, type ConferenceEvent, FALLBACK_EVENTS } from "@/lib/integrations/events";

export interface EventsTickerProps {
  className?: string;
}

/**
 * Dynamic Events & Conferences Ticker.
 * Displays upcoming industry events with live countdown badges in a smooth scrolling marquee.
 */
export const EventsTicker = ({ className = "" }: EventsTickerProps) => {
  const [events, setEvents] = useState<ConferenceEvent[]>(FALLBACK_EVENTS);

  useEffect(() => {
    let cancelled = false;
    fetchUpcomingEvents().then((data) => {
      if (!cancelled && data && data.length > 0) {
        setEvents(data);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!events || events.length === 0) return null;

  // Duplicate events array to create a seamless infinite marquee loop
  const tickerItems = [...events, ...events];

  const isExternal = (url: string) =>
    url.startsWith("http://") || url.startsWith("https://");

  return (
    <div
      className={`border-b border-border bg-card/75 backdrop-blur-xs overflow-hidden ${className}`}
      aria-label="Upcoming Events and Conferences Ticker"
    >
      <div className="flex items-center gap-3 py-2">
        {/* Ticker badge prefix */}
        <div className="flex shrink-0 items-center gap-2 pl-4 sm:pl-6 pr-3 border-r border-border">
          <CalendarDays className="h-3.5 w-3.5 text-accent animate-pulse" aria-hidden />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground whitespace-nowrap">
            Upcoming Events
          </span>
        </div>

        {/* Marquee ticker content */}
        <div className="relative flex-1 overflow-hidden group">
          <div className="flex animate-[events-marquee_50s_linear_infinite] group-hover:[animation-play-state:paused] gap-8 whitespace-nowrap">
            {tickerItems.map((event, idx) => {
              const uniqueKey = `${event.id}-${idx}`;
              const badgeClass = event.isHappeningNow
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : event.daysLeft <= 7
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                : "bg-accent/15 text-accent border-accent/30";

              const innerContent = (
                <div className="inline-flex items-center gap-2.5 text-xs text-foreground hover:text-accent transition-colors">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 font-semibold text-[11px] tracking-tight ${badgeClass}`}
                  >
                    {event.countdownLabel}
                  </span>
                  <span className="font-medium text-foreground">{event.name}</span>
                  {event.location && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {event.location}
                    </span>
                  )}
                  {isExternal(event.linkUrl) && (
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-60" />
                  )}
                </div>
              );

              return isExternal(event.linkUrl) ? (
                <a
                  key={uniqueKey}
                  href={event.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {innerContent}
                </a>
              ) : (
                <Link
                  key={uniqueKey}
                  to={event.linkUrl}
                  className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {innerContent}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes events-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[events-marquee_50s_linear_infinite\\] {
            animation: none;
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default EventsTicker;
