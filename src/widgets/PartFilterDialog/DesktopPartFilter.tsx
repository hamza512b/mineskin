import { FormValues } from "@/hooks/useRendererState";
import { cn } from "@/lib/utils";
import clsx from "clsx";
import React from "react";
import { PartButton } from "./PartButton";

type PartsComponentProps = {
  values: FormValues;
  className?: string;
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

const DesktopPartFilter: React.FC<PartsComponentProps> = ({
  values,
  className,
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
}) => {
  const containerStyle = {} as React.CSSProperties;

  const partBgStyle = {
    backgroundColor: "hsla(0, 10%, 45%, 1)",
    backgroundImage: 'url("/parts.png")',
    msInterpolationMode: "nearest-neighbor" as const,
    imageRendering: "pixelated",
    pointerEvents: "auto",
    cursor: "pointer",
  } as React.CSSProperties;
  const scale = 1.2;

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

  return (
    <div
      className={clsx("relative flex gap-2", className)}
      style={containerStyle}
    >
      {/* Body */}
      <div className="flex flex-col gap-2">
        <div
          style={{
            width: `${scale * 32}px`,
            height: `${scale * 64}px`,
            overflow: "hidden",
          }}
        >
          <div
            className="relative inline-block w-[32px] h-[64px] box-border"
            style={{
              transform: `translate(4px, 6px) scale(${scale})`,
            }}
          >
            {/* Head */}
            <PartButton
              className={cn(
                "absolute left-[8px] top-0 w-[16px] h-[16px] opacity-100",
                !values.baseheadVisible && "opacity-40",
              )}
              onClick={() => toggleVisibility("base", "head")}
              style={{ ...partBgStyle }}
              tooltip="Toggle head"
            >
              <span className="sr-only">Toggle head</span>
            </PartButton>
            {/* Body */}
            <PartButton
              className={cn(
                "absolute left-[8px] top-[16px] w-[16px] h-[24px] [background-position:-16px_0] opacity-100",
                !values.basebodyVisible && "opacity-40",
              )}
              style={{ ...partBgStyle }}
              tooltip="Toggle body"
              onClick={() => toggleVisibility("base", "body")}
            >
              <span className="sr-only">Toggle body</span>
            </PartButton>
            {/* Right Arm */}
            <PartButton
              className={cn(
                "absolute left-[24px] top-[16px] w-[8px] h-[24px] [background-position:-32px_0] opacity-100",
                !values.baserightArmVisible && "opacity-40",
              )}
              style={{ ...partBgStyle }}
              tooltip="Toggle right arm"
              onClick={() => toggleVisibility("base", "rightArm")}
            >
              <span className="sr-only">Toggle right arm</span>
            </PartButton>
            {/* Right Leg */}
            <PartButton
              className={cn(
                "absolute left-[16px] top-[40px] w-[8px] h-[24px] [background-position:-40px_0] opacity-100",
                !values.baserightLegVisible && "opacity-40",
              )}
              style={{ ...partBgStyle }}
              tooltip="Toggle right leg"
              onClick={() => toggleVisibility("base", "rightLeg")}
            >
              <span className="sr-only">Toggle right leg</span>
            </PartButton>
            {/* Left Arm */}
            <PartButton
              className={cn(
                "absolute left-0 top-[16px] w-[8px] h-[24px] [background-position:-48px_0] opacity-100",
                !values.baseleftArmVisible && "opacity-40",
              )}
              style={{ ...partBgStyle }}
              tooltip="Toggle left arm"
              onClick={() => toggleVisibility("base", "leftArm")}
            >
              <span className="sr-only">Toggle left arm</span>
            </PartButton>
            {/* Left Leg */}
            <PartButton
              className={cn(
                "absolute left-[8px] top-[40px] w-[8px] h-[24px] [background-position:-56px_0] opacity-100",
                !values.baseleftLegVisible && "opacity-40",
              )}
              style={{ ...partBgStyle }}
              tooltip="Toggle left leg"
              onClick={() => toggleVisibility("base", "leftLeg")}
            >
              <span className="sr-only">Toggle left leg</span>
            </PartButton>
          </div>
        </div>
      </div>
      {/* Armor */}
      <div className="flex flex-col gap-2">
        <div
          style={{
            width: `${scale * 32}px`,
            height: `${scale * 64}px`,
          }}
        >
          <div
            className="relative inline-block w-[32px] h-[64px] box-border"
            style={{
              transform: `translate(4px, 6px) scale(${scale})`,
            }}
          >
            {/* Helmet */}
            <PartButton
              className={cn(
                "absolute [background-position:0_-16px] w-[16px] h-[16px] left-[8px] top-0 opacity-100",
                !values.overlayheadVisible && "opacity-40",
              )}
              style={{ ...partBgStyle }}
              tooltip="Toggle helmet"
              onClick={() => toggleVisibility("overlay", "head")}
            >
              <span className="sr-only">Toggle helmet</span>
            </PartButton>
            {/* Jacket */}
            <PartButton
              className={cn(
                "absolute [background-position:-16px_-24px] w-[16px] h-[24px] left-[8px] top-[16px] opacity-100",
                !values.overlaybodyVisible && "opacity-40",
              )}
              style={{ ...partBgStyle }}
              tooltip="Toggle jacket"
              onClick={() => toggleVisibility("overlay", "body")}
            >
              <span className="sr-only">Toggle jacket</span>
            </PartButton>
            {/* Right Sleeve */}
            <PartButton
              className={cn(
                "absolute [background-position:-32px_-24px] w-[8px] h-[24px] left-[24px] top-[16px] opacity-100",
                !values.overlayrightArmVisible && "opacity-40",
              )}
              style={{ ...partBgStyle }}
              tooltip="Toggle right sleeve"
              onClick={() => toggleVisibility("overlay", "rightArm")}
            >
              <span className="sr-only">Toggle right sleeve</span>
            </PartButton>
            {/* Right Pants */}
            <PartButton
              className={cn(
                "absolute [background-position:-40px_-24px] w-[8px] h-[24px] left-[16px] top-[40px] opacity-100",
                !values.overlayrightLegVisible && "opacity-40",
              )}
              style={{ ...partBgStyle }}
              tooltip="Toggle right pants"
              onClick={() => toggleVisibility("overlay", "rightLeg")}
            >
              <span className="sr-only">Toggle right pants</span>
            </PartButton>
            {/* Left Sleeve*/}
            <PartButton
              className={cn(
                "absolute [background-position:-48px_-24px] w-[8px] h-[24px] left-0 top-[16px] opacity-100",
                !values.overlayleftArmVisible && "opacity-40",
              )}
              style={{ ...partBgStyle }}
              tooltip="Toggle left sleeve"
              onClick={() => toggleVisibility("overlay", "leftArm")}
            >
              <span className="sr-only">Toggle left sleeve</span>
            </PartButton>
            {/* Left Pants */}
            <PartButton
              className={cn(
                "absolute [background-position:-56px_-24px] w-[8px] h-[24px] left-[8px] top-[40px] opacity-100",
                !values.overlayleftLegVisible && "opacity-40",
              )}
              style={{ ...partBgStyle }}
              tooltip="Toggle left pants"
              onClick={() => toggleVisibility("overlay", "leftLeg")}
            >
              <span className="sr-only">Toggle left pants</span>
            </PartButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DesktopPartFilter);
