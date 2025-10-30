import { useRendererStore } from "@/hooks/useRendererState";
import * as Dialog from "@radix-ui/react-dialog";
import { PartButton } from "./PartButton";

type PartFilterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const PartFilterDialog: React.FC<PartFilterDialogProps> = ({
  open,
  onOpenChange,
}) => {
  // Use Zustand store with selective subscriptions
  const baseheadVisible = useRendererStore((state) => state.values.baseheadVisible);
  const basebodyVisible = useRendererStore((state) => state.values.basebodyVisible);
  const baseleftArmVisible = useRendererStore((state) => state.values.baseleftArmVisible);
  const baserightArmVisible = useRendererStore((state) => state.values.baserightArmVisible);
  const baseleftLegVisible = useRendererStore((state) => state.values.baseleftLegVisible);
  const baserightLegVisible = useRendererStore((state) => state.values.baserightLegVisible);
  const overlayheadVisible = useRendererStore((state) => state.values.overlayheadVisible);
  const overlaybodyVisible = useRendererStore((state) => state.values.overlaybodyVisible);
  const overlayleftArmVisible = useRendererStore((state) => state.values.overlayleftArmVisible);
  const overlayrightArmVisible = useRendererStore((state) => state.values.overlayrightArmVisible);
  const overlayleftLegVisible = useRendererStore((state) => state.values.overlayleftLegVisible);
  const overlayrightLegVisible = useRendererStore((state) => state.values.overlayrightLegVisible);
  const handleChange = useRendererStore((state) => state.handleChange);
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
        handleChange(`baseheadVisible`, !baseheadVisible);
      }
      if (part === "body") {
        handleChange(`basebodyVisible`, !basebodyVisible);
      }
      if (part === "leftArm") {
        handleChange(`baseleftArmVisible`, !baseleftArmVisible);
      }
      if (part === "rightArm") {
        handleChange(`baserightArmVisible`, !baserightArmVisible);
      }
      if (part === "leftLeg") {
        handleChange(`baseleftLegVisible`, !baseleftLegVisible);
      }
      if (part === "rightLeg") {
        handleChange(`baserightLegVisible`, !baserightLegVisible);
      }
    }
    if (layer === "overlay") {
      if (part === "head") {
        handleChange(`overlayheadVisible`, !overlayheadVisible);
      }
      if (part === "body") {
        handleChange(`overlaybodyVisible`, !overlaybodyVisible);
      }
      if (part === "leftArm") {
        handleChange(`overlayleftArmVisible`, !overlayleftArmVisible);
      }
      if (part === "rightArm") {
        handleChange(`overlayrightArmVisible`, !overlayrightArmVisible);
      }
      if (part === "leftLeg") {
        handleChange(`overlayleftLegVisible`, !overlayleftLegVisible);
      }
      if (part === "rightLeg") {
        handleChange(`overlayrightLegVisible`, !overlayrightLegVisible);
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
                  tooltip={tooltips.head}
                  onClick={() => toggleVisibility("base", "head")}
                  style={{
                    top: 0,
                    left: (containerWidth - headWidth) / 2,
                    width: headWidth,
                    height: headHeight,
                    border: "1px solid #333",
                    position: "absolute",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    backgroundColor: baseheadVisible ? "#4A90E2" : "#555",
                  }}
                  className="hover:!bg-[#666]"
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
                    border: "1px solid #333",
                    position: "absolute",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    backgroundColor: basebodyVisible ? "#4A90E2" : "#555",
                  }}
                  className="hover:!bg-[#666]"
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
                    border: "1px solid #333",
                    position: "absolute",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    backgroundColor: baseleftArmVisible ? "#4A90E2" : "#555",
                  }}
                  className="hover:!bg-[#666]"
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
                    border: "1px solid #333",
                    position: "absolute",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    backgroundColor: baserightArmVisible ? "#4A90E2" : "#555",
                  }}
                  className="hover:!bg-[#666]"
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
                    border: "1px solid #333",
                    position: "absolute",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    backgroundColor: baseleftLegVisible ? "#4A90E2" : "#555",
                  }}
                  className="hover:!bg-[#666]"
                />
                {/* Right Leg – below body, aligned left */}
                <PartButton
                  tooltip={tooltips.leftLeg}
                  onClick={() => toggleVisibility("base", "rightLeg")}
                  style={{
                    top: headHeight + bodyHeight,
                    left:
                      (containerWidth - bodyWidth) / 2 + bodyWidth - legWidth,
                    width: legWidth,
                    height: legHeight,
                    border: "1px solid #333",
                    position: "absolute",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    backgroundColor: baserightLegVisible ? "#4A90E2" : "#555",
                  }}
                  className="hover:!bg-[#666]"
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
                  tooltip={tooltips.head}
                  onClick={() => toggleVisibility("overlay", "head")}
                  style={{
                    top: 0,
                    left: (containerWidth - headWidth) / 2,
                    width: headWidth,
                    height: headHeight,
                    border: "1px solid #333",
                    position: "absolute",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    backgroundColor: overlayheadVisible ? "#4A90E2" : "#555",
                  }}
                  className="hover:!bg-[#666]"
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
                    border: "1px solid #333",
                    position: "absolute",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    backgroundColor: overlaybodyVisible ? "#4A90E2" : "#555",
                  }}
                  className="hover:!bg-[#666]"
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
                    border: "1px solid #333",
                    position: "absolute",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    backgroundColor: overlayleftArmVisible ? "#4A90E2" : "#555",
                  }}
                  className="hover:!bg-[#666]"
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
                    border: "1px solid #333",
                    position: "absolute",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    backgroundColor: overlayrightArmVisible ? "#4A90E2" : "#555",
                  }}
                  className="hover:!bg-[#666]"
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
                    border: "1px solid #333",
                    position: "absolute",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    backgroundColor: overlayleftLegVisible ? "#4A90E2" : "#555",
                  }}
                  className="hover:!bg-[#666]"
                />
                {/* Right Leg */}
                <PartButton
                  tooltip={tooltips.rightLeg}
                  onClick={() => toggleVisibility("overlay", "rightLeg")}
                  style={{
                    top: headHeight + bodyHeight,
                    left:
                      (containerWidth - bodyWidth) / 2 + bodyWidth - legWidth,
                    width: legWidth,
                    height: legHeight,
                    border: "1px solid #333",
                    position: "absolute",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    backgroundColor: overlayrightLegVisible ? "#4A90E2" : "#555",
                  }}
                  className="hover:!bg-[#666]"
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
