import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { useDictionary } from "@/i18n";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { hexToHsv, hexToRgb } from "./colorUtils";
import { ColorChooser } from "./ColorChooser";
import { ColorSwatch } from "./ColorSwatch";

function parseColorString(color: string): {
  hex: string;
  alpha: number;
  cssColor: string;
} {
  const hex = color.slice(0, 7);
  const alpha = color.length === 9 ? parseInt(color.slice(7, 9), 16) : 255;
  const rgb = hexToRgb(hex);
  const cssColor = rgb
    ? `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha / 255})`
    : hex;
  return { hex, alpha, cssColor };
}

export interface ColorPickerContentProps {
  hsv: { h: number; s: number; v: number };
  setHsv: React.Dispatch<
    React.SetStateAction<{ h: number; s: number; v: number }>
  >;
  visualPosition: { hue: number; s: number; v: number; a: number };
  setVisualPosition: React.Dispatch<
    React.SetStateAction<{ hue: number; s: number; v: number; a: number }>
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
  onAlphaChange: (alpha: number) => void;
  isDragging: boolean;
  setDragging: React.Dispatch<React.SetStateAction<boolean>>;
  setRecentlyDragged: React.Dispatch<React.SetStateAction<boolean>>;
  uniqueColors?: string[];
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

const ColorPickerContent: React.FC<ColorPickerContentProps> = (props) => {
  const {
    setHsv,
    setVisualPosition,
    lastValidHue,
    setLastValidHue,
    hexInput,
    setHexInput,
    isMobile,
    onChange,
    uniqueColors = [],
    selectedTab,
    setSelectedTab,
    onAlphaChange,
  } = props;
  const { dictionary: dict } = useDictionary();

  // We render the active panel ourselves (a motion.div instead of Radix
  // Tabs.Content, to get the directional slide), so we own the tab↔panel
  // ARIA wiring Radix would otherwise generate.
  const tabsId = React.useId();
  const tabId = (tab: string) => `${tabsId}-tab-${tab}`;
  const panelId = (tab: string) => `${tabsId}-panel-${tab}`;

  const handleColorSelect = (color: string) => {
    const { hex, alpha } = parseColorString(color);
    const newHSV = hexToHsv(hex);
    if (newHSV.s === 0 || newHSV.v === 0) newHSV.h = lastValidHue;
    else setLastValidHue(newHSV.h);
    setHsv(newHSV);
    setVisualPosition((prev) => ({
      ...prev,
      hue: newHSV.h,
      s: newHSV.s,
      v: newHSV.v,
      a: (alpha / 255) * 100,
    }));
    setHexInput(hex);
    onChange(hex);
    onAlphaChange(alpha);
  };

  return (
    <div
      className="md:rounded-lg h-full md:h-auto w-full max-w-full flex flex-col select-none safe-area-pl safe-area-pr"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4 md:hidden">
        <h2 className="text-lg font-medium dark:text-neutral-100 text-neutral-900">
          {dict.colorPicker.chooseColor}
        </h2>
        {isMobile && (
          <Dialog.Close asChild>
            <button
              className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-neutral-100 py-2 rounded-md font-medium transition-colors px-4 cursor-pointer hover:bg-blue-600 hover:ring-2 hover:ring-blue-600 text-neutral-900 bg-blue-100"
              autoFocus
            >
              {dict.common.close}
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
          <TabsTrigger
            value="picker"
            id={tabId("picker")}
            aria-controls={panelId("picker")}
          >
            {dict.colorPicker.colorPickerTab}
          </TabsTrigger>
          <TabsTrigger
            value="palette"
            id={tabId("palette")}
            aria-controls={panelId("palette")}
          >
            {dict.colorPicker.paletteTab}
          </TabsTrigger>
        </TabsList>

        {/* Radix owns tab selection (triggers + a11y); we render the active
            panel through AnimatePresence so switching slides + crossfades. Both
            initial and exit read the same expression so the incoming panel
            enters from one side while the outgoing panel leaves toward the
            other — a consistent directional slide. */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selectedTab}
              role="tabpanel"
              id={panelId(selectedTab)}
              aria-labelledby={tabId(selectedTab)}
              initial={{ opacity: 0, x: selectedTab === "palette" ? 16 : -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: selectedTab === "palette" ? 16 : -16 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              {selectedTab === "picker" ? (
                <ColorChooser {...props} />
              ) : (
                <>
                  <ScrollArea className="h-full md:h-125">
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(32px,1fr))] pointer-fine:grid-cols-[repeat(auto-fill,minmax(28px,1fr))] gap-2 p-2">
                      {uniqueColors.map((color) => {
                        const { hex, cssColor } = parseColorString(color);
                        return (
                          <ColorSwatch
                            key={color}
                            color={cssColor}
                            selected={hex === hexInput}
                            className="w-full aspect-square transition-all focus:outline-none hover:ring-2 hover:ring-blue-600"
                            onClick={() => handleColorSelect(color)}
                            aria-label="Select color"
                          />
                        );
                      })}
                    </div>
                  </ScrollArea>
                  <div className="md:hidden h-8 w-full bg-transparent" />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  );
};

export default React.memo(ColorPickerContent);
