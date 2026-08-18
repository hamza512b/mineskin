import * as Popover from "@radix-ui/react-popover";
import * as Tooltip from "@radix-ui/react-tooltip";
import { ReloadIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useRendererStore } from "@/store";
import { isEnvironmentTransformLocked } from "@/core/environment";
import type { PoseTool } from "@/store/types";
import { useDictionary } from "@/i18n";
import useIsTouch from "@/hooks/useIsTouch";
import { Close, PoseIcon } from "@/components/Icons/Icons";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import ToolButton from "./ToolButton";

/** Four-way arrows: the limb's end slides along whichever axis arrow is dragged. */
const MoveToolIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 3v18M3 12h18" />
    <path d="M12 3 9.5 5.5M12 3l2.5 2.5M12 21l-2.5-2.5M12 21l2.5-2.5" />
    <path d="m3 12 2.5-2.5M3 12l2.5 2.5M21 12l-2.5-2.5M21 12l-2.5 2.5" />
  </svg>
);

/** An arrow curling around a shaft: the limb turns about whichever ring is dragged. */
const TwistToolIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 4v16" strokeDasharray="2.6 2.6" />
    <path d="M6.5 8.5c1.6-1.5 3.6-2.3 5.5-2.3s3.9.8 5.5 2.3" />
    <path d="M14.6 5.4 17.5 8.5l-3.1 1.7" />
    <path d="M17.5 15.5c-1.6 1.5-3.6 2.3-5.5 2.3s-3.9-.8-5.5-2.3" />
    <path d="M9.4 18.6 6.5 15.5l3.1-1.7" />
  </svg>
);

const POSE_TOOLS: {
  tool: PoseTool;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  labelKey: "poseMove" | "poseTwist";
}[] = [
  { tool: "move", icon: MoveToolIcon, labelKey: "poseMove" },
  { tool: "twist", icon: TwistToolIcon, labelKey: "poseTwist" },
];

/**
 * The gesture hint for whichever tool is active. Mouse and touch get different
 * text because picking a limb genuinely differs: a mouse can click the limb
 * itself, while a finger has to find its handle — a fingertip covers too much
 * of the model to say which part was meant.
 */
function useToolHint(tool: PoseTool, isTouch: boolean): string {
  const { dictionary: dict } = useDictionary();
  if (tool === "twist") {
    return isTouch
      ? dict.toolbar.poseTwistHintTouch
      : dict.toolbar.poseTwistHint;
  }
  return isTouch ? dict.toolbar.poseModeHintTouch : dict.toolbar.poseModeHint;
}

/**
 * What the pose tools have changed away from default, split the way the resets
 * are: the joints are a pose, while the torso handle drives the model's own
 * move/turn — the same numbers the sidebar sliders hold. They reset separately
 * because clearing a pose must not silently undo positioning the user dialled
 * in outside pose mode.
 *
 * A locked environment pins the model and the renderer ignores the move offsets
 * entirely, so a stored one doesn't count as dirty: resetting it would clear a
 * number nothing on screen is using.
 */
function usePoseDirty(): { hasPose: boolean; hasTransform: boolean } {
  const hasPose = useRendererStore((s) => Object.keys(s.pose).length > 0);
  const moveLocked = useRendererStore((s) =>
    isEnvironmentTransformLocked(s.environmentPreset),
  );
  const moved = useRendererStore(
    (s) =>
      s.objectTranslationX !== 0 ||
      s.objectTranslationY !== 0 ||
      s.objectTranslationZ !== 0,
  );
  // Every axis the model can be turned on, not just the one the twist drag
  // writes: tilt and roll are the same sidebar sliders, and a button that left
  // them set would put the model back "upright" still leaning.
  const turned = useRendererStore(
    (s) =>
      s.objectRotationX !== 0 ||
      s.objectRotationY !== 0 ||
      s.objectRotationZ !== 0,
  );

  return { hasPose, hasTransform: (!moveLocked && moved) || turned };
}

