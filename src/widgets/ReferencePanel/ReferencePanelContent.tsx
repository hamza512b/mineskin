"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useStore } from "zustand";
import { Cross1Icon, PlusIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import { useDictionary } from "@/i18n";
import { cn } from "@/lib/utils";
import { ColorSwatch } from "@/components/ColorPicker/ColorSwatch";
import { getRendererState, useRendererStore } from "@/store";
import {
  ReferenceLimitError,
  referenceStore,
  type ReferenceEntry,
} from "@/store/referenceStore";
import {
  MAX_REFERENCES,
  isAcceptedImageType,
  mergePalettes,
} from "@/lib/referenceImage";
import ReferenceViewport from "./ReferenceViewport";

/** Object URLs for filmstrip thumbnails, revoked when an entry goes away. */
function useThumbnailUrls(entries: ReferenceEntry[]) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const urlsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const entry of entries) {
      next[entry.id] =
        urlsRef.current[entry.id] ?? URL.createObjectURL(entry.thumbBlob);
    }
    for (const [id, url] of Object.entries(urlsRef.current)) {
      if (!next[id]) URL.revokeObjectURL(url);
    }
    urlsRef.current = next;
    setUrls(next);
  }, [entries]);

  useEffect(
    () => () => {
      for (const url of Object.values(urlsRef.current))
        URL.revokeObjectURL(url);
      urlsRef.current = {};
    },
    [],
  );

  return urls;
}

/** Movement past this and the press was a sheet pull, not a tap. */
const TAP_SLOP = 10;

/**
 * Press handling for a control that opens the system file picker.
 *
 * On iOS `click` lands well after the finger lifts — the sheet's own gesture
 * plumbing runs first, and Safari still arbitrates double-tap-to-zoom — so the
 * native photo sheet visibly trails the tap. `pointerup` is an
 * activation-triggering event, so opening the picker there is still a valid
 * user gesture and skips that wait. Mouse and keyboard keep the click path.
 *
 * The state is per-trigger rather than shared across the panel's two entry
 * points: the empty state unmounts the moment the first import lands, so
 * anything it left half-set would strand the tile that replaces it.
 */
function useFilePickerTrigger(open: () => void) {
  const pressRef = useRef<{ id: number; x: number; y: number } | null>(null);
  const pointerTypeRef = useRef("");

  return useMemo(
    () => ({
      onPointerDown: (e: React.PointerEvent) => {
        pointerTypeRef.current = e.pointerType;
        pressRef.current =
          e.pointerType === "touch"
            ? { id: e.pointerId, x: e.clientX, y: e.clientY }
            : null;
      },
      onPointerUp: (e: React.PointerEvent) => {
        const press = pressRef.current;
        pressRef.current = null;
        if (!press || press.id !== e.pointerId) return;
        if (Math.hypot(e.clientX - press.x, e.clientY - press.y) > TAP_SLOP) {
          return;
        }
        open();
      },
      onPointerCancel: () => {
        pressRef.current = null;
      },
      onClick: (e: React.MouseEvent) => {
        // A touch tap is settled on pointerup, and iOS holds this event back
        // until the picker that tap opened is dismissed — by which point the
        // next tap is already underway, so honouring it here would open a
        // second picker on top of the one that tap is opening. Keyboard
        // activation synthesizes a click with no pointer behind it (detail 0)
        // and still needs this path.
        if (e.detail !== 0 && pointerTypeRef.current === "touch") return;
        open();
      },
    }),
    [open],
  );
}

/**
 * Plain click-to-open, with a drag escape hatch.
 *
 * For a small explicit control the `pointerup` trick above isn't worth its
 * failure modes — a button the finger lands on squarely is unambiguous, so the
 * normal activation path is fine. What it does need is the slop check: this
 * button sits on the mobile sheet, and the sheet slides under a finger that's
 * pulling it, so a press that starts and ends on the button still fires
 * `click` at the end of a drag. Opening the photo picker out of that is
 * jarring.
 */
function useTapToOpen(open: () => void) {
  const originRef = useRef<{ x: number; y: number } | null>(null);

  return useMemo(
    () => ({
      onPointerDown: (e: React.PointerEvent) => {
        originRef.current = { x: e.clientX, y: e.clientY };
      },
      onClick: (e: React.MouseEvent) => {
        const origin = originRef.current;
        originRef.current = null;
        // Keyboard activation synthesizes a click with no pointer behind it
        // (detail 0), so there's no travel to measure and nothing to reject.
        if (
          e.detail !== 0 &&
          origin &&
          Math.hypot(e.clientX - origin.x, e.clientY - origin.y) > TAP_SLOP
        ) {
          return;
        }
        open();
      },
    }),
    [open],
  );
}

