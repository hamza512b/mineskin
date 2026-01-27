"use client";

import { createContext, useContext } from "react";
import type { Locale } from "./config";

// Import the type from the JSON file directly for client-side type safety
import type enJson from "./locales/en.json";
type Dictionary = typeof enJson;

/**
 * Interpolates values into a translation string with {{placeholder}} syntax.
 * @example t("Hello {{name}}!", { name: "World" }) // "Hello World!"
 */
export function t(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    values[key] !== undefined ? String(values[key]) : `{{${key}}}`
  );
}

/**
 * Interpolates React nodes into a translation string with {{placeholder}} syntax.
 * Returns an array of strings and React nodes that can be rendered directly.
 * @example tJsx("Read our {{link}}.", { link: <a href="/policy">policy</a> })
 */
export function tJsx(
  template: string,
  values: Record<string, React.ReactNode>
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = /\{\{(\w+)\}\}/g;
  let match;

  while ((match = regex.exec(template)) !== null) {
    // Add text before the placeholder
    if (match.index > lastIndex) {
      parts.push(template.slice(lastIndex, match.index));
    }
    // Add the replacement value
    const key = match[1];
    parts.push(values[key] !== undefined ? values[key] : `{{${key}}}`);
    lastIndex = regex.lastIndex;
  }

  // Add remaining text after last placeholder
  if (lastIndex < template.length) {
    parts.push(template.slice(lastIndex));
  }

  return parts;
}

interface DictionaryContextValue {
  dictionary: Dictionary;
  locale: Locale;
  t: typeof t;
}

const DictionaryContext = createContext<DictionaryContextValue | null>(null);

export function DictionaryProvider({
  children,
  dictionary,
  locale,
}: {
  children: React.ReactNode;
  dictionary: Dictionary;
  locale: Locale;
}) {
  return (
    <DictionaryContext.Provider value={{ dictionary, locale, t }}>
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary(): DictionaryContextValue {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error("useDictionary must be used within a DictionaryProvider");
  }
  return { ...context, t };
}
