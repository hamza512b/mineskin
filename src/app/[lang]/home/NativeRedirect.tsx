"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isNativeWebview } from "@/hooks/useNativeWebview";

export function NativeRedirect({ lang }: { lang: string }) {
  const router = useRouter();

  useEffect(() => {
    if (isNativeWebview()) {
      router.replace(`/${lang}/editor`);
    }
  }, [router, lang]);

  return null;
}
