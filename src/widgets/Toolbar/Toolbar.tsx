import animations from "@/core/animations";
import { useRendererStore } from "@/store";
import { useDictionary } from "@/i18n";
import { ReloadIcon } from "@radix-ui/react-icons";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Tooltip from "@radix-ui/react-tooltip";
import clsx from "clsx";
import React, { useCallback, useEffect, useState } from "react";
import ColorPicker from "../../components/ColorPicker/ColorPicker";
import Dropdown, { DropdownItem } from "../../components/Dropdown";
import {
  AnimationIcon,
  ColorPickerIcon,
  CursorFollowIcon,
  GearIcon,
  GridIcon,
  PartsFilterIcon,
  RecordIcon,
  ScreenshotIcon,
  TouchDrawIcon,
  TouchViewIcon,
} from "../../components/Icons/Icons";
import useIsTouch from "@/hooks/useIsTouch";
import { PartFilterDialog } from "../PartFilterDialog/PartFilterDialog";
import ToolButton from "./ToolButton";
import BrushFlyout, { SymmetryIcon } from "./BrushFlyout";
import BrushIntroHint from "./BrushIntroHint";

const isMac =
  typeof window !== "undefined" &&
  window.navigator.userAgent.includes("Macintosh");
const cmdKey = isMac ? "⌘" : "Ctrl";

const RailDivider = () => (
  <div className="mx-auto my-1.5 h-px w-7 rounded-full bg-neutral-200 dark:bg-neutral-700" />
);

// Reusable tooltip wrapper to keep the rail markup tidy. Module-scope on
// purpose: defined inside Toolbar it would get a new identity every render,
// making React remount every Hint-wrapped button (closing open tooltips and
// dropping focus/press state).
const Hint: React.FC<
  React.PropsWithChildren<{ text: React.ReactNode; side: "left" | "right" }>
