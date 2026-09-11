export const NEWSLETTER_STORAGE_KEYS = {
  DISMISSED: "slide-in-newsletter-dismissed",
  ARTICLE_COUNT: "newsletter_article_views",
  SUBSCRIBED: "newsletter_subscribed",
  VIEWED_SLUGS: "newsletter_viewed_slugs",
} as const;

export const REQUIRED_ARTICLES_THRESHOLD = 3;
export const DISMISSAL_RESHOW_DAYS = 7;

/**
 * Checks if the slide-in newsletter was dismissed and whether the 7-day cooldown is still active.
 */
export function isNewsletterDismissed(): boolean {
  try {
    const raw = localStorage.getItem(NEWSLETTER_STORAGE_KEYS.DISMISSED);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (
      parsed?.timestamp &&
      Date.now() - parsed.timestamp < DISMISSAL_RESHOW_DAYS * 24 * 60 * 60 * 1000
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Marks the newsletter as dismissed with a current timestamp.
 */
export function setNewsletterDismissed(): void {
  try {
    localStorage.setItem(
      NEWSLETTER_STORAGE_KEYS.DISMISSED,
      JSON.stringify({ timestamp: Date.now() })
    );
  } catch {
    // Ignore storage errors
  }
}

/**
 * Checks if the user has already subscribed.
 */
export function isSubscribed(): boolean {
  try {
    return localStorage.getItem(NEWSLETTER_STORAGE_KEYS.SUBSCRIBED) === "true";
  } catch {
    return false;
  }
}

/**
 * Updates the user's newsletter subscription status.
 */
export function setSubscribedStatus(status: boolean): void {
  try {
    localStorage.setItem(NEWSLETTER_STORAGE_KEYS.SUBSCRIBED, status ? "true" : "false");
  } catch {
    // Ignore storage errors
  }
}

/**
 * Returns the number of distinct articles the user has viewed.
 */
export function getArticleViewCount(): number {
  try {
    const raw = localStorage.getItem(NEWSLETTER_STORAGE_KEYS.ARTICLE_COUNT);
    const count = parseInt(raw || "0", 10);
    return Number.isNaN(count) ? 0 : count;
  } catch {
    return 0;
  }
}

/**
 * Records an article view. If a slug is provided, deduplicates so viewing the
 * same article twice does not increment the count repeatedly.
 * Returns the updated total article view count.
 */
export function recordArticleView(slug?: string): number {
  try {
    if (slug) {
      let viewed: string[] = [];
      const viewedRaw = localStorage.getItem(NEWSLETTER_STORAGE_KEYS.VIEWED_SLUGS);
      if (viewedRaw) {
        try {
          viewed = JSON.parse(viewedRaw);
        } catch {
          viewed = [];
        }
      }

      if (viewed.includes(slug)) {
        return getArticleViewCount();
      }

      viewed.push(slug);
      localStorage.setItem(NEWSLETTER_STORAGE_KEYS.VIEWED_SLUGS, JSON.stringify(viewed));
      const newCount = viewed.length;
      localStorage.setItem(NEWSLETTER_STORAGE_KEYS.ARTICLE_COUNT, newCount.toString());
      return newCount;
    }

    const currentCount = getArticleViewCount();
    const newCount = currentCount + 1;
    localStorage.setItem(NEWSLETTER_STORAGE_KEYS.ARTICLE_COUNT, newCount.toString());
    return newCount;
  } catch {
    return 0;
  }
}

/**
 * Resets the article view tracking.
 */
export function resetArticleViews(): void {
  try {
    localStorage.removeItem(NEWSLETTER_STORAGE_KEYS.ARTICLE_COUNT);
    localStorage.removeItem(NEWSLETTER_STORAGE_KEYS.VIEWED_SLUGS);
  } catch {
    // Ignore storage errors
  }
}
