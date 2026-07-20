"use client";

import { BUYMEACOFFEE_URL } from "@/lib/storeLinks";
import clsx from "clsx";
import { Coffee } from "lucide-react";
import Link from "next/link";

type Props = {
  label: string;
  source: "home" | "settings";
  className?: string;
};

/**
 * "Buy me a coffee" support link. Kept separate from StoreBadges so the
 * app-install ask and the tip ask never get visually or semantically mixed.
 */
export default function CoffeeButton({ label, source, className }: Props) {
  return (
    <Link
      href={BUYMEACOFFEE_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => window.gtag?.("event", "coffee_visit", { source })}
      className={clsx(
        "inline-flex h-10 items-center gap-2 rounded-lg bg-[#FFDD00] px-4 text-sm font-semibold text-black transition hover:brightness-95 active:scale-[0.98]",
        className,
      )}
    >
      <Coffee className="h-4 w-4" strokeWidth={2} />
      {label}
    </Link>
  );
}
