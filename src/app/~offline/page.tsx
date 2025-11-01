"use client";
import Button from "@/components/Button";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">
          Could not load the page
        </h1>
        <p className="mb-8 text-gray-400">
          Please check your internet connection and try again.
        </p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    </div>
  );
}
