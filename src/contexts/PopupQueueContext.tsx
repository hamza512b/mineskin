"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

// Define popup priorities (lower number = higher priority)
export const POPUP_PRIORITIES = {
  languageDetection: 1, // important, first visit, need to know user's language
  cookie: 2, // important first visit cookie consent popup
  promoBanner: 3, // Limited-time "100% off" sale — takes precedence over the evergreen app-install banner while it's running.
  appInstallBanner: 4, // Native advertisement for mobile app, show it to as many people as possible, after one reload so it doesn't interfere with first impression
  pwaInstall: 5, // Prompt first to install pwa, better user experience for them then having their money.
  iosInstall: 5, // Prompt iOS users to install the app, since they won't get the PWA install prompt.
  tutorial: 7, // Guide users through the app's features.
  modeSwitchHint: 8,
  brushIntroHint: 8, // Tell returning users the drawing tools collapsed into the brush slot.
} as const;

export type PopupId = keyof typeof POPUP_PRIORITIES;

interface PopupQueueContextValue {
  /** Register a popup to be shown. Returns true if successfully registered. */
  registerPopup: (id: PopupId) => void;
  /** Unregister a popup (when dismissed or no longer needed). */
  unregisterPopup: (id: PopupId) => void;
  /** Check if a popup is currently the active (visible) one. */
  isActivePopup: (id: PopupId) => boolean;
  /** The currently active popup ID, or null if none. */
  activePopup: PopupId | null;
}

const PopupQueueContext = createContext<PopupQueueContextValue | null>(null);

export function PopupQueueProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [registeredPopups, setRegisteredPopups] = useState<Set<PopupId>>(
    new Set(),
  );

  const registerPopup = useCallback((id: PopupId) => {
    setRegisteredPopups((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const unregisterPopup = useCallback((id: PopupId) => {
    setRegisteredPopups((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // Get the active popup (highest priority among registered)
  const activePopup = useMemo(() => {
    if (registeredPopups.size === 0) return null;

    // Sort registered popups by priority and return the highest priority one
    const sorted = Array.from(registeredPopups).sort(
      (a, b) => POPUP_PRIORITIES[a] - POPUP_PRIORITIES[b],
    );
    return sorted[0];
  }, [registeredPopups]);

  const isActivePopup = useCallback(
    (id: PopupId) => activePopup === id,
    [activePopup],
  );

  const value = useMemo(
    () => ({ registerPopup, unregisterPopup, isActivePopup, activePopup }),
    [registerPopup, unregisterPopup, isActivePopup, activePopup],
  );

  return (
    <PopupQueueContext.Provider value={value}>
      {children}
    </PopupQueueContext.Provider>
  );
}

export function usePopupQueue() {
  const context = useContext(PopupQueueContext);
  if (!context) {
    throw new Error("usePopupQueue must be used within a PopupQueueProvider");
  }
  return context;
}
