// Re-export client-safe config
export { locales, defaultLocale, hasLocale, type Locale } from "./config";

// Re-export client context
export { DictionaryProvider, useDictionary } from "./DictionaryContext";

// Note: getDictionary and Dictionary type are only available in Server Components
// Import them directly from "./dictionaries" in Server Components