/** One of the panel's reset rows. Disabled when there is nothing to put back. */
const ResetButton: React.FC<{
  label: string;
  enabled: boolean;
  touch: boolean;
  onClick?: () => void;
}> = ({ label, enabled, touch, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!enabled}
    className={cn(
      "flex w-full items-center justify-center gap-2 border font-medium transition-colors duration-150",
      touch
        ? "h-[50px] rounded-[14px] text-[13px]"
        : "rounded-md px-2.5 py-2 text-[13px]",
      enabled
        ? "cursor-pointer border-neutral-200 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-300 dark:hover:bg-neutral-700"
        : "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400 opacity-60 dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-500",
    )}
  >
    <ReloadIcon className={touch ? "h-[17px] w-[17px]" : "h-4 w-4"} />
    {label}
  </button>
);

/**
 * Tool picker + resets, shared by the desktop popover and the touch sheet.
 * `touch` only scales it up for fingers; the controls are the same either way.
 */
const PosePanel: React.FC<{
  touch?: boolean;
  onResetPose?: () => void;
  onResetTransform?: () => void;
}> = ({ touch = false, onResetPose, onResetTransform }) => {
  const { dictionary: dict } = useDictionary();
  const poseTool = useRendererStore((s) => s.poseTool);
  const { hasPose, hasTransform } = usePoseDirty();
  const setValue = useRendererStore((s) => s.setValue);

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-2",
          touch
            ? "gap-[9px]"
            : "gap-1.5 rounded-lg bg-neutral-100 p-1.5 dark:bg-neutral-900/50",
        )}
      >
        {POSE_TOOLS.map(({ tool, icon: Icon, labelKey }) => {
          const isActive = poseTool === tool;
          return (
            <button
              key={tool}
              type="button"
              onClick={() => setValue("poseTool", tool)}
              aria-pressed={isActive}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center transition-colors duration-150",
                touch
                  ? "gap-[7px] rounded-2xl pb-[11px] pt-[14px]"
                  : "gap-1.5 rounded-md px-1 py-2.5",
                isActive
                  ? "bg-blue-500 text-white shadow-md dark:bg-blue-600"
                  : touch
                    ? "bg-black/[0.04] text-neutral-600 dark:bg-white/[0.05] dark:text-neutral-400"
                    : "text-neutral-600 dark:text-neutral-300",
              )}
            >
              <Icon className={touch ? "h-[23px] w-[23px]" : "h-5 w-5"} />
              <span
                className={cn(
                  "text-center leading-none",
                  touch
                    ? "text-[11.5px] font-semibold tracking-tight"
                    : "text-[11px] font-medium leading-tight",
                )}
              >
                {dict.toolbar[labelKey]}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className={cn(
          "flex flex-col",
          touch ? "mt-[18px] gap-[9px]" : "mt-3 gap-1.5",
        )}
      >
        <ResetButton
          label={dict.toolbar.resetPose}
          enabled={hasPose}
          touch={touch}
          onClick={onResetPose}
        />
        <ResetButton
          label={dict.toolbar.resetPosition}
          enabled={hasTransform}
          touch={touch}
          onClick={onResetTransform}
        />
      </div>
    </>
  );
};

interface PoseFlyoutProps {
  side: "left" | "right";
  tooltipSide: "left" | "right";
  /** Clears every posed joint back to rest. */
  onResetPose?: () => void;
  /** Puts the whole model back at the origin, facing forward. */
  onResetTransform?: () => void;
}

/**
 * Grouped pose slot: one rail button that arms limb posing and reveals its two
 * tools plus the reset. Desktop gets a side popover anchored to the rail, touch
 * gets a bottom sheet — both non-modal, because the whole point is to keep
 * dragging limbs on the canvas while the panel is up.
 */
