import React from "react";

export interface TutorialStep {
  id: string;
  title: string;
  content: React.ReactNode;
  target: string;
  placement?: "top" | "bottom" | "left" | "right";
}

const isMac =
  typeof window !== "undefined" &&
  window.navigator.userAgent.includes("Macintosh");
const cmdKey = isMac ? "⌘" : "Ctrl";

export const steps: TutorialStep[] = [
  {
    id: "intro",
    title: "Welcome to the Editor!",
    content:
      "This quick tutorial will walk you through the basic editing features.",
    target: '[data-tutorial-id="main"]',
    placement: "bottom",
  },
  {
    id: "pen-tool",
    title: "Drawing Tool",
    content: (
      <p>
        This is your main drawing tool. Use the <strong>Pen tool</strong> to
        draw on your skin pixel by pixel.
      </p>
    ),
    target: '[data-tutorial-id="pen-tool"]',
    placement: "right",
  },
  {
    id: "eraser-tool",
    title: "Erasing Tool",
    content: (
      <>
        <p>
          Use the <strong>Eraser</strong> to remove pixels from your skin.
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Note: The eraser will erase from both layers of the skin at once if
          they are visible.
        </p>
      </>
    ),
    target: '[data-tutorial-id="eraser-tool"]',
    placement: "right",
  },
  {
    id: "undo-redo",
    title: "Undo and Redo",
    content: `Made a mistake? No worries! You can easily undo and redo your actions. You can use the buttons or keyboard shortcuts (${cmdKey}+Z for undo, ${cmdKey}+Shift+Z for redo).`,
    target: '[data-tutorial-id="undo-redo-tools"]',
    placement: "right",
  },
  {
    id: "color-picker",
    title: "Color Picker",
    content:
      "Click on the color swatch to open the color picker. You can choose any color you want from the picker, or select from the palette of colors already used in your skin.",
    target: '[data-tutorial-id="color-picker-tools"]',
    placement: "right",
  },
  {
    id: "part-filter-desktop",
    title: "Body Part Visibility",
    content:
      "Here you can toggle the visibility of different body parts for both layers. This is useful for editing parts that are hard to reach.",
    target: '[data-tutorial-id="desktop-part-filter"]',
    placement: "bottom",
  },
  {
    id: "part-filter-mobile",
    title: "Body Part Visibility",
    content:
      "Click this button to open the visibility settings. You can toggle the visibility of different body parts for both layers.",
    target: '[data-tutorial-id="mobile-part-filter"]',
    placement: "right",
  },
  {
    id: "finish",
    title: "You're all set!",
    content:
      "That's it for the basics! For more advanced features and information, please refer to our manuals. Happy skin editing!",
    target: '[data-tutorial-id="main"]',
    placement: "bottom",
  },
];
