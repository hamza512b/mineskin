import * as Dialog from "@radix-ui/react-dialog";
import * as Popover from "@radix-ui/react-popover";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import ColorPickerContent from "./ColorPickerContent";
import { hexToHsv, hsvToHex } from "./colorUtils";
import useMediaQuery from "../../hooks/useMediaQuery";
import { Renderer } from "../../core/Renderer";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
  id: string;
  renderer: Renderer | null;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  label,
  id,
  renderer,
}) => {
  const [open, setOpen] = useState(false);
  const [hsv, setHsv] = useState(() => hexToHsv(value));
  const [visualPosition, setVisualPosition] = useState(() => ({
    hue: hexToHsv(value).h,
    s: hexToHsv(value).s,
    v: hexToHsv(value).v,
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

  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (!isDragging && !recentlyDraggedRef.current) {
      const newHSV = hexToHsv(value);
      setHsv(newHSV);
      setVisualPosition({ hue: newHSV.h, s: newHSV.s, v: newHSV.v });
      if (newHSV.s > 0 && newHSV.v > 0) setLastValidHue(newHSV.h);
      setHexInput(hsvToHex(newHSV));
      setInputError("");
    }
  }, [value, isDragging]);

  useEffect(() => {
    if (open && renderer) {
      setUniqueColors(renderer.getUniqueColors());
    }
  }, [open, renderer]);

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
    isMobile,
    setOpen,
    onChange,
    isDragging,
    setDragging: setIsDragging,
    setRecentlyDragged,
    uniqueColors,
    selectedTab,
    setSelectedTab,
  };

  return (
    <div className="w-8 h-8 mx-auto">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      {isMobile ? (
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button
              id={id}
              type="button"
              className="w-8 h-8 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:ring-2 hover:ring-blue-500/10 transition-all"
              style={{ backgroundColor: hsvToHex(hsv) }}
              aria-label="Choose color"
            />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 dark:bg-black/50 bg-white/50 backdrop-blur-sm z-50"
                onClick={() => setOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content
              asChild
              className="fixed inset-x-0 p-4 bottom-0 flex flex-col z-50 dark:bg-slate-900 bg-slate-100 rounded-t-xl border-t border-slate-700 size-dvh"
              onPointerDownOutside={(e) => e.preventDefault()}
              onInteractOutside={(e) => e.preventDefault()}
            >
              <motion.div
                className="w-full h-full overflow-auto overscroll-contain"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              >
                <ColorPickerContent {...commonProps} />
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      ) : (
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <button
              id={id}
              type="button"
              className="w-8 h-8 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:ring-2 hover:ring-blue-500/10 transition-all"
              style={{ backgroundColor: hsvToHex(hsv) }}
              aria-label="Choose color"
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
                <Popover.Arrow className="fill-current dark:text-slate-900 text-blue-50 scale-200" />
                <div className="p-4 dark:bg-slate-900 bg-blue-50 rounded-lg w-80 max-w-full dark:border dark:border-slate-700">
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
