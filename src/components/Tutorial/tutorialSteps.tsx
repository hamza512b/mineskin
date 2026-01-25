import { useDictionary } from "@/i18n";
import { useMemo } from "react";

export interface TutorialStep {
  id: string;
  title: string;
  content: React.ReactNode;
  target?: string;
  placement?: "top" | "bottom" | "left" | "right";
}

const isMac =
  typeof window !== "undefined" &&
  window.navigator.userAgent.includes("Macintosh");
const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

export function useTutorialSteps(): TutorialStep[] {
  const { dictionary: dict } = useDictionary();

  return useMemo(() => [
    {
      id: "intro",
      title: dict.tutorial.welcomeTitle,
      content: dict.tutorial.welcomeContent,
    },
    {
      id: "pen-tool",
      title: dict.tutorial.penToolTitle,
      content: (
        <p>
          {dict.tutorial.penToolContent}
        </p>
      ),
      target: '[data-tutorial-id="pen-tool"]',
      placement: "right",
    },
    {
      id: "eraser-tool",
      title: dict.tutorial.eraserTitle,
      content: (
        <>
          <p>
            {dict.tutorial.eraserContent}
          </p>
          <p className="mt-2 text-sm text-gray-400">
            {dict.tutorial.eraserNote}
          </p>
        </>
      ),
      target: '[data-tutorial-id="eraser-tool"]',
      placement: "right",
    },
    {
      id: "undo-redo",
      title: dict.tutorial.undoRedoTitle,
      content: (
        <>
          <p>
            {dict.tutorial.undoRedoContent}{" "}
            {isMobile
              ? ""
              : `${dict.tutorial.undoRedoShortcuts} (${isMac ? "⌘ + Shift + Z or ⌘ + Z" : "Ctrl + Y or Ctrl + Z"})`}
          </p>
          <p className="mt-2 text-sm text-gray-400">
            {dict.tutorial.undoRedoNote}
          </p>
        </>
      ),
      target: '[data-tutorial-id="undo-redo-tools"]',
      placement: "right",
    },
    {
      id: "color-picker",
      title: dict.tutorial.colorPickerTitle,
      content: dict.tutorial.colorPickerContent,
      target: '[data-tutorial-id="color-picker-tools"]',
      placement: "right",
    },
    {
      id: "part-filter-desktop",
      title: dict.tutorial.partFilterDesktopTitle,
      content: dict.tutorial.partFilterDesktopContent,
      target: '[data-tutorial-id="desktop-part-filter"]',
      placement: "left",
    },
    {
      id: "part-filter-mobile",
      title: dict.tutorial.partFilterMobileTitle,
      content: dict.tutorial.partFilterMobileContent,
      target: '[data-tutorial-id="mobile-part-filter"]',
      placement: "right",
    },
    {
      id: "finish",
      title: dict.tutorial.finishTitle,
      content: (
        <p>
          {dict.tutorial.finishContent}{" "}
          <a
            href="https://github.com/hamza512b/mineskin/blob/main/USAGE_GUIDE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {dict.detailPanel.usageGuide}
          </a>
          {dict.tutorial.finishContentEnd}
        </p>
      ),
    },
  ], [dict]);
}
