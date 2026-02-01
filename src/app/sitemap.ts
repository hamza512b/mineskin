import { MetadataRoute } from "next";
import { locales, baseUrl, defaultLocale } from "@/i18n/config";

export const dynamic = "force-static";

const pages = [
  { path: "/preview", priority: 1.0 },
  { path: "/editor", priority: 0.8 },
  { path: "/policies/privacy-policy", priority: 0.5 },
  { path: "/policies/cookie-policy", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    for (const locale of locales) {
      const languages: Record<string, string> = {};

      for (const lang of locales) {
        languages[lang] = `${baseUrl}/${lang}${page.path}`;
      }
      languages["x-default"] = `${baseUrl}/${defaultLocale}${page.path}`;

      entries.push({
        url: `${baseUrl}/${locale}${page.path}`,
        priority: page.priority,
        alternates: {
          languages,
        },
      });
    }
  }

  return entries;
}
