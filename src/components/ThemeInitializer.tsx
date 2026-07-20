"use client";

import { useEffect } from "react";
import { applyTheme, getStoredTheme, initThemeListener } from "@/lib/theme";

export function ThemeInitializer() {
  useEffect(() => {
    applyTheme(getStoredTheme());
    return initThemeListener();
  }, []);

  return null;
}
