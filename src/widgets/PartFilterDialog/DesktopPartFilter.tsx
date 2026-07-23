import { useDictionary } from "@/i18n";
import { useRendererStore } from "@/store";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";
import React from "react";
import { PartButton } from "./PartButton";

type PartsComponentProps = {
  className?: string;
  scale?: number;
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

const DesktopPartFilter: React.FC<PartsComponentProps> = ({
  className,
  scale = 1.2,
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

  // Grid cell unit; head is 2x2 cells, body 2x3, arms/legs 1x3
  const cell = Math.floor(9 * scale);

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

  const layers: { layer: Layer; label: string }[] = [
    { layer: "base", label: dict.partFilter.baseLayer },
    { layer: "overlay", label: dict.partFilter.overlayLayer },
  ];

  return (
    <div className={clsx("relative", className)}>
      <div
        data-tutorial-id="desktop-part-filter"
        className="flex justify-around gap-3"
      >
        {layers.map(({ layer, label }) => {
          const anyVisible = Object.values(visibility[layer]).some(Boolean);
          return (
            <div
              key={layer}
              className="group pointer-events-auto flex flex-col items-center gap-1.5"
            >
              <span className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-300">
                {label}
              </span>
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
                      "pointer-events-auto box-border cursor-pointer rounded-[3px] border hover:ring-2 hover:ring-blue-500",
                      visibility[layer][part]
                        ? layer === "base"
                          ? "border-slate-800 bg-slate-700 dark:border-slate-400 dark:bg-slate-300"
                          : "border-[#3776bf] bg-[#4A90E2]"
                        : "border-neutral-400 bg-neutral-300 dark:border-neutral-600 dark:bg-neutral-700",
                    )}
                  >
                    <span className="sr-only">{tooltips[layer][part]}</span>
                  </PartButton>
                ))}
              </div>
              <PartButton
                tooltip={dict.partFilter.toggleWholeLayer}
                onClick={() => toggleWholeLayer(layer)}
                className="pointer-events-auto flex h-5 w-6 cursor-pointer items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                {anyVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                <span className="sr-only">
                  {dict.partFilter.toggleWholeLayer}
                </span>
              </PartButton>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(DesktopPartFilter);
