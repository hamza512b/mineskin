// Re-export client-safe config
export {
  locales,
  defaultLocale,
  baseUrl,
  hasLocale,
  generateAlternates,
  LOCALE_COOKIE_NAME,
  LOCALE_STORAGE_KEY,
  LOCALE_TO_FLAG,
  setPreferredLocale,
  type Locale,
} from "./config";

// Re-export client context and templating functions
export {
  DictionaryProvider,
  useDictionary,
  t,
  tJsx,
} from "./DictionaryContext";
