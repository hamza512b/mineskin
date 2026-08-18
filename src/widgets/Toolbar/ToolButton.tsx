import React from "react";
import { cn } from "@/lib/utils";

interface ToolButtonProps extends React.PropsWithChildren {
  label: string;
  onClick?: () => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  className?: string;
  disabled?: boolean;
  active?: boolean;
  /** Renders a small flyout indicator in the corner (grouped tool slot). */
  grouped?: boolean;
  /**
   * Renders a dot on the tool's top corner, marking state the tool is holding
   * that the rail can't otherwise show — a pose away from rest, say. It keeps
   * a white ring while the tool is active so it stays legible on the blue slab.
   */
  badge?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * Sleek rail tool button used by the floating Toolbar.
 * Inactive tools are quiet; the active tool gets a glowing accent slab.
 */
const ToolButton: React.FC<ToolButtonProps> = React.forwardRef(
  (
    {
      label,
      className = "",
      children,
      disabled = false,
      active = false,
      grouped = false,
      badge = false,
      ...rest
    }: ToolButtonProps,
    ref,
  ) => {
    return (
      <button
        {...rest}
        type="button"
        aria-label={label}
        aria-pressed={active}
        disabled={disabled}
        ref={ref}
        className={cn(
          "group relative flex h-8 w-8 items-center justify-center rounded-lg",
          "outline-none transition-[transform,background-color,color] duration-200 ease-out",
          "active:scale-[0.92] focus-visible:ring-2 focus-visible:ring-blue-500/60",
          {
            "cursor-not-allowed opacity-35": disabled,
            "cursor-pointer": !disabled,
            // Active: glowing accent slab (matches the reference highlight)
            "bg-blue-500 text-white dark:bg-blue-600": active,
            // Idle: muted, lifts on hover
            "text-neutral-500 hover:bg-black/[0.05] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/[0.07] dark:hover:text-white":
              !active && !disabled,
            "text-neutral-500 dark:text-neutral-400": !active && disabled,
          },
          className,
        )}
      >
        <span
          className={cn(
            "flex h-[22px] w-[22px] items-center justify-center transition-transform duration-200",
            !disabled && "group-active:scale-90",
          )}
        >
          {children}
        </span>

        {badge && (
          <span
            aria-hidden
            className={cn(
              "absolute right-[3px] top-[3px] h-[6px] w-[6px] rounded-full",
              "bg-blue-500 transition-colors duration-200 dark:bg-blue-400",
              active && "ring-[1.5px] ring-white",
            )}
          />
        )}

        {grouped && (
          <span
            aria-hidden
            className={cn(
              "absolute bottom-[2px] right-[2px] h-0 w-0 transition-colors duration-200",
              "border-b-[5px] border-l-[5px] border-b-transparent",
              active
                ? "border-l-white/70"
                : "border-l-neutral-400/70 dark:border-l-neutral-500/80",
            )}
          />
        )}
      </button>
    );
  },
);

ToolButton.displayName = "ToolButton";

export default ToolButton;
