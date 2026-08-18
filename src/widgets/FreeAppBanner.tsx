"use client";

import IconButton from "@/components/IconButton/IconButton";
import * as Icons from "@/components/Icons/Icons";
import { usePopupQueue } from "@/contexts/PopupQueueContext";
import { isNativeWebview } from "@/hooks/useNativeWebview";
import { useDictionary } from "@/i18n/DictionaryContext";
import {
  STORE_LINKS,
  detectStorePlatform,
  type MaybeStorePlatform,
  type StorePlatform,
} from "@/lib/storeLinks";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "free-app-banner-dismissed";
const CSS_VAR = "--app-banner-height";

/**
 * Evergreen "the app is completely free" banner. Same layout as the retired
 * launch-sale banner (PromoSaleBanner), but with no end date: the app is free
 * on the App Store & Google Play for good, so there's nothing to count down
 * and the banner stays available until the user dismisses it.
 */
export default function FreeAppBanner() {
  const { dictionary } = useDictionary();
  const { registerPopup, unregisterPopup, isActivePopup } = usePopupQueue();
  const [platform, setPlatform] = useState<MaybeStorePlatform>(null);
  const visible = isActivePopup("freeAppBanner");
  const bannerRef = useRef<HTMLDivElement>(null);
  const viewTracked = useRef(false);

  const updateCSSVar = useCallback((height: number) => {
    document.documentElement.style.setProperty(CSS_VAR, `${height}px`);
  }, []);

  useEffect(() => {
    // Never inside the native app — those users already have it. Installed-PWA
    // users are intentionally still shown the banner (unlike AppInstallBanner)
    // so they hear the app costs nothing, hence no standalone guard here.
    if (isNativeWebview()) return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    setPlatform(detectStorePlatform());

    // Small delay so the banner doesn't slam in on first paint.
    const timer = setTimeout(() => {
      registerPopup("freeAppBanner");
    }, 800);
    return () => clearTimeout(timer);
  }, [registerPopup]);

  // Count a view only once the banner is actually the active (visible) popup —
  // registering behind higher-priority consent popups shouldn't log a view the
  // user never saw.
  useEffect(() => {
    if (visible && !viewTracked.current) {
      viewTracked.current = true;
      window.gtag?.("event", "free_app_banner_view");
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || !bannerRef.current) {
      updateCSSVar(0);
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        updateCSSVar(entry.contentRect.height);
      }
    });
    observer.observe(bannerRef.current);
    updateCSSVar(bannerRef.current.offsetHeight);

    return () => {
      observer.disconnect();
      updateCSSVar(0);
    };
  }, [visible, updateCSSVar]);

  const handleDismiss = () => {
    unregisterPopup("freeAppBanner");
    localStorage.setItem(STORAGE_KEY, "true");
    window.gtag?.("event", "free_app_banner_dismiss");
  };

  const trackStoreVisit = (p: StorePlatform) => {
    window.gtag?.("event", "free_app_banner_click", { platform: p });
    window.gtag?.("event", "store_visit", {
      platform: p,
      source: "free_app_banner",
    });
  };

  const primaryStoreClass =
    "shrink-0 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold transition-colors whitespace-nowrap";
  const compactStoreClass =
    "shrink-0 px-2.5 py-1.5 rounded-lg border border-blue-500/40 text-blue-700 dark:text-blue-300 hover:bg-blue-500/10 active:bg-blue-500/20 text-xs font-semibold transition-colors whitespace-nowrap";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={bannerRef}
          className="fixed top-0 inset-x-0 z-1999"
          initial={{ y: -80, opacity: 0 }}
          animate={{
            y: 0,
            opacity: 1,
            transition: { type: "spring", damping: 24, stiffness: 260 },
          }}
          exit={{ y: -80, opacity: 0, transition: { duration: 0.3 } }}
          onAnimationComplete={(def: { opacity?: number }) => {
            if (def.opacity === 0) updateCSSVar(0);
          }}
        >
          <div className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950 dark:to-sky-950 border-b border-blue-200 dark:border-blue-800 safe-area-pt">
            <div className="flex items-center gap-3 px-3 py-2">
              <IconButton
                onClick={handleDismiss}
                label={dictionary.freeAppBanner.dismiss}
                className="shrink-0 -ml-1"
              >
                <Icons.Close />
              </IconButton>

               <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight truncate">
                  <span className="text-blue-700 dark:text-blue-300">
                    {dictionary.freeAppBanner.badge}
                  </span>{" "}
                  {dictionary.freeAppBanner.title}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-tight mt-0.5 truncate">
                  {dictionary.freeAppBanner.description}
                </p>
              </div>

              {platform ? (
                <a
                  href={STORE_LINKS[platform]}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackStoreVisit(platform)}
                  className={primaryStoreClass}
                >
                  {dictionary.freeAppBanner.cta}
                </a>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={STORE_LINKS.ios}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackStoreVisit("ios")}
                    className={compactStoreClass}
                  >
                    {dictionary.freeAppBanner.appStore}
                  </a>
                  <a
                    href={STORE_LINKS.android}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackStoreVisit("android")}
                    className={compactStoreClass}
                  >
                    {dictionary.freeAppBanner.googlePlay}
                  </a>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
