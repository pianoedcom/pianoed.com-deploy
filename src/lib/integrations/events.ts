import { clientEnv } from "@/lib/env";

export interface ConferenceEvent {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
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
 * Curated fallback events tailored to PianoEd (music education, piano performance, piano tech).
 * Used during build, local dev, or when the Google Apps Script webhook is loading or offline.
 */
export const CURATED_FALLBACK_EVENTS: Omit<
  ConferenceEvent,
  "daysLeft" | "isHappeningNow" | "countdownLabel"
>[] = [
  {
    id: "namm-2027",
    name: "The NAMM Show 2027",
    date: "2027-01-21",
    endDate: "2027-01-24",
    location: "Anaheim, CA",
    linkUrl: "https://www.namm.org/thenammshow/2027",
    category: "Music Tech & Instruments",
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
    featured: true,
  },
  {
    id: "music-china-2027",
    name: "Music China Expo 2027",
    date: "2027-10-20",
    endDate: "2027-10-23",
    location: "Shanghai, China",
    linkUrl: "https://music-china.hk.messefrankfurt.com/",
    category: "Acoustic & Digital Pianos",
    featured: false,
  },
  {
    id: "cliburn-2027",
    name: "Van Cliburn International Competition",
    date: "2027-05-28",
    endDate: "2027-06-12",
    location: "Fort Worth, TX",
    linkUrl: "https://cliburn.org/",
    category: "Piano Competitions",
    featured: false,
  },
];

/**
 * Calculates exact days remaining until an event date relative to today's local midnight.
 */
export function calculateEventCountdown(
  startDateStr: string,
  endDateStr?: string | null
): {
  daysLeft: number;
  isHappeningNow: boolean;
  countdownLabel: string;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const [sYear, sMonth, sDay] = startDateStr.split("-").map(Number);
  const startDate = new Date(sYear, sMonth - 1, sDay).getTime();

  const diffMs = startDate - today;
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let isHappeningNow = false;
  if (endDateStr) {
    const [eYear, eMonth, eDay] = endDateStr.split("-").map(Number);
    const endDate = new Date(eYear, eMonth - 1, eDay).getTime();
    if (today >= startDate && today <= endDate) {
      isHappeningNow = true;
    }
  } else if (daysLeft === 0) {
    isHappeningNow = true;
  }

  let countdownLabel = "";
  if (isHappeningNow) {
    countdownLabel = "Happening Now";
  } else if (daysLeft === 0) {
    countdownLabel = "Today";
  } else if (daysLeft === 1) {
    countdownLabel = "Tomorrow";
  } else if (daysLeft > 1) {
    countdownLabel = `${daysLeft} days left`;
  } else {
    countdownLabel = "Concluded";
  }

  return {
    daysLeft,
    isHappeningNow,
    countdownLabel,
  };
}

/**
 * Computes countdowns for a list of base events, filters past events, and sorts chronologically.
 */
export function processEventsList(
  rawList: Array<
    Omit<ConferenceEvent, "daysLeft" | "isHappeningNow" | "countdownLabel"> &
      Partial<ConferenceEvent>
  >
): ConferenceEvent[] {
  const processed: ConferenceEvent[] = [];

  for (const item of rawList) {
    if (!item.name || !item.date) continue;

    const { daysLeft, isHappeningNow, countdownLabel } = calculateEventCountdown(
      item.date,
      item.endDate
    );

    // Skip events that concluded in the past (unless happening right now)
    if (daysLeft < 0 && !isHappeningNow) {
      continue;
    }

    processed.push({
      id:
        item.id ||
        `event-${item.date}-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: item.name,
      date: item.date,
      endDate: item.endDate || null,
      location: item.location || "Online",
      linkUrl: item.linkUrl || "/resources",
      category: item.category || "Piano Education",
      daysLeft,
      isHappeningNow,
      countdownLabel,
      featured: item.featured ?? false,
    });
  }

  // Sort: "Happening Now" events first, then nearest upcoming events
  processed.sort((a, b) => {
    if (a.isHappeningNow && !b.isHappeningNow) return -1;
    if (!a.isHappeningNow && b.isHappeningNow) return 1;
    return a.daysLeft - b.daysLeft;
  });

  return processed;
}

export const FALLBACK_EVENTS: ConferenceEvent[] = processEventsList(CURATED_FALLBACK_EVENTS);

/**
 * Fetches events asynchronously from Google Apps Script Webhook.
 * Falls back gracefully to curated static events if webhook URL is unconfigured or unavailable.
 */
export async function fetchUpcomingEvents(): Promise<ConferenceEvent[]> {
  const webhookUrl = clientEnv.VITE_EVENTS_WEBHOOK_URL?.trim();

  if (webhookUrl && webhookUrl.startsWith("http")) {
    try {
      const url = new URL(webhookUrl);
      url.searchParams.set("action", "get_events");

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        redirect: "follow",
      });

      if (response.ok) {
        const data = await response.json();
        if (
          data &&
          data.status === "success" &&
          Array.isArray(data.events) &&
          data.events.length > 0
        ) {
          return processEventsList(data.events);
        }
      }
    } catch (err) {
      console.warn(
        "[events] Could not load events from Google Apps Script webhook, using fallback data:",
        err
      );
    }
  }

  return processEventsList(CURATED_FALLBACK_EVENTS);
}
