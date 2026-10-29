/**
 * Events & Conferences Integration Module
 *
 * Connects to Google Apps Script Web App backed by Google Sheets,
 * calculates days remaining in real-time, and provides static fallbacks.
 */

export interface ConferenceEvent {
  id: string;
  name: string;
  date: string;
  endDate?: string | null;
  location: string;
  linkUrl: string;
  category: string;
  daysLeft: number;
  isHappeningNow: boolean;
  countdownLabel: string;
  featured?: boolean;
}

/**
 * Curated static fallback events for PianoEd.
 * Displayed when the webhook is unconfigured or during offline browsing.
 */
export const FALLBACK_EVENTS: ConferenceEvent[] = [
  {
    id: "namm-2027",
    name: "The NAMM Show 2027",
    date: "2027-01-21",
    endDate: "2027-01-24",
    location: "Anaheim, CA",
    linkUrl: "https://www.namm.org/thenammshow/2027",
    category: "Music Tech & Instruments",
    daysLeft: calculateDaysLeft("2027-01-21"),
    isHappeningNow: checkIsHappeningNow("2027-01-21", "2027-01-24"),
    countdownLabel: getCountdownLabel("2027-01-21", "2027-01-24"),
    featured: true,
  },
  {
    id: "mtna-2027",
    name: "MTNA National Conference 2027",
    date: "2027-03-20",
    endDate: "2027-03-24",
    location: "Minneapolis, MN",
    linkUrl: "https://www.mtna.org/Conference/",
    category: "Pedagogy & Education",
    daysLeft: calculateDaysLeft("2027-03-20"),
    isHappeningNow: checkIsHappeningNow("2027-03-20", "2027-03-24"),
    countdownLabel: getCountdownLabel("2027-03-20", "2027-03-24"),
    featured: true,
  },
  {
    id: "wpc-2027",
    name: "World Piano Conference 2027",
    date: "2027-06-27",
    endDate: "2027-07-03",
    location: "Novi Sad & Virtual",
    linkUrl: "https://www.worldpianoconference.com/",
    category: "Classical & Performance",
    daysLeft: calculateDaysLeft("2027-06-27"),
    isHappeningNow: checkIsHappeningNow("2027-06-27", "2027-07-03"),
    countdownLabel: getCountdownLabel("2027-06-27", "2027-07-03"),
    featured: true,
  },
  {
    id: "chopin-festival-2027",
    name: "International Chopin Festival 2027",
    date: "2027-08-15",
    endDate: "2027-08-25",
    location: "Duszniki-Zdrój, Poland",
    linkUrl: "https://chopin.pl/",
    category: "Festivals & Concerts",
    daysLeft: calculateDaysLeft("2027-08-15"),
    isHappeningNow: checkIsHappeningNow("2027-08-15", "2027-08-25"),
    countdownLabel: getCountdownLabel("2027-08-15", "2027-08-25"),
    featured: false,
  },
  {
    id: "music-china-2027",
    name: "Music China Expo 2027",
    date: "2027-10-20",
    endDate: "2027-10-23",
    location: "Shanghai, China",
    linkUrl: "https://music-china.hk.messefrankfurt.com/",
    category: "Acoustic & Digital Pianos",
    daysLeft: calculateDaysLeft("2027-10-20"),
    isHappeningNow: checkIsHappeningNow("2027-10-20", "2027-10-23"),
    countdownLabel: getCountdownLabel("2027-10-20", "2027-10-23"),
    featured: false,
  },
];

/**
 * Calculates remaining days from now until target date.
 */
export function calculateDaysLeft(dateString: string): number {
  const target = new Date(dateString);
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const targetUtc = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const diffMs = targetUtc - todayUtc;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Checks whether today is within the start and end date range.
 */
export function checkIsHappeningNow(startDateString: string, endDateString?: string | null): boolean {
  const daysLeft = calculateDaysLeft(startDateString);
  if (daysLeft > 0) return false;
  if (!endDateString) return daysLeft === 0;

  const end = new Date(endDateString);
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return todayUtc <= endUtc;
}

/**
 * Generates human-friendly countdown label.
 */
export function getCountdownLabel(startDateString: string, endDateString?: string | null): string {
  if (checkIsHappeningNow(startDateString, endDateString)) {
    return "Happening Now";
  }
  const days = calculateDaysLeft(startDateString);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 0) return "Concluded";
  return `In ${days} days`;
}

/**
 * Fetches upcoming events from the Google Apps Script Web App.
 * Falls back to static curated events if unavailable.
 */
export async function fetchUpcomingEvents(): Promise<ConferenceEvent[]> {
  const webhookUrl = import.meta.env.VITE_EVENTS_WEBHOOK_URL;

  if (!webhookUrl) {
    return FALLBACK_EVENTS;
  }

  try {
    const res = await fetch(`${webhookUrl}?action=get_events`, {
      method: "GET",
      redirect: "follow",
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data = await res.json();

    if (data.status === "success" && Array.isArray(data.events) && data.events.length > 0) {
      // Re-calculate daysLeft & status in user's browser timezone
      const events: ConferenceEvent[] = data.events.map((ev: Partial<ConferenceEvent> & { id?: string; name?: string; date?: string }) => {
        const date = ev.date || new Date().toISOString();
        const endDate = ev.endDate || null;
        const daysLeft = calculateDaysLeft(date);
        const isHappeningNow = checkIsHappeningNow(date, endDate);
        const countdownLabel = ev.countdownLabel || getCountdownLabel(date, endDate);

        return {
          id: ev.id || `event-${Math.random()}`,
          name: ev.name || "Music Event",
          date,
          endDate,
          location: ev.location || "Online",
          linkUrl: ev.linkUrl || "/resources/events",
          category: ev.category || "General",
          daysLeft,
          isHappeningNow,
          countdownLabel,
          featured: !!ev.featured,
        };
      });

      return events;
    }

    return FALLBACK_EVENTS;
  } catch (error) {
    console.warn("Failed to fetch dynamic events ticker, falling back to static schedule:", error);
    return FALLBACK_EVENTS;
  }
}
