import React, { useRef, useEffect, useCallback, ChangeEvent } from "react";
import { useDictionary } from "@/i18n";
import { ColorPickerContentProps } from "./ColorPickerContent";
import { hsvToHex, expandShorthand, hexToHsv, hexToAlpha } from "./colorUtils";
import { PickerSlider } from "./PickerSlider";
import useIsTouch from "@/hooks/useIsTouch";

export const ColorChooser: React.FC<ColorPickerContentProps> = ({
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
  onAlphaChange,
  setDragging,
  setRecentlyDragged,
}) => {
  const { dictionary: dict } = useDictionary();
  const svCanvasRef = useRef<HTMLCanvasElement>(null);
  const isInternalUpdateRef = useRef(false);
  const isCoarse = useIsTouch();
  // Call onChange when HSV changes internally (not from external prop sync)
  useEffect(() => {
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      onChange(hsvToHex(hsv));
    }
  }, [hsv, onChange]);

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

  const LONG_PRESS_MS = 250;
  const svGestureRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    captured: boolean;
    longPressTimer: ReturnType<typeof setTimeout> | null;
  } | null>(null);

  const clearLongPress = () => {
    const g = svGestureRef.current;
    if (g?.longPressTimer != null) {
      clearTimeout(g.longPressTimer);
      g.longPressTimer = null;
    }
  };

  const handleSVPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Mouse / pen → capture immediately, they don't compete with scrolling.
    if (e.pointerType !== "touch") {
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
      svGestureRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        lastY: e.clientY,
        captured: true,
        longPressTimer: null,
      };
      updateSV(e);
      return;
    }
    // Touch → defer: long-press OR horizontal-dominant movement claims it.
    const target = e.currentTarget;
    const gesture: NonNullable<typeof svGestureRef.current> = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      captured: false,
      longPressTimer: null,
    };
    gesture.longPressTimer = setTimeout(() => {
      const g = svGestureRef.current;
      if (!g || g.captured) return;
      g.longPressTimer = null;
      try {
        target.setPointerCapture(g.pointerId);
      } catch {
        return;
      }
      g.captured = true;
      setDragging(true);
      updateSVAt(g.lastX, g.lastY);
    }, LONG_PRESS_MS);
    svGestureRef.current = gesture;
  };

  const handleSVPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const g = svGestureRef.current;
    if (!g || g.pointerId !== e.pointerId) return;
    g.lastX = e.clientX;
    g.lastY = e.clientY;
    if (!g.captured) {
      const dx = Math.abs(e.clientX - g.startX);
      const dy = Math.abs(e.clientY - g.startY);
      if (dx < 4 && dy < 4) return;
      clearLongPress();
      if (dx < dy) {
        // Vertical-dominant before long-press fired → yield to parent scroll.
        svGestureRef.current = null;
        return;
      }
      e.currentTarget.setPointerCapture(e.pointerId);
      g.captured = true;
      setDragging(true);
    }
    updateSV(e);
  };

  const endSVGesture = (
    e: React.PointerEvent<HTMLCanvasElement>,
    treatAsTap: boolean,
  ) => {
    const g = svGestureRef.current;
    if (!g || g.pointerId !== e.pointerId) return;
    clearLongPress();
    if (g.captured) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setDragging(false);
      setRecentlyDragged(true);
      setTimeout(() => setRecentlyDragged(false), 100);
    } else if (treatAsTap) {
      updateSV(e);
    }
    svGestureRef.current = null;
  };

  const handleSVPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    endSVGesture(e, true);
  };

  const handleSVPointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    endSVGesture(e, false);
  };

  const handleHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    clearLongPress();
    svGestureRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      captured: true,
      longPressTimer: null,
    };
    setDragging(true);
  };

  const handleHandlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = svGestureRef.current;
    if (!g || g.pointerId !== e.pointerId || !g.captured) return;
    g.lastX = e.clientX;
    g.lastY = e.clientY;
    updateSVAt(e.clientX, e.clientY);
  };

  const handleHandlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = svGestureRef.current;
    if (!g || g.pointerId !== e.pointerId) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDragging(false);
    setRecentlyDragged(true);
    setTimeout(() => setRecentlyDragged(false), 100);
    svGestureRef.current = null;
  };

  useEffect(() => {
    return () => {
      const g = svGestureRef.current;
      if (g?.longPressTimer != null) clearTimeout(g.longPressTimer);
    };
  }, []);

  const updateSVAt = (clientX: number, clientY: number) => {
    const c = svCanvasRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const s = Math.min(
      Math.max(((clientX - rect.left) / rect.width) * 100, 0),
      100,
    );
    const v = Math.min(
      Math.max(100 - ((clientY - rect.top) / rect.height) * 100, 0),
      100,
    );
    const alpha255 = Math.round((visualPosition.a / 100) * 255);
    setVisualPosition((prev) => ({ ...prev, s, v }));
    setHsv((prev) => {
      const newHSV = { ...prev, s, v };
      const newHex = hsvToHex(newHSV, alpha255);
      setHexInput(newHex);
      isInternalUpdateRef.current = true;
      return newHSV;
    });
  };

  const updateSV = (e: React.PointerEvent<HTMLCanvasElement>) => {
    updateSVAt(e.clientX, e.clientY);
  };

  const update = useCallback(
    (type: "h" | "s" | "v" | "a", e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
      const percentage = (x / rect.width) * 100;
      const constrainedPercentage = Math.min(Math.max(percentage, 0), 100);

      if (type === "a") {
        setVisualPosition((prev) => ({ ...prev, a: constrainedPercentage }));
        const newAlpha = Math.round((constrainedPercentage / 100) * 255);
        onAlphaChange(newAlpha);
        setHexInput(hsvToHex(hsv, newAlpha));
        return;
      }

      const alpha255 = Math.round((visualPosition.a / 100) * 255);
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
        const newHex = hsvToHex(newHSV, alpha255);
        setHexInput(newHex);
        isInternalUpdateRef.current = true;
        return newHSV;
      });
    },
    [setHsv, setVisualPosition, setHexInput, onAlphaChange, hsv, visualPosition.a],
  );

  const handleHexInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const str = e.target.value;
    const corrected = `#${str.replace(/[^0-9A-Fa-f]/g, "")}`;
    setHexInput(corrected);
  };

  const handleHexInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    const cleaned = pasted.replace(/[^0-9A-Fa-f]/g, "").slice(0, 8);
    if (cleaned.length > 0) {
      setHexInput(`#${cleaned}`);
    }
  };

  const handleHexInputConfirm = () => {
    let newHex = hexInput;
    if (/^#([0-9A-Fa-f]{3})$/.test(newHex)) newHex = expandShorthand(newHex);
    if (/^#([0-9A-Fa-f]{4})$/.test(newHex)) newHex = expandShorthand(newHex);
    const isValid = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(newHex);
    if (!isValid && newHex.length > 0) {
      setInputError(dict.colorPicker.invalidHexCode);
      const alpha255 = Math.round((visualPosition.a / 100) * 255);
      setHexInput(hsvToHex(hsv, alpha255));
    } else {
      setInputError("");
      if (isValid) {
        const parsedAlpha = hexToAlpha(newHex);
        const rgbHex = newHex.slice(0, 7);
        const newHSV = hexToHsv(rgbHex);
        if (newHSV.s === 0 || newHSV.v === 0) newHSV.h = lastValidHue;
        else setLastValidHue(newHSV.h);
        setHexInput(hsvToHex(newHSV, parsedAlpha));
        setVisualPosition((prev) => ({ ...prev, a: (parsedAlpha / 255) * 100 }));
        onAlphaChange(parsedAlpha);
        isInternalUpdateRef.current = true;
        setHsv(newHSV);
      }
    }
  };
  const handleHexInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleHexInputConfirm();
    else if (e.key === "Escape") {
      const alpha255 = Math.round((visualPosition.a / 100) * 255);
      setHexInput(hsvToHex(hsv, alpha255));
      setInputError("");
    }
  };

  const content = (
    <>
      <div className="mb-4 flex-1">
        <label className="block text-sm dark:text-neutral-300 text-neutral-900 mb-2 font-semibold">
          {dict.colorPicker.saturationLightness}
        </label>
        <div className="relative w-full aspect-square">
          <canvas
            ref={svCanvasRef}
            className="w-full h-full absolute inset-0 rounded-lg cursor-pointer"
            style={{ touchAction: "pan-y" }}
            onPointerDown={handleSVPointerDown}
            onPointerMove={handleSVPointerMove}
            onPointerUp={handleSVPointerUp}
            onPointerCancel={handleSVPointerCancel}
            role="slider"
            tabIndex={0}
            aria-label={dict.colorPicker.saturationValueSelector}
          />
          <div
            className="absolute w-6 h-6 rounded-lg border-2 dark:border-white border-neutral-700 outline-none ring-1 ring-black cursor-grab active:cursor-grabbing"
            style={{
              left: `${visualPosition.s}%`,
              top: `${100 - visualPosition.v}%`,
              transform: "translate(-50%, -50%)",
              backgroundColor: hsvToHex(hsv),
              touchAction: "none",
            }}
            onPointerDown={handleHandlePointerDown}
            onPointerMove={handleHandlePointerMove}
            onPointerUp={handleHandlePointerEnd}
            onPointerCancel={handleHandlePointerEnd}
            aria-hidden="true"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        <PickerSlider
          setDragging={setDragging}
          update={(e) => update("h", e)}
          setRecentlyDragged={setRecentlyDragged}
          visualPosition={visualPosition}
          type="h"
        />

        {!isCoarse && (
          <>
            <PickerSlider
              setDragging={setDragging}
              update={(e) => update("s", e)}
              setRecentlyDragged={setRecentlyDragged}
              visualPosition={visualPosition}
              type="s"
            />
            <PickerSlider
              setDragging={setDragging}
              update={(e) => update("v", e)}
              setRecentlyDragged={setRecentlyDragged}
              visualPosition={visualPosition}
              type="v"
            />
          </>
        )}
        <PickerSlider
          setDragging={setDragging}
          update={(e) => update("a", e)}
          setRecentlyDragged={setRecentlyDragged}
          visualPosition={visualPosition}
          type="a"
        />
      </div>
      <div className="mt-4">
        <label
          htmlFor="hexInput"
          className="block text-sm dark:text-neutral-300 text-neutral-900 mb-1 font-semibold"
        >
          {dict.colorPicker.hexCode}
        </label>
        <input
          id="hexInput"
          type="text"
          value={hexInput}
          onChange={handleHexInputChange}
          onPaste={handleHexInputPaste}
          onBlur={handleHexInputConfirm}
          onKeyDown={handleHexInputKeyDown}
          placeholder="#FFFFFF"
          className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-neutral-800 bg-neutral-100 dark:text-neutral-100 text-neutral-900 select-text font-mono ${inputError ? "border-red-500" : "border-neutral-700"} hover:border-neutral-600`}
        />
        {inputError && (
          <p className="text-xs dark:text-red-500 text-red-700 mt-1 select-none">
            {inputError}
          </p>
        )}
        <p className="text-xs dark:text-neutral-400 text-neutral-700 mt-1">
          {isMobile
            ? dict.colorPicker.tapToConfirm
            : dict.colorPicker.pressEnterToConfirm}
        </p>
        <div className="md:hidden h-8 w-full bg-transparent" />
      </div>
    </>
  );

  if (!isMobile) return <div className="flex flex-col">{content}</div>;

  return (
    <div className="flex flex-col sm:flex-row sm:justify-around gap-4 md:px-4">
      {content}
    </div>
  );
};
