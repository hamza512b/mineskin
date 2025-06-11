import { ReloadIcon } from "@radix-ui/react-icons";
import * as Tooltip from "@radix-ui/react-tooltip";
import React from "react";
import ColorPicker from "../../components/ColorPicker/ColorPicker";
import IconButton from "../../components/IconButton/IconButton";
import {
  ColorPickerIcon,
  EraserIcon,
  GearIcon,
  PaintCanIcon,
  PartsFilterIcon,
  PenToolIcon,
  VariationIcon
} from "../../components/Icons/Icons";
import { FloatingToolbarProps, cmdKey } from "./Toolbar";

export const ToolbarContent: React.FC<
  FloatingToolbarProps & {
    dialogOpen: boolean;
    setDialogOpen: (open: boolean) => void;
  }
> = ({
  redo, undo, redoCount, undoCount, setColorPickerActive, colorPickerActive, setPaintMode, paintMode, settingsOpen, setSettingsOpen, getUniqueColors, mode, paintColor, setValues, dialogOpen, setDialogOpen,
}) => {
    return (
      <>
        {mode === "Editing" && (
          <>
            <div className="space-y-2">
              <ColorPicker
                value={paintColor}
                onChange={(color) => setValues("paintColor", color)}
                label="Color picker"
                id="color-picker"
                getUniqueColors={getUniqueColors} />

              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <div>
                      <IconButton
                        label="Color picker"
                        onClick={() => setColorPickerActive(!colorPickerActive)}
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
                    <div>
                      <IconButton
                        label="Eraser"
                        onClick={() => {
                          setPaintMode("eraser");
                          setColorPickerActive(false);
                        }}
                        active={paintMode === "eraser" && !colorPickerActive}
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
                        active={paintMode === "variation" && !colorPickerActive}
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
            <div className="space-y-2">
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <div>
                      <IconButton
                        label="Undo"
                        onClick={undo || (() => { })}
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
                      Undo <span className="text-gray-400">({cmdKey}+Z)</span>
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
                        onClick={redo || (() => { })}
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
                      <span className="text-gray-400">({cmdKey}+Shift+Z)</span>
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
      </>
    );
  };
