"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getPreferredLocale, hasLocale } from "@/i18n/config";

export default function LocaleRedirect() {
  const pathname = usePathname();

  useEffect(() => {
    // Never prepend a locale to a path that already has one — doing so would
    // loop forever (/en/x → /en/en/x → …). The server catch-all already 404s
    // these; this is just a safety net for client-side navigations.
    const firstSegment = pathname.split("/").filter(Boolean)[0];
    if (hasLocale(firstSegment)) return;

    const locale = getPreferredLocale();
    window.location.replace(`/${locale}${pathname}`);
  }, [pathname]);

  return null;
}
