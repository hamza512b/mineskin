"use client";

import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";

export default function CapacitorInit() {
  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    const isWebStandalone =
      !isNative &&
      window.matchMedia("(display-mode: standalone)").matches;

    if (isWebStandalone) {
      window.gtag?.("event", "pwa_standalone_open");
      if (!localStorage.getItem("pwa_standalone_first_logged")) {
        window.gtag?.("event", "pwa_standalone_first_open");
        localStorage.setItem("pwa_standalone_first_logged", "1");
      }
    }

    if (!isNative) return;

    const platform = Capacitor.getPlatform();
    window.gtag?.("event", "native_app_open", { platform });

    if (!localStorage.getItem("native_first_open_sent")) {
      window.gtag?.("event", "native_first_open", { platform });
      localStorage.setItem("native_first_open_sent", "1");
    }
  }, []);

  return null;
}
