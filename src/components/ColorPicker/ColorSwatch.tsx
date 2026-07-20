import React from "react";
import { cn } from "@/lib/utils";

// Layer the color over a checkerboard so translucent colors reveal it instead
// of blending against an opaque tile. Shared by the toolbar brush flyout and
// the color-picker palette so both render swatches identically.
export const swatchStyle = (color: string): React.CSSProperties => ({
  backgroundImage: `linear-gradient(${color}, ${color}), repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%)`,
  backgroundSize: "100% 100%, 8px 8px",
});

// Base swatch button appearance. `selected` draws the blue focus ring.
export const swatchClass = (selected?: boolean) =>
  cn(
    "cursor-pointer rounded-[9px] border border-black/10 dark:border-white/15",
    selected &&
      "ring-2 ring-blue-500 ring-offset-2 ring-offset-neutral-100 dark:ring-offset-neutral-900",
  );

export interface ColorSwatchProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color: string;
  selected?: boolean;
}

// Presentational swatch button. Callers pass sizing/extra classes via
// `className`; the checkerboard fill and selection ring come from the shared
// helpers above.
export const ColorSwatch = React.forwardRef<
  HTMLButtonElement,
  ColorSwatchProps
>(({ color, selected, className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(swatchClass(selected), className)}
    style={swatchStyle(color)}
    {...props}
  />
));
ColorSwatch.displayName = "ColorSwatch";
