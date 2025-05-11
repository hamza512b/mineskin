import { FormValues } from "@/hooks/useRendererState";
import { ReloadIcon } from "@radix-ui/react-icons";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Tooltip from "@radix-ui/react-tooltip";
import React, { useEffect, useState } from "react";
import ColorPicker from "../../components/ColorPicker/ColorPicker";
import IconButton from "../../components/IconButton/IconButton";
import {
  ColorPickerIcon,
  EraserIcon,
  GearIcon,
  PaintCanIcon,
  PartsFilterIcon,
  PenToolIcon,
} from "../../components/Icons/Icons";
import { PartFilterDialog } from "../PartFilterDialog/PartFilterDialog";
import { Mode } from "../ActionBar/ActionBar";

const isMac =
  typeof window !== "undefined" &&
  window.navigator.userAgent.includes("Macintosh");
const cmdKey = isMac ? "⌘" : "Ctrl";

interface FloatingToolbarProps {
  redo: (() => void) | undefined;
  undo: (() => void) | undefined;
  redoCount: number;
  undoCount: number;

  setColorPickerActive: (active: boolean) => void;
  colorPickerActive: boolean;
  setPaintMode: (mode: "pixel" | "bulk" | "eraser") => void;
  paintMode: "pixel" | "bulk" | "eraser";
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  getUniqueColors: () => string[];
  mode: Mode;
  paintColor: string;
  setValues: (
    key: keyof FormValues,
    value: FormValues[keyof FormValues],
  ) => void;
  baseheadVisible: boolean;
  basebodyVisible: boolean;
  baseleftArmVisible: boolean;
  baserightArmVisible: boolean;
  baseleftLegVisible: boolean;
  baserightLegVisible: boolean;
  overlayheadVisible: boolean;
  overlaybodyVisible: boolean;
  overlayleftArmVisible: boolean;
  overlayrightArmVisible: boolean;
  overlayleftLegVisible: boolean;
  overlayrightLegVisible: boolean;
}

