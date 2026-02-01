import { useRendererStore } from "@/hooks/useRendererState";
import { useDictionary } from "@/i18n";
import { cn } from "@/lib/utils";
import clsx from "clsx";
import React, { useMemo } from "react";
import { PartButton } from "./PartButton";

type PartsComponentProps = {
  className?: string;
  scale?: number;
};

// Base dimensions at scale 1
const CONTAINER = { width: 32, height: 64 } as const;

const PARTS = {
  head: { left: 8, top: 0, width: 16, height: 16 },
  body: { left: 8, top: 16, width: 16, height: 24 },
  rightArm: { left: 24, top: 16, width: 8, height: 24 },
  rightLeg: { left: 16, top: 40, width: 8, height: 24 },
  leftArm: { left: 0, top: 16, width: 8, height: 24 },
  leftLeg: { left: 8, top: 40, width: 8, height: 24 },
} as const;

// Background positions for each part (base layer)
const BASE_BG_POS = {
  head: "0 0",
  body: "-16px 0",
  rightArm: "-32px 0",
  rightLeg: "-40px 0",
  leftArm: "-48px 0",
  leftLeg: "-56px 0",
} as const;

// Background positions for overlay layer
const OVERLAY_BG_POS = {
  head: "0 -16px",
  body: "-16px -24px",
  rightArm: "-32px -24px",
  rightLeg: "-40px -24px",
  leftArm: "-48px -24px",
  leftLeg: "-56px -24px",
} as const;

type PartName = keyof typeof BASE_BG_POS;

