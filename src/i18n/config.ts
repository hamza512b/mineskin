export const locales = ["en", "ar", "zh", "es", "pt-BR"] as const;
export const defaultLocale = "en" as const;
export const baseUrl = "https://mineskin.pro";
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";
export const LOCALE_STORAGE_KEY = "NEXT_LOCALE";

export type Locale = (typeof locales)[number];

export const LOCALE_TO_FLAG: Record<Locale, string> = {
  en: "gb",
  ar: "sa",
  zh: "cn",
  es: "es",
  "pt-BR": "br",
};

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
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as
      | Locale
      | undefined
      | null;
    if (stored && locales.includes(stored)) {
      return stored;
    }
  }
  const cookieLocale = getCookie(LOCALE_COOKIE_NAME) as Locale | undefined;
  if (cookieLocale && locales.includes(cookieLocale)) {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(LOCALE_STORAGE_KEY, cookieLocale);
    }
    return cookieLocale;
  }
  return getLocaleFromNavigator();
}

export function setPreferredLocale(locale: Locale) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }
  if (typeof document !== "undefined") {
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${maxAge}; samesite=lax`;
  }
}