const Toolbar: React.FC<FloatingToolbarProps> = ({
  redo,
  undo,
  redoCount,
  undoCount,
  setColorPickerActive,
  colorPickerActive,
  setPaintMode,
  paintMode,
  settingsOpen,
  setSettingsOpen,
  getUniqueColors,
  mode,
  paintColor,
  setValues,
  baseheadVisible,
  basebodyVisible,
  baseleftArmVisible,
  baserightArmVisible,
  baseleftLegVisible,
  baserightLegVisible,
  overlayheadVisible,
  overlaybodyVisible,
  overlayleftArmVisible,
  overlayrightArmVisible,
  overlayleftLegVisible,
  overlayrightLegVisible,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (dialogOpen && settingsOpen) {
      setSettingsOpen(false);
    }
  }, [dialogOpen, settingsOpen, setSettingsOpen]);

  return (
    <div className="absolute top-0 left-0 mt-2 ml-2 transform bg-gray-50 dark:bg-gray-800 rounded-lg items-center gap-2 shadow-lg border border-gray-300 dark:border-gray-transparent dark:border-gray-700 dark:shadow-none">
      <ScrollArea.Root className="max-h-[calc(100dvh-30px)] h-min overflow-y-auto">
        <ScrollArea.Viewport>
          <div className="p-2">
            {mode === "Editing" && (
              <>
                <div className="space-y-2">
                  <ColorPicker
                    value={paintColor}
                    onChange={(color) => setValues("paintColor", color)}
                    label="Color picker"
                    id="color-picker"
                    getUniqueColors={getUniqueColors}
                  />

                  <Tooltip.Provider>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <div>
                          <IconButton
                            label="Color picker"
                            onClick={() =>
                              setColorPickerActive(!colorPickerActive)
                            }
                            active={colorPickerActive}
                          >
                            <ColorPickerIcon className="w-full h-full dark:text-white" />
                          </IconButton>
                        </div>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="bg-gray-800 text-white px-2 py-1 rounded text-sm shadow-md"
                          side="right"
                          sideOffset={5}
                        >
                          Color picker{" "}
                          <span className="text-gray-400">({cmdKey}+I)</span>
                          <Tooltip.Arrow className="fill-gray-800" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                </div>
                <hr className="w-full h-px bg-gray-200 dark:bg-gray-700 rounded-full my-2 opacity-10"></hr>
                <div className="space-y-2">
                  <Tooltip.Provider>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <div>
                          <IconButton
                            label="Pen tool"
                            onClick={() => {
                              setPaintMode("pixel");
                              setColorPickerActive(false);
                            }}
                            active={paintMode === "pixel" && !colorPickerActive}
                          >
                            <PenToolIcon className="w-full h-full dark:text-white" />
                          </IconButton>
                        </div>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="bg-gray-800 text-white px-2 py-1 rounded text-sm shadow-md"
                          side="right"
                          sideOffset={5}
                        >
                          Pen tool <span className="text-gray-400">(P)</span>
                          <Tooltip.Arrow className="fill-gray-800" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>

                  <Tooltip.Provider>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <div>
                          <IconButton
                            label="Bulk paint"
                            onClick={() => {
                              setPaintMode("bulk");
                              setColorPickerActive(false);
                            }}
                            active={paintMode === "bulk" && !colorPickerActive}
                          >
                            <PaintCanIcon className="w-full h-full dark:text-white" />
                          </IconButton>
                        </div>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="bg-gray-800 text-white px-2 py-1 rounded text-sm shadow-md"
                          side="right"
                          sideOffset={5}
                        >
                          Bulk paint <span className="text-gray-400">(U)</span>
                          <Tooltip.Arrow className="fill-gray-800" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>

                  <Tooltip.Provider>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <div>
                          <IconButton
                            label="Eraser"
                            onClick={() => {
                              setPaintMode("eraser");
                              setColorPickerActive(false);
                            }}
                            active={
                              paintMode === "eraser" && !colorPickerActive
                            }
                          >
                            <EraserIcon className="w-full h-full dark:text-white" />
                          </IconButton>
                        </div>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="bg-gray-800 text-white px-2 py-1 rounded text-sm shadow-md"
                          side="right"
                          sideOffset={5}
                        >
                          Eraser <span className="text-gray-400">(E)</span>
                          <Tooltip.Arrow className="fill-gray-800" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                </div>
                <hr className="w-full h-px bg-gray-200 dark:bg-gray-700 rounded-full my-2 opacity-10"></hr>
                <div className="space-y-2">
                  <Tooltip.Provider>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <div>
                          <IconButton
                            label="Undo"
                            onClick={undo || (() => {})}
                            disabled={undoCount === 0 && !!undo}
                          >
                            <ReloadIcon className="-scale-x-100 w-full h-full dark:text-white" />
                          </IconButton>
                        </div>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="bg-gray-800 text-white px-2 py-1 rounded text-sm shadow-md"
                          side="right"
                          sideOffset={5}
                        >
                          Undo{" "}
                          <span className="text-gray-400">({cmdKey}+Z)</span>
                          <Tooltip.Arrow className="fill-gray-800" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>

                  <Tooltip.Provider>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <div>
                          <IconButton
                            label="Redo"
                            onClick={redo || (() => {})}
                            disabled={redoCount === 0 && !!redo}
                          >
                            <ReloadIcon className="w-full h-full dark:text-white" />
                          </IconButton>
                        </div>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="bg-gray-800 text-white px-2 py-1 rounded text-sm shadow-md"
                          side="right"
                          sideOffset={5}
                        >
                          Redo{" "}
                          <span className="text-gray-400">
                            ({cmdKey}+Shift+Z)
                          </span>
                          <Tooltip.Arrow className="fill-gray-800" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                </div>
                <hr className="w-full h-px bg-gray-200 dark:bg-gray-700 rounded-full my-2 opacity-10"></hr>
              </>
            )}
            <div className="space-y-2">
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <div>
                      <IconButton
                        label="Parts Filter"
                        onClick={() => setDialogOpen(true)}
                        active={dialogOpen}
                      >
                        <PartsFilterIcon className="w-full h-full dark:text-white" />
                      </IconButton>
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-gray-800 text-white px-2 py-1 rounded text-sm shadow-md"
                      side="right"
                      sideOffset={5}
                    >
                      Parts Filter
                      <Tooltip.Arrow className="fill-gray-800" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>

              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <div>
                      <IconButton
                        label="Advanced settings"
                        onClick={() => setSettingsOpen(!settingsOpen)}
                        active={settingsOpen}
                      >
                        <GearIcon className="w-full h-full dark:text-white" />
                      </IconButton>
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-gray-800 text-white px-2 py-1 rounded text-sm shadow-md"
                      side="right"
                      sideOffset={5}
                    >
                      Advanced settings
                      <Tooltip.Arrow className="fill-gray-800" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="flex select-none touch-none p-0.5 bg-gray-100 dark:bg-gray-700 transition-colors duration-150 ease-out hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
          orientation="vertical"
        >
          <ScrollArea.Thumb className="flex-1 bg-gray-300 dark:bg-gray-500 rounded-full relative" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      <PartFilterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        baseheadVisible={baseheadVisible}
        basebodyVisible={basebodyVisible}
        baseleftArmVisible={baseleftArmVisible}
        baserightArmVisible={baserightArmVisible}
        baseleftLegVisible={baseleftLegVisible}
        baserightLegVisible={baserightLegVisible}
        overlayheadVisible={overlayheadVisible}
        overlaybodyVisible={overlaybodyVisible}
        overlayleftArmVisible={overlayleftArmVisible}
        overlayrightArmVisible={overlayrightArmVisible}
        overlayleftLegVisible={overlayleftLegVisible}
        overlayrightLegVisible={overlayrightLegVisible}
        setValues={setValues}
      />
    </div>
  );
};

export default React.memo(Toolbar);
