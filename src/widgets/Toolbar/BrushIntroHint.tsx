import { usePopupQueue } from "@/contexts/PopupQueueContext";
import { useDictionary } from "@/i18n";
import { BRUSH_INTRO_HINT_KEY, useRendererStore } from "@/store";
import * as Popover from "@radix-ui/react-popover";
import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect } from "react";

/**
 * One-time callout for returning users: the old per-tool rail buttons
 * (pen/bucket/shading/eraser) collapsed into the single brush slot this
 * wraps. Anchored to the slot so it works the same on desktop and mobile;
 * queued through the popup queue so it never fights the tutorial or banners.
 *
 * Shows only when the tutorial was completed in a previous session (new users
 * learn the slot from the tutorial itself, which marks this hint as seen).
 */
const BrushIntroHint: React.FC<
  React.PropsWithChildren<{ side: "left" | "right" }>
> = ({ side, children }) => {
  const { dictionary: dict } = useDictionary();
  const { registerPopup, unregisterPopup, isActivePopup } = usePopupQueue();
  const hasCompletedTutorial = useRendererStore(
    (state) => state.hasCompletedTutorial,
  );
  const showHint = isActivePopup("brushIntroHint");

  useEffect(() => {
    // hasCompletedTutorial is false until the persisted state loads, which
    // also keeps the hint away while the tutorial itself is running.
    if (!hasCompletedTutorial) return;
    if (localStorage.getItem(BRUSH_INTRO_HINT_KEY)) return;
    registerPopup("brushIntroHint");
    return () => unregisterPopup("brushIntroHint");
  }, [hasCompletedTutorial, registerPopup, unregisterPopup]);

  const dismiss = useCallback(() => {
    if (!showHint) return;
    unregisterPopup("brushIntroHint");
    try {
      localStorage.setItem(BRUSH_INTRO_HINT_KEY, "true");
    } catch {
      // Ignore errors
    }
  }, [showHint, unregisterPopup]);

  return (
    <Popover.Root open={showHint} onOpenChange={(o) => !o && dismiss()}>
      <Popover.Anchor asChild>
        {/* Opening the brush slot is discovery — count it as dismissed. */}
        <div onClickCapture={dismiss}>{children}</div>
      </Popover.Anchor>
      <Popover.Portal forceMount>
        <Popover.Content
          forceMount
          side={side}
          align="start"
          sideOffset={14}
          collisionPadding={12}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={dismiss}
          className="z-50 data-[state=closed]:pointer-events-none"
        >
          <AnimatePresence>
            {showHint && (
              <motion.div
                key="brush-intro-hint"
                initial={{
                  opacity: 0,
                  x: side === "right" ? -6 : 6,
                  scale: 0.96,
                }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: side === "right" ? -6 : 6, scale: 0.96 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="w-64 max-w-[calc(100vw-4.5rem)] rounded-lg bg-neutral-900 dark:bg-neutral-800 text-white shadow-lg ring-1 ring-white/10 p-3 text-sm"
              >
                <p className="font-medium leading-tight">
                  {dict.toolbar.brushIntroTitle}
                </p>
                <p className="mt-1 text-neutral-300 leading-snug">
                  {dict.toolbar.brushIntroBody}
                </p>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={dismiss}
                    className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium bg-neutral-900 dark:bg-neutral-800 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors cursor-pointer"
                  >
                    {dict.common.gotIt}
                  </button>
                </div>
                <Popover.Arrow className="fill-neutral-900 dark:fill-neutral-800" />
              </motion.div>
            )}
          </AnimatePresence>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default BrushIntroHint;
