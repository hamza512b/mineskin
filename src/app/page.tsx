"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPreferredLocale } from "@/i18n/config";
import { isNativeWebview } from "@/hooks/useNativeWebview";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const locale = getPreferredLocale();
    const target = isNativeWebview() ? "preview" : "home";
    router.replace(`/${locale}/${target}`);
  }, [router]);

  return null;
}
