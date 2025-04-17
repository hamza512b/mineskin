import { FormValues } from "@/hooks/useRendererState";
import clsx from "clsx";
import React from "react";

type PartsComponentProps = {
  values: FormValues;
  className?: string;
};

const PartsPreview: React.FC<PartsComponentProps> = ({ values, className }) => {
  const containerStyle = {
    backgroundClip: "padding-box",
    textShadow: "1px 1px 4px #000",
  } as React.CSSProperties;

  const partBgStyle = {
    backgroundImage: 'url("/parts.png")',
    msInterpolationMode: "nearest-neighbor" as const,
    imageRendering: "pixelated",
  } as React.CSSProperties;

  return (
    <div
      className={clsx("relative rounded-[3px]", className)}
      style={containerStyle}
    >
      {/* Body */}
      <div
        className="absolute inline-block w-[32px] h-[64px] box-border"
        aria-hidden
      >
        {/* Head */}
        {values.baseheadVisible && (
          <div
            className="absolute left-[8px] top-0 w-[16px] h-[16px]"
            style={{ ...partBgStyle }}
          />
        )}
        {/* Body */}
        {values.basebodyVisible && (
          <div
            className="absolute left-[8px] top-[16px] w-[16px] h-[24px] [background-position:-16px_0]"
            style={{ ...partBgStyle }}
          />
        )}
        {/* Right Arm */}
        {values.baserightArmVisible && (
          <div
            className="absolute left-[24px] top-[16px] w-[8px] h-[24px] [background-position:-32px_0]"
            style={{ ...partBgStyle }}
          />
        )}
        {/* Right Leg */}
        {values.baserightLegVisible && (
          <div
            className="absolute left-[16px] top-[40px] w-[8px] h-[24px] [background-position:-40px_0]"
            style={{ ...partBgStyle }}
          />
        )}
        {/* Left Arm */}
        {values.baseleftArmVisible && (
          <div
            className="absolute left-0 top-[16px] w-[8px] h-[24px] [background-position:-48px_0]"
            style={{ ...partBgStyle }}
          />
        )}
        {/* Left Leg */}
        {values.baseleftLegVisible && (
          <div
            className="absolute left-[8px] top-[40px] w-[8px] h-[24px] [background-position:-56px_0]"
            style={{ ...partBgStyle }}
          />
        )}
      </div>
      {/* Armor */}
      <div className="relative inline-block w-[32px] h-[64px] box-border">
        {/* Helmet */}
        {values.overlayheadVisible && (
          <div
            className="absolute [background-position:0_-16px] w-[16px] h-[16px] left-[8px] top-0"
            style={{ ...partBgStyle }}
          />
        )}
        {/* Jacket */}
        {values.overlaybodyVisible && (
          <div
            className="absolute [background-position:-16px_-24px] w-[16px] h-[24px] left-[8px] top-[16px]"
            style={{ ...partBgStyle }}
          />
        )}
        {/* Right Sleeve */}
        {values.overlayrightArmVisible && (
          <div
            className="absolute [background-position:-32px_-24px] w-[8px] h-[24px] left-[24px] top-[16px]"
            style={{ ...partBgStyle }}
          />
        )}
        {/* Right Pants */}
        {values.overlayrightLegVisible && (
          <div
            className="absolute [background-position:-40px_-24px] w-[8px] h-[24px] left-[16px] top-[40px]"
            style={{ ...partBgStyle }}
          />
        )}
        {/* Left Sleeve*/}
        {values.overlayleftArmVisible && (
          <div
            className="absolute [background-position:-48px_-24px] w-[8px] h-[24px] left-0 top-[16px] "
            style={{ ...partBgStyle }}
          />
        )}
        {/* Left Pants */}
        {values.overlayleftLegVisible && (
          <div
            className="absolute [background-position:-56px_-24px] w-[8px] h-[24px] left-[8px] top-[40px]"
            style={{ ...partBgStyle }}
          />
        )}
      </div>
    </div>
  );
};

export default PartsPreview;
