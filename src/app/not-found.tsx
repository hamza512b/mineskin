"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { getPreferredLocale, defaultLocale } from "@/i18n/config";

export default function NotFound() {
  const [homeHref, setHomeHref] = useState(`/${defaultLocale}/home`);

  useEffect(() => {
    setHomeHref(`/${getPreferredLocale()}/home`);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          There&apos;s nothing here
        </h1>
        <p className="mt-5 text-lg text-neutral-500 dark:text-neutral-400">
          Check the address for typos, or head back to the editor and keep
          building.
        </p>
        <Button asLink href={homeHref} size="lg" className="mt-8">
          Back to home
        </Button>
      </div>
    </div>
  );
}
