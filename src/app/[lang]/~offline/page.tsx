"use client";
import Button from "@/components/Button";
import { useDictionary } from "@/i18n";

export default function OfflinePage() {
  const { dictionary: dict } = useDictionary();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">
          {dict.offline.title}
        </h1>
        <p className="mb-8 text-gray-400">{dict.offline.description}</p>
        <Button onClick={() => window.location.reload()}>
          {dict.offline.tryAgain}
        </Button>
      </div>
    </div>
  );
}