const PoseFlyout: React.FC<PoseFlyoutProps> = ({
  side,
  tooltipSide,
  onResetPose,
  onResetTransform,
}) => {
  const { dictionary: dict } = useDictionary();
  const poseMode = useRendererStore((s) => s.poseMode);
  const poseTool = useRendererStore((s) => s.poseTool);
  // A pose and a moved model both survive leaving pose mode and reload with the
  // config, so the rail marks either: otherwise a limb the user posed days ago
  // — or a skin they nudged off centre — looks like the default.
  const { hasPose, hasTransform } = usePoseDirty();
  const dirty = hasPose || hasTransform;
  const setValue = useRendererStore((s) => s.setValue);
  const isTouch = useIsTouch();
  const [open, setOpen] = useState(false);
  const hint = useToolHint(poseTool, isTouch);

  // The rail button stays an on/off tool: pressing it arms posing and shows the
  // panel, and pressing it again while the panel is up disarms it. Pressing it
  // with the panel dismissed just brings the panel back, so closing the panel
  // never strands the user in a mode they can't see.
  const onTriggerClick = () => {
    if (!poseMode) setValue("poseMode", true);
    else if (open) setValue("poseMode", false);
  };

  // --- Mobile: bottom sheet -------------------------------------------------
  if (isTouch) {
    return (
      <Drawer
        open={open}
        onOpenChange={setOpen}
        // Non-modal so the model stays draggable behind the sheet — posing is
        // the thing the sheet exists to configure.
        modal={false}
      >
        <DrawerTrigger asChild>
          <ToolButton
            label={dict.toolbar.poseMode}
            active={poseMode}
            grouped
            badge={dirty}
            onClick={onTriggerClick}
          >
            <PoseIcon className="h-full w-full" />
          </ToolButton>
        </DrawerTrigger>
        <DrawerContent
          className="mx-auto max-w-md select-none"
          style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none" }}
        >
          <div
            className="touch-none px-[18px] pt-3"
            style={{
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)",
            }}
          >
            <div className="mb-[15px] flex items-center justify-between px-1">
              <DrawerTitle className="text-[17px] font-bold tracking-tight">
                {dict.toolbar.poseMode}
              </DrawerTitle>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={dict.common?.close ?? "Close"}
                className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[11px] bg-black/[0.05] text-neutral-500 transition-colors hover:bg-black/[0.09] dark:bg-white/[0.07] dark:text-neutral-400 dark:hover:bg-white/[0.12]"
              >
                <Close className="h-[18px] w-[18px]" />
              </button>
            </div>
            <PosePanel
              touch
              onResetPose={onResetPose}
              onResetTransform={onResetTransform}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // --- Desktop: side popover ------------------------------------------------
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Popover.Trigger asChild>
              <ToolButton
                label={dict.toolbar.poseMode}
                active={poseMode}
                grouped
                badge={dirty}
                onClick={onTriggerClick}
              >
                <PoseIcon className="h-full w-full" />
              </ToolButton>
            </Popover.Trigger>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="z-50 rounded-md bg-neutral-900 px-2 py-1 text-sm text-white shadow-md dark:bg-neutral-700"
              side={tooltipSide}
              sideOffset={8}
              hidden={open}
            >
              <span className="block max-w-52">
                {poseMode ? hint : dict.toolbar.poseMode}
              </span>
              <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-700" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>

      <AnimatePresence>
        {open && (
          <Popover.Portal forceMount>
            <Popover.Content
              side={side}
              align="start"
              sideOffset={12}
              collisionPadding={12}
              // Posing happens on the canvas, so a press there must not close
              // the panel the user is posing from. Presses anywhere else still
              // dismiss it, the way every other popover in the rail behaves.
              onPointerDownOutside={(e) => {
                if ((e.target as HTMLElement | null)?.tagName === "CANVAS") {
                  e.preventDefault();
                }
              }}
              asChild
            >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.94,
                  x: side === "right" ? -8 : 8,
                }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.94, x: side === "right" ? -8 : 8 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "z-50 w-70 max-w-[calc(100vw-1.5rem)] origin-left select-none rounded-lg p-3",
                  "border border-neutral-300 bg-neutral-50 shadow-lg",
                  "dark:border-neutral-700 dark:bg-neutral-800 dark:shadow-2xl",
                )}
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-white">
                    {dict.toolbar.poseMode}
                  </h3>
                  <Popover.Close
                    aria-label={dict.common?.close ?? "Close"}
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                  >
                    <Close className="h-4 w-4" />
                  </Popover.Close>
                </div>

                <PosePanel
                  onResetPose={onResetPose}
                  onResetTransform={onResetTransform}
                />
              </motion.div>
            </Popover.Content>
          </Popover.Portal>
        )}
      </AnimatePresence>
    </Popover.Root>
  );
};

export default PoseFlyout;
