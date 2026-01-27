export const locales = ["en", "ar", "zh", "es", "pt-BR"] as const;
export const defaultLocale = "en" as const;
export const baseUrl = "https://mineskin.pro";

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
