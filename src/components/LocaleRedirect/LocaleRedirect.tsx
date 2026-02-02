"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getPreferredLocale } from "@/i18n/config";

export default function LocaleRedirect() {
  const pathname = usePathname();

  useEffect(() => {
    const locale = getPreferredLocale();
    window.location.replace(`/${locale}${pathname}`);
  }, [pathname]);

  return null;
}
