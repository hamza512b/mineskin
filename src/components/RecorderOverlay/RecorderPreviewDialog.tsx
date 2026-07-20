/* eslint-disable @next/next/no-img-element */
"use client";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import useIsTouch from "@/hooks/useIsTouch";
import { useDictionary } from "@/i18n";
import Spinner from "@/components/Spinner";
import * as Dialog from "@radix-ui/react-dialog";

export interface PreviewClip {
  /** Object URL for the recorded blob, played in the <video> (or shown in the <img>). */
  url: string;
  /** Suggested filename for the share/download. */
  filename: string;
  extension: string;
  /** Media kind — a recorded clip ("video") or a screenshot ("image"). */
  kind?: "video" | "image";
}

interface RecorderPreviewDialogProps {
  clip: PreviewClip | null;
  /** True while the share/download hand-off is in flight. */
  sharing: boolean;
  onShare: () => void;
  onClose: () => void;
}

/**
 * Shown once a clip finishes recording or a screenshot is captured: the user
 * previews the 9:16 video / square image and then explicitly taps Share/Save.
 * Doing the hand-off from a real tap (not automatically after capture) is also
 * what keeps the iOS Web Share sheet inside a user gesture. Matches the app's
 * dialog convention — a bottom drawer on touch, a centered modal on pointer
 * devices.
 */
export default function RecorderPreviewDialog({
  clip,
  sharing,
  onShare,
  onClose,
}: RecorderPreviewDialogProps) {
  const { dictionary: dict } = useDictionary();
  const rec = dict.recorder;
  const isCoarse = useIsTouch();
  const open = clip !== null;
  const isImage = clip?.kind === "image";

  const title = isImage ? rec.imagePreviewTitle : rec.previewTitle;
  const hint = isImage ? rec.imagePreviewHint : rec.previewHint;
  const shareLabel = isCoarse
    ? isImage
      ? rec.shareImage
      : rec.share
    : rec.download;

  // maxHeightClass: "max-h-full" only resolves inside the drawer, whose
  // DrawerContent has a definite height; the centered dialog is max-h only,
  // so it needs a viewport-based cap instead.
  const media = (maxHeightClass: string) =>
    clip &&
    (isImage ? (
      <img
        key={clip.url}
        src={clip.url}
        alt={title}
        className={`aspect-square ${maxHeightClass} max-w-full rounded-xl bg-black object-contain shadow-lg [image-rendering:pixelated]`}
      />
    ) : (
      <video
        key={clip.url}
        src={clip.url}
        className={`aspect-[9/16] ${maxHeightClass} max-w-full rounded-xl bg-black object-contain shadow-lg`}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        controls
      />
    ));

  const actions = (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onClose}
        disabled={sharing}
        className="flex-1 rounded-md border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-200 disabled:opacity-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        {rec.discard}
      </button>
      <button
        type="button"
        onClick={onShare}
        disabled={sharing}
        className="flex flex-[2] items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
      >
        {sharing && (
          <Spinner size="sm" fillColorClass="fill-white" className="size-4" />
        )}
        {shareLabel}
      </button>
    </div>
  );

  const handleOpenChange = (next: boolean) => {
    if (!next && !sharing) onClose();
  };

  if (isCoarse) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent className="z-[2147483646] !h-[85vh] !max-h-[85vh] safe-area-pb safe-area-pl safe-area-pr">
          <DrawerHeader className="shrink-0">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{hint}</DrawerDescription>
          </DrawerHeader>
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4 pt-0">
            {media("max-h-full")}
          </div>
          <div className="shrink-0 p-4 pt-2">{actions}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[2147483646] bg-white/50 backdrop-blur-sm dark:bg-black/50" />
        <Dialog.Content
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 z-[2147483646] flex max-h-[90vh] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border border-neutral-200 bg-neutral-100 p-6 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          <Dialog.Title className="mb-1 shrink-0 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mb-4 shrink-0 text-sm text-neutral-600 dark:text-neutral-400">
            {hint}
          </Dialog.Description>
          <div className="mb-6 flex min-h-0 flex-1 items-center justify-center">
            {media("max-h-[calc(90vh-14rem)]")}
          </div>
          <div className="shrink-0">{actions}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
