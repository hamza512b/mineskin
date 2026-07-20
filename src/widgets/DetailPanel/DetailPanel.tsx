import IconButton from "@/components/IconButton/IconButton";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useDictionary } from "@/i18n";
import { cn } from "@/lib/utils";
import { Cross1Icon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import useIsTouch from "../../hooks/useIsTouch";
import useMediaQuery from "../../hooks/useMediaQuery";
import { DetailPanelContent, DetailPanelProps } from "./DetailPanelContent";
import Button from "@/components/Button";

// Desktop settings panel width bounds (px). Like the AI chat panel, settings
// docks as a resizable workspace column; the choice is persisted so it survives
// reloads.
const DETAIL_MIN_WIDTH = 280;
const DETAIL_MAX_WIDTH = 560;
const DETAIL_DEFAULT_WIDTH = 320;
const DETAIL_WIDTH_KEY = "detail-panel-width";
const DETAIL_VIEWPORT_MARGIN = 16;
const clampDetailWidth = (w: number) =>
  Math.min(DETAIL_MAX_WIDTH, Math.max(DETAIL_MIN_WIDTH, w));

const DetailPanel: React.FC<DetailPanelProps> = ({
  open,
  setOpen,
  reset,
  mode,
  handlePocketSwitch,
  handleResolutionSwitch,
  handleFlipFrontToBack,
}) => {
  const isCoarse = useIsTouch();
  // Small viewports get the drawer too — the docked settings column is too
  // cramped below the mobile breakpoint even on non-touch (e.g. a narrow
  // desktop window).
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const useDrawer = isCoarse || isSmallScreen;
  const { dictionary: dict, locale } = useDictionary();
  const isRtl = locale === "ar";
  const slideDirection = isRtl ? "-100%" : "100%";

  // Desktop width is user-resizable via the drag handle on the panel's start
  // (canvas-facing) edge; the choice is persisted so it survives reloads.
  const [width, setWidth] = useState(() => {
    if (typeof window === "undefined") return DETAIL_DEFAULT_WIDTH;
    const saved = Number(localStorage.getItem(DETAIL_WIDTH_KEY));
    return saved ? clampDetailWidth(saved) : DETAIL_DEFAULT_WIDTH;
  });
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? DETAIL_DEFAULT_WIDTH : window.innerWidth,
  );
  const [isResizing, setIsResizing] = useState(false);
  const renderedWidth = useMemo(
    () => Math.min(width, Math.max(0, viewportWidth - DETAIL_VIEWPORT_MARGIN)),
    [viewportWidth, width],
  );

  useEffect(() => {
    const syncViewportWidth = () => setViewportWidth(window.innerWidth);
    syncViewportWidth();
    window.addEventListener("resize", syncViewportWidth);
    return () => window.removeEventListener("resize", syncViewportWidth);
  }, []);

  // Drag-to-resize. The handle sits on the panel's start (canvas-facing) edge;
  // since the panel is docked to the end edge, dragging that handle toward the
  // canvas grows it — the sign flips under RTL. Width animation is suppressed
  // while dragging so it tracks the pointer 1:1.
  const onResizeDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startW = width;
      const sign = isRtl ? 1 : -1;
      let finalW = startW;
      setIsResizing(true);
      const move = (ev: PointerEvent) => {
        finalW = clampDetailWidth(startW + sign * (ev.clientX - startX));
        setWidth(finalW);
      };
      const up = () => {
        setIsResizing(false);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        try {
          localStorage.setItem(DETAIL_WIDTH_KEY, String(finalW));
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

  if (useDrawer) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[85vh] safe-area-pb safe-area-pl safe-area-pr bg-neutral-50 dark:bg-neutral-800">
          <DrawerHeader className="flex flex-row justify-between items-center">
            <DrawerTitle className="text-xl md:text-lg">
              {dict.common.settings}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button className="ms-auto" variant={"secondary"}>
                <Cross1Icon className="w-4 h-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          <DrawerBody className="p-4 pt-0">
            <DetailPanelContent
              open={open}
              setOpen={setOpen}
              reset={reset}
              mode={mode}
              handlePocketSwitch={handlePocketSwitch}
              handleResolutionSwitch={handleResolutionSwitch}
              handleFlipFrontToBack={handleFlipFrontToBack}
              hideHeader
              className="p-0 border-none  >:!shadow-none bg-transparent"
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="controlPanel"
          initial={{ width: 0 }}
          animate={{ width: renderedWidth }}
          exit={{ width: 0 }}
          transition={{ duration: isResizing ? 0 : 0.3 }}
          className="relative pointer-events-auto max-w-full shrink-0 overflow-hidden"
        >
          {/* Resize handle on the canvas-facing (start) edge — a thin bar that
              lights up on hover or while dragging. Double-click resets. */}
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label={dict.common.settings}
            aria-valuemin={DETAIL_MIN_WIDTH}
            aria-valuemax={DETAIL_MAX_WIDTH}
            aria-valuenow={Math.round(width)}
            onPointerDown={onResizeDown}
            onDoubleClick={() => setWidth(DETAIL_DEFAULT_WIDTH)}
            title="Drag to resize · double-click to reset"
            className="group/resize absolute inset-y-2 start-0 z-30 flex w-2 cursor-col-resize select-none justify-center"
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
            className="absolute inset-y-2 end-0"
            initial={{ transform: `translateX(${slideDirection})` }}
            animate={{ transform: "translateX(0)" }}
            exit={{ transform: `translateX(${slideDirection})` }}
            style={{ width: renderedWidth }}
            transition={{ duration: 0.3 }}
          >
            <DetailPanelContent
              open={open}
              setOpen={setOpen}
              reset={reset}
              handlePocketSwitch={handlePocketSwitch}
              handleResolutionSwitch={handleResolutionSwitch}
              handleFlipFrontToBack={handleFlipFrontToBack}
              exitButton={
                <IconButton
                  label={dict.common.close}
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 rtl:right-auto rtl:left-4"
                >
                  <Cross1Icon className="w-4 h-4 m-1" />
                </IconButton>
              }
              mode={mode}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(DetailPanel);
