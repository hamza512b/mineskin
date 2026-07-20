export const STORE_LINKS = {
  ios: "https://apps.apple.com/app/id6758862638",
  android: "https://play.google.com/store/apps/details?id=pro.mineskin.app",
} as const;

/** "Buy me a coffee" support/donation link. */
export const BUYMEACOFFEE_URL = "https://buymeacoffee.com/hamza512b";

export type StorePlatform = keyof typeof STORE_LINKS;

/** A detected store platform, or null on desktop/unknown (and during SSR). */
export type MaybeStorePlatform = StorePlatform | null;

/**
 * Detect which app store the current browser environment maps to, based on the
 * user agent. Returns null on desktop/unknown (and during SSR). Shared by the
 * app-install and promo banners so they detect the platform the same way.
 */
export function detectStorePlatform(): MaybeStorePlatform {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return null;
}
