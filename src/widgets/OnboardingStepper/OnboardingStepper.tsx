"use client";

import Button from "@/components/Button";
import { EditorIcon, PreviewIcon } from "@/components/Icons/Icons";
import ToggleSwitch from "@/components/ToggleSwtich/ToggleSwtich";
import useNativeWebview from "@/hooks/useNativeWebview";
import {
  locales,
  setPreferredLocale,
  useDictionary,
  type Locale,
  LOCALE_TO_FLAG,
} from "@/i18n";
import * as Dialog from "@radix-ui/react-dialog";
import { CheckIcon, GlobeIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const ONBOARDING_STORAGE_KEY = "ios-onboarding-completed";
const ONBOARDING_STEP_KEY = "ios-onboarding-step";



type CookiePreferences = {
  analytics: "granted" | "denied";
};

const DEFAULT_COOKIE_PREF: CookiePreferences = {
  analytics: "granted",
};

interface OnboardingStepperProps {
  forceShow?: boolean;
}

export default function OnboardingStepper({
  forceShow,
}: OnboardingStepperProps) {
  const isNativeWebview = useNativeWebview();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window === "undefined") return 0;
    const saved = localStorage.getItem(ONBOARDING_STEP_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [cookiePreferences, setCookiePreferences] =
    useState<CookiePreferences>(DEFAULT_COOKIE_PREF);
  const { dictionary: dict, locale } = useDictionary();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!forceShow && !isNativeWebview) return;

    const hasCompleted = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!hasCompleted) {
      setOpen(true);
    }
  }, [isNativeWebview, forceShow]);

  const handleNext = useCallback(() => {
    if (currentStep < 3) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      localStorage.setItem(ONBOARDING_STEP_KEY, String(nextStep));
    }
  }, [currentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      localStorage.setItem(ONBOARDING_STEP_KEY, String(prevStep));
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    // Save cookie preferences
    localStorage.setItem("consent-popup", "false");
    localStorage.setItem(
      "cookie-preferences",
      JSON.stringify(cookiePreferences),
    );
    const allowAnalytics = cookiePreferences.analytics === "granted";
    window.gtag?.("consent", "update", {
      ad_storage: "denied",
      ad_user_data: allowAnalytics ? "granted" : "denied",
      ad_personalization: "denied",
      analytics_storage: allowAnalytics ? "granted" : "denied",
    });

    // Mark onboarding as complete and clean up step storage
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    localStorage.removeItem(ONBOARDING_STEP_KEY);
    setOpen(false);
  }, [cookiePreferences]);

  const handleToggleAnalytics = useCallback(() => {
    setCookiePreferences((prev) => ({
      ...prev,
      analytics: prev.analytics === "granted" ? "denied" : "granted",
    }));
  }, []);

  const handleLanguageSelect = useCallback(
    (newLocale: Locale) => {
      if (newLocale === locale) return;

      localStorage.setItem("language-detection-dismissed", "true");
      setPreferredLocale(newLocale);
      const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
      router.push(newPath);
    },
    [locale, pathname, router],
  );

  if (!open) return null;

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="text-center h-full flex items-center">
      <div className="mb-6">
        <div className="w-20 h-20 mx-auto mb-4  bg-indigo-50 dark:bg-indigo-950 rounded-2xl flex items-center justify-center">
          <span className="text-4xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="42"
              height="42"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-600"
            >
              <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
              <path d="M20 2v4" />
              <path d="M22 4h-4" />
              <circle cx="4" cy="20" r="2" />
            </svg>
          </span>
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {dict.onboarding.welcomeTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          {dict.onboarding.welcomeDescription}
        </p>
      </div>
    </div>,

    // Step 1: Language Selection
    <div key="language" className=" h-full">
      <div className="text-center mb-6">
        <GlobeIcon className="w-12 h-12 mx-auto mb-4 text-blue-500" />
        <h2 className="text-xl font-bold mb-2">
          {dict.onboarding.languageTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          {dict.onboarding.languageDescription}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 overflow-y-auto">
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => handleLanguageSelect(loc)}
            className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
              locale === loc
                ? "border-blue-500 bg-blue-500/10"
                : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500"
            }`}
          >
            <span className="flex items-center gap-3 flex-1">
              <span
                className={`fi fi-${LOCALE_TO_FLAG[loc]} rounded-sm shrink-0`}
              />
              <span className="">{dict.languageSwitcher[loc]}</span>
            </span>
            {locale === loc && <CheckIcon className="w-5 h-5 text-blue-500" />}
          </button>
        ))}
      </div>
    </div>,

    // Step 2: Cookie Consent
    <div key="cookies" className="h-full flex flex-col justify-center pb-64">
      <div className="text-center mb-6 my-auto">
        {/* <div className="w-12 h-12 mx-auto mb-4 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
          <span className="text-2xl">🍪</span>
        </div> */}
        <h2 className="text-xl font-bold mb-2">
          {dict.onboarding.cookieTitle}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          {dict.onboarding.cookieDescription}
        </p>
      </div>
      <div className="space-y-4">
        <ToggleSwitch
          id="essential_cookies_onboarding"
          label={dict.cookie.essentialCookies}
          checked={true}
          disabled={true}
        />
        <ToggleSwitch
          id="analytics_onboarding"
          label={dict.cookie.analytics}
          checked={cookiePreferences.analytics === "granted"}
          onCheckedChange={handleToggleAnalytics}
        />
      </div>
    </div>,

    // Step 3: App Modes
    <div key="modes" className="h-full flex flex-col justify-center ">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2">{dict.onboarding.modesTitle}</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          {dict.onboarding.modesDescription}
        </p>
      </div>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 shrink-0 bg-blue-500/15 rounded-xl flex items-center justify-center">
            <EditorIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">
              {dict.onboarding.editorModeTitle}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {dict.onboarding.editorModeDescription}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 shrink-0 bg-blue-500/15 rounded-xl flex items-center justify-center">
            <PreviewIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">
              {dict.onboarding.previewModeTitle}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {dict.onboarding.previewModeDescription}
            </p>
          </div>
        </div>
      </div>
    </div>,
  ];

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            className="fixed inset-0 bg-black/60 z-[3000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        </Dialog.Overlay>
        <Dialog.Content asChild>
          <motion.div
            className="fixed inset-x-4 top-1/2 flex flex-col max-w-md mx-auto z-[3001] h-dvh safe-area-pt safe-area-pb"
            initial={{ opacity: 0, scale: 0.95, y: "-45%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: "-45%" }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex-1 basis-full justify-self-stretch flex flex-col justify-between p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-y-auto">
              {/* Progress indicator */}
              <div className="flex gap-1 mb-6">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      index <= currentStep
                        ? "bg-blue-500"
                        : "bg-neutral-200 dark:bg-neutral-700"
                    }`}
                  />
                ))}
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {steps[currentStep]}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <div className="text-sm text-neutral-500 self-center">
                  {currentStep + 1} / {steps.length}
                </div>
                <div className="flex gap-2">
                  {!isFirstStep && (
                    <Button variant="outlined" onClick={handlePrev}>
                      {dict.onboarding.back}
                    </Button>
                  )}
                  {isLastStep ? (
                    <Button variant="primary" onClick={handleComplete}>
                      {dict.onboarding.getStarted}
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={handleNext}>
                      {dict.onboarding.continue}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
