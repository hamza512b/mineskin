// Re-export client-safe config
export {
  locales,
  defaultLocale,
  baseUrl,
  hasLocale,
  generateAlternates,
  LOCALE_COOKIE_NAME,
  type Locale,
} from "./config";

// Re-export client context and templating functions
export {
  DictionaryProvider,
  useDictionary,
  t,
  tJsx,
} from "./DictionaryContext";
