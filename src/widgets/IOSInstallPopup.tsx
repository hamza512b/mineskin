"use client";
import Button from "@/components/Button/index";
import IconButton from "@/components/IconButton/IconButton";
import * as Icons from "@/components/Icons/Icons";
import { usePopupQueue } from "@/contexts/PopupQueueContext";
import { isNativeWebview } from "@/hooks/useNativeWebview";
import { useDictionary } from "@/i18n";
import { STORE_LINKS } from "@/lib/storeLinks";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const DISMISSED_KEY = "ios-install-dismissed";
const VISIT_COUNT_KEY = "mineskin-visit-count";
const VISIT_THRESHOLD = 4;

function isAppleDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipod|ipad/.test(ua)) return true;
  // Apple Silicon Macs can run iOS apps from the App Store
  if (/macintosh|mac os x/.test(ua)) return true;
  return false;
}

export default function IOSInstallPopup() {
  const path = usePathname();
  const { dictionary: dict } = useDictionary();
  const { registerPopup, unregisterPopup, isActivePopup } = usePopupQueue();
  const isVisible = isActivePopup("iosInstall");

  useEffect(() => {
    if (isNativeWebview()) return;
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    if (isStandalone) return;
    if (!isAppleDevice()) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;
    if (!localStorage.getItem("consent-popup")) return;

    const visits = parseInt(
      localStorage.getItem(VISIT_COUNT_KEY) || "0",
      10,
    );
    if (visits < VISIT_THRESHOLD) return;

    registerPopup("iosInstall");
    window.gtag?.("event", "ios_install_prompt_shown");
  }, [registerPopup]);

  const handleInstall = () => {
    window.gtag?.("event", "ios_install_clicked");
    window.gtag?.("event", "store_visit", {
      platform: "ios",
      source: "ios_install_popup",
    });
    unregisterPopup("iosInstall");
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  const handleDismiss = () => {
    window.gtag?.("event", "ios_install_dismissed");
    unregisterPopup("iosInstall");
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  const popupVariants = {
    hidden: { y: 80, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
    exit: { y: 80, opacity: 0, transition: { duration: 0.5 } },
  };

  if (path.includes("/policies")) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="z-[2000] fixed bottom-2 start-2 end-2 md:start-2 md:end-auto md:bottom-2 standalone:bottom-8 safe-area-bottom safe-area-leftrtl:safe-area-right pointer-events-auto!"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={popupVariants}
          role="dialog"
          aria-labelledby="ios-install-title"
          aria-describedby="ios-install-description"
        >
          <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden">
            <div className="flex justify-between items-center px-4 pt-4">
              <div className="flex items-center gap-2">
                <img
                  src="/icon-144x144.png"
                  alt="MineSkin"
                  width={24}
                  height={24}
                  className="rounded-md"
                />
                <h2 id="ios-install-title" className="text-lg font-semibold">
                  {dict.iosInstall.title}
                </h2>
              </div>
              <IconButton
                onClick={handleDismiss}
                label={dict.iosInstall.closePrompt}
                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                <Icons.Close />
              </IconButton>
            </div>

            <div className="px-4 pt-4 pb-4">
              <p id="ios-install-description" className="text-sm mb-4">
                {dict.iosInstall.description}
              </p>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outlined"
                  onClick={handleDismiss}
                  aria-label={dict.iosInstall.notNow}
                >
                  {dict.iosInstall.notNow}
                </Button>
                <a
                  href={STORE_LINKS.ios}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleInstall}
                >
                  <Button variant="primary" aria-label={dict.iosInstall.getApp}>
                    {dict.iosInstall.getApp}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