> = ({ text, side, children }) => (
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <div>{children}</div>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="z-50 rounded-md bg-neutral-900 px-2 py-1 text-sm text-white shadow-lg dark:bg-neutral-700"
          side={side}
          sideOffset={8}
        >
          {text}
          <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-700" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);

interface FloatingToolbarProps {
  redo: (() => void) | undefined;
  undo: (() => void) | undefined;
  redoCount: number;
  undoCount: number;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  getUniqueColors: () => string[];

  // Animation props (only used in Preview mode)
  availableAnimations?: {
    name: string;
    label: string;
  }[];
  currentAnimation?: string | null;
  onAnimationSelect?: (animation: string | null) => void;
  lookAtCursor?: boolean;
  onToggleLookAtCursor?: () => void;
  onScreenshot?: () => void;
  onRecord?: () => void;
  recording?: boolean;
  mode: "Editing" | "Preview";
}

const Toolbar: React.FC<FloatingToolbarProps> = ({
  redo,
  undo,
  redoCount,
  undoCount,
  settingsOpen,
  setSettingsOpen,
  getUniqueColors,
  currentAnimation = null,
  onAnimationSelect,
  lookAtCursor = false,
  onToggleLookAtCursor,
  onScreenshot,
  onRecord,
  recording = false,
  mode,
}) => {
  const { dictionary: dict, locale } = useDictionary();
  const isRtl = locale === "ar";
  const tooltipSide = isRtl ? "left" : "right";
  const flyoutSide = isRtl ? "left" : "right";
  const colorPickerActive = useRendererStore(
    (state) => state.colorPickerActive,
  );
  const gridVisible = useRendererStore((state) => state.gridVisible);
  const mirrorPaint = useRendererStore((state) => state.mirrorPaint);
  const touchDrawMode = useRendererStore((state) => state.touchDrawMode);
  const setValue = useRendererStore((state) => state.setValue);
  const isTouch = useIsTouch();

  const setColorPickerActive = useCallback(
    (active: boolean) => {
      setValue("colorPickerActive", active);
    },
    [setValue],
  );

  const toggleGrid = useCallback(() => {
    setValue("gridVisible", !gridVisible);
  }, [setValue, gridVisible]);

  const toggleTouchDrawMode = useCallback(() => {
    setValue("touchDrawMode", !touchDrawMode);
  }, [setValue, touchDrawMode]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (dialogOpen && settingsOpen) {
      setSettingsOpen(false);
    }
  }, [dialogOpen, settingsOpen, setSettingsOpen]);

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="pointer-events-auto absolute left-0 top-0 ml-3 mt-3 transform select-none rounded-lg border border-neutral-300 bg-neutral-50 shadow-lg rtl:left-auto rtl:right-0 rtl:ml-0 rtl:mr-3 dark:border-neutral-700 dark:bg-neutral-800 dark:shadow-none"
    >
      <ScrollArea.Root
        type="auto"
        className="overflow-hidden rounded-[inherit]"
      >
        <ScrollArea.Viewport className="max-h-[calc(100dvh-90px-env(safe-area-inset-bottom,0px)-max(env(safe-area-inset-top,0px),var(--app-banner-height,0px)))] w-full">
          <div className="flex flex-col items-center gap-1 p-2">
            {mode === "Editing" && (
              <>
                <div
                  className="flex flex-col items-center gap-1.5"
                  data-tutorial-id="color-picker-tools"
                >
                  <div className="flex h-8 w-8 items-center justify-center">
                    <ColorPicker
                      label={dict.toolbar.colorPicker}
                      id="color-picker"
                      getUniqueColors={getUniqueColors}
                    />
                  </div>

                  <Hint
                    side={tooltipSide}
                    text={
                      <>
                        {dict.toolbar.colorPicker}{" "}
                        <span className="text-neutral-400">(I)</span>
                      </>
                    }
                  >
                    <ToolButton
                      label={dict.toolbar.colorPicker}
                      onClick={() => setColorPickerActive(!colorPickerActive)}
                      active={colorPickerActive}
                    >
                      <ColorPickerIcon className="h-full w-full" />
                    </ToolButton>
                  </Hint>
                </div>

                <RailDivider />

                <div
                  className="flex flex-col items-center gap-1"
                  data-tutorial-id="pen-tool"
                >
                  <BrushIntroHint side={flyoutSide}>
                    <BrushFlyout
                      side={flyoutSide}
                      tooltipSide={tooltipSide}
                      getUniqueColors={getUniqueColors}
                    />
                  </BrushIntroHint>

                  {/* Quick-disable for symmetry — only surfaces while it's on,
                      so users can flip it off without opening the brush flyout. */}
                  {mirrorPaint && (
                    <Hint
                      side={tooltipSide}
                      text={dict.toolbar.disableSymmetry}
                    >
                      <ToolButton
                        label={dict.toolbar.disableSymmetry}
                        onClick={() => setValue("mirrorPaint", false)}
                        active
                      >
                        <SymmetryIcon className="h-full w-full" />
                      </ToolButton>
                    </Hint>
                  )}
                </div>

                <RailDivider />

                <div
                  className="flex flex-col items-center gap-1"
                  data-tutorial-id="undo-redo-tools"
                >
                  <Hint
                    side={tooltipSide}
                    text={
                      <>
                        {dict.toolbar.undo}{" "}
                        <span className="text-neutral-400">({cmdKey}+Z)</span>
                      </>
                    }
                  >
                    <ToolButton
                      label={dict.toolbar.undo}
                      onClick={undo || (() => {})}
                      disabled={undoCount === 0 && !!undo}
                    >
                      <ReloadIcon className="h-full w-full -scale-x-100" />
                    </ToolButton>
                  </Hint>

                  <Hint
                    side={tooltipSide}
                    text={
                      <>
                        {dict.toolbar.redo}{" "}
                        <span className="text-neutral-400">
                          ({cmdKey}+Shift+Z)
                        </span>
                      </>
                    }
                  >
                    <ToolButton
                      label={dict.toolbar.redo}
                      onClick={redo || (() => {})}
                      disabled={redoCount === 0 && !!redo}
                    >
                      <ReloadIcon className="h-full w-full" />
                    </ToolButton>
                  </Hint>
                </div>

                <RailDivider />
              </>
            )}

            <div className="flex flex-col items-center gap-1">
              {mode === "Preview" && onAnimationSelect && (
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Dropdown
                      trigger={
                        <Tooltip.Trigger asChild>
                          <ToolButton
                            active={currentAnimation !== null}
                            label={dict.toolbar.animations}
                          >
                            <AnimationIcon className="h-full w-full" />
                          </ToolButton>
                        </Tooltip.Trigger>
                      }
                      align="start"
                      side={tooltipSide}
                    >
                      <DropdownItem
                        onClick={() => onAnimationSelect(null)}
                        className={
                          currentAnimation === null
                            ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                            : ""
                        }
                      >
                        {dict.toolbar.noAnimation}
                      </DropdownItem>
                      {animations.map((animation) => {
                        const labelKey =
                          `${animation.name}Animation` as keyof typeof dict.toolbar;
                        const label = dict.toolbar[labelKey] || animation.label;
                        return (
                          <DropdownItem
                            key={animation.name}
                            onClick={() => onAnimationSelect(animation.name)}
                            className={clsx(
                              currentAnimation === animation.name
                                ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                                : "",
                              "capitalize",
                            )}
                          >
                            {label}
                          </DropdownItem>
                        );
                      })}
                    </Dropdown>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="z-50 rounded-md bg-neutral-900 px-2 py-1 text-sm text-white shadow-lg dark:bg-neutral-700"
                        side={tooltipSide}
                        sideOffset={8}
                      >
                        {dict.toolbar.animations}
                        <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-700" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              )}

              {mode === "Preview" && !isTouch && onToggleLookAtCursor && (
                <Hint side={tooltipSide} text={dict.toolbar.lookAtCursor}>
                  <ToolButton
                    active={lookAtCursor}
                    label={dict.toolbar.lookAtCursor}
                    onClick={onToggleLookAtCursor}
                  >
                    <CursorFollowIcon className="h-full w-full" />
                  </ToolButton>
                </Hint>
              )}

              {mode === "Preview" && onRecord && (
                <Hint side={tooltipSide} text={dict.toolbar.recordClip}>
                  <ToolButton
                    label={dict.toolbar.recordClip}
                    onClick={onRecord}
                    active={recording}
                    disabled={recording}
                  >
                    <RecordIcon className="h-full w-full" />
                  </ToolButton>
                </Hint>
              )}

              {mode === "Preview" && onScreenshot && (
                <Hint side={tooltipSide} text={dict.toolbar.screenshot}>
                  <ToolButton
                    label={dict.toolbar.screenshot}
                    onClick={onScreenshot}
                  >
                    <ScreenshotIcon className="h-full w-full" />
                  </ToolButton>
                </Hint>
              )}

              <Hint side={tooltipSide} text={dict.toolbar.partsFilter}>
                <div data-tutorial-id="mobile-part-filter">
                  <ToolButton
                    label={dict.toolbar.partsFilter}
                    onClick={() => setDialogOpen(true)}
                    active={dialogOpen}
                  >
                    <PartsFilterIcon className="h-full w-full" />
                  </ToolButton>
                </div>
              </Hint>

              {mode === "Editing" && (
                <Hint side={tooltipSide} text={dict.toolbar.grid}>
                  <ToolButton
                    label={dict.toolbar.grid}
                    onClick={() => toggleGrid()}
                    active={gridVisible}
                  >
                    <GridIcon className="h-full w-full" />
                  </ToolButton>
                </Hint>
              )}

              <RailDivider />

              {mode === "Editing" && isTouch && (
                <Hint
                  side={tooltipSide}
                  text={
                    touchDrawMode
                      ? dict.toolbar.touchDrawMode
                      : dict.toolbar.touchViewMode
                  }
                >
                  <div data-tutorial-id="touch-draw-mode">
                    <ToolButton
                      label={
                        touchDrawMode
                          ? dict.toolbar.touchDrawMode
                          : dict.toolbar.touchViewMode
                      }
                      onClick={toggleTouchDrawMode}
                      active
                    >
                      {touchDrawMode ? (
                        <TouchDrawIcon className="h-full w-full" />
                      ) : (
                        <TouchViewIcon className="h-full w-full" />
                      )}
                    </ToolButton>
                  </div>
                </Hint>
              )}

              <Hint side={tooltipSide} text={dict.common.settings}>
                <div data-tutorial-id="settings">
                  <ToolButton
                    label={dict.common.settings}
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    active={settingsOpen}
                  >
                    <GearIcon className="h-full w-full" />
                  </ToolButton>
                </div>
              </Hint>
            </div>
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="flex h-full w-2 touch-none select-none border-l border-l-transparent p-[1px] transition-colors"
          orientation="vertical"
        >
          <ScrollArea.Thumb className="relative flex-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      <PartFilterDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default React.memo(Toolbar);
