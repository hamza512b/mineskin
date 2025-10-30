import animations from "@/core/animations";
import { useRendererStore } from "@/hooks/useRendererState";
import { ReloadIcon } from "@radix-ui/react-icons";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Tooltip from "@radix-ui/react-tooltip";
import clsx from "clsx";
import React, { useCallback, useEffect, useState } from "react";
import ColorPicker from "../../components/ColorPicker/ColorPicker";
import Dropdown, { DropdownItem } from "../../components/Dropdown";
import IconButton from "../../components/IconButton/IconButton";
import {
  AnimationIcon,
  ColorPickerIcon,
  EraserIcon,
  GearIcon,
  GridIcon,
  PaintCanIcon,
  PartsFilterIcon,
  PenToolIcon,
  VariationIcon,
} from "../../components/Icons/Icons";
import { PartFilterDialog } from "../PartFilterDialog/PartFilterDialog";

const isMac =
  typeof window !== "undefined" &&
  window.navigator.userAgent.includes("Macintosh");
const cmdKey = isMac ? "⌘" : "Ctrl";

interface FloatingToolbarProps {
  redo: (() => void) | undefined;
  undo: (() => void) | undefined;
  redoCount: number;
  undoCount: number;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  getUniqueColors: () => string[];

  // Animation props (only used in Preview mode)
  availableAnimations?: {
    name: string;
    label: string;
  }[];
  currentAnimation?: string | null;
  onAnimationSelect?: (animation: string | null) => void;
  mode: "Editing" | "Preview";
}

const Toolbar: React.FC<FloatingToolbarProps> = ({
  redo,
  undo,
  redoCount,
  undoCount,
  settingsOpen,
  setSettingsOpen,
  getUniqueColors,
  currentAnimation = null,
  onAnimationSelect,
  mode,
}) => {
  const colorPickerActive = useRendererStore(
    (state) => state.values.colorPickerActive,
  );
  const paintMode = useRendererStore((state) => state.values.paintMode);
  const gridVisible = useRendererStore((state) => state.values.gridVisible);
  const handleChange = useRendererStore((state) => state.handleChange);

  const setColorPickerActive = useCallback(
    (active: boolean) => {
      handleChange("colorPickerActive", active);
    },
    [handleChange],
  );

  const setPaintMode = useCallback(
    (mode: "pixel" | "bulk" | "eraser" | "variation") => {
      handleChange("paintMode", mode);
    },
    [handleChange],
  );

  const toggleGrid = useCallback(() => {
    handleChange("gridVisible", !gridVisible);
  }, [handleChange, gridVisible]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (dialogOpen && settingsOpen) {
      setSettingsOpen(false);
    }
  }, [dialogOpen, settingsOpen, setSettingsOpen]);

  return (
    <div className="absolute top-0 left-0 mt-2 ml-2 transform bg-gray-50 dark:bg-gray-800 rounded-lg items-center gap-2 shadow-lg border border-gray-300 dark:border-gray-transparent dark:border-gray-700 dark:shadow-none">
      <ScrollArea.Root className="max-h-[calc(100dvh-80px)] h-min overflow-y-auto">
        <ScrollArea.Viewport>
          <div className="p-2">
            {mode === "Editing" && (
              <>
                <div
                  className="space-y-2"
                  data-tutorial-id="color-picker-tools"
                >
                  <ColorPicker
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
                          Color p<span className="underline">i</span>cker{" "}
                          <span className="text-gray-400">(I)</span>
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
                        <div data-tutorial-id="pen-tool">
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
                          <span className="underline">P</span>en tool{" "}
                          <span className="text-gray-400">(P)</span>
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
                          B<span className="underline">u</span>lk paint{" "}
                          <span className="text-gray-400">(U)</span>
                          <Tooltip.Arrow className="fill-gray-800" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>

                  <Tooltip.Provider>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <div data-tutorial-id="eraser-tool">
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
                          <span className="underline">E</span>raser{" "}
                          <span className="text-gray-400">(E)</span>
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
                            label="Variation/shading"
                            onClick={() => {
                              setPaintMode("variation");
                              setColorPickerActive(false);
                            }}
                            active={
                              paintMode === "variation" && !colorPickerActive
                            }
                          >
                            <VariationIcon className="w-full h-full dark:text-white" />
                          </IconButton>
                        </div>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="bg-gray-800 text-white px-2 py-1 rounded text-sm shadow-md"
                          side="right"
                          sideOffset={5}
                        >
                          <span className="underline">V</span>ariation/Shading{" "}
                          <span className="text-gray-400">(V)</span>
                          <Tooltip.Arrow className="fill-gray-800" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                </div>
                <hr className="w-full h-px bg-gray-200 dark:bg-gray-700 rounded-full my-2 opacity-10"></hr>
                <div className="space-y-2" data-tutorial-id="undo-redo-tools">
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
              {mode === "Preview" && onAnimationSelect && (
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Dropdown
                      trigger={
                        <Tooltip.Trigger asChild>
                          <IconButton
                            active={currentAnimation !== null}
                            label={"Animations"}
                          >
                            <div className="w-6 h-6">
                              <AnimationIcon className="w-full h-full dark:text-white" />
                            </div>
                          </IconButton>
                        </Tooltip.Trigger>
                      }
                      align="start"
                      side="right"
                    >
                      <DropdownItem
                        onClick={() => onAnimationSelect(null)}
                        className={
                          currentAnimation === null
                            ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium"
                            : ""
                        }
                      >
                        No Animation
                      </DropdownItem>
                      {animations.map((animation) => (
                        <DropdownItem
                          key={animation.name}
                          onClick={() => onAnimationSelect(animation.name)}
                          className={clsx(
                            currentAnimation === animation.name
                              ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium"
                              : "",
                            "capitalize",
                          )}
                        >
                          {animation.label}
                        </DropdownItem>
                      ))}
                    </Dropdown>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="bg-gray-800 text-white px-2 py-1 rounded text-sm shadow-md"
                        side="right"
                        sideOffset={5}
                      >
                        Animations
                        <Tooltip.Arrow className="fill-gray-800" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              )}
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <div data-tutorial-id="mobile-part-filter">
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

              {mode === "Editing" && (
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div>
                        <IconButton
                          label="Grid"
                          onClick={() => toggleGrid()}
                          active={gridVisible}
                        >
                          <GridIcon className="w-full h-full dark:text-white" />
                        </IconButton>
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="bg-gray-800 text-white px-2 py-1 rounded text-sm shadow-md"
                        side="right"
                        sideOffset={5}
                      >
                        Grid
                        <Tooltip.Arrow className="fill-gray-800" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              )}

              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <div>
                      <IconButton
                        label="Settings"
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
                      Settings
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

      <PartFilterDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default React.memo(Toolbar);
