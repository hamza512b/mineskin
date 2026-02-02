"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPreferredLocale } from "@/i18n/config";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const locale = getPreferredLocale();
    router.replace(`/${locale}/preview`);
  }, [router]);

  return null;
}
