export const locales = ["en", "ar"] as const;
export const defaultLocale = "en" as const;

export type Locale = (typeof locales)[number];

export const hasLocale = (locale: string): locale is Locale =>
  locales.includes(locale as Locale);
