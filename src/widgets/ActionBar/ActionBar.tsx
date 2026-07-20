import Button from "@/components/Button";
import Dropdown, { DropdownItem } from "@/components/Dropdown";
import { EditorIcon, PreviewIcon } from "@/components/Icons/Icons";
import { usePopupQueue } from "@/contexts/PopupQueueContext";
import type { MiSkiRenderer } from "@/core/MiSkiRenderer";
import { useDictionary } from "@/i18n";
import LibraryDialog from "@/widgets/LibraryDialog/LibraryDialog";
import { CardStackIcon } from "@radix-ui/react-icons";
import * as Popover from "@radix-ui/react-popover";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUpIcon } from "lucide-react";
import Link from "next/link";
import React, { useCallback, useState } from "react";

const MODE_SWITCH_HINT_KEY = "mode-switch-hint-dismissed";

export type Mode = "Preview" | "Editing";

interface TopBarProps {
  className?: string;
  renderer: MiSkiRenderer | null;
  downloadTexture: () => void;
  mode: "Editing" | "Preview";
}

function ActionBar({
  className,
  renderer,
  downloadTexture,
  mode,
}: TopBarProps) {
  const { dictionary: dict, locale } = useDictionary();
  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false);
  const { /*registerPopup,*/ unregisterPopup, isActivePopup } = usePopupQueue();
  const showHint = isActivePopup("modeSwitchHint");

  // Mode switch hint disabled — too many popups.
  // useEffect(() => {
  //   if (typeof window === "undefined") return;
  //   if (localStorage.getItem(MODE_SWITCH_HINT_KEY)) return;
  //   // If the user is already in Editing mode, they've discovered the
  //   // mode switch on their own — count the hint as dismissed.
  //   if (mode === "Editing") {
  //     try {
  //       localStorage.setItem(MODE_SWITCH_HINT_KEY, "true");
  //     } catch {}
  //     return;
  //   }
  //   if (mode !== "Preview") return;
  //   // Skip the hint for returning users who already have saved skins.
  //   if (getLibraryState().entries.length > 1) {
  //     try {
  //       localStorage.setItem(MODE_SWITCH_HINT_KEY, "true");
  //     } catch {}
  //     return;
  //   }
  //   registerPopup("modeSwitchHint");
  //   return () => unregisterPopup("modeSwitchHint");
  // }, [mode, registerPopup, unregisterPopup]);

  const dismissHint = useCallback(() => {
    if (!showHint) return;
    unregisterPopup("modeSwitchHint");
    try {
      localStorage.setItem(MODE_SWITCH_HINT_KEY, "true");
    } catch {}
  }, [showHint, unregisterPopup]);

  const modeOptions = [
    {
      label: dict.common.preview,
      value: "Preview",
      icon: (
        <PreviewIcon
          className="h-4 w-4 text-neutral-50 dark:text-neutral-400"
          aria-hidden="true"
        />
      ),
    },
    {
      label: dict.common.editing,
      value: "Editing",

      icon: (
        <EditorIcon
          className="h-4 w-4 text-neutral-50 dark:text-neutral-400"
          aria-hidden="true"
        />
      ),
    },
  ];

  const handleOpenLibrary = useCallback(() => {
    setLibraryDialogOpen(true);
  }, []);

  const currentModeLabel =
    mode === "Preview" ? dict.common.preview : dict.common.editing;

  return (
    <>
      <div
        className={clsx(
          "w-full flex items-center justify-between gap-4 rounded-lg pointer-events-none [&_>_*]:pointer-events-auto select-none",
          "p-2",
          className,
        )}
      >
        <Popover.Root open={showHint} onOpenChange={(o) => !o && dismissHint()}>
          <Popover.Anchor asChild>
            <div onClickCapture={dismissHint}>
              <Dropdown
                onOpenChange={dismissHint}
                trigger={
                  <Button
                    variant={"secondary"}
                    size={"sm"}
                    rightIcon={<ChevronUpIcon className="h-4 w-4 opacity-70" />}
                  >
                    {modeOptions.find((option) => option.value === mode)
                      ?.icon || modeOptions[0].icon}
                    <span className="ml-2 rtl:ml-0 rtl:mr-2">
                      {currentModeLabel}
                    </span>
                  </Button>
                }
              >
                <Link href={`/${locale}/preview`}>
                  <DropdownItem
                    leftIcon={<PreviewIcon className="h-4 w-4" />}
                    className={clsx(
                      mode === "Preview" &&
                        "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium",
                    )}
                  >
                    {dict.common.preview}
                  </DropdownItem>
                </Link>
                <Link href={`/${locale}/editor`}>
                  <DropdownItem
                    leftIcon={<EditorIcon className="h-4 w-4" />}
                    className={clsx(
                      mode === "Editing" &&
                        "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium",
                    )}
                  >
                    {dict.common.editor}
                  </DropdownItem>
                </Link>
              </Dropdown>
            </div>
          </Popover.Anchor>
          <Popover.Portal forceMount>
            <Popover.Content
              forceMount
              side="bottom"
              align="start"
              sideOffset={8}
              collisionPadding={8}
              onOpenAutoFocus={(e) => e.preventDefault()}
              onPointerDownOutside={(e) => e.preventDefault()}
              onInteractOutside={(e) => e.preventDefault()}
              onEscapeKeyDown={(e) => e.preventDefault()}
              className="z-50 data-[state=closed]:pointer-events-none"
            >
              <AnimatePresence>
                {showHint && (
                  <motion.div
                    key="mode-switch-hint"
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="w-64 rounded-lg bg-neutral-900 dark:bg-neutral-800 text-white shadow-lg ring-1 ring-white/10 p-3 text-sm origin-top"
                  >
                    <p className="font-medium leading-tight">
                      {dict.common.modeSwitchHintTitle}
                    </p>
                    <p className="mt-1 text-neutral-300 leading-snug">
                      {dict.common.modeSwitchHintBody}
                    </p>
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={dismissHint}
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
        <Button
          size={"sm"}
          variant="secondary"
          onClick={handleOpenLibrary}
          leftIcon={<CardStackIcon className="h-4 w-4" aria-hidden="true" />}
        >
          {dict.library.title}
        </Button>
      </div>
      <LibraryDialog
        open={libraryDialogOpen}
        onOpenChange={setLibraryDialogOpen}
        renderer={renderer}
        downloadTexture={downloadTexture}
      />
    </>
  );
}

export default React.memo(ActionBar);
