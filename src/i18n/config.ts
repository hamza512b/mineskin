export const locales = ["en", "ar", "zh", "es", "pt-BR"] as const;
export const defaultLocale = "en" as const;
export const baseUrl = "https://mineskin.pro";
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export type Locale = (typeof locales)[number];

export const hasLocale = (locale: string): locale is Locale =>
  locales.includes(locale as Locale);

/**
 * Generates alternate language links for SEO (hreflang tags)
 * @param path - The path after the language segment (e.g., "/preview", "/guides/usage_guide")
 * @param currentLocale - The current locale for canonical URL
 */
export function generateAlternates(path: string, currentLocale: Locale) {
  const languages: Record<string, string> = {};

  for (const locale of locales) {
    languages[locale] = `${baseUrl}/${locale}${path}`;
  }

  // x-default points to the default locale version
  languages["x-default"] = `${baseUrl}/${defaultLocale}${path}`;

  return {
    canonical: `${baseUrl}/${currentLocale}${path}`,
    languages,
  };
}
function getLocaleFromNavigator(): Locale {
  if (typeof navigator === "undefined") return defaultLocale;

  const languages = navigator.languages || [navigator.language];

  for (const lang of languages) {
    const code = lang.split("-")[0].toLowerCase();
    const match = locales.find(
      (locale) => locale === code || locale.toLowerCase().startsWith(code),
    );
    if (match) return match;
  }

  return defaultLocale;
}
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}
export function getPreferredLocale(): Locale {
  const cookieLocale = getCookie(LOCALE_COOKIE_NAME) as Locale | undefined;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }
  return getLocaleFromNavigator();
}
