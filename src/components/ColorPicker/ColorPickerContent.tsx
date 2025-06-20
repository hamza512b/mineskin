import * as Dialog from "@radix-ui/react-dialog";
import clsx from "clsx";
import React, { ChangeEvent, useCallback, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { expandShorthand, hexToHsv, hsvToHex } from "./colorUtils";
import { cn } from "@/lib/utils";

interface ColorPickerContentProps {
  hsv: { h: number; s: number; v: number };
  setHsv: React.Dispatch<
    React.SetStateAction<{ h: number; s: number; v: number }>
  >;
  visualPosition: { hue: number; s: number; v: number };
  setVisualPosition: React.Dispatch<
    React.SetStateAction<{ hue: number; s: number; v: number }>
  >;
  lastValidHue: number;
  setLastValidHue: React.Dispatch<React.SetStateAction<number>>;
  hexInput: string;
  setHexInput: React.Dispatch<React.SetStateAction<string>>;
  inputError: string;
  setInputError: React.Dispatch<React.SetStateAction<string>>;
  isMobile: boolean;
  setOpen: (open: boolean) => void;
  onChange: (color: string) => void;
  isDragging: boolean;
  setDragging: React.Dispatch<React.SetStateAction<boolean>>;
  setRecentlyDragged: React.Dispatch<React.SetStateAction<boolean>>;
  uniqueColors?: string[];
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

const ColorPickerContent: React.FC<ColorPickerContentProps> = ({
  hsv,
  setHsv,
  visualPosition,
  setVisualPosition,
  lastValidHue,
  setLastValidHue,
  hexInput,
  setHexInput,
  inputError,
  setInputError,
  isMobile,
  onChange,
  setDragging,
  setRecentlyDragged,
  uniqueColors = [],
  selectedTab,
  setSelectedTab,
}) => {
  const updateSV = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const s = Math.min(
      Math.max(((e.clientX - rect.left) / rect.width) * 100, 0),
      100,
    );
    const v = Math.min(
      Math.max(100 - ((e.clientY - rect.top) / rect.height) * 100, 0),
      100,
    );
    setVisualPosition((prev) => ({ ...prev, s, v }));
    setHsv((prev) => {
      const newHSV = { h: s === 0 || v === 0 ? lastValidHue : prev.h, s, v };
      const newHex = hsvToHex(newHSV);
      setHexInput(newHex);
      onChange(newHex);
      return newHSV;
    });
  };

  const handleSVPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    updateSV(e);
  };
  const handleSVPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 1) updateSV(e);
  };
  const handleSVPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
    setRecentlyDragged(true);
    setTimeout(() => setRecentlyDragged(false), 100);
  };

  const update = useCallback(
    (type: "h" | "s" | "v", e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
      const percentage = (x / rect.width) * 100;
      const buffer = 0;
      const constrainedPercentage = Math.min(
        Math.max(percentage, buffer),
        100 - buffer,
      );
      setVisualPosition((prev) => ({
        ...prev,
        [type === "h" ? "hue" : type]:
          constrainedPercentage * (type === "h" ? 3.6 : 1),
      }));
      setHsv((prev) => {
        const newHSV = {
          ...prev,
          [type]: constrainedPercentage * (type === "h" ? 3.6 : 1),
        };
        const newHex = hsvToHex(newHSV);
        setHexInput(newHex);
        onChange(newHex);
        return newHSV;
      });
    },
    [setHsv, setVisualPosition],
  );

  const updateHue = (e: React.PointerEvent<HTMLDivElement>) => {
    update("h", e);
  };

  const updateSaturation = (e: React.PointerEvent<HTMLDivElement>) => {
    update("s", e);
  };

  const updateLightness = (e: React.PointerEvent<HTMLDivElement>) => {
    update("v", e);
  };

  const handleHexInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const str = e.target.value;
    const corrected = `#${str.replace(/[^0-9A-Fa-f]/g, "")}`;
    setHexInput(corrected);
  };

  const handleHexInputConfirm = () => {
    let newHex = hexInput;
    if (/^#([0-9A-Fa-f]{3})$/.test(newHex)) newHex = expandShorthand(newHex);
    const isValid = /^#([0-9A-Fa-f]{6})$/.test(newHex);
    if (!isValid && newHex.length > 0) {
      setInputError("Invalid hex code");
      setHexInput(hsvToHex(hsv));
    } else {
      setInputError("");
      if (isValid) {
        const newHSV = hexToHsv(newHex);
        if (newHSV.s === 0 || newHSV.v === 0) newHSV.h = lastValidHue;
        else setLastValidHue(newHSV.h);
        setHsv(newHSV);
        onChange(newHex.toUpperCase());
      }
    }
  };

  const handleHexInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleHexInputConfirm();
    else if (e.key === "Escape") {
      setHexInput(hsvToHex(hsv));
      setInputError("");
    }
  };

  const handleColorSelect = (color: string) => {
    const newHSV = hexToHsv(color);
    if (newHSV.s === 0 || newHSV.v === 0) newHSV.h = lastValidHue;
    else setLastValidHue(newHSV.h);
    setHsv(newHSV);
    setVisualPosition({ hue: newHSV.h, s: newHSV.s, v: newHSV.v });
    setHexInput(color);
    onChange(color);
  };

  return (
    <div
      className="md:rounded-lg md:w-80 w-full h-full md:h-auto max-w-full flex flex-col select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4 md:hidden">
        <h2 className="text-lg font-medium dark:text-slate-100 text-slate-900">
          Choose Color
        </h2>
        {isMobile && (
          <Dialog.Close asChild>
            <button
              className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-slate-100 py-2 rounded-md font-medium transition-colors px-4 cursor-pointer hover:bg-blue-600 hover:ring-2 hover:ring-blue-600 text-slate-900 bg-blue-100"
              autoFocus
            >
              Close
            </button>
          </Dialog.Close>
        )}
      </div>

      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="picker">Color Picker</TabsTrigger>
          <TabsTrigger value="palette">Palette</TabsTrigger>
        </TabsList>

        <TabsContent value="picker" className="space-y-4">
          <div className="mb-4 md:flex-grow-0">
            <label className="block text-sm dark:text-slate-300 text-slate-900 mb-2 font-semibold">
              Saturation & Lightness
            </label>
            <div
              className="relative w-full aspect-square rounded-lg cursor-pointer focus:outline-none border-none"
              style={{
                backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
                touchAction: "none",
              }}
              onPointerDown={handleSVPointerDown}
              onPointerMove={handleSVPointerMove}
              onPointerUp={handleSVPointerUp}
              role="slider"
              tabIndex={0}
              aria-label="Saturation and Value selector"
            >
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white to-transparent" />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black to-transparent" />
              <div
                className="absolute w-4 h-4 rounded-lg border-2 dark:border-white border-slate-700 outline-none ring-1 ring-black"
                style={{
                  left: `${visualPosition.s}%`,
                  top: `${100 - visualPosition.v}%`,
                  transform: "translate(-50%, -50%)",
                  backgroundColor: hsvToHex(hsv),
                }}
                aria-hidden="true"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <PickerSlider
              setDragging={setDragging}
              update={updateHue}
              setRecentlyDragged={setRecentlyDragged}
              visualPosition={visualPosition}
              type="h"
            />

            <PickerSlider
              setDragging={setDragging}
              update={updateSaturation}
              setRecentlyDragged={setRecentlyDragged}
              visualPosition={visualPosition}
              type="s"
            />

            <PickerSlider
              setDragging={setDragging}
              update={updateLightness}
              setRecentlyDragged={setRecentlyDragged}
              visualPosition={visualPosition}
              type="v"
            />
          </div>
          <div>
            <label
              htmlFor="hexInput"
              className="block text-sm dark:text-slate-300 text-slate-900 mb-1 font-semibold"
            >
              Hex Code
            </label>
            <input
              id="hexInput"
              type="text"
              value={hexInput}
              onChange={handleHexInputChange}
              onBlur={handleHexInputConfirm}
              onKeyDown={handleHexInputKeyDown}
              placeholder="#FFFFFF"
              className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800 bg-slate-100 dark:text-slate-100 text-slate-900 select-text font-mono ${
                inputError ? "border-red-500" : "border-slate-700"
              } hover:border-slate-600`}
            />
            {inputError && (
              <p className="text-xs dark:text-red-500 text-red-700 mt-1 select-none">
                {inputError}
              </p>
            )}
            <p className="text-xs dark:text-slate-400 text-slate-700 mt-1">
              {isMobile
                ? "Tap to confirm"
                : "Press Enter to confirm or Escape to cancel"}
            </p>
          </div>
          <div className="md:hidden h-8 w-full bg-transparent" />
        </TabsContent>

        <TabsContent value="palette" className="space-y-4">
          <div className="grid grid-cols-8 gap-2 p-2 h-full md:max-h-[500px] overflow-y-auto">
            {uniqueColors.map((color) => (
              <button
                key={color}
                className={clsx(
                  "w-full aspect-square rounded-lg border border-slate-700 focus:outline-none focus:ring-2  hover:ring-2 hover:ring-blue-600 transition-all dark:border-slate-700 cursor-pointer",
                  {
                    "ring-2 ring-blue-600": color === hexInput,
                  },
                )}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
          <div className="md:hidden h-8 w-full bg-transparent" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default React.memo(ColorPickerContent);

const PickerSlider = React.memo(
  ({
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
  }) => {
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
  },
);
