"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { isNativeWebview } from "@/hooks/useNativeWebview";

export default function LangPage() {
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();

  useEffect(() => {
    const target = isNativeWebview() ? "preview" : "home";
    router.replace(`/${lang}/${target}`);
  }, [router, lang]);

  return null;
}
