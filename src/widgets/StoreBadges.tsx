"use client";

/* eslint-disable @next/next/no-img-element */
import { isNativeWebview } from "@/hooks/useNativeWebview";
import { STORE_LINKS, type StorePlatform } from "@/lib/storeLinks";
import clsx from "clsx";
import Link from "next/link";

type Props = {
  appStoreAlt: string;
  playStoreAlt: string;
  source: "home" | "settings" | "hero";
  size?: "md" | "sm";
  showReportLink?: boolean;
  className?: string;
};

export default function StoreBadges({
  appStoreAlt,
  playStoreAlt,
  source,
  size = "md",
  className,
}: Props) {
  if (isNativeWebview()) return null;

  const trackVisit = (platform: StorePlatform) => {
    window.gtag?.("event", "store_visit", { platform, source });
  };

  const imgClass = size === "sm" ? "h-10 w-auto" : "h-14 w-auto";

  return (
    <div className={clsx("flex gap-3 items-center", className)}>
      <Link
        href={STORE_LINKS.ios}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackVisit("ios")}
        className="transition-opacity hover:opacity-80 active:scale-[0.98]"
      >
        <img src="/badges/app-store.svg" alt={appStoreAlt} className={imgClass} />
      </Link>
      <Link
        href={STORE_LINKS.android}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackVisit("android")}
        className="transition-opacity hover:opacity-80 active:scale-[0.98]"
      >
        <img
          src="/badges/play-store.svg"
          alt={playStoreAlt}
          className={imgClass}
        />
      </Link>
    </div>
  );
}
