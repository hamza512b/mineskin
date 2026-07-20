import { cn } from "@/lib/utils";
import { useDictionary } from "@/i18n";
import React, { useMemo } from "react";

function PickerSliderComponent({
  setDragging,
  update,
  setRecentlyDragged,
  visualPosition,
  type,
  className,
}: {
  setDragging: (dragging: boolean) => void;
  update: (e: React.PointerEvent<HTMLDivElement>) => void;
  setRecentlyDragged: (recentlyDragged: boolean) => void;
  visualPosition: { hue: number; s: number; v: number; a: number };
  type: "h" | "s" | "v" | "a";
  className?: string;
}) {
  const { dictionary: dict } = useDictionary();

  const handleHuePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    update(e);
  };
  const handleHuePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 1) update(e);
  };
  const handleHuePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
    setRecentlyDragged(true);
    setTimeout(() => setRecentlyDragged(false), 100);
  };
  const handleHuePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDragging(false);
  };

  const { pos, background, label, ariaLabel } = useMemo(() => {
    let pos = 0;
    let background = "";
    let label = "";
    let ariaLabel = "";
    if (type === "h") {
      pos = visualPosition.hue / 360;
      background =
        "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)";
      label = dict.colorPicker.hue;
      ariaLabel = dict.colorPicker.hueSelector;
    }
    if (type === "s") {
      pos = visualPosition.s / 100;
      background = `linear-gradient(to right, hsl(${visualPosition.hue}, 100%, 100%), hsl(${visualPosition.hue}, 100%, 50%))`;
      label = dict.colorPicker.saturation;
      ariaLabel = dict.colorPicker.saturationSelector;
    }
    if (type === "v") {
      pos = visualPosition.v / 100;
      background = `linear-gradient(to right, hsl(${visualPosition.hue} calc(${visualPosition.s} * 1%) 0%), hsl(${visualPosition.hue} calc(${visualPosition.s} * 1%) 50%), hsl(${visualPosition.hue} calc(${visualPosition.s} * 1%) 100%))`;
      label = dict.colorPicker.lightness;
      ariaLabel = dict.colorPicker.lightnessSelector;
    }
    if (type === "a") {
      pos = visualPosition.a / 100;
      background = `linear-gradient(to right, transparent, hsl(${visualPosition.hue} calc(${visualPosition.s} * 1%) calc(${visualPosition.v} * 0.5%)))`;
      label = dict.colorPicker.opacity;
      ariaLabel = dict.colorPicker.opacitySelector;
    }
    return { pos, background, label, ariaLabel };
  }, [visualPosition, type, dict]);

  const sliderTrack = (
    <div
      className="relative h-4 w-full rounded-lg cursor-pointer focus:outline-none"
      style={{
        backgroundImage: background,
        touchAction: "pan-y",
      }}
      onPointerDown={handleHuePointerDown}
      onPointerMove={handleHuePointerMove}
      onPointerUp={handleHuePointerUp}
      onPointerCancel={handleHuePointerCancel}
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
    >
      <div
        className="absolute w-4 h-4 rounded-lg border-2 dark:border-white border-neutral-700 outline-none ring-1 ring-black"
        style={{
          left: `${pos * (100 - 4) + 2}%`,
          transform: "translateX(-50%)",
        }}
        aria-hidden="true"
      />
    </div>
  );

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label className="block text-sm dark:text-neutral-300 text-neutral-900font-semibold">
        {label}
      </label>
      {type === "a" ? (
        <div
          className="rounded-lg"
          style={{
            backgroundImage:
              "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%)",
            backgroundSize: "8px 8px",
          }}
        >
          {sliderTrack}
        </div>
      ) : (
        sliderTrack
      )}
    </div>
  );
}

export const PickerSlider = React.memo(PickerSliderComponent);
