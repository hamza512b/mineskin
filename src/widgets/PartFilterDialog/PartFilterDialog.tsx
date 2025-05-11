import { FormValues } from "@/hooks/useRendererState";
import * as Dialog from "@radix-ui/react-dialog";
import React from "react";
import { PartButton } from "./PartButton";

type PartFilterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseheadVisible: boolean;
  basebodyVisible: boolean;
  baseleftArmVisible: boolean;
  baserightArmVisible: boolean;
  baseleftLegVisible: boolean;
  baserightLegVisible: boolean;
  overlayheadVisible: boolean;
  overlaybodyVisible: boolean;
  overlayleftArmVisible: boolean;
  overlayrightArmVisible: boolean;
  overlayleftLegVisible: boolean;
  overlayrightLegVisible: boolean;
  setValues: (
    key: keyof FormValues,
    value: FormValues[keyof FormValues],
  ) => void;
};

export const PartFilterDialog: React.FC<PartFilterDialogProps> = ({
  open,
  baseheadVisible,
  basebodyVisible,
  baseleftArmVisible,
  baserightArmVisible,
  baseleftLegVisible,
  baserightLegVisible,
  overlayheadVisible,
  overlaybodyVisible,
  overlayleftArmVisible,
  overlayrightArmVisible,
  overlayleftLegVisible,
  overlayrightLegVisible,
  setValues,
  onOpenChange,
}) => {
  const scale = 6;
  const headWidth = 8 * scale;
  const headHeight = 8 * scale;
  const bodyWidth = 8 * scale;
  const bodyHeight = 12 * scale;
  const armWidth = 4 * scale;
  const armHeight = 12 * scale;
  const legWidth = 4 * scale;
  const legHeight = 12 * scale;
  const containerWidth = armWidth + bodyWidth + armWidth; // e.g. 4+8+4 = 16*scale
  const containerHeight = headHeight + bodyHeight + legHeight; // (8+12+12)*scale

  const toggleVisibility = (
    layer: "base" | "overlay",
    part: "head" | "body" | "leftArm" | "rightArm" | "leftLeg" | "rightLeg",
  ) => {
    if (layer === "base") {
      if (part === "head") {
        setValues(`baseheadVisible`, !baseheadVisible);
      }
      if (part === "body") {
        setValues(`basebodyVisible`, !basebodyVisible);
      }
      if (part === "leftArm") {
        setValues(`baseleftArmVisible`, !baseleftArmVisible);
      }
      if (part === "rightArm") {
        setValues(`baserightArmVisible`, !baserightArmVisible);
      }
      if (part === "leftLeg") {
        setValues(`baseleftLegVisible`, !baseleftLegVisible);
      }
      if (part === "rightLeg") {
        setValues(`baserightLegVisible`, !baserightLegVisible);
      }
    }
    if (layer === "overlay") {
      if (part === "head") {
        setValues(`overlayheadVisible`, !overlayheadVisible);
      }
      if (part === "body") {
        setValues(`overlaybodyVisible`, !overlaybodyVisible);
      }
      if (part === "leftArm") {
        setValues(`overlayleftArmVisible`, !overlayleftArmVisible);
      }
      if (part === "rightArm") {
        setValues(`overlayrightArmVisible`, !overlayrightArmVisible);
      }
      if (part === "leftLeg") {
        setValues(`overlayleftLegVisible`, !overlayleftLegVisible);
      }
      if (part === "rightLeg") {
        setValues(`overlayrightLegVisible`, !overlayrightLegVisible);
      }
    }
  };

  // Conventional tooltip texts for each part.
  const tooltips = {
    head: "Head",
    body: "Torso",
    leftArm: "Left Arm",
    rightArm: "Right Arm",
    leftLeg: "Left Leg",
    rightLeg: "Right Leg",
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 dark:bg-black/50 bg-white/50" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[700px] dark:bg-slate-900 bg-slate-100 rounded-lg p-8 border dark:border-slate-700 border-slate-200 shadow-lg overflow-y-auto max-h-dvh"
          aria-describedby="dialog-description"
        >
          <Dialog.Title className="text-2xl font-semibold mb-6 dark:text-slate-100 text-slate-900">
            Visibility Settings
          </Dialog.Title>
          <div id="dialog-description" className="sr-only">
            Configure visibility settings for different parts of the skin model.
          </div>
          <div className="flex flex-col md:flex-row justify-around gap-8 max-w-lg mx-auto">
            {/* Base Layer Panel */}
            <div>
              <h3 className="text-xl font-medium mb-4 text-center dark:text-slate-100 text-slate-900">
                First Layer
              </h3>
              <div
                className="relative mx-auto"
                style={{
                  width: containerWidth,
                  height: containerHeight,
                }}
              >
                {/* Head – top center */}
                <PartButton
                  label="Head"
                  tooltip={tooltips.head}
                  isActive={baseheadVisible}
                  onClick={() => toggleVisibility("base", "head")}
                  width={headWidth}
                  height={headHeight}
                  style={{
                    top: 0,
                    left: (containerWidth - headWidth) / 2,
                  }}
                />
                {/* Body – below head */}
                <PartButton
                  label="Body"
                  tooltip={tooltips.body}
                  isActive={basebodyVisible}
                  onClick={() => toggleVisibility("base", "body")}
                  width={bodyWidth}
                  height={bodyHeight}
                  style={{
                    top: headHeight,
                    left: (containerWidth - bodyWidth) / 2,
                  }}
                />
                {/* Left Arm – left side (maps to rightArm) */}
                <PartButton
                  label="Left Arm"
                  tooltip={tooltips.rightArm}
                  isActive={baseleftArmVisible}
                  onClick={() => toggleVisibility("base", "leftArm")}
                  width={armWidth}
                  height={armHeight}
                  style={{
                    top: headHeight,
                    left: 0,
                  }}
                />
                {/* Right Arm – right side (maps to leftArm) */}
                <PartButton
                  label="Right Arm"
                  tooltip={tooltips.leftArm}
                  isActive={baserightArmVisible}
                  onClick={() => toggleVisibility("base", "rightArm")}
                  width={armWidth}
                  height={armHeight}
                  style={{
                    top: headHeight,
                    left: containerWidth - armWidth,
                  }}
                />
                {/* Left Leg – below body, aligned right */}
                <PartButton
                  label="Left Leg"
                  tooltip={tooltips.rightLeg}
                  isActive={baseleftLegVisible}
                  onClick={() => toggleVisibility("base", "leftLeg")}
                  width={legWidth}
                  height={legHeight}
                  style={{
                    top: headHeight + bodyHeight,
                    left: (containerWidth - bodyWidth) / 2,
                  }}
                />
                {/* Right Leg – below body, aligned left */}
                <PartButton
                  label="Right Leg"
                  tooltip={tooltips.leftLeg}
                  isActive={baserightLegVisible}
                  onClick={() => toggleVisibility("base", "rightLeg")}
                  width={legWidth}
                  height={legHeight}
                  style={{
                    top: headHeight + bodyHeight,
                    left:
                      (containerWidth - bodyWidth) / 2 + bodyWidth - legWidth,
                  }}
                />
              </div>
            </div>
            {/* Overlay Layer Panel */}
            <div>
              <h3 className="text-xl font-medium mb-4 text-center dark:text-slate-100 text-slate-900">
                Second Layer
              </h3>
              <div
                className="relative mx-auto"
                style={{
                  width: containerWidth,
                  height: containerHeight,
                }}
              >
                {/* Head */}
                <PartButton
                  label="Head"
                  tooltip={tooltips.head}
                  isActive={overlayheadVisible}
                  onClick={() => toggleVisibility("overlay", "head")}
                  width={headWidth}
                  height={headHeight}
                  style={{
                    top: 0,
                    left: (containerWidth - headWidth) / 2,
                  }}
                />
                {/* Body */}
                <PartButton
                  label="Body"
                  tooltip={tooltips.body}
                  isActive={overlaybodyVisible}
                  onClick={() => toggleVisibility("overlay", "body")}
                  width={bodyWidth}
                  height={bodyHeight}
                  style={{
                    top: headHeight,
                    left: (containerWidth - bodyWidth) / 2,
                  }}
                />
                {/* Left Arm */}
                <PartButton
                  label="Left Arm"
                  tooltip={tooltips.leftArm}
                  isActive={overlayleftArmVisible}
                  onClick={() => toggleVisibility("overlay", "leftArm")}
                  width={armWidth}
                  height={armHeight}
                  style={{
                    top: headHeight,
                    left: 0,
                  }}
                />
                {/* Right Arm */}
                <PartButton
                  label="Right Arm"
                  tooltip={tooltips.rightArm}
                  isActive={overlayrightArmVisible}
                  onClick={() => toggleVisibility("overlay", "rightArm")}
                  width={armWidth}
                  height={armHeight}
                  style={{
                    top: headHeight,
                    left: containerWidth - armWidth,
                  }}
                />
                {/* Left Leg */}
                <PartButton
                  label="Left Leg"
                  tooltip={tooltips.leftLeg}
                  isActive={overlayleftLegVisible}
                  onClick={() => toggleVisibility("overlay", "leftLeg")}
                  width={legWidth}
                  height={legHeight}
                  style={{
                    top: headHeight + bodyHeight,
                    left: (containerWidth - bodyWidth) / 2,
                  }}
                />
                {/* Right Leg */}
                <PartButton
                  label="Right Leg"
                  tooltip={tooltips.rightLeg}
                  isActive={overlayrightLegVisible}
                  onClick={() => toggleVisibility("overlay", "rightLeg")}
                  width={legWidth}
                  height={legHeight}
                  style={{
                    top: headHeight + bodyHeight,
                    left:
                      (containerWidth - bodyWidth) / 2 + bodyWidth - legWidth,
                  }}
                />
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Dialog.Close asChild>
              <button
                className=" dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-slate-100 py-2 rounded-md font-medium transition-colors px-4 cursor-pointer hover:bg-blue-200 text-slate-900 bg-blue-100"
                autoFocus
              >
                Close
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
