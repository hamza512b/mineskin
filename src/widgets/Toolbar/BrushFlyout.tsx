import * as Popover from "@radix-ui/react-popover";
import * as Tooltip from "@radix-ui/react-tooltip";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { cn, MAX_VARIATION_STEPS } from "@/lib/utils";
import { useRendererStore } from "@/store";
import { useDictionary } from "@/i18n";
import useIsTouch from "@/hooks/useIsTouch";
import Slider from "@/components/Slider/Slider";
import {
  Close,
  EraserIcon,
  PaintCanIcon,
  PenToolIcon,
  VariationIcon,
} from "@/components/Icons/Icons";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { swatchClass, swatchStyle } from "@/components/ColorPicker/ColorSwatch";
import { hexToAlpha } from "@/components/ColorPicker/colorUtils";
import ToolButton from "./ToolButton";

type BrushMode = "pixel" | "bulk" | "variation" | "dither";

const DitherIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
    <path d="M5 5h4v4H5zM15 5h4v4h-4zM10 10h4v4h-4zM5 15h4v4H5zM15 15h4v4h-4z" />
  </svg>
);

const BRUSHES: {
  mode: BrushMode;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  labelKey: "penTool" | "bulkPaint" | "variation" | "dither";
  shortcut: string;
}[] = [
  { mode: "pixel", icon: PenToolIcon, labelKey: "penTool", shortcut: "P" },
  { mode: "bulk", icon: PaintCanIcon, labelKey: "bulkPaint", shortcut: "U" },
  {
    mode: "variation",
    icon: VariationIcon,
    labelKey: "variation",
    shortcut: "V",
  },
  { mode: "dither", icon: DitherIcon, labelKey: "dither", shortcut: "D" },
];

// The rail slot owns the eraser alongside the brushes so its size control has
// a home beside them: the eraser rides the panel as an extra tile and the slot
// reflects it as the active tool.
type SlotMode = BrushMode | "eraser";
const SLOT_TOOLS: {
  mode: SlotMode;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  labelKey: "penTool" | "bulkPaint" | "variation" | "dither" | "eraser";
  shortcut: string;
}[] = [
  ...BRUSHES,
  { mode: "eraser", icon: EraserIcon, labelKey: "eraser", shortcut: "E" },
];

export const SymmetryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 3v18" strokeDasharray="2.4 2.4" />
    <path d="M9 7L4 12l5 5z" fill="currentColor" stroke="none" />
    <path d="M15 7l5 5-5 5z" fill="currentColor" stroke="none" />
  </svg>
);

// Mobile sheet snap heights: folded fits the handle + header + tool row plus
// bottom breathing room; expanded opens to the sheet's full height for the
// settings kit. The folded height is a base the component tops up with the
// safe-area inset.
const SNAP_FOLDED_HEIGHT = 250;
const SNAP_EXPANDED = 1;

// 2a tool row: every tile maps to a real renderer paint mode.
type ToolId = "pen" | "bucket" | "shading" | "dither" | "eraser";
const TOOL_TO_MODE: Record<ToolId, BrushMode | "eraser"> = {
  pen: "pixel",
  bucket: "bulk",
  shading: "variation",
  dither: "dither",
  eraser: "eraser",
};
const MODE_TO_TOOL: Partial<Record<string, ToolId>> = {
  pixel: "pen",
  bulk: "bucket",
  variation: "shading",
  dither: "dither",
  eraser: "eraser",
};
const DRAWER_TOOLS: {
  id: ToolId;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  labelKey: "penTool" | "bulkPaint" | "variation" | "dither" | "eraser";
}[] = [
  { id: "pen", icon: PenToolIcon, labelKey: "penTool" },
  { id: "bucket", icon: PaintCanIcon, labelKey: "bulkPaint" },
  { id: "shading", icon: VariationIcon, labelKey: "variation" },
  { id: "dither", icon: DitherIcon, labelKey: "dither" },
  { id: "eraser", icon: EraserIcon, labelKey: "eraser" },
];

// Persisted UI preference: whether the mobile color palette is left unfolded.
const PALETTE_EXPANDED_KEY = "mineskin.paletteExpanded";

