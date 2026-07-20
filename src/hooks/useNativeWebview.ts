"use client";

import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";

/**
 * Hook to detect if the app is running inside a native shell (Capacitor).
 */
export default function useNativeWebview(): boolean {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  return isNative;
}

/**
 * Non-hook utility to check if running in a native shell (Capacitor).
 * Returns the current value synchronously.
 */
export function isNativeWebview(): boolean {
  if (typeof window === "undefined") return false;
  return Capacitor.isNativePlatform();
}
