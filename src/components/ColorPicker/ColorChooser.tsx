import React, { useRef, useEffect, useCallback, ChangeEvent } from "react";
import { ColorPickerContentProps } from "./ColorPickerContent";
import { hsvToHex, expandShorthand, hexToHsv } from "./colorUtils";
import { PickerSlider } from "./PickerSlider";

export const ColorChooser: React.FC<ColorPickerContentProps> = ({
  hsv, setHsv, visualPosition, setVisualPosition, lastValidHue, setLastValidHue, hexInput, setHexInput, inputError, setInputError, isMobile, onChange, setDragging, setRecentlyDragged,
}) => {
  const svCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = svCanvasRef.current;
    if (!c) return;
    c.width = c.clientWidth;
    c.height = c.clientWidth;
    const ctx = c.getContext("2d")!;
    const { width, height } = c;

    const gradH = ctx.createLinearGradient(0, 0, width, 0);
    gradH.addColorStop(0, "#fff");
    gradH.addColorStop(1, `hsl(${hsv.h},100%,50%)`);
    ctx.fillStyle = gradH;
    ctx.fillRect(0, 0, width, height);

    const gradV = ctx.createLinearGradient(0, 0, 0, height);
    gradV.addColorStop(0, "rgba(0,0,0,0)");
    gradV.addColorStop(1, "#000");
    ctx.fillStyle = gradV;
    ctx.fillRect(0, 0, width, height);
  }, [hsv, visualPosition]);

  const handleSVPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    updateSV(e);
  };
  const handleSVPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.buttons === 1) updateSV(e);
  };
  const handleSVPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
    setRecentlyDragged(true);
    setTimeout(() => setRecentlyDragged(false), 100);
  };

  const updateSV = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const s = Math.min(
      Math.max(((e.clientX - rect.left) / rect.width) * 100, 0),
      100
    );
    const v = Math.min(
      Math.max(100 - ((e.clientY - rect.top) / rect.height) * 100, 0),
      100
    );
    setVisualPosition((prev) => ({ ...prev, s, v }));
    setHsv((prev) => {
      const newHSV = { ...prev, s, v };
      const newHex = hsvToHex(newHSV);
      setHexInput(newHex);
      onChange(newHex);
      return newHSV;
    });
  };

  const update = useCallback(
    (type: "h" | "s" | "v", e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
      const percentage = (x / rect.width) * 100;
      const constrainedPercentage = Math.min(Math.max(percentage, 0), 100);
      setVisualPosition((prev) => ({
        ...prev,
        [type === "h" ? "hue" : type]: constrainedPercentage * (type === "h" ? 3.6 : 1),
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
    [setHsv, setVisualPosition]
  );

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
  return (
    <>
      <div className="mb-4 md:flex-grow-0">
        <label className="block text-sm dark:text-slate-300 text-slate-900 mb-2 font-semibold">
          Saturation & Lightness
        </label>
        <div className="relative w-full aspect-square">
          <canvas
            ref={svCanvasRef}
            className="w-full h-full absolute inset-0 rounded-lg cursor-pointer"
            onPointerDown={handleSVPointerDown}
            onPointerMove={handleSVPointerMove}
            onPointerUp={handleSVPointerUp}
            role="slider"
            tabIndex={0}
            aria-label="Saturation and Value selector" />
          <div
            className="absolute w-4 h-4 rounded-lg border-2 dark:border-white border-slate-700 outline-none ring-1 ring-black"
            style={{
              left: `${visualPosition.s}%`,
              top: `${100 - visualPosition.v}%`,
              transform: "translate(-50%, -50%)",
              backgroundColor: hsvToHex(hsv),
              pointerEvents: "none", // allow canvas to receive pointer
            }}
            aria-hidden="true" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <PickerSlider
          setDragging={setDragging}
          update={(e) => update("h", e)}
          setRecentlyDragged={setRecentlyDragged}
          visualPosition={visualPosition}
          type="h" />
        <PickerSlider
          setDragging={setDragging}
          update={(e) => update("s", e)}
          setRecentlyDragged={setRecentlyDragged}
          visualPosition={visualPosition}
          type="s"
          className="hidden md:flex" />
        <PickerSlider
          setDragging={setDragging}
          update={(e) => update("v", e)}
          setRecentlyDragged={setRecentlyDragged}
          visualPosition={visualPosition}
          type="v"
          className="hidden md:flex" />
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
          className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800 bg-slate-100 dark:text-slate-100 text-slate-900 select-text font-mono ${inputError ? "border-red-500" : "border-slate-700"} hover:border-slate-600`} />
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
    </>
  );
};
