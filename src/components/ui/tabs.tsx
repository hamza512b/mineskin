import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-neutral-100 p-1 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

/**
 * A horizontally scrollable TabsList that reveals left/right arrow buttons
 * whenever the tabs overflow their container. The native scrollbar is hidden;
 * users can scroll via the arrows, wheel, drag, or keyboard.
 */
const ScrollableTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const updateArrows = React.useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    // Allow a 1px tolerance for sub-pixel rounding. Under RTL, browsers use the
    // spec-compliant negative-scrollLeft model: 0 at the right (start) edge down
    // to -maxScroll at the left edge, so the physical-arrow thresholds invert.
    if (getComputedStyle(el).direction === "rtl") {
      setCanScrollLeft(scrollLeft > -maxScroll + 1);
      setCanScrollRight(scrollLeft < -1);
    } else {
      setCanScrollLeft(scrollLeft > 1);
      setCanScrollRight(scrollLeft < maxScroll - 1);
    }
  }, []);

  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const observer = new ResizeObserver(updateArrows);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      observer.disconnect();
    };
  }, [updateArrows, children]);

  const scrollBy = (direction: 1 | -1) => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * el.clientWidth * 0.75,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative min-w-0">
      {canScrollLeft && (
        <button
          type="button"
          aria-label="Scroll tabs left"
          tabIndex={-1}
          onClick={() => scrollBy(-1)}
          className="absolute left-0 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md bg-neutral-100/90 text-neutral-600 shadow-sm backdrop-blur-sm hover:bg-neutral-200 dark:bg-neutral-800/90 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      <div
        ref={viewportRef}
        className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <TabsPrimitive.List
          ref={ref}
          className={cn(
            "inline-flex h-10 w-max items-center justify-center rounded-md bg-neutral-100 p-1 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
            className,
          )}
          {...props}
        >
          {children}
        </TabsPrimitive.List>
      </div>
      {canScrollRight && (
        <button
          type="button"
          aria-label="Scroll tabs right"
          tabIndex={-1}
          onClick={() => scrollBy(1)}
          className="absolute right-0 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md bg-neutral-100/90 text-neutral-600 shadow-sm backdrop-blur-sm hover:bg-neutral-200 dark:bg-neutral-800/90 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});
ScrollableTabsList.displayName = "ScrollableTabsList";

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-neutral-950 data-[state=active]:shadow-sm dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-800 dark:data-[state=active]:bg-neutral-950 dark:data-[state=active]:text-neutral-50",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-800",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, ScrollableTabsList, TabsTrigger, TabsContent };
