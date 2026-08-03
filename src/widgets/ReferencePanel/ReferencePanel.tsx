"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cross1Icon } from "@radix-ui/react-icons";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import IconButton from "@/components/IconButton/IconButton";
import { useDictionary } from "@/i18n";
import { cn } from "@/lib/utils";
import useIsTouch from "@/hooks/useIsTouch";
import useMediaQuery from "@/hooks/useMediaQuery";
import { getRendererState } from "@/store";
import { ensureReferencesInitialized } from "@/store/referenceStore";
import ReferencePanelContent from "./ReferencePanelContent";

// Docked column bounds (px), mirroring the settings panel so the two read as
// the same kind of workspace furniture.
const REFERENCE_MIN_WIDTH = 260;
const REFERENCE_MAX_WIDTH = 520;
const REFERENCE_DEFAULT_WIDTH = 300;
const REFERENCE_WIDTH_KEY = "reference-panel-width";
const REFERENCE_VIEWPORT_MARGIN = 16;
const clampWidth = (w: number) =>
  Math.min(REFERENCE_MAX_WIDTH, Math.max(REFERENCE_MIN_WIDTH, w));

// Mobile sheet snaps: folded shows the filmstrip and palette so you can pick
// swatches while painting; expanded opens the image for a precise pick.
const SNAP_FOLDED_HEIGHT = 240;
const SNAP_EXPANDED = 1;

interface ReferencePanelProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ReferencePanel: React.FC<ReferencePanelProps> = ({ open, setOpen }) => {
  const { dictionary: dict, locale } = useDictionary();
  const isCoarse = useIsTouch();
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const useDrawer = isCoarse || isSmallScreen;
  const isRtl = locale === "ar";
  // The panel docks on the leading edge, so it slides in from that side.
  const slideDirection = isRtl ? "100%" : "-100%";

  // References live in IndexedDB but aren't needed to boot the renderer, so
  // the store initializes the first time the panel is opened.
  useEffect(() => {
    if (!open) return;
    void ensureReferencesInitialized(() =>
      getRendererState().initializeIndexDB(),
    ).catch(() => {
      // The content area shows its own empty/error state; a failure here just
      // means there's nothing to list.
    });
  }, [open]);

