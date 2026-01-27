// Re-export client-safe config
export {
  locales,
  defaultLocale,
  baseUrl,
  hasLocale,
  generateAlternates,
  type Locale,
} from "./config";

// Re-export client context and templating functions
export { DictionaryProvider, useDictionary, t, tJsx } from "./DictionaryContext";

// Note: getDictionary and Dictionary type are only available in Server Components
// Import them directly from "./dictionaries" in Server Components
