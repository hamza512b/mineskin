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
import { Eye, EyeOff } from "lucide-react";
import { PartButton } from "./PartButton";
import Button from "@/components/Button";

type PartFilterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Part = "head" | "body" | "leftArm" | "rightArm" | "leftLeg" | "rightLeg";
type Layer = "base" | "overlay";

// Humanoid silhouette on a 4-column grid (viewer perspective, always LTR)
const GRID_PARTS: { part: Part; col: string; row: string }[] = [
  { part: "head", col: "2 / 4", row: "1" },
  { part: "leftArm", col: "1", row: "2" },
  { part: "body", col: "2 / 4", row: "2" },
  { part: "rightArm", col: "4", row: "2" },
  { part: "leftLeg", col: "2", row: "3" },
  { part: "rightLeg", col: "3", row: "3" },
];

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

  // Grid cell unit; head is 2x2 cells, body 2x3, arms/legs 1x3
  const cell = isCoarse ? 28 : 18;

  const visibility: Record<Layer, Record<Part, boolean>> = {
    base: {
      head: baseheadVisible,
      body: basebodyVisible,
      leftArm: baseleftArmVisible,
      rightArm: baserightArmVisible,
      leftLeg: baseleftLegVisible,
      rightLeg: baserightLegVisible,
    },
    overlay: {
      head: overlayheadVisible,
      body: overlaybodyVisible,
      leftArm: overlayleftArmVisible,
      rightArm: overlayrightArmVisible,
      leftLeg: overlayleftLegVisible,
      rightLeg: overlayrightLegVisible,
    },
  };

  const toggleVisibility = (layer: Layer, part: Part) => {
    setValue(`${layer}${part}Visible`, !visibility[layer][part]);
  };

  const toggleWholeLayer = (layer: Layer) => {
    const next = !Object.values(visibility[layer]).some(Boolean);
    (Object.keys(visibility[layer]) as Part[]).forEach((part) =>
      setValue(`${layer}${part}Visible`, next),
    );
  };

  const tooltips: Record<Layer, Record<Part, string>> = {
    base: {
      head: dict.partFilter.toggleHead,
      body: dict.partFilter.toggleBody,
      leftArm: dict.partFilter.toggleLeftArm,
      rightArm: dict.partFilter.toggleRightArm,
      leftLeg: dict.partFilter.toggleLeftLeg,
      rightLeg: dict.partFilter.toggleRightLeg,
    },
    overlay: {
      head: dict.partFilter.toggleHelmet,
      body: dict.partFilter.toggleJacket,
      leftArm: dict.partFilter.toggleLeftSleeve,
      rightArm: dict.partFilter.toggleRightSleeve,
      leftLeg: dict.partFilter.toggleLeftPants,
      rightLeg: dict.partFilter.toggleRightPants,
    },
  };

  const layers: { layer: Layer; label: string; shortLabel: string }[] = [
    {
      layer: "base",
      label: dict.partFilter.baseLayer,
      shortLabel: dict.partFilter.baseLayerShort,
    },
    {
      layer: "overlay",
      label: dict.partFilter.overlayLayer,
      shortLabel: dict.partFilter.overlayLayerShort,
    },
  ];

  const bodyContent = (
    <div className="flex flex-row justify-center gap-10 sm:gap-14 mx-auto">
      {layers.map(({ layer, label, shortLabel }) => {
        const visibleCount = Object.values(visibility[layer]).filter(
          Boolean,
        ).length;
        const anyVisible = visibleCount > 0;
        return (
          <div key={layer} className="flex flex-col items-center gap-2">
            <p className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
              <span aria-hidden="true">{shortLabel}</span>
              <span className="sr-only">{label}</span>
            </p>
            <div
              dir="ltr"
              className="grid gap-[2px]"
              style={{
                gridTemplateColumns: `repeat(4, ${cell}px)`,
                gridTemplateRows: `${2 * cell}px ${3 * cell}px ${3 * cell}px`,
              }}
            >
              {GRID_PARTS.map(({ part, col, row }) => (
                <PartButton
                  key={part}
                  tooltip={tooltips[layer][part]}
                  onClick={() => toggleVisibility(layer, part)}
                  style={{ gridColumn: col, gridRow: row }}
                  className={clsx(
                    "box-border cursor-pointer rounded-[3px] border",
                    visibility[layer][part]
                      ? "border-[#3776bf] bg-[#4A90E2]"
                      : "border-neutral-400 bg-neutral-300 dark:border-neutral-600 dark:bg-neutral-700",
                    !isCoarse && "hover:ring-2 hover:ring-blue-500",
                  )}
                >
                  <span className="sr-only">{tooltips[layer][part]}</span>
                </PartButton>
              ))}
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => toggleWholeLayer(layer)}
              className="flex h-6 cursor-pointer items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 gap-1 px-2"
            >
              {anyVisible ? <Eye size={14} /> : <EyeOff size={14} />}
              <span
                aria-hidden="true"
                className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300"
              >
                {dict.partFilter.toggleWholeLayerShort}
              </span>
              <span className="sr-only">
                {dict.partFilter.toggleWholeLayer}
              </span>
            </Button>
          </div>
        );
      })}
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
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[420px] dark:bg-neutral-900 bg-neutral-100 rounded-lg p-8 border dark:border-neutral-700 border-neutral-200 shadow-lg overflow-y-auto max-h-dvh"
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
