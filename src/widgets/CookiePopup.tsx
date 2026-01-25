"use client";
import Button from "@/components/Button/index";
import ToggleSwitch from "@/components/ToggleSwtich/ToggleSwtich";
import { useDictionary } from "@/i18n";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type CookiePreferences = {
  analytics: "granted" | "denied";
};

const DEFAULT_COOKIE_PERF: CookiePreferences = {
  analytics: "granted",
};
function parseCookePreferences() {
  try {
    if (typeof window === "undefined") {
      return DEFAULT_COOKIE_PERF;
    }
    // Migration from old cookie preferences
    const consentPopup = localStorage.getItem("consent-popup");
    let savedPreferences = localStorage.getItem("cookie-preferences");
    if (!!consentPopup && !savedPreferences) {
      localStorage.setItem(
        "cookie-preferences",
        JSON.stringify({
          analytics: consentPopup === "false" ? "denied" : "granted",
        }),
      );
      savedPreferences = localStorage.getItem("cookie-preferences");
    }

    const parsedPreferences = savedPreferences
      ? JSON.parse(savedPreferences)
      : DEFAULT_COOKIE_PERF;

    return parsedPreferences;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    return DEFAULT_COOKIE_PERF;
  }
}
export default function CookiePopup() {
  const [popupOpen, setPopupOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(() =>
    parseCookePreferences(),
  );
  const path = usePathname();
  const { dictionary: dict, locale } = useDictionary();

  function handleToggle(key: keyof CookiePreferences) {
    setPreferences((prev) => ({
      ...prev,
      [key]: prev[key] === "granted" ? "denied" : "granted",
    }));
  }

  function acceptAll() {
    setPopupOpen(false);

    localStorage.setItem("consent-popup", "false");
    localStorage.setItem("cookie-preferences", JSON.stringify(preferences));
    const allowAnalytics = preferences.analytics === "granted";
    window.gtag("consent", "update", {
      ad_storage: "denied",
      ad_user_data: allowAnalytics ? "granted" : "denied",
      ad_personalization: "denied",
      analytics_storage: allowAnalytics ? "granted" : "denied",
    });
  }
  function savePreferences() {
    setPopupOpen(false);
    localStorage.setItem("consent-popup", "false");
    localStorage.setItem("cookie-preferences", JSON.stringify(preferences));

    const allowAnalytics = preferences.analytics === "granted";
    window?.gtag("consent", "update", {
      ad_storage: "denied",
      ad_user_data: allowAnalytics ? "granted" : "denied",
      ad_personalization: "denied",
      analytics_storage: allowAnalytics ? "granted" : "denied",
    });
  }

  useEffect(() => {
    const consented = window.localStorage.getItem("consent-popup");
    setPopupOpen(!consented);

    const cookiePreferences = parseCookePreferences();
    const allowAnalytics = cookiePreferences.analytics === "granted";
    window?.gtag("consent", "update", {
      ad_storage: "denied",
      ad_user_data: allowAnalytics ? "granted" : "denied",
      ad_personalization: "denied",
      analytics_storage: allowAnalytics ? "granted" : "denied",
    });
  }, []);

  function toggleDetails() {
    setDetailsOpen(!detailsOpen);
  }

  const popupVariants = {
    hidden: { y: 80, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
    exit: { y: 80, opacity: 0, transition: { duration: 0.5 } },
  };

  const detailsVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { height: "auto", opacity: 1, transition: { duration: 0.3 } },
    exit: { height: 0, opacity: 0, transition: { duration: 0.3 } },
  };

  const actionsVariants = {
    hidden: { opacity: 0, height: "auto" },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
    exit: { opacity: 0, height: "auto", transition: { duration: 0.3 } },
  };

  if (path.includes("/policies")) {
    return null;
  }

  return (
    <AnimatePresence>
      {popupOpen && (
        <motion.div
          className="z-[2000] fixed bottom-2 left-2 right-2 md:left-2 md:bottom-2 standalone:bottom-8 !pointer-events-auto"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={popupVariants}
          role="dialog"
          aria-labelledby="cookie-settings-title"
          aria-describedby="cookie-settings-description"
        >
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-4 pt-4">
              <h2 id="cookie-settings-title" className="text-lg font-semibold">
                {dict.cookie.title}
              </h2>
            </div>

            {/* Main content */}
            <div className="px-4 pt-4">
              <p id="cookie-settings-description" className="text-sm">
                {dict.cookie.description}{" "}
                <Link
                  href={`/${locale}/policies/cookie-policy`}
                  className="text-blue-600 dark:text-blue-400 underline focus:ring-2 focus:ring-blue-500 focus:outline-none rounded-sm"
                >
                  {dict.cookie.cookiePolicy}
                </Link>
                .
              </p>

              {/* Cookie preferences panel */}
              <AnimatePresence>
                {detailsOpen && (
                  <motion.div
                    id="cookie-preferences-panel"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="mt-4"
                    variants={detailsVariants}
                  >
                    <div className="space-y-4">
                      <ToggleSwitch
                        id="essential_cookies"
                        label={dict.cookie.essentialCookies}
                        checked={true}
                        disabled={true}
                      />

                      <ToggleSwitch
                        id="analytics"
                        label={dict.cookie.analytics}
                        checked={preferences.analytics === "granted"}
                        onCheckedChange={() => handleToggle("analytics")}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="dark:bg-slate-800 bg-white mt-4 px-4 pb-4 z-0 relative">
              <AnimatePresence>
                {detailsOpen ? (
                  <motion.div
                    variants={actionsVariants}
                    className="flex justify-end"
                  >
                    <Button
                      variant="primary"
                      onClick={savePreferences}
                      aria-label={dict.cookie.savePreferences}
                    >
                      {dict.cookie.savePreferences}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={actionsVariants}
                    className="flex justify-end gap-2"
                  >
                    <Button
                      variant="outlined"
                      onClick={toggleDetails}
                      aria-label={dict.cookie.customize}
                    >
                      {dict.cookie.customize}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={acceptAll}
                      aria-label={dict.cookie.acceptAll}
                    >
                      {dict.cookie.acceptAll}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
