import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import useIsTouch from "@/hooks/useIsTouch";
import { useDictionary } from "@/i18n";
import { useRendererStore } from "@/store";
import * as Dialog from "@radix-ui/react-dialog";
import clsx from "clsx";
import { PartButton } from "./PartButton";

type PartFilterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const PartFilterDialog: React.FC<PartFilterDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { dictionary: dict } = useDictionary();
  // Use Zustand store with selective subscriptions
  const baseheadVisible = useRendererStore((state) => state.baseheadVisible);
  const basebodyVisible = useRendererStore((state) => state.basebodyVisible);
  const baseleftArmVisible = useRendererStore(
    (state) => state.baseleftArmVisible,
  );
  const baserightArmVisible = useRendererStore(
    (state) => state.baserightArmVisible,
  );
  const baseleftLegVisible = useRendererStore(
    (state) => state.baseleftLegVisible,
  );
  const baserightLegVisible = useRendererStore(
    (state) => state.baserightLegVisible,
  );
  const overlayheadVisible = useRendererStore(
    (state) => state.overlayheadVisible,
  );
  const overlaybodyVisible = useRendererStore(
    (state) => state.overlaybodyVisible,
  );
  const overlayleftArmVisible = useRendererStore(
    (state) => state.overlayleftArmVisible,
  );
  const overlayrightArmVisible = useRendererStore(
    (state) => state.overlayrightArmVisible,
  );
  const overlayleftLegVisible = useRendererStore(
    (state) => state.overlayleftLegVisible,
  );
  const overlayrightLegVisible = useRendererStore(
    (state) => state.overlayrightLegVisible,
  );
  const setValue = useRendererStore((state) => state.setValue);

  const isCoarse = useIsTouch();

  const scale = isCoarse ? 10 : 6;
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
        setValue(`baseheadVisible`, !baseheadVisible);
      }
      if (part === "body") {
        setValue(`basebodyVisible`, !basebodyVisible);
      }
      if (part === "leftArm") {
        setValue(`baseleftArmVisible`, !baseleftArmVisible);
      }
      if (part === "rightArm") {
        setValue(`baserightArmVisible`, !baserightArmVisible);
      }
      if (part === "leftLeg") {
        setValue(`baseleftLegVisible`, !baseleftLegVisible);
      }
      if (part === "rightLeg") {
        setValue(`baserightLegVisible`, !baserightLegVisible);
      }
    }
    if (layer === "overlay") {
      if (part === "head") {
        setValue(`overlayheadVisible`, !overlayheadVisible);
      }
      if (part === "body") {
        setValue(`overlaybodyVisible`, !overlaybodyVisible);
      }
      if (part === "leftArm") {
        setValue(`overlayleftArmVisible`, !overlayleftArmVisible);
      }
      if (part === "rightArm") {
        setValue(`overlayrightArmVisible`, !overlayrightArmVisible);
      }
      if (part === "leftLeg") {
        setValue(`overlayleftLegVisible`, !overlayleftLegVisible);
      }
      if (part === "rightLeg") {
        setValue(`overlayrightLegVisible`, !overlayrightLegVisible);
      }
    }
  };

  // Conventional tooltip texts for each part.
  const tooltips = {
    head: dict.partFilter.head,
    body: dict.partFilter.torso,
    leftArm: dict.partFilter.leftArm,
    rightArm: dict.partFilter.rightArm,
    leftLeg: dict.partFilter.leftLeg,
    rightLeg: dict.partFilter.rightLeg,
  };

  const partButtonStyle = (): React.CSSProperties => ({
    border: "1px solid #333",
    position: "absolute",
    cursor: "pointer",
    // backgroundColor: visible ? "#4A90E2" : "#555",
  });

  const bodyContent = (
    <div className="flex flex-row justify-around gap-2 sm:gap-8 max-w-lg mx-auto">
      {/* Base Layer Panel */}
      <div>
        <h3 className="text-base sm:text-xl font-medium mb-2 sm:mb-4 text-center dark:text-neutral-100 text-neutral-900">
          {dict.partFilter.firstLayer}
        </h3>
        <div
          className="relative mx-auto"
          style={{ width: containerWidth, height: containerHeight }}
        >
          {/* Head – top center */}
          <PartButton
            tooltip={tooltips.head}
            onClick={() => toggleVisibility("base", "head")}
            style={{
              top: 0,
              left: (containerWidth - headWidth) / 2,
              width: headWidth,
              height: headHeight,
              ...partButtonStyle(),
            }}
            className={clsx(
              !isCoarse &&
                (baseheadVisible
                  ? "hover:bg-[#3776bf] bg-[#4A90E2]"
                  : "hover:bg-[#666] bg-[#555]"),
              isCoarse && (baseheadVisible ? "bg-[#4A90E2]" : "bg-[#555]"),
            )}
          />
          {/* Body – below head */}
          <PartButton
            tooltip={tooltips.body}
            onClick={() => toggleVisibility("base", "body")}
            style={{
              top: headHeight,
              left: (containerWidth - bodyWidth) / 2,
              width: bodyWidth,
              height: bodyHeight,
              ...partButtonStyle(),
            }}
            className={clsx(
              !isCoarse &&
                (basebodyVisible
                  ? "hover:bg-[#3776bf] bg-[#4A90E2]"
                  : "hover:bg-[#666] bg-[#555]"),
              isCoarse && (basebodyVisible ? "bg-[#4A90E2]" : "bg-[#555]"),
            )}
          />
          {/* Left Arm – left side (maps to rightArm) */}
          <PartButton
            tooltip={tooltips.rightArm}
            onClick={() => toggleVisibility("base", "leftArm")}
            style={{
              top: headHeight,
              left: 0,
              width: armWidth,
              height: armHeight,
              ...partButtonStyle(),
            }}
            className={clsx(
              !isCoarse &&
                (baseleftArmVisible
                  ? "hover:bg-[#3776bf] bg-[#4A90E2]"
                  : "hover:bg-[#666] bg-[#555]"),
              isCoarse && (baseleftArmVisible ? "bg-[#4A90E2]" : "bg-[#555]"),
            )}
          />
          {/* Right Arm – right side (maps to leftArm) */}
          <PartButton
            tooltip={tooltips.leftArm}
            onClick={() => toggleVisibility("base", "rightArm")}
            style={{
              top: headHeight,
              left: containerWidth - armWidth,
              width: armWidth,
              height: armHeight,
              ...partButtonStyle(),
            }}
            className={clsx(
              !isCoarse &&
                (baserightArmVisible
                  ? "hover:bg-[#3776bf] bg-[#4A90E2]"
                  : "hover:bg-[#666] bg-[#555]"),
              isCoarse && (baserightArmVisible ? "bg-[#4A90E2]" : "bg-[#555]"),
            )}
          />
          {/* Left Leg – below body, aligned right */}
          <PartButton
            tooltip={tooltips.rightLeg}
            onClick={() => toggleVisibility("base", "leftLeg")}
            style={{
              top: headHeight + bodyHeight,
              left: (containerWidth - bodyWidth) / 2,
              width: legWidth,
              height: legHeight,
              ...partButtonStyle(),
            }}
            className={clsx(
              !isCoarse &&
                (baseleftLegVisible
                  ? "hover:bg-[#3776bf] bg-[#4A90E2]"
                  : "hover:bg-[#666] bg-[#555]"),
              isCoarse && (baseleftLegVisible ? "bg-[#4A90E2]" : "bg-[#555]"),
            )}
          />
          {/* Right Leg – below body, aligned left */}
          <PartButton
            tooltip={tooltips.leftLeg}
            onClick={() => toggleVisibility("base", "rightLeg")}
            style={{
              top: headHeight + bodyHeight,
              left: (containerWidth - bodyWidth) / 2 + bodyWidth - legWidth,
              width: legWidth,
              height: legHeight,
              ...partButtonStyle(),
            }}
            className={clsx(
              !isCoarse &&
                (baserightLegVisible
                  ? "hover:bg-[#3776bf] bg-[#4A90E2]"
                  : "hover:bg-[#666] bg-[#555]"),
              isCoarse && (baserightLegVisible ? "bg-[#4A90E2]" : "bg-[#555]"),
            )}
          />
        </div>
      </div>
      {/* Overlay Layer Panel */}
      <div>
        <h3 className="text-base sm:text-xl font-medium mb-2 sm:mb-4 text-center dark:text-neutral-100 text-neutral-900">
          {dict.partFilter.secondLayer}
        </h3>
        <div
          className="relative mx-auto"
          style={{ width: containerWidth, height: containerHeight }}
        >
          {/* Head */}
          <PartButton
            tooltip={tooltips.head}
            onClick={() => toggleVisibility("overlay", "head")}
            style={{
              top: 0,
              left: (containerWidth - headWidth) / 2,
              width: headWidth,
              height: headHeight,
              ...partButtonStyle(),
            }}
            className={clsx(
              !isCoarse &&
                (overlayheadVisible
                  ? "hover:bg-[#3776bf] bg-[#4A90E2]"
                  : "hover:bg-[#666] bg-[#555]"),
              isCoarse && (overlayheadVisible ? "bg-[#4A90E2]" : "bg-[#555]"),
            )}
          />
          {/* Body */}
          <PartButton
            tooltip={tooltips.body}
            onClick={() => toggleVisibility("overlay", "body")}
            style={{
              top: headHeight,
              left: (containerWidth - bodyWidth) / 2,
              width: bodyWidth,
              height: bodyHeight,
              ...partButtonStyle(),
            }}
            className={clsx(
              !isCoarse &&
                (overlaybodyVisible
                  ? "hover:bg-[#3776bf] bg-[#4A90E2]"
                  : "hover:bg-[#666] bg-[#555]"),
              isCoarse && (overlaybodyVisible ? "bg-[#4A90E2]" : "bg-[#555]"),
            )}
          />
          {/* Left Arm */}
          <PartButton
            tooltip={tooltips.leftArm}
            onClick={() => toggleVisibility("overlay", "leftArm")}
            style={{
              top: headHeight,
              left: 0,
              width: armWidth,
              height: armHeight,
              ...partButtonStyle(),
            }}
            className={clsx(
              !isCoarse &&
                (overlayleftArmVisible
                  ? "hover:bg-[#3776bf] bg-[#4A90E2]"
                  : "hover:bg-[#666] bg-[#555]"),
              isCoarse &&
                (overlayleftArmVisible ? "bg-[#4A90E2]" : "bg-[#555]"),
            )}
          />
          {/* Right Arm */}
          <PartButton
            tooltip={tooltips.rightArm}
            onClick={() => toggleVisibility("overlay", "rightArm")}
            style={{
              top: headHeight,
              left: containerWidth - armWidth,
              width: armWidth,
              height: armHeight,
              ...partButtonStyle(),
            }}
            className={clsx(
              !isCoarse &&
                (overlayrightArmVisible
                  ? "hover:bg-[#3776bf] bg-[#4A90E2]"
                  : "hover:bg-[#666] bg-[#555]"),
              isCoarse &&
                (overlayrightArmVisible ? "bg-[#4A90E2]" : "bg-[#555]"),
            )}
          />
          {/* Left Leg */}
          <PartButton
            tooltip={tooltips.leftLeg}
            onClick={() => toggleVisibility("overlay", "leftLeg")}
            style={{
              top: headHeight + bodyHeight,
              left: (containerWidth - bodyWidth) / 2,
              width: legWidth,
              height: legHeight,
              ...partButtonStyle(),
            }}
            className={clsx(
              !isCoarse &&
                (overlayleftLegVisible
                  ? "hover:bg-[#3776bf] bg-[#4A90E2]"
                  : "hover:bg-[#666] bg-[#555]"),
              isCoarse &&
                (overlayleftLegVisible ? "bg-[#4A90E2]" : "bg-[#555]"),
            )}
          />
          {/* Right Leg */}
          <PartButton
            tooltip={tooltips.rightLeg}
            onClick={() => toggleVisibility("overlay", "rightLeg")}
            style={{
              top: headHeight + bodyHeight,
              left: (containerWidth - bodyWidth) / 2 + bodyWidth - legWidth,
              width: legWidth,
              height: legHeight,
              ...partButtonStyle(),
            }}
            className={clsx(
              !isCoarse &&
                (overlayrightLegVisible
                  ? "hover:bg-[#3776bf] bg-[#4A90E2]"
                  : "hover:bg-[#666] bg-[#555]"),
              isCoarse &&
                (overlayrightLegVisible ? "bg-[#4A90E2]" : "bg-[#555]"),
            )}
          />
        </div>
      </div>
    </div>
  );

  if (isCoarse) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh] safe-area-pb safe-area-pl safe-area-pr">
          <DrawerHeader>
            <DrawerTitle>{dict.partFilter.visibilitySettings}</DrawerTitle>
          </DrawerHeader>
          <DrawerBody className="p-4">{bodyContent}</DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 dark:bg-black/50 bg-white/50" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[700px] dark:bg-neutral-900 bg-neutral-100 rounded-lg p-8 border dark:border-neutral-700 border-neutral-200 shadow-lg overflow-y-auto max-h-dvh"
          aria-describedby="dialog-description"
        >
          <Dialog.Title className="text-2xl font-semibold mb-6 dark:text-neutral-100 text-neutral-900">
            {dict.partFilter.visibilitySettings}
          </Dialog.Title>
          <div id="dialog-description" className="sr-only">
            {dict.partFilter.visibilityDescription}
          </div>
          {bodyContent}
          <div className="mt-6 flex justify-end">
            <Dialog.Close asChild>
              <button
                className=" dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-neutral-100 py-2 rounded-md font-medium transition-colors px-4 cursor-pointer hover:bg-blue-200 text-neutral-900 bg-blue-100"
                autoFocus
              >
                {dict.common.close}
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