interface ReferencePanelContentProps {
  className?: string;
  /** Rendered by the shell so the header matches each surface's conventions. */
  header?: React.ReactNode;
}

const ReferencePanelContent: React.FC<ReferencePanelContentProps> = ({
  className,
  header,
}) => {
  const { dictionary: dict } = useDictionary();
  const entries = useStore(referenceStore, (s) => s.entries);
  const activeId = useStore(referenceStore, (s) => s.activeReferenceId);
  const isLoading = useStore(referenceStore, (s) => s.isLoading);
  // Swatch selection state; `paintColor` is normalized uppercase by setValue,
  // and rgbToHex emits uppercase, so these compare directly.
  const paintColor = useRendererStore((s) => s.paintColor);

  const [showAllPalettes, setShowAllPalettes] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnails = useThumbnailUrls(entries);

  const active = useMemo(
    () => entries.find((e) => e.id === activeId) ?? null,
    [entries, activeId],
  );

  const palette = useMemo(() => {
    if (showAllPalettes) return mergePalettes(entries.map((e) => e.palette));
    return active?.palette ?? [];
  }, [showAllPalettes, entries, active]);

  const addFiles = useCallback(
    async (files: (File | Blob)[]) => {
      const images = files.filter(isAcceptedImageType);
      if (images.length === 0) {
        toast.error(dict.reference.invalidFormat, {
          position: "bottom-center",
        });
        return;
      }
      setImporting(true);
      try {
        for (const file of images) {
          await referenceStore.getState().addFromFile(file);
        }
      } catch (err) {
        toast.error(
          err instanceof ReferenceLimitError
            ? dict.reference.limitReached.replace(
                "{{count}}",
                String(MAX_REFERENCES),
              )
            : dict.reference.importFailed,
          { position: "bottom-center" },
        );
        // Entries added before the failure are already saved; stop rather than
        // half-importing the rest of a multi-file drop silently.
      } finally {
        setImporting(false);
      }
    },
    [dict],
  );

  // Pasting an image is how reference art actually travels; nothing else in
  // the app claims a global paste, so this is free to take it.
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      const files = Array.from(event.clipboardData?.files ?? []);
      if (files.length === 0) return;
      event.preventDefault();
      void addFiles(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [addFiles]);

  // Removal is one tap with no confirmation — a reference image is cheap and a
  // dialog for it is noise. The undo toast is what makes that safe: the entry
  // object is still in hand here, so putting it back is exact.
  const handleDelete = useCallback(
    async (entry: ReferenceEntry) => {
      const wasActive =
        referenceStore.getState().activeReferenceId === entry.id;
      await referenceStore.getState().deleteEntry(entry.id);
      toast(dict.reference.removed, {
        position: "bottom-center",
        action: {
          label: dict.toolbar.undo,
          onClick: () => {
            void referenceStore
              .getState()
              .restoreEntry(entry, wasActive)
              .catch(() => {
                toast.error(dict.reference.importFailed, {
                  position: "bottom-center",
                });
              });
          },
        },
      });
    },
    [dict],
  );

  const handlePick = useCallback((hex: string) => {
    const state = getRendererState();
    // Only the color: a photo's alpha says nothing about how opaque the brush
    // should be, and silently changing it would surprise people mid-stroke.
    state.setValue("paintColor", hex, "App");
    state.save();
  }, []);

  // Both triggers drive the one input, and a second `.click()` while iOS is
  // still presenting the photo sheet makes it tear the sheet down and present
  // again — which reads as a long stall, not a double-open. The window only has
  // to outlast one presentation; dismissing the sheet and tapping again takes
  // far longer than this.
  const REOPEN_GUARD_MS = 500;
  const lastOpenRef = useRef(0);
  const openPicker = useCallback(() => {
    const now = performance.now();
    if (now - lastOpenRef.current < REOPEN_GUARD_MS) return;
    lastOpenRef.current = now;
    fileInputRef.current?.click();
  }, []);

  const pickerPressProps = useFilePickerTrigger(openPicker);
  const emptyStatePressProps = useTapToOpen(openPicker);

  const atLimit = entries.length >= MAX_REFERENCES;
  const limitMessage = dict.reference.limitReached.replace(
    "{{count}}",
    String(MAX_REFERENCES),
  );

  return (
    <div className={cn("flex min-h-0 flex-col gap-3", className)}>
      {header}

      <input
        ref={fileInputRef}
        type="file"
        // No `capture` attribute: this opens the photo library through the
        // system picker, which needs no native permission string.
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (files.length) void addFiles(files);
        }}
      />

      {/* The selection ring draws outside the tile's box, so the scroll
          container needs 2px of padding or the first tile's ring is clipped.
          The matching negative margin keeps the strip aligned with the rest
          of the panel. */}
      <div className="-m-0.5 flex shrink-0 items-center gap-2 overflow-x-auto p-0.5 pb-1.5">
        {entries.map((entry) => (
          <div key={entry.id} className="group/thumb relative shrink-0">
            <button
              type="button"
              onClick={() =>
                referenceStore.getState().setActiveReference(entry.id)
              }
              aria-label={entry.name}
              aria-pressed={entry.id === activeId}
              className={cn(
                "block h-10 w-10 overflow-hidden rounded-md transition-all",
                entry.id === activeId
                  ? "ring-2 ring-blue-600 dark:ring-blue-500"
                  : "opacity-80 hover:opacity-100",
              )}
            >
              {thumbnails[entry.id] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbnails[entry.id]}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </button>
            {/* Corner badge, not a full-tile overlay: an overlay sits above the
                select button and swallows its clicks, so every tap on a
                thumbnail would remove it instead of selecting it. Staying in
                the corner keeps the rest of the tile a select target, and it
                stays inside the tile's box because the strip scrolls and
                anything hanging outside gets clipped. It reveals on hover for
                a mouse, and on the already-selected tile for touch. */}
            <button
              type="button"
              onClick={() => void handleDelete(entry)}
              aria-label={dict.reference.remove}
              title={dict.reference.remove}
              className={cn(
                "absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-bl-md rounded-tr-md bg-black/65 text-white opacity-0 transition-opacity hover:bg-black/80 focus-visible:opacity-100 group-hover/thumb:opacity-100",
                entry.id === activeId && "pointer-coarse:opacity-100",
              )}
            >
              <Cross1Icon className="h-3 w-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          {...pickerPressProps}
          disabled={importing}
          aria-label={dict.reference.add}
          title={atLimit ? limitMessage : dict.reference.add}
          className="group flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-md border border-dashed border-neutral-400 text-neutral-500 transition-colors hover:border-blue-600 disabled:opacity-50 dark:border-neutral-600 dark:text-neutral-400"
        >
          <PlusIcon className="h-4 w-4 transition-colors group-hover:text-blue-600" />
        </button>
      </div>

      {false && active ? (
        <ReferenceViewport
          entry={active}
          onPick={handlePick}
          className="min-h-40 flex-1"
        />
      ) : (
        // The panel-sized area is deliberately inert: as a button it was both
        // the import target and most of the mobile sheet's drag surface, and
        // arbitrating between the two per press is what made the photo picker
        // unreliable. Leaving it plain hands every press it doesn't need to
        // the sheet, and the button below is the only thing that imports.
        <div className="flex min-h-40 flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-neutral-300 px-4 text-center text-xs text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          <span>
            {isLoading ? dict.reference.loading : dict.reference.emptyState}
          </span>
          {!isLoading && (
            <button
              type="button"
              {...emptyStatePressProps}
              disabled={importing}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 pointer-coarse:min-h-11 pointer-coarse:px-4 pointer-coarse:text-sm"
            >
              <PlusIcon className="h-4 w-4" />
              {dict.reference.add}
            </button>
          )}
        </div>
      )}

      {palette.length > 0 && (
        <div className="shrink-0">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {showAllPalettes
                ? dict.reference.allColors
                : dict.reference.imageColors}
            </span>
            {entries.length > 1 && (
              <button
                type="button"
                onClick={() => setShowAllPalettes((v) => !v)}
                className="cursor-pointer text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                {showAllPalettes
                  ? dict.reference.thisImage
                  : dict.reference.allReferences}
              </button>
            )}
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(28px,1fr))] gap-2">
            {palette.map((color) => (
              <ColorSwatch
                key={color}
                color={color}
                selected={color === paintColor}
                className="aspect-square w-full transition-all hover:ring-2 hover:ring-blue-600 focus:outline-none"
                onClick={() => handlePick(color)}
                aria-label={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ReferencePanelContent);
