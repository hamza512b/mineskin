import "server-only";
import type { Locale } from "./config";

const dictionaries = {
  en: () => import("./locales/en.json").then((module) => module.default),
  ar: () => import("./locales/ar.json").then((module) => module.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["en"]>>;

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]();
