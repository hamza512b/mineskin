"use client";
import { useInitRendererState } from "@/store";
import FreeAppBanner from "@/widgets/FreeAppBanner";
import PromoSaleBanner from "@/widgets/PromoSaleBanner";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useInitRendererState();

  const pathname = usePathname();

  useEffect(() => {
    const count = parseInt(localStorage.getItem("mineskin-visit-count") || "0", 10);
    localStorage.setItem("mineskin-visit-count", String(count + 1));
  }, []);

  useEffect(() => {
    const segment = pathname.replace(/\/+$/, "").split("/").pop();
    if (segment === "preview" || segment === "editor") {
      localStorage.setItem("mineskin-last-page", segment);
    }
  }, [pathname]);

  // Block browser pinch-zoom on editor/preview pages. The viewport meta
  // (maximum-scale/user-scalable) is ignored by iOS Safari, so we prevent the
  // default zoom gesture here. preventDefault only stops the browser zoom — the
  // canvas's own touch listeners still receive these events.
  //
  // We only block while the page is at its normal scale (≈1). If the user has
  // somehow already zoomed in (scale > 1), we let the gesture through so they
  // can pinch back out to 1 — never trapping them at a zoomed-in level.
  useEffect(() => {
    const isZoomedIn = () => (window.visualViewport?.scale ?? 1) > 1;

    const preventGesture = (e: Event) => {
      if (!isZoomedIn()) e.preventDefault();
    };
    const preventMultiTouch = (e: TouchEvent) => {
      if (e.touches.length > 1 && !isZoomedIn()) e.preventDefault();
    };

    document.addEventListener("gesturestart", preventGesture);
    document.addEventListener("gesturechange", preventGesture);
    document.addEventListener("gestureend", preventGesture);
    document.addEventListener("touchmove", preventMultiTouch, {
      passive: false,
    });

    return () => {
      document.removeEventListener("gesturestart", preventGesture);
      document.removeEventListener("gesturechange", preventGesture);
      document.removeEventListener("gestureend", preventGesture);
      document.removeEventListener("touchmove", preventMultiTouch);
    };
  }, []);

  return (
    <>
      <PromoSaleBanner />
      <FreeAppBanner />
      {children}
    </>
  );
}
