"use client";
import Button from "@/components/Button/index";
import IconButton from "@/components/IconButton/IconButton";
import * as Icons from "@/components/Icons/Icons";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPopup() {
  const [popupOpen, setPopupOpen] = useState(false);
  const path = usePathname();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if user has already dismissed or installed
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;

    if (dismissed || isStandalone) {
      return;
    }

    const cookieConsented = localStorage.getItem("consent-popup");

    const beforeIsntallHandler = (e: Event) => {
      if (cookieConsented) {
        e.preventDefault();
        setPopupOpen(true);
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      }
    };
    const installHandler = (_e: Event) => {
      window.gtag("event", "pwa_installed");
    };

    window.addEventListener("beforeinstallprompt", beforeIsntallHandler);
    window.addEventListener("appinstalled", installHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeIsntallHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    await deferredPrompt.userChoice;

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setPopupOpen(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  const handleDismiss = () => {
    setPopupOpen(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  const popupVariants = {
    hidden: { y: 80, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
    exit: { y: 80, opacity: 0, transition: { duration: 0.5 } },
  };

  // Don't show on policy pages
  if (path.startsWith("/policies")) {
    return null;
  }

  return (
    <AnimatePresence>
      {popupOpen && deferredPrompt && (
        <motion.div
          className="z-2000 fixed bottom-2 left-2 right-2 md:left-2 md:bottom-2 pointer-events-auto! standalone:bottom-8"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={popupVariants}
          role="dialog"
          aria-labelledby="pwa-install-title"
          aria-describedby="pwa-install-description"
        >
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
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
                  Install App
                </h2>
              </div>
              <IconButton
                onClick={handleDismiss}
                label="Close install prompt"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Icons.Close />
              </IconButton>
            </div>

            {/* Main content */}
            <div className="px-4 pt-4 pb-4">
              <p id="pwa-install-description" className="text-sm mb-4">
                Install MineSkin on your device for a faster, app-like
                experience with offline support and quick access from your home
                screen.
              </p>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outlined"
                  onClick={handleDismiss}
                  aria-label="Dismiss install prompt"
                >
                  Not now
                </Button>
                <Button
                  variant="primary"
                  onClick={handleInstall}
                  aria-label="Install MineSkin app"
                >
                  Install
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