const DesktopPartFilter: React.FC<PartsComponentProps> = ({
  className,
  scale = 1.2,
}) => {
  const { dictionary: dict } = useDictionary();
  // Use Zustand store with selective subscriptions
  const baseheadVisible = useRendererStore(
    (state) => state.values.baseheadVisible,
  );
  const basebodyVisible = useRendererStore(
    (state) => state.values.basebodyVisible,
  );
  const baseleftArmVisible = useRendererStore(
    (state) => state.values.baseleftArmVisible,
  );
  const baserightArmVisible = useRendererStore(
    (state) => state.values.baserightArmVisible,
  );
  const baseleftLegVisible = useRendererStore(
    (state) => state.values.baseleftLegVisible,
  );
  const baserightLegVisible = useRendererStore(
    (state) => state.values.baserightLegVisible,
  );
  const overlayheadVisible = useRendererStore(
    (state) => state.values.overlayheadVisible,
  );
  const overlaybodyVisible = useRendererStore(
    (state) => state.values.overlaybodyVisible,
  );
  const overlayleftArmVisible = useRendererStore(
    (state) => state.values.overlayleftArmVisible,
  );
  const overlayrightArmVisible = useRendererStore(
    (state) => state.values.overlayrightArmVisible,
  );
  const overlayleftLegVisible = useRendererStore(
    (state) => state.values.overlayleftLegVisible,
  );
  const overlayrightLegVisible = useRendererStore(
    (state) => state.values.overlayrightLegVisible,
  );
  const handleChange = useRendererStore((state) => state.handleChange);

  // Compute scaled dimensions (floor to avoid subpixel clipping)
  const scaled = useMemo(() => {
    const s = (v: number) => Math.floor(v * scale);
    return {
      container: {
        width: s(CONTAINER.width),
        height: s(CONTAINER.height),
      },
      parts: Object.fromEntries(
        Object.entries(PARTS).map(([key, dims]) => [
          key,
          {
            left: s(dims.left),
            top: s(dims.top),
            width: s(dims.width),
            height: s(dims.height),
          },
        ]),
      ) as Record<PartName, { left: number; top: number; width: number; height: number }>,
      bgSize: `${s(64)}px ${s(48)}px`,
      bgPos: (pos: string) =>
        pos
          .split(" ")
          .map((v) => {
            const num = parseInt(v);
            return isNaN(num) ? v : `${Math.floor(num * scale)}px`;
          })
          .join(" "),
    };
  }, [scale]);

  const partBgStyle = {
    backgroundColor: "hsla(0, 10%, 45%, 1)",
    backgroundImage: 'url("/parts.png")',
    imageRendering: "pixelated",
    backgroundSize: scaled.bgSize,
    pointerEvents: "auto",
    cursor: "pointer",
  } as React.CSSProperties;

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

  const getPartStyle = (
    part: PartName,
    layer: "base" | "overlay",
  ): React.CSSProperties => ({
    ...partBgStyle,
    position: "absolute",
    left: scaled.parts[part].left,
    top: scaled.parts[part].top,
    width: scaled.parts[part].width,
    height: scaled.parts[part].height,
    backgroundPosition:
      layer === "base"
        ? scaled.bgPos(BASE_BG_POS[part])
        : scaled.bgPos(OVERLAY_BG_POS[part]),
  });

  const baseVisibility = {
    head: baseheadVisible,
    body: basebodyVisible,
    leftArm: baseleftArmVisible,
    rightArm: baserightArmVisible,
    leftLeg: baseleftLegVisible,
    rightLeg: baserightLegVisible,
  };

  const overlayVisibility = {
    head: overlayheadVisible,
    body: overlaybodyVisible,
    leftArm: overlayleftArmVisible,
    rightArm: overlayrightArmVisible,
    leftLeg: overlayleftLegVisible,
    rightLeg: overlayrightLegVisible,
  };

  return (
    <div className={clsx("relative", className)}>
      <div
        data-tutorial-id="desktop-part-filter"
        className="flex justify-around gap-2"
      >
        {/* Base Layer */}
        <div
          className="relative"
          style={{
            width: scaled.container.width,
            height: scaled.container.height,
          }}
        >
          {/* Head */}
          <PartButton
            className={cn("opacity-100", !baseVisibility.head && "opacity-40")}
            onClick={() => toggleVisibility("base", "head")}
            style={getPartStyle("head", "base")}
            tooltip={dict.partFilter.toggleHead}
          >
            <span className="sr-only">{dict.partFilter.toggleHead}</span>
          </PartButton>
          {/* Body */}
          <PartButton
            className={cn("opacity-100", !baseVisibility.body && "opacity-40")}
            style={getPartStyle("body", "base")}
            tooltip={dict.partFilter.toggleBody}
            onClick={() => toggleVisibility("base", "body")}
          >
            <span className="sr-only">{dict.partFilter.toggleBody}</span>
          </PartButton>
          {/* Right Arm */}
          <PartButton
            className={cn(
              "opacity-100",
              !baseVisibility.rightArm && "opacity-40",
            )}
            style={getPartStyle("rightArm", "base")}
            tooltip={dict.partFilter.toggleRightArm}
            onClick={() => toggleVisibility("base", "rightArm")}
          >
            <span className="sr-only">{dict.partFilter.toggleRightArm}</span>
          </PartButton>
          {/* Right Leg */}
          <PartButton
            className={cn(
              "opacity-100",
              !baseVisibility.rightLeg && "opacity-40",
            )}
            style={getPartStyle("rightLeg", "base")}
            tooltip={dict.partFilter.toggleRightLeg}
            onClick={() => toggleVisibility("base", "rightLeg")}
          >
            <span className="sr-only">{dict.partFilter.toggleRightLeg}</span>
          </PartButton>
          {/* Left Arm */}
          <PartButton
            className={cn(
              "opacity-100",
              !baseVisibility.leftArm && "opacity-40",
            )}
            style={getPartStyle("leftArm", "base")}
            tooltip={dict.partFilter.toggleLeftArm}
            onClick={() => toggleVisibility("base", "leftArm")}
          >
            <span className="sr-only">{dict.partFilter.toggleLeftArm}</span>
          </PartButton>
          {/* Left Leg */}
          <PartButton
            className={cn(
              "opacity-100",
              !baseVisibility.leftLeg && "opacity-40",
            )}
            style={getPartStyle("leftLeg", "base")}
            tooltip={dict.partFilter.toggleLeftLeg}
            onClick={() => toggleVisibility("base", "leftLeg")}
          >
            <span className="sr-only">{dict.partFilter.toggleLeftLeg}</span>
          </PartButton>
        </div>

        {/* Overlay Layer */}
        <div
          className="relative"
          style={{
            width: scaled.container.width,
            height: scaled.container.height,
          }}
        >
          {/* Helmet */}
          <PartButton
            className={cn(
              "opacity-100",
              !overlayVisibility.head && "opacity-40",
            )}
            style={getPartStyle("head", "overlay")}
            tooltip={dict.partFilter.toggleHelmet}
            onClick={() => toggleVisibility("overlay", "head")}
          >
            <span className="sr-only">{dict.partFilter.toggleHelmet}</span>
          </PartButton>
          {/* Jacket */}
          <PartButton
            className={cn(
              "opacity-100",
              !overlayVisibility.body && "opacity-40",
            )}
            style={getPartStyle("body", "overlay")}
            tooltip={dict.partFilter.toggleJacket}
            onClick={() => toggleVisibility("overlay", "body")}
          >
            <span className="sr-only">{dict.partFilter.toggleJacket}</span>
          </PartButton>
          {/* Right Sleeve */}
          <PartButton
            className={cn(
              "opacity-100",
              !overlayVisibility.rightArm && "opacity-40",
            )}
            style={getPartStyle("rightArm", "overlay")}
            tooltip={dict.partFilter.toggleRightSleeve}
            onClick={() => toggleVisibility("overlay", "rightArm")}
          >
            <span className="sr-only">{dict.partFilter.toggleRightSleeve}</span>
          </PartButton>
          {/* Right Pants */}
          <PartButton
            className={cn(
              "opacity-100",
              !overlayVisibility.rightLeg && "opacity-40",
            )}
            style={getPartStyle("rightLeg", "overlay")}
            tooltip={dict.partFilter.toggleRightPants}
            onClick={() => toggleVisibility("overlay", "rightLeg")}
          >
            <span className="sr-only">{dict.partFilter.toggleRightPants}</span>
          </PartButton>
          {/* Left Sleeve */}
          <PartButton
            className={cn(
              "opacity-100",
              !overlayVisibility.leftArm && "opacity-40",
            )}
            style={getPartStyle("leftArm", "overlay")}
            tooltip={dict.partFilter.toggleLeftSleeve}
            onClick={() => toggleVisibility("overlay", "leftArm")}
          >
            <span className="sr-only">{dict.partFilter.toggleLeftSleeve}</span>
          </PartButton>
          {/* Left Pants */}
          <PartButton
            className={cn(
              "opacity-100",
              !overlayVisibility.leftLeg && "opacity-40",
            )}
            style={getPartStyle("leftLeg", "overlay")}
            tooltip={dict.partFilter.toggleLeftPants}
            onClick={() => toggleVisibility("overlay", "leftLeg")}
          >
            <span className="sr-only">{dict.partFilter.toggleLeftPants}</span>
          </PartButton>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DesktopPartFilter);
