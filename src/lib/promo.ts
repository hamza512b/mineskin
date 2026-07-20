// Limited-time "100% off" launch sale — MineSkin PRO free on the App Store &
// Google Play. All dates are local time; July is month index 6.
//
// Goes live at 12:00 PM (midday) on July 7, 2026...
export const PROMO_START = new Date(2026, 6, 7, 12, 0, 0, 0).getTime();
// ...and runs through the end of July 12 (this is midnight at the *start* of
// July 13, so July 12 is included in full).
export const PROMO_END = new Date(2026, 6, 13, 0, 0, 0, 0).getTime();

/**
 * Whether the launch sale is currently running. While this is true the promo
 * banner takes over and the evergreen app-install banner steps aside. Before
 * the start time (or after the end) it returns false, so nothing shows.
 */
export function isPromoActive(): boolean {
  const now = Date.now();
  return now >= PROMO_START && now < PROMO_END;
}

/**
 * The last day the sale is live, localized (e.g. "July 12", "12 يوليو",
 * "7月12日"). Derived from PROMO_END so the banner copy can never drift from the
 * actual cutoff: PROMO_END is exclusive (midnight starting the day *after* the
 * final sale day), so the last live day is one day earlier.
 */
export function formatPromoEndDate(locale: string): string {
  const lastDay = new Date(PROMO_END - 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
  }).format(lastDay);
}