// Staggered fade for the mobile settings kit: opening reveals rows top-down,
// collapsing peels them off bottom-up so they read as disappearing into the
// closing drawer rather than getting clipped all at once.
const SETTINGS_LIST: Variants = {
  open: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
  closed: { transition: { staggerChildren: 0.045, staggerDirection: -1 } },
};
const SETTINGS_ROW: Variants = {
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] },
  },
  closed: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.18, ease: "easeIn" },
  },
};

interface SliderProps {
  label: string;
  value: number;
  display: string;
  min?: number;
  max?: number;
  step?: number;
  touch?: boolean;
  onChange: (v: number) => void;
}

const FlyoutSlider: React.FC<SliderProps> = ({
  label,
  value,
  display,
  min = 0,
  max = 100,
  step = 1,
  touch = false,
  onChange,
}) => {
  const safeValue = Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : min;
  const pct = max === min ? 0 : ((safeValue - min) / (max - min)) * 100;
  return (
    <div className={cn("flex items-center", touch ? "gap-4" : "gap-3")}>
      <span
        className={cn(
          "shrink-0 text-neutral-500 dark:text-neutral-400",
          touch ? "w-20 text-[15px]" : "w-16 text-[13px]",
        )}
      >
        {label}
      </span>
      <div className={cn("relative min-w-0 flex-1", touch ? "h-3" : "h-1.5")}>
        <div className="absolute inset-0 rounded-full bg-neutral-200 dark:bg-neutral-700" />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-blue-500 dark:bg-blue-600"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={safeValue}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
          className={cn(
            "mineskin-range absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent",
            touch && "mineskin-range--lg",
          )}
        />
      </div>
      <span
        className={cn(
          "shrink-0 text-right font-medium tabular-nums text-neutral-700 dark:text-neutral-200",
          touch ? "w-12 text-[15px]" : "w-9 text-[13px]",
        )}
      >
        {display}
      </span>
    </div>
  );
};

/**
 * Desktop brush variant selector + the active brush's options, shown in the
 * side popover anchored to the rail.
 */
