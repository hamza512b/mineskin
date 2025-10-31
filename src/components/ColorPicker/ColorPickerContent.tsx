import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import clsx from "clsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { hexToHsv } from "./colorUtils";
import { ColorChooser } from "./ColorChooser";

export interface ColorPickerContentProps {
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
  } = props;
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
          <ColorChooser {...props} />
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
