import { cn } from "@/lib/utils";
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
  visualPosition: { hue: number; s: number; v: number };
  type: "h" | "s" | "v";
  className?: string;
}) {
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

  const { pos, background, label, ariaLabel } = useMemo(() => {
    let pos = 0;
    let background = "";
    let label = "";
    let ariaLabel = "";
    if (type === "h") {
      pos = visualPosition.hue / 360;
      background =
        "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)";
      label = "Hue";
      ariaLabel = "Hue selector";
    }
    if (type === "s") {
      pos = visualPosition.s / 100;
      background = `linear-gradient(to right, hsl(${visualPosition.hue}, 100%, 100%), hsl(${visualPosition.hue}, 100%, 50%))`;
      label = "Saturation";
      ariaLabel = "Saturation selector";
    }
    if (type === "v") {
      pos = visualPosition.v / 100;
      background = `linear-gradient(to right, hsl(${visualPosition.hue} calc(${visualPosition.s} * 1%) 0%), hsl(${visualPosition.hue} calc(${visualPosition.s} * 1%) 50%), hsl(${visualPosition.hue} calc(${visualPosition.s} * 1%) 100%))`;
      label = "Lightness";
      ariaLabel = "Lightness selector";
    }
    return { pos, background, label, ariaLabel };
  }, [visualPosition, type]);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label className="block text-sm dark:text-slate-300 text-slate-900font-semibold">
        {label}
      </label>
      <div
        className="relative h-4 w-full rounded-lg cursor-pointer focus:outline-none"
        style={{
          backgroundImage: background,
          touchAction: "none",
        }}
        onPointerDown={handleHuePointerDown}
        onPointerMove={handleHuePointerMove}
        onPointerUp={handleHuePointerUp}
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel}
      >
        <div
          className="absolute w-4 h-4 rounded-lg border-2 dark:border-white border-slate-700 outline-none ring-1 ring-black"
          style={{
            left: `${pos * (100 - 4) + 2}%`,
            transform: "translateX(-50%)",
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export const PickerSlider = React.memo(PickerSliderComponent);
