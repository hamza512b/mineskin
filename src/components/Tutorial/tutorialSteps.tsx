
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

export const steps: TutorialStep[] = [
  {
    id: "intro",
    title: "Welcome to the Mineskin.pro editor!",
    content:
      "This quick tutorial will walk you through the basic editing features of Mineskin.pro.",
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
          Note: The eraser will erase the top layer of the skin if both are
          active.
        </p>
      </>
    ),
    target: '[data-tutorial-id="eraser-tool"]',
    placement: "right",
  },
  {
    id: "undo-redo",
    title: "Undo and Redo",
    content: (
      <>
        <p>
          Made a mistake? No worries! You can easily undo and redo your actions
          here.{" "}
          {isMobile
            ? ""
            : ` You can also use the keyboard shortcuts (${isMac ? "⌘ + Shift + Z or  ⌘ + Z" : "Ctrl + Y or Ctrl + Z"})`}
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Note: The undo/redo actions are not persistent after reload.
        </p>
      </>
    ),
    target: '[data-tutorial-id="undo-redo-tools"]',
    placement: "right",
  },
  {
    id: "color-picker",
    title: "Color Picker",
    content:
      "You can choose any color you want from the picker, or select from the palette of colors already used in your skin.",
    target: '[data-tutorial-id="color-picker-tools"]',
    placement: "right",
  },
  {
    id: "part-filter-desktop",
    title: "Body Part Visibility",
    content:
      "Here you can toggle the visibility of different body parts for both layers. This is useful for editing parts that are hard to reach.",
    target: '[data-tutorial-id="desktop-part-filter"]',
    placement: "left",
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
    title: "You're all set 🎉!",
    content: (
      <p>
        That&apos;s it for the basics! For more advanced features and information,
        you can refer to the{" "}
        <a
          href="https://github.com/hamza512b/mineskin/blob/main/USAGE_GUIDE.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          usage guide
        </a>
        . Happy skin editing!
      </p>
    ),
  },
];
