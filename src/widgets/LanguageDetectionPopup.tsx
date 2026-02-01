"use client";

import Button from "@/components/Button/index";
import { usePopupQueue } from "@/contexts/PopupQueueContext";
import { useDictionary } from "@/i18n";
import { locales, type Locale } from "@/i18n/config";
import { GlobeIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_KEY = "language-detection-dismissed";

/**
 * Maps browser language codes to our supported locales
 * Handles cases like "zh-CN", "zh-TW" -> "zh", "pt-BR" -> "pt-BR", etc.
 */
function getBrowserLocale(): Locale | null {
  if (typeof window === "undefined") return null;

  const browserLanguages = navigator.languages || [navigator.language];

  for (const browserLang of browserLanguages) {
    // Exact match (e.g., "pt-BR")
    if (locales.includes(browserLang as Locale)) {
      return browserLang as Locale;
    }

    // Match base language (e.g., "zh-CN" -> "zh", "es-MX" -> "es")
    const baseLang = browserLang.split("-")[0];
    if (locales.includes(baseLang as Locale)) {
      return baseLang as Locale;
    }
  }

  return null;
}

export default function LanguageDetectionPopup() {
  const [detectedLocale, setDetectedLocale] = useState<Locale | null>(null);
  const { dictionary: dict, locale: currentLocale } = useDictionary();
  const router = useRouter();
  const pathname = usePathname();
  const { registerPopup, unregisterPopup, isActivePopup } = usePopupQueue();
  const isVisible = isActivePopup("languageDetection");

  useEffect(() => {
    // Check if user has already dismissed the popup
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    const browserLocale = getBrowserLocale();

    // Show popup if browser locale is supported but different from current
    if (browserLocale && browserLocale !== currentLocale) {
      setDetectedLocale(browserLocale);
      registerPopup("languageDetection");
    }
  }, [currentLocale, registerPopup]);

  function handleDismiss() {
    unregisterPopup("languageDetection");
    localStorage.setItem(STORAGE_KEY, "true");
  }

  function handleSwitchLanguage() {
    if (!detectedLocale) return;

    // Replace the current locale in the path with the detected one
    const newPath = pathname.replace(`/${currentLocale}`, `/${detectedLocale}`);
    localStorage.setItem(STORAGE_KEY, "true");
    unregisterPopup("languageDetection");
    router.push(newPath);
  }

  const popupVariants = {
    hidden: { y: 80, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
    exit: { y: 80, opacity: 0, transition: { duration: 0.5 } },
  };

  const languageName = detectedLocale
    ? dict.languageSwitcher[detectedLocale as keyof typeof dict.languageSwitcher]
    : null;

  return (
    <AnimatePresence>
      {isVisible && detectedLocale && (
        <motion.div
          className="z-[2000] fixed bottom-2 start-2 end-2 md:start-2 md:end-auto md:bottom-2 standalone:bottom-8 !pointer-events-auto"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={popupVariants}
          role="dialog"
          aria-labelledby="language-detection-title"
          aria-describedby="language-detection-description"
        >
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-4 pt-4">
              <div className="flex items-center gap-2">
                <GlobeIcon className="w-5 h-5" aria-hidden="true" />
                <h2
                  id="language-detection-title"
                  className="text-lg font-semibold"
                >
                  {dict.languageDetection.title}
                </h2>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 pt-4">
              <p id="language-detection-description" className="text-sm">
                {dict.languageDetection.description.replace(
                  "{{language}}",
                  languageName || detectedLocale,
                )}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {dict.languageDetection.instructions}
              </p>
            </div>

            {/* Actions */}
            <div className="dark:bg-slate-800 bg-white mt-4 px-4 pb-4 z-0 relative">
              <div className="flex justify-end gap-2">
                <Button variant="outlined" onClick={handleDismiss}>
                  {dict.languageDetection.stayInCurrent}
                </Button>
                <Button variant="primary" onClick={handleSwitchLanguage}>
                  {dict.languageDetection.switchLanguage}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
