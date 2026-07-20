import * as Popover from "@radix-ui/react-popover";
import { motion } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useIsTouch from "../../hooks/useIsTouch";
import { useRendererStore } from "../../store";
import ColorPickerContent from "./ColorPickerContent";
import {
  expandShorthand,
  hexToAlpha,
  hexToHsv,
  hexToRgb,
  hsvToHex,
} from "./colorUtils";
import { useDictionary } from "@/i18n/DictionaryContext";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface ColorPickerProps {
  label: string;
  id: string;
  getUniqueColors: (() => string[]) | undefined;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  id,
  getUniqueColors,
}) => {
  const value = useRendererStore((state) => state.paintColor);
  const alpha = useRendererStore((state) => state.paintAlpha);
  const setValue = useRendererStore((state) => state.setValue);
  const { dictionary } = useDictionary();

  const onChange = useCallback(
    (color: string) => {
      setValue("paintColor", color);
    },
    [setValue],
  );

  const onAlphaChange = useCallback(
    (a: number) => {
      setValue("paintAlpha", a);
    },
    [setValue],
  );
  const [open, setOpen] = useState(false);
  const [hsv, setHsv] = useState(() => hexToHsv(value));
  const [visualPosition, setVisualPosition] = useState(() => ({
    hue: hexToHsv(value).h,
    s: hexToHsv(value).s,
    v: hexToHsv(value).v,
    a: (alpha / 255) * 100,
  }));
  const [lastValidHue, setLastValidHue] = useState(hexToHsv(value).h);
  const [hexInput, setHexInput] = useState(value);
  const [inputError, setInputError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uniqueColors, setUniqueColors] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState("picker");
  const recentlyDraggedRef = useRef(false);
  const [recentlyDragged, setRecentlyDragged] = useState(false);

  useEffect(() => {
    recentlyDraggedRef.current = recentlyDragged;
  }, [recentlyDragged]);

  const isCoarse = useIsTouch();

  useEffect(() => {
    if (!isDragging && !recentlyDraggedRef.current) {
      const newHSV = hexToHsv(value);
      setHsv(newHSV);
      setVisualPosition({
        hue: newHSV.h,
        s: newHSV.s,
        v: newHSV.v,
        a: (alpha / 255) * 100,
      });
      if (newHSV.s > 0 && newHSV.v > 0) setLastValidHue(newHSV.h);
      setHexInput(hsvToHex(newHSV, alpha));
      setInputError("");
    }
  }, [value, alpha, isDragging]);

  useEffect(() => {
    if (open && getUniqueColors) {
      setUniqueColors(getUniqueColors());
    }
  }, [open, getUniqueColors]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        let newHex = hexInput;
        if (/^#([0-9A-Fa-f]{3})$/.test(newHex))
          newHex = expandShorthand(newHex);
        if (/^#([0-9A-Fa-f]{4})$/.test(newHex))
          newHex = expandShorthand(newHex);
        if (/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(newHex)) {
          const parsedAlpha = hexToAlpha(newHex);
          const rgbHex = newHex.slice(0, 7);
          const newHSV = hexToHsv(rgbHex);
          if (newHSV.s === 0 || newHSV.v === 0) newHSV.h = lastValidHue;
          else setLastValidHue(newHSV.h);
          setHexInput(hsvToHex(newHSV, parsedAlpha));
          setHsv(newHSV);
          onChange(hsvToHex(newHSV));
          onAlphaChange(parsedAlpha);
        } else {
          setHexInput(hsvToHex(hsv, alpha));
        }
        setInputError("");
      }
      setOpen(newOpen);
    },
    [hexInput, hsv, lastValidHue, onChange, onAlphaChange, alpha],
  );

  const buttonHex = hsvToHex(hsv);
  const buttonRgb = hexToRgb(buttonHex);
  const buttonColor = buttonRgb
    ? `rgba(${buttonRgb.r},${buttonRgb.g},${buttonRgb.b},${alpha / 255})`
    : buttonHex;

  const commonProps = {
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
    isMobile: isCoarse,
    setOpen,
    onChange,
    onAlphaChange,
    isDragging,
    setDragging: setIsDragging,
    setRecentlyDragged,
    uniqueColors,
    selectedTab,
    setSelectedTab,
  };

  const swatchStyle = {
    backgroundImage: `linear-gradient(${buttonColor}, ${buttonColor}), repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%)`,
    backgroundSize: "100% 100%, 8px 8px",
  };

  return (
    <div className="w-8 h-8 mx-auto">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      {isCoarse ? (
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerTrigger asChild>
            <button
              id={id}
              type="button"
              className="w-8 h-8 rounded-lg border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:ring-2 hover:ring-blue-500/10 transition-all"
              style={swatchStyle}
              aria-label={dictionary.colorPicker.chooseColor}
            />
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh] safe-area-pb">
            <DrawerHeader className="sr-only">
              <DrawerTitle>{dictionary.colorPicker.chooseColor}</DrawerTitle>
            </DrawerHeader>
            <DrawerBody className="p-4">
              <ColorPickerContent {...commonProps} />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      ) : (
        <Popover.Root open={open} onOpenChange={handleOpenChange}>
          <Popover.Trigger asChild>
            <button
              id={id}
              type="button"
              className="w-8 h-8 rounded-lg border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:ring-2 hover:ring-blue-500/10 transition-all"
              style={swatchStyle}
              aria-label={dictionary.colorPicker.chooseColor}
            />
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content sideOffset={8} align="start" asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.2 }}
                className="drop-shadow-lg"
              >
                <Popover.Arrow className="fill-current dark:text-neutral-900 text-blue-50 scale-200" />
                <div className="p-4 dark:bg-neutral-900 bg-blue-50 rounded-lg w-80 max-w-full dark:border dark:border-neutral-700">
                  <ColorPickerContent {...commonProps} />
                </div>
              </motion.div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      )}
    </div>
  );
};

export default ColorPicker;
