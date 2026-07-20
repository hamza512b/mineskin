"use client";
import Button from "@/components/Button/index";
import IconButton from "@/components/IconButton/IconButton";
import * as Icons from "@/components/Icons/Icons";
import { usePopupQueue } from "@/contexts/PopupQueueContext";
import { useDictionary } from "@/i18n";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const VISIT_COUNT_KEY = "mineskin-visit-count";
const VISIT_THRESHOLD = 7;

function isAppleDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return /iphone|ipod|ipad|macintosh|mac os x/.test(ua);
}

export default function PWAInstallPopup() {
  const path = usePathname();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const { dictionary: dict } = useDictionary();
  const { registerPopup, unregisterPopup, isActivePopup } = usePopupQueue();
  const isVisible = isActivePopup("pwaInstall");

  useEffect(() => {
    // Already installed — nothing to prompt.
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    if (isStandalone) return;

    // Apple devices get the iOS app prompt instead
    if (isAppleDevice()) return;

    // Chrome re-dispatches `beforeinstallprompt` on every navigation (including
    // client-side route changes like editor <-> preview) until the stashed event
    // is consumed via prompt(). Only surface our popup once per mount, and always
    // re-read the dismissed/consent flags fresh so a dismissal actually sticks.
    let handled = false;

    const beforeIsntallHandler = (e: Event) => {
      if (handled) return;
      if (localStorage.getItem("pwa-install-dismissed")) return;
      if (!localStorage.getItem("consent-popup")) return;
      const visits = parseInt(
        localStorage.getItem(VISIT_COUNT_KEY) || "0",
        10,
      );
      if (visits < VISIT_THRESHOLD) return;
      handled = true;
      e.preventDefault();
      registerPopup("pwaInstall");
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      window.gtag?.("event", "pwa_prompt_shown");
    };
    const installHandler = () => {
      window.gtag("event", "pwa_installed");
    };

    window.addEventListener("beforeinstallprompt", beforeIsntallHandler);
    window.addEventListener("appinstalled", installHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeIsntallHandler);
      window.removeEventListener("appinstalled", installHandler);
    };
  }, [registerPopup]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    window.gtag?.("event", "pwa_install_clicked");
    await deferredPrompt.prompt();

    const choice = await deferredPrompt.userChoice;
    window.gtag?.("event", "pwa_native_choice", { outcome: choice.outcome });

    setDeferredPrompt(null);
    unregisterPopup("pwaInstall");
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  const handleDismiss = () => {
    window.gtag?.("event", "pwa_dismissed");
    unregisterPopup("pwaInstall");
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  const popupVariants = {
    hidden: { y: 80, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
    exit: { y: 80, opacity: 0, transition: { duration: 0.5 } },
  };

  // Don't show on policy pages
  if (path.includes("/policies")) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && deferredPrompt && (
        <motion.div
          className="z-[2000] fixed bottom-2 start-2 end-2 md:start-2 md:end-auto md:bottom-2 standalone:bottom-8 safe-area-bottom safe-area-leftrtl:safe-area-right pointer-events-auto!"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={popupVariants}
          role="dialog"
          aria-labelledby="pwa-install-title"
          aria-describedby="pwa-install-description"
        >
          <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-4 pt-4">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1={12} x2={12} y1={15} y2={3} />
                </svg>
                <h2 id="pwa-install-title" className="text-lg font-semibold">
                  {dict.pwa.title}
                </h2>
              </div>
              <IconButton
                onClick={handleDismiss}
                label={dict.pwa.closePrompt}
                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                <Icons.Close />
              </IconButton>
            </div>

            {/* Main content */}
            <div className="px-4 pt-4 pb-4">
              <p id="pwa-install-description" className="text-sm mb-4">
                {dict.pwa.description}
              </p>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outlined"
                  onClick={handleDismiss}
                  aria-label={dict.pwa.notNow}
                >
                  {dict.pwa.notNow}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleInstall}
                  aria-label={dict.pwa.install}
                >
                  {dict.pwa.install}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