  const [width, setWidth] = useState(() => {
    if (typeof window === "undefined") return REFERENCE_DEFAULT_WIDTH;
    const saved = Number(localStorage.getItem(REFERENCE_WIDTH_KEY));
    return saved ? clampWidth(saved) : REFERENCE_DEFAULT_WIDTH;
  });
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? REFERENCE_DEFAULT_WIDTH : window.innerWidth,
  );
  const [isResizing, setIsResizing] = useState(false);
  const renderedWidth = useMemo(
    () => Math.min(width, Math.max(0, viewportWidth - REFERENCE_VIEWPORT_MARGIN)),
    [viewportWidth, width],
  );

  useEffect(() => {
    const syncViewportWidth = () => setViewportWidth(window.innerWidth);
    syncViewportWidth();
    window.addEventListener("resize", syncViewportWidth);
    return () => window.removeEventListener("resize", syncViewportWidth);
  }, []);

  // Drag-to-resize. The handle sits on the panel's canvas-facing (end) edge;
  // dragging it toward the canvas grows the panel, and the sign flips in RTL.
  const onResizeDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startW = width;
      const sign = isRtl ? -1 : 1;
      let finalW = startW;
      setIsResizing(true);
      const move = (ev: PointerEvent) => {
        finalW = clampWidth(startW + sign * (ev.clientX - startX));
        setWidth(finalW);
      };
      const up = () => {
        setIsResizing(false);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        try {
          localStorage.setItem(REFERENCE_WIDTH_KEY, String(finalW));
        } catch {
          /* persistence is best-effort */
        }
      };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [width, isRtl],
  );

  // vaul only understands plain "###px" snap strings (no env()/calc()), so
  // measure the home-indicator inset once and fold it into the folded height.
  const [snapFolded, setSnapFolded] = useState(`${SNAP_FOLDED_HEIGHT}px`);
  useEffect(() => {
    const probe = document.createElement("div");
    probe.style.cssText =
      "position:fixed;visibility:hidden;padding-bottom:env(safe-area-inset-bottom,0px)";
    document.body.appendChild(probe);
    const inset = parseFloat(getComputedStyle(probe).paddingBottom) || 0;
    probe.remove();
    if (inset > 0) setSnapFolded(`${SNAP_FOLDED_HEIGHT + inset}px`);
  }, []);
  const [snap, setSnap] = useState<number | string | null>(SNAP_EXPANDED);

  // vaul's release rules are velocity-first, so slow-but-deliberate drags
  // spring back. Judge from the finger instead: downward travel past the
  // tolerance folds an expanded sheet or closes a folded one. The fold is
  // deferred a frame because vaul re-asserts the current snap during release.
  const COLLAPSE_TOLERANCE_PX = 80;
  const gestureStart = useRef<{ x: number; y: number; snap: typeof snap } | null>(
    null,
  );
  const onSheetPress = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.isPrimary) return;
    // This runs in the capture phase, so the viewport can't stop it by the time
    // it sees the event. Drags that start on the image are picks, not sheet
    // gestures — otherwise dragging down to aim would also fold the sheet.
    if ((e.target as HTMLElement | null)?.closest("[data-reference-viewport]")) {
      return;
    }
    const sheet = e.currentTarget;
    gestureStart.current = { x: e.pageX, y: e.pageY, snap };
    const end = (ev: PointerEvent) => {
      window.removeEventListener("pointerup", end, true);
      window.removeEventListener("pointercancel", end, true);
      const start = gestureStart.current;
      gestureStart.current = null;
      if (!start) return;
      const pulledDown = ev.pageY - start.y;
      const visible = window.innerHeight - sheet.getBoundingClientRect().top;
      // Mostly-vertical guard keeps a drag across the image from reading as a
      // pull on the sheet.
      const deliberatePull =
        pulledDown > COLLAPSE_TOLERANCE_PX &&
        pulledDown > Math.abs(ev.pageX - start.x);
      if (
        visible < parseInt(snapFolded) / 2 ||
        (start.snap !== SNAP_EXPANDED && deliberatePull)
      ) {
        setOpen(false);
      } else if (start.snap === SNAP_EXPANDED && deliberatePull) {
        requestAnimationFrame(() => setSnap(snapFolded));
      }
    };
    window.addEventListener("pointerup", end, true);
    window.addEventListener("pointercancel", end, true);
  };

  if (useDrawer) {
    return (
      <Drawer
        open={open}
        onOpenChange={setOpen}
        snapPoints={[snapFolded, SNAP_EXPANDED]}
        activeSnapPoint={snap}
        setActiveSnapPoint={setSnap}
        // Non-modal so the canvas stays paintable behind the sheet — that's
        // the whole point of a reference sitting alongside the model.
        modal={false}
        // Nothing in this sheet scrolls, and vaul's scroll-lock debounce
        // otherwise eats drags that start with a slight upward wobble.
        scrollLockTimeout={0}
        // Without this a fast flick down skips the folded snap and dismisses.
        snapToSequentialPoint
      >
        <DrawerContent
          // select-none + no touch callout: vaul only disables selection on
          // fine-pointer devices, so on iOS a slow drag starts the system text
          // selection gesture and pointercancels the pick.
          className="mx-auto h-full max-w-md select-none data-[vaul-drawer-direction=bottom]:max-h-[93%]"
          style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none" }}
          onPointerDownCapture={onSheetPress}
        >
          <div
            className="flex min-h-0 flex-1 flex-col touch-none px-[18px] pt-3"
            style={{
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)",
            }}
          >
            <ReferencePanelContent
              className="min-h-0 flex-1"
              header={
                <div className="flex shrink-0 items-center justify-between px-1">
                  <DrawerTitle className="text-[17px] font-bold tracking-tight">
                    {dict.reference.title}
                  </DrawerTitle>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label={dict.common.close}
                    className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[11px] bg-black/[0.05] text-neutral-500 transition-colors hover:bg-black/[0.09] dark:bg-white/[0.07] dark:text-neutral-400 dark:hover:bg-white/[0.12]"
                  >
                    <Cross1Icon className="h-[18px] w-[18px]" />
                  </button>
                </div>
              }
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="referencePanel"
          initial={{ width: 0 }}
          animate={{ width: renderedWidth }}
          exit={{ width: 0 }}
          transition={{ duration: isResizing ? 0 : 0.3 }}
          className="relative pointer-events-auto max-w-full shrink-0 overflow-hidden"
        >
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label={dict.reference.title}
            aria-valuemin={REFERENCE_MIN_WIDTH}
            aria-valuemax={REFERENCE_MAX_WIDTH}
            aria-valuenow={Math.round(width)}
            onPointerDown={onResizeDown}
            onDoubleClick={() => setWidth(REFERENCE_DEFAULT_WIDTH)}
            className="group/resize absolute inset-y-2 end-0 z-30 flex w-2 cursor-col-resize select-none justify-center"
          >
            <div
              className={cn(
                "h-full w-1 rounded-full transition-colors",
                isResizing
                  ? "bg-blue-600 dark:bg-blue-500"
                  : "bg-transparent group-hover/resize:bg-blue-500 dark:group-hover/resize:bg-blue-400",
              )}
            />
          </div>

          <motion.div
            className="absolute inset-y-2 start-0"
            initial={{ transform: `translateX(${slideDirection})` }}
            animate={{ transform: "translateX(0)" }}
            exit={{ transform: `translateX(${slideDirection})` }}
            style={{ width: renderedWidth }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex h-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
              <ReferencePanelContent
                className="min-h-0 flex-1 p-3"
                header={
                  <div className="flex shrink-0 items-center justify-between">
                    <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {dict.reference.title}
                    </h2>
                    <IconButton
                      label={dict.common.close}
                      onClick={() => setOpen(false)}
                    >
                      <Cross1Icon className="m-1 h-4 w-4" />
                    </IconButton>
                  </div>
                }
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(ReferencePanel);