const BrushPanel: React.FC<{
  slotActive: boolean;
}> = ({ slotActive }) => {
  const { dictionary: dict } = useDictionary();
  const paintMode = useRendererStore((s) => s.paintMode);
  const variationIntensity = useRendererStore((s) => s.variationIntensity);
  const bulkPaintRadius = useRendererStore((s) => s.bulkPaintRadius);
  const bulkPaintShape = useRendererStore((s) => s.bulkPaintShape);
  const eraserRadius = useRendererStore((s) => s.eraserRadius);
  const mirrorPaint = useRendererStore((s) => s.mirrorPaint);
  const setValue = useRendererStore((s) => s.setValue);

  const selectBrush = (mode: SlotMode) => {
    setValue("paintMode", mode);
    setValue("colorPickerActive", false);
  };

  return (
    <>
      {/* Brush variant selector — brushes in a 2-up grid, eraser spanning the
          full width beneath them so it reads as its own paint tool. */}
      <div className="grid grid-cols-2 gap-1.5 rounded-lg bg-neutral-100 p-1.5 dark:bg-neutral-900/50">
        {SLOT_TOOLS.map(({ mode, icon: Icon, labelKey, shortcut }) => {
          const isActive = slotActive && paintMode === mode;
          const isEraser = mode === "eraser";
          return (
            <button
              key={mode}
              type="button"
              onClick={() => selectBrush(mode)}
              className={cn(
                "flex cursor-pointer rounded-md px-1 text-[11px] font-medium transition-all duration-150",
                isEraser
                  ? "col-span-2 flex-row items-center justify-center gap-1.5 py-2"
                  : "flex-col items-center gap-1.5 py-2.5",
                isActive
                  ? "bg-blue-500 text-white shadow-md dark:bg-blue-600"
                  : "text-neutral-600 dark:text-neutral-300",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-center leading-tight">
                {dict.toolbar[labelKey]}
              </span>
              <span
                className={cn(
                  "rounded px-1 text-[9px] leading-tight",
                  isActive
                    ? "bg-white/20 text-white/90"
                    : "bg-neutral-200 text-neutral-400 dark:bg-neutral-700 dark:text-neutral-500",
                )}
              >
                {shortcut}
              </span>
            </button>
          );
        })}
      </div>

      {/* Options */}
      <div className="mt-3 space-y-3 px-1 pb-0.5">
        <AnimatePresence initial={false}>
          {slotActive && paintMode === "variation" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <FlyoutSlider
                label={dict.toolbar.intensity}
                value={variationIntensity}
                min={1}
                max={MAX_VARIATION_STEPS}
                step={1}
                display={`${variationIntensity}`}
                onChange={(v) => setValue("variationIntensity", v)}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence initial={false}>
          {slotActive && paintMode === "bulk" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <FlyoutSlider
                label={dict.toolbar.radius}
                value={bulkPaintRadius}
                min={0}
                max={8}
                step={1}
                display={
                  bulkPaintRadius === 0 ? "Face" : `${bulkPaintRadius}px`
                }
                onChange={(v) => setValue("bulkPaintRadius", v)}
              />
              {bulkPaintRadius > 0 && (
                <div className="mt-3 flex items-center gap-3">
                  <span className="w-16 shrink-0 text-[13px] text-neutral-500 dark:text-neutral-400">
                    {dict.toolbar.shape}
                  </span>
                  <div className="flex flex-1 gap-1 rounded-md bg-neutral-100 p-1 dark:bg-neutral-900/50">
                    {(["square", "circle"] as const).map((shape) => {
                      const isActive = bulkPaintShape === shape;
                      return (
                        <button
                          key={shape}
                          type="button"
                          onClick={() => setValue("bulkPaintShape", shape)}
                          className={cn(
                            "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md py-1.5 text-[12px] font-medium transition-colors duration-150",
                            isActive
                              ? "bg-blue-500 text-white shadow-sm dark:bg-blue-600"
                              : "text-neutral-600 dark:text-neutral-300",
                          )}
                        >
                          <span
                            aria-hidden
                            className={cn(
                              "h-3 w-3 border-[1.5px] border-current",
                              shape === "circle"
                                ? "rounded-full"
                                : "rounded-[2px]",
                            )}
                          />
                          {shape === "square"
                            ? dict.toolbar.square
                            : dict.toolbar.circle}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence initial={false}>
          {slotActive && paintMode === "eraser" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <FlyoutSlider
                label={dict.toolbar.size}
                value={eraserRadius}
                min={0}
                max={8}
                step={1}
                display={`${eraserRadius * 2 + 1}px`}
                onChange={(v) => setValue("eraserRadius", v)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Symmetry: mirrors every stroke onto the model's other side. */}
        <button
          type="button"
          onClick={() => setValue("mirrorPaint", !mirrorPaint)}
          aria-pressed={mirrorPaint}
          className={cn(
            "flex w-full cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2 text-[13px] font-medium transition-colors duration-150",
            mirrorPaint
              ? "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:border-blue-500/40 dark:text-blue-300"
              : "border-neutral-200 bg-neutral-100 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-300",
          )}
        >
          <SymmetryIcon className="h-4 w-4 flex-none" />
          <span className="flex-1 text-left">{dict.toolbar.symmetry}</span>
          <span
            className={cn(
              "rounded px-1 text-[9px] leading-tight",
              mirrorPaint
                ? "bg-blue-500/15 text-blue-600 dark:text-blue-300"
                : "bg-neutral-200 text-neutral-400 dark:bg-neutral-700 dark:text-neutral-500",
            )}
          >
            M
          </span>
        </button>
      </div>
    </>
  );
};

/**
 * Mobile "2a" panel — reproduced from the Brushes Drawer design:
 * a 5-up tool row that stays up (morphing to 2 columns when open) over a
 * chevron-unfolded settings kit (palette · brush size · opacity · symmetry).
 *
 * Every control is wired to the renderer: Pen/Bulk/Shading/Dither/Eraser
 * tools, the Color palette, Opacity, Symmetry (mirror painting), and — for
 * the bucket only — the fill radius. Pen/Shading/Dither paint single texels,
 * so they get no size slider.
 */
const MobileBrushPanel: React.FC<{
  expanded: boolean;
  getUniqueColors?: () => string[];
}> = ({ expanded, getUniqueColors }) => {
  const { dictionary: dict } = useDictionary();
  const paintMode = useRendererStore((s) => s.paintMode);
  const paintColor = useRendererStore((s) => s.paintColor);
  const mirrorPaint = useRendererStore((s) => s.mirrorPaint);
  const bulkPaintRadius = useRendererStore((s) => s.bulkPaintRadius);
  const variationIntensity = useRendererStore((s) => s.variationIntensity);
  const eraserRadius = useRendererStore((s) => s.eraserRadius);
  const setValue = useRendererStore((s) => s.setValue);

  // Selected tool mirrors the real paint mode.
  const tool = MODE_TO_TOOL[paintMode];

  // Skin colors for the palette; refreshed when the settings unfold. The
  // palette starts collapsed to one batch; the trailing tile unfolds the rest.
  const COLLAPSED_SWATCH_COUNT = 11;
  const [swatches, setSwatches] = useState<string[]>([]);
  // Remember whether the palette was left expanded across reopen/reload — it's
  // a pure UI preference, so it lives in its own localStorage key rather than
  // the renderer config (adding it to the persisted schema would risk resetting
  // saved configs that predate the key).
  const [paletteExpanded, setPaletteExpanded] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(PALETTE_EXPANDED_KEY) === "1";
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      PALETTE_EXPANDED_KEY,
      paletteExpanded ? "1" : "0",
    );
  }, [paletteExpanded]);
  useEffect(() => {
    if (expanded && getUniqueColors) {
      setSwatches(getUniqueColors());
    }
  }, [expanded, getUniqueColors, paintColor]);

  const hiddenCount = Math.max(0, swatches.length - COLLAPSED_SWATCH_COUNT);
  const baseSwatches = swatches.slice(0, COLLAPSED_SWATCH_COUNT);
  const extraSwatches = swatches.slice(COLLAPSED_SWATCH_COUNT);
  const renderSwatch = (c: string, i: number) => {
    // Skin colors can carry alpha as #RRGGBBAA; split it like the desktop
    // palette does so paintColor stays a 6-digit hex and the alpha lands in
    // paintAlpha instead of being silently dropped by the paint path.
    const hex = c.slice(0, 7);
    const selected = hex.toLowerCase() === paintColor.toLowerCase();
    return (
      <button
        key={`${c}-${i}`}
        type="button"
        aria-label={c}
        onClick={() => {
          setValue("paintColor", hex);
          setValue("paintAlpha", hexToAlpha(c));
          setValue("colorPickerActive", false);
        }}
        className={cn("h-[29px] w-[29px]", swatchClass(selected))}
        style={swatchStyle(c)}
      />
    );
  };
  // A single-color skin makes the palette pure noise — the header chip already
  // shows that color, so the swatch row only earns its space from two colors up.
  const showPalette = swatches.length > 1;

  const selectTool = (id: ToolId) => {
    setValue("paintMode", TOOL_TO_MODE[id]);
    setValue("colorPickerActive", false);
  };

  return (
    <>
      {/* Tools — always visible; morphs 5-up ↔ 2-col as settings unfold. The
          eraser rides the row as the 5th tile when folded and stretches into
          its own full-width row once the grid narrows to 2 columns. */}
      <div
        className="grid gap-[9px] transition-[grid-template-columns] duration-300 ease-out"
        style={{
          gridTemplateColumns: expanded ? "1fr 1fr" : "repeat(5, 1fr)",
        }}
      >
        {DRAWER_TOOLS.map(({ id, icon: Icon, labelKey }) => {
          const isActive = tool === id;
          const fullRow = expanded && id === "eraser";
          return (
            <button
              key={id}
              type="button"
              onClick={() => selectTool(id)}
              style={fullRow ? { gridColumn: "1 / -1" } : undefined}
              className={cn(
                "flex cursor-pointer items-center rounded-2xl px-1 transition-colors duration-150",
                fullRow
                  ? "flex-row justify-center gap-[9px] py-[13px]"
                  : "flex-col gap-[7px] pb-[11px] pt-[14px]",
                isActive
                  ? "bg-blue-500 text-white shadow-md dark:bg-blue-600"
                  : "bg-black/[0.04] text-neutral-600 dark:bg-white/[0.05] dark:text-neutral-400",
              )}
            >
              <Icon className="h-[23px] w-[23px]" />
              <span className="text-center text-[11.5px] font-semibold leading-none tracking-tight">
                {dict.toolbar[labelKey]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Rich settings — unfold under the chevron. */}
      <motion.div
        initial={false}
        animate={{
          height: expanded ? "auto" : 0,
          opacity: expanded ? 1 : 0,
          marginTop: expanded ? 20 : 0,
        }}
        transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
        /* -mx-1 widens this clip box by the ring's 4px; px-1 pads the content
           back in place, so the selected swatch ring stays inside the clip. */
        className="-mx-1 overflow-hidden"
      >
        <motion.div
          className="flex flex-col gap-[18px] pt-0 p-1"
          variants={SETTINGS_LIST}
          initial={false}
          animate={expanded ? "open" : "closed"}
        >
          {/* Symmetry: mirrors every stroke onto the model's other side. Kept
              directly under the tool row so it reads as a brush-wide toggle. */}
          <motion.div
            variants={SETTINGS_ROW}
            className="border-b border-black/[0.06] pb-[18px] dark:border-white/[0.07]"
          >
            <button
              type="button"
              onClick={() => setValue("mirrorPaint", !mirrorPaint)}
              aria-pressed={mirrorPaint}
              className={cn(
                "flex h-[50px] w-full cursor-pointer items-center gap-[10px] rounded-[14px] border px-[14px] transition-colors",
                mirrorPaint
                  ? "border-blue-500/55 bg-blue-500/[0.16] text-blue-500 dark:text-blue-300"
                  : "border-black/10 bg-black/[0.04] text-neutral-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-neutral-400",
              )}
            >
              <SymmetryIcon className="h-[19px] w-[19px] flex-none" />
              <span className="flex-1 text-left text-[13px] font-semibold">
                {dict.toolbar.symmetry}
              </span>
            </button>
          </motion.div>

          {/* Fill radius (bucket only). */}
          {tool === "bucket" && (
            <motion.div variants={SETTINGS_ROW}>
              <Slider
                label={dict.toolbar.radius}
                editKey="bulk-radius"
                value={bulkPaintRadius}
                min={0}
                max={8}
                step={1}
                formatValue={(v) =>
                  Math.round(v) === 0 ? "Face" : `${Math.round(v)} px`
                }
                onChange={(v) => setValue("bulkPaintRadius", v)}
              />
            </motion.div>
          )}
          {/* Variation intensity (shading only). */}
          {tool === "shading" && (
            <motion.div variants={SETTINGS_ROW}>
              <Slider
                label={dict.toolbar.intensity}
                editKey="variation-intensity"
                value={variationIntensity}
                min={1}
                max={MAX_VARIATION_STEPS}
                step={1}
                formatValue={(v) => `${v}`}
                onChange={(v) => setValue("variationIntensity", v)}
              />
            </motion.div>
          )}
          {/* Brush size (eraser only). Radius 0 clears a single texel; each
              step widens the disc by one texel per side, so the readout shows
              the resulting diameter. */}
          {tool === "eraser" && (
            <motion.div variants={SETTINGS_ROW}>
              <Slider
                label={dict.toolbar.size}
                editKey="eraser-size"
                value={eraserRadius}
                min={0}
                max={8}
                step={1}
                formatValue={(v) => `${Math.round(v) * 2 + 1} px`}
                onChange={(v) => setValue("eraserRadius", v)}
              />
            </motion.div>
          )}

          {/* Color */}
          <motion.div variants={SETTINGS_ROW}>
            <div
              className={cn(
                "flex items-center justify-between px-1",
                showPalette && "mb-[11px]",
              )}
            >
              <span className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-200">
                {dict.toolbar.color}
              </span>
              <div className="flex items-center gap-[9px]">
                <span className="text-[11.5px] tracking-wide tabular-nums text-neutral-400 dark:text-neutral-500">
                  {paintColor.toUpperCase()}
                </span>
                <div
                  className="h-[26px] w-[26px] rounded-lg border-2 border-black/10 dark:border-white/15"
                  style={swatchStyle(paintColor)}
                />
              </div>
            </div>
            {showPalette && (
              // One wrapping grid so the toggle always trails the swatches:
              // base tiles first, the overflow tiles pop in after them, and
              // the +N/chevron toggle stays the last item in either state.
              // Fixed 29px tracks + space-between spread the leftover width
              // into the gaps, so the outer columns stay flush with both
              // edges (flex-wrap piled the remainder on the trailing edge,
              // leaving the grid off-axis from the color chip in RTL).
              <div className="grid grid-cols-[repeat(auto-fill,29px)] justify-between gap-[9px]">
                {baseSwatches.map(renderSwatch)}
                <AnimatePresence initial={false}>
                  {paletteExpanded &&
                    extraSwatches.map((c, i) => (
                      <motion.div
                        key={`extra-${c}-${i}`}
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{
                          duration: 0.18,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="h-[29px] w-[29px]"
                      >
                        {renderSwatch(c, i + COLLAPSED_SWATCH_COUNT)}
                      </motion.div>
                    ))}
                </AnimatePresence>
                {hiddenCount > 0 && (
                  <button
                    type="button"
                    aria-label={
                      paletteExpanded
                        ? dict.toolbar.showFewerColors
                        : dict.toolbar.showAllColors
                    }
                    aria-expanded={paletteExpanded}
                    onClick={() => setPaletteExpanded((e) => !e)}
                    className="flex h-[29px] min-w-[29px] cursor-pointer items-center justify-center rounded-[9px] border border-black/10 bg-black/[0.04] px-1 text-neutral-500 transition-colors hover:bg-black/[0.08] dark:border-white/15 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10"
                  >
                    {paletteExpanded ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 15l-6-6-6 6" />
                      </svg>
                    ) : (
                      <span className="text-[11px] font-semibold leading-none tabular-nums">
                        +{hiddenCount}
                      </span>
                    )}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
};

interface BrushFlyoutProps {
  side: "left" | "right";
  tooltipSide: "left" | "right";
  getUniqueColors?: () => string[];
}

/**
 * Grouped brush slot: one rail button that reveals the brush variants and the
 * active brush's options. On desktop this is a side popover anchored to the
 * rail; on touch it becomes the "2a" bottom sheet — tools always up, rich
 * settings unfolding under a chevron.
 */
const BrushFlyout: React.FC<BrushFlyoutProps> = ({
  side,
  tooltipSide,
  getUniqueColors,
}) => {
  const { dictionary: dict } = useDictionary();
  const paintMode = useRendererStore((s) => s.paintMode);
  const colorPickerActive = useRendererStore((s) => s.colorPickerActive);
  const setValue = useRendererStore((s) => s.setValue);
  const isTouch = useIsTouch();
  const [open, setOpen] = useState(false);
  // vaul only understands plain "###px" snap strings (no env()/calc()), so
  // measure the home-indicator inset once and fold it into the folded height
  // to keep real bottom padding under the tool row on notched phones.
  const [snapFolded, setSnapFolded] = useState(`${SNAP_FOLDED_HEIGHT}px`);
  useEffect(() => {
    const probe = document.createElement("div");
    probe.style.cssText =
      "position:fixed;visibility:hidden;padding-bottom:env(safe-area-inset-bottom,0px)";
    document.body.appendChild(probe);
    const inset = parseFloat(getComputedStyle(probe).paddingBottom) || 0;
    probe.remove();
    if (inset > 0) setSnapFolded(`${SNAP_FOLDED_HEIGHT + inset}px`);
  }, []);
  // 2a: the sheet snaps between two heights — folded shows just the tool row,
  // expanded reveals the settings kit. Dragging the sheet or tapping the
  // chevron moves between them; the snap survives close/reopen so the sheet
  // comes back at whichever height it was last left at.
  const [snap, setSnap] = useState<number | string | null>(SNAP_EXPANDED);
  const expanded = snap !== snapFolded;
  const setExpanded = (next: boolean) =>
    setSnap(next ? SNAP_EXPANDED : snapFolded);

  const isSlotMode = SLOT_TOOLS.some((b) => b.mode === paintMode);
  const slotActive = isSlotMode && !colorPickerActive;
  const current = SLOT_TOOLS.find((b) => b.mode === paintMode) ?? SLOT_TOOLS[0];
  const CurrentIcon = current.icon;

  const selectBrush = (mode: SlotMode) => {
    setValue("paintMode", mode);
    setValue("colorPickerActive", false);
  };

  const activateSlot = () => {
    // First tap also (re)activates the group's brush.
    if (!slotActive) selectBrush(current.mode);
  };

  // vaul's release rules are velocity-first: a slow drag only changes snap
  // when it crosses the halfway point between snaps, and dismissal isn't a
  // snap at all — so deliberate-but-slow gestures spring back. We decide from
  // the finger instead: any downward travel past the tolerance folds an
  // expanded sheet or closes a folded one, no matter how slow, and ending
  // with the sheet dragged below half the folded height always closes. The
  // fold is deferred a frame because vaul re-asserts the current snap
  // synchronously during its own release handling.
  const COLLAPSE_TOLERANCE_PX = 80;
  const gestureStart = useRef<{
    x: number;
    y: number;
    snap: typeof snap;
  } | null>(null);
  // Capture-phase press + window-level release so the gesture is judged even
  // when a child swallows the events or iOS fires pointercancel mid-drag
  // (long-pressing text used to do exactly that, leaving dead zones).
  const onSheetPress = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.isPrimary) return;
    const sheet = e.currentTarget;
    gestureStart.current = { x: e.pageX, y: e.pageY, snap };
    const end = (ev: PointerEvent) => {
      window.removeEventListener("pointerup", end, true);
      window.removeEventListener("pointercancel", end, true);
      const start = gestureStart.current;
      gestureStart.current = null;
      if (!start) return;
      const pulledDown = ev.pageY - start.y;
      const visible = window.innerHeight - sheet.getBoundingClientRect().top;
      // Mostly-vertical guard keeps slider scrubs from reading as a pull.
      const deliberatePull =
        pulledDown > COLLAPSE_TOLERANCE_PX &&
        pulledDown > Math.abs(ev.pageX - start.x);
      if (
        visible < parseInt(snapFolded) / 2 ||
        (start.snap !== SNAP_EXPANDED && deliberatePull)
      ) {
        setOpen(false);
      } else if (start.snap === SNAP_EXPANDED && deliberatePull) {
        requestAnimationFrame(() => setSnap(snapFolded));
      }
    };
    window.addEventListener("pointerup", end, true);
    window.addEventListener("pointercancel", end, true);
  };

  // --- Mobile: 2a bottom sheet ---------------------------------------------
  if (isTouch) {
    return (
      <Drawer
        open={open}
        onOpenChange={setOpen}
        snapPoints={[snapFolded, SNAP_EXPANDED]}
        activeSnapPoint={snap}
        setActiveSnapPoint={setSnap}
        // Non-modal so the canvas stays interactive behind the sheet — vaul
        // drops the overlay and keeps outside taps from dismissing it.
        modal={false}
        // A drag that starts with a slight upward wobble sets vaul's
        // scroll-lock timestamp, which every later pointermove refreshes while
        // the sheet sits at the top snap — eating the whole gesture. Nothing
        // in this sheet scrolls, so the debounce protects nothing.
        scrollLockTimeout={0}
        // Without this, a fast flick down from expanded skips the folded snap
        // and dismisses outright; sequential snapping makes the first collapse
        // always land on the folded tool row.
        snapToSequentialPoint
      >
        <DrawerTrigger asChild>
          <ToolButton
            label={dict.toolbar.brush}
            active={slotActive}
            grouped
            onClick={activateSlot}
          >
            <CurrentIcon className="h-full w-full" />
          </ToolButton>
        </DrawerTrigger>
        <DrawerContent
          // select-none + no touch callout: vaul only disables selection on
          // fine-pointer devices, so on iOS a slow drag over any text starts
          // the system text-selection gesture, pointercancels the drag, and
          // turns every label into a dead zone.
          className="mx-auto h-full max-w-md select-none data-[vaul-drawer-direction=bottom]:max-h-[93%]"
          style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none" }}
          onPointerDownCapture={onSheetPress}
        >
          {/* touch-none is load-bearing: this div is a scroll container, and
              the browser claims vertical pans for it (pointercancel) despite
              vaul's touch-action:none on the sheet root — turning the whole
              content area into a drag dead zone. */}
          <div
            className={cn(
              "min-h-0 flex-1 touch-none px-[18px] pt-3",
              expanded ? "overflow-y-auto" : "overflow-hidden",
            )}
            style={{
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)",
            }}
          >
            {/* Header: title + chevron that folds the settings away. */}
            <div className="mb-[15px] flex items-center justify-between px-1">
              <DrawerTitle className="text-[17px] font-bold tracking-tight">
                {dict.toolbar.brushes}
              </DrawerTitle>
              <div className="flex items-center gap-[9px]">
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  aria-expanded={expanded}
                  aria-label={dict.common?.settings ?? "Settings"}
                  className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[11px] text-neutral-500 transition-colors bg-black/[0.05] hover:bg-black/[0.09] dark:bg-white/[0.07] dark:text-neutral-400 dark:hover:bg-white/[0.12]"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-300"
                    style={{
                      transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={dict.common?.close ?? "Close"}
                  className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[11px] text-neutral-500 transition-colors bg-black/[0.05] hover:bg-black/[0.09] dark:bg-white/[0.07] dark:text-neutral-400 dark:hover:bg-white/[0.12]"
                >
                  <Close className="h-[18px] w-[18px]" />
                </button>
              </div>
            </div>
            <MobileBrushPanel
              expanded={expanded}
              getUniqueColors={getUniqueColors}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // --- Desktop: side popover ------------------------------------------------
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Popover.Trigger asChild>
              <ToolButton
                label={dict.toolbar.brush}
                active={slotActive}
                grouped
                onClick={() => {
                  activateSlot();
                  setOpen((o) => !o);
                }}
              >
                <CurrentIcon className="h-full w-full" />
              </ToolButton>
            </Popover.Trigger>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="rounded-md bg-neutral-900 px-2 py-1 text-sm text-white shadow-md dark:bg-neutral-700"
              side={tooltipSide}
              sideOffset={8}
              hidden={open}
            >
              {dict.toolbar.brushes}
              <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-700" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>

      <AnimatePresence>
        {open && (
          <Popover.Portal forceMount>
            <Popover.Content
              side={side}
              align="start"
              sideOffset={12}
              collisionPadding={12}
              asChild
            >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.94,
                  x: side === "right" ? -8 : 8,
                }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.94, x: side === "right" ? -8 : 8 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "z-50 w-70 max-w-[calc(100vw-1.5rem)] origin-left select-none rounded-lg p-3",
                  "border border-neutral-300 bg-neutral-50 shadow-lg",
                  "dark:border-neutral-700 dark:bg-neutral-800 dark:shadow-2xl",
                )}
              >
                {/* Header */}
                <div className="mb-3 flex items-center justify-between px-1">
                  <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-white">
                    {dict.toolbar.brushes}
                  </h3>
                  <Popover.Close
                    aria-label={dict.common?.close ?? "Close"}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                  >
                    <Close className="h-4 w-4" />
                  </Popover.Close>
                </div>

                <BrushPanel slotActive={slotActive} />
              </motion.div>
            </Popover.Content>
          </Popover.Portal>
        )}
      </AnimatePresence>
    </Popover.Root>
  );
};

export default BrushFlyout;
