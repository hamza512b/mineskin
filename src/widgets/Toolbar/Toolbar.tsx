import useMediaQuery from "@/hooks/useMediaQuery";
import { FormValues } from "@/hooks/useRendererState";
import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import React, { useEffect, useRef, useState } from "react";
import { Mode } from "../ActionBar/ActionBar";
import { PartFilterDialog } from "../PartFilterDialog/PartFilterDialog";
import { ToolbarContent } from "./ToolbarContent";

const isMac =
  typeof window !== "undefined" &&
  window.navigator.userAgent.includes("Macintosh");
export const cmdKey = isMac ? "⌘" : "Ctrl";

if (typeof window !== "undefined") {
  document.addEventListener("gesturestart", function (e) {
    e.preventDefault(); // Prevent gesture
  });
}

export interface FloatingToolbarProps {
  redo: (() => void) | undefined;
  undo: (() => void) | undefined;
  redoCount: number;
  undoCount: number;

  setColorPickerActive: (active: boolean) => void;
  colorPickerActive: boolean;
  setPaintMode: (mode: "pixel" | "bulk" | "eraser" | "variation") => void;
  paintMode: "pixel" | "bulk" | "eraser" | "variation";
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

const Toolbar: React.FC<FloatingToolbarProps> = (props) => {
  const {
    setValues,
    settingsOpen,
    setSettingsOpen,
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
  } = props;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [dialogOpen, setDialogOpen] = useState(false);
  useEffect(() => {
    if (dialogOpen && settingsOpen) {
      setSettingsOpen(false);
    }
  }, [dialogOpen, settingsOpen, setSettingsOpen]);

  // Handle touch events for dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setIsDragging(true);
    setDragStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isMobile) return;
    const currentX = e.touches[0].clientX;
    const diff = dragStartX - currentX;

    // Collapse if dragged left more than 25px with haptic feedback if available
    if (diff > 25 && !isCollapsed) {
      setIsCollapsed(true);
      setIsDragging(false);
      // Add haptic feedback if supported
      if (navigator.vibrate) {
        navigator.vibrate(50); // Short vibration
      }
    }
    // Expand if dragged right more than 25px with haptic feedback if available
    else if (diff < -25 && isCollapsed) {
      setIsCollapsed(false);
      setIsDragging(false);
      // Add haptic feedback if supported
      if (navigator.vibrate) {
        navigator.vibrate(50); // Short vibration
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Toggle collapsed state (only active on mobile)
  const toggleCollapsed = () => {
    if (!isMobile) return;
    setIsCollapsed(!isCollapsed);
    // Add haptic feedback if supported
    if (navigator.vibrate) {
      navigator.vibrate(50); // Short vibration
    }
  };

  return (
    <div
      ref={toolbarRef}
      className={`absolute top-0 left-0 mt-2 ml-2 transform bg-gray-50 dark:bg-gray-800 rounded-lg items-center gap-2 shadow-lg border border-gray-300 dark:border-gray-transparent dark:border-gray-700 dark:shadow-none transition-all duration-300 rounded-r-none ${isCollapsed ? "toolbar-collapsed" : ""}`}
      style={{
        transform:
          isMobile && isCollapsed ? "translateX(-85%)" : "translateX(0)",
      }}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
    >
      <div className="absolute -right-6 -bottom-px transform z-10 md:hidden">
        <button
          onClick={toggleCollapsed}
          className={`flex items-center justify-center w-6 h-16 bg-gray-50 dark:bg-gray-800 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-700 shadow-md transition-all duration-300 ${isCollapsed ? "bg-opacity-95 dark:bg-opacity-95" : ""}`}
          aria-label={isCollapsed ? "Expand toolbar" : "Collapse toolbar"}
        >
          <ChevronRightIcon
            className={cn(
              "w-5 h-5 dark:text-white text-gray-700",
              isCollapsed ? "" : "rotate-180`",
            )}
          />
        </button>
      </div>
      <ScrollArea.Root className="max-h-[calc(100dvh-80px)] h-min overflow-y-auto">
        <ScrollArea.Viewport>
          <div className="p-2">
            <ToolbarContent
              {...props}
              dialogOpen={dialogOpen}
              setDialogOpen={setDialogOpen}
            />
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
