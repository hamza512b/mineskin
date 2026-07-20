"use client";
import { useSyncExternalStore } from "react";
import {
  type Theme,
  getStoredTheme,
  setTheme,
  isDarkMode,
  subscribeTheme,
} from "@/lib/theme";

export function useTheme(): [Theme, (theme: Theme) => void] {
  const theme = useSyncExternalStore(subscribeTheme, getStoredTheme, () => "system" as Theme);
  return [theme, setTheme];
}

export function useIsDarkMode(): boolean {
  return useSyncExternalStore(subscribeTheme, isDarkMode, () => false);
}
